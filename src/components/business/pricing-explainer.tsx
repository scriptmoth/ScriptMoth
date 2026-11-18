import Link from "next/link";
import { Window } from "@/components/ui";

const covers: [string, string][] = [
  ["Development", "Writing the code for each feature."],
  ["Complexity", "How many rules, screens, and special cases a feature has."],
  ["Testing", "Trying every feature the way your members or visitors will, including the ways they might break it."],
  ["Integration", "Making features work together, like a shop that reads from a currency balance."],
  ["Setup", "Configuring channels, roles, pages, or settings for your project."],
  ["Documentation", "Handover notes explaining how to use and run what you got."],
  ["Deployment", "Putting it online and checking it works there."],
  ["Ongoing infrastructure", "Hosting, only if you need it, billed monthly and shown separately."],
];

export function PricingExplainer() {
  return <section className="pricing-explainer" aria-labelledby="pricing-explainer-title">
    <Window label="how-pricing-works.txt">
      <div className="business-panel business-stack">
        <h2 id="pricing-explainer-title">How pricing works</h2>
        <p>Every price in the builder is a starting price for a defined piece of work. You see exactly what each feature adds, and nothing is added without you choosing it.</p>
        <div className="explainer-grid">
          <div>
            <h3>What a price covers</h3>
            <dl className="explainer-list">{covers.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
          </div>
          <div className="business-stack">
            <h3>Why features cost different amounts</h3>
            <p>A reaction role lets members click an emoji to receive a role. A custom inventory system needs somewhere to store everyone’s items, rules for changing inventory, and ways to prevent mistakes, like an item being duplicated. That’s why the two features cost different amounts.</p>
            <h3>What the labels mean</h3>
            <ul className="business-list">
              <li><strong>$40</strong> is a set starting price for the feature as described.</li>
              <li><strong>$500+</strong> is a starting price. The final amount is confirmed once Scriptmoth knows your rules.</li>
              <li><strong>Custom estimate</strong> means the work varies too much to price without details. It’s never counted as free.</li>
              <li><strong>Price pending review</strong> means Scriptmoth hasn’t set a price for it yet. You’ll get one with your quote.</li>
              <li><strong>Included</strong> means your starter package already pays for it, so it isn’t charged twice.</li>
            </ul>
            <h3>Shared work is counted once</h3>
            <p>If several features save information, they share one database. If several need sign-in, they share one sign-in system. You pay for that shared piece once, not per feature.</p>
          </div>
        </div>
        <div className="explainer-grid">
          <div className="business-stack">
            <h3>One-time and monthly costs stay separate</h3>
            <p>The one-time estimate is for building your project. Hosting and management plans are monthly and are never mixed into that number. Domains, hosting provider usage, and other services your project connects to are paid to those providers.</p>
          </div>
          <div className="business-stack">
            <h3>Support and revisions</h3>
            <p>Each project includes one review round against the agreed scope. For 14 days after you accept the work, bugs in the agreed features are fixed at no charge. After that, fixes and changes are covered by a maintenance plan or quoted separately. New features are always quoted before work starts.</p>
            <p>What you receive at handover, including any reusable components and their license, is set out in your project agreement. See the <Link className="text-link" href="/policies#licensing">software ownership and licensing policy</Link>.</p>
          </div>
        </div>
        <p className="form-notice">Builder totals are estimates, not binding offers. Final prices are confirmed after Scriptmoth reviews your requirements and sends a written quote, and nothing is charged until you accept it.</p>
      </div>
    </Window>
  </section>;
}
