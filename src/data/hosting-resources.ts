/** Third-party hosting provider comparisons for `/resources`. */

export type Stars = 1 | 2 | 3 | 4 | 5;

export type Provider = {
  name: string;
  /** 5 = easiest setup */
  ease: Stars;
  /** 5 = cheapest to get started */
  budget: Stars;
  freeStart?: boolean;
  cost: string;
  /** Typical monthly cost for a small hobby project */
  range: string;
  fit: string;
  note: string;
  docs: string;
  pricing: string;
};

export type ResourceSection = {
  id: string;
  title: string;
  icon: "globe" | "bot" | "database";
  description: string;
  providers: Provider[];
};

export const resourceSections: ResourceSection[] = [
  {
    id: "websites",
    title: "Websites and web apps",
    icon: "globe",
    description: "A static site can serve finished pages from files. Sign-in, custom forms, and editable content often need a backend.",
    providers: [
      {
        name: "Cloudflare Pages",
        range: "$0–5",
        ease: 5,
        budget: 5,
        freeStart: true,
        cost: "Free for static requests",
        fit: "Static portfolios and personal sites",
        note: "Upload built files or connect a Git repository. Pages Functions count toward separate Workers quotas.",
        docs: "https://developers.cloudflare.com/pages/",
        pricing: "https://developers.cloudflare.com/pages/functions/pricing/",
      },
      {
        name: "GitHub Pages",
        range: "$0–4",
        ease: 5,
        budget: 5,
        freeStart: true,
        cost: "Free with a public repository",
        fit: "Project documentation and personal sites",
        note: "Publish from GitHub. Private repositories require an eligible paid plan, and GitHub restricts use for online businesses, e-commerce, and commercial SaaS.",
        docs: "https://docs.github.com/en/pages/getting-started-with-github-pages",
        pricing: "https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits",
      },
      {
        name: "Netlify",
        range: "$0–20",
        ease: 5,
        budget: 4,
        freeStart: true,
        cost: "Free tier · Personal from $9/month",
        fit: "Frontend projects with preview deployments",
        note: "Deploy from Git or upload a finished site. The free tier caps monthly credits used by production deploys, traffic, and functions.",
        docs: "https://docs.netlify.com/",
        pricing: "https://www.netlify.com/pricing/",
      },
      {
        name: "Vercel",
        range: "$0–20+",
        ease: 5,
        budget: 4,
        freeStart: true,
        cost: "Free Hobby · Pro from $20/month",
        fit: "Next.js websites and web apps",
        note: "Import your repository and configure any environment variables. Hobby is for personal, non-commercial use. Pro charges for usage beyond the included credit.",
        docs: "https://vercel.com/frameworks/nextjs",
        pricing: "https://vercel.com/pricing",
      },
      {
        name: "Render Static Sites",
        range: "$0",
        ease: 4,
        budget: 5,
        freeStart: true,
        cost: "Free for static sites",
        fit: "A static frontend next to a Render backend or bot",
        note: "Connect a repository and set a build command and publish folder. Keeping the site and its backend on one dashboard makes them easier to manage together.",
        docs: "https://render.com/docs/static-sites",
        pricing: "https://render.com/pricing",
      },
      {
        name: "Firebase Hosting",
        range: "$0–10",
        ease: 4,
        budget: 4,
        freeStart: true,
        cost: "Free Spark plan · pay-as-you-go Blaze",
        fit: "Sites that also use other Firebase services",
        note: "Deploy with the Firebase CLI. The free plan includes storage and transfer limits, and some features need the pay-as-you-go plan with a billing account.",
        docs: "https://firebase.google.com/docs/hosting",
        pricing: "https://firebase.google.com/pricing",
      },
    ],
  },
  {
    id: "bots",
    title: "Discord bots and servers",
    icon: "bot",
    description: "Bots connected to Discord’s Gateway need a process that stays running. Compare always-on compute when budgeting for one.",
    providers: [
      {
        name: "Render",
        range: "$7–25",
        ease: 3,
        budget: 3,
        cost: "$7/month for a Starter worker",
        fit: "Gateway bots on a managed background worker",
        note: "Configure a build command, a start command, and environment variables. A worker runs without a public URL.",
        docs: "https://render.com/hosting/discord-bots",
        pricing: "https://render.com/pricing",
      },
      {
        name: "Railway",
        range: "$5–20",
        ease: 3,
        budget: 4,
        cost: "$5/month Hobby minimum",
        fit: "Bots that share a project with other services",
        note: "Deploy the bot as a persistent service. The monthly minimum includes $5 in usage. You pay for usage above that amount.",
        docs: "https://docs.railway.com/services",
        pricing: "https://docs.railway.com/pricing/plans",
      },
      {
        name: "Fly.io",
        range: "$2–10",
        ease: 2,
        budget: 4,
        cost: "Usage-based, with a $2.19 example for 30 days",
        fit: "Containerized bots that need control over regions",
        note: "Deployment uses a CLI and machine configuration. The example is for a 256 MB machine in select regions. Check memory, storage, and traffic needs.",
        docs: "https://fly.io/docs/launch/",
        pricing: "https://docs.fly.io/about/pricing",
      },
      {
        name: "DigitalOcean Droplets",
        range: "$4–12",
        ease: 1,
        budget: 4,
        cost: "Bundled VPS plans from $4/month",
        fit: "Bots or apps that need their own Linux server",
        note: "You install the runtime, keep the bot running, and handle server updates and backups. Check memory requirements before choosing the smallest plan.",
        docs: "https://docs.digitalocean.com/products/droplets/",
        pricing: "https://www.digitalocean.com/pricing/droplets",
      },
      {
        name: "Hetzner Cloud",
        range: "€4–10",
        ease: 1,
        budget: 4,
        cost: "Low-cost VPS plans, billed hourly up to a monthly cap",
        fit: "Several bots on one inexpensive server",
        note: "You manage the server yourself, like any VPS. Prices are listed in euros and vary by location, so check the region closest to your users.",
        docs: "https://docs.hetzner.com/cloud/",
        pricing: "https://www.hetzner.com/cloud",
      },
      {
        name: "Oracle Cloud Free Tier",
        range: "$0",
        ease: 1,
        budget: 5,
        freeStart: true,
        cost: "Always Free compute within set limits",
        fit: "Hobby bots when you’re comfortable running a server",
        note: "Sign-up asks for a payment card for verification. Free capacity varies by region and can be unavailable, and idle free instances may be reclaimed.",
        docs: "https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm",
        pricing: "https://www.oracle.com/cloud/free/",
      },
    ],
  },
  {
    id: "databases",
    title: "Databases",
    icon: "database",
    description: "These services can store your app’s data. Budget for the app or bot host separately, and check storage, backups, and restore options.",
    providers: [
      {
        name: "Supabase",
        range: "$0–25",
        ease: 3,
        budget: 4,
        freeStart: true,
        cost: "Free tier · Pro from $25/month",
        fit: "PostgreSQL with optional sign-in and file storage",
        note: "The dashboard handles database setup. Apps that access data from the browser also need access policies. Free projects can pause after a week of inactivity.",
        docs: "https://supabase.com/docs/guides/database/overview",
        pricing: "https://supabase.com/pricing",
      },
      {
        name: "Neon",
        range: "$0–20",
        ease: 4,
        budget: 4,
        freeStart: true,
        cost: "Free tier · usage-based paid plans",
        fit: "Managed PostgreSQL for an app with its own backend",
        note: "Create a database and add its connection string to your app. Paid plans meter compute and storage. Check the restore history included with your plan.",
        docs: "https://neon.com/docs",
        pricing: "https://neon.com/pricing",
      },
      {
        name: "MongoDB Atlas",
        range: "$0–30",
        ease: 4,
        budget: 4,
        freeStart: true,
        cost: "Free cluster · paid tiers by usage",
        fit: "Flexible document data for bots and apps",
        note: "Create a cluster, allow your host’s IP addresses, and copy the connection string. The free cluster has storage and throughput limits and no automatic backups.",
        docs: "https://www.mongodb.com/docs/atlas/",
        pricing: "https://www.mongodb.com/pricing",
      },
      {
        name: "Turso",
        range: "$0–5",
        ease: 4,
        budget: 4,
        freeStart: true,
        cost: "Free tier · paid plans by usage",
        fit: "Lightweight SQLite databases for small apps",
        note: "Create a database from the dashboard or CLI and connect with an auth token. Check your plan’s limits on databases, storage, and monthly reads and writes.",
        docs: "https://docs.turso.tech/",
        pricing: "https://turso.tech/pricing",
      },
    ],
  },
];
