/**
 * Draws the art set for every embed design: a header banner, a divider strip, and a thumbnail.
 *
 *   node --experimental-strip-types scripts/draw-discord-embed-art.mjs          (all designs)
 *   node --experimental-strip-types scripts/draw-discord-embed-art.mjs E04A E06B (only these)
 *
 * Art is original vector work rendered to WebP with sharp, so every file can be uploaded to Discord.
 * Each design gets its own scene: the family sets the scene type, and the design's color, motif,
 * letter, and a seed from its code change the palette, layout, and decorations.
 * Files listed in PAINTED are hand-made art and are never overwritten.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { embedStyles } from "../src/demos/discord/discord-embeds.ts";

const OUT = new URL("../public/assets/discord/embeds/", import.meta.url);
const PAINTED = new Set(["E01A-banner", "E01A-thumbnail", "E01A-footer", "E02A-banner", "E02A-thumbnail"]);
const W = 960, H = 240;

/* ───────────── Random & color ───────────── */

function seeded(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function toHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min, s = l > .5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}
const hsl = (h, s, l, a = 1) => `hsla(${((h % 360) + 360) % 360.0} ${Math.max(0, Math.min(100, s)).toFixed(1)}% ${Math.max(0, Math.min(100, l)).toFixed(1)}% / ${a})`;

function palette(style, rand) {
  const [h, s] = toHsl(style.color);
  const sat = Math.max(s, 18);
  const shift = [25, 40, 160, 200, -35, -60][Math.floor(rand() * 6)];
  return {
    h, s: sat,
    base: style.color,
    pale: hsl(h, sat * .8, 95), light: hsl(h, sat * .85, 84), soft: hsl(h, sat, 72),
    mid: hsl(h, sat, 58), deep: hsl(h, sat * .75, 30), dark: hsl(h, sat * .6, 15), ink: hsl(h, 35, 12),
    accent: hsl(h + shift, Math.min(sat + 10, 85), 66), accentDeep: hsl(h + shift, Math.min(sat + 5, 70), 38),
    gold: "#E9C46A", goldDeep: "#A8792E", white: "#FFFFFF",
  };
}

/* ───────────── Motifs (drawn in a 100×100 box) ───────────── */

const star = (points, outer, inner, cx = 50, cy = 50) => "M" + Array.from({ length: points * 2 }, (_, i) => {
  const r = i % 2 ? inner : outer, a = (Math.PI / points) * i - Math.PI / 2;
  return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
}).join(" L") + "Z";
const petals = (n, r, pr, fill, cx = 50, cy = 50) => Array.from({ length: n }, (_, i) => {
  const a = (Math.PI * 2 / n) * i - Math.PI / 2;
  return `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${pr}" fill="${fill}"/>`;
}).join("");

