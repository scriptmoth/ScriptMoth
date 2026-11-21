// moth core: shared look and small helpers. Modules use these so every feature looks
// like it belongs to the same bot. Shared artwork lives in embed-assets.js.

const { EmbedBuilder, MessageFlags, escapeMarkdown } = require('discord.js');
const { basename } = require('node:path');
const { art, artwork, availableArtwork, attachmentNames } = require('./embed-assets');
const { templates, renderedBanner, renderBanner } = require('./banner');
const retiredArtwork = new Set(['lilac-spark.webp']);
const dividers = new Set([
  'lavender-sparkle-divider.png', 'lavender-diamond-divider.png', 'pastel-twinkle-divider.png',
  'lavender-crescent-divider.png', 'divider.png', 'starfield-footer.png', 'scalloped-footer.png',
]);
const cardDividers = new WeakMap();
const filename = (url) => typeof url === 'string' && url.startsWith('attachment://') ? url.slice('attachment://'.length) : '';
const defaultDivider = () => art('divider.sparkle') ?? art('divider.moth');

// Moth palette: dusty wing lilac, night sky, moonlight cream, luna moth green, lamp glow, rosy maple moth.
const COLORS = {
  moth: 0xc6a6d7, // lavender: default embed color
  dusk: 0x8e7cc3, // deeper lilac for headers
  night: 0x392436, // deep plum
  moonlight: 0xfbe8cc, // warm cream
  wing: 0xc9ad86, // soft mothwing tan
  success: 0x9ccfa4, // luna moth green
  warning: 0xf2c27b, // lamp glow
  danger: 0xe58fa5, // rosy maple moth pink
};

// Short tier markers for lists (/moth features and the #features post).
const TIER_BADGES = { basic: '⚪ Basic', L1: '🟢 L1', L2: '🔵 L2', L3: '🟣 L3', L4: '🟠 L4' };

const TIER_LABELS = {
  basic: 'Basic · included',
  L1: 'L1 · small feature',
  L2: 'L2 · moderate feature',
  L3: 'L3 · complex module',
  L4: 'L4 · custom system',
};

const styles = {
  general: { title: 'Details', color: COLORS.moth, icon: 'icon.services' },
  bot: { title: 'Bot response', color: COLORS.moth, icon: 'icon.botFeatures' },
  help: { title: 'Help', color: COLORS.moth, icon: 'icon.faq' },
  empty: { title: 'Nothing to show yet', color: COLORS.moth, icon: 'icon.faq' },
  success: { title: 'Confirmed', color: COLORS.success, icon: 'status.open' },
  warning: { title: 'Attention needed', color: COLORS.warning, icon: 'icon.announcements' },
  error: { title: 'Something went wrong', color: COLORS.danger, icon: 'status.closed' },
};

function defaultThumbnail(style) {
  return art(style.icon) ?? art('icon.services') ?? art('icon.botFeatures') ?? art('icon.faq');
}

function embed({ title, description, color, fields, footer, author, thumbnail, image, divider, tone = 'general' } = {}) {
  const style = styles[tone] ?? styles.general;
  const e = new EmbedBuilder().setColor(color ?? style.color);
  if (title || tone !== 'general') e.setTitle(title ?? style.title);
  if (description) e.setDescription(description);
  if (fields?.length) e.addFields(fields);
  if (footer) e.setFooter(typeof footer === 'string' ? { text: footer } : footer);
  if (author) e.setAuthor(author);
  const icon = thumbnail ?? defaultThumbnail(style);
  if (icon) e.setThumbnail(icon);
  const dividerUrl = art(divider) ?? defaultDivider();
  const wideImage = image ?? dividerUrl;
  if (wideImage) e.setImage(wideImage);
  if (image && dividerUrl) cardDividers.set(e, dividerUrl);
  return e;
}

