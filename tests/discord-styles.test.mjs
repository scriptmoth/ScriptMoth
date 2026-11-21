import assert from "node:assert/strict";
import test from "node:test";
import { channelNotes, channelTemplate, discordStyles, parseStyleIds, styleFamilies } from "../src/demos/discord/discord-styles.ts";

test("style codes are unique and match their family number", () => {
  const ids = discordStyles.map(style => style.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const group of styleFamilies) {
    assert.ok(group.styles.length >= 3, `${group.number} needs several styles`);
    for (const style of group.styles) assert.match(style.id, new RegExp(`^${group.number}[A-Z]$`));
  }
});

test("free text resolves to known style codes in catalog order", () => {
  assert.deepEqual(parseStyleIds("use 02f for channels, 4B for categories, 09-c and 02F again; not ROLE-01 A or 99Z"), ["02F", "04B", "09C"]);
  assert.deepEqual(parseStyleIds(""), []);
});

test("formatting details find the name and flag what Discord changes", () => {
  assert.equal(channelTemplate("୨🍓୧﹒welcome"), "୨🍓୧﹒{name}");
  assert.equal(channelNotes("♡﹒welcome").length, 0);
  assert.ok(channelNotes("( welcome )").some(note => note.includes("spaces")));
});
