const { ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  id: 'bookmarks',
  name: 'Message Bookmarks',
  tier: 'L2',
  category: 'utility',
  description: 'Save Discord messages from the Apps menu and open your private list anytime.',
  commands: [
    {
      data: new ContextMenuCommandBuilder().setName('Bookmark Message').setType(ApplicationCommandType.Message),
      async execute(i, ctx) {
        if (!i.guildId) return ctx.ui.ephemeral(i, 'Bookmark messages from a server.');
        const { id, url } = i.targetMessage;
        await ctx.store.update(i.guildId, i.user.id, (saved) =>
          [{ id, url }, ...saved.filter((item) => item.id !== id)].slice(0, 20), []);
        return ctx.ui.ephemeral(i, 'Saved. Run `/bookmarks list` to see your latest 20 bookmarks.');
      },
    },
    {
      data: new SlashCommandBuilder().setName('bookmarks').setDescription('Manage your private saved messages')
        .addSubcommand((s) => s.setName('list').setDescription('List your saved messages'))
        .addSubcommand((s) => s.setName('remove').setDescription('Remove a bookmark by message ID')
          .addStringOption((o) => o.setName('message').setDescription('Select a saved message').setRequired(true).setAutocomplete(true))),
      async execute(i, ctx) {
        if (!i.guildId) return ctx.ui.ephemeral(i, 'Open bookmarks in a server.');
        if (i.options.getSubcommand() === 'list') {
          const saved = await ctx.store.get(i.guildId, i.user.id, []);
          const lines = saved.map(({ id, url }) => `[Message ${id}](${url})`);
          return ctx.ui.ephemeral(i, { embeds: [ctx.ui.embed({
            title: 'Saved messages',
            tone: lines.length ? 'general' : 'empty',
            description: lines.join('\n') || 'Open a message’s Apps menu and choose **Bookmark Message**.',
          })] });
        }
        const id = i.options.getString('message');
        let removed = false;
        await ctx.store.update(i.guildId, i.user.id, (saved) => {
          removed = saved.some((item) => item.id === id);
          return saved.filter((item) => item.id !== id);
        }, []);
        return ctx.ui.ephemeral(i, removed ? 'Bookmark removed.' : 'That bookmark was already gone.');
      },
      async autocomplete(i, ctx) {
        const saved = i.guildId ? await ctx.store.get(i.guildId, i.user.id, []) : [];
        const query = i.options.getFocused();
        return i.respond(saved.filter(({ id }) => id.includes(query)).map(({ id }) => ({ name: `Message ${id}`, value: id })));
      },
    },
  ],
};
