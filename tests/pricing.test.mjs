import assert from "node:assert/strict";
import test from "node:test";
import { decodeBuild, dependents, encodeBuild, missingRequirements, parseSelections, priceBuild, resolvedBase } from "../src/lib/business/pricing.ts";

const base = { id: "base", kind: "base", label: "Bot", cents: 7500 };
const role = { id: "roles", kind: "feature", label: "Reaction roles", cents: 3500, max: 20 };
const logging = { id: "logs", kind: "feature", label: "Message logging", cents: 5000 };
const birthdays = { id: "bday", kind: "feature", label: "Birthday announcements", cents: 3500 };
const select = (id, quantity = 1) => ({ id, quantity });

test("calculates the Discord example and updates with quantity", () => {
  const options = [role, logging, birthdays];
  const choices = [select("roles"), select("logs"), select("bday")];
  assert.equal(priceBuild(options, choices, base).total, 19500);
  assert.equal(priceBuild(options, [select("roles", 2), ...choices.slice(1)], base).total, 23000);
});

test("deploy fees, tiers, complexity, discounts, and recurring fees are calculated independently", () => {
  const hosting = { id: "hosting", kind: "recurring", label: "Hosting", cents: 1500, setup: 3000 };
  const pricedRoles = { ...role, tiers: [{ from: 3, cents: 2800 }], complexity: [{ label: "Branded", cents: 200 }] };
  const result = priceBuild([hosting, pricedRoles], [select("hosting"), { ...select("roles", 3), complexity: "Branded" }], { ...base, discount: 2000, minimum: 18000 });
  assert.equal(result.setup, 3000);
  assert.equal(result.discount, 2000);
  assert.equal(result.monthly, 1500);
  assert.equal(result.total, 18000);
  assert.ok(result.lines.some(line => line.kind === "minimum" && line.cents === 500));
});

test("requires an explicit dependency and flags mutually exclusive features", () => {
  const currency = { id: "currency", kind: "feature", label: "Currency", cents: 10000 };
  const shop = { id: "shop", kind: "feature", label: "Shop", cents: 12500, requires: ["currency"], conflicts: ["roles"] };
  const result = priceBuild([shop, currency, role], [select("shop"), select("roles")], base);
  assert.equal(result.issues.length, 2);
  assert.equal(result.issues[0].related, "currency");
  assert.equal(priceBuild([shop, currency], [select("currency"), select("shop")], base).issues.length, 0);
});

test("manual prices remain unknown and starting prices stay provisional", () => {
  const result = priceBuild([{ ...role, cents: null }, { ...logging, manual: true }], [select("roles"), select("logs")], base);
  assert.deepEqual(result.review, ["Reaction roles", "Message logging"]);
  assert.equal(result.lines.find(line => line.id === "roles").cents, null);
  assert.equal(result.total, 12500);
});

test("configuration validation rejects duplicates and ignores client-supplied amounts", () => {
  assert.throws(() => parseSelections(JSON.stringify([select("roles"), select("roles")])), /quantities/);
  assert.throws(() => parseSelections(JSON.stringify([select("roles", 0)])), /quantities/);
  const supplied = parseSelections(JSON.stringify([{ ...select("roles", 2), cents: 1 }]));
  assert.equal(priceBuild([role], supplied, base).total, 14500);
  assert.ok(priceBuild([role], [select("roles", 21)], base).issues.length);
  assert.ok(priceBuild([role], [select("removed")], base).issues.length);
});

test("a starting hosting plan is billed monthly while setup stays one-time", () => {
  const hosting = resolvedBase([{ ...base, setup: 3000 }], { slug: "basic-hosting", title: "Basic Hosting", cents: 1500, recurring: true });
  const result = priceBuild([], [], hosting);
  assert.equal(result.total, 3000);
  assert.equal(result.monthly, 1500);
});

test("the same named personal website page cannot be charged as an additional page", () => {
  const additional = { id: "personal-site:additional-page", kind: "feature", label: "Additional page", cents: 6000, category: "Pages", pageNames: true, fields: [{ key: "names", label: "Additional pages" }] };
  const about = { id: "personal-site:about-page", kind: "feature", label: "About page", cents: 6000, category: "Pages" };
  const calculate = name => priceBuild([additional, about], [{ ...select(additional.id), settings: { names: name } }, select(about.id)], base);
  assert.ok(calculate("About").issues.length);
  assert.ok(calculate("").issues.length);
  assert.equal(calculate("Credits").issues.length, 0);
});

test("a choose-N package covers the most valuable eligible units only once", () => {
  const welcome = { id: "welcome", kind: "feature", label: "Welcome messages", cents: 2500 };
  const roles = { ...role, cents: 4000 };
  const pkg = { ...base, cents: 9500, includes: { ids: ["welcome", "roles"], choose: 1 } };
  const both = priceBuild([welcome, roles], [select("welcome"), select("roles")], pkg);
  assert.equal(both.lines.find(line => line.id === "roles").cents, 0);
  assert.equal(both.lines.find(line => line.id === "roles").included, 4000);
  assert.equal(both.lines.find(line => line.id === "welcome").cents, 2500);
  assert.equal(both.total, 12000);
  // A second unit of an included feature is charged; only one unit is covered.
  assert.equal(priceBuild([roles], [select("roles", 2)], pkg).total, 13500);
  // Complexity upgrades on an included feature are still charged.
  const upgraded = { ...roles, complexity: [{ label: "Branded", cents: 500 }] };
  assert.equal(priceBuild([upgraded], [{ ...select("roles"), complexity: "Branded" }], pkg).total, 10000);
  // Features outside the package list are never discounted.
  assert.equal(priceBuild([welcome, roles, logging], [select("logs")], pkg).total, 14500);
});

