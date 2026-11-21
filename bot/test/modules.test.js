// Loads every module, checks its manifest, and drives a few commands through the real
// runtime with fake interactions, so broken wiring shows up without a Discord connection.

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { loadModules, describeModules } = require('../src/core/loader');
const { createMemoryStore } = require('../src/core/store');
const { createRuntime } = require('../src/core/runtime');

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
  ];
  for (const c of cases) {
    const { interaction, replies } = fakeInteraction(c);
    await runtime.onInteraction(interaction);
    assert.equal(logs.length, 0, `${c.command} ${c.sub ?? ''} logged: ${logs.flat().join(' ')}`);
    assert.ok(replies.length, `${c.command} ${c.sub ?? ''} did not reply`);
  }
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