/** Each motif takes colors { f: fill, s: outline, a: accent, w: highlight } and returns SVG in a 100 box. */
const M = {
  heart: c => `<path d="M50 88C20 66 6 50 6 32 6 18 17 8 30 8c10 0 16 6 20 14 4-8 10-14 20-14 13 0 24 10 24 24 0 18-14 34-44 56Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><ellipse cx="28" cy="28" rx="8" ry="5" fill="${c.w}" opacity=".7" transform="rotate(-30 28 28)"/>`,
  star: c => `<path d="${star(5, 46, 20)}" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><circle cx="40" cy="40" r="5" fill="${c.w}" opacity=".7"/>`,
  sparkle: c => `<path d="M50 2C54 36 64 46 98 50 64 54 54 64 50 98 46 64 36 54 2 50 36 46 46 36 50 2Z" fill="${c.f}" stroke="${c.s}" stroke-width="3"/>`,
  moon: c => `<path d="M62 6A44 44 0 1 0 94 64 36 36 0 1 1 62 6Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="34" cy="60" r="5" fill="${c.s}" opacity=".25"/><circle cx="46" cy="78" r="3" fill="${c.s}" opacity=".25"/>`,
  fullmoon: c => `<circle cx="50" cy="50" r="44" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="36" cy="38" r="8" fill="${c.s}" opacity=".2"/><circle cx="62" cy="62" r="11" fill="${c.s}" opacity=".18"/><circle cx="64" cy="32" r="5" fill="${c.s}" opacity=".2"/>`,
  flower: c => `${petals(5, 24, 18, c.f)}<circle cx="50" cy="50" r="14" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>`,
  daisy: c => `${petals(10, 28, 11, c.w)}<circle cx="50" cy="50" r="16" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>`,
  blossom: c => `${Array.from({ length: 5 }, (_, i) => `<path d="M50 50C34 34 36 10 50 14 64 10 66 34 50 50Z" fill="${c.f}" stroke="${c.s}" stroke-width="3" transform="rotate(${i * 72} 50 50)"/>`).join("")}<circle cx="50" cy="50" r="8" fill="${c.a}"/>`,
  tulip: c => `<path d="M48 92C48 70 50 60 50 56" stroke="${c.s}" stroke-width="5" fill="none"/><path d="M50 74C36 60 26 70 22 76 34 80 44 78 50 74Z" fill="#7BA05B"/><path d="M26 22 38 36 50 16 62 36 74 22C78 46 70 62 50 62 30 62 22 46 26 22Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/>`,
  leaf: c => `<path d="M10 90C10 40 40 10 90 10 90 60 60 90 10 90Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M14 86 80 20" stroke="${c.s}" stroke-width="4" opacity=".6"/>`,
  maple: c => `<path d="${star(7, 46, 22)}" fill="${c.f}" stroke="${c.s}" stroke-width="4" stroke-linejoin="round"/><path d="M50 50V96" stroke="${c.s}" stroke-width="5"/>`,
  pine: c => `<path d="M50 6 76 40H62L84 68H58V92H42V68H16L38 40H24Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/>`,
  mushroom: c => `<rect x="38" y="50" width="24" height="40" rx="10" fill="${c.w}" stroke="${c.s}" stroke-width="5"/><path d="M6 56C6 26 26 10 50 10S94 26 94 56Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="32" cy="34" r="7" fill="${c.w}"/><circle cx="62" cy="26" r="5" fill="${c.w}"/><circle cx="72" cy="44" r="6" fill="${c.w}"/>`,
  bow: c => `<path d="M50 50 10 24C4 22 4 78 10 76Z M50 50 90 24C96 22 96 78 90 76Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M44 54 30 94 42 88 50 96 56 56Z M56 54 70 94 58 88 50 96Z" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><circle cx="50" cy="50" r="12" fill="${c.a}" stroke="${c.s}" stroke-width="5"/>`,
  key: c => `<circle cx="50" cy="24" r="18" fill="none" stroke="${c.f}" stroke-width="10"/><rect x="45" y="40" width="10" height="54" rx="3" fill="${c.f}"/><rect x="55" y="70" width="16" height="8" fill="${c.f}"/><rect x="55" y="84" width="12" height="8" fill="${c.f}"/><circle cx="50" cy="24" r="6" fill="${c.a}"/>`,
  crown: c => `<path d="M8 80 12 26 32 50 50 14 68 50 88 26 92 80Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><rect x="8" y="78" width="84" height="12" rx="3" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="50" cy="62" r="7" fill="${c.a}"/><circle cx="28" cy="66" r="5" fill="${c.a}"/><circle cx="72" cy="66" r="5" fill="${c.a}"/>`,
  candle: c => `<path d="M50 6C60 20 62 30 50 38 38 30 40 20 50 6Z" fill="#FFC857" stroke="${c.s}" stroke-width="3"/><rect x="32" y="40" width="36" height="54" rx="4" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M32 52C40 52 40 62 46 62S52 50 68 50" fill="none" stroke="${c.w}" stroke-width="4" opacity=".7"/>`,
  rose: c => `<path d="M50 96V64" stroke="#5E8C4A" stroke-width="5"/><path d="M50 78C34 70 28 80 26 86 38 88 46 84 50 78Z" fill="#5E8C4A"/><circle cx="50" cy="40" r="32" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M50 40c6-6 14 0 10 8s-18 10-24 0 2-24 16-24 26 12 22 26" fill="none" stroke="${c.s}" stroke-width="4" stroke-linecap="round"/>`,
  gem: c => `<path d="M20 36 34 14H66L80 36 50 90Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M20 36H80M34 14 42 36 50 90 58 36 66 14" fill="none" stroke="${c.s}" stroke-width="3"/><path d="M38 18 44 32" stroke="${c.w}" stroke-width="4" opacity=".8"/>`,
  shell: c => `<path d="M50 90 10 40C20 14 80 14 90 40Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/>${[26, 38, 50, 62, 74].map(x => `<path d="M50 88 ${x} 24" stroke="${c.s}" stroke-width="3" opacity=".6"/>`).join("")}`,
  cloud: c => `<path d="M24 76C10 76 6 62 14 54 8 40 24 30 34 36 38 20 62 18 68 34 82 30 94 44 86 56 96 64 88 78 76 76Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/>`,
  sun: c => `${Array.from({ length: 12 }, (_, i) => `<rect x="47" y="2" width="6" height="16" rx="3" fill="${c.a}" transform="rotate(${i * 30} 50 50)"/>`).join("")}<circle cx="50" cy="50" r="26" fill="${c.f}" stroke="${c.s}" stroke-width="5"/>`,
  butterfly: c => `<ellipse cx="30" cy="34" rx="22" ry="26" fill="${c.f}" stroke="${c.s}" stroke-width="4" transform="rotate(-20 30 34)"/><ellipse cx="70" cy="34" rx="22" ry="26" fill="${c.f}" stroke="${c.s}" stroke-width="4" transform="rotate(20 70 34)"/><ellipse cx="34" cy="70" rx="15" ry="18" fill="${c.a}" stroke="${c.s}" stroke-width="4"/><ellipse cx="66" cy="70" rx="15" ry="18" fill="${c.a}" stroke="${c.s}" stroke-width="4"/><rect x="46" y="22" width="8" height="64" rx="4" fill="${c.s}"/>`,
  moth: c => `<path d="M50 30C30 6 2 14 6 40 10 60 34 58 50 50 66 58 90 60 94 40 98 14 70 6 50 30Z" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><path d="M50 50C38 66 26 86 36 92 46 96 50 74 50 62 50 74 54 96 64 92 74 86 62 66 50 50Z" fill="${c.a}" stroke="${c.s}" stroke-width="4"/><circle cx="26" cy="34" r="7" fill="${c.w}" opacity=".8"/><circle cx="74" cy="34" r="7" fill="${c.w}" opacity=".8"/><rect x="46" y="26" width="8" height="40" rx="4" fill="${c.s}"/>`,
  feather: c => `<path d="M80 6C40 14 18 48 20 90 50 80 86 52 80 6Z" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><path d="M14 96C34 60 56 34 78 10" stroke="${c.s}" stroke-width="4" fill="none"/>`,
  book: c => `<path d="M50 24C38 14 18 14 6 20V86C18 80 38 80 50 90 62 80 82 80 94 86V20C82 14 62 14 50 24Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M50 24V90" stroke="${c.s}" stroke-width="4"/>${[36, 48, 60].map(y => `<path d="M16 ${y}C26 ${y - 4} 36 ${y - 4} 42 ${y}M58 ${y}C64 ${y - 4} 74 ${y - 4} 84 ${y}" stroke="${c.s}" stroke-width="3" opacity=".5" fill="none"/>`).join("")}`,
  scroll: c => `<rect x="18" y="18" width="64" height="64" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="10" y="10" width="80" height="14" rx="7" fill="${c.a}" stroke="${c.s}" stroke-width="5"/><rect x="10" y="76" width="80" height="14" rx="7" fill="${c.a}" stroke="${c.s}" stroke-width="5"/>${[36, 48, 60].map(y => `<path d="M30 ${y}H70" stroke="${c.s}" stroke-width="3" opacity=".5"/>`).join("")}`,
  bell: c => `<path d="M50 10C30 10 22 30 22 50V68L12 80H88L78 68V50C78 30 70 10 50 10Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="88" r="8" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>`,
  potion: c => `<rect x="40" y="6" width="20" height="10" rx="3" fill="${c.a}" stroke="${c.s}" stroke-width="4"/><path d="M42 16V34C24 40 14 54 14 66 14 84 30 94 50 94S86 84 86 66C86 54 76 40 58 34V16Z" fill="${c.w}" stroke="${c.s}" stroke-width="5"/><path d="M17 62C30 56 40 68 50 62S70 54 83 62C84 80 70 90 50 90S16 80 17 62Z" fill="${c.f}"/><circle cx="40" cy="72" r="4" fill="${c.w}" opacity=".7"/>`,
  ticket: c => `<path d="M6 28H94V42A8 8 0 0 0 94 58V72H6V58A8 8 0 0 0 6 42Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M68 30V70" stroke="${c.s}" stroke-width="3" stroke-dasharray="5 5"/><path d="${star(5, 12, 5, 38, 50)}" fill="${c.a}"/>`,
  envelope: c => `<rect x="8" y="22" width="84" height="58" rx="6" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M10 26 50 56 90 26" fill="none" stroke="${c.s}" stroke-width="5"/><path d="M50 66C42 60 40 56 40 53 40 50 42 48 45 48 47 48 49 49 50 51 51 49 53 48 55 48 58 48 60 50 60 53 60 56 58 60 50 66Z" fill="${c.a}"/>`,
  camera: c => `<rect x="8" y="26" width="84" height="58" rx="10" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="30" y="16" width="26" height="12" rx="3" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="50" cy="56" r="18" fill="${c.a}" stroke="${c.s}" stroke-width="5"/><circle cx="44" cy="50" r="5" fill="${c.w}"/>`,
  note: c => `<path d="M38 74V18L82 8V64" fill="none" stroke="${c.s}" stroke-width="7" stroke-linejoin="round"/><ellipse cx="28" cy="76" rx="14" ry="11" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><ellipse cx="72" cy="66" rx="14" ry="11" fill="${c.f}" stroke="${c.s}" stroke-width="4"/>`,
  sword: c => `<path d="M50 4 58 16V66H42V16Z" fill="${c.w}" stroke="${c.s}" stroke-width="4"/><rect x="24" y="64" width="52" height="9" rx="4" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><rect x="45" y="72" width="10" height="16" fill="${c.a}"/><circle cx="50" cy="92" r="6" fill="${c.f}" stroke="${c.s}" stroke-width="3"/>`,
  shield: c => `<path d="M50 6 88 20C88 56 74 80 50 94 26 80 12 56 12 20Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M50 16V84M22 40H78" stroke="${c.a}" stroke-width="8"/>`,
  cup: c => `<path d="M14 36H74V54C74 74 60 86 44 86S14 74 14 54Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M74 44C92 44 92 66 72 66" fill="none" stroke="${c.s}" stroke-width="5"/><path d="M34 26C30 18 40 16 36 6M50 26C46 18 56 16 52 6" stroke="${c.s}" stroke-width="3" fill="none" opacity=".6"/><rect x="6" y="86" width="76" height="6" rx="3" fill="${c.s}"/>`,
  strawberry: c => `<path d="M50 94C24 80 10 56 14 38 18 24 34 22 50 28 66 22 82 24 86 38 90 56 76 80 50 94Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M28 24 40 30 50 16 60 30 72 24 64 36H36Z" fill="#6FA35B" stroke="${c.s}" stroke-width="3"/>${[[36, 46], [56, 44], [46, 60], [30, 62], [64, 60], [50, 76], [40, 74], [60, 74]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="${c.w}"/>`).join("")}`,
  cherry: c => `<path d="M34 64C40 40 52 20 70 8M66 60C66 40 68 24 70 8" fill="none" stroke="#5E8C4A" stroke-width="4"/><path d="M70 8C80 12 88 22 86 30 76 30 70 20 70 8Z" fill="#6FA35B"/><circle cx="32" cy="72" r="18" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="68" cy="70" r="18" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="26" cy="66" r="4" fill="${c.w}"/><circle cx="62" cy="64" r="4" fill="${c.w}"/>`,
  candy: c => `<path d="M24 50 4 30V70Z M76 50 96 30V70Z" fill="${c.a}" stroke="${c.s}" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="50" r="27" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M30 38C44 46 56 30 70 40M30 60C44 68 56 52 70 62" stroke="${c.w}" stroke-width="5" fill="none"/>`,
  dango: c => `<path d="M50 4V96" stroke="#B08A57" stroke-width="5"/><circle cx="50" cy="24" r="16" fill="#F7B5C8" stroke="${c.s}" stroke-width="4"/><circle cx="50" cy="52" r="16" fill="${c.w}" stroke="${c.s}" stroke-width="4"/><circle cx="50" cy="80" r="16" fill="#A8CF8E" stroke="${c.s}" stroke-width="4"/>`,
  bunny: c => `<ellipse cx="34" cy="26" rx="10" ry="24" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><ellipse cx="66" cy="26" rx="10" ry="24" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><ellipse cx="34" cy="28" rx="4" ry="14" fill="${c.a}"/><ellipse cx="66" cy="28" rx="4" ry="14" fill="${c.a}"/><ellipse cx="50" cy="64" rx="34" ry="28" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="38" cy="62" r="4" fill="${c.s}"/><circle cx="62" cy="62" r="4" fill="${c.s}"/><path d="M45 72Q50 77 55 72" stroke="${c.s}" stroke-width="3" fill="none"/><circle cx="30" cy="72" r="5" fill="${c.a}" opacity=".7"/><circle cx="70" cy="72" r="5" fill="${c.a}" opacity=".7"/>`,
  bear: c => `<circle cx="22" cy="26" r="14" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="78" cy="26" r="14" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="50" cy="56" r="38" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><ellipse cx="50" cy="68" rx="16" ry="12" fill="${c.w}"/><circle cx="36" cy="50" r="4" fill="${c.s}"/><circle cx="64" cy="50" r="4" fill="${c.s}"/><ellipse cx="50" cy="63" rx="5" ry="4" fill="${c.s}"/>`,
  bottle: c => `<rect x="38" y="6" width="24" height="12" rx="3" fill="${c.a}" stroke="${c.s}" stroke-width="4"/><path d="M36 18H64V30L74 42V90H26V42L36 30Z" fill="${c.w}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><rect x="26" y="52" width="48" height="24" fill="${c.f}"/><path d="M42 64C42 58 50 58 50 64 50 58 58 58 58 64 58 70 50 74 50 74S42 70 42 64Z" fill="${c.w}"/>`,
  juice: c => `<path d="M62 4 70 20" stroke="${c.s}" stroke-width="5"/><rect x="24" y="20" width="52" height="74" rx="6" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M24 34H76" stroke="${c.s}" stroke-width="4"/><circle cx="50" cy="62" r="14" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>`,
  peach: c => `<path d="M50 92C22 92 8 72 10 52 12 32 30 22 50 30 70 22 88 32 90 52 92 72 78 92 50 92Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M50 32C44 46 44 62 50 90" stroke="${c.s}" stroke-width="3" fill="none" opacity=".5"/><path d="M50 30C54 14 70 8 82 14 74 26 62 30 50 30Z" fill="#6FA35B" stroke="${c.s}" stroke-width="3"/>`,
  croissant: c => `<path d="M8 70C10 40 34 22 50 22S90 40 92 70C80 60 70 58 62 62 58 52 54 48 50 48S42 52 38 62C30 58 20 60 8 70Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M30 34 38 60M50 26V48M70 34 62 60" stroke="${c.s}" stroke-width="3" opacity=".5"/>`,
  mask: c => `<path d="M10 14C30 6 70 6 90 14 92 52 78 86 50 92 22 86 8 52 10 14Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M24 38Q34 30 42 40M58 40Q66 30 76 38" stroke="${c.s}" stroke-width="5" fill="none"/><path d="M32 62Q50 80 68 62" stroke="${c.s}" stroke-width="5" fill="${c.a}"/>`,
  arch: c => `<path d="M14 94V44C14 22 30 6 50 6S86 22 86 44V94Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M50 8V94M14 50H86" stroke="${c.s}" stroke-width="4"/><circle cx="50" cy="30" r="10" fill="${c.a}" stroke="${c.s}" stroke-width="3"/>`,
  mirror: c => `<ellipse cx="50" cy="46" rx="32" ry="40" fill="${c.a}" stroke="${c.f}" stroke-width="10"/><path d="M34 26 44 18M30 40 52 20" stroke="${c.w}" stroke-width="4" opacity=".8"/><rect x="44" y="84" width="12" height="14" fill="${c.f}"/>`,
  swan: c => `<path d="M28 92C10 84 8 62 26 56 44 52 58 64 72 60 66 46 54 38 56 22 58 8 76 6 80 18L92 20 80 26C72 30 70 40 78 52 90 70 76 92 28 92Z" fill="${c.w}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><circle cx="72" cy="16" r="3" fill="${c.s}"/><path d="M26 72C40 66 52 70 60 78" stroke="${c.a}" stroke-width="4" fill="none"/>`,
  fleur: c => `<path d="M50 6C38 22 40 40 50 54 60 40 62 22 50 6ZM50 54C40 36 18 30 10 44 4 56 18 66 28 58 20 50 30 44 40 54ZM50 54C60 36 82 30 90 44 96 56 82 66 72 58 80 50 70 44 60 54Z" fill="${c.f}" stroke="${c.s}" stroke-width="4" stroke-linejoin="round"/><rect x="30" y="56" width="40" height="10" rx="3" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><path d="M44 66 40 94H60L56 66Z" fill="${c.f}" stroke="${c.s}" stroke-width="4"/>`,
  honeycomb: c => [[30, 34], [70, 34], [50, 68], [10, 68], [90, 68]].map(([x, y], i) => `<path d="${hexagon(x, y, 20)}" fill="${i % 2 ? c.f : c.a}" stroke="${c.s}" stroke-width="4"/>`).join(""),
  stone: c => `<path d="M10 80C6 60 20 40 40 40 50 24 76 26 84 44 96 50 96 76 84 84Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M26 60C34 54 44 56 48 62M60 50C68 46 76 50 78 56" stroke="${c.s}" stroke-width="3" opacity=".4" fill="none"/><path d="M20 82C30 74 40 76 44 82" stroke="#7BA05B" stroke-width="6" fill="none"/>`,
  galaxy: c => `<path d="M50 50m-6 0a6 6 0 1 1 12 0 16 16 0 1 1-32 0 26 26 0 1 1 52 0 36 36 0 1 1-72 0" fill="none" stroke="${c.f}" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="50" r="6" fill="${c.w}"/>`,
  wand: c => `<path d="M14 90 60 44" stroke="${c.s}" stroke-width="9" stroke-linecap="round"/><path d="M14 90 60 44" stroke="${c.f}" stroke-width="5" stroke-linecap="round"/><path d="${star(5, 22, 9, 70, 32)}" fill="${c.a}" stroke="${c.s}" stroke-width="4" stroke-linejoin="round"/>`,
  orb: c => `<path d="M24 92 32 76H68L76 92Z" fill="${c.a}" stroke="${c.s}" stroke-width="5"/><circle cx="50" cy="44" r="36" fill="${c.f}" stroke="${c.s}" stroke-width="5" opacity=".95"/><path d="M30 34C34 24 42 18 52 16" stroke="${c.w}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${star(4, 10, 3, 58, 50)}" fill="${c.w}"/>`,
  planet: c => `<circle cx="50" cy="50" r="28" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><ellipse cx="50" cy="52" rx="48" ry="14" fill="none" stroke="${c.a}" stroke-width="6" transform="rotate(-18 50 50)"/><path d="M28 40Q50 34 72 40" stroke="${c.w}" stroke-width="4" opacity=".5" fill="none"/>`,
  flame: c => `<path d="M50 94C24 94 12 74 18 54 22 40 34 34 36 16 52 26 54 40 52 50 60 44 62 34 60 26 80 40 88 60 82 74 76 88 64 94 50 94Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M50 90C38 90 34 80 38 70 42 62 48 60 50 50 60 62 64 74 60 82 58 88 54 90 50 90Z" fill="${c.a}"/>`,
  quill: c => `<path d="M88 6C54 10 30 40 26 74L34 76C44 50 62 30 88 6Z" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><path d="M26 74 14 94 34 76" fill="${c.s}"/>`,
  frame: c => `<rect x="8" y="12" width="84" height="76" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="20" y="24" width="60" height="52" fill="${c.a}" stroke="${c.s}" stroke-width="3"/><path d="M20 70 40 48 54 62 64 52 80 70Z" fill="${c.w}" opacity=".7"/><circle cx="64" cy="36" r="6" fill="${c.w}" opacity=".8"/>`,
  cabinet: c => `<rect x="14" y="8" width="72" height="86" rx="4" fill="${c.f}" stroke="${c.s}" stroke-width="5"/>${[12, 40, 68].map(y => `<rect x="22" y="${y + 4}" width="56" height="20" rx="2" fill="${c.a}" stroke="${c.s}" stroke-width="3"/><rect x="42" y="${y + 11}" width="16" height="5" rx="2" fill="${c.s}"/>`).join("")}`,
  monitor: c => `<rect x="6" y="10" width="88" height="62" rx="6" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="14" y="18" width="72" height="46" fill="${c.ink}"/><path d="M22 30 32 38 22 46M38 48H56" stroke="${c.a}" stroke-width="4" fill="none"/><path d="M40 72 36 88H64L60 72Z" fill="${c.f}" stroke="${c.s}" stroke-width="4"/>`,
  cassette: c => `<rect x="6" y="20" width="88" height="60" rx="6" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="18" y="30" width="64" height="26" rx="4" fill="${c.w}" stroke="${c.s}" stroke-width="3"/><circle cx="34" cy="43" r="7" fill="${c.s}"/><circle cx="66" cy="43" r="7" fill="${c.s}"/><path d="M24 80 30 66H70L76 80" fill="${c.a}" stroke="${c.s}" stroke-width="3"/>`,
  joystick: c => `<rect x="10" y="62" width="80" height="28" rx="8" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="45" y="30" width="10" height="34" fill="${c.s}"/><circle cx="50" cy="26" r="16" fill="${c.a}" stroke="${c.s}" stroke-width="5"/><circle cx="74" cy="76" r="6" fill="${c.a}"/>`,
  invader: c => pixels(["  X     X  ", "   X   X   ", "  XXXXXXX  ", " XX XXX XX ", "XXXXXXXXXXX", "X XXXXXXX X", "X X     X X", "   XX XX   "], c.f, 9, 1, 14),
  pixelheart: c => pixels([" XX   XX ", "XXXX XXXX", "XXXXXXXXX", "XXXXXXXXX", " XXXXXXX ", "  XXXXX  ", "   XXX   ", "    X    "], c.f, 11, 0, 6),
  bolt: c => `<path d="M58 4 18 56H46L38 96 82 40H54Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/>`,
  tv: c => `<path d="M34 6 50 22 66 6" stroke="${c.s}" stroke-width="4" fill="none"/><rect x="6" y="22" width="88" height="66" rx="10" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="14" y="30" width="58" height="50" rx="6" fill="${c.ink}"/>${[34, 44, 54, 64, 74].map(y => `<rect x="14" y="${y}" width="58" height="3" fill="${c.a}" opacity=".5"/>`).join("")}<circle cx="83" cy="42" r="5" fill="${c.a}"/><circle cx="83" cy="60" r="5" fill="${c.a}"/>`,
  floppy: c => `<path d="M8 8H80L92 20V92H8Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><rect x="24" y="8" width="44" height="26" fill="${c.w}" stroke="${c.s}" stroke-width="4"/><rect x="52" y="12" width="10" height="18" fill="${c.s}"/><rect x="20" y="50" width="60" height="42" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>`,
  radio: c => `<path d="M24 30 70 6" stroke="${c.s}" stroke-width="4"/><rect x="6" y="30" width="88" height="60" rx="8" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="32" cy="60" r="16" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>${[44, 54, 64, 74].map(y => `<rect x="56" y="${y}" width="28" height="4" rx="2" fill="${c.s}"/>`).join("")}`,
  satellite: c => `<rect x="38" y="38" width="24" height="24" rx="3" fill="${c.f}" stroke="${c.s}" stroke-width="4" transform="rotate(45 50 50)"/><rect x="4" y="42" width="30" height="16" fill="${c.a}" stroke="${c.s}" stroke-width="3"/><rect x="66" y="42" width="30" height="16" fill="${c.a}" stroke="${c.s}" stroke-width="3"/><path d="M50 30V14" stroke="${c.s}" stroke-width="4"/><circle cx="50" cy="12" r="5" fill="${c.f}"/>`,
  page: c => `<path d="M16 6H64L84 26V94H16Z" fill="${c.w}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M64 6V26H84" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>${[40, 52, 64, 76].map(y => `<path d="M28 ${y}H72" stroke="${c.f}" stroke-width="5" stroke-linecap="round"/>`).join("")}`,
  pin: c => `<circle cx="50" cy="30" r="24" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M50 54V94" stroke="${c.s}" stroke-width="5"/><circle cx="42" cy="22" r="6" fill="${c.w}" opacity=".7"/>`,
  clipboard: c => `<rect x="14" y="12" width="72" height="84" rx="6" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="34" y="4" width="32" height="16" rx="4" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>${[40, 56, 72].map(y => `<path d="M26 ${y}l5 5 9-9M48 ${y}H74" stroke="${c.w}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}`,
  bubble: c => `<path d="M14 14H86A8 8 0 0 1 94 22V66A8 8 0 0 1 86 74H40L18 92V74H14A8 8 0 0 1 6 66V22A8 8 0 0 1 14 14Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><circle cx="30" cy="44" r="6" fill="${c.w}"/><circle cx="50" cy="44" r="6" fill="${c.w}"/><circle cx="70" cy="44" r="6" fill="${c.w}"/>`,
  thought: c => `<path d="M26 64C10 64 6 46 18 40 14 24 34 16 44 26 54 10 80 16 80 32 96 34 96 58 80 60 76 70 62 70 56 64Z" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><circle cx="24" cy="80" r="7" fill="${c.f}" stroke="${c.s}" stroke-width="4"/><circle cx="12" cy="94" r="4" fill="${c.f}" stroke="${c.s}" stroke-width="3"/>`,
  pencil: c => `<path d="M70 8 92 30 34 88 8 94 14 66Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M14 66 34 88" stroke="${c.s}" stroke-width="4"/><path d="M62 16 84 38" stroke="${c.a}" stroke-width="8"/>`,
  folder: c => `<path d="M6 22H40L48 30H94V86H6Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M6 40H94" stroke="${c.s}" stroke-width="4"/>`,
  gamepad: c => `<path d="M22 28H78C92 28 98 50 96 66 94 82 80 84 72 72L66 64H34L28 72C20 84 6 82 4 66 2 50 8 28 22 28Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M26 40V56M18 48H34" stroke="${c.w}" stroke-width="6"/><circle cx="70" cy="42" r="5" fill="${c.a}"/><circle cx="80" cy="52" r="5" fill="${c.a}"/>`,
  burst: c => `<path d="${star(12, 48, 30)}" fill="${c.f}" stroke="${c.s}" stroke-width="4" stroke-linejoin="round"/><path d="${star(12, 30, 18)}" fill="${c.a}"/>`,
  school: c => `<path d="M50 6V24" stroke="${c.s}" stroke-width="4"/><path d="M50 6H70L64 12 70 18H50" fill="${c.a}"/><path d="M10 50 50 24 90 50Z" fill="${c.a}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><rect x="18" y="50" width="64" height="44" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="42" y="68" width="16" height="26" fill="${c.s}"/><circle cx="50" cy="40" r="5" fill="${c.w}"/>`,
  backpack: c => `<path d="M36 18C36 6 64 6 64 18" stroke="${c.s}" stroke-width="5" fill="none"/><rect x="16" y="16" width="68" height="78" rx="18" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="28" y="56" width="44" height="28" rx="6" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>`,
  oni: c => `<path d="M24 30 16 6 38 22M76 30 84 6 62 22" fill="${c.w}" stroke="${c.s}" stroke-width="4"/><circle cx="50" cy="56" r="38" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M28 46 42 52M72 46 58 52" stroke="${c.s}" stroke-width="5"/><path d="M30 70H70L64 80H36Z" fill="${c.w}" stroke="${c.s}" stroke-width="4"/>`,
  film: c => `<rect x="10" y="10" width="80" height="80" rx="4" fill="${c.s}"/>${[16, 34, 52, 70].map(y => `<rect x="14" y="${y}" width="8" height="10" fill="${c.w}"/><rect x="78" y="${y}" width="8" height="10" fill="${c.w}"/>`).join("")}<rect x="28" y="16" width="44" height="30" fill="${c.f}"/><rect x="28" y="54" width="44" height="30" fill="${c.a}"/>`,
  sticky: c => `<path d="M10 10H90V68L68 90H10Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M90 68H68V90" fill="${c.a}" stroke="${c.s}" stroke-width="4"/>${[30, 46, 62].map(y => `<path d="M22 ${y}H74" stroke="${c.s}" stroke-width="4" opacity=".4"/>`).join("")}`,
  calendar: c => `<rect x="8" y="16" width="84" height="76" rx="6" fill="${c.w}" stroke="${c.s}" stroke-width="5"/><rect x="8" y="16" width="84" height="20" rx="6" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><path d="M30 8V24M70 8V24" stroke="${c.s}" stroke-width="6"/>${[0, 1, 2, 3].flatMap(i => [0, 1, 2].map(j => `<rect x="${18 + i * 18}" y="${44 + j * 15}" width="10" height="9" rx="2" fill="${i === 2 && j === 1 ? c.a : c.f}" opacity="${i === 2 && j === 1 ? 1 : .45}"/>`)).join("")}`,
  scissors: c => `<circle cx="26" cy="76" r="14" fill="none" stroke="${c.f}" stroke-width="8"/><circle cx="74" cy="76" r="14" fill="none" stroke="${c.f}" stroke-width="8"/><path d="M34 64 76 6M66 64 24 6" stroke="${c.s}" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="40" r="5" fill="${c.a}"/>`,
  receipt: c => `<path d="M16 6H84V94L76 88 68 94 60 88 52 94 44 88 36 94 28 88 20 94 16 90Z" fill="${c.w}" stroke="${c.s}" stroke-width="4" stroke-linejoin="round"/>${[22, 34, 46, 58].map((y, i) => `<path d="M26 ${y}H${i % 2 ? 60 : 74}" stroke="${c.f}" stroke-width="5" stroke-linecap="round"/>`).join("")}<path d="M26 74H74" stroke="${c.s}" stroke-width="4" stroke-dasharray="4 4"/>`,
  paw: c => `<ellipse cx="50" cy="66" rx="24" ry="20" fill="${c.f}" stroke="${c.s}" stroke-width="4"/>${[[20, 40], [38, 22], [62, 22], [80, 40]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="12" fill="${c.f}" stroke="${c.s}" stroke-width="4"/>`).join("")}`,
  web: c => `${Array.from({ length: 8 }, (_, i) => `<path d="M50 50 ${(50 + 48 * Math.cos(i * Math.PI / 4)).toFixed(1)} ${(50 + 48 * Math.sin(i * Math.PI / 4)).toFixed(1)}" stroke="${c.f}" stroke-width="3"/>`).join("")}${[14, 28, 42].map(r => `<path d="${polygon(8, r)}" fill="none" stroke="${c.f}" stroke-width="3"/>`).join("")}`,
  bracket: c => `<path d="M34 8H14V92H34M66 8H86V92H66" fill="none" stroke="${c.f}" stroke-width="9" stroke-linejoin="round"/><path d="${star(4, 18, 6)}" fill="${c.a}"/>`,
  arrow: c => `<path d="M8 50H80M58 26 84 50 58 74" fill="none" stroke="${c.f}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 34 20 50 8 66" fill="none" stroke="${c.a}" stroke-width="6" stroke-linecap="round"/>`,
  command: c => `<path d="M38 38V24A14 14 0 1 0 24 38H76A14 14 0 1 0 62 24V76A14 14 0 1 0 76 62H24A14 14 0 1 0 38 76Z" fill="none" stroke="${c.f}" stroke-width="7"/>`,
  boxes: c => [[10, 10], [54, 10], [10, 54], [54, 54]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="36" height="36" rx="4" fill="${i % 3 ? c.f : c.a}" stroke="${c.s}" stroke-width="4"/>`).join(""),
  map: c => `<path d="M6 20 34 10 66 20 94 10V80L66 90 34 80 6 90Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/><path d="M34 10V80M66 20V90" stroke="${c.s}" stroke-width="3" opacity=".5"/><path d="M20 66C30 50 46 60 54 44S70 34 76 30" stroke="${c.a}" stroke-width="4" stroke-dasharray="5 5" fill="none"/><path d="M70 24 82 36M82 24 70 36" stroke="#C0504D" stroke-width="5"/>`,
  card: c => `<rect x="18" y="6" width="64" height="88" rx="8" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="26" y="14" width="48" height="72" rx="4" fill="none" stroke="${c.a}" stroke-width="3"/><path d="${star(8, 18, 8)}" fill="${c.a}"/>`,
  weather: c => `<circle cx="36" cy="36" r="22" fill="#FFD166" stroke="${c.s}" stroke-width="4"/><path d="M30 86C14 86 10 72 20 66 18 52 34 46 42 54 50 40 72 42 74 58 90 58 94 80 78 86Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/>`,
  train: c => `<rect x="14" y="10" width="72" height="66" rx="14" fill="${c.f}" stroke="${c.s}" stroke-width="5"/><rect x="24" y="20" width="52" height="24" rx="4" fill="${c.w}" stroke="${c.s}" stroke-width="3"/><circle cx="32" cy="60" r="6" fill="${c.a}"/><circle cx="68" cy="60" r="6" fill="${c.a}"/><path d="M26 76 14 94M74 76 86 94" stroke="${c.s}" stroke-width="5"/>`,
  pan: c => `<circle cx="40" cy="52" r="34" fill="${c.s}"/><circle cx="40" cy="52" r="26" fill="${c.f}"/><path d="M70 64 96 86" stroke="${c.s}" stroke-width="10" stroke-linecap="round"/><ellipse cx="40" cy="52" rx="14" ry="12" fill="${c.w}"/><circle cx="42" cy="52" r="7" fill="#FFC857"/>`,
  phone: c => `<rect x="24" y="4" width="52" height="92" rx="10" fill="${c.s}"/><rect x="29" y="14" width="42" height="70" rx="3" fill="${c.f}"/><rect x="34" y="22" width="32" height="10" rx="3" fill="${c.w}"/><rect x="34" y="38" width="32" height="10" rx="3" fill="${c.a}"/><circle cx="50" cy="90" r="3" fill="${c.w}"/>`,
  columns: c => `<path d="M6 30 50 8 94 30Z" fill="${c.f}" stroke="${c.s}" stroke-width="5" stroke-linejoin="round"/>${[16, 40, 64].map(x => `<rect x="${x}" y="34" width="18" height="50" fill="${c.w}" stroke="${c.s}" stroke-width="4"/>`).join("")}<rect x="6" y="84" width="88" height="10" fill="${c.f}" stroke="${c.s}" stroke-width="5"/>`,
  spool: c => `<rect x="14" y="8" width="72" height="14" rx="4" fill="${c.a}" stroke="${c.s}" stroke-width="4"/><rect x="14" y="78" width="72" height="14" rx="4" fill="${c.a}" stroke="${c.s}" stroke-width="4"/><rect x="24" y="22" width="52" height="56" fill="${c.f}" stroke="${c.s}" stroke-width="4"/>${[30, 40, 50, 60, 70].map(y => `<path d="M24 ${y}H76" stroke="${c.s}" stroke-width="2" opacity=".4"/>`).join("")}<path d="M76 60C92 66 94 86 80 96" stroke="${c.f}" stroke-width="4" fill="none"/>`,
  dish: c => `<ellipse cx="50" cy="56" rx="44" ry="30" fill="${c.w}" stroke="${c.s}" stroke-width="5"/><ellipse cx="50" cy="52" rx="36" ry="22" fill="${c.f}" opacity=".6"/>${[[36, 48, 7], [58, 56, 5], [52, 42, 4], [66, 46, 3], [40, 60, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.a}"/>`).join("")}`,
  dots: c => [[26, 50, 16], [56, 50, 11], [80, 50, 7]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i ? "none" : c.f}" stroke="${c.f}" stroke-width="5"/>`).join(""),
  bars: c => [8, 22, 36, 50, 64, 78].map((x, i) => `<rect x="${x}" y="${20 + Math.abs(i - 2.5) * 10}" width="${4 + i * 2}" height="${60 - Math.abs(i - 2.5) * 20}" fill="${i % 2 ? c.a : c.f}"/>`).join(""),
  rainbow: c => ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B983FF"].map((col, i) => `<path d="M${10 + i * 7} 80A${40 - i * 7} ${40 - i * 7} 0 0 1 ${90 - i * 7} 80" fill="none" stroke="${col}" stroke-width="7"/>`).join("") + `<path d="M4 80C4 70 20 68 24 78M76 78C80 68 96 70 96 80" fill="${c.w}" stroke="${c.s}" stroke-width="3"/>`,
  newspaper: c => `<rect x="8" y="12" width="84" height="76" rx="4" fill="${c.w}" stroke="${c.s}" stroke-width="5"/><rect x="18" y="22" width="64" height="12" fill="${c.f}"/><rect x="18" y="42" width="28" height="36" fill="${c.a}"/>${[44, 54, 64, 74].map(y => `<path d="M54 ${y}H82" stroke="${c.s}" stroke-width="4" opacity=".5"/>`).join("")}`,
  hash: c => `<path d="M38 10 30 90M70 10 62 90M14 34H88M10 66H84" stroke="${c.f}" stroke-width="10" stroke-linecap="round"/>`,
  eye: c => `<path d="M4 50C24 16 76 16 96 50 76 84 24 84 4 50Z" fill="${c.w}" stroke="${c.s}" stroke-width="5"/><circle cx="50" cy="50" r="20" fill="${c.f}"/><circle cx="50" cy="50" r="8" fill="${c.s}"/><circle cx="44" cy="44" r="4" fill="${c.w}"/>`,
  square: c => `<rect x="14" y="14" width="72" height="72" rx="10" fill="none" stroke="${c.f}" stroke-width="8"/><rect x="34" y="34" width="32" height="32" rx="4" fill="${c.a}"/>`,
  ring: c => `<circle cx="50" cy="50" r="38" fill="none" stroke="${c.f}" stroke-width="10"/><circle cx="50" cy="50" r="14" fill="${c.a}"/>`,
};

