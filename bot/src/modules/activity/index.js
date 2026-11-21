const { Events, GatewayIntentBits, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { dayMs } = require('../../core/time');

const cooldownMs = 60_000;
const maxDaily = 20;
const xpPerMessage = 5;
const xpPerLevel = 50;
const mentions = { parse: [] };
const key = (id) => `member:${id}`;
const day = (ms) => new Date(ms).toISOString().slice(0, 10);
const firstRecord = { xp: 0, last: 0, days: {}, awards: [] };
const milestones = [
  { xp: 5, name: 'First Flight' },
  { xp: 50, name: 'Lamplighter' },
  { xp: 150, name: 'Night Regular' },
  { xp: 300, name: 'Moonwing' },
];
const staffBadges = ['Community Helper', 'Event Host', 'Creative Spotlight'];

function credit(record, timestamp) {
  if (!record || timestamp - record.last < cooldownMs) return record;
  const today = day(timestamp);
  const count = record.days[today] ?? 0;
  if (count >= maxDaily) return record;
  const cutoff = day(timestamp - 13 * dayMs);
  const days = Object.fromEntries(Object.entries(record.days).filter(([date]) => date >= cutoff));
  return { ...record, last: timestamp, xp: record.xp + xpPerMessage, days: { ...days, [today]: count + 1 } };
}

function stats(record, now) {
  const cutoff = day(now - 6 * dayMs);
  const recent = Object.entries(record.days).reduce((sum, [date, count]) => date >= cutoff ? sum + count : sum, 0);
  const badges = [...milestones.filter((badge) => record.xp >= badge.xp).map(({ name }) => name), ...record.awards];
  return { level: Math.floor(record.xp / xpPerLevel) + 1, recent, badges };
}

async function messageCreate(ctx, message) {
  if (!message.guildId || message.author.bot || message.webhookId || message.system) return;
  const userKey = key(message.author.id);
  const record = await ctx.store.get(message.guildId, userKey);
  const timestamp = message.createdTimestamp;
  if (!record || credit(record, timestamp) === record) return;
  await ctx.store.update(message.guildId, userKey, (current) => credit(current, timestamp), null);
}

async function preferences(i, ctx, action) {
  const userKey = key(i.user.id);
  if (action === 'opt-out') {
    await ctx.store.update(i.guildId, userKey, () => null, null);
    return ctx.ui.ephemeral(i, 'You opted out. Your XP, badges, and activity counts were reset.');
  }
  await ctx.store.update(i.guildId, userKey, (record) => record ?? firstRecord, null);
  return ctx.ui.ephemeral(i, 'You opted in. Earn 5 XP for an eligible server message, up to once per minute and 20 times per UTC day. Your XP appears on the leaderboard. Use `/rank opt-out` to reset and stop.');
}

async function grant(i, ctx) {
  if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return ctx.ui.ephemeral(i, 'You need **Manage Server** to award badges.');
  const member = i.options.getUser('member');
  const badge = i.options.getString('badge');
  let result;
  await ctx.store.update(i.guildId, key(member.id), (record) => {
    if (!record || record.awards.includes(badge)) {
      result = record ? 'This member already has that badge.' : 'This member needs to opt in first.';
      return record;
    }
    result = `Awarded **${badge}**.`;
    return { ...record, awards: [...record.awards, badge] };
  }, null);
  return ctx.ui.ephemeral(i, result);
}

module.exports = {
  id: 'activity',
  name: 'Activity, XP & Badges',
  tier: 'L3',
  category: 'community',
  description: 'Opt in to earn XP from participating, climb a leaderboard, and collect milestone or staff-awarded badges.',
  intents: [GatewayIntentBits.GuildMessages],
  events: { [Events.MessageCreate]: messageCreate },
  commands: [{
    data: new SlashCommandBuilder().setName('rank').setDescription('Earn and view server XP and badges')
      .addSubcommand((s) => s.setName('opt-in').setDescription('Start earning XP from your server messages'))
      .addSubcommand((s) => s.setName('opt-out').setDescription('Stop tracking and reset your rank and badges'))
      .addSubcommand((s) => s.setName('profile').setDescription('See your XP, level, badges, and recent activity'))
      .addSubcommand((s) => s.setName('leaderboard').setDescription('See the 10 highest XP totals'))
      .addSubcommand((s) => s.setName('award').setDescription('Award a community badge (Manage Server)')
        .addUserOption((o) => o.setName('member').setDescription('Opted-in member').setRequired(true))
        .addStringOption((o) => o.setName('badge').setDescription('Badge to award').setRequired(true)
          .addChoices(...staffBadges.map((name) => ({ name, value: name }))))),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Use ranks in a server.');
      const action = i.options.getSubcommand();
      if (action === 'opt-in' || action === 'opt-out') return preferences(i, ctx, action);
      if (action === 'award') return grant(i, ctx);
      if (action === 'leaderboard') {
        const members = await ctx.store.all(i.guildId);
        const ranked = Object.entries(members).filter(([, r]) => r?.xp > 0)
          .sort(([id, a], [otherId, b]) => b.xp - a.xp || id.localeCompare(otherId)).slice(0, 10);
        const description = ranked.map(([id, r], index) => `${index + 1}. <@${id.slice(7)}> · ${r.xp} XP`).join('\n')
          || 'No scores yet. Try `/rank opt-in`.';
        return ctx.ui.ephemeral(i, { embeds: [ctx.ui.embed({ title: 'XP leaderboard', description, tone: ranked.length ? 'general' : 'empty' })], allowedMentions: mentions });
      }
      const record = await ctx.store.get(i.guildId, key(i.user.id));
      if (!record) return ctx.ui.ephemeral(i, 'Use `/rank opt-in` to start earning XP.');
      const { level, badges, recent } = stats(record, Date.now());
      return ctx.ui.ephemeral(i, { embeds: [ctx.ui.embed({
        title: 'Your server rank',
        description: [
          `**Level ${level}** · ${record.xp} XP`,
          `Counted messages in the last 7 UTC days: **${recent}**`,
          `Badges: ${badges.join(' · ') || 'None earned yet'}`,
        ].join('\n'),
      })] });
    },
  }],
};
