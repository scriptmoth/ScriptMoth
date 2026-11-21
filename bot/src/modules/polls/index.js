const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  id: 'polls',
  name: 'Voting & Polls',
  tier: 'L1',
  category: 'community',
  description: 'Post a timed poll with Discord voting and live results.',
  commands: [{
    data: new SlashCommandBuilder().setName('poll').setDescription('Post a poll everyone in this channel can vote on')
      .addStringOption((o) => o.setName('question').setDescription('What are we voting on?').setMaxLength(200).setRequired(true))
      .addStringOption((o) => o.setName('choices').setDescription('Two to ten choices, separated by |').setMaxLength(600).setRequired(true))
      .addIntegerOption((o) => o.setName('hours').setDescription('Voting duration. Defaults to 24 hours.').setMinValue(1).setMaxValue(168)),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Post polls in a server.');
      const options = i.options.getString('choices').split('|').map((choice) => choice.trim());
      if (options.length < 2 || options.length > 10 || options.some((choice) => !choice || choice.length > 55)) {
        return ctx.ui.ephemeral(i, 'Enter 2–10 choices with up to 55 characters each. Separate them with `|`.');
      }
      if (new Set(options.map((choice) => choice.toLowerCase())).size !== options.length) {
        return ctx.ui.ephemeral(i, 'Each poll choice should be different.');
      }
      const question = i.options.getString('question').trim();
      if (!question) return ctx.ui.ephemeral(i, 'Enter a question for the poll.');
      return i.reply({
        poll: {
          question: { text: question },
          answers: options.map((text) => ({ text })),
          duration: i.options.getInteger('hours') ?? 24,
        },
        allowedMentions: { parse: [] },
      });
    },
  }],
};