function hexagon(cx, cy, r) {
  return "M" + Array.from({ length: 6 }, (_, i) => `${(cx + r * Math.cos(Math.PI / 3 * i + Math.PI / 6)).toFixed(1)} ${(cy + r * Math.sin(Math.PI / 3 * i + Math.PI / 6)).toFixed(1)}`).join(" L") + "Z";
}
function polygon(n, r, cx = 50, cy = 50) {
  return "M" + Array.from({ length: n }, (_, i) => `${(cx + r * Math.cos(Math.PI * 2 / n * i)).toFixed(1)} ${(cy + r * Math.sin(Math.PI * 2 / n * i)).toFixed(1)}`).join(" L") + "Z";
}
function pixels(rows, fill, size, x0, y0) {
  return rows.flatMap((row, y) => [...row].map((ch, x) => ch === "X" ? `<rect x="${x0 + x * size}" y="${y0 + y * size}" width="${size}" height="${size}" fill="${fill}"/>` : "")).join("");
}

/** The design's main motif, from its mark emoji. */
const markMotif = {
  "🍓": "strawberry", "🍬": "candy", "🍡": "dango", "🧸": "bear", "🥛": "bottle", "🧃": "juice", "🐰": "bunny", "🍑": "peach", "🥐": "croissant", "🍒": "cherry",
  "🗝️": "key", "🦪": "shell", "👑": "crown", "🎭": "mask", "🎀": "bow", "🪟": "arch", "🪞": "mirror", "🦢": "swan", "💎": "gem", "⚜️": "fleur",
  "🍯": "honeycomb", "🌼": "daisy", "🍄": "mushroom", "🌿": "leaf", "🌷": "tulip", "🐚": "shell", "🍂": "maple", "🌲": "pine", "🌸": "blossom", "🪨": "stone",
  "🌙": "moon", "🌌": "galaxy", "🪄": "wand", "🌕": "fullmoon", "⭐": "star", "🔮": "orb", "🐉": "flame", "✨": "sparkle",
  "📜": "scroll", "📚": "book", "🥀": "rose", "🪶": "feather", "🕯️": "candle", "🔔": "bell", "🗄️": "cabinet", "🖋️": "quill", "🖼️": "frame",
  "💻": "monitor", "📼": "cassette", "🕹️": "joystick", "📟": "monitor", "👾": "invader", "⚡": "bolt", "📺": "tv", "💾": "floppy", "📻": "radio", "🛰️": "satellite",
  "📰": "newspaper", "📌": "pin", "📋": "clipboard", "🔢": "hash", "📄": "page", "💬": "bubble", "✏️": "pencil", "✦": "sparkle", "🗂️": "folder", "◻️": "square",
  "⚔️": "sword", "🎮": "gamepad", "💥": "burst", "🏫": "school", "🎒": "backpack", "👹": "oni", "🌟": "star", "💭": "thought", "🗡️": "sword",
  "💌": "envelope", "🎞️": "film", "📝": "sticky", "📸": "camera", "✎": "pencil", "✉️": "envelope", "🎟️": "ticket", "🗓️": "calendar", "✂️": "scissors", "🧾": "receipt",
  "✧": "sparkle", "═": "bracket", "🐾": "paw", "🦋": "butterfly", "🕸️": "web", "▦": "boxes", "☁️": "cloud", "⌜": "bracket", "➳": "arrow", "⌘": "command",
  "⚗️": "potion", "🗺️": "map", "📇": "card", "🌦️": "weather", "🚂": "train", "🍳": "pan", "🎵": "note", "📱": "phone", "🃏": "card", "🥤": "juice",
  "🏛️": "columns", "🧵": "spool", "🧫": "dish", "⚪": "dots", "▌": "bars", "🌈": "rainbow",
};

