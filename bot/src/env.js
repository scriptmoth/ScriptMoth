// Loads bot/.env, then falls back to the Scriptmoth site's .env (one level up), and maps the
// site's DISCORD_BOT_* names onto the names the bot uses. Values already set always win.

const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const aliases = {
  DISCORD_TOKEN: 'DISCORD_BOT_TOKEN',
  CLIENT_ID: 'DISCORD_BOT_CLIENT_ID',
  GUILD_ID: 'DISCORD_GUILD_ID',
};
for (const [name, alias] of Object.entries(aliases)) {
  if (!process.env[name] && process.env[alias]) process.env[name] = process.env[alias];
}
if (!process.env.SCRIPTMOTH_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://')) {
  process.env.SCRIPTMOTH_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
}
