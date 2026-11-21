const { escapeMarkdown, SlashCommandBuilder } = require('discord.js');
const { dayMs, discordTime, parseInstant } = require('../../core/time');

const mentions = { parse: [] };
const timeHelp = 'Use a Discord timestamp or a date with a timezone, such as `2026-12-04T19:00-05:00`.';
const maxGames = 30;
const maxSlots = 10;

const gameOption = (o) => o.setName('title').setDescription('Game title').setMaxLength(60).setRequired(true);
const memberOption = (o) => o.setName('member').setDescription('Whose games do you want to see?');
const teammate = (o, name, required = false) =>
  o.setName(name).setDescription('Another group member').setRequired(required);
const team = (i) => [...new Set([i.user.id, ...['with', 'also', 'and'].map((name) => i.options.getUser(name)?.id).filter(Boolean)])];
const keyOf = (name) => name.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

function intersection(a, b) {
  const overlaps = [];
  let x = 0;
  let y = 0;
  while (x < a.length && y < b.length) {
    const start = Math.max(a[x].start, b[y].start);
    const end = Math.min(a[x].end, b[y].end);
    if (start < end) overlaps.push({ start, end });
    if (a[x].end < b[y].end) x += 1;
    else y += 1;
  }
  return overlaps;
}

function mergeSlots(slots) {
  const merged = [];
  for (const slot of slots.sort((a, b) => a.start - b.start)) {
    const previous = merged.at(-1);
    if (previous && slot.start <= previous.end) previous.end = Math.max(previous.end, slot.end);
    else merged.push({ ...slot });
  }
  return merged;
}

const showTime = ({ start, end }) => `${discordTime(start, 'f')} to ${discordTime(end, 'f')}`;

async function library(i, ctx) {
  const action = i.options.getSubcommand();
  if (action === 'pick') {
    const lists = await Promise.all(team(i).map((id) => ctx.store.get(i.guildId, `games:${id}`, [])));
    const exclusions = new Set((i.options.getString('skip') ?? '').split('|').map(keyOf));
    const eligible = lists[0].filter(({ key }) => !exclusions.has(key) && lists.every((list) => list.some((game) => game.key === key)));
    if (!eligible.length) return ctx.ui.ephemeral(i, 'No eligible shared games. Everyone can add games with `/gameclub add`.');
    return ctx.ui.ephemeral(i, { content: `Try **${escapeMarkdown(ctx.ui.pick(eligible).title)}**. ${eligible.length} game(s) matched.`, allowedMentions: mentions });
  }
  if (action === 'list') {
    const member = i.options.getUser('member') ?? i.user;
    const games = await ctx.store.get(i.guildId, `games:${member.id}`, []);
    const lines = games.map(({ title }) => `• ${escapeMarkdown(title)}`);
    return ctx.ui.ephemeral(i, {
      embeds: [ctx.ui.embed({ title: 'Game library', tone: lines.length ? 'general' : 'empty', description: lines.join('\n') || 'This library is empty.' })],
      allowedMentions: mentions,
    });
  }
  const title = i.options.getString('title').trim();
  const key = keyOf(title);
  if (!key) return ctx.ui.ephemeral(i, 'Enter a game title.');
  let result;
  await ctx.store.update(i.guildId, `games:${i.user.id}`, (games) => {
    const exists = games.some((game) => game.key === key);
    if (action === 'remove') {
      result = exists ? 'Removed that game.' : 'That game is already absent.';
      return games.filter((game) => game.key !== key);
    }
    if (exists || games.length >= maxGames) {
      result = exists ? 'That game is already in your library.' : `Your library can hold up to ${maxGames} games.`;
      return games;
    }
    result = 'Added to your library. Run `/gameclub pick` to choose a game.';
    return [...games, { key, title }].sort((a, b) => a.title.localeCompare(b.title));
  }, []);
  return ctx.ui.ephemeral(i, result);
}