/** Small supporting motifs per family, scattered around the main one. */
const familyMotifs = {
  "01": ["heart", "sparkle", "star", "bow", "cherry", "flower"],
  "02": ["sparkle", "fleur", "gem", "star", "crown"],
  "03": ["leaf", "flower", "daisy", "mushroom", "butterfly", "tulip"],
  "04": ["star", "sparkle", "moon", "planet", "orb"],
  "05": ["rose", "candle", "moth", "feather", "key", "moon"],
  "06": ["pixelheart", "bolt", "star", "invader", "sparkle"],
  "07": ["ring", "square", "sparkle", "dots"],
  "08": ["star", "burst", "sword", "shield", "heart", "bolt"],
  "09": ["heart", "star", "flower", "pin", "sticky", "envelope"],
  "10": ["sparkle", "star", "bracket", "heart", "butterfly"],
  "11": ["sparkle", "star", "gem", "leaf", "key"],
  "12": ["ring", "dots", "sparkle", "square", "heart"],
};

function motif(name, x, y, size, colors, rotation = 0, opacity = 1) {
  const draw = M[name] ?? M.sparkle;
  return `<g opacity="${opacity}" transform="translate(${(x - size / 2).toFixed(1)} ${(y - size / 2).toFixed(1)}) rotate(${rotation.toFixed(1)} ${size / 2} ${size / 2}) scale(${(size / 100).toFixed(3)})">${draw(colors)}</g>`;
}

