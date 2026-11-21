// Scriptmoth website links used in bot replies and server layouts.
// The bot deploys on its own, so it keeps its own copy of these instead of importing from the site.
// If a website route or builder type changes, update it here too: `type=discord-bot` matches
// the project type in the site's src/data/builder.ts.

const SITE_URL = (process.env.SCRIPTMOTH_SITE_URL || 'https://scriptmoth.com').replace(/\/$/, '');

module.exports = {
  SITE_URL,
  SITE_HOST: SITE_URL.replace(/^https?:\/\//, ''),
  BUILD_A_BOT_URL: `${SITE_URL}/contact?type=discord-bot`,
  BOT_PACKAGES_URL: `${SITE_URL}/products#discord-packages`,
};
