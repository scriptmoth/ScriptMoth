import Link from "next/link";
import { ArrowRight, Server, Settings } from "lucide-react";
import { ButtonLink, PageIntro } from "@/components/ui";
import { currency, plans } from "@/lib/business/catalog";
import { money } from "@/lib/business/rules";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";
import styles from "./hosting.module.css";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Hosting", "Choose client-managed hosting or Scriptmoth setup and management on a third-party provider.", "/hosting");

export default function HostingPage() {
  const planCurrency = currency();

  return (
    <>
      <PageIntro eyebrow="Deployment & maintenance" title="Hosting options" artwork={assets.hosting}>
        Run your site, bot, or database on a third-party provider. Handle setup and upkeep yourself, or have Scriptmoth manage it.
      </PageIntro>
      <div className={`section site-container ${styles.page}`}>
        <div className={styles.options}>
          <section className={styles.option}>
            <span className={styles.icon}><Settings size={23} aria-hidden="true" /></span>
            <h2>Manage your own hosting</h2>
            <p>You choose and pay the provider, deploy the project, and keep it running. Share your provider and plan before development so Scriptmoth can check compatibility and prepare handover instructions.</p>
            <ButtonLink href="/contact?type=hosting&hosting=client" variant="outline">Choose self-managed hosting</ButtonLink>
          </section>
          <section className={`${styles.option} ${styles.managed}`}>
            <span className={styles.icon}><Server size={23} aria-hidden="true" /></span>
            <h2>Have Scriptmoth manage it</h2>
            <p>Scriptmoth sets up, deploys, and manages your project. Your quote spells out monitoring, backups, updates, and support hours.</p>
            <ButtonLink href="#management-plans">Compare management plans</ButtonLink>
          </section>
        </div>

        <section id="management-plans" className={styles.plans} aria-labelledby="plans-title">
          <header>
            <h2 id="plans-title">Management plans</h2>
            <p>Prices are in {planCurrency} and cover monthly management. Setup and provider charges are quoted separately.</p>
          </header>
          <div className={styles.planGrid}>
            {plans().map(plan => {
              const details = [
                ["Limits", plan.limits],
                ["Backups", plan.backups],
                ["Support coverage", plan.coverage],
                ["Cancellation", plan.cancellation],
              ].filter(([, description]) => description);

              return (
                <article key={plan.id} className={styles.plan}>
                  <h3>{plan.title}</h3>
                  <p className={styles.price}>
                    {plan.cents === null ? "Custom quote" : <>{money(plan.cents, planCurrency)} <span>/ month</span></>}
                  </p>
                  <p className={styles.summary}>{plan.services}</p>
                  {details.length > 0 && (
                    <dl className={styles.details}>
                      {details.map(([label, description]) => (
                        <div key={label}><dt>{label}</dt><dd>{description}</dd></div>
                      ))}
                    </dl>
                  )}
                  <Link className={`text-link ${styles.planLink}`} href={`/contact?type=${plan.id}&hosting=managed`} aria-label={`Ask about ${plan.title}`}>
                    Ask about this plan <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="info-panel">
          <div>
            <h2>Compare hosting providers</h2>
            <p>See setup difficulty, starting costs, and trade-offs for websites, Discord bots, and databases.</p>
          </div>
          <ButtonLink href="/resources" variant="outline">View provider guide</ButtonLink>
        </aside>
      </div>
    </>
  );
}
