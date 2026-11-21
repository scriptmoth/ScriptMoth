const dayMs = 24 * 60 * 60_000;
const timestampPattern = /^<t:(\d{1,12})(?::[tTdDfFR])?>$/;
const isoPattern = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/i;

// Require a timezone so the host's clock setting never changes what a member scheduled.
function parseInstant(value) {
  const text = value?.trim() ?? '';
  const timestamp = timestampPattern.exec(text);
  if (timestamp) return Number(timestamp[1]) * 1000;
  const date = isoPattern.exec(text);
  if (!date) return NaN;
  const [, year, month, day] = date.map(Number);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return NaN;
  return Date.parse(text);
}

function discordTime(ms, style = 'F') {
  return `<t:${Math.floor(ms / 1000)}:${style}>`;
}

module.exports = { dayMs, parseInstant, discordTime };
