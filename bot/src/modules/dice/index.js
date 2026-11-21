const { SlashCommandBuilder } = require('discord.js');
const { roll, formatParts, DiceError } = require('./roll');

module.exports = {
  id: 'dice',
  name: 'RP Dice',
  tier: 'L1',
  category: 'roleplay',
  description: 'Roll any dice expression: 2d6+3, 4d6kh3, advantage, and more.',
  details: 'Understands keep-highest/lowest (`4d6kh3`), percentile (`d%`), several dice groups (`1d8+2d6+3`), and `adv`/`dis` for d20s. Natural 20s and 1s get called out.',

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll dice')
        .addStringOption((o) => o.setName('dice').setDescription('e.g. 1d20+5, 4d6kh3, adv').setRequired(true).setMaxLength(100))
        .addStringOption((o) => o.setName('reason').setDescription('What the roll is for').setMaxLength(100)),

      async execute(interaction, ctx) {
        const expression = interaction.options.getString('dice');
        const reason = interaction.options.getString('reason');
        let result;
        try {
          result = roll(expression);
        } catch (error) {
          if (error instanceof DiceError) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail(error.message)] });
          throw error;
        }

        const flair = result.crit ? '  ✨ **Natural 20!**' : result.fumble ? '  💀 **Natural 1.**' : '';
        const color = result.crit ? ctx.ui.COLORS.success : result.fumble ? ctx.ui.COLORS.danger : ctx.ui.COLORS.moth;
        return interaction.reply({
          embeds: [
            ctx.ui.embed({
              title: `🎲 ${result.total}${flair}`,
              description: ctx.ui.truncate(formatParts(result.parts), 3500),
              color,
              footer: `${interaction.member?.displayName ?? interaction.user.username} rolled ${expression}${reason ? ` · ${reason}` : ''}`,
            }),
          ],
        });
      },
    },
  ],
};
