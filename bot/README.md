# moth.exe

Scriptmoth's showcase Discord bot. Every feature is a **self-contained module** you can copy into a client's bot. It deploys on its own and shares no code with the website. People can run `/moth features` in Discord to see what their own bot could do.

## Run it

```sh
cd bot
npm install
cp .env.example .env      # fill in DISCORD_TOKEN, CLIENT_ID, GUILD_ID
npm run deploy            # register slash commands to GUILD_ID (add --global for everywhere)
npm start
npm test
npm run catalog           # prints every module and its commands
```

Credentials are read from `bot/.env`, falling back to the site's `../.env` (`DISCORD_BOT_TOKEN`, `DISCORD_BOT_CLIENT_ID`, `DISCORD_GUILD_ID`). Needs Node 22.13+.

### Server setup

`npm run setup-server -- setup/moths-server.js [--dry-run]` builds a server from a layout file: roles and their order, categories, channels with read-only or staff-only permissions, info embeds, role panels, and module settings (birthday and spotlight channels). It matches things by name, edits its own earlier posts instead of reposting, and never deletes anything. Stop the bot first, because it writes to `data/`. Copy `setup/moths-server.js` to make a layout for a client's server. Only the `Guilds` intent is used, so no privileged intents are needed yet.

## How it's put together

```
src/
  core/            the shared kit: copy this once into any bot
    loader.js      finds and validates modules, builds the catalog
    runtime.js     routes commands, buttons, modals, events, and scheduled jobs; per-server on/off
    store.js       per-module, per-server key/value storage (JSON files; swap for Mongo)
    ui.js          embeds, colors, tier labels, small helpers
  modules/
    <feature>/     one folder per feature: index.js manifest + any logic/data files
    _template/     copy this to start a new module
  index.js         starts the bot
  deploy.js        registers slash commands
  env.js           loads bot/.env, then the site's ../.env
  links.js         Scriptmoth website links used in replies and server posts
setup/
  moths-server.js  layout for Moth's server: roles, channels, and the welcome/rules/build-your-bot posts
scripts/           setup-server.js (applies a layout) and catalog.js
assets/            divider.png, attached under every embed
```

A module's `index.js` exports a manifest: `id`, `name`, `tier`, `category`, `description`, plus `commands`, `components`, `events`, `tick`, `api`, and `requires` as needed. The full contract is at the top of `src/core/loader.js`.

Rules that keep modules portable:

- **Storage goes only through `ctx.store`.** It's scoped to the module and the server (`get/set/update/delete/all`). Never write files or reach into another module's data.
- **customIds start with the module id** (`secret-santa:join`). The runtime routes `id:action:args` to `components.action(interaction, ctx, args)`.
- **Cross-module features use `api` + `requires`.** For example, `characters` exposes `api: (ctx) => ({ all, get, card })`, and `character-birthdays` declares `requires: ['characters']` and calls `ctx.use('characters')`.
- **Logic that doesn't need Discord lives in its own file** (`dice/roll.js`, `character-birthdays/dates.js`) so it's easy to test and reuse.

## Reusing a module in another bot

1. Copy `src/core/` and the module folder(s) into the other bot. Include anything listed in `requires`.
2. In its startup code:
   ```js
   const { loadModules } = require('./core/loader');
   const { createJsonStore } = require('./core/store');
   const { createRuntime } = require('./core/runtime');
   const modules = loadModules(path.join(__dirname, 'modules'));
   createRuntime({ client, modules, store: createJsonStore('./data') }).attach();
   ```
3. Add the modules' commands to that bot's deploy step: `[...modules.values()].flatMap(m => m.commands.map(c => c.data.toJSON()))`.
4. For a bot on MongoDB, pass a store with the same `scope(id) -> { get, set, update, delete, all, guilds }` shape instead of `createJsonStore`.

To build a client bot from this repo instead, set `MOTH_MODULES=dice,characters,...` and only those load.

## Tiers

| Tier | Meaning | Example |
| --- | --- | --- |
| basic | Included automatically | moth.exe core |
| L1 | Small feature | Dice, art prompts |
| L2 | Moderate feature | Character profiles, birthdays |
| L3 | Complex module | Secret Santa |
| L4 | Custom system | RP dashboard, battle system |

The planned features and their status are in [FEATURES.md](FEATURES.md).
