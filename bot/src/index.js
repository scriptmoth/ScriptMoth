require('./env');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { loadModules } = require('./core/loader');
const { createJsonStore } = require('./core/store');
const { createRuntime } = require('./core/runtime');
const { artwork, availableArtwork } = require('./core/embed-assets');

const { DISCORD_TOKEN, MOTH_MODULES } = process.env;
if (!DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// MOTH_MODULES=dice,characters limits which modules load (handy for building a client's bot).
const only = MOTH_MODULES ? MOTH_MODULES.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
const modules = loadModules(undefined, { only: only && [...new Set(['moth', ...only])] });

const intents = new Set([GatewayIntentBits.Guilds]);
for (const mod of modules.values()) for (const intent of mod.intents ?? []) intents.add(intent);

const client = new Client({ intents: [...intents], partials: [Partials.Channel] });
const store = createJsonStore(process.env.MOTH_DATA_DIR || path.join(__dirname, '..', 'data'));
const runtime = createRuntime({ client, modules, store });
runtime.attach();

client.once(Events.ClientReady, (c) => {
  console.log(`moth.exe online as ${c.user.tag} with ${modules.size} modules: ${[...modules.keys()].join(', ')}`);
  const available = availableArtwork();
  const missingArtwork = [...artwork.keys()].filter((name) => !available.has(name));
  if (missingArtwork.length) console.warn(`Optional embed artwork missing: ${missingArtwork.join(', ')}`);
});

function shutdown() {
  runtime.stop();
  store.flush();
  client.destroy();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

client.login(DISCORD_TOKEN);
