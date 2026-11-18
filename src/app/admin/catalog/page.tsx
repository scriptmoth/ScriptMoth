import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { AdminForm } from "@/components/business/admin-form";
import { Field } from "@/components/business/forms";
import { requireAdmin } from "@/lib/business/auth";
import { catalog, setting, type Product } from "@/lib/business/catalog";
import { productCategories, productStatuses, projectTypes } from "@/lib/business/rules";
import { assets } from "@/lib/assets";

const projectOptions = Object.entries(projectTypes).map(([id, title]) => ({ id, title }));
export const metadata = { title: "Catalog editor", robots: { index: false } };

function Editor({ item }: { item?: Product }) {
  return <AdminForm intent="product" id={item?.id} title={item?.title ?? "New package"} submit="Save package">
    <div className="form-grid">
      <Field name="title" label="Package name" value={item?.title} required max={100} />
      <Field name="slug" label="URL slug" value={item?.slug} required max={75} />
      <Field name="status" label="Status" options={productStatuses} value={item?.status ?? "draft"} required />
      <Field name="category" label="Category" options={productCategories} value={item?.category} required />
      <Field name="project_type" label="Quote project type" options={projectOptions} value={item?.projectType} required />
      <Field name="pricing" label="Pricing type" options={[{ id: "quote", title: "Custom quote" }, { id: "fixed", title: "Fixed price" }]} value={item?.pricing} required />
      <Field name="price" label="Starting price (blank for manual review)" value={item?.cents == null ? "" : (item.cents / 100).toFixed(2)} />
      <Field name="featured_order" label="Featured order (blank to hide from Home)" value={item?.featured_order} />
      <Field name="summary" label="Short description" value={item?.summary} required max={300} />
      <Field name="description" label="Detailed description" value={item?.description} large required max={6000} />
      <Field name="included" label="Included features (one per line)" value={item?.included.join("\n")} large max={5000} />
      <Field name="extras" label="Optional add-ons" value={item?.extras} large max={4000} />
      <Field name="delivery" label="Estimated delivery range" value={item?.delivery} max={120} />
      <Field name="requirements" label="Customer requirements (one per line)" value={item?.requirements.join("\n")} large max={4000} />
      <Field name="revisions" label="Revision allowance" value={item?.revisions} max={120} />
      <Field name="support" label="Support or warranty" value={item?.support} large max={2000} />
      <Field name="demo" label="Demonstration link" type="url" value={item?.demo} max={2000} />
      <Field name="related" label="Related product slugs (one per line)" value={item?.related.join("\n")} large max={2000} />
      <Field name="faq" label="FAQ (one question | answer per line)" value={item?.faq.join("\n")} large max={5000} />
      <label className="field">Upload screenshots<input name="attachments" type="file" multiple accept="image/png,image/jpeg,image/gif,image/webp" /></label>
    </div>
    {item?.images.map((id, index) => <label key={id}><input type="checkbox" name="keep_image" value={id} defaultChecked /> Keep screenshot {index + 1}</label>)}
    <label><input type="checkbox" name="builder" value="yes" defaultChecked={!item || setting(`builder_product_${item.id}`, "yes") === "yes"} /> Show in project builder</label>
    <label><input type="checkbox" name="placeholder" value="yes" defaultChecked={item?.placeholder ?? true} /> Owner review needed for missing or proposed content</label>
  </AdminForm>;
}
export default async function CatalogAdmin() {
  await requireAdmin();
  return <>
    <PageIntro title="Catalog editor" eyebrow="Studio administration" artwork={assets.gallery} tone="plain">Edit public packages, descriptions, screenshots, and starting prices.</PageIntro>
    <div className="section site-container business-stack">
      <Link href="/admin" className="text-link"><ArrowLeft className="icon-back" size={16} aria-hidden="true" />Admin overview</Link>
      <h2>Packages</h2>
      <details><summary className="business-summary">Create a package</summary><Editor /></details>
      {catalog(false).map(item => <details key={item.id}><summary className="business-summary">{item.title} · {item.status}{item.placeholder ? " · owner review" : ""}</summary><Editor item={item} /></details>)}
      <Link className="text-link" href="/admin/builder">Manage builder pricing and features</Link>
    </div>
  </>;
}
