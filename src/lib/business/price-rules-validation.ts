import { amount, list, textValue } from "./rules";
import type { PricingRules } from "./pricing";

export function readPricingRules(form: FormData): PricingRules {
  const get = (name: string, max = 180) => textValue(form, name, max);
  const rows = <T>(name: string, parse: (a: string, b: string) => T) => list(get(name, 2000)).map(line => {
    const separator = line.indexOf("|");
    if (separator < 1) throw new Error("Use the pipe-separated format shown on the form.");
    return parse(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  });
  const integer = (value: string, max = 100) => {
    if (!/^\d{1,4}$/.test(value) || Number(value) > max) throw new Error("Enter a valid whole number.");
    return Number(value);
  };
  const min = get("quantity_min") ? integer(get("quantity_min")) : 1;
  const max = get("quantity_max") ? integer(get("quantity_max")) : 1;
  if (!min || min > max) throw new Error("Check the minimum and maximum quantities.");
  const tiers = rows("tiers", (from, value) => ({ from: integer(from), cents: amount(value) }));
  if (new Set(tiers.map(item => item.from)).size !== tiers.length || tiers.some(item => item.from < min || item.from > max)) throw new Error("Quantity tiers need distinct thresholds inside the quantity range.");
  const fields = rows("fields", (key, description) => {
    const [label, ...choices] = description.split("|").map(value => value.trim()).filter(Boolean);
    if (!/^[a-z][a-z0-9_-]{0,39}$/.test(key) || !label || label.length > 100 || choices.some(value => value.length > 120)) throw new Error("Use a valid customization key and label.");
    return { key, label, choices: choices.length ? choices : undefined };
  });
  if (fields.length > 10 || new Set(fields.map(item => item.key)).size !== fields.length) throw new Error("Use up to ten uniquely named customization fields.");
  const complexity = rows("complexity", (label, value) => {
    if (label.length > 60) throw new Error("Complexity labels must be 60 characters or fewer.");
    return { label, cents: amount(value) };
  });
  const money = (name: string) => get(name) ? amount(get(name)) : undefined;
  return { category: get("category") || "Options", order: get("order") ? integer(get("order"), 9999) : undefined,
    min, max, tiers, setup: money("setup"), discount: money("discount"), minimum: money("minimum"),
    requires: list(get("requires", 2000)), conflicts: list(get("conflicts", 2000)), suggests: list(get("suggests", 2000)),
    fields, complexity, note: get("note", 800), manual: form.get("manual") === "yes", default: form.get("default") === "yes" };
}
