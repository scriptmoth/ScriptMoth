// Applies a server layout (roles, categories, channels, embeds, role panels, module settings).
//   npm run setup-server -- setup/moths-server.js [--guild <id>] [--dry-run] [--refresh-design [--post <key>] | --sync-role-panels]
//
// Re-runnable: existing roles/channels (matched by name) are kept as they are, and messages
// it posted before are edited in place. It never deletes anything.
// Stop the bot before running it, because it writes module settings to the bot's data folder.

require('../src/env');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { REST, Routes, PermissionFlagsBits, ChannelType } = require('discord.js');
const ui = require('../src/core/ui');
const { CATEGORIES, loadModules, describeModules } = require('../src/core/loader');
const { createJsonStore } = require('../src/core/store');
const { buildPanel } = require('../src/modules/role-panels');

const args = process.argv.slice(2);
const layoutFile = args.find((arg, index) => !arg.startsWith('--') && !['--guild', '--post'].includes(args[index - 1]));
const guildId = args.includes('--guild') ? args[args.indexOf('--guild') + 1] : process.env.GUILD_ID;
const dryRun = args.includes('--dry-run');
const syncRolePanels = args.includes('--sync-role-panels');
const refreshDesign = args.includes('--refresh-design') || syncRolePanels;
const postIndex = args.indexOf('--post');
const selectedPost = syncRolePanels ? 'roles' : postIndex === -1 ? undefined : args[postIndex + 1];
if (!layoutFile || !guildId || (postIndex !== -1 && (syncRolePanels || !refreshDesign || !selectedPost || selectedPost.startsWith('--')))) {
  console.error('Usage: npm run setup-server -- setup/<layout>.js [--guild <id>] [--dry-run] [--refresh-design [--post <key>] | --sync-role-panels]');
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
  const panelRoleNames = new Set(layout.rolePanels?.flatMap(({ roles }) => roles.map(([name]) => name)));
  const panelBotRole = syncRolePanels && roles.find((role) => role.managed && role.tags?.bot_id === me.id);
  if (syncRolePanels && !panelBotRole) throw new Error('The bot needs a managed role in this server');
  for (const spec of layout.roles.create) {
    if (refreshDesign && (!syncRolePanels || !panelRoleNames.has(spec.name))) continue;
    const found = roles.find((r) => r.name === spec.name);
    if (found) {
      if (syncRolePanels) continue;
      if (spec.color !== undefined && found.color !== spec.color) {
        log('color', `role ${spec.name}`);
        if (!dryRun) Object.assign(found, await rest.patch(Routes.guildRole(guildId, found.id), { body: { color: spec.color } }));
      } else log('keep', `role ${spec.name}`);
      continue;
    }
    log('create', `role ${spec.name}`);
    if (syncRolePanels && (spec.permissions?.length || spec.hoist || spec.mentionable)) {
      throw new Error(`New self-assignable role "${spec.name}" must have no permissions, hoist, or public mentions`);
    }
    if (dryRun) {
      if (syncRolePanels) roles.push({ id: String(roles.length + 1), name: spec.name, permissions: '0', position: 0 });
      continue;
    }
    const role = await rest.post(Routes.guildRoles(guildId), {
      body: { name: spec.name, color: spec.color ?? 0, hoist: Boolean(spec.hoist), mentionable: Boolean(spec.mentionable), permissions: bits(spec.permissions) },
    });
    roles.push(role);
  }

  if (syncRolePanels) {
    const themedNames = new Set(layout.roles.create.filter((spec) => spec.nameColor).map((spec) => spec.name));
    const profileNames = new Set(layout.rolePanels.filter((panel) => panel.key !== 'colors').flatMap((panel) => panel.roles.map(([name]) => name)));
    const highestProfilePosition = Math.max(0, ...roles.filter((role) => profileNames.has(role.name)).map((role) => role.position));
    const move = roles.filter((role) => themedNames.has(role.name) && role.position <= highestProfilePosition);
    if (move.length) {
      log('order', 'name colors above profile and interest roles');
      if (!dryRun) {
        const positions = move.map((role, index) => ({
          id: role.id,
          position: highestProfilePosition + 1 + index,
        }));
        if (move.some((role) => role.position >= panelBotRole.position || role.managed || role.permissions !== '0')
          || positions.some(({ position }) => position >= panelBotRole.position)) {
          throw new Error('The bot cannot safely position the new name colors');
        }
        roles = await rest.patch(Routes.guildRoles(guildId), { body: positions });
        const profileCeiling = Math.max(0, ...roles.filter((role) => profileNames.has(role.name)).map((role) => role.position));
        if (roles.some((role) => themedNames.has(role.name) && role.position <= profileCeiling)) {
          throw new Error('Discord did not place the new name colors above the profile roles');
        }
        Object.assign(panelBotRole, roles.find((role) => role.id === panelBotRole.id));
      }
    }
  }

  // Order: bot role, then the `above` roles, then everything else as it was. Roles made through
  // the API can all share position 1; ties sort by id, so that's the tiebreak, and sending the
  // whole list (bot role included) gives every role its own position.
  const botRole = !refreshDesign && roles.find((r) => r.managed && r.tags?.bot_id === me.id);
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
  const channelIds = new Map();
  const refreshChannels = [];

  // A spec can list old names in `was`. A channel found under an old name is renamed (and its
  // topic refreshed) in place, so messages, pins, and history stay put.
  const names = (spec) => [spec.name, ...(spec.was ?? [])];
  function existingChannel(spec, type, parentId) {
    const candidates = channels.filter((c) => c.type === type && (parentId === undefined || c.parent_id === parentId));
    return names(spec).map((name) => candidates.find((c) => c.name === name)).find(Boolean);
  }

  async function renameIfNeeded(channel, spec, label) {
    const topicChanged = spec.topic && channel.type === ChannelType.GuildText && channel.topic !== spec.topic;
    if (channel.name === spec.name && !topicChanged) return log('keep', label);
    log(channel.name === spec.name ? 'topic' : 'rename', `${label}${channel.name === spec.name ? '' : `  (was ${channel.name})`}`);
    if (dryRun) return;
    const updated = await rest.patch(Routes.channel(channel.id), { body: { name: spec.name, ...(topicChanged ? { topic: spec.topic } : {}) } });
    Object.assign(channel, updated);
  }

  for (const [position, cat] of layout.categories.entries()) {
    let category = existingChannel(cat, ChannelType.GuildCategory);
    if (category) {
      if (refreshDesign) {
        if (!selectedPost) refreshChannels.push([category, cat, `category ${cat.name}`]);
      }
      else await renameIfNeeded(category, cat, `category ${cat.name}`);
    } else {
      if (selectedPost && !cat.channels.some((spec) => spec.posts?.includes(selectedPost))) continue;
      if (refreshDesign) throw new Error(`Missing existing category "${cat.name}"`);
      log('create', `category ${cat.name}`);
      if (!dryRun) {
        category = await rest.post(Routes.guildChannels(guildId), {
          body: { name: cat.name, type: ChannelType.GuildCategory, position, permission_overwrites: overwrites(cat.access) },
        });
      }
    }
    for (const [childPos, spec] of cat.channels.entries()) {
      const type = typeOf(spec.type);
      let channel = category && existingChannel(spec, type, category.id);
      if (channel) {
        if (refreshDesign) {
          if (!selectedPost) refreshChannels.push([channel, spec, `  #${spec.name}`]);
        }
        else await renameIfNeeded(channel, spec, `  #${spec.name}`);
      } else {
        if (selectedPost && !spec.posts?.includes(selectedPost)) continue;
        if (refreshDesign) throw new Error(`Missing existing channel "${spec.name}"`);
        log('create', `  #${spec.name}`);
        if (!dryRun) {
          channel = await rest.post(Routes.guildChannels(guildId), {
            body: {
              name: spec.name,
              type,
              parent_id: category.id,
              position: childPos,
              ...(spec.topic && type === ChannelType.GuildText ? { topic: spec.topic } : {}),
              permission_overwrites: overwrites(spec.access ?? cat.access),
            },
          });
        }
      }
      if (channel) {
        for (const name of names(spec)) channelIds.set(name, channel.id);
        if (spec.key) channelIds.set(spec.key, channel.id);
      }
    }
  }
  if (dryRun && !refreshDesign) return console.log('\nDry run finished. Nothing was changed.');

  // ── Messages ───────────────────────────────────────────────────────────
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : { messages: {} };
  const ch = (name) => (channelIds.has(name) ? `<#${channelIds.get(name)}>` : `#${name}`);
  const helpers = { ui, ch, catalog: describeModules(loadModules()), categories: CATEGORIES };

  // Discord resolves attachment URLs by filename. Keep every image used by the new embeds
  // in the edit request so a refresh can replace its artwork in place.
  const artFiles = new Map();
  for (const [name, file] of Object.entries(layout.artwork ?? {})) {
    if (fs.existsSync(file)) artFiles.set(name, file);
    else console.warn(`Optional layout artwork missing: ${name}`);
  }
  const request = async (payload) => {
    const { embeds, files: artwork = [], ...options } = await ui.withArtwork(payload, [], artFiles);
    const body = { ...options, embeds: embeds?.map((embed) => embed.toJSON?.() ?? embed), allowed_mentions: { parse: [] } };
    const files = artwork.map(({ name, attachment }) => {
      const contentType = path.extname(name) === '.webp' ? 'image/webp' : 'image/png';
      return { name, data: Buffer.isBuffer(attachment) ? attachment : fs.readFileSync(attachment), contentType };
    });
    return { body: { ...body, attachments: files.map(({ name }, id) => ({ id, filename: name })) }, files };
  };

  async function upsert(key, channelId, options) {
    const existing = state.messages[key];
    if (existing?.channelId === channelId) {
      try {
        await rest.patch(Routes.channelMessage(channelId, existing.messageId), options);
        log('edit', `message ${key}`);
        return existing.messageId;
      } catch (error) {
        if (error.status !== 404) throw error;
      }
    }
    if (refreshDesign) throw new Error(`Missing existing message "${key}"`);
    const message = await rest.post(Routes.channelMessages(channelId), options);
    state.messages[key] = { channelId, messageId: message.id };
    log('post', `message ${key}`);
    return message.id;
  }

  const store = createJsonStore(dataDir);
  const panelStore = store.scope('role-panels');
  const panels = await panelStore.get(guildId, 'panels', {});
  const posts = [];

  for (const cat of layout.categories) {
    for (const spec of cat.channels) {
      const channelId = channelIds.get(spec.name);
      for (const key of spec.posts ?? []) {
        if (selectedPost && key !== selectedPost) continue;
        if (key === 'roles') {
          if (!syncRolePanels) {
            const intro = layout.messages.roles?.(helpers) ?? { embeds: ui.embedLayout({ title: 'Pick your roles', description: 'Click the buttons below. You can change them any time.', color: ui.COLORS.night }, { header: 'header.lavenderWindow' }) };
            posts.push({ key: 'roles:intro', channelId, options: await request(intro) });
          }
          for (const panel of layout.rolePanels) {
            const found = panel.roles.map(([name, label, emoji]) => ({ name, role: roleByName(name), label, emoji }));
            const missing = found.filter((f) => !f.role).map((f) => f.name);
            if (missing.length) {
              const issue = `panel ${panel.key}: missing roles ${missing.join(', ')}`;
              if (refreshDesign) throw new Error(issue);
              console.warn(`  ! ${issue}`);
            }
            if (syncRolePanels) {
              const stored = panels[panel.key];
              for (const { role, name } of found) {
                if (role.managed || role.id === guildId || role.position >= panelBotRole.position
                  || (!stored?.roles.includes(role.id) && (role.permissions !== '0' || role.hoist || role.mentionable))) {
                  throw new Error(`Role "${name}" cannot be safely added to a self-assignable panel`);
                }
              }
            }
            const list = found.filter((f) => f.role).map((f) => ({ id: f.role.id, label: f.label, emoji: f.emoji }));
            const options = await request(buildPanel(ui, { ...panel, panelId: panel.key, roles: list }));
            posts.push({ key: `roles:${panel.key}`, channelId, options, panel: { key: panel.key, roles: list.map((r) => r.id), exclusive: panel.exclusive } });
          }
          continue;
        }
        const make = layout.messages[key];
        if (!make) throw new Error(`Layout has no message called "${key}"`);
        posts.push({ key, channelId, options: await request(make(helpers)) });
      }
    }
  }

  if (selectedPost && !posts.length) throw new Error(`Layout has no channel with post "${selectedPost}"`);
  if (syncRolePanels) {
    const changes = [];
    for (const post of posts) {
      const { key, channelId, options, panel } = post;
      const record = state.messages[key];
      const registered = panels[panel.key];
      if (registered && (record?.messageId !== registered.messageId || registered.channelId !== channelId
        || registered.exclusive !== panel.exclusive || !registered.roles.every((id) => panel.roles.includes(id)))) {
        throw new Error(`Changes to "${key}" must preserve its registered options and selection mode`);
      }
      if (record && record.channelId !== channelId) throw new Error(`Message "${key}" is in a different channel`);
      const buttonIds = (components) => components.flatMap((row) => row.components.map((button) => button.custom_id));
      const next = buttonIds(options.body.components);
      if (record) {
        const message = await rest.get(Routes.channelMessage(channelId, record.messageId));
        const current = buttonIds(message.components);
        if (message.author?.id !== me.id || !current.every((id) => next.includes(id))) {
          throw new Error(`Changes to "${key}" must preserve its existing buttons`);
        }
        if (registered?.roles.length === panel.roles.length && current.length === next.length) continue;
      }
      log(record ? 'extend' : 'post', `message ${key} · ${next.length} options`);
      changes.push({ ...post, record, next });
    }
    if (dryRun) return console.log('\nDry run finished. Nothing was changed.');
    for (const { key, channelId, options, panel, record, next } of changes) {
      const nonce = createHash('sha256').update(`${guildId}:${key}`).digest('hex').slice(0, 25);
      const message = record
        ? await rest.patch(Routes.channelMessage(channelId, record.messageId), options)
        : await rest.post(Routes.channelMessages(channelId), { ...options, body: { ...options.body, nonce, enforce_nonce: true } });
      const actual = message.components.flatMap((row) => row.components.map((button) => button.custom_id));
      if (actual.length !== next.length || !actual.every((id, index) => id === next[index])) {
        throw new Error(`Discord did not save all buttons for "${key}"`);
      }
      state.messages[key] = { channelId, messageId: message.id };
      fs.writeFileSync(`${statePath}.tmp`, JSON.stringify(state, null, 2));
      fs.renameSync(`${statePath}.tmp`, statePath);
      panels[panel.key] = { roles: panel.roles, exclusive: panel.exclusive, channelId, messageId: message.id };
      await panelStore.set(guildId, 'panels', panels);
      store.flush();
    }
    return console.log(`\nSynced ${changes.length} role panels.`);
  }
  if (refreshDesign) {
    for (const { key, channelId, panel } of posts) {
      const existing = state.messages[key];
      if (existing?.channelId !== channelId) throw new Error(`Missing setup record for "${key}" in the expected channel`);
      const message = await rest.get(Routes.channelMessage(channelId, existing.messageId));
      if (message.author?.id !== me.id) throw new Error(`Message "${key}" was posted by a different account`);
      if (panel) {
        const stored = panels[panel.key];
        if (stored?.messageId !== message.id || stored.channelId !== channelId || stored.exclusive !== panel.exclusive
          || stored.roles?.length !== panel.roles.length || !panel.roles.every((id) => stored.roles.includes(id))) {
          throw new Error(`Role panel "${panel.key}" differs from the registered panel`);
        }
      }
    }
    for (const channel of refreshChannels) await renameIfNeeded(...channel);
    if (dryRun) {
      for (const { key } of posts) log('edit', `message ${key}`);
      return console.log('\nDry run finished. Nothing was changed.');
    }
  }
  for (const { key, channelId, options, panel } of posts) {
    const messageId = await upsert(key, channelId, options);
    if (panel && !refreshDesign) panels[panel.key] = { roles: panel.roles, exclusive: panel.exclusive, channelId, messageId };
  }
  if (refreshDesign) return console.log('\nDesign refreshed.');
  await panelStore.set(guildId, 'panels', panels);

  // ── Module settings ────────────────────────────────────────────────────
  const settingChannel = (setting) => {
    for (const cat of layout.categories) for (const spec of cat.channels) if (spec.setting === setting || spec.settings?.includes(setting)) return channelIds.get(spec.name);
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
