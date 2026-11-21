const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const words = require('./words');

const THEMES = Object.keys(words.subjects);

function makePrompt(theme, pick) {
  const key = THEMES.includes(theme) ? theme : pick(THEMES);
  return {
    theme: key,
    subject: pick(words.subjects[key]),
    setting: pick(words.settings),
    mood: pick(words.moods),
    twist: pick(words.twists),
    palette: pick(words.palettes),
  };
}

function view(ctx, prompt, userId) {
  return {
    embeds: [
      ctx.ui.embed({
        title: '🎨 Art prompt',
        description: `Draw **${prompt.subject}** ${prompt.setting}.`,
        fields: [
          { name: 'Mood', value: prompt.mood, inline: true },
          { name: 'Palette', value: prompt.palette, inline: true },
          { name: 'Twist', value: prompt.twist },
        ],
        footer: `Theme: ${prompt.theme}`,
      }),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`art-prompt:again:${prompt.theme}:${userId}`).setLabel('Another one').setEmoji('🔁').setStyle(ButtonStyle.Secondary),
      ),
    ],
  };
}

module.exports = {
  id: 'art-prompt',
  name: 'Art Prompt Generator',
  tier: 'L1',
  category: 'creators',
  description: 'Random drawing prompts with a subject, setting, mood, palette, and twist.',

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('artprompt')
        .setDescription('Get a random art prompt')
        .addStringOption((o) =>
          o
            .setName('theme')
            .setDescription('Pick a theme (random if empty)')
            .addChoices(...THEMES.map((t) => ({ name: t, value: t }))),
        ),
      async execute(interaction, ctx) {
        const prompt = makePrompt(interaction.options.getString('theme'), ctx.ui.pick);
        return interaction.reply(view(ctx, prompt, interaction.user.id));
      },
    },
  ],

  components: {
    async again(interaction, ctx, [theme, ownerId]) {
      const prompt = makePrompt(theme, ctx.ui.pick);
      if (interaction.user.id === ownerId) return interaction.update(view(ctx, prompt, ownerId));
      return ctx.ui.ephemeral(interaction, view(ctx, prompt, interaction.user.id));
    },
  },

  makePrompt,
};
