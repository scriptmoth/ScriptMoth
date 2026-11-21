const { escapeMarkdown, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { randomUUID } = require('node:crypto');

const mentions = { parse: [] };
const pageSize = 5;
const maxEntries = 200;
const idOption = (o) => o.setName('id').setDescription('Submission ID from the gallery or review list').setMaxLength(36).setRequired(true);
const shortInput = (o, name, description, max) => o.setName(name).setDescription(description).setMaxLength(max);
const norm = (value) => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

function submissionUrl(text) {
  try {
    const url = new URL(text.trim());
    if (url.protocol === 'https:' && !url.username && !url.password && url.href.length <= 450 && !/[\s<>]/.test(url.href)) return url.href;
  } catch {
    // Discord can pass plain text in a string option.
  }
  return null;
}

async function submit(i, ctx) {
  const title = i.options.getString('title').trim();
  const credit = i.options.getString('credit').trim();
  const url = submissionUrl(i.options.getString('link'));
  if (!title || !credit || !url) return ctx.ui.ephemeral(i, 'Enter a title, creator credit, and a valid https:// link.');
  const tags = [...new Set((i.options.getString('tags') ?? '').split(',').map(norm).filter(Boolean))].slice(0, 5);
  let reply;
  await ctx.store.update(i.guildId, 'entries', (entries) => {
    const own = entries.filter((entry) => entry.author === i.user.id);
    if (own.some((entry) => entry.url === url)) {
      reply = 'You already submitted that link. Remove the old entry before resubmitting.';
      return entries;
    }
    if (entries.length >= maxEntries || own.filter((entry) => entry.status === 'pending').length >= 5) {
      reply = 'The gallery or your pending queue is full. Remove an older submission and try again.';
      return entries;
    }
    const id = randomUUID();
    reply = `Submitted for review. Your submission ID is \`${id}\`.`;
    return [{ id, title, credit, url, tags, author: i.user.id, status: 'pending' }, ...entries];
  }, []);
  return ctx.ui.ephemeral(i, reply);
}

function entryField(entry, showStatus) {
  return {
    name: escapeMarkdown(entry.title),
    value: [
      `By ${escapeMarkdown(entry.credit)}`,
      `<${entry.url}>`,
      entry.tags.length && `Tags · ${entry.tags.map((tag) => escapeMarkdown(tag)).join(', ')}`,
      `${showStatus ? entry.status + ' · ' : 'ID · '}\`${entry.id}\``,
    ].filter(Boolean).join('\n'),
  };
}

async function display(i, ctx, action) {
  const entries = await ctx.store.get(i.guildId, 'entries', []);
  const tag = norm(i.options.getString('tag') ?? '');
  const visible = entries.filter((entry) => {
    if (action === 'mine') return entry.author === i.user.id;
    if (action === 'queue') return entry.status === 'pending';
    return entry.status === 'approved' && (!tag || entry.tags.includes(tag));
  });
  const page = i.options.getInteger('page') ?? 1;
  const pageEntries = visible.slice((page - 1) * pageSize, page * pageSize);
  const fields = pageEntries.map((entry) => entryField(entry, action !== 'browse'));
  const preview = action === 'browse' ? pageEntries.find(({ url }) => {
    const image = submissionUrl(url);
    return image && /\.(?:avif|gif|jpe?g|png|webp)$/i.test(new URL(image).pathname);
  }) : undefined;
  return ctx.ui.ephemeral(i, {
    embeds: [ctx.ui.embed({
      title: { mine: 'Your submissions', queue: 'Submissions awaiting review', browse: 'Community gallery' }[action],
      description: fields.length ? undefined : 'No entries on this page.',
      fields,
      footer: `Page ${page} · ${visible.length} entries`,
      thumbnail: fields.length ? ctx.ui.art('icon.portfolio') : undefined,
      tone: fields.length ? 'general' : 'empty',
      image: preview?.url,
    })],
    allowedMentions: mentions,
  });
}

async function revise(i, ctx, action, staff) {
  const id = i.options.getString('id').trim();
  let reply = 'No matching submission found.';
  await ctx.store.update(i.guildId, 'entries', (entries) => {
    const match = entries.find((entry) => entry.id === id);
    if (!match || (!staff && match.author !== i.user.id)) return entries;
    if (action === 'remove') {
      reply = 'Submission removed.';
      return entries.filter((entry) => entry.id !== id);
    }
    const decision = i.options.getString('decision');
    reply = `Submission marked **${decision}**.`;
    return entries.map((entry) => entry.id === id ? { ...entry, status: decision } : entry);
  }, []);
  return ctx.ui.ephemeral(i, reply);
}

const pageOption = (o) => o.setName('page').setDescription('Page number').setMinValue(1).setMaxValue(Math.ceil(maxEntries / pageSize));

module.exports = {
  id: 'gallery',
  name: 'Art Gallery & Submissions',
  tier: 'L3',
  category: 'creators',
  description: 'Submit credited creations, have staff review them, and browse approved work by tag.',
  commands: [{
    data: new SlashCommandBuilder().setName('gallery').setDescription('Share and browse community creations')
      .addSubcommand((s) => s.setName('submit').setDescription('Send a creation to staff for review')
        .addStringOption((o) => shortInput(o, 'title', 'Name of the creation', 80).setRequired(true))
        .addStringOption((o) => shortInput(o, 'credit', 'Creator name or handle', 80).setRequired(true))
        .addStringOption((o) => shortInput(o, 'link', 'Public HTTPS link to the creation', 300).setRequired(true))
        .addStringOption((o) => shortInput(o, 'tags', 'Up to five tags separated by commas', 100)))
      .addSubcommand((s) => s.setName('browse').setDescription('Browse approved creations').addIntegerOption(pageOption)
        .addStringOption((o) => shortInput(o, 'tag', 'Filter by one tag', 100)))
      .addSubcommand((s) => s.setName('mine').setDescription('See your entries and review statuses').addIntegerOption(pageOption))
      .addSubcommand((s) => s.setName('queue').setDescription('See pending submissions (Manage Server)').addIntegerOption(pageOption))
      .addSubcommand((s) => s.setName('review').setDescription('Approve or decline a submission (Manage Server)').addStringOption(idOption)
        .addStringOption((o) => o.setName('decision').setDescription('Review decision').setRequired(true)
          .addChoices({ name: 'Approve', value: 'approved' }, { name: 'Decline', value: 'declined' })))
      .addSubcommand((s) => s.setName('remove').setDescription('Remove your submission').addStringOption(idOption)),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Use galleries in a server.');
      const action = i.options.getSubcommand();
      const staff = i.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
      if ((action === 'queue' || action === 'review') && !staff) return ctx.ui.ephemeral(i, 'You need **Manage Server** to review gallery entries.');
      if (action === 'submit') return submit(i, ctx);
      if (action === 'review' || action === 'remove') return revise(i, ctx, action, staff);
      return display(i, ctx, action);
    },
  }],
};
