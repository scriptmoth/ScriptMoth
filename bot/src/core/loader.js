// moth core: module loader.
//
// A module is a folder in src/modules/ whose index.js exports a manifest:
//
//   {
//     id: 'dice',                     // unique, lowercase, used in customIds and storage
//     name: 'RP Dice',
//     tier: 'L1',                     // basic | L1 | L2 | L3 | L4
//     category: 'roleplay',           // see CATEGORIES
//     description: 'One line for the catalog.',
//     requires: ['characters'],       // optional: other module ids this one needs
//     intents: [GatewayIntentBits.X], // optional: extra gateway intents
//     commands: [{ data, execute, autocomplete? }],
//     components: { action: handler }, // buttons/selects/modals with customId `${id}:${action}:...`
//     events: { [Events.X]: handler },
//     tick: { everyMs, run },           // optional: scheduled job
//     setup(ctx),                        // optional: runs once on ready
//     api: (ctx) => ({ ... }),           // optional: functions other modules reach via ctx.use(id)
//     details: 'Longer text for /moth info',
//   }
//
// To reuse a module in another bot: copy its folder plus src/core/, and call loadModules().

const fs = require('node:fs');
const path = require('node:path');

const TIERS = ['basic', 'L1', 'L2', 'L3', 'L4'];
const CATEGORIES = {
  core: 'moth.exe core',
  fun: 'Fun & games',
  roleplay: 'Roleplay & gaming',
  characters: 'Characters & OCs',
  creators: 'Creators & artists',
  community: 'Community & events',
  moderation: 'Moderation & safety',
  utility: 'Utility',
  web: 'Website integration',
};
const ID_PATTERN = /^[a-z][a-z0-9-]{1,31}$/;

function validateModule(mod, source = mod?.id) {
  const problems = [];
  if (!mod || typeof mod !== 'object') return [`${source}: does not export a manifest object`];
  if (!ID_PATTERN.test(mod.id ?? '')) problems.push(`${source}: id must match ${ID_PATTERN}`);
  if (!mod.name) problems.push(`${source}: missing name`);
  if (!TIERS.includes(mod.tier)) problems.push(`${source}: tier must be one of ${TIERS.join(', ')}`);
  if (!CATEGORIES[mod.category]) problems.push(`${source}: unknown category "${mod.category}"`);
  if (!mod.description) problems.push(`${source}: missing description`);
  for (const command of mod.commands ?? []) {
    if (!command.data?.name || typeof command.execute !== 'function') {
      problems.push(`${source}: every command needs data (a SlashCommandBuilder) and execute()`);
    }
  }
  for (const [action, handler] of Object.entries(mod.components ?? {})) {
    if (typeof handler !== 'function') problems.push(`${source}: component "${action}" is not a function`);
  }
  if (mod.tick && (typeof mod.tick.run !== 'function' || !(mod.tick.everyMs > 0))) {
    problems.push(`${source}: tick needs everyMs > 0 and run()`);
  }
  return problems;
}

function loadModules(dir = path.join(__dirname, '..', 'modules'), { only } = {}) {
  const modules = new Map();
  const problems = [];

  const folders = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort();

  for (const folder of folders) {
    if (only && !only.includes(folder)) continue;
    const file = path.join(dir, folder, 'index.js');
    if (!fs.existsSync(file)) continue;
    const mod = require(file);
    const issues = validateModule(mod, folder);
    if (mod.id && mod.id !== folder) issues.push(`${folder}: id "${mod.id}" must match its folder name`);
    if (modules.has(mod.id)) issues.push(`${folder}: duplicate id "${mod.id}"`);
    if (issues.length) {
      problems.push(...issues);
      continue;
    }
    modules.set(mod.id, mod);
  }

  const commandNames = new Map();
  for (const mod of modules.values()) {
    for (const required of mod.requires ?? []) {
      if (!modules.has(required)) problems.push(`${mod.id}: requires module "${required}", which is not installed`);
    }
    for (const command of mod.commands ?? []) {
      const name = command.data.name;
      if (commandNames.has(name)) problems.push(`${mod.id}: /${name} is already registered by ${commandNames.get(name)}`);
      commandNames.set(name, mod.id);
    }
  }

  if (problems.length) {
    throw new Error(`Module problems:\n  - ${problems.join('\n  - ')}`);
  }
  return modules;
}

/** Plain-data summary of every module: used by /moth features, the #features post, and npm run catalog. */
function describeModules(modules) {
  return [...modules.values()].map((mod) => ({
    id: mod.id,
    name: mod.name,
    tier: mod.tier,
    category: mod.category,
    description: mod.description,
    requires: mod.requires ?? [],
    commands: (mod.commands ?? []).flatMap((c) => commandSignatures(c.data.toJSON())),
    scheduled: Boolean(mod.tick),
  }));
}

function commandSignatures(json) {
  const SUB = 1;
  const GROUP = 2;
  const subs = (json.options ?? []).filter((o) => o.type === SUB || o.type === GROUP);
  if (!subs.length) return [`/${json.name}`];
  return subs.flatMap((o) =>
    o.type === GROUP ? (o.options ?? []).map((s) => `/${json.name} ${o.name} ${s.name}`) : [`/${json.name} ${o.name}`],
  );
}

module.exports = { TIERS, CATEGORIES, validateModule, loadModules, describeModules };
