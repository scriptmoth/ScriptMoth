// Random encounter generator: biome tables, danger levels, loot, and server-added entries.

const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const TABLES = require('./tables');

const BIOMES = Object.keys(TABLES.biomes);
const DANGER = {
  calm: { label: '🌿 Calm', weights: { peaceful: 6, strange: 3, hostile: 1 }, lootChance: 0.3 },
  risky: { label: '⚠️ Risky', weights: { peaceful: 3, strange: 4, hostile: 4 }, lootChance: 0.45 },
  deadly: { label: '☠️ Deadly', weights: { peaceful: 1, strange: 3, hostile: 7 }, lootChance: 0.65 },
};
const MAX_CUSTOM = 100;

function weighted(weights, random) {
  const entries = Object.entries(weights);
  let n = random() * entries.reduce((sum, [, w]) => sum + w, 0);
  for (const [key, w] of entries) {
    if ((n -= w) < 0) return key;
  }
  return entries.at(-1)[0];
}

/** Pure encounter roll so it can be tested and reused. */
function rollEncounter({ biome, danger = 'risky', custom = [], random = Math.random }) {
  const table = TABLES.biomes[biome];
  const level = DANGER[danger];
  const kind = weighted(level.weights, random);
  const options = [...table[kind], ...custom.filter((c) => c.kind === kind).map((c) => c.text)];
  const text = options[Math.floor(random() * options.length)];
  const loot = random() < level.lootChance ? TABLES.loot[Math.floor(random() * TABLES.loot.length)] : null;
  return { biome, danger, kind, text, loot };
}

const KIND_LABEL = { peaceful: 'Peaceful', strange: 'Strange', hostile: 'Hostile' };
const KIND_COLOR = (ui) => ({ peaceful: ui.COLORS.success, strange: ui.COLORS.moth, hostile: ui.COLORS.danger });

module.exports = {
  id: 'encounter',
  name: 'Random Encounters',
  tier: 'L2',
  category: 'roleplay',
  description: 'Roll travel encounters by biome and danger level, with loot and custom server entries.',

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('encounter')
        .setDescription('Random encounters')
        .addSubcommand((s) =>
          s
            .setName('roll')
            .setDescription('Roll an encounter')
            .addStringOption((o) => o.setName('biome').setDescription('Where are you?').setRequired(true).addChoices(...BIOMES.map((b) => ({ name: b, value: b }))))
            .addStringOption((o) =>
              o.setName('danger').setDescription('How dangerous? (default risky)').addChoices(...Object.entries(DANGER).map(([value, d]) => ({ name: d.label, value }))),
            ),
        )
        .addSubcommand((s) =>
          s
            .setName('add')
            .setDescription('Add a custom encounter to this server (Manage Server)')
            .addStringOption((o) => o.setName('biome').setDescription('Biome').setRequired(true).addChoices(...BIOMES.map((b) => ({ name: b, value: b }))))
            .addStringOption((o) =>
              o.setName('kind').setDescription('Type').setRequired(true).addChoices(...Object.entries(KIND_LABEL).map(([value, name]) => ({ name, value }))),
            )
            .addStringOption((o) => o.setName('text').setDescription('What happens').setRequired(true).setMaxLength(300)),
        )
        .addSubcommand((s) =>
          s
            .setName('custom')
            .setDescription('List this server\'s custom encounters')
            .addStringOption((o) => o.setName('biome').setDescription('Biome').setRequired(true).addChoices(...BIOMES.map((b) => ({ name: b, value: b })))),
        ),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();
        const biome = interaction.options.getString('biome');
        const customKey = `custom:${biome}`;

        if (sub === 'roll') {
          const danger = interaction.options.getString('danger') ?? 'risky';
          const custom = await ctx.store.get(interaction.guildId, customKey, []);
          const result = rollEncounter({ biome, danger, custom });
          return interaction.reply({
            embeds: [
              ctx.ui.embed({
                title: `${TABLES.biomes[biome].emoji} ${KIND_LABEL[result.kind]} encounter`,
                description: result.text,
                color: KIND_COLOR(ctx.ui)[result.kind],
                fields: result.loot ? [{ name: '🎁 Found', value: result.loot }] : [],
                footer: `${biome} · ${DANGER[danger].label.replace(/^\S+ /, '')}`,
              }),
            ],
          });
        }

        if (sub === 'custom') {
          const custom = await ctx.store.get(interaction.guildId, customKey, []);
          const lines = custom.map((c, i) => `\`${i + 1}\` *${KIND_LABEL[c.kind]}*: ${c.text}`);
          return ctx.ui.ephemeral(interaction, {
            embeds: [ctx.ui.embed({ title: `Custom ${biome} encounters`, description: ctx.ui.truncate(lines.join('\n') || 'None yet.', 4000) })],
          });
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('You need **Manage Server** to add encounters.')] });
        }
        const entry = { kind: interaction.options.getString('kind'), text: interaction.options.getString('text'), by: interaction.user.id };
        const list = await ctx.store.get(interaction.guildId, customKey, []);
        if (list.length >= MAX_CUSTOM) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn(`That biome already has ${MAX_CUSTOM} custom encounters.`)] });
        await ctx.store.set(interaction.guildId, customKey, [...list, entry]);
        return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok(`Added a ${KIND_LABEL[entry.kind].toLowerCase()} encounter to **${biome}**.`)] });
      },
    },
  ],

  rollEncounter,
};
