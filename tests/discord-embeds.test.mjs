import assert from "node:assert/strict";
import test from "node:test";
import {
  EMBED_LIMITS, applyFont, composeEmbeds, embedFamilies, embedLength, embedLooks, embedPurposes, embedStyles,
  embedText, formatNumber, parseEmbedIds, webhookPayload,
} from "../src/demos/discord/discord-embeds.ts";

test("embed codes are unique, match their family, and the catalog is complete", () => {
  const ids = embedStyles.map(style => style.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(embedFamilies.length, 12);
  for (const group of embedFamilies) {
    assert.equal(group.styles.length, 10, `E${group.number} should have 10 designs`);
    for (const style of group.styles) {
      assert.match(style.id, new RegExp(`^E${group.number}[A-J]$`));
      assert.match(style.color, /^#[0-9A-F]{6}$/i);
    }
  }
});

test("names are unique so designs are easy to tell apart", () => {
  const names = embedStyles.map(style => style.name);
  assert.equal(new Set(names).size, names.length);
});

test("every design, purpose, and look stays inside Discord's limits", () => {
  for (const style of embedStyles) for (const purpose of embedPurposes) for (const { id: look } of embedLooks) {
    const message = composeEmbeds(style, purpose, { look });
    const where = `${style.id}/${purpose.id}/${look}`;
    assert.ok(message.embeds.length >= 1 && message.embeds.length <= EMBED_LIMITS.embeds, where);
    assert.ok(message.buttons.length <= EMBED_LIMITS.buttons, where);
    const total = message.embeds.reduce((sum, embed) => sum + embedLength(embed), 0);
    assert.ok(total <= EMBED_LIMITS.total, where);
    for (const embed of message.embeds) {
      assert.ok((embed.title ?? "").length <= EMBED_LIMITS.title, where);
      assert.ok((embed.description ?? "").length <= EMBED_LIMITS.description, where);
      assert.ok((embed.fields ?? []).length <= EMBED_LIMITS.fields, where);
      for (const field of embed.fields ?? []) {
        assert.ok(field.name.length > 0 && field.name.length <= EMBED_LIMITS.fieldName, where);
        assert.ok(field.value.length > 0 && field.value.length <= EMBED_LIMITS.fieldValue, where);
      }
      assert.ok(embed.title || embed.description || embed.image || embed.fields?.length, `${where} has an empty embed`);
      assert.ok(!/\{(ft|fT|[TtxnibupPs])\}/.test(JSON.stringify(embed)), `${where} left a template token`);
    }
    const expectedItems = purpose.id === "quote" ? purpose.items : purpose.items.slice(0, style.itemCount);
    for (const entry of expectedItems) {
      const body = style.layout === "code" && purpose.id !== "quote" ? entry.body.replace(/`/g, "") : entry.body;
      assert.ok(embedText(message).includes(body), `${where} lost an item`);
    }
  }
});

test("simple looks have no art; richer looks add art with real URLs", () => {
  for (const style of embedStyles) {
    assert.equal(composeEmbeds(style, embedPurposes[0], { look: "simple" }).art.length, 0, style.id);
    const rich = composeEmbeds(style, embedPurposes[0], { look: "elaborate", origin: "https://scriptmoth.test" });
    assert.ok(rich.art.length + rich.attachments.length >= 2, `${style.id} elaborate has too little art`);
    for (const { embed } of rich.art) assert.ok(rich.embeds[embed], style.id);
  }
});

test("designs don't share a shape: recipes differ within each family and every combination is unique", () => {
  for (const group of embedFamilies) assert.equal(new Set(group.styles.map(style => style.recipe)).size, group.styles.length, `E${group.number}`);
  const shapes = embedStyles.map(style => [style.layout, style.recipe, style.buttons, style.itemCount, style.buttonLabel].join("|"));
  assert.equal(new Set(shapes).size, shapes.length);
});

test("payload buttons follow Discord's component format", () => {
  const style = embedStyles[0];
  const message = composeEmbeds(style, embedPurposes.find(purpose => purpose.id === "info"));
  const payload = webhookPayload(style, message, true);
  assert.equal(payload.components[0].type, 1);
  assert.equal(payload.components[0].components[0].style, 5);
  assert.ok(payload.components[0].components[0].url);
  assert.equal(webhookPayload(style, message, false).components, undefined);
});

test("free text resolves to embed codes without matching channel codes", () => {
  assert.deepEqual(parseEmbedIds("e03a, E1-B and E 12 J; not 02F or E13A or XE01C"), ["E01B", "E03A", "E12J"]);
});

test("fonts and numbering", () => {
  assert.equal(applyFont("Rules 1", "bold-serif"), "𝐑𝐮𝐥𝐞𝐬 𝟏");
  assert.equal(applyFont("Hi", "double"), "ℍ𝕚");
  assert.equal(applyFont("Rules", "smallcaps"), "ʀᴜʟᴇs");
  assert.equal(applyFont("Server Rules", "snake"), "SERVER_RULES");
  assert.deepEqual([0, 1, 2].map(i => formatNumber("I", i)), ["I", "II", "III"]);
  assert.equal(formatNumber("①", 1), "②");
});

test("every design has its own banner, divider, and thumbnail on disk", async () => {
  const { readFileSync, existsSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const seen = new Map();
  for (const style of embedStyles) for (const slot of ["banner", "strip", "thumbnail"]) {
    const path = style.images?.[slot];
    assert.ok(path, `${style.id} has no ${slot}`);
    const file = new URL(`../public${path}`, import.meta.url);
    assert.ok(existsSync(file), `${style.id} ${slot} missing: run scripts/draw-discord-embed-art.mjs`);
    const hash = createHash("sha1").update(readFileSync(file)).digest("hex");
    assert.ok(!seen.has(hash), `${style.id} ${slot} is identical to ${seen.get(hash)}`);
    seen.set(hash, `${style.id} ${slot}`);
  }
});

test("copied JSON never links to the site's example art", () => {
  for (const style of embedStyles) for (const purpose of embedPurposes) {
    const json = JSON.stringify(webhookPayload(style, composeEmbeds(style, purpose, { look: "elaborate" }), true));
    assert.ok(!json.includes("/assets/"), `${style.id}/${purpose.id} links to example art`);
  }
});
