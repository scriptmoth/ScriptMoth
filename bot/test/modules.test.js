// Loads every module, checks its manifest, and drives a few commands through the real
// runtime with fake interactions, so broken wiring shows up without a Discord connection.

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { existsSync, readFileSync } = require('node:fs');
const { Events } = require('discord.js');
const { CATEGORIES, loadModules, describeModules } = require('../src/core/loader');
const { createMemoryStore } = require('../src/core/store');
const { createRuntime } = require('../src/core/runtime');
const { discordTime, parseInstant } = require('../src/core/time');
const { attachmentNames } = require('../src/core/embed-assets');
const { showcaseEntries } = require('../src/core/showcase');
const ui = require('../src/core/ui');
const layout = require('../setup/moths-server');

const modules = loadModules();

test('every module loads with a valid manifest and command JSON', () => {
  assert.ok(modules.size >= 9);
  for (const mod of modules.values()) {
    for (const command of mod.commands ?? []) assert.doesNotThrow(() => command.data.toJSON(), `${mod.id}/${command.data.name}`);
  }
  const entries = describeModules(modules);
  assert.ok(entries.every((e) => e.description && e.tier));
});

function fakeInteraction({ command, sub, options = {}, guildId = 'g1', userId = 'u1', manage = true }) {
  const replies = [];
  const interaction = {
    guildId,
    channelId: 'c1',
    commandName: command,
    user: { id: userId, username: 'tester' },
    member: { displayName: 'Tester' },
    memberPermissions: { has: () => manage },
    replied: false,
    deferred: false,
    inGuild: () => true,
    isChatInputCommand: () => true,
    isAutocomplete: () => false,
    isMessageComponent: () => false,
    isModalSubmit: () => false,
    options: {
      getSubcommand: () => sub,
      getString: (n) => options[n] ?? null,
      getInteger: (n) => options[n] ?? null,
      getUser: (n) => options[n] ?? null,
      getChannel: (n) => options[n] ?? null,
    },
    async reply(payload) {
      interaction.replied = true;
      replies.push(payload);
      return { resource: { message: { id: 'm1' } } };
    },
    async followUp(payload) {
      replies.push(payload);
    },
    async update(payload) {
      replies.push(payload);
    },
    async showModal(modal) {
      replies.push({ modal });
    },
  };
  return { interaction, replies };
}

function setup() {
  const client = new EventEmitter();
  const store = createMemoryStore();
  const logs = [];
  const runtime = createRuntime({ client, modules, store, log: { log() {}, error: (...a) => logs.push(a) } });
  return { runtime, store, logs };
}

test('commands run through the runtime without errors', async () => {
  const { runtime, logs } = setup();
  const cases = [
    { command: 'moth', sub: 'features' },
    { command: 'moth', sub: 'try' },
    { command: 'moth', sub: 'about' },
    { command: 'moth', sub: 'info', options: { module: 'dice' } },
    { command: 'roll', options: { dice: '4d6kh3' } },
    { command: 'artprompt' },
    { command: 'rpprompt', sub: 'get', options: { genre: 'mystery' } },
    { command: 'encounter', sub: 'roll', options: { biome: 'coast', danger: 'calm' } },
    { command: 'character', sub: 'list' },
    { command: 'character', sub: 'create' },
    { command: 'charbday', sub: 'upcoming' },
    { command: 'charbday', sub: 'calendar', options: { month: 11 } },
    { command: 'spotlight', sub: 'current' },
    { command: 'secretsanta', sub: 'start', options: { budget: '$20' } },
    { command: 'secretsanta', sub: 'status' },
    { command: 'game', sub: 'rps', options: { hand: 'rock' } },
    { command: 'pet', sub: 'feed' },
    { command: 'adventure', sub: 'quest' },
    { command: 'adventure', sub: 'gather' },
    { command: 'trivia', sub: 'play' },
    { command: 'poll', options: { question: 'Where to?', choices: 'Meadow | Woods' } },
    { command: 'signup', options: { activity: 'Write together' } },
    { command: 'bookmarks', sub: 'list' },
    { command: 'warning', sub: 'history' },
    { command: 'feedback', sub: 'send', options: { message: 'I tried the trivia feature.' } },
    { command: 'rank', sub: 'opt-in' },
    { command: 'rank', sub: 'profile' },
    { command: 'event', sub: 'schedule', options: { activity: 'Game night', starts: discordTime(Date.now() + 600_000) } },
    { command: 'event', sub: 'upcoming' },
    { command: 'gallery', sub: 'browse' },
    { command: 'remind', sub: 'set', options: { note: 'Check the signup', minutes: 1 } },
  ];
  for (const c of cases) {
    const { interaction, replies } = fakeInteraction(c);
    await runtime.onInteraction(interaction);
    assert.equal(logs.length, 0, `${c.command} ${c.sub ?? ''} logged: ${logs.flat().join(' ')}`);
    assert.ok(replies.length, `${c.command} ${c.sub ?? ''} did not reply`);
    for (const reply of replies) {
      assertEmbedArtwork(reply);
    }
  }
});

