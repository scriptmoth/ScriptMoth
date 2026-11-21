// Applies a server layout (roles, categories, channels, embeds, role panels, module settings).
//   npm run setup-server -- setup/moths-server.js [--guild <id>] [--dry-run]
//
// Re-runnable: existing roles/channels (matched by name) are kept as they are, and messages
// it posted before are edited in place. It never deletes anything.
// Stop the bot before running it, because it writes module settings to the bot's data folder.

require('../src/env');
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes, PermissionFlagsBits, ChannelType } = require('discord.js');
const ui = require('../src/core/ui');
const { CATEGORIES, loadModules, describeModules } = require('../src/core/loader');
const { createJsonStore } = require('../src/core/store');
const { buildPanel } = require('../src/modules/role-panels');

const args = process.argv.slice(2);
const layoutFile = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--guild');
const guildId = args.includes('--guild') ? args[args.indexOf('--guild') + 1] : process.env.GUILD_ID;
const dryRun = args.includes('--dry-run');
if (!layoutFile || !guildId) {
  console.error('Usage: npm run setup-server -- setup/<layout>.js [--guild <id>] [--dry-run]');
  process.exit(1);
}
const layout = require(path.resolve(layoutFile));
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const dataDir = process.env.MOTH_DATA_DIR || path.join(__dirname, '..', 'data');
const statePath = path.join(dataDir, `setup-${guildId}.json`);

const bits = (names = []) => String(names.reduce((acc, n) => acc | PermissionFlagsBits[n], 0n));
const READONLY_DENY = ['SendMessages', 'SendMessagesInThreads', 'CreatePublicThreads', 'CreatePrivateThreads'];

function log(action, what) {
  console.log(`${dryRun && action !== 'keep' ? '[dry] ' : ''}${action.padEnd(7)} ${what}`);
}

