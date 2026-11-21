// moth.exe core module: the in-Discord feature showcase and per-server module switches.
// This is the only module that is always on. Every Scriptmoth bot ships with it.

const {
  ActionRowBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { CATEGORIES, TIERS, describeModules } = require('../../core/loader');
const { BUILD_A_BOT_URL, BOT_PACKAGES_URL, SITE_HOST } = require('../../links');

function catalog(ctx) {
  return describeModules(ctx.modules).sort(
    (a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.name.localeCompare(b.name),
  );
}

function categoriesInUse(entries) {
  return Object.keys(CATEGORIES).filter((key) => entries.some((e) => e.category === key));
}

async function featuresView(ctx, guildId, category) {
  const entries = catalog(ctx);
  const disabled = new Set(await ctx.runtime.disabledModules(guildId));
  const cats = categoriesInUse(entries);
  const active = cats.includes(category) ? category : null;
  const shown = active ? entries.filter((e) => e.category === active) : entries;

  const lines = shown.map((e) => {
    const off = disabled.has(e.id) ? ' · *off here*' : '';
    return `${ctx.ui.TIER_BADGES[e.tier]} **${e.name}**${off}\n${e.description}`;
  });

  const tierCounts = TIERS.map((t) => [t, entries.filter((e) => e.tier === t).length])
    .filter(([, n]) => n)
    .map(([t, n]) => `${ctx.ui.TIER_BADGES[t]} ×${n}`)
    .join('  ');

  const embed = ctx.ui.embed({
    title: active ? `moth.exe features · ${CATEGORIES[active]}` : 'moth.exe features',
    description: [
      active ? null : 'Each of these can go into a bot for **your** server. Pick a category, or try `/moth info` on one.',
      '',
      ctx.ui.truncate(lines.join('\n\n'), 3800),
    ]
      .filter((l) => l !== null)
      .join('\n'),
    fields: active ? [] : [{ name: 'Tiers', value: tierCounts }],
    footer: `Build your own at ${SITE_HOST}`,
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId('moth:category')
    .setPlaceholder('Browse a category')
    .addOptions(
      { label: 'All features', value: 'all', default: !active },
      ...cats.map((key) => ({
        label: CATEGORIES[key],
        value: key,
        description: `${entries.filter((e) => e.category === key).length} modules`,
        default: key === active,
      })),
    );

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

function infoEmbed(ctx, entry, enabled) {
  const mod = ctx.modules.get(entry.id);
  return ctx.ui.embed({
    title: `${entry.name}`,
    description: [entry.description, mod.details ? `\n${mod.details}` : ''].join(''),
    fields: [
      { name: 'Tier', value: ctx.ui.TIER_LABELS[entry.tier], inline: true },
      { name: 'Category', value: CATEGORIES[entry.category], inline: true },
      { name: 'In this server', value: enabled ? 'On' : 'Off', inline: true },
      { name: 'Commands', value: entry.commands.length ? entry.commands.map((c) => `\`${c}\``).join('\n') : 'No commands, works automatically' },
      ...(entry.requires.length ? [{ name: 'Needs', value: entry.requires.join(', ') }] : []),
      ...(entry.scheduled ? [{ name: 'Automatic', value: 'Runs on a schedule in the background.' }] : []),
    ],
    footer: `Module id: ${entry.id}`,
  });
}

function canManage(interaction) {
  return interaction.inGuild() && interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
}

function moduleOption(o, description) {
  return o.setName('module').setDescription(description).setRequired(true).setAutocomplete(true);
}

module.exports = {
  id: 'moth',
  name: 'moth.exe Core',
  tier: 'basic',
  category: 'core',
  description: 'Feature showcase, module info, and per-server on/off switches.',

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('moth')
        .setDescription('moth.exe: see what this bot can do')
        .addSubcommand((s) => s.setName('features').setDescription('Browse every feature module'))
        .addSubcommand((s) => s.setName('info').setDescription('Details on one feature').addStringOption((o) => moduleOption(o, 'Which feature')))
        .addSubcommand((s) => s.setName('enable').setDescription('Turn a feature on in this server (Manage Server)').addStringOption((o) => moduleOption(o, 'Which feature')))
        .addSubcommand((s) => s.setName('disable').setDescription('Turn a feature off in this server (Manage Server)').addStringOption((o) => moduleOption(o, 'Which feature')))
        .addSubcommand((s) => s.setName('about').setDescription('About moth.exe and Scriptmoth')),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'features') {
          return interaction.reply(await featuresView(ctx, interaction.guildId, null));
        }

        if (sub === 'about') {
          return interaction.reply({
            embeds: [
              ctx.ui.embed({
                title: 'moth.exe',
                description: [
                  `Handmade by **Scriptmoth**. This copy runs **${ctx.modules.size} modules**, and any of them can go into your own bot.`,
                  '',
                  '`/moth features` to look around',
                  `📦 Bot packages: ${BOT_PACKAGES_URL}`,
                  `🛠️ Build your own: ${BUILD_A_BOT_URL}`,
                ].join('\n'),
                color: ctx.ui.COLORS.night,
              }),
            ],
          });
        }

        const id = interaction.options.getString('module');
        const entry = catalog(ctx).find((e) => e.id === id);
        if (!entry) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail(`No feature called \`${id}\`.`)] });

        if (sub === 'info') {
          const enabled = await ctx.runtime.isEnabled(interaction.guildId, id);
          return interaction.reply({ embeds: [infoEmbed(ctx, entry, enabled)] });
        }

        if (!canManage(interaction)) {
          return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('You need **Manage Server** to switch features.')] });
        }
        if (id === 'moth') return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('The core module is always on.')] });

        await ctx.runtime.setEnabled(interaction.guildId, id, sub === 'enable');
        return ctx.ui.ephemeral(interaction, {
          embeds: [ctx.ui.ok(`**${entry.name}** is now **${sub === 'enable' ? 'on' : 'off'}** in this server.`)],
        });
      },

      async autocomplete(interaction, ctx) {
        const query = interaction.options.getFocused().toLowerCase();
        const choices = catalog(ctx)
          .filter((e) => e.id.includes(query) || e.name.toLowerCase().includes(query))
          .slice(0, 25)
          .map((e) => ({ name: `${e.name} (${e.tier})`, value: e.id }));
        return interaction.respond(choices);
      },
    },
  ],

  components: {
    async category(interaction, ctx) {
      const value = interaction.values[0];
      const view = await featuresView(ctx, interaction.guildId, value === 'all' ? null : value);
      // Only the person who opened the menu changes the shared message; others get their own copy.
      if (interaction.message.interactionMetadata?.user?.id === interaction.user.id) return interaction.update(view);
      return ctx.ui.ephemeral(interaction, view);
    },
  },
};
