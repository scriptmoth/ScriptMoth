// moth.exe core module: the in-Discord feature showcase and per-server module switches.
// This is the only module that is always on. Every Scriptmoth bot ships with it.

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');
const { CATEGORIES, TIERS, describeModules } = require('../../core/loader');
const { BUILD_A_BOT_URL, BOT_PACKAGES_URL, FEATURE_CATALOGUE_URL, PORTFOLIO_URL } = require('../../links');
const { showcaseChannel, showcaseEntries, catalogueView } = require('../../core/showcase');

const quickStart = ['trivia', 'polls', 'dice', 'gathering', 'crafting', 'art-prompt'];
const craftingReadout = [
  { tone: 'ready', label: 'READY', detail: 'Moon lantern → crafted' },
  { tone: 'waiting', label: 'NEEDS MATERIALS', detail: 'Moonleaf missing → try again' },
];

function craftingExample(ui, ansi = false) {
  return ui.embed({
    title: '✦ Example crafting results',
    description: 'Sample outcomes for the **Moon lantern** recipe.\n\n' + ui.statusBlock(craftingReadout, ansi),
    color: ui.COLORS.night,
    thumbnail: ui.art('icon.services'),
  });
}

function readoutButton(ansi, update = false) {
  return new ActionRowBuilder().addComponents(new ButtonBuilder()
    .setCustomId(`moth:crafting:${ansi ? 'plain' : 'ansi'}:${update ? 'update' : 'open'}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(ansi ? 'View plain-text example' : 'View ANSI example on desktop'));
}

function rolePanelExample(ui) {
  return {
    title: '✦ Example role panel settings',
    description: 'Sample entry for the `rolePanels` array in `setup/moths-server.js`. Role names must already exist on the server.\n\n' +
      ui.codeBlock([
        '{',
        '  "key": "pronouns",',
        '  "title": "Pronouns",',
        '  "exclusive": false,',
        '  "roles": [',
        '    ["◌ she/her ⋆˚", "she/her"],',
        '    ["◌ they/them ⋆˚", "they/them"]',
        '  ]',
        '}',
      ], 'json') + '\n\n↳ `exclusive: false` lets a member pick more than one role.\n\n◇ *Add other pronouns to the `roles` list as needed.*',
    color: ui.COLORS.night,
    thumbnail: ui.art('icon.services'),
  };
}

function catalog(ctx) {
  return describeModules(ctx.modules).sort(
    (a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.name.localeCompare(b.name),
  );
}

async function featureCard(ctx, guildId, entry) {
  const { ui } = ctx;
  const enabled = entry.moduleId && await ctx.runtime.isEnabled(guildId, entry.moduleId);
  const demo = !entry.moduleId ? { name: 'Sample · custom build', value: entry.demo }
    : enabled ? { name: '🕹️ Try it', value: entry.demo }
      : { name: 'Demo availability', value: 'This feature is turned off in this server. Someone with **Manage Server** can enable its module with `/moth enable`.' };
  const crafting = enabled && entry.id === 'crafting';
  const embeds = ui.guide({
    title: entry.name,
    description: entry.description,
    fields: [demo, { name: '✦ Use it for', value: entry.use }],
    tone: 'bot',
  }, enabled && entry.id === 'role-panels' ? [rolePanelExample(ui)] : [], { header: 'header.lavenderWindow' });
  if (crafting) embeds.push(craftingExample(ui));
  return crafting ? { embeds, components: [readoutButton(false)] } : { embeds };
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
    thumbnail: ctx.ui.art('icon.botFeatures'),
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
        .setDescription('Browse Scriptmoth’s custom bot showcase and try demos')
        .addSubcommand((s) => s.setName('features').setDescription('Browse bot features by purpose'))
        .addSubcommand((s) => s.setName('try').setDescription('Open a short list of bot demos'))
        .addSubcommand((s) => s.setName('info').setDescription('Details on one feature').addStringOption((o) => moduleOption(o, 'Which feature')))
        .addSubcommand((s) => s.setName('enable').setDescription('Turn a feature on in this server (Manage Server)').addStringOption((o) => moduleOption(o, 'Which feature')))
        .addSubcommand((s) => s.setName('disable').setDescription('Turn a feature off in this server (Manage Server)').addStringOption((o) => moduleOption(o, 'Which feature')))
        .addSubcommand((s) => s.setName('about').setDescription('See Scriptmoth’s portfolio and ask about a custom bot')),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'features') {
          return interaction.reply(catalogueView(ctx.ui, showcaseEntries(ctx.modules)));
        }

        if (sub === 'try') {
          const disabled = new Set(await ctx.runtime.disabledModules(interaction.guildId));
          const entries = showcaseEntries(ctx.modules, interaction.guildId);
          const fields = quickStart
            .map((id) => entries.find((entry) => entry.id === id))
            .filter((entry) => entry && !disabled.has(entry.moduleId))
            .map((entry) => ({ name: entry.name, value: entry.demo }));
          return ctx.ui.ephemeral(interaction, {
            embeds: ctx.ui.guide({
              title: 'Try the bot',
              description: 'Run a command below with moth.exe in ' + showcaseChannel(interaction.guildId, 'demos', 'a channel where the bot can post') + '.\n\n> **Demo data:** Use fictional names and sample content.',
              tone: 'help',
            }, [
              ...[fields.slice(0, 3), fields.slice(3)].filter((group) => group.length).map((group, index) => ({
                title: index === 0 ? '🕹️ Quick demos' : '✦ More demos', fields: group,
              })),
              { title: 'Browse the full catalogue', description: 'Run `/moth features` or open the [website catalogue](' + FEATURE_CATALOGUE_URL + ').' },
            ], { header: 'header.lavenderWindow' }),
          });
        }

        if (sub === 'about') {
          return interaction.reply({
            embeds: ctx.ui.embedLayout({
              title: 'Scriptmoth bot showcase',
              description: 'Scriptmoth builds custom Discord bots. Try moth.exe here to see what a bot could do for your server.',
              fields: [
                { name: 'Explore', value: 'Run `/moth features` to browse or `/moth try` to start a demo.' },
                { name: 'Ask about a custom bot', value: '[See packages](' + BOT_PACKAGES_URL + ') or [describe what your server needs](' + BUILD_A_BOT_URL + ').' },
                { name: 'Portfolio', value: '[See bot dashboards, websites, themes, and profiles](' + PORTFOLIO_URL + ').' },
              ],
              color: ctx.ui.COLORS.night,
              thumbnail: ctx.ui.art('icon.services'),
            }, { header: 'header.lavenderWindow' }),
          });
        }

        const id = interaction.options.getString('module');
        if (sub === 'info') {
          const feature = showcaseEntries(ctx.modules, interaction.guildId).find((entry) => entry.id === id);
          if (feature) return interaction.reply(await featureCard(ctx, interaction.guildId, feature));
        }
        const entry = catalog(ctx).find((e) => e.id === id);
        if (!entry) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('Choose a feature from the suggestions as you type, or browse `/moth features`.', 'Feature not found')] });

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
        const features = interaction.options.getSubcommand() === 'info' ? showcaseEntries(ctx.modules) : [];
        const featureIds = new Set(features.map(({ id }) => id));
        const entries = [...features, ...catalog(ctx).filter(({ id }) => !featureIds.has(id))];
        const choices = entries
          .filter((e) => e.id.includes(query) || e.name.toLowerCase().includes(query))
          .slice(0, 25)
          .map((e) => ({ name: e.tier ? `${e.name} (${e.tier})` : e.name, value: e.id }));
        return interaction.respond(choices);
      },
    },
  ],

  components: {
    async category(interaction, ctx) {
      const value = interaction.values[0];
      const previousCategories = { fun: 'community', characters: 'roleplay', creators: 'utilities', utility: 'utilities' };
      const view = catalogueView(ctx.ui, showcaseEntries(ctx.modules), { category: previousCategories[value] ?? value });
      // Only the person who opened the menu changes the shared message; others get their own copy.
      if (interaction.message.interactionMetadata?.user?.id === interaction.user.id) return interaction.update(view);
      return ctx.ui.ephemeral(interaction, view);
    },
    async feature(interaction, ctx) {
      const entry = showcaseEntries(ctx.modules, interaction.guildId).find(({ id }) => id === interaction.values[0]);
      if (!entry) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.empty('Open `/moth features` to see the current catalogue.')] });
      return ctx.ui.ephemeral(interaction, await featureCard(ctx, interaction.guildId, entry));
    },
    crafting(interaction, ctx, [mode, action]) {
      const ansi = mode === 'ansi';
      const payload = { embeds: [craftingExample(ctx.ui, ansi)], components: [readoutButton(ansi, true)] };
      return action === 'update' ? interaction.update(payload) : ctx.ui.ephemeral(interaction, payload);
    },
  },
};