async function main() {
  const guild = await rest.get(Routes.guild(guildId));
  const me = await rest.get(Routes.user());
  console.log(`Setting up "${guild.name}" with ${path.basename(layoutFile)}\n`);

  // ── Roles ──────────────────────────────────────────────────────────────
  let roles = await rest.get(Routes.guildRoles(guildId));
  for (const spec of layout.roles.create) {
    const found = roles.find((r) => r.name === spec.name);
    if (found) {
      if (spec.color !== undefined && found.color !== spec.color) {
        log('color', `role ${spec.name}`);
        if (!dryRun) Object.assign(found, await rest.patch(Routes.guildRole(guildId, found.id), { body: { color: spec.color } }));
      } else log('keep', `role ${spec.name}`);
      continue;
    }
    log('create', `role ${spec.name}`);
    if (dryRun) continue;
    const role = await rest.post(Routes.guildRoles(guildId), {
      body: { name: spec.name, color: spec.color ?? 0, hoist: Boolean(spec.hoist), mentionable: Boolean(spec.mentionable), permissions: bits(spec.permissions) },
    });
    roles.push(role);
  }

  // Order: bot role, then the `above` roles, then everything else as it was. Roles made through
  // the API can all share position 1; ties sort by id, so that's the tiebreak, and sending the
  // whole list (bot role included) gives every role its own position.
  const botRole = roles.find((r) => r.managed && r.tags?.bot_id === me.id);
  const aboveNames = layout.roles.create.filter((r) => r.above).map((r) => r.name);
  if (botRole && !dryRun) {
    const byId = (a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1);
    const ordered = roles.filter((r) => r.id !== guildId && r.id !== botRole.id).sort((a, b) => b.position - a.position || byId(a, b));
    const above = aboveNames.map((n) => ordered.find((r) => r.name === n)).filter(Boolean);
    const rest_ = ordered.filter((r) => !aboveNames.includes(r.name));
    const finalOrder = [botRole, ...above, ...rest_];
    const positions = finalOrder.map((r, i) => ({ id: r.id, position: finalOrder.length - i }));
    const changed = positions.some((p) => roles.find((r) => r.id === p.id).position !== p.position);
    if (changed) {
      await rest.patch(Routes.guildRoles(guildId), { body: positions });
      log('order', `staff roles moved under ${botRole.name}`);
    }
    roles = await rest.get(Routes.guildRoles(guildId));
  }
  const roleByName = (name) => roles.find((r) => r.name === name);
  const staffIds = layout.roles.staff.map((n) => roleByName(n)?.id).filter(Boolean);

  // ── Channels ───────────────────────────────────────────────────────────
  const channels = await rest.get(Routes.guildChannels(guildId));
  const overwrites = (access) => {
    if (access === 'readonly') {
      return [
        { id: guildId, type: 0, deny: bits(READONLY_DENY), allow: '0' },
        ...staffIds.map((id) => ({ id, type: 0, allow: bits(['SendMessages', 'SendMessagesInThreads']), deny: '0' })),
      ];
    }
    if (access === 'staff') {
      return [{ id: guildId, type: 0, deny: bits(['ViewChannel']), allow: '0' }, ...staffIds.map((id) => ({ id, type: 0, allow: bits(['ViewChannel']), deny: '0' }))];
    }
    return [];
  };
  const typeOf = (t) => (t === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText);
  const channelIds = {};

  // A spec can list old names in `was`. A channel found under an old name is renamed (and its
  // topic refreshed) in place, so messages, pins, and history stay put.
  const names = (spec) => [spec.name, ...(spec.was ?? [])];
  async function renameIfNeeded(channel, spec, label) {
    const topicChanged = spec.topic && channel.type === ChannelType.GuildText && channel.topic !== spec.topic;
    if (channel.name === spec.name && !topicChanged) return log('keep', label);
    log(channel.name === spec.name ? 'topic' : 'rename', `${label}${channel.name === spec.name ? '' : `  (was ${channel.name})`}`);
    if (dryRun) return;
    const updated = await rest.patch(Routes.channel(channel.id), { body: { name: spec.name, ...(topicChanged ? { topic: spec.topic } : {}) } });
    Object.assign(channel, updated);
  }

  let position = 0;
  for (const cat of layout.categories) {
    let category = channels.find((c) => c.type === ChannelType.GuildCategory && names(cat).includes(c.name));
    if (category) await renameIfNeeded(category, cat, `category ${cat.name}`);
    else {
      log('create', `category ${cat.name}`);
      if (!dryRun) {
        category = await rest.post(Routes.guildChannels(guildId), {
          body: { name: cat.name, type: ChannelType.GuildCategory, position: position++, permission_overwrites: overwrites(cat.access) },
        });
      }
    }
    let childPos = 0;
    for (const spec of cat.channels) {
      const type = typeOf(spec.type);
      let channel = channels.find((c) => c.type === type && names(spec).includes(c.name) && (!category || c.parent_id === category.id));
      if (channel) await renameIfNeeded(channel, spec, `  #${spec.name}`);
      else {
        log('create', `  #${spec.name}`);
        if (!dryRun) {
          channel = await rest.post(Routes.guildChannels(guildId), {
            body: {
              name: spec.name,
              type,
              parent_id: category.id,
              position: childPos++,
              ...(spec.topic && type === ChannelType.GuildText ? { topic: spec.topic } : {}),
              permission_overwrites: overwrites(spec.access ?? cat.access),
            },
          });
        }
      }
      if (channel) for (const name of names(spec)) channelIds[name] = channel.id;
    }
  }
  if (dryRun) return console.log('\nDry run finished. Nothing was changed.');

  // ── Messages ───────────────────────────────────────────────────────────
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : { messages: {} };
  const ch = (name) => (channelIds[name] ? `<#${channelIds[name]}>` : `#${name}`);
  const helpers = { ui, ch, catalog: describeModules(loadModules()), categories: CATEGORIES };
  const toJSON = (payload) => ({
    ...payload,
    embeds: payload.embeds?.map((e) => (e.toJSON ? e.toJSON() : e)),
    allowed_mentions: { parse: [] },
  });

  // Embeds that show the divider get the image attached. On edits, `attachments` replaces the
  // message's old files with the fresh divider so re-runs never stack copies.
  const dividerData = fs.readFileSync(ui.DIVIDER.file);
  const request = (payload) => {
    const body = toJSON(payload);
    if (!ui.usesDivider(body)) return { body: { ...body, attachments: [] } };
    return { body: { ...body, attachments: [{ id: 0, filename: ui.DIVIDER.name }] }, files: [{ name: ui.DIVIDER.name, data: dividerData, contentType: 'image/png' }] };
  };

  async function upsert(key, channelId, payload) {
    const existing = state.messages[key];
    if (existing?.channelId === channelId) {
      try {
        await rest.patch(Routes.channelMessage(channelId, existing.messageId), request(payload));
        log('edit', `message ${key}`);
        return existing.messageId;
      } catch (error) {
        if (error.status !== 404) throw error;
      }
    }
    const message = await rest.post(Routes.channelMessages(channelId), request(payload));
    state.messages[key] = { channelId, messageId: message.id };
    log('post', `message ${key}`);
    return message.id;
  }

  const store = createJsonStore(dataDir);
  const panelStore = store.scope('role-panels');
  const panels = await panelStore.get(guildId, 'panels', {});

  for (const cat of layout.categories) {
    for (const spec of cat.channels) {
      const channelId = channelIds[spec.name];
      for (const key of spec.posts ?? []) {
        if (key === 'roles') {
          await upsert('roles:intro', channelId, { embeds: [ui.embed({ title: '🏷️ pick your roles', description: 'Click the buttons below. You can change them any time.', color: ui.COLORS.night })] });
          for (const panel of layout.rolePanels) {
            const found = panel.roles.map(([name, label, emoji]) => ({ role: roleByName(name), label, emoji }));
            const missing = found.filter((f) => !f.role).map((f, i) => panel.roles[i][0]);
            if (missing.length) console.warn(`  ! panel ${panel.key}: missing roles ${missing.join(', ')}`);
            const list = found.filter((f) => f.role).map((f) => ({ id: f.role.id, label: f.label, emoji: f.emoji }));
            const messageId = await upsert(`roles:${panel.key}`, channelId, buildPanel(ui, { panelId: panel.key, title: panel.title, description: panel.description, roles: list, exclusive: panel.exclusive }));
            panels[panel.key] = { roles: list.map((r) => r.id), exclusive: panel.exclusive, channelId, messageId };
          }
          continue;
        }
        const make = layout.messages[key];
        if (!make) throw new Error(`Layout has no message called "${key}"`);
        await upsert(key, channelId, make(helpers));
      }
    }
  }
  await panelStore.set(guildId, 'panels', panels);

  // ── Module settings ────────────────────────────────────────────────────
  const settingChannel = (setting) => {
    for (const cat of layout.categories) for (const spec of cat.channels) if (spec.setting === setting) return channelIds[spec.name];
    return null;
  };
  if (settingChannel('birthdays')) {
    await store.scope('character-birthdays').update(guildId, 'settings', (s) => ({ ...s, channelId: settingChannel('birthdays') }), {
      channelId: null,
      timeZone: process.env.MOTH_TIMEZONE || 'UTC',
      hour: 9,
    });
    log('config', 'birthday announcements channel');
  }
  if (settingChannel('spotlight')) {
    await store.scope('spotlight').update(guildId, 'settings', (s) => ({ ...s, channelId: settingChannel('spotlight') }), { channelId: null, days: 7 });
    log('config', 'spotlight channel');
  }

  store.flush();
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error.rawError ?? error);
  process.exit(1);
});