function assertEmbedArtwork(payload) {
  const uploaded = new Set((payload.files ?? []).map(({ name }) => name));
  for (const embed of payload.embeds ?? []) {
    const data = embed.toJSON?.() ?? embed;
    assert.ok(data.image?.url || data.thumbnail?.url, data.title);
    for (const name of attachmentNames([data])) assert.ok(uploaded.has(name), name);
  }
}

test('server posts have ordered artwork and all local attachment references resolve', async () => {
  const entries = describeModules(modules);
  const helpers = { ui, ch: (channel) => `#${channel}`, catalog: entries, categories: CATEGORIES };
  for (const [key, buildPost] of Object.entries(layout.messages)) {
    const payload = await ui.withArtwork(buildPost(helpers));
    const embeds = payload.embeds.map((embed) => embed.toJSON());
    assertEmbedArtwork(payload);
    assert.ok(payload.files.every(({ attachment }) => Buffer.isBuffer(attachment) || existsSync(attachment)));
    assert.ok(embeds.length <= 10);
    assert.match(embeds[0].image.url, /^attachment:\/\/title-banner-/, key);
    assert.ok(embeds[1]?.title && embeds[1].thumbnail?.url && embeds[1].image?.url, key);
    assert.ok(!payload.files.some(({ name }) => name.endsWith('-banner.png')), key);
    const textLength = embeds.reduce((sum, { title, description, author, footer, fields = [] }) =>
      sum + [title, description, author?.name, footer?.text, ...fields.flatMap(({ name, value }) => [name, value])]
        .reduce((length, text) => length + (text?.length ?? 0), 0), 0);
    assert.ok(textLength <= 6000);
  }

  const rules = await ui.withArtwork(layout.messages.rules(helpers));
  const [header, content] = rules.embeds.map((embed) => embed.toJSON());
  assert.match(header.image.url, /^attachment:\/\/title-banner-[a-f0-9]{24}\.png$/);
  assert.match(content.title, /house rules/);
  assert.equal(content.thumbnail.url, ui.art('icon.rules'));
  assert.equal(content.image.url, ui.art('footer.scalloped'));
});

test('compact replies upload the divider and fall back when optional art is missing', async () => {
  const { runtime } = setup();
  const { interaction, replies } = fakeInteraction({ command: 'moth', sub: 'info', options: { module: 'dice' } });
  await runtime.onInteraction(interaction);
  const [reply] = replies;
  assert.equal(reply.embeds.length, 1);
  assert.equal(reply.embeds[0].data.image.url, 'attachment://lavender-sparkle-divider.png');
  assert.deepEqual(new Set(reply.files.map(({ name }) => name)), attachmentNames(reply.embeds));
  assert.ok(reply.files.every(({ attachment }) => existsSync(attachment)));

  const fallbackLayout = ui.embedLayout({
    title: 'Still readable', description: 'The optional file is unavailable.',
    thumbnail: ui.art('icon.unavailable'),
  }, { header: 'header.unavailable', footer: 'footer.unavailable' });
  const invalidArtwork = new Map([['retro-window-banner.png', Buffer.from('invalid PNG')]]);
  const { embeds: [fallback, extra] } = await ui.withArtwork({ embeds: fallbackLayout }, [], invalidArtwork);
  assert.equal(extra, undefined);
  assert.equal(fallback.toJSON().title, 'Still readable');
  assert.equal(fallback.toJSON().description, 'The optional file is unavailable.');
  assert.equal(fallback.toJSON().image.url, reply.embeds[0].data.image.url);
});

