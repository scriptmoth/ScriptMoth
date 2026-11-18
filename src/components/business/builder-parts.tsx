"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Art } from "@/components/ui";
import { assets } from "@/lib/assets";
import { sharedInfrastructure } from "@/data/builder";
import type { Feature, PriceLine, PriceResult, Selection } from "@/lib/business/pricing";

export type Money = (cents: number) => string;
export function moneyFormatter(currency: string): Money {
  return cents => new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}
export function priceLabel(item: Pick<Feature, "cents" | "manual" | "unpriced" | "kind">, fmt: Money) {
  if (item.cents === null) return item.unpriced ? "Price pending review" : "Custom estimate";
  return `${fmt(item.cents)}${item.manual ? "+" : ""}${item.kind === "recurring" ? "/mo" : ""}`;
}
export function linePrice(line: PriceLine, feature: Feature | undefined, fmt: Money) {
  if (line.included && line.cents === 0) return "Included";
  if (line.cents === null) return feature?.unpriced ? "Price pending review" : "Custom estimate";
  return `${fmt(line.cents)}${feature?.manual && line.cents > 0 ? "+" : ""}${line.kind === "recurring" ? "/mo" : ""}`;
}
const sumCost = (items: Feature[], fmt: Money) => {
  const known = items.reduce((sum, item) => sum + (item.cents ?? 0), 0);
  const unknown = items.some(item => item.cents === null);
  return unknown ? known ? `+${fmt(known)} + custom estimate` : "+ custom estimate" : `+${fmt(known)}`;
};

export type Prompt =
  | { kind: "add"; id: string; missing: Feature[]; conflicts: Feature[] }
  | { kind: "remove"; id: string; dependents: Feature[] };

export function FeatureCard({ feature, selection, fmt, included, eligible, fixed, covered, featureMap, recent, prompt, onToggle, onCustomize, onPrompt, children }: {
  feature: Feature; selection?: Selection; fmt: Money; included: number; eligible: boolean; fixed: boolean; covered: Set<string>;
  featureMap: Map<string, Feature>; recent: boolean; prompt?: Prompt; onToggle: () => void;
  onCustomize: (change: Partial<Selection>) => void; onPrompt: (choice: "all" | "only" | "cancel") => void; children?: ReactNode;
}) {
  const selected = Boolean(selection) || fixed;
  const inputId = `feature-${feature.id.replace(/[^a-z0-9]+/gi, "-")}`;
  const requirements = (feature.requires ?? []).map(id => featureMap.get(id)).filter(item => item !== undefined);
  return <article className="feature-card" data-selected={selected || undefined} data-kind={feature.kind} data-sparkle={recent || undefined}>
    <div className="feature-card-head">
      <input id={inputId} type="checkbox" checked={selected} disabled={fixed} onChange={onToggle} aria-describedby={`${inputId}-desc`} />
      <label htmlFor={inputId} className="feature-name">{feature.label}</label>
      <span className="price-tag" data-state={fixed ? "included" : feature.cents === null ? "custom" : feature.manual ? "starting" : "fixed"}>
        {fixed ? "Included" : priceLabel(feature, fmt)}
      </span>
      {recent && <span className="feature-check" aria-hidden="true"><Check size={14} /></span>}
      {recent && <span className="choice-sparkle sparkle" aria-hidden="true" />}
    </div>
    <div id={`${inputId}-desc`} className="feature-body">
      {feature.description && <p>{feature.description}</p>}
      {feature.example && <p className="feature-example"><span>Example</span> {feature.example}</p>}
      <ul className="feature-tags">
        {fixed && <li data-tone="good">Included in your package</li>}
        {!fixed && included > 0 && <li data-tone="good">Covered by your package{selection && selection.quantity > 1 ? " (one)" : ""}</li>}
        {!fixed && eligible && !included && <li>Can be one of your package’s included choices</li>}
        {feature.manual && feature.cents !== null && <li>Starting price, confirmed after review</li>}
        {feature.unpriced && <li>Not priced yet. Scriptmoth will price it with your quote</li>}
        {requirements.map(item => <li key={item.id} data-tone="info">Needs {item.label} ({covered.has(item.id) ? "included in your package" : priceLabel(item, fmt)})</li>)}
        {feature.needs?.map(key => sharedInfrastructure[key] && <li key={key}>Uses the shared {sharedInfrastructure[key].label.toLowerCase()}</li>)}
        {feature.thirdParty?.map(text => <li key={text} data-tone="info">May need: {text}</li>)}
        {feature.time && <li>Adds about {feature.time}</li>}
      </ul>
    </div>
    {prompt && <PromptBox prompt={prompt} feature={feature} fmt={fmt} onChoose={onPrompt} />}
    {selection && <FeatureConfig feature={feature} selection={selection} fmt={fmt} onCustomize={onCustomize} />}
    {children}
  </article>;
}

