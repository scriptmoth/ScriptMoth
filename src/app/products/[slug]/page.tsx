import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ButtonLink, PageIntro, Window } from "@/components/ui";
import { parseFaqLine } from "@/data/faq";
import { catalog, currency, setting } from "@/lib/business/catalog";
import { money } from "@/lib/business/rules";
import { pageMetadata } from "@/lib/metadata";

type Page = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Page) {
  const { slug } = await params;
  const item = catalog().find(product => product.slug === slug);
  return item ? pageMetadata(item.title, item.summary, `/products/${slug}`) : {};
}
export default async function ProductDetail({ params }: Page) {
  const { slug } = await params;
  const products = catalog();
  const product = products.find(item => item.slug === slug);
  if (!product) notFound();
  const related = products.filter(item => product.related.includes(item.slug));
  const faqs = product.faq.flatMap((entry, index) => {
    const parsed = parseFaqLine(entry);
    return parsed ? [{ ...parsed, key: `${index}-${parsed.question}` }] : [];
  });
  return <>
    <PageIntro title={product.title} eyebrow={product.category} artwork={product.art}>{product.summary}</PageIntro>
    <div className="site-container section business-stack">
      <div className="business-toolbar"><Link className="text-link" href="/products"><ArrowLeft className="icon-back" size={16} aria-hidden="true" />All packages</Link>{setting(`builder_product_${product.id}`, "yes") === "yes" && <ButtonLink href={`/contact?type=${slug}`}>Customize this package</ButtonLink>}</div>
      <div className="business-split">
        <Window label="Package details"><div className="business-panel">
          <h2>{product.cents === null ? "Custom quote" : `${product.pricing === "quote" ? "From " : ""}${money(product.cents, currency())}`}</h2>
          <p className="business-prose">{product.description}</p>
          <h3>Included features</h3>
          <ul className="business-list">{product.included.map(item => <li key={item}>{item}</li>)}</ul>
          {product.extras && <><h3>Optional add-ons</h3><p className="business-prose">{product.extras}</p></>}
        </div></Window>
        <Window label="Before you start"><div className="business-panel">
          <h2>Delivery and support</h2>
          <p>{product.delivery || "Delivery timing is confirmed in your quote."}</p>
          {product.revisions && <p>{product.revisions}</p>}{product.support && <p>{product.support}</p>}
          {product.requirements.length > 0 && <><h3>What you’ll need</h3><ul className="business-list">{product.requirements.map(item => <li key={item}>{item}</li>)}</ul></>}
          {product.demo && <a className="text-link" href={product.demo}>View demonstration</a>}
        </div></Window>
      </div>
      {product.images.length > 0 && <div className="business-split">{product.images.map((id, index) => <figure className="business-image" key={id}>
        <Image unoptimized src={`/api/product-images/${id}`} alt={`${product.title} screenshot ${index + 1}`} width={800} height={500} />
      </figure>)}</div>}
      {faqs.length > 0 && (
        <Window label="Frequently asked questions">
          <div className="business-panel">
            {faqs.map(({ key, question, answer }) => (
              <details key={key}>
                <summary className="business-summary">{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </Window>
      )}
      {related.length > 0 && <Window label="Related packages"><ul className="business-panel business-list">{related.map(item => <li key={item.id}><Link className="text-link" href={`/products/${item.slug}`}>{item.title}</Link></li>)}</ul></Window>}
    </div>
  </>;
}