test('legacy content cards each get their own fallback on a multi-embed message', async () => {
  const payload = await ui.withArtwork({
    embeds: [
      { image: { url: ui.art('header.starfield') } },
      { title: 'Legacy card', fields: [{ name: 'Status', value: 'Open' }] },
      { title: 'Legacy error', color: ui.COLORS.danger, image: { url: 'attachment://missing.png' } },
    ],
    components: [],
  });
  const [banner, card, error] = payload.embeds.map((embed) => embed.toJSON?.() ?? embed);
  assert.equal(banner.thumbnail, undefined);
  assert.equal(card.thumbnail.url, ui.art('icon.services'));
  assert.equal(card.fields[0].value, 'Open');
  assert.equal(card.image.url, ui.art('divider.sparkle'));
  assert.equal(error.thumbnail.url, ui.art('status.closed') ?? ui.art('icon.services'));
  assert.equal(error.image.url, ui.art('divider.sparkle'));
  assert.deepEqual(payload.components, []);
  assertEmbedArtwork(payload);
});

test('screenshot cards keep a divider immediately after each image', async () => {
  const image = 'https://example.com/portfolio.png';
  const payload = await ui.withArtwork({ embeds: [
    ui.embed({ title: 'Portfolio', image, divider: 'divider.crescent', footer: 'Portfolio note' }),
    ui.ok('Saved.'),
    { title: 'Another screenshot', image: { url: image } },
  ] });
  assert.deepEqual(payload.embeds.map((embed) => embed.data.image.url),
    [image, ui.art('divider.crescent'), ui.art('divider.sparkle'), image, ui.art('divider.sparkle')]);
  for (const index of [1, 4]) assert.deepEqual(Object.keys(payload.embeds[index].toJSON()), ['image']);
  assert.equal(payload.embeds[0].data.footer.text, 'Portfolio note');
  assertEmbedArtwork(payload);
});

test('edits replace old divider dimensions and preserve unrelated attachments', async () => {
  const divider = 'lavender-sparkle-divider.png';
  const existing = [
    { id: '1', name: divider, width: 2172, height: 124 },
    { id: '2', name: 'member-file.png' },
  ];
  const payload = await ui.withArtwork({ embeds: [ui.ok('Saved.')] }, existing);
  assert.deepEqual(payload.attachments, [{ id: '2' }]);
  const png = readFileSync(payload.files.find(({ name }) => name === divider).attachment);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [960, 64]);
});

test('compact status cards have distinct icons and explicit headings', async () => {
  const payload = await ui.withArtwork({ embeds: [
    ui.ok('Changes saved.'), ui.warn('The event starts soon.'), ui.fail('That option is invalid.'), ui.empty('No results.'),
  ] });
  const cards = payload.embeds.map((embed) => embed.toJSON());
  assert.deepEqual(cards.map(({ title }) => title), ['Confirmed', 'Attention needed', 'Something went wrong', 'Nothing to show yet']);
  assert.deepEqual(cards.map(({ thumbnail }) => thumbnail.url), ['status.open', 'icon.announcements', 'status.closed', 'icon.faq'].map((key) =>
    ui.art(key) ?? ui.art('icon.services')));
  assertEmbedArtwork(payload);
});

test('feature menu edits drop an unused banner and retain the divider and other attachments', async () => {
  const { runtime } = setup();
  const initial = fakeInteraction({ command: 'moth', sub: 'features' });
  await runtime.onInteraction(initial.interaction);
  const [reply] = initial.replies;
  const banner = reply.embeds[0].data.image.url.slice('attachment://'.length);
  const attachments = reply.files.map(({ name }, index) => ({ name, id: String(index + 1) }));
  attachments.push({ name: 'member-file.txt', id: '50' }, { name: 'lilac-spark.webp', id: '51' });

  const { interaction, replies } = fakeInteraction({});
  Object.assign(interaction, {
    customId: 'moth:category',
    values: ['fun'],
    isChatInputCommand: () => false,
    isMessageComponent: () => true,
    message: { interactionMetadata: { user: interaction.user }, attachments: new Map(attachments.map((file) => [file.id, file])) },
  });
  await runtime.onInteraction(interaction);
  assert.equal(replies[0].embeds.length, 1);
  assert.equal(replies[0].components.length, 2);
  assert.deepEqual(replies[0].attachments, attachments.filter(({ name }) => name !== banner && name !== 'lilac-spark.webp').map(({ id }) => ({ id })));
  assert.deepEqual(replies[0].files, []);
});