/* ───────────── Scenes ───────────── */

const shadow = `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".35"/></filter><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;

function scatter(rand, count, { x0 = 0, x1 = W, y0 = 0, y1 = H, avoid } = {}) {
  const spots = [];
  for (let tries = 0; spots.length < count && tries < count * 30; tries++) {
    const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0);
    if (avoid && Math.hypot((x - avoid[0]) / 1.6, y - avoid[1]) < avoid[2]) continue;
    if (spots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 46)) continue;
    spots.push([x, y]);
  }
  return spots;
}

function sticker(colorsFor, name, x, y, size, rot = 0) {
  const c = colorsFor;
  return `<g filter="url(#sh)">${motif(name, x, y, size + 14, { f: "#fff", s: "#fff", a: "#fff", w: "#fff" }, rot)}${motif(name, x, y, size, c, rot)}</g>`;
}

/** Banner scenes, one per family. Each returns the inside of a 960×240 SVG. */
const scenes = {
  "01": ({ p, rand, main, side, v }) => {
    const bg = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.pale}"/><stop offset="1" stop-color="${p.light}"/></linearGradient>`;
    const dots = `<pattern id="dt" width="${22 + v * 2}" height="${22 + v * 2}" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="${3 + (v % 3)}" fill="${p.soft}" opacity=".55"/></pattern>`;
    const scallop = Array.from({ length: 25 }, (_, i) => `<circle cx="${i * 40}" cy="${H}" r="26" fill="${p.white}"/>`).join("") + Array.from({ length: 25 }, (_, i) => `<circle cx="${i * 40}" cy="${H + 4}" r="18" fill="${p.soft}"/>`).join("");
    const ribbon = v % 2 ? `<path d="M0 ${110 + v * 4}C240 ${70 + v * 6} 720 ${170 - v * 5} 960 ${100 + v * 3}V${150 + v * 4}C720 ${210 - v * 5} 240 ${120 + v * 6} 0 ${160 + v * 4}Z" fill="${p.mid}" opacity=".55"/>` : `<path d="M0 0H960V36C840 60 760 20 640 40S400 70 320 40 120 30 0 50Z" fill="${p.soft}" opacity=".7"/>`;
    const bits = scatter(rand, 12, { y1: 190, avoid: [480, 110, 140] }).map(([x, y], i) => motif(side[i % side.length], x, y, 22 + rand() * 22, { f: i % 2 ? p.mid : p.accent, s: p.deep, a: p.white, w: p.white }, rand() * 50 - 25, .9)).join("");
    return `<defs>${bg}${dots}${shadow}</defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#dt)"/>${ribbon}${bits}${scallop}
      <circle cx="480" cy="110" r="86" fill="${p.white}" opacity=".85"/><circle cx="480" cy="110" r="76" fill="none" stroke="${p.soft}" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
      ${sticker({ f: p.mid, s: p.deep, a: p.accent, w: p.white }, main, 480, 110, 110, v * 3 - 12)}
      ${motif("bow", 330 + v * 6, 70, 46, { f: p.accent, s: p.deep, a: p.soft, w: p.white }, -15)}${motif("heart", 640 - v * 5, 150, 40, { f: p.soft, s: p.deep, a: p.white, w: p.white }, 12)}`;
  },
  "02": ({ p, rand, main, side, v }) => {
    const bg = `<radialGradient id="bg" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="${p.deep}"/><stop offset="1" stop-color="${p.ink}"/></radialGradient><linearGradient id="gd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.goldDeep}"/><stop offset=".5" stop-color="${p.gold}"/><stop offset="1" stop-color="${p.goldDeep}"/></linearGradient>`;
    const damask = `<pattern id="dm" width="${60 + v * 4}" height="${60 + v * 4}" patternUnits="userSpaceOnUse">${motif(v % 2 ? "fleur" : "sparkle", 30, 30, 26, { f: p.mid, s: p.mid, a: p.mid, w: p.mid }, 0, .16)}</pattern>`;
    const curl = (x, flip) => `<path d="M${x} 120c${flip * 60}-50 ${flip * 140}-50 ${flip * 170} 0c${flip * 20} 34-${flip * 30} 50-${flip * 46} 26-${flip * 12}-18 6-34 22-24" fill="none" stroke="url(#gd)" stroke-width="5" stroke-linecap="round"/><path d="M${x} 120c${flip * 60} 50 ${flip * 140} 50 ${flip * 170} 0" fill="none" stroke="url(#gd)" stroke-width="3" opacity=".7"/>`;
    const sparks = scatter(rand, 9, { avoid: [480, 120, 220] }).map(([x, y]) => motif("sparkle", x, y, 10 + rand() * 14, { f: p.gold, s: p.gold, a: p.gold, w: p.gold }, 0, .8)).join("");
    return `<defs>${bg}${damask}${shadow}</defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#dm)"/>
      <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="${v % 3 === 0 ? 0 : 18}" fill="none" stroke="url(#gd)" stroke-width="4"/><rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="${v % 3 === 0 ? 0 : 12}" fill="none" stroke="url(#gd)" stroke-width="1.5"/>
      ${[[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]].map(([x, y]) => motif("sparkle", x, y, 26, { f: p.gold, s: p.goldDeep, a: p.gold, w: p.gold })).join("")}
      ${curl(380, -1)}${curl(580, 1)}${sparks}
      <circle cx="480" cy="120" r="74" fill="${p.ink}" stroke="url(#gd)" stroke-width="5"/><circle cx="480" cy="120" r="62" fill="${p.deep}" stroke="${p.gold}" stroke-width="1.5" stroke-dasharray="3 6"/>
      <g filter="url(#sh)">${motif(main, 480, 120, 86, { f: p.gold, s: p.goldDeep, a: p.soft, w: "#FFF3C9" }, 0)}</g>
      ${motif(side[0], 170, 120, 40, { f: p.soft, s: p.gold, a: p.gold, w: p.white }, 0, .9)}${motif(side[1 % side.length], 790, 120, 40, { f: p.soft, s: p.gold, a: p.gold, w: p.white }, 0, .9)}`;
  },
  "03": ({ p, rand, main, side, v }) => {
    const sky = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hsl(p.h + 170, 40, 88)}"/><stop offset="1" stop-color="${p.pale}"/></linearGradient>`;
    const hill = (y, amp, col, phase) => `<path d="M0 ${y}${Array.from({ length: 9 }, (_, i) => ` Q${i * 120 + 60} ${y - amp * (i % 2 ? -1 : 1) + phase} ${(i + 1) * 120} ${y}`).join("")} V${H} H0Z" fill="${col}"/>`;
    const green = toHsl("#7BA05B")[0];
    const flowers = scatter(rand, 16, { y0: 170, y1: 232 }).map(([x, y], i) => motif(side[i % side.length], x, y, 18 + rand() * 16, { f: i % 3 ? p.mid : p.accent, s: p.deep, a: "#FFD166", w: p.white }, rand() * 40 - 20)).join("");
    const sunX = 120 + v * 70;
    return `<defs>${sky}${shadow}</defs><rect width="${W}" height="${H}" fill="url(#bg)"/>
      <circle cx="${sunX}" cy="60" r="34" fill="#FFE29A" opacity=".85"/>${motif("cloud", 300 + v * 30, 50, 70, { f: p.white, s: p.white, a: p.white, w: p.white }, 0, .9)}${motif("cloud", 760 - v * 20, 70, 54, { f: p.white, s: p.white, a: p.white, w: p.white }, 0, .8)}
      ${hill(150, 26, hsl(green + (p.h - green) * .2, 30, 70), v * 3)}${hill(180, 20, hsl(green, 34, 56), -v * 2)}${hill(210, 14, hsl(green - 6, 40, 42), v)}
      ${flowers}<g filter="url(#sh)">${motif(main, 480 + (v % 3 - 1) * 180, 128, 104, { f: p.mid, s: p.deep, a: p.accent, w: p.white }, 0)}</g>
      ${Array.from({ length: 6 }, (_, i) => motif("leaf", 20 + i * 14, 30 + i * 8, 28, { f: hsl(green, 34, 50), s: hsl(green, 40, 30), a: p.white, w: p.white }, 100 + i * 12)).join("")}`;
  },
  "04": ({ p, rand, main, side, v }) => {
    const bg = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hsl(p.h + 10, 50, 10)}"/><stop offset=".6" stop-color="${p.deep}"/><stop offset="1" stop-color="${hsl(p.h - 30, 55, 40)}"/></linearGradient>`;
    const stars = Array.from({ length: 90 }, () => `<circle cx="${(rand() * W).toFixed(0)}" cy="${(rand() * H).toFixed(0)}" r="${(rand() * 1.8 + .3).toFixed(1)}" fill="#fff" opacity="${(.4 + rand() * .6).toFixed(2)}"/>`).join("");
    const pts = Array.from({ length: 6 + (v % 3) }, (_, i) => [80 + i * (380 / (6 + v % 3)) + rand() * 30, 40 + rand() * 150]);
    const pts2 = Array.from({ length: 5 }, (_, i) => [600 + i * 70 + rand() * 20, 40 + rand() * 150]);
    const line = arr => `<path d="M${arr.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(" L")}" fill="none" stroke="${p.light}" stroke-width="1.5" opacity=".6"/>${arr.map(([x, y]) => motif("sparkle", x, y, 14, { f: "#fff", s: "#fff", a: "#fff", w: "#fff" })).join("")}`;
    const nebula = `<ellipse cx="${300 + v * 40}" cy="${120}" rx="260" ry="70" fill="${p.mid}" opacity=".25" filter="url(#glow)" transform="rotate(-12 480 120)"/>`;
    return `<defs>${bg}${shadow}</defs><rect width="${W}" height="${H}" fill="url(#bg)"/>${nebula}${stars}${line(pts)}${line(pts2)}
      <circle cx="${480 + (v % 2 ? 160 : -10)}" cy="118" r="80" fill="${p.light}" opacity=".18" filter="url(#glow)"/>
      <g filter="url(#sh)">${motif(main, 480 + (v % 2 ? 160 : -10), 118, 116, { f: p.light, s: p.deep, a: p.accent, w: p.white }, 0)}</g>
      ${motif(side[v % side.length], 860, 60, 40, { f: p.accent, s: p.deep, a: p.light, w: p.white }, 15)}${motif("planet", 120, 190, 44, { f: p.soft, s: p.deep, a: p.accent, w: p.white }, -10, .9)}`;
  },
  "05": ({ p, rand, main, side, v }) => {
    const bg = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hsl(p.h, p.s * .5, 8)}"/><stop offset="1" stop-color="${hsl(p.h, p.s * .6, 20)}"/></linearGradient><radialGradient id="vg" cx=".5" cy=".5" r=".7"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>`;
    const archCount = 5 + (v % 3);
    const archW = W / archCount;
    const arches = Array.from({ length: archCount }, (_, i) => {
      const x = i * archW + archW * .18, w = archW * .64, top = 40 + (i % 2) * 14;
      return `<path d="M${x} ${H}V${top + w / 2}Q${x} ${top} ${x + w / 2} ${top - 10}Q${x + w} ${top} ${x + w} ${top + w / 2}V${H}Z" fill="${hsl(p.h, p.s * .7, 30)}" opacity=".55"/><path d="M${x + w / 2} ${top}V${H}M${x} ${top + w}H${x + w}" stroke="${hsl(p.h, 30, 12)}" stroke-width="3"/>`;
    }).join("");
    const vines = Array.from({ length: 2 }, (_, k) => `<path d="M${k ? W : 0} 0C${k ? W - 80 : 80} 60 ${k ? W - 10 : 10} 120 ${k ? W - 90 : 90} ${H}" fill="none" stroke="${hsl(110, 20, 24)}" stroke-width="4"/>`).join("");
    const roses = [[60, 70], [30, 160], [W - 60, 80], [W - 40, 170]].map(([x, y], i) => motif(side[i % side.length], x, y, 40, { f: p.mid, s: hsl(p.h, 40, 10), a: p.gold, w: p.light }, rand() * 30 - 15)).join("");
    const candles = [300, 660].map(x => `${motif("candle", x + (v - 5) * 6, 186, 54, { f: p.pale, s: hsl(p.h, 30, 12), a: p.gold, w: p.white })}<circle cx="${x + (v - 5) * 6}" cy="166" r="26" fill="#FFC857" opacity=".25" filter="url(#glow)"/>`).join("");
    return `<defs>${bg}${shadow}</defs><rect width="${W}" height="${H}" fill="url(#bg)"/>${arches}${vines}${candles}${roses}
      <circle cx="480" cy="${110}" r="70" fill="${p.mid}" opacity=".35" filter="url(#glow)"/>
      <g filter="url(#sh)">${motif(main, 480, 112, 108, { f: p.soft, s: hsl(p.h, 35, 10), a: p.gold, w: p.pale }, 0)}</g><rect width="${W}" height="${H}" fill="url(#vg)"/>`;
  },
  "06": ({ p, rand, main, side, v }) => {
    const bg = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hsl(p.h + 200, 60, 8)}"/><stop offset=".55" stop-color="${hsl(p.h + 230, 55, 20)}"/><stop offset="1" stop-color="${hsl(p.h, 70, 18)}"/></linearGradient><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.gold}"/><stop offset="1" stop-color="${p.base}"/></linearGradient>`;
    const horizon = 150;
    const grid = [...Array.from({ length: 21 }, (_, i) => `<path d="M480 ${horizon}L${-1200 + i * 168} ${H}" stroke="${p.base}" stroke-width="1.5" opacity=".7"/>`), ...[0, 8, 20, 36, 58, 88].map(d => `<path d="M0 ${horizon + d}H${W}" stroke="${p.base}" stroke-width="1.5" opacity=".7"/>`)].join("");
    const sunX = 480 + (v % 3 - 1) * 220;
    const sun = `<clipPath id="sc"><rect width="${W}" height="${horizon}"/></clipPath><g clip-path="url(#sc)"><circle cx="${sunX}" cy="${horizon}" r="92" fill="url(#sun)"/>${[110, 122, 132, 140].map((y, i) => `<rect x="${sunX - 100}" y="${y}" width="200" height="${3 + i * 2}" fill="${hsl(p.h + 230, 55, 18)}"/>`).join("")}</g>`;
    const scan = `<pattern id="sl" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".28"/></pattern>`;
    const pix = scatter(rand, 9, { y1: 120, avoid: [sunX, 100, 120] }).map(([x, y], i) => motif(side[i % side.length], x, y, 22 + rand() * 14, { f: i % 2 ? p.base : p.accent, s: p.dark, a: p.white, w: p.white }, 0, .9)).join("");
    const window = v % 2 ? `<rect x="${sunX > 480 ? 70 : 640}" y="40" width="250" height="96" rx="6" fill="${p.ink}" stroke="${p.base}" stroke-width="3" opacity=".92"/><rect x="${sunX > 480 ? 70 : 640}" y="40" width="250" height="18" fill="${p.base}"/>${[0, 1, 2].map(i => `<rect x="${(sunX > 480 ? 82 : 652) + i * 16}" y="45" width="9" height="9" rx="2" fill="${p.ink}"/>`).join("")}${[72, 92, 112].map((y, i) => `<rect x="${sunX > 480 ? 86 : 656}" y="${y}" width="${150 - i * 30}" height="7" fill="${p.base}" opacity=".85"/>`).join("")}` : "";
    return `<defs>${bg}${scan}${shadow}</defs><rect width="${W}" height="${H}" fill="url(#bg)"/>${sun}<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="${hsl(p.h + 250, 50, 8)}"/>${grid}${pix}${window}
      <g filter="url(#sh)">${motif(main, sunX, 96, 92, { f: p.base, s: p.dark, a: p.accent, w: p.white }, 0)}</g><rect width="${W}" height="${H}" fill="url(#sl)"/>`;
  },
  "07": ({ p, rand, main, v }) => {
    const shapes = Array.from({ length: 5 }, (_, i) => {
      const x = rand() * W, y = rand() * H, r = 40 + rand() * 110;
      return i % 2 ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 4 ? p.light : p.soft}" opacity=".55"/>` : `<rect x="${x - r}" y="${y - r / 2}" width="${r * 2}" height="${r}" rx="${r / 4}" fill="${p.light}" opacity=".45" transform="rotate(${rand() * 40 - 20} ${x} ${y})"/>`;
    }).join("");
    const left = v % 2 === 0;
    const x = left ? 150 : W - 150;
    return `<defs>${shadow}</defs><rect width="${W}" height="${H}" fill="${p.pale}"/>${shapes}
      <rect x="${left ? 260 : 80}" y="96" width="${360 + v * 20}" height="14" rx="7" fill="${p.mid}" opacity=".8"/><rect x="${left ? 260 : 80}" y="124" width="${220 + v * 12}" height="10" rx="5" fill="${p.soft}"/>
      <path d="M0 ${H - 6}H${W}" stroke="${p.mid}" stroke-width="6"/>
      <circle cx="${x}" cy="120" r="74" fill="${p.white}" stroke="${p.light}" stroke-width="2"/>${motif(main, x, 120, 84, { f: p.mid, s: p.deep, a: p.soft, w: p.white, ink: p.ink }, 0)}`;
  },
  "08": ({ p, rand, main, side, v }) => {
    const cx = 480 + (v % 3 - 1) * 170, cy = 120;
    const rays = Array.from({ length: 36 }, (_, i) => {
      const a = (Math.PI * 2 / 36) * i, b = a + Math.PI / 36;
      return `<path d="M${cx} ${cy}L${cx + 1200 * Math.cos(a)} ${cy + 1200 * Math.sin(a)}L${cx + 1200 * Math.cos(b)} ${cy + 1200 * Math.sin(b)}Z" fill="${i % 2 ? p.mid : p.soft}"/>`;
    }).join("");
    const halftone = `<pattern id="ht" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="${p.deep}" opacity=".22"/></pattern>`;
    const hud = v % 2 ? `<rect x="24" y="22" width="230" height="22" rx="4" fill="${p.ink}" opacity=".8"/><rect x="28" y="26" width="${140 + v * 6}" height="14" rx="3" fill="#57F287"/><text x="0" y="0"/>` : `<rect x="${W - 250}" y="${H - 52}" width="226" height="34" rx="6" fill="${p.white}" stroke="${p.ink}" stroke-width="3"/>${[0, 1, 2, 3, 4].map(i => motif("star", W - 228 + i * 42, H - 35, 24, { f: i < 3 + (v % 3) ? p.gold : p.light, s: p.ink, a: p.white, w: p.white })).join("")}`;
    const icons = scatter(rand, 8, { avoid: [cx, cy, 160] }).map(([x, y], i) => sticker({ f: i % 2 ? p.accent : p.light, s: p.ink, a: p.gold, w: p.white }, side[i % side.length], x, y, 26 + rand() * 14, rand() * 40 - 20)).join("");
    return `<defs>${halftone}${shadow}</defs><rect width="${W}" height="${H}" fill="${p.soft}"/>${rays}<rect width="${W}" height="${H}" fill="url(#ht)"/>${icons}${hud}
      ${motif("burst", cx, cy, 200, { f: p.white, s: p.ink, a: p.light, w: p.white }, v * 7)}${sticker({ f: p.mid, s: p.ink, a: p.accent, w: p.white }, main, cx, cy, 104, 0)}`;
  },
  "09": ({ p, rand, main, side, v }) => {
    const paper = `<pattern id="pp" width="${W}" height="24" patternUnits="userSpaceOnUse"><path d="M0 23.5H${W}" stroke="${hsl(210, 40, 70)}" stroke-width="1" opacity=".5"/></pattern>`;
    const tape = (x, y, w, rot, col) => `<rect x="${x}" y="${y}" width="${w}" height="30" fill="${col}" opacity=".8" transform="rotate(${rot} ${x + w / 2} ${y + 15})"/><rect x="${x}" y="${y}" width="${w}" height="30" fill="url(#tp)" transform="rotate(${rot} ${x + w / 2} ${y + 15})"/>`;
    const stripes = `<pattern id="tp" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="12" fill="#fff" opacity=".35"/></pattern>`;
    const px = 480 + (v % 3 - 1) * 200;
    const polaroid = `<g transform="rotate(${v % 2 ? -5 : 4} ${px} 120)" filter="url(#sh)"><rect x="${px - 90}" y="22" width="180" height="200" fill="#fff"/><rect x="${px - 78}" y="34" width="156" height="140" fill="${p.light}"/>${motif(main, px, 104, 100, { f: p.mid, s: p.deep, a: p.accent, w: p.white }, 0)}<path d="M${px - 60} 196H${px + 60}" stroke="${p.mid}" stroke-width="3" stroke-dasharray="1 0"/></g>`;
    const stickers = scatter(rand, 9, { avoid: [px, 120, 150] }).map(([x, y], i) => sticker({ f: i % 2 ? p.mid : p.accent, s: p.deep, a: p.light, w: p.white }, side[i % side.length], x, y, 30 + rand() * 16, rand() * 50 - 25)).join("");
    return `<defs>${paper}${stripes}${shadow}</defs><rect width="${W}" height="${H}" fill="#FFFCF5"/><rect width="${W}" height="${H}" fill="url(#pp)"/><path d="M70 0V${H}" stroke="#F2A0A0" stroke-width="2" opacity=".6"/>
      ${tape(40 + v * 10, 20, 180, -8, p.soft)}${tape(W - 260, H - 60, 210, 6, p.accent)}${stickers}${polaroid}${tape(px - 50, 8, 100, v % 2 ? -10 : 8, p.light)}`;
  },
  "10": ({ p, main, side, v }) => {
    const tile = 40 + (v % 4) * 8;
    const pat = `<pattern id="tl" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">${v % 2 ? `<path d="M${tile / 2} 4L${tile - 4} ${tile / 2} ${tile / 2} ${tile - 4} 4 ${tile / 2}Z" fill="none" stroke="${p.soft}" stroke-width="1.5"/>` : `<path d="M0 ${tile / 2}H${tile}M${tile / 2} 0V${tile}" stroke="${p.soft}" stroke-width="1" opacity=".7"/>`}<circle cx="${tile / 2}" cy="${tile / 2}" r="2" fill="${p.mid}"/></pattern>`;
    const band = `<rect y="78" width="${W}" height="84" fill="${p.deep}"/><path d="M0 84H${W}M0 156H${W}" stroke="${p.light}" stroke-width="2"/><path d="M0 90H${W}M0 150H${W}" stroke="${p.light}" stroke-width="1" stroke-dasharray="2 6"/>`;
    const chain = Array.from({ length: 14 }, (_, i) => {
      const x = 40 + i * 68;
      if (Math.abs(x - 480) < 90) return "";
      return motif(side[(i + v) % side.length], x, 120, 26 + (i % 2) * 8, { f: i % 2 ? p.light : p.accent, s: p.light, a: p.white, w: p.white }, 0);
    }).join("");
    return `<defs>${pat}${shadow}</defs><rect width="${W}" height="${H}" fill="${p.pale}"/><rect width="${W}" height="${H}" fill="url(#tl)"/>${band}${chain}
      <path d="${hexagon(480, 120, 84)}" fill="${p.pale}" stroke="${p.light}" stroke-width="3" transform="rotate(${v * 9} 480 120)"/><path d="${hexagon(480, 120, 72)}" fill="none" stroke="${p.mid}" stroke-width="1.5" stroke-dasharray="4 4"/>
      ${motif(main, 480, 120, 90, { f: p.mid, s: p.deep, a: p.accent, w: p.white }, 0)}`;
  },
  "11": ({ p, rand, main, side, v }) => {
    const bg = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.light}"/><stop offset="1" stop-color="${p.soft}"/></linearGradient>`;
    const grid = `<pattern id="gr" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${p.deep}" stroke-width="1" opacity=".12"/></pattern>`;
    const lx = v % 2 ? 300 : 660;
    const label = `<g filter="url(#sh)"><rect x="${lx - 190}" y="36" width="380" height="168" rx="${v % 3 === 0 ? 84 : 14}" fill="${p.pale}" stroke="${p.deep}" stroke-width="5"/><rect x="${lx - 176}" y="50" width="352" height="140" rx="${v % 3 === 0 ? 70 : 8}" fill="none" stroke="${p.mid}" stroke-width="2" stroke-dasharray="${v % 2 ? "8 6" : "1 0"}"/>
      ${[0, 1].map(i => `<rect x="${lx - 40 + 30}" y="${150 + i * 16}" width="${120 - i * 40}" height="8" rx="4" fill="${p.mid}" opacity=".7"/>`).join("")}${motif(main, lx - 90, 120, 104, { f: p.mid, s: p.deep, a: p.accent, w: p.white }, 0)}
      <rect x="${lx - 10}" y="78" width="150" height="16" rx="8" fill="${p.deep}"/><rect x="${lx - 10}" y="104" width="110" height="12" rx="6" fill="${p.soft}"/></g>`;
    const rivets = [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${p.deep}"/><circle cx="${x - 2}" cy="${y - 2}" r="2" fill="${p.white}"/>`).join("");
    const props = scatter(rand, 6, { x0: lx > 480 ? 40 : 520, x1: lx > 480 ? 440 : 920, y0: 30, y1: 210 }).map(([x, y], i) => sticker({ f: i % 2 ? p.mid : p.accent, s: p.deep, a: p.light, w: p.white }, i === 0 ? main : side[i % side.length], x, y, 34 + rand() * 20, rand() * 30 - 15)).join("");
    return `<defs>${bg}${grid}${shadow}</defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#gr)"/>${rivets}${props}${label}`;
  },
  "12": ({ p, rand, main, side, v }) => {
    const pal = [p.base, p.accent, p.soft, hsl(p.h + 90, 60, 70), hsl(p.h - 90, 60, 65)];
    const blobs = Array.from({ length: 7 }, (_, i) => {
      const x = rand() * W, y = rand() * H, r = 60 + rand() * 120;
      const d = Array.from({ length: 8 }, (_, k) => {
        const a = Math.PI / 4 * k, rr = r * (.7 + rand() * .5);
        return `${(x + rr * Math.cos(a)).toFixed(0)} ${(y + rr * Math.sin(a) * .7).toFixed(0)}`;
      });
      return `<path d="M${d[0]} Q${d.slice(1).join(" ")} ${d[0]}Z" fill="${pal[i % pal.length]}" opacity=".55"/>`;
    }).join("");
    const lines = v % 2 ? Array.from({ length: 30 }, (_, i) => `<path d="M${i * 34} 0L${i * 34 - 120} ${H}" stroke="${p.white}" stroke-width="${1 + (i % 3)}" opacity=".35"/>`).join("") : Array.from({ length: 8 }, (_, i) => `<circle cx="${480 + (v - 5) * 30}" cy="120" r="${30 + i * 26}" fill="none" stroke="${p.white}" stroke-width="2" opacity="${.5 - i * .05}"/>`).join("");
    const bits = scatter(rand, 7).map(([x, y], i) => motif(side[i % side.length], x, y, 20 + rand() * 30, { f: p.white, s: p.white, a: p.white, w: p.white }, rand() * 90, .7)).join("");
    return `<defs>${shadow}</defs><rect width="${W}" height="${H}" fill="${p.deep}"/>${blobs}${lines}${bits}
      <g filter="url(#sh)">${motif(main, 480 + (v - 5) * 30, 120, 110, { f: p.pale, s: p.ink, a: p.accent, w: p.white }, v * 4 - 18)}</g>`;
  },
};

