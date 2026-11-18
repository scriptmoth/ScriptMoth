export const faqCategories = ["Projects", "Process", "Billing", "Hosting"] as const;

export type FaqCategory = (typeof faqCategories)[number];

export type FaqEntry = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

/** Split admin “question | answer” lines. Returns null when the line is incomplete. */
export function parseFaqLine(entry: string): { question: string; answer: string } | null {
  const separator = entry.indexOf("|");
  if (separator <= 0) return null;
  const question = entry.slice(0, separator).trim();
  const answer = entry.slice(separator + 1).trim();
  if (!question || !answer) return null;
  return { question, answer };
}

export const questions = [
  {
    id: "projects",
    category: "Projects",
    question: "What does Scriptmoth build?",
    answer:
      "Scriptmoth builds personal sites, custom Discord bots, Discord server setup (channels, roles, embeds), and roleplay tools such as character rosters and quest trackers. Server setup is separate from bots and can be bundled with one. Work is scoped for individuals and small groups.",
  },
  {
    id: "discord-setup",
    category: "Projects",
    question: "What is Discord server setup?",
    answer:
      "Scriptmoth configures your Discord without building a bot: channel categories and naming, role hierarchy and colors, permission layout, and branded embeds for rules, welcome, FAQs, or links. Order it alone, or add the same work when you commission a custom bot.",
  },
  {
    id: "discord-styles",
    category: "Projects",
    question: "Where can I see Discord examples?",
    answer:
      "Browse the Discord Style Library on the Portfolio page: 100 channel and category naming styles, each with a preview and a code like 02F. Add the codes you like in the quote builder and say what you would change. For bots and server features, describe what you need and we’ll confirm the details in your quote.",
  },
  {
    id: "packages-vs-custom",
    category: "Projects",
    question: "What’s the difference between a package and custom work?",
    answer:
      "Packages list a starting set of features and a starting price. You can customize a package in the project builder. If nothing fits, describe the features you need for a custom quote.",
  },
  {
    id: "existing",
    category: "Projects",
    question: "Can I get help with an existing website or Discord server?",
    answer:
      "Yes. Include a link if it’s public. Describe how it works now, what you want to change, and any accounts or code Scriptmoth will need access to. For Discord, that can mean a bot, a full server setup (channels, roles, embeds), or both.",
  },
  {
    id: "assets",
    category: "Projects",
    question: "Who provides the artwork and other project assets?",
    answer:
      "You supply all assets the project uses, including logos, illustrations, photos, icons, or other media. Scriptmoth focuses on development; creating and sourcing artwork are outside the service.",
  },
  {
    id: "third-party-fees",
    category: "Projects",
    question: "Are domains, Discord Nitro, or other third-party fees included?",
    answer:
      "No. Domains, hosting provider usage, paid Discord features, fonts, plugins, and similar third-party charges are separate unless your quote says otherwise.",
  },
  {
    id: "inquiry",
    category: "Process",
    question: "What should I include in an inquiry?",
    answer:
      "Describe who will use the project and what they need to do. List required features, and include a budget and target date if you have them. Links to examples or an existing site or server help.",
  },
  {
    id: "quote",
    category: "Process",
    question: "How do project estimates work?",
    answer:
      "The Packages page lists starting prices. Your quote confirms the total, extras, schedule, and deliverables. For custom work, Scriptmoth estimates the cost once the scope is agreed. An inquiry or builder estimate starts a conversation; work begins after you accept a written quote and meet any start conditions in it.",
  },
  {
    id: "timeline",
    category: "Process",
    question: "How long does a project take?",
    answer:
      "Your quote includes the schedule for the agreed scope. Timelines depend on complexity and how quickly you send assets, access, and feedback. If work is waiting on materials or approvals, Scriptmoth may pause the affected work and confirm a revised schedule when it can resume.",
  },
  {
    id: "revisions",
    category: "Process",
    question: "What if I need changes?",
    answer:
      "Each package includes one review round for the agreed features unless your quote says otherwise. Send one consolidated list of issues during review. New features, extra integrations, and changes to approved requirements receive a separate quote before that work starts.",
  },
  {
    id: "bugs",
    category: "Process",
    question: "What if something breaks after handover?",
    answer:
      "After you accept the work, you have 14 calendar days to report reproducible bugs in the agreed features, unless your quote sets a different window. Include the feature, steps to reproduce, and expected versus actual results. Changes made after handover, provider updates, and new requests may need separate support.",
  },
  {
    id: "handover",
    category: "Process",
    question: "What will I get at handover?",
    answer:
      "Your quote lists what you’ll receive: source code, a deployable build, or both. It also identifies reusable components and their licenses. Setup instructions come with the finished project. Confirm separately whether deployment, account transfer, or training is included.",
  },
  {
    id: "communication",
    category: "Process",
    question: "How do we communicate during a project?",
    answer:
      "Keep project decisions and approvals in the client dashboard or another written channel listed in your quote. If several people are reviewing, name one person to send combined feedback and approve changes.",
  },
  {
    id: "payment",
    category: "Billing",
    question: "When do I pay, and when does work start?",
    answer:
      "Review the quote’s currency, expiry date, payment schedule, and any recurring or third-party costs before accepting it. Work starts after you accept the written quote and meet any start conditions it lists, such as a deposit. Pay invoices by their stated due dates.",
  },
  {
    id: "cancel-refund",
    category: "Billing",
    question: "Can I cancel or get a refund?",
    answer:
      "Send a support ticket or written message with the project name, quote or invoice reference, and what you want cancelled or reviewed. Scriptmoth reviews the agreed terms, documented work already done, payments received, and any authorized third-party costs. Full details are in the Refund and Cancellation Policy.",
  },
  {
    id: "ownership",
    category: "Billing",
    question: "Who owns the finished work?",
    answer:
      "You keep ownership of materials you supply. Check your quote for whether you receive ownership of custom deliverables or a license to use them, and when those rights take effect. Scriptmoth retains its pre-existing tools and reusable components; the quote states the license you get for any that are included. Third-party code and assets keep their own terms.",
  },
  {
    id: "policies",
    category: "Billing",
    question: "Where can I read the full terms?",
    answer:
      "The Policies page covers terms of service, privacy, refunds and cancellations, software ownership and licensing, and hosting. Review those before accepting a quote, paying an invoice, or starting a hosting plan.",
  },
  {
    id: "hosting",
    category: "Hosting",
    question: "Can I host the project myself?",
    answer:
      "Yes. Choose client-managed hosting and share your provider and plan before scoping. You set up and run the services; Scriptmoth can walk you through the handover steps and check compatibility.",
  },
  {
    id: "hosting-cost",
    category: "Hosting",
    question: "What does managed hosting cover?",
    answer:
      "Scriptmoth sets up and manages your project on third-party infrastructure. The hosting page lists current management fees. Provider usage and setup are scoped separately. Your hosting quote spells out monitoring, backups, updates, and support hours.",
  },
  {
    id: "maintenance",
    category: "Hosting",
    question: "What can ongoing maintenance cover?",
    answer:
      "Depending on the plan, Scriptmoth can monitor uptime, help with updates, or keep backups. Confirm which data is backed up, how often copies are kept, and who can request a restore. The hosting quote spells out what’s included.",
  },
  {
    id: "hosting-cancel",
    category: "Hosting",
    question: "How do I cancel managed hosting or export my data?",
    answer:
      "Use the cancellation method from enrollment or send a written support request with the service, desired end date, and whether you need a data export. Scriptmoth confirms the end date, any final charges, and the export window. Arrange domain transfer or new provider access before access ends.",
  },
] as const satisfies readonly FaqEntry[];