test('the catalogue covers live modules, separates features, and points to registered demo commands', async () => {
  const entries = showcaseEntries(modules);
  assert.equal(entries.length, new Set(entries.map(({ id }) => id)).size);
  const commands = new Set(describeModules(modules).flatMap((entry) => entry.commands));
  const covered = new Set(entries.map(({ moduleId }) => moduleId));
  for (const id of modules.keys()) {
    if (id !== 'moth') assert.ok(covered.has(id), id);
  }
  for (const entry of entries) {
    assert.ok(entry.description && entry.use && entry.demo, entry.id);
    for (const [, command] of entry.demo.matchAll(/`(\/[^\x60]+)`/g)) assert.ok(commands.has(command), command);
  }
  const { runtime } = setup();
  for (const [id, title, label] of [
    ['gathering', 'Gathering', 'Try it'],
    ['crafting', 'Crafting', 'Try it'],
    ['community-qotd', 'Community question of the day', 'Sample · custom build'],
    ['character-qotd', 'In-character question of the day', 'Sample · custom build'],
  ]) {
    const { interaction, replies } = fakeInteraction({ command: 'moth', sub: 'info', options: { module: id } });
    await runtime.onInteraction(interaction);
    assert.equal(replies[0].embeds[0].data.title, title);
    assert.equal(replies[0].embeds[0].data.fields[1].name, label);
    assertEmbedArtwork(replies[0]);
  }
});

