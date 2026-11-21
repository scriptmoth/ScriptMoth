"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Copy, Link2, Printer, RotateCcw, Save, Send } from "lucide-react";
import { Art, Button, ButtonLink, Window } from "@/components/ui";
import { assets } from "@/lib/assets";
import { builderBases, recommendHosting } from "@/data/builder";
import { hostingModes, type HostingMode, type ProjectType } from "@/lib/business/rules";
import { dependents, encodeBuild, missingRequirements, packageCoverage, parseSelections, priceBuild, resolvedBase, type Feature, type Selection } from "@/lib/business/pricing";
import type { BuilderPackage } from "@/lib/business/builder";
import type { InquiryData } from "@/lib/business/inquiries";
import { requestQuote } from "@/app/request-a-quote/actions";
import { EstimatePanel, FeatureCard, moneyFormatter, priceLabel, type Prompt } from "./builder-parts";
import {
  DetailsStep, FeaturesStep, HostingStep, ProjectStep, ReceiptStep, buildQuoteText, steps, stepTitles,
} from "./builder-steps";

const localKey = "scriptmoth-build-v2";
type Context = { options: Feature[]; versions: Record<string, string> };
type Build = { type: ProjectType; product: string; selection: Selection[]; hosting: HostingMode };
/** Project types and packages where Discord style library codes are useful. */
const showcaseTypes = new Set(["discord-bot", "discord-setup", "roleplay-bot"]);
const showcaseProducts = new Set(["custom-bot-dashboard", "bot-website-integration"]);
const hostingOption = (id: string) => id.startsWith("plan:") || id.endsWith(":managed-hosting");

