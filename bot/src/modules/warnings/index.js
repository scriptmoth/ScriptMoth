const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  id: 'warnings',
  name: 'Moderation Warnings',
  tier: 'L2',
  category: 'moderation',
  description: 'Keep a private warning history. Moderators can record warnings and members can review their own.',
  commands: [{
    data: new SlashCommandBuilder().setName('warning').setDescription('Record or review server warnings')
      .addSubcommand((s) => s.setName('add').setDescription('Record a warning (moderators)')
        .addUserOption((o) => o.setName('member').setDescription('Member to warn').setRequired(true))
        .addStringOption((o) => o.setName('reason').setDescription('Reason visible to the member').setRequired(true).setMaxLength(300)))
      .addSubcommand((s) => s.setName('history').setDescription('See your warnings or, for staff, a member’s warnings')
        .addUserOption((o) => o.setName('member').setDescription('Member to look up (moderators)'))),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Use warnings in a server.');
      const action = i.options.getSubcommand();
      const target = i.options.getUser('member') ?? i.user;
      if ((action === 'add' || target.id !== i.user.id) && !i.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
        return ctx.ui.ephemeral(i, 'You need **Timeout Members** to manage other members’ warnings.');
      }
      if (action === 'add') {
        const member = i.options.getMember('member');
        if (!member?.moderatable || target.id === i.user.id || (
          i.guild.ownerId !== i.user.id && i.member.roles.highest.comparePositionTo(member.roles.highest) <= 0
        )) {
          return ctx.ui.ephemeral(i, 'Pick a member below your role whom the bot can moderate.');
        }
        const reason = i.options.getString('reason').trim();
        if (!reason) return ctx.ui.ephemeral(i, 'Enter a reason for the warning.');
        await ctx.store.update(i.guildId, target.id, (history) =>
          [{ reason, at: Math.floor(Date.now() / 1000), moderator: i.user.id }, ...history].slice(0, 10), []);
        return ctx.ui.ephemeral(i, 'Warning recorded. The member can see it with `/warning history`.');
      }
      const history = await ctx.store.get(i.guildId, target.id, []);
      const description = history.map(({ at, reason }) => `<t:${at}:d> · ${reason}`).join('\n') || 'No warnings recorded.';
      return ctx.ui.ephemeral(i, {
        embeds: [ctx.ui.embed({ title: 'Recent warnings', description, tone: history.length ? 'warning' : 'empty' })],
        allowedMentions: { parse: [] },
      });
    },
  }],
};