test("fixed package inclusions satisfy dependencies and appear at no charge", () => {
  const profiles = { id: "profiles", kind: "feature", label: "Character profiles", cents: 10000, needs: ["database"] };
  const inventory = { id: "inventory", kind: "feature", label: "Inventory", cents: 22500, requires: ["profiles"], needs: ["database"] };
  const pkg = { ...base, cents: 20000, includes: { ids: ["profiles"] } };
  const result = priceBuild([profiles, inventory], [select("inventory")], pkg);
  assert.equal(result.issues.length, 0);
  assert.equal(result.total, 42500);
  const included = result.lines.find(line => line.id === "profiles");
  assert.equal(included.cents, 0);
  assert.equal(included.listed, 10000);
  assert.equal(included.included, 10000);
  // Re-selecting an included feature does not charge for it twice.
  assert.equal(priceBuild([profiles, inventory], [select("profiles"), select("inventory")], pkg).total, 42500);
  // Shared infrastructure is listed once, with every feature that uses it.
  assert.deepEqual(result.needs, [{ name: "database", by: ["Character profiles", "Inventory"] }]);
  // An unpriced feature included in a package is covered, not sent to review.
  const auth = { id: "auth", kind: "feature", label: "Authentication", cents: null };
  const dashboard = priceBuild([auth], [], { ...base, includes: { ids: ["auth"] } });
  assert.equal(dashboard.lines.find(line => line.id === "auth").cents, 0);
  assert.deepEqual(dashboard.custom, []);
});

test("recurring costs and setup add-ons stay out of development, and unpriced items are never free", () => {
  const plan = { id: "plan:managed", kind: "recurring", label: "Managed Hosting", cents: 3000 };
  const deploy = { id: "deploy", kind: "addon", label: "Deployment setup", cents: 5000, thirdParty: ["Domain registration"] };
  const combat = { id: "combat", kind: "feature", label: "Combat system", cents: 50000, manual: true };
  const weather = { id: "weather", kind: "feature", label: "Weather system", cents: null, unpriced: true };
  const result = priceBuild([plan, deploy, combat, weather], [select("plan:managed"), select("deploy"), select("combat"), select("weather")], base);
  assert.equal(result.buckets.development, 57500);
  assert.equal(result.buckets.setup, 5000);
  assert.equal(result.buckets.monthly, 3000);
  assert.equal(result.total, 62500);
  assert.equal(result.monthly, 3000);
  assert.deepEqual(result.custom, ["Weather system"]);
  assert.deepEqual(result.provisional, ["Combat system"]);
  assert.equal(result.lines.find(line => line.id === "weather").cents, null);
  assert.deepEqual(result.thirdParty, [{ name: "Domain registration", by: ["Deployment setup"] }]);
});

test("dependency helpers explain chains and protect against accidental removal", () => {
  const currency = { id: "currency", kind: "feature", label: "Currency", cents: 15000 };
  const shop = { id: "shop", kind: "feature", label: "Shop", cents: 20000, requires: ["currency"] };
  const trade = { id: "trade", kind: "feature", label: "Trade", cents: 1000, requires: ["shop"] };
  const options = [currency, shop, trade];
  assert.deepEqual(missingRequirements(options, [], "trade").map(item => item.id), ["shop", "currency"]);
  assert.deepEqual(missingRequirements(options, [select("currency")], "shop"), []);
  assert.deepEqual(missingRequirements(options, [], "shop", { ...base, includes: { ids: ["currency"] } }), []);
  assert.deepEqual(dependents(options, [select("currency"), select("shop")], "currency").map(item => item.id), ["shop"]);
  // Selecting a dependent alone never adds the requirement or its charge silently.
  const alone = priceBuild(options, [select("shop")], base);
  assert.equal(alone.total, 27500);
  assert.equal(alone.issues[0].related, "currency");
});

test("shared build links round-trip without contact details and reject tampering", () => {
  const build = { type: "discord-bot", product: "custom-discord-bot", hosting: "managed", selection: [{ id: "discord-bot:reaction-roles", quantity: 2, settings: { roles: "Up to five" } }] };
  const decoded = decodeBuild(encodeBuild(build));
  assert.equal(decoded.type, "discord-bot");
  assert.equal(decoded.product, "custom-discord-bot");
  assert.equal(decoded.selection[0].quantity, 2);
  assert.equal(decoded.selection[0].settings.roles, "Up to five");
  assert.equal(decodeBuild("not-a-build"), undefined);
  assert.equal(decodeBuild(encodeBuild({ ...build, selection: [build.selection[0], build.selection[0]] })), undefined);
});
