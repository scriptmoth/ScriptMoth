// Registers slash commands with Discord. Run after adding or changing commands:
//   npm run deploy            -> to GUILD_ID (instant, for testing)
//   npm run deploy -- --global -> everywhere the bot is installed (can take up to an hour)

require('./env');
const { REST, Routes } = require('discord.js');
const { loadModules } = require('./core/loader');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID, MOTH_MODULES } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env.');
  process.exit(1);
}

const global = process.argv.includes('--global');
if (!global && !GUILD_ID) {
  console.error('Set GUILD_ID for a test server, or pass --global.');
  process.exit(1);
}

const only = MOTH_MODULES ? ['moth', ...MOTH_MODULES.split(',').map((s) => s.trim())] : undefined;
const modules = loadModules(undefined, { only });
const body = [...modules.values()].flatMap((m) => (m.commands ?? []).map((c) => c.data.toJSON()));

const rest = new REST().setToken(DISCORD_TOKEN);
const route = global ? Routes.applicationCommands(CLIENT_ID) : Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID);

rest
  .put(route, { body })
  .then((result) => console.log(`Registered ${result.length} commands ${global ? 'globally' : `to guild ${GUILD_ID}`}.`))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