export function QuoteBuilder({ contexts, packages, initial, account, currency, initialReference, acceptsSubmissions }: {
  contexts: Partial<Record<ProjectType, Context>>; packages: BuilderPackage[]; initial: Partial<InquiryData>;
  account?: { email: string; name: string }; currency: string; initialReference?: string; acceptsSubmissions: boolean;
}) {
  const firstType = (Object.keys(contexts)[0] ?? "other") as ProjectType;
  const initialType = initial.type && Object.hasOwn(contexts, initial.type) ? initial.type as ProjectType : firstType;
  const defaults = (type: ProjectType) => (contexts[type]?.options ?? []).filter(item => item.default && item.kind !== "base")
    .map(item => ({ id: item.id, quantity: item.min ?? 1 }));
  const [build, setBuild] = useState<Build>(() => ({
    type: initialType, product: initial.product && Object.hasOwn(contexts[initialType]?.versions ?? {}, initial.product) ? initial.product : "",
    selection: initial.configuration ?? defaults(initialType), hosting: initial.hosting_mode ?? "unsure",
  }));
  const [chosen, setChosen] = useState(Boolean(initial.type && Object.hasOwn(contexts, initial.type)));
  const [provider, setProvider] = useState(initial.hosting_provider ?? "");
  const [notes, setNotes] = useState(initial.features ?? "");
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("");
  const [recentOption, setRecentOption] = useState("");
  const [pulse, setPulse] = useState(0);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [reference, setReference] = useState(initialReference ?? "");
  const [confirmation, setConfirmation] = useState("");
  const [detailLines, setDetailLines] = useState<[string, string][]>([]);
  const [feedback, setFeedback] = useState<{ error?: string; message?: string }>({});
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (confirmation) confirmationRef.current?.focus();
  }, [confirmation]);

  const fmt = moneyFormatter(currency);
  const packageChoices = packages.filter(item => item.type === build.type);
  const item = packageChoices.find(entry => entry.slug === build.product);
  const hiddenIds = new Set(item?.hidden);
  const options = (contexts[build.type]?.options ?? []).filter(entry => !hiddenIds.has(entry.id));
  const base = resolvedBase(options, item);
  const price = priceBuild(options, build.selection, base);
  const picked = new Map(build.selection.map(entry => [entry.id, entry]));
  const featureMap = new Map(options.map(entry => [entry.id, entry]));
  const lookup = new Map(options.filter(entry => entry.kind !== "base").map(entry => [entry.id, entry]));
  const coverage = packageCoverage(base, lookup, build.selection);
  const fixed = new Set(coverage.fixed);
  const eligible = new Set(base?.includes?.choose ? base.includes.ids : []);
  const suggested = new Set(build.selection.flatMap(entry => featureMap.get(entry.id)?.suggests ?? []).filter(id => !picked.has(id)));
  const featureKinds = build.type === "hosting" ? ["feature", "recurring"] : ["feature"];
  const features = options.filter(entry => featureKinds.includes(entry.kind));
  const categories = [...new Set(features.map(entry => entry.category || "Options"))];
  const activeTab = categories.includes(tab) ? tab : categories[0] ?? "";
  const addons = options.filter(entry => entry.kind === "addon");
  const plans = build.type === "hosting"
    ? packageChoices.filter(entry => entry.recurring).map(entry => ({ id: entry.slug, title: entry.title, summary: entry.summary, cents: entry.cents }))
    : options.filter(entry => entry.id.startsWith("plan:")).map(entry => ({ id: entry.id, title: entry.label, summary: entry.description ?? "", cents: entry.cents }));
  const planActive = (id: string) => build.type === "hosting" ? build.product === id : picked.has(id);
  const advice = recommendHosting(build.type, [...new Set(price.needs.map(entry => entry.name))], build.product);
  const needsPackage = packageChoices.some(entry => !entry.recurring);
  const ready = chosen && (!needsPackage || Boolean(build.product));
  const title = base?.label ?? builderBases[build.type].label;

  function navigate(next: number) {
    setStep(next);
    setRecentOption("");
    setPrompt(null);
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      formRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }
  function choose(type: ProjectType, product: string) {
    setChosen(true);
    setPrompt(null);
    const hidden = new Set(packages.find(entry => entry.slug === product && entry.type === type)?.hidden);
    setBuild(current => ({ type, product, hosting: current.hosting,
      selection: (current.type === type ? current.selection : defaults(type)).filter(entry => !hidden.has(entry.id)) }));
  }
  function changeHosting(hosting: HostingMode) {
    setBuild(current => ({ ...current, hosting,
      product: hosting !== "managed" && current.type === "hosting" ? "" : current.product,
      selection: hosting === "managed" ? current.selection : current.selection.filter(entry => !hostingOption(entry.id)),
    }));
  }
  function apply(add: string[], remove: string[], focus = "") {
    setBuild(current => {
      const removing = new Set(remove);
      const kept = current.selection.filter(entry => !removing.has(entry.id));
      const additions = add.filter(id => !kept.some(entry => entry.id === id)).map(id => ({ id, quantity: featureMap.get(id)?.min ?? 1 }));
      return { ...current, selection: [...kept, ...additions], hosting: add.some(hostingOption) ? "managed" : current.hosting };
    });
    setPrompt(null);
    setRecentOption(focus);
    if (focus) setPulse(value => value + 1);
  }
  function requestToggle(id: string) {
    if (fixed.has(id)) return;
    const feature = featureMap.get(id);
    if (picked.has(id)) {
      const blocked = dependents(options, build.selection, id);
      if (blocked.length) setPrompt({ kind: "remove", id, dependents: blocked });
      else apply([], [id]);
      return;
    }
    const missing = missingRequirements(options, build.selection, id, base);
    const conflicts = options.filter(other => picked.has(other.id) && (feature?.conflicts?.includes(other.id) || other.conflicts?.includes(id)));
    if (missing.length || conflicts.length) setPrompt({ kind: "add", id, missing, conflicts });
    else apply([id], [], id);
  }
  function answer(choice: "all" | "only" | "cancel") {
    if (!prompt || choice === "cancel") { setPrompt(null); return; }
    if (prompt.kind === "add") {
      if (prompt.conflicts.length) apply([prompt.id], prompt.conflicts.map(entry => entry.id), prompt.id);
      else apply(choice === "all" ? [prompt.id, ...prompt.missing.map(entry => entry.id)] : [prompt.id], [], prompt.id);
    } else apply([], choice === "all" ? [prompt.id, ...prompt.dependents.map(entry => entry.id)] : [prompt.id]);
  }
  function choosePlan(slug: string) {
    if (build.type === "hosting") { setBuild(current => ({ ...current, product: slug, hosting: "managed" })); setPulse(value => value + 1); return; }
    apply(slug ? [slug] : [], plans.map(plan => plan.id).filter(id => id !== slug), slug);
  }
  function customize(id: string, change: Partial<Selection>) {
    setBuild(current => ({ ...current, selection: current.selection.map(entry => entry.id === id ? { ...entry, ...change } : entry) }));
  }
  function saveBuild() {
    const link = `${window.location.origin}/contact?build=${encodeBuild(build)}`;
    setShareLink(link);
    try { localStorage.setItem(localKey, JSON.stringify(build)); setFeedback({ message: "Build saved on this device. You can also copy the link below to come back to it anywhere." }); }
    catch { setFeedback({ message: "This browser can’t save locally, but the link below will reopen your build." }); }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(shareLink); setFeedback({ message: "Build link copied." }); }
    catch { setFeedback({ error: "Clipboard access is unavailable. Select the link and copy it instead." }); }
  }
  function resume() {
    try {
      const saved = localStorage.getItem(localKey);
      if (!saved) { setFeedback({ message: "There is no saved build on this device." }); return; }
      const next = JSON.parse(saved) as Build;
      const context = contexts[next.type];
      if (!context || typeof next.product !== "string") throw new Error("Unavailable build");
      const selection = parseSelections(JSON.stringify(next.selection));
      const product = Object.hasOwn(context.versions, next.product) ? next.product : "";
      const managed = packages.some(entry => entry.slug === product && entry.recurring) || selection.some(entry => hostingOption(entry.id));
      const hosting = managed ? "managed" : Object.hasOwn(hostingModes, next.hosting) ? next.hosting : "unsure";
      setBuild({ type: next.type, product, selection, hosting });
      setChosen(true);
      setReference("");
      setFeedback({ message: "Saved build loaded as a new inquiry." });
      navigate(0);
    } catch { setFeedback({ error: "This saved build is unavailable." }); }
  }
  function reset() {
    if (!window.confirm("Start over? This clears your package, features, and contact fields. Saved builds on this device are kept.")) return;
    formRef.current?.reset();
    setBuild({ type: firstType, product: "", selection: defaults(firstType), hosting: "unsure" });
    setChosen(false);
    setProvider("");
    setNotes("");
    setReference("");
    setShareLink("");
    setFeedback({ message: "Builder cleared." });
    navigate(0);
  }
  function goToReview() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    if (build.hosting === "client" && !provider.trim()) {
      setFeedback({ error: "Enter which hosting provider you plan to use, or write “not chosen yet”, in the hosting step." });
      navigate(2);
      return;
    }
    setFeedback({});
    const values = new FormData(form);
    const labels: Record<string, string> = {
      name: "Preferred name", email: "Contact email", project_name: "Project name", description: "Project description",
      budget: "Budget", deadline: "Desired date", discord: "Discord", references: "Reference links", existing: "Existing site or bot",
      showcase_ids: "Discord style codes", showcase_notes: "Style notes",
    };
    const details = Object.entries(labels).flatMap(([key, label]): [string, string][] => {
      const value = String(values.get(key) ?? "").trim();
      return value ? [[label, value]] : [];
    });
    for (const attachment of values.getAll("attachments")) if (attachment instanceof File && attachment.size) details.push(["Attachment", attachment.name]);
    setDetailLines(details);
    navigate(4);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending && step === 4) send(false);
  }
  function send(draft: boolean) {
    if (!formRef.current || pending) return;
    if (!draft && (!acceptsSubmissions || price.issues.length)) return;
    const form = new FormData(formRef.current);
    form.set("intent", draft ? "draft" : "submit");
    form.set("type", build.type);
    form.set("product", build.product);
    form.set("reference", reference);
    form.set("configuration", JSON.stringify(build.selection));
    form.set("pricing_version", contexts[build.type]?.versions[build.product] ?? "");
    form.set("hosting_mode", build.hosting);
    form.set("hosting_provider", build.hosting === "client" ? provider : "");
    form.set("features", notes);
    setFeedback({});
    startTransition(async () => {
      try {
        const result = await requestQuote({}, form);
        if (result.error) setFeedback({ error: result.error });
        if (result.reference && result.draft) {
          setReference(result.reference);
          const attachments = formRef.current?.elements.namedItem("attachments");
          if (attachments instanceof HTMLInputElement) attachments.value = "";
          setFeedback({ message: "Draft saved to your account. Resume it from your dashboard." });
        } else if (result.reference) setConfirmation(result.reference);
      } catch { setFeedback({ error: "Your request could not be sent. Please try again." }); }
    });
  }
  async function copy() {
    try { await navigator.clipboard.writeText(buildQuoteText({ build, title, price, featureMap, notes, provider, fmt })); setFeedback({ message: "Quote copied. Paste it anywhere you like." }); }
    catch { setFeedback({ error: "Clipboard access is unavailable in this browser." }); }
  }

  if (confirmation) return <Window label="request-sent.txt"><div className="business-panel quote-confirmation" role="status">
    <div className="result-art result-art--envelope">
      <span className="result-letter" aria-hidden="true" />
      <Art artwork={assets.contact} sizes="64px" />
      <span className="result-sparkle sparkle" aria-hidden="true" />
      <span className="result-moths" aria-hidden="true"><i /><i /><i /></span>
    </div>
    <h2 ref={confirmationRef} tabIndex={-1}>Your project inquiry was received</h2>
    <p>Quote reference <strong>{confirmation}</strong>. Keep it handy if you contact Scriptmoth about this project.</p>
    <p>Scriptmoth reviews the requirements and replies with a confirmed quote. Nothing is charged until you accept one.</p>
    {account && <ButtonLink href="/dashboard">Open your dashboard</ButtonLink>}
  </div></Window>;

  const renderCard = (feature: Feature) => <FeatureCard key={feature.id} feature={feature} selection={picked.get(feature.id)} fmt={fmt}
    included={coverage.covered.get(feature.id) ?? 0} eligible={eligible.has(feature.id)} fixed={fixed.has(feature.id)} covered={fixed} featureMap={featureMap}
    recent={recentOption === feature.id && picked.has(feature.id)} prompt={prompt?.id === feature.id ? prompt : undefined}
    onToggle={() => requestToggle(feature.id)} onCustomize={change => customize(feature.id, change)} onPrompt={answer}>
    {suggested.has(feature.id) && <p className="feature-suggested">Suggested for your build</p>}
  </FeatureCard>;

  return <div className="build-layout">
    <div className="build-main business-stack">
      <Window label="build-your-own.exe" className="builder-window">
        <form ref={formRef} onSubmit={submit} className="inquiry-form business-stack quote-builder">
          <nav aria-label="Build steps"><ol className="wizard-steps">{steps.map((label, index) =>
            <li key={label} data-complete={index < step || undefined} aria-current={index === step ? "step" : undefined}>
              {index < step ? <button type="button" onClick={() => navigate(index)}>{label}</button> : label}
            </li>)}</ol></nav>
          <div className="quote-step-heading">
            <h2 key={step} ref={headingRef} tabIndex={-1}>{stepTitles[step]}</h2>
            <span className="heading-moth" aria-hidden="true"><Art artwork={assets.mark} sizes="44px" /></span>
          </div>

          {step === 0 && <ProjectStep contexts={contexts} packages={packages} chosen={chosen} buildType={build.type}
            buildProduct={build.product} fmt={fmt} onChoose={choose} />}
          {step === 1 && <FeaturesStep features={features} categories={categories} activeTab={activeTab} picked={picked} fixed={fixed}
            notes={notes} setNotes={setNotes} setTab={setTab} clearPrompt={() => setPrompt(null)} renderCard={renderCard} />}
          {step === 2 && <HostingStep hosting={build.hosting} provider={provider} setProvider={setProvider} advice={advice} plans={plans}
            planActive={planActive} addons={addons} buildType={build.type} fmt={fmt} changeHosting={changeHosting}
            choosePlan={choosePlan} renderCard={renderCard} />}
          <DetailsStep step={step} initial={initial} account={account}
            showcase={showcaseTypes.has(build.type) || showcaseProducts.has(build.product) } />
          {step === 4 && <ReceiptStep buildType={build.type} title={title} hosting={build.hosting} provider={provider} price={price}
            picked={picked} featureMap={featureMap} notes={notes} detailLines={detailLines} fmt={fmt} />}

          {price.issues.length > 0 && step > 0 && <div className="form-notice build-issues" aria-label="Selections to review">
            <strong>Before you can send this:</strong>
            {price.issues.map((issue, index) => <div key={index}><p>{issue.message}</p>
              <div className="business-toolbar">
                {issue.related && featureMap.has(issue.related) && !picked.has(issue.related) && <button type="button" className="text-link" onClick={() => apply([issue.related!], [], issue.related)}>
                  Include {featureMap.get(issue.related)?.label} ({priceLabel(featureMap.get(issue.related)!, fmt)})</button>}
                {picked.has(issue.id) && <button type="button" className="text-link" onClick={() => apply([], [issue.id])}>Remove {featureMap.get(issue.id)?.label ?? "unavailable feature"}</button>}
              </div>
            </div>)}
          </div>}
          <label hidden aria-hidden="true">Website URL<input name="website_url" tabIndex={-1} autoComplete="off" /></label>
          {feedback.error && <p role="alert" className="field-error">{feedback.error}</p>}
          {feedback.message && <p role="status">{feedback.message}</p>}
          {shareLink && <div className="share-box">
            <label className="field">Link to this build<input readOnly value={shareLink} onFocus={event => event.target.select()} /></label>
            <button type="button" className="text-link" onClick={copyLink}><Link2 size={16} aria-hidden="true" /> Copy link</button>
          </div>}
          <div className="button-row">
            {step > 0 && <Button variant="outline" onClick={() => navigate(step - 1)}><ArrowLeft className="icon-back" size={16} aria-hidden="true" /> Back</Button>}
            {step < 4 && <Button onClick={() => step === 3 ? goToReview() : navigate(step + 1)} disabled={!ready}>
              {step === 3 ? "Review estimate" : "Continue"} <ArrowRight size={16} aria-hidden="true" /></Button>}
            {step === 4 && acceptsSubmissions && <Button type="submit" busy={pending} disabled={price.issues.length > 0}>Request this project <Send size={16} aria-hidden="true" /></Button>}
            {step === 4 && <Button variant="outline" onClick={copy}><Copy size={16} aria-hidden="true" /> Copy my quote</Button>}
            {step === 4 && <Button variant="outline" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Print</Button>}
            {account && <Button variant="outline" busy={pending} onClick={() => send(true)} disabled={!ready}>Save account draft</Button>}
          </div>
          {!ready && step === 0 && <p className="field-hint">Choose a starter package to continue.</p>}
          {!acceptsSubmissions && <p className="form-notice">New project inquiries are currently closed. You can still build an estimate, copy it, and save it.</p>}
        </form>
      </Window>
      <div className="build-tools business-toolbar">
        <Button variant="outline" onClick={saveBuild} disabled={!chosen}><Save size={16} aria-hidden="true" /> Save my build</Button>
        <Button variant="outline" onClick={resume}>Resume saved build</Button>
        {step !== 4 && <Button variant="outline" onClick={copy} disabled={!chosen}><Copy size={16} aria-hidden="true" /> Copy my quote</Button>}
        {reference && <Button variant="outline" onClick={() => { setReference(""); setFeedback({ message: "Draft cleared. Saving again creates a new inquiry draft." }); }}>Duplicate draft</Button>}
        <Button variant="destructive" onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Start over</Button>
      </div>
    </div>
    <aside className="build-estimate" id="live-estimate" aria-label="Live estimate">
      <Window label="estimate.exe">{chosen ? <EstimatePanel title={title} price={price} featureMap={featureMap} fmt={fmt} pulse={pulse} />
        : <div className="estimate-panel">
          <div className="estimate-head"><span className="estimate-moth" aria-hidden="true"><Art artwork={assets.mark} sizes="40px" /></span>
            <div><p className="estimate-kicker">Your build</p><h2>Nothing yet</h2></div></div>
          <div className="crt" role="status"><span className="crt-label">One-time estimate</span><strong className="crt-total">$—</strong>
            <span className="crt-sub">Choose a starter package to continue</span></div>
          <p className="build-estimate-note">Your price builds up here as you choose. One-time and monthly costs are always shown separately.</p>
        </div>}</Window>
    </aside>
    {chosen && <a className="estimate-dock" href="#live-estimate" aria-label="Jump to the live estimate">
      <span>Estimate</span><strong>{price.total === 0 && price.custom.length ? "Custom" : fmt(price.total)}{price.custom.length > 0 && price.total > 0 ? " + custom" : ""}</strong>
      {price.monthly > 0 && <small>+ {fmt(price.monthly)}/mo</small>}
    </a>}
  </div>;
}
