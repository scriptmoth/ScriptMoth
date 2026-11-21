// moth core: shared look and small helpers. Modules use these so every feature looks
// like it belongs to the same bot. Change COLORS or DIVIDER to re-theme a client's bot in one place.

const path = require('node:path');
const { EmbedBuilder, MessageFlags } = require('discord.js');

// Moth palette: dusty wing lilac, night sky, moonlight cream, luna moth green, lamp glow, rosy maple moth.
const COLORS = {
  moth: 0xb39ddb, // wing lilac: default embed color
  dusk: 0x8e7cc3, // deeper lilac for headers
  night: 0x2e2747, // night sky
  moonlight: 0xf3ead7, // cream moonlight
  wing: 0xc9ad86, // soft mothwing tan
  success: 0x9ccfa4, // luna moth green
  warning: 0xf2c27b, // lamp glow
  danger: 0xe58fa5, // rosy maple moth pink
};

// Every embed gets this image underneath, attached to the message as a file.
// Set DIVIDER.enabled = false (or MOTH_DIVIDER=off) to turn it off for a client's bot.
const DIVIDER = {
  enabled: process.env.MOTH_DIVIDER !== 'off',
  name: 'divider.png',
  file: path.join(__dirname, '..', '..', 'assets', 'divider.png'),
};
const DIVIDER_URL = `attachment://${DIVIDER.name}`;

// Short tier markers for lists (/moth features and the #features post).
const TIER_BADGES = { basic: '⚪ Basic', L1: '🟢 L1', L2: '🔵 L2', L3: '🟣 L3', L4: '🟠 L4' };

const TIER_LABELS = {
  basic: 'Basic · included',
  L1: 'L1 · small feature',
  L2: 'L2 · moderate feature',
  L3: 'L3 · complex module',
  L4: 'L4 · custom system',
};

function embed({ title, description, color = COLORS.moth, fields, footer, thumbnail, image, divider = true } = {}) {
  const e = new EmbedBuilder().setColor(color);
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  if (fields?.length) e.addFields(fields);
  if (footer) e.setFooter({ text: footer });
  if (thumbnail) e.setThumbnail(thumbnail);
  if (image) e.setImage(image);
  else if (divider && DIVIDER.enabled) e.setImage(DIVIDER_URL);
  return e;
}

/** True when any embed in the payload shows the divider. */
function usesDivider(payload) {
  return (payload?.embeds ?? []).some((e) => (e?.data ?? e)?.image?.url === DIVIDER_URL);
}

/** Adds the divider file to a discord.js message payload when its embeds need it. */
function withDivider(payload) {
  if (!payload || typeof payload !== 'object' || !usesDivider(payload)) return payload;
  const files = payload.files ?? [];
  if (files.some((f) => f?.name === DIVIDER.name)) return payload;
  return { ...payload, files: [...files, { attachment: DIVIDER.file, name: DIVIDER.name }] };
}

const ok = (description, title) => embed({ title, description, color: COLORS.success });
const warn = (description, title) => embed({ title, description, color: COLORS.warning });
const fail = (description, title) => embed({ title, description, color: COLORS.danger });

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

module.exports = { COLORS, DIVIDER, DIVIDER_URL, TIER_BADGES, TIER_LABELS, embed, usesDivider, withDivider, ok, warn, fail, ephemeral, pick, truncate };
