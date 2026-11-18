"use client";

import type { ReactNode } from "react";
import { Check, ExternalLink } from "lucide-react";
import { Art } from "@/components/ui";
import { Field } from "./forms";
import { linePrice, priceLabel, type Money } from "./builder-parts";
import { builderBases, projectGroups, sharedInfrastructure } from "@/data/builder";
import { assets } from "@/lib/assets";
import { hostingModes, projectTypes, type HostingMode, type ProjectType } from "@/lib/business/rules";
import type { BuilderPackage } from "@/lib/business/builder";
import type { Feature, PriceResult, Selection } from "@/lib/business/pricing";

export const steps = ["Project", "Features", "Hosting", "Your details", "Receipt"] as const;
export const stepTitles = [
  "What are we building?", "Pick your features", "Where will it live?", "A little about you", "Your project receipt",
] as const;
export const groupArt = { bot: assets.bot, websites: assets.websites, coding: assets.coding, process: assets.process };
export const modeCopy: Record<HostingMode, { art: typeof assets.hosting; body: string }> = {
  client: { art: assets.websites,
    body: "You create the hosting account and pay the provider directly. Scriptmoth gives you deployment instructions, and can do the deployment setup for you as an add-on." },
  managed: { art: assets.hosting,
    body: "Scriptmoth puts your project online and looks after it. You pay a monthly management fee to Scriptmoth, and the hosting provider’s usage is billed separately at cost." },
  unsure: { art: assets.faq, body: "That’s fine. Scriptmoth will suggest a hosting approach for this project and confirm it with you." },
};
export const glossary: [string, string][] = [
  ["Hosting infrastructure fees", "What the hosting provider charges to keep your site or bot running. Paid to the provider (or passed through at cost on managed plans)."],
  ["Initial deployment", "Putting the finished project online the first time and checking it works. A one-time cost."],
  ["Ongoing maintenance", "Keeping things updated, backed up, and running after launch. Part of a monthly management plan."],
  ["Included bug fixes", "For 14 days after you accept the work, bugs in the agreed features are fixed at no charge."],
  ["New feature development", "Anything not in the agreed scope, including after launch. Always quoted separately first."],
  ["Emergency troubleshooting", "Urgent help when something breaks outside the bug-fix window. Quoted when needed unless your plan covers it."],
  ["Third-party API costs", "Fees charged by other services your project connects to, like payment processors or newsletter tools. Paid directly to them."],
];

type Context = { options: Feature[]; versions: Record<string, string> };

