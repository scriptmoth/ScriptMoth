const { createHash } = require('node:crypto');
const { join } = require('node:path');

const fontfile = join(__dirname, '..', '..', 'assets', 'fonts', 'BricolageGrotesque-Bold.ttf');
const cream = '#fbe8cc';
const plum = '#392436';
// Each template reserves a central area clear of its frame and corner art.
const templates = new Map([
  ['golden-star-banner.png', { color: plum, width: 680, height: 108 }],
  ['retro-window-banner.png', { color: cream, width: 740, height: 154, offset: 14 }],
  ['crescent-night-banner.png', { color: cream, width: 680, height: 130 }],
  ['moonlit-alt-banner.png', { color: cream, width: 680, height: 108 }],
  ['cream-ribbon-banner.png', { color: plum, width: 640, height: 108 }],
  ['plum-window-alt-banner.png', { color: cream, width: 680, height: 108 }],
  ['starfield-banner.png', { color: cream, width: 660, height: 146 }],
  ['scalloped-cream-banner.png', { color: plum, width: 740, height: 100 }],
]);
const renderedBanner = /^title-banner-[a-f0-9]{24}\.png$/;
const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function wrapTitle(title) {
  const characters = [...graphemes.segment(title)];
  const middle = characters.length / 2;
  const breaks = characters.flatMap(({ segment }, index) => segment === ' ' ? [index] : []);
  const nearestSpace = breaks.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))[0];
  const split = nearestSpace ?? Math.floor(middle);
  return title.slice(0, characters[split].index).trim() + '\n' + title.slice(characters[split].index).trim();
}

async function renderBanner(name, template, title) {
  if (!template || !title?.trim()) return;
  const layout = templates.get(name);
  try {
    const sharp = require('sharp');
    const { width, height } = await sharp(template).metadata();
    const maxWidth = Math.min(layout.width, Math.floor(width * 0.8));
    const maxHeight = Math.min(layout.height, Math.floor(height * 0.72));
    const text = title.trim().replace(/\s+/gu, ' ');
    const rasterize = (value, size) => sharp({ text: {
      text: `<span foreground="${layout.color}">${value.replace(/[&<>]/g, (char) => entities[char])}</span>`,
      font: `Bricolage Grotesque Bold ${size}`,
      fontfile,
      align: 'centre',
      spacing: Math.round(size * 0.08),
      rgba: true,
    } }).png().toBuffer({ resolveWithObject: true });

    let lettering = await rasterize(text, 62);
    if (lettering.info.width > maxWidth || lettering.info.height > maxHeight) {
      const wrapped = wrapTitle(text);
      for (let size = 56; size >= 28; size -= 4) {
        lettering = await rasterize(wrapped, size);
        if (lettering.info.width <= maxWidth && lettering.info.height <= maxHeight) break;
      }
    }
    if (lettering.info.width > maxWidth || lettering.info.height > maxHeight) return;

    const attachment = await sharp(template).composite([{
      input: lettering.data,
      left: Math.floor((width - lettering.info.width) / 2),
      top: Math.floor((height - lettering.info.height) / 2) + (layout.offset ?? 0),
    }]).png().toBuffer();
    const hash = createHash('sha256').update(attachment).digest('hex').slice(0, 24);
    return { name: `title-banner-${hash}.png`, attachment };
  } catch {
    // The content card still carries the native title and divider.
    return undefined;
  }
}

module.exports = { templates, renderedBanner, renderBanner };
