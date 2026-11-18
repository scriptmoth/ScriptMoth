/** Portfolio demos for Discord server setup — each example uses a distinct naming + embed style. */

export type DiscordEmbedField = { name: string; value: string; inline?: boolean };

export type DiscordEmbed = {
  content?: string;
  author?: { name: string; icon?: string };
  title?: string;
  url?: string;
  description?: string;
  color: string;
  fields?: DiscordEmbedField[];
  thumbnail?: string;
  image?: string;
  footer?: { text: string; icon?: string };
  timestamp?: string;
  reactions?: { emoji: string; count: number }[];
};

export type DiscordChannel = {
  id: string;
  name: string;
  topic?: string;
  embeds: DiscordEmbed[];
};

export type DiscordCategory = {
  name: string;
  channels: DiscordChannel[];
};

export type DiscordRole = {
  name: string;
  color: string;
  note?: string;
};

/** Visual treatment for embeds — drives CSS layout differences. */
export type EmbedStyle = "moodboard" | "folio" | "checklist";

export type DiscordSetupExample = {
  slug: string;
  name: string;
  useCase: string;
  summary: string;
  /** Short label for the channel-naming system. */
  namingStyle: string;
  /** Short label for the embed look. */
  embedStyleLabel: string;
  embedStyle: EmbedStyle;
  /** Example channel names shown in the style chip. */
  namingSamples: string[];
  accent: string;
  serverIcon: string;
  banner?: string;
  categories: DiscordCategory[];
  roles: DiscordRole[];
  defaultChannel: string;
};

const art = {
  atelier: "/assets/tumblr/header-velvet.jpg",
  atelierThumb: "/assets/carrd/chibi-1.png",
  atelierWip: "/assets/tumblr/post-velvet-1.jpg",
  atelierGallery: "/assets/tumblr/post-velvet-2.jpg",
  ember: "/assets/toyhouse/deco/lanterns.jpg",
  emberThumb: "/assets/toyhouse/deco/moon-icon.png",
  emberForest: "/assets/toyhouse/deco/sakura-night.jpg",
  emberLore: "/assets/toyhouse/deco/temple-night.jpg",
  emberRoster: "/assets/toyhouse/fuji.png",
  signal: "/assets/tumblr/header-garden.jpg",
  signalThumb: "/assets/carrd/chibi-3.png",
  signalEvent: "/assets/tumblr/post-garden-2.jpg",
  avatar: "/assets/logos/mark.png",
};

