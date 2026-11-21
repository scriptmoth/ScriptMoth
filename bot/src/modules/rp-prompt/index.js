// RP prompts: a built-in prompt generator plus member-submitted prompts with mod review.

const crypto = require('node:crypto');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const BUILT_IN = require('./prompts');

const GENRES = Object.keys(BUILT_IN);
const MAX_PENDING = 50;

const isMod = (interaction) => interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);

async function pool(ctx, guildId, genre) {
  const approved = await ctx.store.get(guildId, 'approved', []);
  const builtIn = (genre ? [genre] : GENRES).flatMap((g) => BUILT_IN[g].map((text) => ({ text, genre: g })));
  const community = approved.filter((p) => !genre || p.genre === genre).map((p) => ({ ...p, community: true }));
  return [...builtIn, ...community];
}

function promptEmbed(ctx, prompt) {
  return ctx.ui.embed({
    title: '📜 RP prompt',
    description: prompt.text,
    footer: prompt.community ? `${prompt.genre} · submitted by a member` : prompt.genre,
  });
}

function reviewView(ctx, pending) {
  if (!pending.length) return { embeds: [ctx.ui.ok('No prompts waiting for review.')], components: [] };
  const next = pending[0];
  return {
    embeds: [
      ctx.ui.embed({
        title: `Prompt review · ${pending.length} waiting`,
        description: next.text,
        fields: [
          { name: 'Genre', value: next.genre, inline: true },
          { name: 'From', value: `<@${next.authorId}>`, inline: true },
        ],
      }),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`rp-prompt:review:approve:${next.id}`).setLabel('Approve').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`rp-prompt:review:reject:${next.id}`).setLabel('Reject').setStyle(ButtonStyle.Danger),
      ),
    ],
  };
}

module.exports = {
  id: 'rp-prompt',
  name: 'RP Prompts',
  tier: 'L2',
  category: 'roleplay',
  description: 'Random roleplay prompts by genre, plus member submissions that mods approve.',
  details: 'Members submit prompts with `/rpprompt submit`. Moderators with Manage Messages approve or reject them in `/rpprompt review`. Approved prompts join the random pool.',

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('rpprompt')
        .setDescription('Roleplay prompts')
        .addSubcommand((s) =>
          s
            .setName('get')
            .setDescription('Get a random prompt')
            .addStringOption((o) => o.setName('genre').setDescription('Genre').addChoices(...GENRES.map((g) => ({ name: g, value: g })))),
        )
        .addSubcommand((s) => s.setName('submit').setDescription('Suggest a prompt for this server'))
        .addSubcommand((s) => s.setName('review').setDescription('Approve or reject submitted prompts (mods)')),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'get') {
          const all = await pool(ctx, interaction.guildId, interaction.options.getString('genre'));
          return interaction.reply({ embeds: [promptEmbed(ctx, ctx.ui.pick(all))] });
        }

        if (sub === 'submit') {
          const modal = new ModalBuilder()
            .setCustomId('rp-prompt:submit')
            .setTitle('Suggest an RP prompt')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('text').setLabel('Prompt').setStyle(TextInputStyle.Paragraph).setMinLength(15).setMaxLength(500).setRequired(true),
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('genre').setLabel(`Genre (${GENRES.join(', ')})`).setStyle(TextInputStyle.Short).setMaxLength(20).setRequired(false),
              ),
            );
          return interaction.showModal(modal);
        }

        if (!isMod(interaction)) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('You need **Manage Messages** to review prompts.')] });
        return ctx.ui.ephemeral(interaction, reviewView(ctx, await ctx.store.get(interaction.guildId, 'pending', [])));
      },
    },
  ],

  components: {
    async submit(interaction, ctx) {
      const text = interaction.fields.getTextInputValue('text').trim();
      const rawGenre = interaction.fields.getTextInputValue('genre').trim().toLowerCase();
      const genre = GENRES.includes(rawGenre) ? rawGenre : 'any';
      const pending = await ctx.store.get(interaction.guildId, 'pending', []);
      if (pending.length >= MAX_PENDING) {
        return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('The review queue is full right now. Try again after the mods catch up.')] });
      }
      pending.push({ id: crypto.randomUUID().slice(0, 8), text, genre, authorId: interaction.user.id, at: Date.now() });
      await ctx.store.set(interaction.guildId, 'pending', pending);
      return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok('Thanks! Your prompt is waiting for a moderator to review it.')] });
    },

    async review(interaction, ctx, [decision, id]) {
      if (!isMod(interaction)) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('You need **Manage Messages** to review prompts.')] });
      const pending = await ctx.store.get(interaction.guildId, 'pending', []);
      const item = pending.find((p) => p.id === id);
      const rest = pending.filter((p) => p.id !== id);
      if (item && decision === 'approve') {
        await ctx.store.update(interaction.guildId, 'approved', (list) => [...list, { ...item, approvedBy: interaction.user.id }], []);
      }
      await ctx.store.set(interaction.guildId, 'pending', rest);
      return interaction.update(reviewView(ctx, rest));
    },
  },
};