function PromptBox({ prompt, feature, fmt, onChoose }: { prompt: Prompt; feature: Feature; fmt: Money; onChoose: (choice: "all" | "only" | "cancel") => void }) {
  const names = (items: Feature[]) => items.map(item => item.label).join(", ");
  return <div className="feature-prompt" role="group" aria-label={`${feature.label} needs a decision`} aria-live="polite">
    {prompt.kind === "add" && prompt.conflicts.length > 0 ? <>
      <p><strong>{feature.label}</strong> can’t be combined with <strong>{names(prompt.conflicts)}</strong>, because they do the same job.</p>
      <div className="prompt-actions">
        <button type="button" className="button button--outline" onClick={() => onChoose("all")}>Swap to {feature.label}</button>
        <button type="button" className="text-link" onClick={() => onChoose("cancel")}>Keep my current choice</button>
      </div>
    </> : prompt.kind === "add" ? <>
      <p><strong>{feature.label}</strong> needs <strong>{names(prompt.missing)}</strong> to work. Nothing is added until you choose.</p>
      <ul>{prompt.missing.map(item => <li key={item.id}>{item.label} · {priceLabel(item, fmt)}{item.description ? ` · ${item.description}` : ""}</li>)}</ul>
      <div className="prompt-actions">
        <button type="button" className="button button--outline" onClick={() => onChoose("all")}>Add both ({sumCost([feature, ...prompt.missing], fmt)})</button>
        <button type="button" className="text-link" onClick={() => onChoose("only")}>Add {feature.label} only</button>
        <button type="button" className="text-link" onClick={() => onChoose("cancel")}>Cancel</button>
      </div>
    </> : <>
      <p><strong>{names(prompt.dependents)}</strong> {prompt.dependents.length === 1 ? "depends" : "depend"} on <strong>{feature.label}</strong>.</p>
      <div className="prompt-actions">
        <button type="button" className="button button--outline" onClick={() => onChoose("cancel")}>Keep {feature.label}</button>
        <button type="button" className="text-link" onClick={() => onChoose("all")}>Remove all of them</button>
        <button type="button" className="text-link" onClick={() => onChoose("only")}>Remove {feature.label} only</button>
      </div>
    </>}
  </div>;
}

function FeatureConfig({ feature, selection, fmt, onCustomize }: { feature: Feature; selection: Selection; fmt: Money; onCustomize: (change: Partial<Selection>) => void }) {
  const max = feature.max ?? 1;
  const min = feature.min ?? 1;
  if (!feature.complexity?.length && max <= 1 && !feature.fields?.length && !feature.note) return null;
  const group = `level-${feature.id}`;
  return <div className="feature-config">
    {feature.complexity?.length ? <fieldset className="level-picker">
      <legend>How much should it do?</legend>
      <label data-active={!selection.complexity || undefined}>
        <input type="radio" name={group} aria-label={feature.standard?.label ?? "Standard"} checked={!selection.complexity} onChange={() => onCustomize({ complexity: undefined })} />
        <span><strong>{feature.standard?.label ?? "Standard"}</strong>{feature.standard?.description && <small>{feature.standard.description}</small>}</span>
        <em>{feature.cents === null ? "—" : fmt(feature.cents)}</em>
      </label>
      {feature.complexity.map(option => <label key={option.label} data-active={selection.complexity === option.label || undefined}>
        <input type="radio" name={group} aria-label={`${option.label}, adds ${fmt(option.cents)}`} checked={selection.complexity === option.label} onChange={() => onCustomize({ complexity: option.label })} />
        <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
        <em>+{fmt(option.cents)}{feature.cents !== null ? ` (${fmt(feature.cents + option.cents)} total)` : ""}</em>
      </label>)}
    </fieldset> : null}
    {max > 1 && <label className="field">How many?
      <select value={selection.quantity} onChange={event => onCustomize({ quantity: Number(event.target.value) })}>
        {Array.from({ length: max - min + 1 }, (_, index) => index + min).map(value => <option key={value} value={value}>{value}{feature.cents !== null ? ` · ${fmt((feature.cents + (feature.complexity?.find(option => option.label === selection.complexity)?.cents ?? 0)) * value)}` : ""}</option>)}
      </select></label>}
    {feature.fields?.map(field => {
      const value = selection.settings?.[field.key] ?? "";
      const change = (next: string) => onCustomize({ settings: { ...selection.settings, [field.key]: next } });
      return <label className="field" key={field.key}>{field.label} <span className="field-optional">(optional)</span>{field.choices
        ? <select value={value} onChange={event => change(event.target.value)}><option value="">Not sure yet</option>{field.choices.map(choice => <option key={choice}>{choice}</option>)}</select>
        : <input value={value} maxLength={500} onChange={event => change(event.target.value)} />}</label>;
    })}
    {feature.note && <p className="feature-note">{feature.note}</p>}
  </div>;
}

