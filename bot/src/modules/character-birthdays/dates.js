// Date helpers for birthdays. Pure, timezone-aware, testable.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date and hour right now in a time zone. */
function localNow(timeZone = 'UTC', now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return { year, month, day, hour: Number(parts.hour), key: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
}

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function isValidDate(month, day) {
  return Number.isInteger(month) && Number.isInteger(day) && month >= 1 && month <= 12 && day >= 1 && day <= DAYS_IN_MONTH[month - 1];
}

/** Does a birthday fall on this date? Feb 29 birthdays are celebrated on Feb 28 in non-leap years. */
function isBirthdayOn(birthday, { year, month, day }) {
  if (birthday.month === month && birthday.day === day) return true;
  return birthday.month === 2 && birthday.day === 29 && !isLeap(year) && month === 2 && day === 28;
}

function formatDate({ month, day }) {
  return `${MONTHS[month - 1]} ${day}`;
}

/** Days from `today` until the next occurrence of a birthday (0 = today). */
function daysUntil(birthday, today) {
  const start = Date.UTC(today.year, today.month - 1, today.day);
  for (let offset = 0; offset < 366 + 1; offset++) {
    const d = new Date(start + offset * 86_400_000);
    if (isBirthdayOn(birthday, { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() })) return offset;
  }
  return Infinity;
}

module.exports = { MONTHS, isValidTimeZone, localNow, isValidDate, isBirthdayOn, formatDate, daysUntil };
