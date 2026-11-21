const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { randomUUID } = require('node:crypto');

const statuses = ['new', 'reviewing', 'resolved'];
const idOption = (o) => o.setName('id').setDescription('Feedback ID from the review list').setRequired(true);

module.exports = {
  id: 'feedback',
  name: 'Suggestions & Feedback',
  tier: 'L2',
  category: 'community',
  description: 'Send feature requests and test reports to staff and check their review status.',
  commands: [{
    data: new SlashCommandBuilder().setName('feedback').setDescription('Report a bug or suggest an improvement')
      .addSubcommand((s) => s.setName('send').setDescription('Send private feedback to the server’s staff')
        .addStringOption((o) => o.setName('message').setDescription('What did you try and what happened?').setMaxLength(500).setRequired(true)))
      .addSubcommand((s) => s.setName('status').setDescription('Check the status of your feedback').addStringOption(idOption))
      .addSubcommand((s) => s.setName('inbox').setDescription('See the latest unresolved reports (Manage Server)'))
      .addSubcommand((s) => s.setName('review').setDescription('Update a report’s status (Manage Server)').addStringOption(idOption)
        .addStringOption((o) => o.setName('status').setDescription('Review status').setRequired(true)
          .addChoices(...statuses.map((status) => ({ name: status, value: status }))))),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Send feedback in a server.');
      const action = i.options.getSubcommand();
      const staff = i.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
      if ((action === 'inbox' || action === 'review') && !staff) {
        return ctx.ui.ephemeral(i, 'You need **Manage Server** to review feedback.');
      }
      if (action === 'send') {
        const message = i.options.getString('message').trim();
        if (!message) return ctx.ui.ephemeral(i, 'Add a message before sending feedback.');
        let id;
        await ctx.store.update(i.guildId, 'reports', (reports) => {
          const last = reports.find((r) => r.author === i.user.id);
          if (last && Date.now() - last.created < 60_000) return reports;
          id = randomUUID();
          return [{ id, author: i.user.id, message, status: 'new', created: Date.now() }, ...reports].slice(0, 500);
        }, []);
        return ctx.ui.ephemeral(i, id ? `Sent to staff. Check its status with \`/feedback status id:${id}\`.` : 'Wait one minute between reports.');
      }
      const id = i.options.getString('id');
      const reports = await ctx.store.get(i.guildId, 'reports', []);
      if (action === 'inbox') {
        const unresolved = reports.filter((r) => r.status !== 'resolved').slice(0, 5);
        const fields = unresolved.map((r) => ({ name: `${r.status} · ${r.id}`, value: r.message }));
        return ctx.ui.ephemeral(i, { embeds: [ctx.ui.embed({
          title: 'Latest unresolved feedback',
          description: fields.length ? undefined : 'No unresolved reports.',
          fields,
          thumbnail: fields.length ? ctx.ui.art('icon.support') : undefined,
          tone: fields.length ? 'general' : 'empty',
        })], allowedMentions: { parse: [] } });
      }
      const report = reports.find((r) => r.id === id && (staff || r.author === i.user.id));
      if (!report) return ctx.ui.ephemeral(i, 'No report found for that ID.');
      if (action === 'status') return ctx.ui.ephemeral(i, `This report is **${report.status}**.`);
      const status = i.options.getString('status');
      let updated = false;
      await ctx.store.update(i.guildId, 'reports', (current) => current.map((r) => {
        if (r.id !== id) return r;
        updated = true;
        return { ...r, status };
      }), []);
      return ctx.ui.ephemeral(i, updated ? `Report marked **${status}**.` : 'No report found for that ID.');
    },
  }],
};
