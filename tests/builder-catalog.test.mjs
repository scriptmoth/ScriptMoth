import assert from "node:assert/strict";
import test from "node:test";
import { hiddenFeatures, projectGroups, recommendHosting, seedFeatures, starterPackages } from "../src/data/builder.ts";
import { priceBuild } from "../src/lib/business/pricing.ts";

const types = ["discord-bot", "discord-setup", "roleplay-bot", "personal-site", "oc-wiki", "community-site", "web-app", "improvement", "hosting", "other"];
const all = Object.fromEntries(types.map(type => [type, seedFeatures(type)]));
const find = (type, id) => all[type].find(item => item.id === `${type}:${id}`);
const packageBase = slug => {
  const item = starterPackages.find(entry => entry.slug === slug);
  return { id: slug, kind: "base", label: item.title, cents: item.dollars === null ? null : item.dollars * 100, manual: item.manual,
    includes: item.includes && { ...item.includes, ids: item.includes.ids.map(id => `${item.type}:${id}`), always: item.includes.always?.map(id => `${item.type}:${id}`) } };
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
  for (const item of starterPackages) for (const id of [...item.includes?.ids ?? [], ...item.includes?.always ?? []]) assert.ok(find(item.type, id), `${item.slug} includes missing ${id}`);
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

test("configured prices match the catalog rates", () => {
  assert.deepEqual(Object.fromEntries(starterPackages.map(item => [item.slug, item.dollars])), {
    "custom-discord-bot": 115, "community-engagement-bot": 185, "discord-server-setup": 50, "custom-rp-bot": 250,
    "carrd-site": 125, "toyhouse-profile": 75, "tumblr-theme": 85, "personal-website": 250,
    "oc-wiki": 550, "community-website": 600, "custom-bot-dashboard": 600, "custom-web-application": 1500,
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

test("the community bot estimate deducts modules the package covers", () => {
  const options = all["discord-bot"];
  const choices = [pick("discord-bot", "reaction-roles"), pick("discord-bot", "activity-logging", "Advanced logging"), pick("discord-bot", "ticket-system"), pick("discord-bot", "question-of-the-day")];
  assert.equal(priceBuild(options, choices, { ...packageBase("community-engagement-bot"), includes: undefined }).total, 46500);
  // Question of the Day is one of the package's two included modules, so it is not charged again.
  assert.equal(priceBuild(options, choices, packageBase("community-engagement-bot")).total, 40500);
});

test("the roleplay package includes its roster workflow and explains missing requirements", () => {
  const result = priceBuild(all["roleplay-bot"], [pick("roleplay-bot", "character-inventories"), pick("roleplay-bot", "player-shops")], packageBase("custom-rp-bot"));
  assert.equal(result.issues.length, 1);
  assert.equal(result.issues[0].related, "roleplay-bot:currency-system");
  assert.equal(result.total, 25000 + 22500 + 20000);
  assert.equal(result.lines.filter(line => line.included).length, 4);
});

test("the multipage package covers two simple pages", () => {
  const result = priceBuild(all["personal-site"], [pick("personal-site", "about-page"), pick("personal-site", "faq-page"), pick("personal-site", "contact-form")], packageBase("personal-website"));
  assert.equal(result.total, 25000 + 8500);
});

test("hosting advice depends on the project", () => {
  assert.equal(recommendHosting("discord-bot", []).mode, "managed");
  assert.equal(recommendHosting("personal-site", []).mode, "client");
  assert.equal(recommendHosting("personal-site", ["database"]).mode, "managed");
  assert.equal(recommendHosting("improvement", []).mode, "unsure");
});

test("a choose-N package also gives its always-included features at no charge", () => {
  const options = all["discord-bot"];
  const result = priceBuild(options, [pick("discord-bot", "reaction-roles"), pick("discord-bot", "welcome-messages")], packageBase("custom-discord-bot"));
  const line = id => result.lines.find(entry => entry.id === `discord-bot:${id}`);
  for (const id of ["custom-embed-theme", "goodbye-messages", "custom-bot-status"]) assert.equal(line(id).cents, 0, `${id} should be included`);
  // Reaction roles is the more valuable pick, so it is covered and welcome messages is charged.
  assert.equal(line("reaction-roles").cents, 0);
  assert.equal(result.total, 11500 + 2500);
});

test("every listed package includes at least its price in builder features", () => {
  for (const item of starterPackages.filter(entry => entry.product && entry.dollars !== null)) {
    const cents = ids => (ids ?? []).map(id => find(item.type, id)?.cents ?? 0);
    const sum = values => values.reduce((total, value) => total + value, 0);
    const { ids = [], choose, always } = item.includes ?? {};
    const picks = choose ? cents(ids).sort((a, b) => b - a).slice(0, choose) : cents(ids);
    assert.ok(sum(picks) + sum(cents(always)) >= item.dollars * 100, `${item.slug} includes less than its $${item.dollars} price`);
  }
});

test("package hide rules point at real features and never hide what a package needs", () => {
  for (const item of starterPackages) {
    if (!item.hide) continue;
    const features = all[item.type];
    const categories = new Set(features.map(feature => feature.category));
    for (const category of item.hide.categories ?? []) assert.ok(categories.has(category), `${item.slug} hides missing category ${category}`);
    for (const id of item.hide.features ?? []) assert.ok(find(item.type, id), `${item.slug} hides missing feature ${id}`);
    const hidden = new Set(hiddenFeatures(item, features));
    for (const id of [...item.includes?.ids ?? [], ...item.includes?.always ?? []]) assert.ok(!hidden.has(`${item.type}:${id}`), `${item.slug} hides its included ${id}`);
    for (const feature of features) if (!hidden.has(feature.id)) for (const ref of feature.requires ?? []) {
      assert.ok(!hidden.has(ref), `${item.slug} shows ${feature.id} but hides its requirement ${ref}`);
    }
  }
});

test("a utility bot doesn't offer character or OC features", () => {
  const utility = starterPackages.find(item => item.slug === "custom-discord-bot");
  const hidden = new Set(hiddenFeatures(utility, all["discord-bot"]));
  const shown = all["discord-bot"].filter(feature => !hidden.has(feature.id));
  assert.ok(!shown.some(feature => feature.category === "Characters & OCs" || /character/i.test(feature.label)));
  assert.ok(shown.some(feature => feature.id === "discord-bot:welcome-messages"));
});
