const { escapeMarkdown, SlashCommandBuilder } = require('discord.js');
const { randomUUID } = require('node:crypto');
const { dayMs, discordTime } = require('../../core/time');

const mentions = { parse: [] };
const repeatMs = { daily: dayMs, weekly: 7 * dayMs };
const userKey = (id) => `member:${id}`;
const maxPending = 10;
const maxRecords = 20;

async function create(i, ctx) {
  const text = i.options.getString('note').trim();
  if (!text) return ctx.ui.ephemeral(i, 'Add a note for the reminder.');
  const at = Date.now() + i.options.getInteger('minutes') * 60_000;
  const repeat = i.options.getString('repeat');
  const id = randomUUID();
  let saved;
  await ctx.store.update(i.guildId, userKey(i.user.id), (records) => {
    const open = records.filter((r) => r.status === 'pending' || r.status === 'delivering');
    saved = open.length < maxPending;
    if (!saved) return records;
    const history = records.filter((r) => r.status !== 'pending' && r.status !== 'delivering');
    return [{ id, at, text, repeat, status: 'pending' }, ...open, ...history].slice(0, maxRecords);
  }, []);
  return ctx.ui.ephemeral(i, saved
    ? `I’ll DM you ${discordTime(at)}${repeat ? ` and repeat ${repeat}` : ''}. Make sure DMs from this server are allowed. ID \`${id}\``
    : `You can have up to ${maxPending} open reminders. Use \`/remind list\` to review them.`);
}

async function cancel(i, ctx) {
  const id = i.options.getString('id').trim();
  let removed = false;
  await ctx.store.update(i.guildId, userKey(i.user.id), (records) => records.filter((r) => {
    if (r.id !== id || r.status === 'delivering') return true;
    removed = true;
    return false;
  }), []);
  return ctx.ui.ephemeral(i, removed ? 'Reminder removed.' : 'No matching reminder you can remove right now.');
}

async function show(i, ctx) {
  const records = await ctx.store.get(i.guildId, userKey(i.user.id), []);
  const page = i.options.getInteger('page') ?? 1;
  const ordered = [...records].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || a.at - b.at);
  const fields = ordered.slice((page - 1) * 5, page * 5).map((r) => ({
    name: `${r.status}${r.repeat ? ` · ${r.repeat}` : ''} · ${r.id}`,
    value: `${discordTime(r.at)} · ${escapeMarkdown(r.text)}`,
  }));
  return ctx.ui.ephemeral(i, {
    embeds: [ctx.ui.embed({
      title: 'Your reminders',
      description: fields.length ? undefined : 'No reminders on this page.',
      tone: fields.length ? 'general' : 'empty',
      fields,
      footer: `Page ${page} · ${records.length} reminders`,
    })],
    allowedMentions: mentions,
  });
}

async function deliver(ctx, guildId, key, id, now) {
  let claimed;
  await ctx.store.update(guildId, key, (records) => records.map((r) => {
    if (r.id !== id || r.status !== 'pending' || r.at > now) return r;
    claimed = { ...r, status: 'delivering', claimedAt: now };
    return claimed;
  }), []);
  if (!claimed) return;
  let status = 'sent';
  try {
    const user = await ctx.client.users.fetch(key.slice(7));
    await user.send(await ctx.ui.withArtwork({
      embeds: [ctx.ui.embed({
        title: 'moth.exe reminder',
        description: escapeMarkdown(claimed.text),
        thumbnail: ctx.ui.art('status.waitlist'),
      })],
      allowedMentions: mentions,
    }));
  } catch (error) {
    status = 'failed';
    if (error.code !== 50007) ctx.log.error('Could not deliver reminder.', error.code ?? error.message);
  }
  await ctx.store.update(guildId, key, (records) => records.map((r) => {
    if (r.id !== id) return r;
    const interval = repeatMs[r.repeat];
    if (!interval || status === 'failed') return { ...r, status };
    const elapsed = Date.now() - r.at;
    return { ...r, status: 'pending', at: r.at + (Math.floor(elapsed / interval) + 1) * interval };
  }), []);
}

module.exports = {
  id: 'reminders',
  name: 'Personal Reminders',
  tier: 'L2',
  category: 'utility',
  description: 'Schedule private, one-time or recurring reminders from Discord.',
  commands: [{
    data: new SlashCommandBuilder().setName('remind').setDescription('Schedule a reminder in your DMs')
      .addSubcommand((s) => s.setName('set').setDescription('Set a personal reminder')
        .addStringOption((o) => o.setName('note').setDescription('What should the bot remind you about?').setMaxLength(240).setRequired(true))
        .addIntegerOption((o) => o.setName('minutes').setDescription('Minutes until the reminder (1–43200)').setMinValue(1).setMaxValue(43_200).setRequired(true))
        .addStringOption((o) => o.setName('repeat').setDescription('Repeat after the first reminder')
          .addChoices({ name: 'Daily', value: 'daily' }, { name: 'Weekly', value: 'weekly' })))
      .addSubcommand((s) => s.setName('list').setDescription('Show your reminders and delivery status')
        .addIntegerOption((o) => o.setName('page').setDescription('Page number').setMinValue(1).setMaxValue(4)))
      .addSubcommand((s) => s.setName('cancel').setDescription('Cancel or remove a reminder')
        .addStringOption((o) => o.setName('id').setDescription('Reminder ID from /remind list').setMaxLength(36).setRequired(true))),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Set reminders from a server.');
      const action = i.options.getSubcommand();
      if (action === 'set') return create(i, ctx);
      if (action === 'cancel') return cancel(i, ctx);
      return show(i, ctx);
    },
  }],
  tick: {
    everyMs: 30_000,
    async run(ctx) {
      const now = Date.now();
      for (const guildId of await ctx.store.guilds()) {
        if (!(await ctx.runtime.isEnabled(guildId, 'reminders'))) continue;
        for (const [key, records] of Object.entries(await ctx.store.all(guildId))) {
          if (records.some((r) => r.status === 'delivering' && now - r.claimedAt > 10 * 60_000)) {
            // A previous process may have sent it before stopping. Leave its status unknown.
            await ctx.store.update(guildId, key, (current) => current.map((r) =>
              r.status === 'delivering' && now - r.claimedAt > 10 * 60_000 ? { ...r, status: 'delivery unknown' } : r), []);
          }
          for (const r of records) {
            if (r.status === 'pending' && r.at <= now) await deliver(ctx, guildId, key, r.id, now);
          }
        }
      }
    },
  },
};