async function availability(i, ctx) {
  const action = i.options.getSubcommand();
  const now = Date.now();
  const slotKey = (id) => `slots:${id}`;
  const upcoming = (slots) => slots.filter(({ end }) => end > now);
  if (action === 'match') {
    const ids = team(i);
    if (ids.length < 2) return ctx.ui.ephemeral(i, 'Choose at least one other group member.');
    const lists = await Promise.all(ids.map(async (id) => upcoming(await ctx.store.get(i.guildId, slotKey(id), []))));
    const minimum = (i.options.getInteger('minutes') ?? 30) * 60_000;
    const results = lists.reduce(intersection)
      .map(({ start, end }) => ({ start: Math.max(start, now), end }))
      .filter(({ start, end }) => end - start >= minimum).slice(0, 5);
    return ctx.ui.ephemeral(i, results.length
      ? `**Shared availability**\n${results.map(showTime).join('\n')}`
      : 'No shared time blocks of that length. Everyone can add times with `/availability add`.');
  }
  if (action === 'list') {
    const slots = upcoming(await ctx.store.get(i.guildId, slotKey(i.user.id), []));
    return ctx.ui.ephemeral(i, slots.length ? slots.map(showTime).join('\n') : 'You have no upcoming availability.');
  }
  if (action === 'clear') {
    await ctx.store.update(i.guildId, slotKey(i.user.id), () => [], []);
    return ctx.ui.ephemeral(i, 'Your availability was cleared.');
  }
  const start = parseInstant(i.options.getString('start'));
  const end = parseInstant(i.options.getString('end'));
  if (!Number.isFinite(start) || !Number.isFinite(end)) return ctx.ui.ephemeral(i, timeHelp);
  if (start < now || end <= start || end > now + 90 * dayMs) {
    return ctx.ui.ephemeral(i, 'Choose a future time block ending in the next 90 days.');
  }
  let added = false;
  await ctx.store.update(i.guildId, slotKey(i.user.id), (slots) => {
    const future = upcoming(slots);
    const merged = mergeSlots([...future, { start, end }]);
    added = merged.length <= maxSlots;
    return added ? merged : future;
  }, []);
  return ctx.ui.ephemeral(i, added ? `Saved ${showTime({ start, end })}. Group members can match this slot if they select you.` : `Keep up to ${maxSlots} future slots at a time.`);
}

module.exports = {
  id: 'game-night',
  name: 'Game Library & Availability',
  tier: 'L3',
  category: 'community',
  description: 'Keep member game libraries, pick a game everyone owns, and find time blocks that work for the group.',
  commands: [
    {
      data: new SlashCommandBuilder().setName('gameclub').setDescription('Manage and match games your group owns')
        .addSubcommand((s) => s.setName('add').setDescription('Add an owned game to your shared library').addStringOption(gameOption))
        .addSubcommand((s) => s.setName('remove').setDescription('Remove a game from your library').addStringOption(gameOption))
        .addSubcommand((s) => s.setName('list').setDescription('Browse a game library').addUserOption(memberOption))
        .addSubcommand((s) => s.setName('pick').setDescription('Pick a game everyone selected owns')
          .addUserOption((o) => teammate(o, 'with')).addUserOption((o) => teammate(o, 'also')).addUserOption((o) => teammate(o, 'and'))
          .addStringOption((o) => o.setName('skip').setDescription('Exclude titles separated by | to reroll').setMaxLength(250))),
      execute: (i, ctx) => i.guildId ? library(i, ctx) : ctx.ui.ephemeral(i, 'Use the game library in a server.'),
    },
    {
      data: new SlashCommandBuilder().setName('availability').setDescription('Save your availability and find shared times')
        .addSubcommand((s) => s.setName('add').setDescription('Add a time block for group matching')
          .addStringOption((o) => o.setName('start').setDescription('Discord timestamp or ISO date with timezone').setMaxLength(32).setRequired(true))
          .addStringOption((o) => o.setName('end').setDescription('Discord timestamp or ISO date with timezone').setMaxLength(32).setRequired(true)))
        .addSubcommand((s) => s.setName('list').setDescription('See your upcoming time blocks'))
        .addSubcommand((s) => s.setName('clear').setDescription('Clear your saved availability'))
        .addSubcommand((s) => s.setName('match').setDescription('Find a block that works for everyone')
          .addUserOption((o) => teammate(o, 'with', true)).addUserOption((o) => teammate(o, 'also')).addUserOption((o) => teammate(o, 'and'))
          .addIntegerOption((o) => o.setName('minutes').setDescription('Minimum length (default 30 minutes)').setMinValue(15).setMaxValue(720))),
      execute: (i, ctx) => i.guildId ? availability(i, ctx) : ctx.ui.ephemeral(i, 'Use availability matching in a server.'),
    },
  ],
};
