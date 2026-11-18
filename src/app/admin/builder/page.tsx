import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { AdminForm } from "@/components/business/admin-form";
import { Field } from "@/components/business/forms";
import { requireAdmin } from "@/lib/business/auth";
import { builderOptions } from "@/lib/business/builder";
import { projectTypes } from "@/lib/business/rules";
import { assets } from "@/lib/assets";

type Item = ReturnType<typeof builderOptions>[number];
const types = Object.entries(projectTypes).map(([id, title]) => ({ id, title }));
const kinds = ["base", "feature", "addon", "recurring"];
const units = (cents: number | null | undefined) => cents == null ? "" : (cents / 100).toFixed(2);

function PricingEditor({ item }: { item?: Item }) {
  return <AdminForm intent="quote_option" id={item?.id} title={item?.label ?? "Add option"} submit="Save option">
    {item && <p>Option ID <code>{item.id}</code></p>}
    <div className="form-grid">
      {item ? <><input type="hidden" name="project_type" value={item.project_type} /><input type="hidden" name="kind" value={item.kind} /></> : <>
        <Field name="project_type" label="Project type" options={types} required />
        <Field name="kind" label="Price kind" options={kinds.filter(kind => kind !== "base")} value="feature" required />
      </>}
      <Field name="label" label="Display name" value={item?.label} max={120} required />
      <Field name="category" label="Category" value={item?.category} max={180} />
      <Field name="price" label="Unit price (blank for manual quote)" value={units(item?.cents)} />
      <Field name="order" label="Display order" value={item?.order} />
      <Field name="note" label="Description or compatibility note" value={item?.note} large max={800} />
      {item?.kind !== "base" && <>
        <Field name="quantity_min" label="Minimum quantity" value={item?.min ?? 1} />
        <Field name="quantity_max" label="Maximum quantity" value={item?.max ?? 1} />
        <Field name="tiers" label="Tiers (minimum quantity | unit price, one per line)" value={item?.tiers?.map(tier => `${tier.from} | ${units(tier.cents)}`).join("\n")} large />
        <Field name="requires" label="Required option IDs (one per line)" value={item?.requires?.join("\n")} large />
        <Field name="conflicts" label="Incompatible option IDs (one per line)" value={item?.conflicts?.join("\n")} large />
        <Field name="suggests" label="Suggested option IDs (one per line)" value={item?.suggests?.join("\n")} large />
        <Field name="fields" label="Custom fields (key | label | optional choices, one per line)" value={item?.fields?.map(field => [field.key, field.label, ...field.choices ?? []].join(" | ")).join("\n")} large />
        <Field name="complexity" label="Complexity (label | price per unit, one per line)" value={item?.complexity?.map(option => `${option.label} | ${units(option.cents)}`).join("\n")} large />
      </>}
      <Field name="setup" label="One-time setup fee" value={units(item?.setup)} />
      {item?.kind === "base" && <>
        <Field name="discount" label="Package discount" value={units(item.discount)} />
        <Field name="minimum" label="Minimum one-time order" value={units(item.minimum)} />
      </>}
    </div>
    <label><input name="active" type="checkbox" value="yes" defaultChecked={item ? Boolean(item.active) : true} /> Available in the builder</label>
    <label><input name="manual" type="checkbox" value="yes" defaultChecked={item?.manual} /> Requires manual pricing even with a starting amount</label>
    {item?.kind !== "base" && <label><input name="default" type="checkbox" value="yes" defaultChecked={item?.default} /> Selected by default for this project type</label>}
  </AdminForm>;
}

export const metadata = { title: "Builder Administration", robots: { index: false } };
export default async function BuilderAdmin() {
  await requireAdmin();
  const options = builderOptions(true);
  return <>
    <PageIntro title="Builder pricing" eyebrow="Studio administration" artwork={assets.coding} tone="plain">Manage estimates, features, and compatibility rules. Starting prices are provisional until review.</PageIntro>
    <div className="section site-container business-stack">
      <nav className="business-toolbar" aria-label="Administration"><Link className="text-link" href="/admin">Overview and inquiries</Link><Link className="text-link" href="/admin/catalog">Catalog editor</Link></nav>
      <details><summary className="business-summary">Add a feature or service</summary><PricingEditor /></details>
      {types.map(type => <details key={type.id}><summary className="business-summary">{type.title}</summary>
        {options.filter(item => item.project_type === type.id).map(item => <details className="business-panel" key={item.id}>
          <summary className="business-summary">{item.label} · {item.kind}{!item.active ? " · hidden" : ""}</summary><PricingEditor item={item} />
        </details>)}
      </details>)}
    </div>
  </>;
}
