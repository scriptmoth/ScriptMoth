const { existsSync } = require('node:fs');
const path = require('node:path');

const filenames = {
  'header.creamSparkle': 'golden-star-banner.png',
  'header.lavenderWindow': 'retro-window-banner.png',
  'header.moonStars': 'crescent-night-banner.png',
  'header.moonlitAlt': 'moonlit-alt-banner.png',
  'header.creamRibbon': 'cream-ribbon-banner.png',
  'header.plumWindowAlt': 'plum-window-alt-banner.png',
  'header.starfield': 'starfield-banner.png',
  'header.scalloped': 'scalloped-cream-banner.png',
  'divider.sparkle': 'lavender-sparkle-divider.png',
  'divider.diamonds': 'lavender-diamond-divider.png',
  'divider.twinkles': 'pastel-twinkle-divider.png',
  'divider.crescent': 'lavender-crescent-divider.png',
  'divider.moth': 'divider.png',
  'footer.starfield': 'starfield-footer.png',
  'footer.scalloped': 'scalloped-footer.png',
  'icon.rules': 'open-book-icon.png',
  'icon.faq': 'question-bubble-icon.png',
  'icon.announcements': 'megaphone-icon.png',
  'icon.services': 'star-terminal-icon.png',
  'icon.support': 'heart-envelope-icon.png',
  'icon.commissions': 'pencil-and-paper-icon.png',
  'icon.pricing': 'sparkle-price-tag-icon.png',
  'icon.portfolio': 'framed-moon-icon.png',
  'icon.botFeatures': 'moth-bot-icon.png',
  'icon.updates': 'star-floppy-disk-icon.png',
  'status.open': 'star-lantern-icon.png',
  'status.waitlist': 'hourglass-icon.png',
  'status.closed': 'padlock-icon.png',
  'frame.portfolioBrowser': 'portfolio-browser-frame.png',
};

const directory = path.join(__dirname, '..', '..', 'assets', 'moth-embed-kit');
const artwork = new Map(Object.values(filenames).map((name) => [name, path.join(directory, name)]));

function art(key) {
  const name = filenames[key];
  const file = artwork.get(name);
  return file && existsSync(file) ? `attachment://${name}` : undefined;
}

const availableArtwork = () => new Map([...artwork].filter(([, file]) => existsSync(file)));

function attachmentNames(embeds) {
  const names = new Set();
  for (const embed of embeds ?? []) {
    const { image, thumbnail, author, footer } = embed.data ?? embed;
    for (const url of [image?.url, thumbnail?.url, author?.icon_url, footer?.icon_url]) {
      if (url?.startsWith('attachment://')) names.add(url.slice('attachment://'.length));
    }
  }
  return names;
}

module.exports = { art, artwork, availableArtwork, attachmentNames };
