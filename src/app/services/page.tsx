import { ServiceCard } from "@/components/cards";
import { DiscordStylesCallout } from "@/components/discord/styles-callout";
import { ButtonLink, PageIntro } from "@/components/ui";
import { services } from "@/data/services";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Custom Work", "See the one-page creator sites, Tumblr themes, Toyhouse profiles, custom websites, Discord bots, Discord server setup, and roleplay tools Scriptmoth builds to order.", "/services");

export default function ServicesPage() {
  return (
    <>
      <PageIntro eyebrow="Custom development" title="Websites, bots, and Discord servers" artwork={assets.coding}>
        Scriptmoth builds for individuals and small groups. Discord server setup is separate from bots and can be bundled with one. Hosting and maintenance are available as add-ons.
      </PageIntro>
      <div className="section site-container detail-services">
        {services.map((service) => <ServiceCard key={service.id} service={service} detailed />)}
        <section className="info-panel" id="discord-setup-examples" aria-labelledby="discord-setup-examples-title">
          <div>
            <h2 id="discord-setup-examples-title">Discord setup examples</h2>
            <p>Standalone server work—or added onto a bot project. Here is the kind of layout and content Scriptmoth delivers:</p>
            <ul className="detail-list">
              <li><strong>Artist community</strong> — Welcome, rules, and commission-info embeds; channels for WIP, finished work, and feedback; roles for Artist, Client, and pronouns; staff-only review channels.</li>
              <li><strong>Roleplay server</strong> — Lore, OOC chat, and in-character categories; character-intro and roster channels; staff, player, and faction roles with permission gates.</li>
              <li><strong>Creator / fan group</strong> — Announcements and links embeds; event and chat categories; interest roles (games, art, writing); a pinned “start here” checklist for new members.</li>
              <li><strong>Existing-server cleanup</strong> — Rename and regroup a cluttered sidebar, archive dead channels, fix role order and colors, and replace plain text rules with branded embeds.</li>
            </ul>
          </div>
          <div className="button-row">
            <ButtonLink href="/products/discord-server-setup">See the package</ButtonLink>
            <ButtonLink href="/portfolio/discord-styles" variant="secondary">Browse channel styles</ButtonLink>
          </div>
        </section>
        <DiscordStylesCallout />
        <section className="info-panel" id="one-page-sites" aria-labelledby="one-page-sites-title">
          <div>
            <h2 id="one-page-sites-title">One-page creator sites</h2>
            <p>A custom Carrd-style home for your commission menu, portfolio, or links. Put your bio, artwork, rates, and contact links on one page that works on phones and desktops.</p>
          </div>
          <div className="button-row">
            <ButtonLink href="/products/carrd-site">See the package</ButtonLink>
            <ButtonLink href="/portfolio#carrd-sites" variant="secondary">Try the example</ButtonLink>
          </div>
        </section>
        <section className="info-panel" id="tumblr-themes" aria-labelledby="tumblr-themes-title">
          <div>
            <h2 id="tumblr-themes-title">Tumblr theme designs</h2>
            <p>Custom CSS themes for Tumblr blogs: classic sidebar or photo-grid layouts, styled posts, and install notes for Tumblr’s theme editor. Images stay on Tumblr — no separate host.</p>
          </div>
          <div className="button-row">
            <ButtonLink href="/products/tumblr-theme">See the package</ButtonLink>
            <ButtonLink href="/portfolio#tumblr-themes" variant="secondary">Try the example</ButtonLink>
          </div>
        </section>
        <section className="info-panel" id="toyhouse-profiles" aria-labelledby="toyhouse-profiles-title">
          <div>
            <h2 id="toyhouse-profiles-title">Toyhouse OC &amp; profile designs</h2>
            <p>Codes built for Toyhouse itself: Bootstrap 4 tabs and layout, inline styles, and paste-in HTML that respects Toyhouse’s whitelist. Custom CSS needs Toyhouse Premium; HTML-only layouts work without it.</p>
          </div>
          <div className="button-row">
            <ButtonLink href="/products/toyhouse-profile">See the package</ButtonLink>
            <ButtonLink href="/portfolio#toyhouse-profiles" variant="secondary">Try the example</ButtonLink>
          </div>
        </section>
        <aside className="info-panel">
          <div>
            <h2>Before you request an estimate</h2>
            <p>Include a budget and target date if you have them. Provide all assets for the project, including logos, artwork, or photos you want to use.</p>
          </div>
          <ButtonLink href="/contact">Build a project</ButtonLink>
        </aside>
        <aside className="info-panel">
          <div><h2>Packages with starting prices</h2><p>See what each package includes and which features you can add.</p></div>
          <ButtonLink href="/products" variant="secondary">Compare packages</ButtonLink>
        </aside>
      </div>
    </>
  );
}
