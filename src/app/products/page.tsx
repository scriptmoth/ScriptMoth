import Link from "next/link";
import { Art, ButtonLink, PageIntro } from "@/components/ui";
import { catalog, currency, setting } from "@/lib/business/catalog";
import { money } from "@/lib/business/rules";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Packages", "Compare features and starting prices for Scriptmoth’s website, Tumblr, Toyhouse, Discord bot, Discord server setup, and dashboard packages.", "/products");
export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <>
      <PageIntro eyebrow="Packages" title="Website and Discord packages" artwork={assets.websites} tone="plain">
        Compare starting prices and included features. Scriptmoth confirms scope and price in your quote.
      </PageIntro>
      <div className="section site-container detail-services">
        {catalog().map((product) => (
          <article key={product.id} id={product.slug} className="service-card service-card--detailed catalog-card">
            <div className="service-icon"><Art artwork={product.art} sizes="74px" /></div>
            <h2><Link href={`/products/${product.slug}`} className="card-link">{product.title}</Link></h2>
            <p className="catalog-price">{product.cents === null ? "Custom quote" : `${product.pricing === "quote" ? "From " : ""}${money(product.cents, currency())}`}</p>
            <p>{product.summary}</p>
            <ul>{product.included.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <p><strong>Optional extras</strong> · {product.extras}</p>
            {setting(`builder_product_${product.id}`, "yes") === "yes" && <ButtonLink href={`/contact?type=${product.slug}`}>Customize this package</ButtonLink>}
          </article>
        ))}
        <aside className="info-panel">
          <div>
            <h2>What comes with a package?</h2>
            <p>Each package includes setup, one round of review, testing, and handover instructions. You have 14 days after accepting the work to report bugs in the agreed features. Domains, hosting, and third-party fees cost extra.</p>
            <p>You supply all project assets, including any logos, artwork, photos, or other media the package uses.</p>
          </div>
          <ButtonLink href="/hosting" variant="outline">View hosting plans</ButtonLink>
        </aside>
        <aside className="info-panel">
          <div><h2>Custom projects</h2><p>If a package doesn’t fit, list the features you need for a custom quote.</p></div>
          <ButtonLink href="/services" variant="secondary">View custom work</ButtonLink>
        </aside>
      </div>
    </>
  );
}