function embedLayout(options, { header, headerImage, footer } = {}) {
  const headerUrl = headerImage ?? (header ? art(header) ?? art('header.lavenderWindow') : undefined);
  const embeds = [embed({ ...options, divider: art(footer) ? footer : options.divider })];
  if (templates.has(filename(headerUrl))) embeds.unshift(new EmbedBuilder().setImage(headerUrl));
  return embeds;
}

/** A single post with a titled banner and one card per reader task. */
function guide(options, sections, layout) {
  const embeds = embedLayout(options, layout);
  for (const section of sections) {
    embeds.push(embed({
      color: options.color,
      divider: art(layout?.footer) ? layout.footer : options.divider,
      thumbnail: options.thumbnail,
      tone: options.tone,
      ...section,
    }));
  }
  return embeds;
}

function codeBlock(lines, language = '') {
  return ['```' + language, ...lines, '```'].join('\n');
}

// Keep ANSI opt-in. Every colored segment ends with a reset and has a text label.
function statusBlock(rows, ansi = false) {
  const tones = { ready: 36, waiting: 33 };
  return codeBlock(rows.map(({ label, detail, tone }) => {
    const status = ansi ? `\x1b[1;${tones[tone]}m${label}\x1b[0m` : label;
    return `${status}\n${detail}`;
  }), ansi ? 'ansi' : '');
}

function validMedia(url, available) {
  if (typeof url !== 'string') return false;
  if (url.startsWith('attachment://')) return available.has(url.slice('attachment://'.length));
  return /^https?:\/\//i.test(url) && URL.canParse(url);
}

function placeFooterBeforeImage(data) {
  if (data.timestamp || data.footer?.icon_url) return data;
  if (!data.footer?.text) return data;
  const note = `-# ${escapeMarkdown(data.footer.text)}`;
  const description = [data.description, note].filter(Boolean).join('\n\n');
  const fields = data.fields ?? [];
  if (!fields.length && description.length <= 4096) {
    return { ...data, description, footer: undefined };
  }
  if (fields.length < 25 && note.length <= 1024) {
    return { ...data, fields: [...fields, { name: '\u200b', value: note }], footer: undefined };
  }
  return data;
}

/** Finish each card, including legacy embeds, before it reaches Discord. */
async function formatEmbeds(embeds, available, local, generated) {
  const dataFor = (embed) => embed?.data ?? embed?.toJSON?.() ?? embed;
  const hasText = (data) => data?.title || data?.description || data?.fields?.length || data?.author?.name || data?.footer?.text;
  const finished = await Promise.all(embeds.map(async (embed, index) => {
    const data = dataFor(embed);
    const name = filename(data.image?.url);
    const content = hasText(data);
    const isTemplate = templates.has(name);
    const next = dataFor(embeds[index + 1]);
    const layout = [];
    if (isTemplate) {
      const banner = await renderBanner(name, local.get(name), content ? data.title : next?.title);
      if (banner) {
        generated.set(banner.name, banner);
        layout.push(new EmbedBuilder().setImage(`attachment://${banner.name}`));
      }
      if (!content) return layout;
    }
    const image = !isTemplate && validMedia(data.image?.url, available) ? data.image : undefined;
    const thumbnail = validMedia(data.thumbnail?.url, available) ? data.thumbnail : undefined;
    if (!content && image && (dividers.has(name) || renderedBanner.test(name))) return [embed];
    if (!content && !image && !thumbnail) return layout;
    const author = data.author?.icon_url && !validMedia(data.author.icon_url, available) ? { ...data.author, icon_url: undefined } : data.author;
    const footer = data.footer?.icon_url && !validMedia(data.footer.icon_url, available) ? { ...data.footer, icon_url: undefined } : data.footer;
    const style = Object.values(styles).find(({ color }) => color === data.color) ?? styles.general;
    const icon = thumbnail?.url ?? defaultThumbnail(style);
    const nextDivider = !hasText(next) && dividers.has(filename(next?.image?.url)) && validMedia(next.image.url, available);
    const requested = cardDividers.get(embed);
    const divider = validMedia(requested, available) ? requested : defaultDivider();
    const media = image && !dividers.has(name) ? image : undefined;
    const details = media || nextDivider ? { ...data, footer } : placeFooterBeforeImage({ ...data, footer });
    const separateDivider = media || details.footer || details.timestamp;
    const card = new EmbedBuilder({
      ...details, image: media ?? (separateDivider || nextDivider ? undefined : image ?? (divider ? { url: divider } : undefined)),
      fields: details.fields?.map((field) => ({ ...field, inline: field.inline === true })),
      thumbnail: icon ? { url: icon } : undefined, color: data.color ?? style.color, author,
    });
    const ending = image && dividers.has(name) ? image.url : divider;
    layout.push(card);
    if (separateDivider && ending && !nextDivider) layout.push(new EmbedBuilder().setImage(ending));
    return layout;
  }));
  return finished.flat();
}

