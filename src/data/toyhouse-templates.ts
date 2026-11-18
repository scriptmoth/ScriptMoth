import { assets, type Artwork } from "@/lib/assets";

export type ToyhouseLayout = "softblog" | "festival";
export type ToyhouseFont = "soft" | "ink";

export interface ToyhousePalette {
  backdrop: string;
  page: string;
  ink: string;
  soft: string;
  accent: string;
  accentSoft: string;
  panel: string;
  line: string;
  tab: string;
  tabActive: string;
  headerBar: string;
}

export interface ToyhouseStat { label: string; value: string }
export interface ToyhouseFriend { name: string; art: Artwork }
export interface ToyhouseRosterEntry {
  name: string;
  title: string;
  art: Artwork;
  stats: ToyhouseStat[];
}

export type ToyhouseSection = { label: string; title?: string } & (
  | { kind: "about"; paragraphs: string[]; accentWords?: string[]; sideArt?: Artwork }
  | { kind: "stats"; stats: ToyhouseStat[] }
  | { kind: "list"; items: string[] }
  | { kind: "roster"; roster: ToyhouseRosterEntry[] }
  | { kind: "gallery"; gallery: { title: string; art: Artwork }[] }
  | { kind: "links"; links: { label: string; detail?: string }[] }
);

export interface ToyhouseTemplate {
  slug: string;
  name: string;
  useCase: string;
  vibe: string;
  summary: string;
  layout: ToyhouseLayout;
  font: ToyhouseFont;
  palette: ToyhousePalette;
  character: {
    name: string;
    handle: string;
    status: string;
    pronouns: string;
    art: Artwork;
    joined: string;
  };
  banner: Artwork;
  bio: ToyhouseStat[];
  blurb: string;
  friends: ToyhouseFriend[];
  tags: string[];
  introLabel: string;
  intro: string;
  sections: ToyhouseSection[];
}

const { pip, fuji, ceefore, ao, suisen } = assets.toyhouseCast;
const mood = assets.toyhouseMood;