export function EstimatePanel({ title, price, featureMap, fmt, pulse }: {
  title: string; price: PriceResult; featureMap: Map<string, Feature>; fmt: Money; pulse: number;
}) {
  const by = (kinds: PriceLine["kind"][]) => price.lines.filter(line => kinds.includes(line.kind));
  const development = by(["base", "feature", "discount", "minimum"]);
  const setup = by(["addon", "setup"]);
  const monthly = by(["recurring"]);
  const onlyCustom = price.total === 0 && price.custom.length > 0;
  return <div className="estimate-panel">
    <div className="estimate-head">
      <span className="estimate-moth" aria-hidden="true"><Art artwork={assets.mark} sizes="40px" /></span>
      <div><p className="estimate-kicker">Your build</p><h2>{title}</h2></div>
    </div>
    <div className="crt" role="status" aria-live="polite" aria-atomic="true">
      <span className="crt-label">One-time estimate</span>
      <strong key={pulse} className="crt-total">{onlyCustom ? "Custom estimate" : fmt(price.total)}
        {!onlyCustom && price.custom.length > 0 && <span className="crt-plus"> + custom features</span>}</strong>
      <span className="crt-sub">{price.monthly > 0 ? `Plus ${fmt(price.monthly)}/mo hosting & management, billed separately`
        : monthly.length ? "Monthly costs: custom estimate" : "No monthly costs selected"}</span>
      {pulse > 0 && <span className="crt-sparkles" key={`s${pulse}`} aria-hidden="true"><i className="sparkle" /><i className="sparkle" /><i className="sparkle" /></span>}
    </div>
    <EstimateSection title="Development" total={fmt(price.buckets.development)} lines={development} featureMap={featureMap} fmt={fmt} open
      hint="Building and testing your project. Paid once." />
    {setup.length > 0 && <EstimateSection title="Setup & deployment" total={fmt(price.buckets.setup)} lines={setup} featureMap={featureMap} fmt={fmt}
      hint="Getting it online and moving content in. Paid once, included in the one-time estimate." />}
    {monthly.length > 0 && <EstimateSection title="Monthly hosting & management" total={`${fmt(price.buckets.monthly)}/mo`} lines={monthly} featureMap={featureMap} fmt={fmt}
      hint="Billed every month. Never added to the one-time estimate. Provider infrastructure usage is billed separately at cost." />}
    {price.custom.length > 0 && <div className="estimate-flag" data-tone="custom">
      <strong>Needs a custom estimate</strong>
      <p>{price.custom.join(", ")}. These aren’t included in the number above. Scriptmoth prices them after reviewing what you need.</p>
    </div>}
    {price.provisional.length > 0 && <div className="estimate-flag">
      <strong>Starting prices</strong>
      <p>{price.provisional.join(", ")} {price.provisional.length === 1 ? "starts" : "start"} at the amount shown. The final price is confirmed after review.</p>
    </div>}
    {price.needs.length > 0 && <details className="estimate-section">
      <summary><span>Shared setup, counted once</span><span>{price.needs.length}</span></summary>
      <ul className="estimate-notes">{price.needs.map(({ name, by }) => <li key={name}>
        <strong>{sharedInfrastructure[name]?.label ?? name}</strong> · used by {by.join(", ")}
        <small>{sharedInfrastructure[name]?.explain}</small>
      </li>)}</ul>
    </details>}
    {price.thirdParty.length > 0 && <details className="estimate-section">
      <summary><span>Accounts you may pay for separately</span><span>{price.thirdParty.length}</span></summary>
      <ul className="estimate-notes">{price.thirdParty.map(({ name, by }) => <li key={name}>{name}<small>For {by.join(", ")}. Paid directly to that provider, not to Scriptmoth.</small></li>)}</ul>
    </details>}
    <p className="build-estimate-note">Estimate only, not a binding offer. Scriptmoth confirms the final price after reviewing your requirements.</p>
  </div>;
}

function EstimateSection({ title, total, lines, featureMap, fmt, open, hint }: {
  title: string; total: string; lines: PriceLine[]; featureMap: Map<string, Feature>; fmt: Money; open?: boolean; hint: string;
}) {
  return <details className="estimate-section" open={open}>
    <summary><span>{title}</span><span>{total}</span></summary>
    <p className="estimate-hint">{hint}</p>
    <ul className="estimate-lines">{lines.map(line => {
      const feature = featureMap.get(line.id);
      const about = [feature?.description ?? (line.kind === "base" ? "Your starter package, as described in step one." : ""),
        line.complexity && `Level: ${line.complexity}.`,
        line.included && line.cents !== 0 ? `Your package covers ${fmt(line.included)} of this.` : line.included ? "Covered by your package price, so it isn’t charged again." : "",
      ].filter(Boolean).join(" ");
      return <li key={line.id}><details>
        <summary><span>{line.label}{line.quantity > 1 ? ` × ${line.quantity}` : ""}</span><span>{linePrice(line, feature, fmt)}</span></summary>
        {about && <p>{about}</p>}
      </details></li>;
    })}</ul>
  </details>;
}
