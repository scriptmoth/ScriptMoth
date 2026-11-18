import assert from "node:assert/strict";
import test from "node:test";
import { projectGroups, recommendHosting, seedFeatures, starterPackages } from "../src/data/builder.ts";
import { priceBuild } from "../src/lib/business/pricing.ts";

const types = ["discord-bot", "discord-setup", "roleplay-bot", "personal-site", "oc-wiki", "community-site", "web-app", "improvement", "hosting", "other"];
const all = Object.fromEntries(types.map(type => [type, seedFeatures(type)]));
const find = (type, id) => all[type].find(item => item.id === `${type}:${id}`);
const packageBase = slug => {
  const item = starterPackages.find(entry => entry.slug === slug);
  return { id: slug, kind: "base", label: item.title, cents: item.dollars === null ? null : item.dollars * 100, manual: item.manual,
    includes: item.includes && { ...item.includes, ids: item.includes.ids.map(id => `${item.type}:${id}`) } };
};
const pick = (type, id, complexity) => ({ id: `${type}:${id}`, quantity: 1, complexity });

test("every feature ID is unique and every reference points at a real feature", () => {
  for (const [type, features] of Object.entries(all)) {
    const ids = new Set(features.map(item => item.id));
    assert.equal(ids.size, features.length, `${type} has duplicate feature IDs`);
    for (const item of features) for (const ref of [...item.requires ?? [], ...item.conflicts ?? [], ...item.suggests ?? []]) {
      assert.ok(ids.has(ref), `${item.id} references missing ${ref}`);
    }
  }
  for (const item of starterPackages) for (const id of item.includes?.ids ?? []) assert.ok(find(item.type, id), `${item.slug} includes missing ${id}`);
  for (const group of projectGroups) for (const choice of group.choices) {
    assert.ok(!choice.slug || starterPackages.some(item => item.slug === choice.slug && item.type === choice.type), `${group.id} lists missing ${choice.slug}`);
  }
});

test("no feature is accidentally free and unpriced features stay unpriced", () => {
  for (const features of Object.values(all)) for (const item of features) {
    assert.ok(item.cents === null || item.cents > 0, `${item.id} has a zero price`);
    if (item.unpriced) assert.equal(item.cents, null, `${item.id} is unpriced but has an amount`);
    assert.ok(item.description, `${item.id} needs a plain-language description`);
    for (const option of item.complexity ?? []) assert.ok(option.cents > 0 && option.description, `${item.id} has an unexplained upgrade`);
  }
});

test("configured prices match the approved brief", () => {
  assert.deepEqual(Object.fromEntries(starterPackages.map(item => [item.slug, item.dollars])), {
    "custom-discord-bot": 95, "community-engagement-bot": 150, "discord-server-setup": 85, "custom-rp-bot": 200,
    "carrd-site": 95, "toyhouse-profile": 75, "tumblr-theme": 85, "single-page-website": 175, "personal-website": 300,
    "oc-wiki": 550, "community-website": 650, "custom-bot-dashboard": 600, "custom-web-application": 1500,
    "bot-website-integration": null, "existing-project-assessment": null,
  });
  const cents = (type, id) => find(type, id).cents;
  const upgraded = (type, id) => cents(type, id) + find(type, id).complexity[0].cents;
  assert.equal(cents("discord-bot", "reaction-roles"), 4000);
  assert.equal(cents("discord-bot", "activity-logging"), 2500);
  assert.equal(upgraded("discord-bot", "activity-logging"), 5500);
  assert.equal(cents("discord-bot", "ticket-system"), 12500);
  assert.equal(upgraded("discord-bot", "ticket-system"), 17500);
  assert.equal(cents("discord-bot", "xp-and-leveling"), 12500);
  assert.equal(cents("discord-bot", "question-of-the-day"), 6000);
  assert.equal(cents("discord-bot", "polls-and-voting"), 5000);
  assert.equal(cents("roleplay-bot", "character-profiles"), 10000);
  assert.equal(cents("roleplay-bot", "quest-system"), 25000);
  assert.equal(cents("roleplay-bot", "currency-system"), 15000);
  assert.equal(cents("roleplay-bot", "character-inventories"), 22500);
  assert.equal(cents("roleplay-bot", "combat-system"), 50000);
  assert.ok(find("roleplay-bot", "combat-system").manual);
  assert.equal(cents("personal-site", "additional-basic-page"), 6500);
  assert.equal(cents("personal-site", "additional-complex-page"), 12500);
  assert.equal(cents("personal-site", "contact-form"), 8500);
});

test("the brief's community bot example totals $430, minus modules the package covers", () => {
  const options = all["discord-bot"];
  const choices = [pick("discord-bot", "reaction-roles"), pick("discord-bot", "activity-logging", "Advanced logging"), pick("discord-bot", "ticket-system"), pick("discord-bot", "question-of-the-day")];
  assert.equal(priceBuild(options, choices, { ...packageBase("community-engagement-bot"), includes: undefined }).total, 43000);
  // Question of the Day is one of the package's two included modules, so it is not charged again.
  assert.equal(priceBuild(options, choices, packageBase("community-engagement-bot")).total, 37000);
});

test("the roleplay package includes its roster workflow and explains missing requirements", () => {
  const result = priceBuild(all["roleplay-bot"], [pick("roleplay-bot", "character-inventories"), pick("roleplay-bot", "player-shops")], packageBase("custom-rp-bot"));
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].related, "roleplay-bot:currency-system");
  assert.equal(result.total, 20000 + 22500 + 20000);
  assert.equal(result.lines.filter(line => line.included).length, 3);
});

test("the multipage package covers two simple pages", () => {
  const result = priceBuild(all["personal-site"], [pick("personal-site", "about-page"), pick("personal-site", "faq-page"), pick("personal-site", "contact-form")], packageBase("personal-website"));
  assert.equal(result.total, 30000 + 8500);
});

test("hosting advice depends on the project", () => {
  assert.equal(recommendHosting("discord-bot", []).mode, "managed");
  assert.equal(recommendHosting("personal-site", []).mode, "client");
  assert.equal(recommendHosting("personal-site", ["database"]).mode, "managed");
  assert.equal(recommendHosting("improvement", []).mode, "unsure");
});