export const discordSetupExamples: DiscordSetupExample[] = [
  {
    slug: "ink-atelier",
    name: "Ink Atelier",
    useCase: "Artist community",
    summary: "Cute symbol prefixes, soft moodboard embeds with big art, and heart-forward role menus.",
    namingStyle: "Cute aesthetic symbols",
    embedStyleLabel: "Moodboard cards",
    embedStyle: "moodboard",
    namingSamples: ["♡﹒studio-rules", "ᰔ﹒wip-wall", "⋆｡°✩ start here"],
    accent: "#e8a87c",
    serverIcon: "IA",
    banner: art.atelier,
    defaultChannel: "rules",
    categories: [
      {
        name: "⋆｡°✩ start here ✩°｡⋆",
        channels: [
          {
            id: "rules",
            name: "♡﹒studio-rules",
            topic: "read me first · then hop into ♡﹒get-roles",
            embeds: [
              {
                content: "hi love — welcome to **ink atelier** ♡\nplease read before you post anywhere else",
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ studio handbook",
                description:
                  "a soft space for illustrators & clients.\n\n> be kind · credit artists · no stolen work\n> commission talk stays in the right channels",
                color: "#e8a87c",
                thumbnail: art.atelierThumb,
                image: art.atelier,
                fields: [
                  { name: "♡ respect", value: "no harassment · label AI-assisted work", inline: true },
                  { name: "♡ credit", value: "tag the artist when you reshare", inline: true },
                ],
                footer: { text: "ink atelier · cozy rules", icon: art.avatar },
                timestamp: "pinned",
                reactions: [{ emoji: "♡", count: 156 }, { emoji: "🎨", count: 72 }],
              },
            ],
          },
          {
            id: "roles",
            name: "♡﹒get-roles",
            topic: "react for artist · client · pronouns",
            embeds: [
              {
                content: "**pick your palette** — react to match how you show up here ♡",
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ role soft menu",
                description: "colors on the member list match these. hold as many as you need.",
                color: "#f0c4a8",
                image: art.atelierGallery,
                fields: [
                  { name: "🎨 artist", value: "you make & share", inline: true },
                  { name: "✉️ client", value: "browsing / hiring", inline: true },
                  { name: "🤍 pronouns", value: "`he/him` · `she/her` · `they/them` · `ask`" },
                ],
                footer: { text: "soft roles · ink atelier" },
                reactions: [
                  { emoji: "🎨", count: 42 },
                  { emoji: "✉️", count: 18 },
                  { emoji: "🤍", count: 31 },
                ],
              },
            ],
          },
          {
            id: "intros",
            name: "♡﹒intros",
            topic: "name · medium · portfolio",
            embeds: [
              {
                content: "copy-paste if you want ♡\n```\nname:\nmedium:\nlooking for:\nlink:\n```",
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ say hello",
                description: "staff sometimes soft-spotlights new artists in announcements.",
                color: "#e8a87c",
                image: art.atelierWip,
                footer: { text: "first posts always welcome" },
              },
            ],
          },
          {
            id: "announcements",
            name: "♡﹒announcements",
            topic: "staff only",
            embeds: [
              {
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ weekend sketch crawl",
                description: "drop a 30-min sketch in <#ᰔ﹒finished> with **#crawl**. winners get a custom role color for a week.",
                color: "#d4a574",
                image: art.atelierWip,
                footer: { text: "announcements" },
                timestamp: "yesterday",
              },
            ],
          },
        ],
      },
      {
        name: "⋆｡°✩ studio floor ✩°｡⋆",
        channels: [
          {
            id: "wip",
            name: "ᰔ﹒wip-wall",
            topic: "ask before heavy critique",
            embeds: [
              {
                content: "**wip etiquette**\n• say if you want *vibes* or *critique*\n• no callouts without staff",
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ progress wall",
                description: "layers, thumbnails, half-finished pieces. finished work → <#ᰔ﹒finished>.",
                color: "#c9a892",
                image: art.atelierWip,
                thumbnail: art.atelierThumb,
                footer: { text: "ᰔ﹒wip-wall" },
              },
            ],
          },
          {
            id: "finished",
            name: "ᰔ﹒finished",
            topic: "completed pieces only",
            embeds: [
              {
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ gallery lane",
                description: "finished art with credit. clients: browse quietly — commissions → <#♡﹒commissions>.",
                color: "#e8a87c",
                image: art.atelierGallery,
                footer: { text: "keep it soft & credited" },
              },
            ],
          },
          { id: "feedback", name: "ᰔ﹒feedback", topic: "be specific · be kind", embeds: [] },
          {
            id: "commissions",
            name: "♡﹒commissions",
            topic: "status · tos · openings",
            embeds: [
              {
                content: "**commission board** — artists pin status; clients ask in threads ♡",
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ openings",
                description: "list **open / waitlist / closed**, range, and a portfolio link.",
                color: "#c4785a",
                thumbnail: art.atelierThumb,
                image: art.atelier,
                fields: [
                  { name: "status", value: "open slots ♡", inline: true },
                  { name: "turnaround", value: "2–4 weeks", inline: true },
                ],
                footer: { text: "just art · not finance advice" },
              },
            ],
          },
        ],
      },
      {
        name: "⋆｡°✩ staff ✩°｡⋆",
        channels: [
          {
            id: "mod-chat",
            name: "♡﹒mod-den",
            topic: "private",
            embeds: [
              {
                author: { name: "ink atelier", icon: art.avatar },
                title: "♡ staff den",
                description: "moderator+ only. reports & queue notes live here.",
                color: "#a67c6d",
                footer: { text: "permission-gated" },
              },
            ],
          },
          { id: "review-queue", name: "♡﹒review-queue", topic: "showcase reviews", embeds: [] },
        ],
      },
    ],
    roles: [
      { name: "owner", color: "#f0c27a", note: "server owner" },
      { name: "admin", color: "#e8a87c" },
      { name: "moderator", color: "#c4785a" },
      { name: "artist", color: "#6a8f7a" },
      { name: "client", color: "#7a9bb5" },
      { name: "they/them", color: "#9a8fb5" },
      { name: "she/her", color: "#b58f9a" },
      { name: "he/him", color: "#8f9ab5" },
    ],
  },
  {
    slug: "embertrail",
    name: "Embertrail",
    useCase: "Roleplay server",
    summary: "Clean literary channel names, emoji only on categories, and lore-folio embeds with prose.",
    namingStyle: "Clean RP / literary",
    embedStyleLabel: "Lore folio",
    embedStyle: "folio",
    namingSamples: ["lore-library", "the-town-square", "📜 · THE CODEX"],
    accent: "#c9a227",
    serverIcon: "ET",
    banner: art.ember,
    defaultChannel: "lore",
    categories: [
      {
        name: "📜 · THE CODEX",
        channels: [
          {
            id: "lore",
            name: "lore-library",
            topic: "canonical world · read before you write",
            embeds: [
              {
                content: "*Between ash forests and glass dunes, the border town keeps a fragile peace.*",
                author: { name: "Embertrail Archives", icon: art.emberThumb },
                title: "The Embertrail",
                description:
                  "A **low fantasy** setting for slow-burn, character-first play.\n\n> Tone: literary or casual — match your partner.\n> Posting: no word-count gates. Consent first.\n\nThis board is the world bible. One topic per thread when lore grows.",
                color: "#c9a227",
                image: art.emberLore,
                fields: [
                  { name: "Ashwardens", value: "Forest wardens and caravan guards" },
                  { name: "Glasskin", value: "Dune traders and archivists" },
                ],
                footer: { text: "Volume I · The Gates", icon: art.emberThumb },
                timestamp: "Pinned",
              },
            ],
          },
          {
            id: "rules",
            name: "server-rules",
            topic: "OOC conduct & consent",
            embeds: [
              {
                author: { name: "Embertrail Archives", icon: art.emberThumb },
                title: "Table rules",
                description:
                  "**I.** Consent first — negotiate before intense scenes.\n**II.** No godmodding or metagaming.\n**III.** NSFW only in marked spaces; fade-to-black is always fine.\n**IV.** Staff may pause a scene that skips negotiation.\n\n||Appeals go to storytellers — not public chat.||",
                color: "#8b5a2b",
                fields: [
                  { name: "Characters", value: "Submit in #character-registry" },
                  { name: "After approval", value: "Take a faction role, then enter IC" },
                ],
                footer: { text: "Codex · Conduct" },
                reactions: [{ emoji: "✅", count: 90 }],
              },
            ],
          },
          {
            id: "character-intros",
            name: "character-registry",
            topic: "one sheet per character · staff approve before IC",
            embeds: [
              {
                content: "```\nName · Age · Faction\nHook (one paragraph)\nFace claim / art\nLimits & preferences\n```",
                author: { name: "Embertrail Archives", icon: art.emberThumb },
                title: "Character intake",
                description: "Staff mark sheets **approved** before you write in IC channels. Edits after approval return here.",
                color: "#c9a227",
                image: art.emberRoster,
                footer: { text: "Awaiting your story" },
              },
            ],
          },
          {
            id: "roster",
            name: "approved-roster",
            topic: "cleared characters only",
            embeds: [
              {
                author: { name: "Embertrail Archives", icon: art.emberThumb },
                title: "Living roster",
                description: "Approved bios are pinned here. Pair with a roleplay bot if you want the roster synced automatically.",
                color: "#6b8f71",
                thumbnail: art.emberRoster,
                footer: { text: "Updated by storytellers" },
              },
            ],
          },
        ],
      },
      {
        name: "💬 · OUT OF CHARACTER",
        channels: [
          { id: "ooc-chat", name: "ooc-lounge", topic: "between scenes", embeds: [] },
          { id: "plotting", name: "plot-board", topic: "partners & scene ideas", embeds: [] },
        ],
      },
      {
        name: "⚔️ · IN CHARACTER",
        channels: [
          {
            id: "town-square",
            name: "the-town-square",
            topic: "public day scenes",
            embeds: [
              {
                content: "*Lanterns hiss awake along the square. Dust from the glass road still hangs in the air.*",
                author: { name: "Embertrail Archives", icon: art.emberThumb },
                title: "Town square",
                description: "Open scenes. Tag partners. Quieter pair work moves to #private-scenes.",
                color: "#5c6b4a",
                image: art.emberForest,
                footer: { text: "In character" },
              },
            ],
          },
          { id: "ash-forest", name: "the-ash-forest", topic: "travel & wilderness", embeds: [] },
          { id: "side-streets", name: "private-scenes", topic: "one-on-one IC", embeds: [] },
        ],
      },
      {
        name: "🛠 · STORYTELLERS",
        channels: [
          {
            id: "storyteller",
            name: "storyteller-desk",
            topic: "private · plot & moderation",
            embeds: [
              {
                author: { name: "Embertrail Archives", icon: art.emberThumb },
                title: "Storyteller desk",
                description: "Faction leads and moderators only. Approvals, event beats, and reports.",
                color: "#4a3f32",
                footer: { text: "Staff" },
              },
            ],
          },
        ],
      },
    ],
    roles: [
      { name: "Storyteller", color: "#c9a227", note: "Staff" },
      { name: "Moderator", color: "#8b5a2b" },
      { name: "Ashwarden", color: "#6b8f71", note: "Faction" },
      { name: "Glasskin", color: "#7a9bb5", note: "Faction" },
      { name: "Player", color: "#c4b59a" },
      { name: "Visitor", color: "#8a8578", note: "Read-only" },
    ],
  },
  {
    slug: "signal-room",
    name: "Signal Room",
    useCase: "Creator / fan group",
    summary: "Gaming-style ⌗ prefixes, INFO dividers, and dense checklist embeds built for ops.",
    namingStyle: "Gaming / ops prefixes",
    embedStyleLabel: "Checklist cards",
    embedStyle: "checklist",
    namingSamples: ["⌗﹒start-here", "⌗﹒roles", "▬▬ INFO ▬▬"],
    accent: "#3ba55d",
    serverIcon: "SR",
    banner: art.signal,
    defaultChannel: "start-here",
    categories: [
      {
        name: "▬▬ INFO ▬▬",
        channels: [
          {
            id: "start-here",
            name: "⌗﹒start-here",
            topic: "do these three things",
            embeds: [
              {
                content: "**SIGNAL ROOM — ONBOARDING**",
                title: "START HERE",
                description:
                  "```\n[1] Read #⌗﹒announcements + #⌗﹒links\n[2] Grab interests in #⌗﹒roles\n[3] Say hi in #⌗﹒lounge\n```\nNo homework. No walls of text.",
                color: "#3ba55d",
                thumbnail: art.signalThumb,
                fields: [
                  { name: "STATUS", value: "`ONLINE`", inline: true },
                  { name: "EVENTS", value: "`SERVER TIME`", inline: true },
                  { name: "SUPPORT", value: "Ping `@Moderator` if stuck", inline: false },
                ],
                footer: { text: "ops · onboarding v2" },
                reactions: [{ emoji: "✅", count: 210 }],
              },
            ],
          },
          {
            id: "announcements",
            name: "⌗﹒announcements",
            topic: "staff only",
            embeds: [
              {
                title: "EVENT · FRIDAY WATCH PARTY",
                description:
                  "**WHEN** `20:00` server time\n**WHERE** #⌗﹒events\n**NOTE** Spoilers go in `||spoiler tags||`\n\nRSVP below. Link drops T-15.",
                color: "#5865f2",
                fields: [
                  { name: "RSVP", value: "React 📅", inline: true },
                  { name: "REMINDER", value: "Auto-ping Events role", inline: true },
                ],
                footer: { text: "announcements · signal room" },
                timestamp: "Today 12:00",
                reactions: [{ emoji: "📅", count: 47 }, { emoji: "🎉", count: 33 }],
              },
            ],
          },
          {
            id: "links",
            name: "⌗﹒links",
            topic: "socials · schedules · resources",
            embeds: [
              {
                title: "RESOURCE BOARD",
                description: "Keep links **here** so lounge stays clean.",
                color: "#4e5058",
                fields: [
                  { name: "WEB", value: "[site](#) · [newsletter](#)", inline: true },
                  { name: "VODS", value: "[archive](#)", inline: true },
                  { name: "SUPPORT", value: "[tips](#) · [merch](#)", inline: true },
                  { name: "STATUS", value: "[uptime](#)", inline: true },
                ],
                footer: { text: "pinned · do not bump" },
              },
            ],
          },
          {
            id: "roles",
            name: "⌗﹒roles",
            topic: "self-assign · no forced pings",
            embeds: [
              {
                content: "**INTEREST ROLES** — react to opt in. No ping spam unless you ask.",
                title: "ROLE MENU",
                description: "One reaction = one lane.",
                color: "#3ba55d",
                fields: [
                  { name: "🎮 GAMES", value: "`clips + nights`", inline: true },
                  { name: "🎨 ART", value: "`fanart + wip`", inline: true },
                  { name: "✍️ WRITING", value: "`fic + prompts`", inline: true },
                  { name: "📅 EVENTS", value: "`live pings`", inline: true },
                ],
                footer: { text: "roles · signal room" },
                reactions: [
                  { emoji: "🎮", count: 40 },
                  { emoji: "🎨", count: 28 },
                  { emoji: "✍️", count: 19 },
                  { emoji: "📅", count: 35 },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "▬▬ COMMUNITY ▬▬",
        channels: [
          { id: "lounge", name: "⌗﹒lounge", topic: "general", embeds: [] },
          { id: "events", name: "⌗﹒events", topic: "schedules + RSVP", embeds: [] },
          { id: "clips", name: "⌗﹒clips", topic: "share moments", embeds: [] },
        ],
      },
      {
        name: "▬▬ STAFF ▬▬",
        channels: [
          {
            id: "ops",
            name: "⌗﹒ops",
            topic: "private · hosts + mods",
            embeds: [
              {
                title: "OPS DESK",
                description: "Run-of-show and mod notes. Not visible to members.",
                color: "#2f3136",
                fields: [
                  { name: "QUEUE", value: "`clear`", inline: true },
                  { name: "NEXT EVENT", value: "Fri watch party", inline: true },
                ],
                footer: { text: "staff only" },
              },
            ],
          },
        ],
      },
    ],
    roles: [
      { name: "Host", color: "#3ba55d", note: "Staff" },
      { name: "Moderator", color: "#5865f2" },
      { name: "Games", color: "#57f287" },
      { name: "Art", color: "#eb459e" },
      { name: "Writing", color: "#9b59b6" },
      { name: "Events", color: "#fee75c" },
      { name: "Member", color: "#99aab5" },
    ],
  },
];

export function discordSetupExample(slug: string) {
  return discordSetupExamples.find((item) => item.slug === slug);
}
