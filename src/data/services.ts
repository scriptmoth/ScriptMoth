import { assets } from "@/lib/assets";

export const services = [
  {
    id: "websites",
    title: "Personal Websites",
    category: "Websites",
    art: assets.websites,
    summary: "Publish your art, writing, or character profiles on your own site.",
    features: ["Personal sites and creator portfolios", "Tumblr theme designs", "Toyhouse OC and profile designs", "Galleries for artwork and original characters", "Fan and community websites"],
  },
  {
    id: "discord",
    title: "Custom Discord Bots",
    category: "Discord Bots",
    art: assets.bot,
    summary: "Automate welcome messages, roles, support tickets, and moderation tasks.",
    features: ["Moderation commands and activity logs", "Welcome messages and links for new members", "Roles members can choose from a menu or with reactions", "Private support tickets and community management tools"],
  },
  {
    id: "discord-setup",
    title: "Discord Server Setup",
    category: "Discord Servers",
    art: assets.community,
    summary: "We build out your Discord: channels, roles, permissions, and branded embeds—standalone or with a bot.",
    features: ["Channel categories, naming, topics, and permission layout", "Role hierarchy with colors and clear staff vs member access", "Formatted embeds for rules, welcome, FAQs, and info posts", "Can be ordered alone or bundled with a custom Discord bot"],
  },
  {
    id: "community",
    title: "Roleplay & Community Tools",
    category: "Community Systems",
    art: assets.community,
    summary: "Give your group one place to track characters, gear, and quests.",
    features: ["Character profiles and rosters", "Inventories, currencies, and progression", "Quests and custom roleplay mechanics", "Dashboards and Discord integrations"],
  },
  {
    id: "hosting",
    title: "Hosting & Maintenance",
    category: "Hosting",
    art: assets.hosting,
    summary: "Choose your own provider or have Scriptmoth set up and manage third-party services for your project.",
    features: ["Third-party setup for websites, bots, and databases", "Maintenance and updates", "Uptime and infrastructure monitoring", "Technical support"],
  },
] as const;

export const processSteps = [
  { title: "Describe the project", description: "Start with who will use it and what they need to do." },
  { title: "Try a first version", description: "Once the scope is agreed, you can try an early layout or prototype and give feedback." },
  { title: "Test and hand over", description: "Scriptmoth tests the finished work. Before handover, both sides agree on who will maintain it after launch." },
];