/* ───────────── Dividers (transparent strips under text) ───────────── */

const SW = 960, SH = 48;
const dividers = {
  "01": ({ p, v }) => `${Array.from({ length: 31 }, (_, i) => `<circle cx="${i * 32}" cy="${SH / 2}" r="${v % 2 ? 9 : 6}" fill="none" stroke="${p.soft}" stroke-width="2.5"/>`).join("")}<path d="M0 24H${SW}" stroke="${p.mid}" stroke-width="2" stroke-dasharray="${2 + v} 8"/>`,
  "02": ({ p, v }) => `<path d="M20 22H${SW - 20}" stroke="${p.gold}" stroke-width="3"/><path d="M120 30H${SW - 120}" stroke="${p.goldDeep}" stroke-width="1.5"/>${[160, 300, 660, 800].map(x => `<path d="M${x} 14 ${x + 8} 22 ${x} 30 ${x - 8} 22Z" fill="${p.gold}"/>`).join("")}${v % 2 ? `<circle cx="20" cy="22" r="5" fill="${p.gold}"/><circle cx="${SW - 20}" cy="22" r="5" fill="${p.gold}"/>` : ""}`,
  "03": () => `<path d="M0 26${Array.from({ length: 16 }, (_, i) => ` Q${i * 60 + 30} ${i % 2 ? 14 : 38} ${(i + 1) * 60} 26`).join("")}" fill="none" stroke="#6F8F55" stroke-width="3"/>${Array.from({ length: 14 }, (_, i) => motif("leaf", 40 + i * 64, i % 2 ? 16 : 34, 18, { f: "#86A96B", s: "#557343", a: "#fff", w: "#fff" }, i * 40)).join("")}`,
  "04": ({ p, v }) => `${Array.from({ length: 40 }, (_, i) => `<circle cx="${i * 24 + 12}" cy="24" r="${i % (3 + v % 2) === 0 ? 3 : 1.3}" fill="${p.light}"/>`).join("")}${[120, 300, 660, 840].map(x => motif("sparkle", x, 24, 18, { f: p.light, s: p.light, a: p.light, w: p.light })).join("")}`,
  "05": ({ p }) => `<path d="M10 24H${SW - 10}" stroke="${p.soft}" stroke-width="2"/>${Array.from({ length: 30 }, (_, i) => `<path d="M${20 + i * 31} 24l6-8 6 8" fill="none" stroke="${p.soft}" stroke-width="2"/>`).join("")}`,
  "06": ({ p, v }) => Array.from({ length: 60 }, (_, i) => `<rect x="${i * 16}" y="${18 + (i % (2 + v % 3) === 0 ? -4 : 0)}" width="10" height="${i % (2 + v % 3) === 0 ? 16 : 8}" fill="${i % 4 === 0 ? p.accent : p.base}"/>`).join(""),
  "07": ({ p }) => `<linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="${p.base}"/><stop offset=".5" stop-color="${p.accent}"/><stop offset="1" stop-color="${p.base}"/></linearGradient><rect x="0" y="21" width="${SW}" height="6" rx="3" fill="url(#rb)"/>`,
  "08": ({ p }) => Array.from({ length: 48 }, (_, i) => `<rect x="${i * 20}" y="${i % 2 ? 16 : 24}" width="10" height="8" fill="${i % 3 ? p.base : p.white}"/>`).join(""),
  "09": ({ p, v }) => `<rect x="0" y="12" width="${SW}" height="24" fill="${p.soft}" opacity=".85"/><pattern id="tp" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(${v % 2 ? 45 : -45})"><rect width="7" height="14" fill="#fff" opacity=".45"/></pattern><rect x="0" y="12" width="${SW}" height="24" fill="url(#tp)"/>`,
  "10": ({ p, v }) => Array.from({ length: 34 }, (_, i) => motif(v % 2 ? "sparkle" : "heart", 14 + i * 28, 24, i % 2 ? 10 : 16, { f: i % 2 ? p.light : p.mid, s: i % 2 ? p.light : p.mid, a: p.white, w: p.white })).join(""),
  "11": ({ p }) => `<rect x="0" y="16" width="${SW}" height="16" rx="8" fill="${p.deep}"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${16 + i * 32}" cy="24" r="3" fill="${p.light}"/>`).join("")}`,
  "12": ({ p }) => `<linearGradient id="wv" x1="0" x2="1"><stop offset="0" stop-color="${p.base}"/><stop offset=".33" stop-color="${p.accent}"/><stop offset=".66" stop-color="${hsl(p.h + 90, 60, 70)}"/><stop offset="1" stop-color="${p.base}"/></linearGradient><path d="M0 24${Array.from({ length: 12 }, (_, i) => ` Q${i * 80 + 40} ${i % 2 ? 6 : 42} ${(i + 1) * 80} 24`).join("")}" fill="none" stroke="url(#wv)" stroke-width="5" stroke-linecap="round"/>`,
};

function dividerSvg(style, p, main, v) {
  const body = dividers[style.family]({ p, main, v });
  const centerW = 96;
  const center = `<rect x="${SW / 2 - centerW / 2}" y="0" width="${centerW}" height="${SH}" fill="#2b2d31"/>${motif(main, SW / 2, SH / 2, 40, { f: p.mid, s: p.deep, a: p.accent, w: p.white, ink: p.ink }, 0)}${motif("sparkle", SW / 2 - 40, SH / 2, 12, { f: p.light, s: p.light, a: p.light, w: p.light })}${motif("sparkle", SW / 2 + 40, SH / 2, 12, { f: p.light, s: p.light, a: p.light, w: p.light })}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}" viewBox="0 0 ${SW} ${SH}"><defs>${shadow}</defs>${body}${center}</svg>`;
}

