import type { policies } from "@/lib/business/rules";

type PolicyClause = {
  heading: string;
  text: string;
  link?: { href: string; label: string };
};

export const defaultPolicies: Record<keyof typeof policies, PolicyClause[]> = {
  terms: [
    {
      heading: "What you’re agreeing to",
      text: "These terms cover the Scriptmoth website, client dashboard, and services. An inquiry or builder estimate starts a conversation. A commission begins when you accept a written quote and meet any start conditions in it. The accepted quote and later written changes control the specific scope, fees, schedule, and deliverables. Applicable law takes priority where it requires different terms.",
    },
    {
      heading: "Quotes, invoices, and payment",
      text: "Review the quote’s currency, expiry date, payment schedule, and any recurring or third-party costs before accepting it. If it expires, ask for a refreshed quote. Pay invoices by their stated due dates. If you spot an error, identify the invoice and the amount in question in a billing ticket. Unless applicable law or your agreement provides otherwise, any undisputed balance remains due.",
    },
    {
      heading: "Materials, access, and project delays",
      text: "Provide the agreed content, approvals, and account access on time. If several people are reviewing the work, name one person to send their combined feedback and approve changes. Use delegated account access when available and remove it when the work ends. If we’re waiting on materials, feedback, payment, or a third-party dependency, we may pause the affected work and confirm a revised schedule when it can resume.",
    },
    {
      heading: "Changes to the scope",
      text: "A revision adjusts work within the agreed scope. New features, additional integrations, and changes to approved requirements may require a separate quote. Before starting chargeable work outside the scope, we’ll document the change, price, and timing for your approval. Keep approvals and project decisions in the dashboard or another agreed written channel.",
    },
    {
      heading: "Review and acceptance",
      text: "Test the deliverables against the agreed scope and review checks. Send one consolidated list of issues during the review period in your quote. Packages include one review round for the agreed features, unless the quote specifies another allowance. Confirm acceptance in the agreed written channel when review is complete. If review is delayed, we may reschedule the remaining work.",
    },
    {
      heading: "Bug reports and ongoing support",
      text: "After you accept the work, you have 14 calendar days to report reproducible bugs in agreed features, unless your quote specifies a different support period. Include the affected feature, steps to reproduce the issue, and expected and actual results. We’ll assess whether it falls within the agreed scope. New requests, changes made after handover, and issues caused by provider updates may require separate support. Any rights you have under applicable law continue to apply.",
    },
    {
      heading: "Confidential project material",
      text: "Each party must use confidential project material only to carry out the work or meet legal obligations. Each party may share it with people and providers who need access and are subject to appropriate confidentiality duties. This duty covers material marked confidential or reasonably understood to be private. It excludes information made public without a breach of confidentiality or obtained lawfully from an independent source.",
    },
    {
      heading: "Acceptable use and account access",
      text: "Keep sign-in codes private and use accounts and integrations only within your authorized permissions. Notify Scriptmoth promptly if you suspect unauthorized access. Spam, harassment, malware, infringement, and interference with other users or services are prohibited. You’re responsible for the content, permissions, and moderation decisions in the communities and accounts you manage.",
    },
    {
      heading: "Third-party services and events outside our control",
      text: "Projects may depend on services such as Discord, domain registrars, or hosting providers. Their rules, fees, limits, and availability can change. Extra work to adapt to those changes is subject to the support terms in your quote. If an event outside either party’s reasonable control interrupts the work, the affected party should notify the other and take reasonable steps to limit the disruption. We’ll discuss a revised schedule or an orderly end to the affected work.",
    },
    {
      heading: "Suspension and termination",
      text: "Either party may end the affected service if the other materially breaches the agreement and fails to fix it within a reasonable time after written notice. Scriptmoth may suspend access immediately if needed to contain a security incident, prevent harm or misuse, or comply with law. On termination, any payment, confidentiality, and license terms that apply after the work ends continue according to the agreement.",
      link: { href: "#refunds", label: "Refund and Cancellation Policy" },
    },
    {
      heading: "Service commitments",
      text: "Scriptmoth commits to the deliverables and service levels agreed in writing and to any duties the law requires. Compatibility is assessed against the platforms and environments specified in the quote. Ongoing compatibility and maintenance depend on the support or hosting coverage you arrange.",
    },
    {
      heading: "Limits of liability for business clients",
      text: "For clients buying in the course of business, the following limits apply to the extent permitted by law. Each party’s total liability for claims arising from an affected project is capped at the fees paid or payable for that project. For ongoing hosting, the cap is the fees paid or payable for the affected hosting service during the 12 months before the event giving rise to the claim. The parties exclude indirect and consequential losses. Payment obligations and liability for fraud, willful misconduct, gross negligence, or any matter the law protects are outside these limits.",
    },
    {
      heading: "Third-party claims for business clients",
      text: "Where permitted by law, a business client is responsible for reasonable losses and defense costs arising from a third-party claim to the extent caused by infringing materials the client supplied or the client’s unlawful use of the service. Scriptmoth will give prompt notice of the claim and reasonable cooperation. Any settlement that admits fault or imposes obligations on the other party requires that party’s written approval.",
    },
    {
      heading: "Disputes and policy updates",
      text: "Send a written description of the dispute, the project reference, and the outcome you’re requesting. Both parties may try to resolve it informally while preserving their legal rights and filing deadlines. Updates to this public page apply prospectively. Changes to an accepted project agreement require written agreement or another process allowed by the agreement and applicable law. If a clause is unenforceable, the remaining clauses continue to apply where legally possible.",
    },
  ],
  privacy: [
    {
      heading: "Information Scriptmoth receives",
      text: "When you submit an inquiry or save a draft to your account, Scriptmoth receives the information you enter, including any attachments. The client dashboard stores account details, quotes, project messages, billing records, and support history. The site also uses session and rate-limit information to protect sign-ins and forms. Share only the personal information needed for your request and keep credentials and full card details out of forms and messages.",
    },
    {
      heading: "Use and disclosure",
      text: "Scriptmoth uses these records to review inquiries, deliver services, manage accounts, handle billing, and troubleshoot issues. Providers may process information to run the website, deliver emails, process payments, or supply a service you request. Scriptmoth may disclose information as required by law or when reasonably needed to respond to fraud or a security incident.",
    },
    {
      heading: "Online payments",
      text: "If you use Stripe Checkout, Stripe receives your email address and the information you provide at checkout. Scriptmoth receives payment information used to update billing records, such as the amount, status, and available receipt link. Enter card details directly on the checkout page.",
      link: { href: "https://stripe.com/privacy", label: "Stripe’s Privacy Policy" },
    },
    {
      heading: "Cookies and browser storage",
      text: "The dashboard uses session cookies to keep you signed in. Your theme preference and any build you save on this device are stored in your browser. A draft saved to your account is stored by Scriptmoth. Clearing the site’s browser data can sign you out and remove local settings and builds.",
    },
    {
      heading: "Retention and account deletion",
      text: "Retention depends on the type of record and why it is needed. Scriptmoth may retain some records after reviewing a deletion request, including records needed for billing, legal obligations, fraud prevention, or resolving a dispute. Download any account records you want to keep before requesting deletion. For a hosted project export, follow your hosting agreement.",
    },
    {
      heading: "Access, corrections, and privacy requests",
      text: "In the client dashboard, you can update your display name and email preferences, download available account records, and request account deletion. For other privacy requests, contact Scriptmoth with the email address and reference tied to your inquiry or account. We may need to verify your identity before sharing or changing account information.",
      link: { href: "/dashboard", label: "Client dashboard" },
    },
    {
      heading: "Personal data in a client project",
      text: "If your project processes information about your members or customers, discuss what it collects, who can access it, and which providers receive it before development starts. Confirm who handles privacy notices, user requests, incident communications, and deletion. If processor terms are required, agree to them in writing before sharing live data.",
    },
  ],
  refunds: [
    {
      heading: "Deposits, milestones, and outside costs",
      text: "Before accepting a quote, check when each payment is due, how deposits are applied, and how cancellation affects each fee. When a project ends early, Scriptmoth reviews the agreed terms, documented work already performed, payments received, and any authorized third-party costs. Any amount retained or billed must be permitted by the agreement and applicable law.",
    },
    {
      heading: "How to cancel or request a refund",
      text: "Send a support ticket or written message with the project name, quote or invoice reference, and the service you want to cancel or payment you want reviewed. For a billing error, identify the amount and the reason. Scriptmoth will confirm the effective date and provide a breakdown of any refund, remaining balance, or agreed third-party charge. For hosting, check whether you also need to end accounts you pay for directly.",
    },
    {
      heading: "When Scriptmoth ends the work",
      text: "If Scriptmoth ends the commission for reasons unrelated to a client breach, we’ll explain what was completed and return any prepaid amount for the services we cancelled, subject to the terms of the agreement and any greater remedy the law requires. Any handover will follow the agreed scope and license terms.",
    },
    {
      heading: "Defects, billing disputes, and legal rights",
      text: "For a defect, send the affected feature and reproduction steps so we can assess a fix or other appropriate remedy. If a refund is approved, we’ll confirm the amount and method. Payment providers may take additional time to post it. This process preserves any cancellation, refund, or payment dispute rights available to you under applicable law.",
    },
  ],
  licensing: [
    {
      heading: "Materials you supply",
      text: "You and the relevant rights holders keep ownership of the materials you provide. You give Scriptmoth permission to use those materials to perform the agreed work, including sharing them with agreed providers as needed. Obtain the permissions required for artwork, fonts, music, data, and any other assets you supply.",
    },
    {
      heading: "Custom deliverables and payment",
      text: "Check your quote for the deliverables, whether you receive ownership or permission to use them, and when those rights take effect. Ownership transfers only by express written agreement. Unless the quote provides otherwise, any license or transfer agreed in writing takes effect once the agreed fees for that work are paid in full. Check those rights before distributing, sublicensing, or reselling the work.",
    },
    {
      heading: "Reusable components and third-party licenses",
      text: "Scriptmoth retains ownership of its pre-existing tools, templates, and reusable components. If they’re included in your project, the quote should state the license you receive for them. Open-source code, paid plugins, fonts, and other third-party materials come with their own terms. Those terms govern the third-party material, including any restrictions, attribution duties, or recurring fees.",
    },
    {
      heading: "Handover, later changes, and portfolio use",
      text: "Handover includes the files and setup instructions listed in your quote. Confirm separately whether deployment, account transfer, repository access, or training is included. Track changes made after delivery so support can distinguish the delivered version from later edits. Scriptmoth will seek permission before identifying your project or displaying client-owned material in a public portfolio.",
    },
  ],
  hosting: [
    {
      heading: "Pricing, renewal, and account ownership",
      text: "Managed hosting is quoted separately. Review the setup fee, recurring management fee, infrastructure charges at the provider’s rate, and who pays each bill. Before authorizing recurring billing, confirm the renewal interval, how pricing changes are communicated, and how to stop renewals. Record who owns each domain, provider account, and deployment in the hosting agreement.",
    },
    {
      heading: "Support, maintenance, and incidents",
      text: "Your hosting agreement defines coverage, support hours, monitoring, and any response or uptime targets. An acknowledgement time is separate from the time needed to restore service. For an outage, provide the affected service, when the issue began, and what users are seeing. Scheduled maintenance, provider incidents, and urgent security work may interrupt availability. The agreement governs any service credits.",
    },
    {
      heading: "Backups and recovery",
      text: "Confirm which data is backed up, how often, how long copies are kept, and who can request a restore. Unless the plan specifies backup and restore services, arrange your own backups. Keep an independent copy of important content, especially before a migration or major change. Restoring a backup may roll back changes made after it was taken.",
    },
    {
      heading: "Usage, provider changes, and service suspension",
      text: "Stay within your plan’s usage limits and promptly address abuse reports linked to accounts you control. If usage exceeds the agreed limits, Scriptmoth may discuss a plan change or take temporary steps to prevent your service from affecting other systems. Overdue payments and violations of provider rules may lead to suspension subject to your agreement and applicable law. Emergency security measures follow the suspension terms above.",
    },
    {
      heading: "Cancelling hosting and exporting data",
      text: "Use the cancellation method specified when you enroll or send a written request through support. Include the service, desired end date, and whether you need a data export. Scriptmoth will confirm the cancellation date, any final charges, and the export window. Before access ends, confirm the export format and arrange any domain transfer or new provider access you need. Keep a copy of the export. Once the agreed export window closes, remaining hosted copies may be removed according to the agreement and applicable law.",
    },
  ],
};