test('the welcome post directs visitors to the showcase before casual channels', () => {
  const channels = new Map(layout.categories.flatMap(({ channels }) => channels.map(({ key, name }) => [key, name])));
  const [start, showcase] = layout.categories;
  assert.equal(start.name, 'Start Here');
  assert.equal(showcase.name, 'Bot showcase');
  assert.deepEqual(showcase.channels.map(({ name }) => name), ['bot-features', 'try-the-bot', 'commissions']);
  assert.ok(['oc-chat', 'ooc', 'prompts'].every((name) => !channels.has(name)));
  const result = layout.messages.welcome({ ui, ch: (key) => {
    assert.ok(channels.has(key), key);
    return '#' + channels.get(key);
  } });
  const card = result.embeds.find((embed) => embed.data.title).toJSON();
  assert.deepEqual(card.fields.slice(0, 3).map(({ value }) => value.match(/#[\w-]+/)[0]),
    ['#bot-features', '#try-the-bot', '#commissions']);
});

test('spotlight sends the character artwork and formats the deferred confirmation', async () => {
  const { runtime, store } = setup();
  const module = modules.get('spotlight');
  const ctx = runtime.contextFor(module);
  const artUrl = 'https://example.com/character.png';
  await store.scope('characters').set('g1', 'characters', [{ id: 'oc', name: 'Luna', ownerId: 'u1', image: artUrl }]);
  await ctx.store.set('g1', 'settings', { channelId: 'c1', days: 7 });
  const sent = [];
  ctx.client.channels = { fetch: async () => ({ isTextBased: () => true, send: async (payload) => sent.push(payload) }) };
  const { interaction, replies } = fakeInteraction({ command: 'spotlight', sub: 'now' });
  interaction.deferReply = async () => { interaction.deferred = true; };
  interaction.fetchReply = async () => ({ attachments: new Map() });
  interaction.editReply = async (payload) => replies.push(payload);

  await runtime.onInteraction(interaction);

  assert.equal(sent[0].embeds[0].toJSON().image.url, artUrl);
  assert.equal(replies[0].embeds[0].toJSON().title, 'Confirmed');
  assertEmbedArtwork(sent[0]);
  assertEmbedArtwork(replies[0]);
});

test('game night matches normalized titles and overlapping time zones', async () => {
  const { runtime, logs } = setup();
  const u2 = { id: 'u2' };
  async function run(spec) {
    const { interaction, replies } = fakeInteraction(spec);
    await runtime.onInteraction(interaction);
    return replies[0];
  }
  await run({ command: 'gameclub', sub: 'add', options: { title: 'Stardew Valley' } });
  await run({ command: 'gameclub', sub: 'add', options: { title: 'A solo game' } });
  await run({ command: 'gameclub', sub: 'add', userId: u2.id, options: { title: 'stardew   valley' } });
  assert.match((await run({ command: 'gameclub', sub: 'pick', options: { with: u2 } })).content, /Stardew Valley/);
  assert.match((await run({ command: 'gameclub', sub: 'pick', options: { with: u2, skip: 'Stardew Valley' } })).content, /No eligible/);

  const today = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await run({ command: 'availability', sub: 'add', options: { start: `${today}T16:00-04:00`, end: `${today}T18:00-04:00` } });
  await run({ command: 'availability', sub: 'add', userId: u2.id, options: { start: `${today}T21:00Z`, end: `${today}T23:00Z` } });
  const reply = await run({ command: 'availability', sub: 'match', options: { with: u2 } });
  assert.ok(reply.content.includes(discordTime(Date.parse(`${today}T21:00Z`), 'f')));
  assert.ok(reply.content.includes(discordTime(Date.parse(`${today}T22:00Z`), 'f')));
  assert.ok(Number.isNaN(parseInstant('2026-02-30T19:00Z')));
  assert.deepEqual(logs, []);
});

test('one event check-in per attendee and no RSVP changes after the event starts', async () => {
  const { runtime, store, logs } = setup();
  const event = fakeInteraction({ command: 'event', sub: 'schedule', options: { activity: 'Game night', starts: discordTime(Date.now() + 600_000) } });
  await runtime.onInteraction(event.interaction);
  const scoped = store.scope('signups');
  const [key] = Object.keys(await scoped.all('g1'));
  function component(action, userId) {
    const { interaction, replies } = fakeInteraction({ userId, manage: false });
    interaction.isChatInputCommand = () => false;
    interaction.isMessageComponent = () => true;
    interaction.customId = `signups:${action}:${key.slice(7)}`;
    return { interaction, replies };
  }
  const join = component('join', 'u2');
  await runtime.onInteraction(join.interaction);
  const early = component('checkin', 'u2');
  await runtime.onInteraction(early.interaction);
  assert.match(early.replies[0].content, /opens when/);
  await scoped.update('g1', key, (saved) => ({ ...saved, startsAt: Date.now() - 1000 }));
  const checkins = [component('checkin', 'u2'), component('checkin', 'u2')];
  await Promise.all(checkins.map(({ interaction }) => runtime.onInteraction(interaction)));
  const leave = component('leave', 'u2');
  await runtime.onInteraction(leave.interaction);
  assert.match(leave.replies[0].content, /RSVPs have closed/);
  const record = await scoped.get('g1', key);
  assert.deepEqual(record.attended, ['u2']);
  assert.deepEqual(record.members, { u2: 'join' });
  assert.deepEqual(logs, []);
});

test('activity requires opt-in and double messages are rate-limited', async () => {
  const { runtime, store } = setup();
  const mod = modules.get('activity');
  const onMessage = mod.events[Events.MessageCreate];
  const ctx = runtime.contextFor(mod);
  const message = { guildId: 'g1', author: { id: 'u1', bot: false }, createdTimestamp: Date.now() };
  await onMessage(ctx, message);
  assert.equal(await store.scope('activity').get('g1', 'member:u1'), undefined);
  await runtime.onInteraction(fakeInteraction({ command: 'rank', sub: 'opt-in' }).interaction);
  await Promise.all([onMessage(ctx, message), onMessage(ctx, message)]);
  assert.equal((await store.scope('activity').get('g1', 'member:u1')).xp, 5);
  await runtime.onInteraction(fakeInteraction({ command: 'rank', sub: 'opt-out' }).interaction);
  await onMessage(ctx, { ...message, createdTimestamp: message.createdTimestamp + 60_000 });
  assert.equal(await store.scope('activity').get('g1', 'member:u1'), null);
});

test('pending gallery submissions stay private until a manager approves them', async () => {
  const { runtime, store } = setup();
  const submit = fakeInteraction({ command: 'gallery', sub: 'submit', manage: false, options: {
    title: 'Luna', credit: 'Moth', link: 'https://example.com/luna.png', tags: 'Moths, art',
  } });
  await runtime.onInteraction(submit.interaction);
  const [{ id }] = await store.scope('gallery').get('g1', 'entries');
  const early = fakeInteraction({ command: 'gallery', sub: 'browse', userId: 'u2', manage: false });
  await runtime.onInteraction(early.interaction);
  assert.equal(early.replies[0].embeds[0].data.fields, undefined);
  const denied = fakeInteraction({ command: 'gallery', sub: 'review', manage: false, options: { id, decision: 'approved' } });
  await runtime.onInteraction(denied.interaction);
  assert.match(denied.replies[0].content, /Manage Server/);
  await runtime.onInteraction(fakeInteraction({ command: 'gallery', sub: 'review', options: { id, decision: 'approved' } }).interaction);
  const visible = fakeInteraction({ command: 'gallery', sub: 'browse', userId: 'u2', manage: false, options: { tag: 'MOTHS' } });
  await runtime.onInteraction(visible.interaction);
  const [content] = visible.replies[0].embeds.map((embed) => embed.toJSON());
  assert.equal(content.fields[0].name, 'Luna');
  assert.equal(content.thumbnail.url, ui.art('icon.portfolio'));
  assert.equal(content.image.url, 'https://example.com/luna.png');
});

test('a due personal reminder is only sent once across overlapping checks', async () => {
  const { runtime, store } = setup();
  const mod = modules.get('reminders');
  const ctx = runtime.contextFor(mod);
  const sent = [];
  ctx.client.users = { fetch: async (id) => ({ send: async (payload) => { sent.push({ id, payload }); } }) };
  await runtime.onInteraction(fakeInteraction({ command: 'remind', sub: 'set', options: { note: 'Check the gallery', minutes: 1 } }).interaction);
  const scoped = store.scope('reminders');
  await scoped.update('g1', 'member:u1', (records) => records.map((r) => ({ ...r, at: Date.now() - 1000 })));
  await Promise.all([mod.tick.run(ctx), mod.tick.run(ctx)]);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].id, 'u1');
  assert.match(sent[0].payload.embeds[0].toJSON().description, /Check the gallery/);
  assertEmbedArtwork(sent[0].payload);
  assert.equal((await scoped.get('g1', 'member:u1'))[0].status, 'sent');
});