/* ───────────── Thumbnails ───────────── */

function thumbnailSvg(style, p, main, side, rand, v) {
  const S = 256;
  const round = [24, 128, 40, 8][v % 4];
  const fam = style.family;
  const dark = ["02", "04", "05", "06", "12"].includes(fam);
  const bgA = dark ? p.deep : p.light, bgB = dark ? p.ink : p.soft;
  const bg = `<radialGradient id="tb" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="${dark ? p.mid : p.pale}"/><stop offset=".6" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></radialGradient>`;
  const ring = fam === "02" ? `<rect x="12" y="12" width="${S - 24}" height="${S - 24}" rx="${Math.max(round - 12, 0)}" fill="none" stroke="${p.gold}" stroke-width="5"/>` : fam === "06" ? `<pattern id="sl" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".3"/></pattern>` : "";
  const sparks = Array.from({ length: 4 + (v % 3) }, (_, i) => {
    const a = rand() * Math.PI * 2, r = 92 + rand() * 18;
    return motif(side[i % side.length], 128 + r * Math.cos(a), 128 + r * Math.sin(a) * .9, 18 + rand() * 14, { f: dark ? p.light : p.mid, s: dark ? p.light : p.deep, a: p.white, w: p.white }, rand() * 60 - 30, .9);
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${bg}${shadow}</defs>
    <clipPath id="cl"><rect width="${S}" height="${S}" rx="${round}"/></clipPath><g clip-path="url(#cl)"><rect width="${S}" height="${S}" fill="url(#tb)"/>${ring}${fam === "06" ? `<rect width="${S}" height="${S}" fill="url(#sl)"/>` : ""}${sparks}
    <g filter="url(#sh)">${motif(main, 128, 128, 150, { f: dark && fam === "02" ? p.gold : p.mid, s: dark ? p.ink : p.deep, a: fam === "02" ? p.soft : p.accent, w: p.white, ink: p.ink }, v % 2 ? -6 : 6)}</g></g></svg>`;
}

/* ───────────── Run ───────────── */

const only = new Set(process.argv.slice(2).map(id => id.toUpperCase()));
await mkdir(OUT, { recursive: true });
let written = 0;
for (const style of embedStyles) {
  if (only.size && !only.has(style.id)) continue;
  const rand = seeded(style.id + style.name);
  const p = palette(style, rand);
  const v = style.id.charCodeAt(3) - 65;
  const main = markMotif[style.mark] ?? "sparkle";
  const pool = familyMotifs[style.family];
  const side = [...pool.slice(v % pool.length), ...pool.slice(0, v % pool.length)];
  const files = {
    banner: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${scenes[style.family]({ p, rand, main, side, v, style })}</svg>`,
    footer: () => dividerSvg(style, p, main, v),
    thumbnail: () => thumbnailSvg(style, p, main, side, rand, v),
  };
  for (const [slot, make] of Object.entries(files)) {
    const name = `${style.id}-${slot}`;
    if (PAINTED.has(name) && existsSync(new URL(`${name}.webp`, OUT))) continue;
    const svg = make();
    const width = slot === "footer" ? SW : slot === "banner" ? W : 256;
    const image = await sharp(Buffer.from(svg)).resize({ width }).webp({ quality: 88, alphaQuality: 100 }).toBuffer();
    await writeFile(new URL(`${name}.webp`, OUT), image);
    written++;
  }
}
console.log(`Wrote ${written} images to public/assets/discord/embeds/`);