export function ProjectStep({ contexts, packages, chosen, buildType, buildProduct, fmt, onChoose }: {
  contexts: Partial<Record<ProjectType, Context>>; packages: BuilderPackage[];
  chosen: boolean; buildType: ProjectType; buildProduct: string; fmt: Money;
  onChoose: (type: ProjectType, product: string) => void;
}) {
  const item = packages.find(entry => entry.slug === buildProduct && entry.type === buildType);
  return <div className="business-stack">
    <p className="step-intro">Start with a project type. Each starter package is a working base, not every feature at once. You’ll add features next.</p>
    {projectGroups.map(group => {
      const choices = group.choices.filter(choice => Object.hasOwn(contexts, choice.type) &&
        (!choice.slug || packages.some(entry => entry.slug === choice.slug && entry.type === choice.type)));
      if (!choices.length) return null;
      return <section key={group.id} className="project-group" aria-labelledby={`group-${group.id}`}>
        <header>
          <Art artwork={groupArt[group.art]} sizes="72px" />
          <div><h3 id={`group-${group.id}`}>{group.title}</h3><p>{group.blurb}</p></div>
        </header>
        <div className="package-cards">{choices.map(choice => {
          const pkg = packages.find(entry => entry.slug === choice.slug && entry.type === choice.type);
          const meta = builderBases[choice.type];
          const active = chosen && buildType === choice.type && buildProduct === choice.slug;
          const cost = pkg ? priceLabel({ cents: pkg.cents, manual: pkg.manual, kind: "base" }, fmt) : "Custom estimate";
          return <button key={`${choice.type}:${choice.slug}`} type="button" className="package-card" aria-pressed={active}
            onClick={() => onChoose(choice.type, choice.slug)}>
            <span className="package-card-title">{pkg?.title ?? meta.label}</span>
            <span className="package-card-price">{cost}{pkg?.cents != null && <small> starting price</small>}</span>
            <span className="package-card-summary">{pkg?.summary ?? meta.summary}</span>
            {active && <span className="package-card-check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>}
          </button>;
        })}</div>
      </section>;
    })}
    {chosen && <div className="included-box" aria-live="polite">
      <h3>{item ? `${item.title} includes` : builderBases[buildType].label}</h3>
      {item?.included.length ? <ul>{item.included.map(line => <li key={line}>{line}</li>)}</ul> : <p>{builderBases[buildType].summary}</p>}
      {item?.includes?.choose && <p className="included-hint">Pick your {item.includes.choose === 1 ? "included module" : `${item.includes.choose} included choices`} on the next step. They show as “Covered by your package”.</p>}
      {(buildType === "improvement" || buildType === "web-app" && !item?.cents) && <p className="included-hint">This kind of work needs a look at the details first, so it shows as a custom estimate.</p>}
    </div>}
  </div>;
}

export function FeaturesStep({ features, categories, activeTab, picked, fixed, notes, setNotes, setTab, clearPrompt, renderCard }: {
  features: Feature[]; categories: string[]; activeTab: string;
  picked: Map<string, Selection>; fixed: Set<string>; notes: string;
  setNotes: (value: string) => void; setTab: (value: string) => void; clearPrompt: () => void;
  renderCard: (feature: Feature) => ReactNode;
}) {
  return <div className="business-stack">
    {features.length ? <>
      <p className="step-intro">Tick what you want. Prices update instantly in your estimate. Selected features open up to show options and upgrades.</p>
      <div className="feature-tabs" role="group" aria-label="Feature categories">{categories.map(category => {
        const count = features.filter(item => (item.category || "Options") === category && (picked.has(item.id) || fixed.has(item.id))).length;
        return <button key={category} type="button" aria-pressed={activeTab === category} onClick={() => { setTab(category); clearPrompt(); }}>
          {category}{count > 0 && <span className="tab-count">{count}</span>}
        </button>;
      })}</div>
      <div className="feature-grid" aria-label={`${activeTab} features`} role="group">
        {features.filter(item => (item.category || "Options") === activeTab).map(renderCard)}
      </div>
    </> : <p>There are no preset features for this project. Describe what you need below.</p>}
    <label className="field notes-field">Anything else you’d like your project to do?
      <span className="field-hint">Describe it in your own words. No technical terms needed. For example, “I want members to adopt pets that get hungry if no one feeds them.”</span>
      <textarea rows={4} maxLength={2500} value={notes} onChange={event => setNotes(event.target.value)} />
    </label>
  </div>;
}

export function HostingStep({ hosting, provider, setProvider, advice, plans, planActive, addons, buildType, fmt, changeHosting, choosePlan, renderCard }: {
  hosting: HostingMode; provider: string; setProvider: (value: string) => void;
  advice: { mode: HostingMode; title: string; reason: string };
  plans: { id: string; title: string; summary: string; cents: number | null }[];
  planActive: (id: string) => boolean; addons: Feature[]; buildType: ProjectType; fmt: Money;
  changeHosting: (mode: HostingMode) => void; choosePlan: (slug: string) => void;
  renderCard: (feature: Feature) => ReactNode;
}) {
  return <div className="business-stack">
    <p className="step-intro">Websites and bots need a computer that stays online, called hosting. Choose who looks after it. Hosting is billed monthly and never added to the one-time total.</p>
    <div className="hosting-modes" role="radiogroup" aria-label="Who will manage hosting?">
      {(Object.keys(modeCopy) as HostingMode[]).map(mode => <label key={mode} className="hosting-mode" data-active={hosting === mode || undefined}>
        <input type="radio" name="hosting_choice" checked={hosting === mode} onChange={() => changeHosting(mode)} />
        <Art artwork={modeCopy[mode].art} sizes="56px" />
        <strong>{hostingModes[mode]}</strong>
        <span>{modeCopy[mode].body}</span>
      </label>)}
    </div>
    {hosting === "unsure" && <div className="advice-box">
      <p><strong>Our suggestion: {advice.title}.</strong> {advice.reason}</p>
      {advice.mode !== "unsure" && <button type="button" className="button button--outline" onClick={() => changeHosting(advice.mode)}>Use this suggestion</button>}
    </div>}
    {hosting === "client" && <label className="field">Which hosting provider do you plan to use?
      <span className="field-hint">Write “not chosen yet” if you don’t know. Scriptmoth checks it will work before agreeing on scope.</span>
      <input value={provider} onChange={event => setProvider(event.target.value)} maxLength={400} placeholder="e.g. Cloudflare Pages free plan, or not chosen yet" />
      <a className="text-link" href="/resources" target="_blank" rel="noreferrer">Compare hosting providers <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>
    </label>}
    {hosting === "managed" && plans.length > 0 && <fieldset className="build-group">
      <legend>Choose a management plan (monthly)</legend>
      <div className="plan-cards">
        {buildType !== "hosting" && <label className="plan-card" data-active={!plans.some(plan => planActive(plan.id)) || undefined}>
          <input type="radio" name="plan_choice" checked={!plans.some(plan => planActive(plan.id))} onChange={() => choosePlan("")} />
          <strong>Decide later</strong><span>Scriptmoth recommends a plan with your quote.</span><em>—</em>
        </label>}
        {plans.map(plan => <label key={plan.id} className="plan-card" data-active={planActive(plan.id) || undefined}>
          <input type="radio" name="plan_choice" checked={planActive(plan.id)} onChange={() => choosePlan(plan.id)} />
          <strong>{plan.title}</strong><span>{plan.summary}</span>
          <em>{plan.cents === null ? "Custom estimate" : `${fmt(plan.cents)}/mo`}</em>
        </label>)}
      </div>
      <p className="field-hint">Plans cover management. Provider infrastructure usage is billed separately at cost, and setup is quoted with your project.</p>
    </fieldset>}
    {addons.length > 0 && <fieldset className="build-group">
      <legend>One-time setup & launch</legend>
      <div className="feature-grid">{addons.map(renderCard)}</div>
    </fieldset>}
    <details className="glossary">
      <summary className="business-summary">What’s the difference between hosting, maintenance, and support?</summary>
      <dl>{glossary.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
    </details>
  </div>;
}

export function DetailsStep({ step, initial, account }: {
  step: number;
  initial: Partial<{ name: string; email: string; project_name: string; discord: string; budget: string; deadline: string; description: string; references: string; existing: string }>;
  account?: { email: string; name: string };
}) {
  return <div hidden={step !== 3}>
    <p className="step-intro">Only your name, email, and a short description are required. Everything else is optional.</p>
    <div className="form-grid">
      <Field name="name" label="Preferred name" value={initial.name ?? account?.name} required={step === 3} max={100} />
      {account ? <p>Contact email <strong>{account.email}</strong><input type="hidden" name="email" value={account.email} /></p>
        : <Field name="email" label="Email" type="email" value={initial.email} required={step === 3} max={254} />}
      <Field name="project_name" label="Project name" value={initial.project_name} required={step === 3} max={150} />
      <Field name="discord" label="Discord username (optional)" value={initial.discord} max={100} />
      <Field name="budget" label="Budget range (optional)" value={initial.budget} max={120} />
      <Field name="deadline" label="Desired completion date (optional)" type="date" value={initial.deadline} />
      <Field name="description" label="Describe the project in a few sentences" large value={initial.description} required={step === 3} max={5000} />
      <Field name="references" label="Reference links, one per line (optional)" large value={initial.references} max={2000} />
      <Field name="existing" label="Existing website or bot (optional)" large value={initial.existing} max={1500} />
      <label className="field">Reference files (optional, up to four, 4 MB combined)<input name="attachments" type="file" multiple accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx,.zip" /></label>
    </div>
  </div>;
}

export function ReceiptStep({ buildType, title, hosting, provider, price, picked, featureMap, notes, detailLines, fmt }: {
  buildType: ProjectType; title: string; hosting: HostingMode; provider: string;
  price: PriceResult; picked: Map<string, Selection>; featureMap: Map<string, Feature>;
  notes: string; detailLines: [string, string][]; fmt: Money;
}) {
  return <div className="receipt-slot">
    <div className="receipt" aria-label="Project summary">
      <p className="receipt-head">✦ SCRIPTMOTH ✦<br /><small>project estimate</small></p>
      <dl className="receipt-meta">
        <div><dt>Category</dt><dd>{projectTypes[buildType]}</dd></div>
        <div><dt>Base package</dt><dd>{title}</dd></div>
        <div><dt>Hosting</dt><dd>{hostingModes[hosting]}{hosting === "client" && provider ? ` · ${provider}` : ""}</dd></div>
      </dl>
      {([["Development", ["base", "feature", "discount", "minimum"]], ["Setup & deployment", ["addon", "setup"]], ["Monthly (billed separately)", ["recurring"]]] as const).map(([heading, kinds]) => {
        const rows = price.lines.filter(line => (kinds as readonly string[]).includes(line.kind));
        return rows.length ? <section key={heading}><h3>{heading}</h3><ul>{rows.map(line => {
          const selection = picked.get(line.id);
          const feature = featureMap.get(line.id);
          const settings = Object.entries(selection?.settings ?? {}).filter(([, value]) => value);
          return <li key={line.id}><span>{line.label}{line.quantity > 1 ? ` × ${line.quantity}` : ""}
            {line.complexity && <small>{line.complexity}</small>}
            {feature?.requires?.length ? <small>Needs {feature.requires.map(id => featureMap.get(id)?.label).filter(Boolean).join(", ")}</small> : null}
            {settings.map(([key, value]) => <small key={key}>{feature?.fields?.find(field => field.key === key)?.label ?? key}: {value}</small>)}
          </span><span>{linePrice(line, feature, fmt)}</span></li>;
        })}</ul></section> : null;
      })}
      <p className="receipt-total"><span>One-time estimate</span><strong>{fmt(price.total)}{price.custom.length > 0 && " + custom"}</strong></p>
      <p className="receipt-total"><span>Monthly</span><strong>{price.monthly ? `${fmt(price.monthly)}/mo` : "—"}</strong></p>
      {(price.custom.length > 0 || price.provisional.length > 0) && <section><h3>Needs manual review</h3><ul>
        {price.custom.map(label => <li key={label}><span>{label}</span><span>custom</span></li>)}
        {price.provisional.map(label => <li key={label}><span>{label}</span><span>starting price</span></li>)}
      </ul></section>}
      {price.thirdParty.length > 0 && <section><h3>Accounts you may need</h3><ul>{price.thirdParty.map(({ name }) => <li key={name}><span>{name}</span></li>)}</ul></section>}
      {notes.trim() && <section><h3>Your notes</h3><p className="business-prose">{notes}</p></section>}
      {detailLines.length > 0 && <section><h3>Contact & details</h3><dl>{detailLines.map(([label, value], index) => <div key={index} className="build-detail"><dt>{label}</dt><dd className="business-prose">{value}</dd></div>)}</dl></section>}
      <p className="receipt-foot">Estimate only, not a binding offer. Sending creates a request for review. Scriptmoth confirms the final price and schedule in a separate quote, and nothing is charged until you accept it.</p>
    </div>
  </div>;
}

export function buildQuoteText({ build, title, price, featureMap, notes, provider, fmt }: {
  build: { type: ProjectType; product: string; selection: Selection[]; hosting: HostingMode };
  title: string; price: PriceResult; featureMap: Map<string, Feature>; notes: string; provider: string; fmt: Money;
}) {
  const lines = (kinds: string[]) => price.lines.filter(line => kinds.includes(line.kind)).map(line => {
    const feature = featureMap.get(line.id);
    return `  • ${line.label}${line.quantity > 1 ? ` × ${line.quantity}` : ""}${line.complexity ? ` (${line.complexity})` : ""}: ${linePrice(line, feature, fmt)}`;
  });
  const settings = build.selection.flatMap(item => Object.entries(item.settings ?? {}).filter(([, value]) => value)
    .map(([key, value]) => `  • ${featureMap.get(item.id)?.label ?? item.id} · ${featureMap.get(item.id)?.fields?.find(field => field.key === key)?.label ?? key}: ${value}`));
  const section = (heading: string, body: string[]) => body.length ? [heading, ...body, ""] : [];
  return [
    "SCRIPTMOTH PROJECT ESTIMATE", `Category: ${projectTypes[build.type]}`, `Base package: ${title}`, "",
    ...section("Development (one-time)", lines(["base", "feature", "discount", "minimum"])),
    ...section("Setup & deployment (one-time)", lines(["addon", "setup"])),
    ...section("Monthly (billed separately)", lines(["recurring"])),
    ...section("Choices and settings", settings),
    `Estimated one-time total: ${fmt(price.total)}${price.custom.length ? " + custom features" : ""}`,
    `Estimated monthly: ${price.monthly ? `${fmt(price.monthly)}/mo` : "none selected"}`,
    `Hosting preference: ${hostingModes[build.hosting]}${build.hosting === "client" && provider ? ` (${provider})` : ""}`, "",
    ...section("Needs manual review", [...price.custom.map(label => `  • ${label}: custom estimate`), ...price.provisional.map(label => `  • ${label}: starting price`)]),
    ...section("Shared setup (counted once)", price.needs.map(({ name, by }) => `  • ${sharedInfrastructure[name]?.label ?? name}: ${by.join(", ")}`)),
    ...section("Third-party accounts you may need", price.thirdParty.map(({ name }) => `  • ${name}`)),
    ...section("Notes", notes.trim() ? [notes.trim()] : []),
    "Estimate only, not a binding offer. Scriptmoth confirms the final price after reviewing the requirements.",
  ].join("\n");
}
