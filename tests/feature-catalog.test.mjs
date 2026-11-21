import assert from "node:assert/strict";
import test from "node:test";
import { categories, shelves, systems } from "../src/data/feature-catalog.ts";
import { buildIndex, queryTerms, search } from "../src/lib/feature-catalog-search.ts";

const index = buildIndex(systems, {
  categories,
  shelves: Object.fromEntries(shelves.map(({ id, title }) => [id, title])),
});
const ids = (query) => search(index, query).map(({ system }) => system.id);

test("system ids are unique kebab-case and every reference resolves", () => {
  const known = new Set(systems.map(({ id }) => id));
  assert.equal(known.size, systems.length);
  const shelfIds = new Set(shelves.map(({ id }) => id));
  for (const system of systems) {
    assert.match(system.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(shelfIds.has(system.shelf), `${system.id} has an unknown shelf`);
    assert.ok(system.categories.length, `${system.id} needs a category`);
    for (const category of system.categories) assert.ok(category in categories, `${system.id}: ${category}`);
    for (const related of system.related) {
      assert.ok(known.has(related), `${system.id} relates to unknown ${related}`);
      assert.notEqual(related, system.id);
    }
    for (const { href } of system.demos ?? []) assert.match(href, /^\/[a-z]/);
    for (const list of [system.included, system.uses, system.enhancements]) assert.ok(list.length, `${system.id} has an empty list`);
  }
  for (const shelf of shelves) assert.ok(systems.some((system) => system.shelf === shelf.id), `${shelf.id} is empty`);
});

test("searches find systems by their uses, not just their names", () => {
  assert.equal(ids("fishing")[0], "resource-collection");
  assert.equal(ids("QOTD")[0], "question-prompts");
  assert.equal(ids("in-character question of the day")[0], "character-qotd");
  assert.equal(ids("I want a fishing bot")[0], "resource-collection");
  assert.equal(ids("I need character applications")[0], "applications");
  assert.equal(ids("Can you make a game night planner?")[0], "group-planner");
  assert.ok(ids("secret santa").includes("gift-exchange"));
  assert.ok(ids("pokémon").includes("combat"));
  assert.equal(ids("tupperbox")[0], "character-proxy");
  assert.equal(ids("giveaway")[0], "giveaways");
  assert.equal(ids("twitch alerts")[0], "stream-alerts");
  assert.equal(ids("patreon roles")[0], "supporter-sync");
  assert.equal(ids("pomodoro")[0], "focus-tools");
  assert.equal(ids("commission queue")[0], "commission-queue");
});

test("matches explain themselves when the name doesn't", () => {
  const [hit] = search(index, "fishing");
  assert.deepEqual(hit.hint, { label: "Can be used for", text: "Fishing" });
  assert.equal(search(index, "trivia")[0].hint, undefined);
});

test("queries ignore filler words and require every meaningful word", () => {
  assert.deepEqual(queryTerms("Can you make me a Discord bot for applications?"), ["application"]);
  assert.equal(search(index, "").length, systems.length);
  assert.deepEqual(ids("fishing spaceship"), []);
});
