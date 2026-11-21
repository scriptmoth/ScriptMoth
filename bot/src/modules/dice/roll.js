// Dice expression parser. Pure functions, no Discord, so it's easy to test and reuse.
//
// Supports: 2d6, d20, 4d6kh3 (keep highest), 2d20kl1 (keep lowest), d%, +/- modifiers,
// several dice terms (1d8+2d6+3), and "adv"/"dis" shorthands for d20 rolls.

const MAX_DICE = 100;
const MAX_SIDES = 1000;

class DiceError extends Error {}

function tokenize(input) {
  let text = String(input).toLowerCase().replace(/\s+/g, '');
  if (!text) throw new DiceError('Give me something to roll, like `2d6+3`.');
  text = text.replace(/^adv(antage)?$/, '2d20kh1').replace(/^dis(advantage)?$/, '2d20kl1');
  text = text.replace(/d%/g, 'd100');

  const terms = [];
  const pattern = /([+-]?)(?:(\d*)d(\d+)(?:(kh|kl)(\d+))?|(\d+))/gy;
  let match;
  while (pattern.lastIndex < text.length && (match = pattern.exec(text))) {
    const sign = match[1] === '-' ? -1 : 1;
    if (match[6] !== undefined) {
      terms.push({ type: 'flat', sign, value: Number(match[6]) });
      continue;
    }
    const count = match[2] ? Number(match[2]) : 1;
    const sides = Number(match[3]);
    const keep = match[4] ? { mode: match[4], n: Number(match[5]) } : null;
    if (count < 1 || count > MAX_DICE) throw new DiceError(`Roll between 1 and ${MAX_DICE} dice at a time.`);
    if (sides < 2 || sides > MAX_SIDES) throw new DiceError(`Dice need 2 to ${MAX_SIDES} sides.`);
    if (keep && (keep.n < 1 || keep.n > count)) throw new DiceError(`Can't keep ${keep.n} of ${count} dice.`);
    terms.push({ type: 'dice', sign, count, sides, keep });
  }
  if (pattern.lastIndex !== text.length || !terms.length) {
    throw new DiceError(`I couldn't read \`${input}\`. Try something like \`1d20+5\` or \`4d6kh3\`.`);
  }
  if (terms.filter((t) => t.type === 'dice').length > 10) throw new DiceError('Up to 10 dice groups per roll.');
  return terms;
}

function roll(input, random = Math.random) {
  const terms = tokenize(input);
  let total = 0;
  const parts = [];

  for (const term of terms) {
    if (term.type === 'flat') {
      total += term.sign * term.value;
      parts.push({ label: `${term.sign < 0 ? '-' : '+'} ${term.value}`, kept: [], dropped: [], subtotal: term.sign * term.value });
      continue;
    }
    const rolls = Array.from({ length: term.count }, () => 1 + Math.floor(random() * term.sides));
    let keptIdx = rolls.map((_, i) => i);
    if (term.keep) {
      const order = [...keptIdx].sort((a, b) => (term.keep.mode === 'kh' ? rolls[b] - rolls[a] : rolls[a] - rolls[b]));
      keptIdx = order.slice(0, term.keep.n);
    }
    const keptSet = new Set(keptIdx);
    const kept = rolls.filter((_, i) => keptSet.has(i));
    const dropped = rolls.filter((_, i) => !keptSet.has(i));
    const subtotal = term.sign * kept.reduce((a, b) => a + b, 0);
    total += subtotal;
    const keepText = term.keep ? `${term.keep.mode}${term.keep.n}` : '';
    parts.push({
      label: `${term.sign < 0 ? '-' : '+'} ${term.count}d${term.sides}${keepText}`,
      rolls,
      kept,
      dropped,
      keptIdx: [...keptSet],
      sides: term.sides,
      subtotal,
    });
  }

  // Natural 20/1 only counts when the roll has a single d20 group that keeps one die (1d20+5, adv, dis).
  const diceParts = parts.filter((p) => p.rolls);
  const only = diceParts.length === 1 ? diceParts[0] : null;
  const natural = only && only.sides === 20 && only.kept.length === 1 ? only.kept[0] : null;
  return { total, parts, crit: natural === 20, fumble: natural === 1 };
}

function formatParts(parts) {
  return parts
    .map((p, i) => {
      const label = i === 0 ? p.label.replace(/^\+ /, '') : p.label;
      if (!p.rolls) return label;
      const keptIdx = new Set(p.keptIdx);
      const shown = p.rolls
        .map((r, j) => {
          const text = r === p.sides || r === 1 ? `**${r}**` : String(r);
          return keptIdx.has(j) ? text : `~~${r}~~`;
        })
        .join(', ');
      return `${label} [${shown}]`;
    })
    .join(' ');
}

module.exports = { roll, tokenize, formatParts, DiceError, MAX_DICE, MAX_SIDES };