test('trivia awards points once when the same answer is submitted twice', async () => {
  const { runtime, store, logs } = setup();
  const first = fakeInteraction({ command: 'trivia', sub: 'play', manage: false });
  await runtime.onInteraction(first.interaction);
  const { round } = await store.scope('trivia').get('g1', 'player:u1');
  const button = first.replies[0].components[0].components[round.correct];
  const interaction = () => Object.assign(fakeInteraction({ manage: false }).interaction, {
    isChatInputCommand: () => false,
    isMessageComponent: () => true,
    customId: button.data.custom_id,
  });
  await Promise.all([runtime.onInteraction(interaction()), runtime.onInteraction(interaction())]);
  assert.equal((await store.scope('trivia').get('g1', 'player:u1')).score, 1);
  assert.deepEqual(logs, []);
});

test('message menu saves bookmarks into the invoking user’s private list', async () => {
  const { runtime, store, logs } = setup();
  const { interaction } = fakeInteraction({ command: 'Bookmark Message', manage: false });
  interaction.isChatInputCommand = () => false;
  interaction.isMessageContextMenuCommand = () => true;
  interaction.targetMessage = { id: 'm1', url: 'https://discord.com/channels/g1/c1/m1' };
  await runtime.onInteraction(interaction);
  assert.deepEqual(await store.scope('bookmarks').get('g1', 'u1'), [interaction.targetMessage]);
  assert.equal(await store.scope('bookmarks').get('g1', 'u2'), undefined);
  assert.deepEqual(logs, []);
});

test('disabled modules are blocked per server, core stays on', async () => {
  const { runtime } = setup();
  await runtime.setEnabled('g1', 'dice', false);
  await runtime.setEnabled('g1', 'moth', false);
  assert.equal(await runtime.isEnabled('g1', 'dice'), false);
  assert.equal(await runtime.isEnabled('g2', 'dice'), true);
  assert.equal(await runtime.isEnabled('g1', 'moth'), true);

  const { interaction, replies } = fakeInteraction({ command: 'roll', options: { dice: 'd20' } });
  await runtime.onInteraction(interaction);
  assert.match(replies[0].embeds[0].data.description, /turned off/);
});

test('cross-module api: birthdays see characters', async () => {
  const { runtime, store } = setup();
  await store.scope('characters').set('g1', 'characters', [{ id: 'c1', ownerId: 'u1', name: 'Mothra' }]);
  const { interaction, replies } = fakeInteraction({ command: 'charbday', sub: 'set', options: { character: 'c1', month: 2, day: 30 } });
  await runtime.onInteraction(interaction);
  assert.match(replies[0].embeds[0].data.description, /doesn't have a day 30/);

  const ok = fakeInteraction({ command: 'charbday', sub: 'set', options: { character: 'c1', month: 11, day: 18 } });
  await runtime.onInteraction(ok.interaction);
  assert.deepEqual(await store.scope('character-birthdays').get('g1', 'birthdays'), { c1: { month: 11, day: 18 } });
});