export const toyhouseTemplates: ToyhouseTemplate[] = [
  {
    slug: "soft-atelier",
    name: "Soft Atelier",
    useCase: "User profile",
    vibe: "Pastel · tumblr feed",
    summary: "A soft Toyhouse user profile: banner, overlapping avatar, sidebar bio, and feed-style tabs — the classic aesthetic layout.",
    layout: "softblog",
    font: "soft",
    palette: {
      backdrop: "#ebe6f2",
      page: "#ffffff",
      ink: "#3d3550",
      soft: "#8b7fa3",
      accent: "#9b87c9",
      accentSoft: "#e8e0f5",
      panel: "#faf8fc",
      line: "#e4dced",
      tab: "transparent",
      tabActive: "#9b87c9",
      headerBar: "#c9b8e8",
    },
    character: {
      name: "mothlight",
      handle: "@scriptmoth",
      status: "codes open",
      pronouns: "they / them",
      art: ceefore,
      joined: "Joined Nov 2024",
    },
    banner: mood.goldBokeh,
    bio: [
      { label: "Pronouns", value: "they / them" },
      { label: "Zodiac", value: "Scorpio" },
      { label: "Type", value: "INFP" },
      { label: "Timezone", value: "EST" },
    ],
    blurb: "soft codes, pastel rooms, and too many OCs. neat & simple layouts with a little sparkle.",
    friends: [
      { name: "Pip", art: pip },
      { name: "Ao", art: ao },
      { name: "Suisen", art: suisen },
      { name: "Fuji", art: fuji },
    ],
    tags: ["#toyhousecodes", "#pastel", "#ocdesign", "#lanternroutes"],
    introLabel: "about me",
    intro: "hi! i make toyhouse codes and keep a garden of soft little characters. ask about profile layouts, character pages, and matching folders.",
    sections: [
      { label: "Posts", kind: "about", accentWords: ["toyhouse", "pastel", "codes"], sideArt: ceefore, paragraphs: [
        "Welcome to my little corner of the site. I write toyhouse codes for soft, feed-style profiles and character pages that feel like a diary.",
        "Please turn off WYSIWYG before pasting. Premium CSS is optional but makes the pastel accents glow a little nicer.",
      ] },
      { label: "Roster", kind: "roster", roster: [
        { name: "Pip", title: "Lantern Courier", art: pip, stats: [
          { label: "Element", value: "Fire" }, { label: "Race", value: "Foxfolk" },
          { label: "Specialty", value: "Delivery" }, { label: "Style", value: "Soft" },
        ] },
        { name: "Ceefore", title: "Market Mage", art: ceefore, stats: [
          { label: "Element", value: "Arcane" }, { label: "Race", value: "Elf" },
          { label: "Specialty", value: "Charms" }, { label: "Style", value: "Cute" },
        ] },
        { name: "Ao", title: "Snow Guest", art: ao, stats: [
          { label: "Element", value: "Ice" }, { label: "Race", value: "Spirit" },
          { label: "Specialty", value: "Travel" }, { label: "Style", value: "Calm" },
        ] },
        { name: "Suisen", title: "Star Mechanic", art: suisen, stats: [
          { label: "Element", value: "Tech" }, { label: "Race", value: "Construct" },
          { label: "Specialty", value: "Repair" }, { label: "Style", value: "Neon" },
        ] },
      ] },
      { label: "About", kind: "stats", stats: [
        { label: "status", value: "codes open" },
        { label: "turnaround", value: "1–2 weeks" },
        { label: "slots", value: "3 open" },
        { label: "style", value: "pastel · softblog" },
        { label: "includes", value: "HTML + install notes" },
        { label: "extra", value: "Premium CSS polish" },
      ] },
      { label: "Gallery", kind: "gallery", gallery: [
        { title: "Mood", art: mood.sakura },
        { title: "Bokeh", art: mood.goldBokeh },
        { title: "Night", art: mood.lanterns },
        { title: "Alley", art: mood.lanternClose },
      ] },
      { label: "Links", kind: "links", links: [
        { label: "Commission info", detail: "profile & OC codes" },
        { label: "Toyhouse", detail: "toyhou.se/~demo" },
        { label: "Carrd", detail: "terms · prices" },
        { label: "Contact", detail: "scriptmoth inquiry" },
      ] },
    ],
  },
  {
    slug: "lantern-festival",
    name: "Lantern Festival",
    useCase: "Character page",
    vibe: "Festival · warm soft",
    summary: "A character page in the same softblog Toyhouse shape: banner, round avatar, sidebar facts, and roster-style tabs.",
    layout: "festival",
    font: "ink",
    palette: {
      backdrop: "#f3ebe4",
      page: "#fffaf6",
      ink: "#4a3428",
      soft: "#9a7460",
      accent: "#d4896a",
      accentSoft: "#f6e4da",
      panel: "#fff8f3",
      line: "#edd9cc",
      tab: "transparent",
      tabActive: "#d4896a",
      headerBar: "#e8b59a",
    },
    character: {
      name: "Pip",
      handle: "@lanternroutes",
      status: "open for asks",
      pronouns: "she / they",
      art: pip,
      joined: "Appeared festival eve",
    },
    banner: assets.toyhouseBanner,
    bio: [
      { label: "Pronouns", value: "she / they" },
      { label: "Species", value: "foxfolk" },
      { label: "Age", value: "appears 19" },
      { label: "Home", value: "traveling" },
    ],
    blurb: "delivers wishes between festival towns. soft-spoken until the fireworks start.",
    friends: [
      { name: "Ao", art: ao },
      { name: "Ceefore", art: ceefore },
      { name: "Fuji", art: fuji },
    ],
    tags: ["#lanterns", "#festival", "#foxfolk", "#wishmail"],
    introLabel: "snapshot",
    intro: "A lantern-chasing courier who delivers wishes between festival towns.",
    sections: [
      { label: "About", kind: "about", sideArt: pip, accentWords: ["lantern", "festival", "wishes"], paragraphs: [
        "Pip wanders night markets collecting paper charms and stories. Her fish-shaped pack is full of spare lanterns, sticky notes, and snacks for road spirits.",
        "Kind to strangers, terrible at staying put. Looking for a quiet rooftop for the next festival.",
      ] },
      { label: "Stats", kind: "stats", stats: [
        { label: "height", value: "5'2\"" },
        { label: "likes", value: "lanterns, sweets" },
        { label: "dislikes", value: "early mornings" },
        { label: "voice", value: "bright · breathy" },
        { label: "weapon", value: "paper charms" },
        { label: "status", value: "open for asks" },
      ] },
      { label: "Relations", kind: "roster", roster: [
        { name: "Ao", title: "Travel buddy", art: ao, stats: [
          { label: "Bond", value: "Friend" }, { label: "Met", value: "Snow route" },
          { label: "Tone", value: "Gentle" }, { label: "Notes", value: "Shares snacks" },
        ] },
        { name: "Ceefore", title: "Market friend", art: ceefore, stats: [
          { label: "Bond", value: "Ally" }, { label: "Met", value: "Night stall" },
          { label: "Tone", value: "Playful" }, { label: "Notes", value: "Sells charms" },
        ] },
        { name: "Fuji", title: "Night guard", art: fuji, stats: [
          { label: "Bond", value: "Protects" }, { label: "Met", value: "Gate road" },
          { label: "Tone", value: "Gruff" }, { label: "Notes", value: "Walks her home" },
        ] },
      ] },
      { label: "Mood", kind: "gallery", gallery: [
        { title: "Banner night", art: assets.toyhouseBanner },
        { title: "Alley", art: mood.lanternClose },
        { title: "Street", art: mood.lanterns },
        { title: "Pagoda", art: mood.nightMarket },
      ] },
      { label: "Links", kind: "links", links: [
        { label: "Masterlist", detail: "owned designs" },
        { label: "Ask box", detail: "worldbuilding welcome" },
        { label: "Playlist", detail: "night market beats" },
        { label: "Owner", detail: "toyhou.se/~demo" },
      ] },
    ],
  },
];

export function findToyhouseTemplate(slug: string) {
  return toyhouseTemplates.find((template) => template.slug === slug);
}
