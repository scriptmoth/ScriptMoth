const test = require('node:test');
const assert = require('node:assert/strict');
const { roll, tokenize, DiceError } = require('../src/modules/dice/roll');
const { assign } = require('../src/modules/secret-santa');
const { pickFresh } = require('../src/modules/spotlight');
const { rollEncounter } = require('../src/modules/encounter');
const { isBirthdayOn, isValidDate, daysUntil, localNow } = require('../src/modules/character-birthdays/dates');

function seq(...values) {
  let i = 0;
  return () => values[i++ % values.length];
}

test('dice: basic expressions and modifiers', () => {
  const r = roll('2d6+3', seq(0, 0.99));
  assert.equal(r.total, 1 + 6 + 3);
  assert.equal(roll('d20', () => 0.5).total, 11);
  assert.equal(roll('1d8 - 2', () => 0).total, -1);
  assert.equal(roll('d%', () => 0.999).total, 100);
});

test('dice: keep highest / lowest and advantage', () => {
  assert.equal(roll('4d6kh3', seq(0, 0.5, 0.99, 0.2)).total, 4 + 6 + 2);
  assert.equal(roll('adv', seq(0.1, 0.9)).total, 19);
  assert.equal(roll('dis', seq(0.1, 0.9)).total, 3);
});

test('dice: natural 20 and 1', () => {
  assert.equal(roll('1d20+5', () => 0.999).crit, true);
  assert.equal(roll('1d20', () => 0).fumble, true);
  assert.equal(roll('2d20', () => 0.999).crit, false);
});

test('dice: rejects bad input', () => {
  for (const bad of ['', 'hello', '0d6', '1000d6', '1d1', '2d6kh3', '1d6++']) {
    assert.throws(() => tokenize(bad), DiceError, bad);
  }
});

test('secret santa: everyone gives once, receives once, never to themselves', () => {
  for (let run = 0; run < 200; run++) {
    const ids = Array.from({ length: 3 + (run % 10) }, (_, i) => `u${i}`);
    const pairs = assign(ids);
    assert.deepEqual(Object.keys(pairs).sort(), [...ids].sort());
    assert.deepEqual(Object.values(pairs).sort(), [...ids].sort());
    for (const [giver, receiver] of Object.entries(pairs)) assert.notEqual(giver, receiver);
  }
});

test('spotlight: avoids recent picks, falls back when everyone was featured', () => {
  const chars = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(pickFresh(chars, ['a', 'b'], () => 0).id, 'c');
  assert.ok(pickFresh(chars, ['a', 'b', 'c']));
  assert.equal(pickFresh([], []), null);
});

test('encounters: custom entries join the pool', () => {
  const result = rollEncounter({ biome: 'forest', danger: 'deadly', custom: [{ kind: 'hostile', text: 'CUSTOM' }], random: seq(0.99, 0.999, 0.99) });
  assert.equal(result.kind, 'hostile');
  assert.equal(result.text, 'CUSTOM');
});

test('birthdays: leap day, validation, and countdown', () => {
  assert.ok(isBirthdayOn({ month: 2, day: 29 }, { year: 2025, month: 2, day: 28 }));
  assert.ok(!isBirthdayOn({ month: 2, day: 29 }, { year: 2024, month: 2, day: 28 }));
  assert.ok(isValidDate(2, 29));
  assert.ok(!isValidDate(4, 31));
  assert.equal(daysUntil({ month: 1, day: 2 }, { year: 2026, month: 1, day: 1 }), 1);
  assert.equal(daysUntil({ month: 12, day: 31 }, { year: 2026, month: 1, day: 1 }), 364);
  const tokyo = localNow('Asia/Tokyo', new Date('2026-03-01T20:00:00Z'));
  assert.deepEqual([tokyo.month, tokyo.day, tokyo.hour], [3, 2, 5]);
});
