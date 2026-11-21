// Copy this folder to start a new module: rename the folder, set the id to match, fill it in.
// Folders starting with "_" are ignored by the loader.

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  id: 'my-feature', // must match the folder name
  name: 'My Feature',
  tier: 'L1', // basic | L1 | L2 | L3 | L4
  category: 'fun', // see CATEGORIES in src/core/loader.js
  description: 'One line shown in /moth features.',
  details: 'Optional longer text for /moth info.',
  // requires: ['characters'],
  // intents: [GatewayIntentBits.GuildMessages],

  commands: [
    {
      data: new SlashCommandBuilder().setName('myfeature').setDescription('Does a thing'),
      async execute(interaction, ctx) {
        const uses = await ctx.store.update(interaction.guildId, 'uses', (n) => n + 1, 0);
        return interaction.reply({ embeds: [ctx.ui.embed({ title: 'Hello!', description: `Used ${uses} times here.` })] });
      },
    },
  ],

  // Buttons, selects, and modals with customId "my-feature:<action>:<args...>" land here.
  components: {
    // async action(interaction, ctx, args) {},
  },

  // events: { [Events.MessageCreate]: async (ctx, message) => {} },
  // tick: { everyMs: 60_000, async run(ctx) {} },
};
