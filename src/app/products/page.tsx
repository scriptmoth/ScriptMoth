import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { DiscordLibraryLinks } from "@/demos/discord/styles-callout";
import { Art, ButtonLink, PageIntro, SectionHeading } from "@/components/ui";
import { catalog, currency, setting, type Product } from "@/lib/business/catalog";
import { PackageContents, productPrice, standardWork, wholeMoney } from "./package-contents";
import { packageValue } from "@/lib/business/builder";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Packages & Custom Work", "Compare starting prices for Scriptmoth’s website, Tumblr, Toyhouse, Discord bot, Discord server setup, and dashboard packages, or see the custom work built to order.", "/products");
export const dynamic = "force-dynamic";

// Packages and custom work share one page so visitors can compare everything without clicking between pages.
const packageGroups = [
  { id: "discord-packages", title: "Discord", blurb: "Bots, roleplay systems, and server setup. Setup can be bought alone or bundled with a bot.", extra: "styles", match: (category: string) => category.startsWith("Discord") || category.startsWith("Roleplay") },
  { id: "website-packages", title: "Websites & profiles", blurb: "Personal sites, wikis, Carrd, Tumblr, and Toyhouse.", extra: null, match: (category: string) => !category.startsWith("Discord") && !category.startsWith("Roleplay") },
];

const jumpLinks = [
  { href: "#discord-packages", label: "Discord" },
  { href: "#website-packages", label: "Websites & profiles" },
  { href: "#custom", label: "Something custom" },
  { href: "#before-you-start", label: "What’s included" },
];

/** Example layouts shown inside the Discord Server Setup card. */
const discordIdeas = [
  { title: "Artist community", body: "Welcome, rules, and commission-info embeds; WIP, finished work, and feedback channels; Artist, Client, and pronoun roles; staff-only review channels." },
  { title: "Roleplay server", body: "Lore, OOC chat, and in-character categories; character-intro and roster channels; staff, player, and faction roles with permission gates." },
  { title: "Creator / fan group", body: "Announcements and links embeds; event and chat categories; interest roles (games, art, writing); a pinned “start here” checklist." },
  { title: "Existing-server cleanup", body: "Regroup a cluttered sidebar, archive dead channels, fix role order and colors, and replace plain text rules with branded embeds." },
];

function PackageCard({ product, money }: { product: Product; money: string }) {
  const value = packageValue(product.slug);
  const showValue = value && product.cents !== null && value.cents > product.cents;
  const customizable = setting(`builder_product_${product.id}`, "yes") === "yes";
  return (
    <article id={product.slug} className="pkg-card">
      <div className="pkg-card-top">
        <div className="pkg-icon"><Art artwork={product.art} sizes="44px" /></div>
        <p className="pkg-price">{productPrice(product, money)}</p>
      </div>
      <h4><Link href={`/products/${product.slug}`}>{product.title}</Link></h4>
      <p className="pkg-summary">{product.summary}</p>
      {showValue && <p className="pkg-value"><strong>{wholeMoney(value.cents, money)}</strong> of features included</p>}
      <details className="pkg-more">
        <summary>What you get <span>· {product.included.length} items</span><ChevronDown size={16} aria-hidden="true" /></summary>
        <PackageContents product={product} currency={money} compact />
        {product.extras && <p className="pkg-extras"><strong>Optional extras:</strong> {product.extras}</p>}
        {product.slug === "discord-server-setup" && <div className="pkg-ideas">
          <p><strong>Example layouts</strong></p>
          <ul>{discordIdeas.map((idea) => <li key={idea.title}><strong>{idea.title}:</strong> {idea.body}</li>)}</ul>
        </div>}
      </details>
      <div className="pkg-actions">
        {customizable && <ButtonLink href={`/contact?type=${product.slug}`}>Customize</ButtonLink>}
        {product.demo && <Link className="text-link" href={product.demo}>Try the example</Link>}
        <Link className="text-link" href={`/products/${product.slug}`}>Full details <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}

export default function ProductsPage() {
  const products = catalog();
  const money = currency();
  return (
    <>
      <PageIntro eyebrow="Packages & custom work" title="Discord bots, servers, and websites" artwork={assets.websites}>
        Pick a package with a starting price. Need something different? There’s a custom option at the end. Your quote confirms the final scope and price.
      </PageIntro>
      <nav className="site-container jump-nav" aria-label="On this page">
        <span className="jump-nav-label">Jump to</span>
        <ul>{jumpLinks.map(({ href, label }) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
        <ButtonLink href="/contact">Build a project</ButtonLink>
      </nav>

      <section className="section site-container" aria-labelledby="packages">
        <SectionHeading eyebrow="Starting prices" title="Packages" id="packages">
          <p className="section-note">Open “What you get” on any card for the full list.</p>
        </SectionHeading>
        {packageGroups.map((group) => {
          const items = products.filter((product) => group.match(product.category)).sort((a, b) => (a.cents ?? Infinity) - (b.cents ?? Infinity));
          if (!items.length) return null;
          return (
            <div key={group.id} className="pkg-group">
              <div className="pkg-group-head">
                <h3 id={group.id}>{group.title} <span className="pkg-count">{items.length}</span></h3>
                <p>{group.blurb}</p>
                {group.extra === "styles" && <DiscordLibraryLinks />}
              </div>
              <div className="pkg-grid">{items.map((product) => <PackageCard key={product.id} product={product} money={money} />)}</div>
            </div>
          );
        })}
      </section>

      <section className="section site-container" aria-labelledby="custom">
        <aside className="info-panel custom-panel">
          <div className="custom-panel-art"><Art artwork={assets.coding} sizes="88px" /></div>
          <div>
            <p className="eyebrow"><span aria-hidden="true">✦</span> Built to order</p>
            <h2 id="custom">Need something custom?</h2>
            <p>If nothing here fits, describe what you’re picturing and I’ll quote it. Things people ask for:</p>
            <ul className="included-chips">
              <li>Bigger or multi-feature websites</li>
              <li>Bots with your own commands</li>
              <li>Moderation and support tickets</li>
              <li>Inventories, shops, quests, and crafting</li>
              <li>Staff dashboards</li>
              <li>Hosting and maintenance</li>
            </ul>
          </div>
          <div className="button-row">
            <ButtonLink href="/contact">Describe your project</ButtonLink>
            <ButtonLink href="/hosting" variant="outline">Hosting plans</ButtonLink>
          </div>
        </aside>
      </section>

      <section className="section site-container" aria-labelledby="before-you-start">
        <aside className="info-panel included-panel">
          <div>
            <p className="eyebrow"><span aria-hidden="true">✦</span> Every project</p>
            <h2 id="before-you-start">What’s always included</h2>
            <ul className="included-chips">{standardWork.map((line) => <li key={line}>{line}</li>)}</ul>
            <p>Report bugs in the agreed features within 14 days of accepting the work. Domains, hosting, and third-party fees cost extra. You supply all assets (logos, artwork, photos). Add a budget and target date to your request if you have them.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
