import { assets } from "@/lib/assets";

/** The service rows on the homepage. Package prices and contents live in `data/builder.ts`. */
export const services = [
  {
    id: "websites",
    title: "Personal Websites",
    art: assets.websites,
    summary: "One-page sites, Toyhouse codes, Tumblr themes, and character wikis for your art, writing, and OCs.",
  },
  {
    id: "discord",
    title: "Custom Discord Bots",
    art: assets.bot,
    summary: "Welcome messages, reaction roles, tickets, mod logs, birthdays, and question-of-the-day posts, built for one server.",
  },
  {
    id: "discord-setup",
    title: "Discord Server Setup",
    art: assets.community,
    summary: "Channels, roles, permissions, and branded embeds, laid out so people can find things. Works with or without a bot.",
  },
  {
    id: "community",
    title: "Roleplay & Community Tools",
    art: assets.community,
    summary: "Character approvals and rosters, dice, inventories, shops, quests, and crafting for roleplay groups.",
  },
  {
    id: "hosting",
    title: "Hosting & Maintenance",
    art: assets.hosting,
    summary: "Host it yourself with a handover, or I set up the hosting and keep it updated each month.",
  },
] as const;

export const processSteps = [
  { title: "Tell me what you’re making", description: "Who it’s for and what they need to do with it. Rough ideas are fine." },
  { title: "Try an early version", description: "Once we agree on scope, you get a first layout or prototype to click around and react to." },
  { title: "Testing and handover", description: "I test everything before handing it over, and we agree up front on who looks after it once it’s live." },
];
