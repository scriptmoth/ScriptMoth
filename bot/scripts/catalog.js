// Prints every module with its tier, category, and commands: `npm run catalog`.

const { CATEGORIES, TIERS, loadModules, describeModules } = require('../src/core/loader');

const entries = describeModules(loadModules()).sort(
  (a, b) => a.category.localeCompare(b.category) || TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.name.localeCompare(b.name),
);

for (const e of entries) console.log(`${e.tier.padEnd(6)} ${CATEGORIES[e.category].padEnd(22)} ${e.name.padEnd(28)} ${e.commands.join(', ')}`);
console.log(`\n${entries.length} modules`);