/** Apply the formatter, upload referenced art, and retain attachments an edit still needs. */
async function withArtwork(payload, existing = [], extraArtwork = new Map()) {
  if (!payload?.embeds) return payload;
  const files = payload.files ?? [];
  const replaced = new Set(files.map((file) => {
    const source = file?.attachment ?? file;
    return file?.name ?? (typeof source === 'string' ? basename(source) : undefined);
  }));
  const keep = payload.attachments ?? existing.map(({ id }) => ({ id }));
  const keepIds = new Set(keep.map(({ id }) => id));
  const local = new Map([...availableArtwork(), ...extraArtwork]);
  const managed = (name) => artwork.has(name) || retiredArtwork.has(name) || renderedBanner.test(name);
  const retainedNames = existing.filter(({ id, name }) => keepIds.has(id) && (!managed(name) || renderedBanner.test(name)))
    .map(({ name }) => name);
  const available = new Set([...local.keys(), ...replaced, ...retainedNames]);
  const generated = new Map();
  const embeds = await formatEmbeds(payload.embeds, available, local, generated);
  const names = attachmentNames(embeds);
  const stale = new Set(existing
    .filter(({ name, width, height }) => managed(name) && (
      !names.has(name) || replaced.has(name) ||
      (dividers.has(name) && width != null && (width !== 960 || height !== 64))
    ))
    .map(({ id }) => id));
  const retained = keep.filter(({ id }) => !stale.has(id));
  const retainedIds = new Set(retained.map(({ id }) => id));
  for (const { id, name } of existing) {
    if (retainedIds.has(id)) replaced.add(name);
  }
  const added = [];
  for (const name of names) {
    if (replaced.has(name)) continue;
    if (generated.has(name)) added.push(generated.get(name));
    else if (local.has(name)) added.push({ attachment: local.get(name), name });
  }
  if (!added.length && !stale.size && !(files.length && retained.length)) return { ...payload, embeds };
  return { ...payload, embeds, attachments: retained, files: [...files, ...added] };
}

const ok = (description, title) => embed({ title, description, tone: 'success' });
const warn = (description, title) => embed({ title, description, tone: 'warning' });
const fail = (description, title) => embed({ title, description, tone: 'error' });
const empty = (description, title) => embed({ title, description, tone: 'empty' });

/** Reply privately (only the user sees it). Works whether or not the interaction was already answered. */
async function ephemeral(interaction, payload) {
  const body = typeof payload === 'string' ? { content: payload } : payload;
  const options = { ...body, flags: MessageFlags.Ephemeral };
  if (interaction.deferred || interaction.replied) return interaction.followUp(options);
  return interaction.reply(options);
}

function pick(list, random = Math.random) {
  return list[Math.floor(random() * list.length)];
}

function truncate(text, max) {
  if (!text) return text;
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

module.exports = { COLORS, TIER_BADGES, TIER_LABELS, art, embed, embedLayout, guide, codeBlock, statusBlock, withArtwork, ok, warn, fail, empty, ephemeral, pick, truncate };
