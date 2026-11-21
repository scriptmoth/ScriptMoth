import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Clock3, LifeBuoy, ListChecks, Plus, RotateCcw } from "lucide-react";
import { DiscordEmbedsCallout, DiscordStylesCallout, discordStylePackages } from "@/demos/discord/styles-callout";
import { Art, ButtonLink } from "@/components/ui";
import { parseFaqLine } from "@/data/faq";
import { catalog, currency, setting } from "@/lib/business/catalog";
import { PackageContents, productPrice } from "../package-contents";
import { pageMetadata } from "@/lib/metadata";
import { PackageExample } from "./package-example";
import styles from "./package-detail.module.css";

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
  const money = currency();
  const customizable = setting(`builder_product_${product.id}`, "yes") === "yes";
  const quoteBased = product.pricing === "quote" || product.cents === null;
  const related = products.filter(item => product.related.includes(item.slug));
  const faqs = product.faq.flatMap((entry, index) => {
    const parsed = parseFaqLine(entry);
    return parsed ? [{ ...parsed, key: `${index}-${parsed.question}` }] : [];
  });
  const delivery = [
    { icon: Clock3, label: "Timeline", detail: product.delivery || "Delivery timing is confirmed in your quote." },
    { icon: RotateCcw, label: "Revisions", detail: product.revisions },
    { icon: LifeBuoy, label: "Support", detail: product.support },
  ].filter(({ detail }) => detail);

  return (
    <div className={`site-container ${styles.page}`}>
      <Link className={`text-link ${styles.back}`} href="/products">
        <ArrowLeft className="icon-back" size={17} aria-hidden="true" /> All packages
      </Link>

      <header className={styles.hero}>
        <div>
          <p className={styles.category}>{product.category}</p>
          <h1>{product.title}</h1>
          <p className={styles.summary}>{product.summary}</p>
        </div>
        <div className={styles.artwork}>
          <Art artwork={product.art} sizes="(max-width: 540px) 1px, 190px" />
        </div>
      </header>

      <div className={styles.overview}>
        <section className={`${styles.panel} ${styles.priceCard}`} aria-labelledby="package-price">
          <h2 id="package-price">Package price</h2>
          <p className={styles.price}>{productPrice(product, money)}</p>
          {quoteBased && <p className={styles.priceNote}>Your quote confirms the final scope and price.</p>}
          {(customizable || product.demo) && <div className={styles.actions}>
            {customizable && <ButtonLink href={`/contact?type=${slug}`}>Customize this package</ButtonLink>}
            {product.demo && <a className={styles.demo} href={product.demo}>
              View demonstration <ArrowUpRight size={17} aria-hidden="true" />
            </a>}
          </div>}
        </section>

        <section className={`${styles.panel} ${styles.scope}`} aria-label="Package contents">
          <PackageContents product={product} currency={money} heading="h2">
            {product.description && product.description !== product.summary && <p className={styles.description}>{product.description}</p>}
          </PackageContents>
          {product.extras && <div className={styles.addOns}>
            <Plus size={20} aria-hidden="true" />
            <div>
              <h3>Optional add-ons</h3>
              <p>{product.extras}</p>
            </div>
          </div>}
        </section>
      </div>

      <PackageExample slug={product.slug} title={product.title} />

      <section className={`${styles.panel} ${styles.delivery}`} aria-labelledby="package-delivery">
        <h2 id="package-delivery">Delivery and support</h2>
        <dl className={styles.deliveryGrid}>
          {delivery.map(({ icon: Icon, label, detail }) => <div key={label}>
            <dt><Icon size={18} aria-hidden="true" /> {label}</dt>
            <dd>{detail}</dd>
          </div>)}
        </dl>
        {product.requirements.length > 0 && <div className={styles.requirements}>
          <h3><ListChecks size={20} aria-hidden="true" /> What you’ll need</h3>
          <ul>{product.requirements.map(item => <li key={item}>{item}</li>)}</ul>
        </div>}
      </section>

      {product.images.length > 0 && <section className={styles.previews} aria-labelledby="package-previews">
        <h2 id="package-previews">Package screenshots</h2>
        <div className={styles.imageGrid}>
          {product.images.map((id, index) => <Image key={id} unoptimized src={`/api/product-images/${id}`}
            alt={`${product.title} screenshot ${index + 1}`} width={800} height={500} />)}
        </div>
      </section>}

      {discordStylePackages.has(product.slug) && <>
        <DiscordStylesCallout quoteType={product.slug} />
        <DiscordEmbedsCallout quoteType={product.slug} />
      </>}

      {faqs.length > 0 && <section className={`${styles.panel} ${styles.faq}`} aria-labelledby="package-faq">
        <h2 id="package-faq">Frequently asked questions</h2>
        {faqs.map(({ key, question, answer }) => <details key={key}>
          <summary>{question}<ChevronDown size={18} aria-hidden="true" /></summary>
          <p>{answer}</p>
        </details>)}
      </section>}

      {related.length > 0 && <section aria-labelledby="package-related">
        <h2 id="package-related">Related packages</h2>
        <ul className={styles.related}>
          {related.map(item => <li key={item.id}>
            <Link href={`/products/${item.slug}`}>
              <span><strong>{item.title}</strong><span>{productPrice(item, money)}</span></span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </li>)}
        </ul>
      </section>}
    </div>
  );
}
