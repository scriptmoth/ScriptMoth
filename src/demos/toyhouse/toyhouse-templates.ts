import { assets, type Artwork } from "@/lib/assets";
import { portfolioArtwork } from "../portfolio-art";

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
const tidepoolStudy: Artwork = { src: "/assets/portfolio/soft-atelier/tidepool-study.webp", width: 360, height: 480 };

export const toyhouseTemplates: ToyhouseTemplate[] = [
  {
    slug: "soft-atelier",
    name: "Soft Atelier",
    useCase: "User profile",
    vibe: "Ocean · sea-glass stationery",
    summary: "A coastal Toyhouse studio with an illustrated profile, a tidepool-colored field journal, and a browsable OC roster.",
    layout: "softblog",
    font: "soft",
    palette: {
      backdrop: "#dfeeed",
      page: "#fafffe",
      ink: "#173f47",
      soft: "#3d6671",
      accent: "#246b68",
      accentSoft: "#d9efea",
      panel: "#eef9f6",
      line: "#afd0cd",
      tab: "transparent",
      tabActive: "#246b68",
      headerBar: "#356764",
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
    blurb: "Soft codes, windows full of sea glass, and just enough room on the studio desk for another OC.",
    friends: [
      { name: "Pip", art: pip },
      { name: "Ao", art: ao },
      { name: "Suisen", art: suisen },
      { name: "Fuji", art: fuji },
    ],
    tags: ["#toyhousecodes", "#seaglass", "#ocdesign", "#lanternroutes"],
    introLabel: "about me",
    intro: "hi! i make toyhouse codes and keep a garden of soft little characters. ask about profile layouts, character pages, and matching folders.",
    sections: [
      { label: "Posts", title: "Notes from the tide desk", kind: "about", sideArt: tidepoolStudy, accentWords: ["tidepool", "sea glass", "Toyhouse"], paragraphs: [
        "Today’s tidepool haul: a bottle-green shard, a chipped blue shell, and the color palette for this week’s Toyhouse profile. The newest drawings are filed in the gallery.",
        "On the worktable: a folder for the ferry crew, a reference sheet for a storm-watching moth, and one very crooked star sticker I can’t bring myself to throw away.",
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
        { label: "style", value: "sea glass · studio journal" },
        { label: "includes", value: "HTML + install notes" },
        { label: "extra", value: "Premium CSS polish" },
        { label: "install", value: "Disable WYSIWYG before pasting the HTML" },
      ] },
      { label: "Gallery", kind: "gallery", gallery: [
        { title: "Butterfly study · Whistler", art: portfolioArtwork["soft-atelier"] },
        { title: "Tidepool color study", art: tidepoolStudy },
        { title: "Night", art: mood.lanterns },
        { title: "Alley", art: mood.lanternClose },
      ] },
      { label: "Links", kind: "links", links: [
        { label: "Commission info", detail: "profile & OC codes" },
        { label: "Toyhouse", detail: "Character profiles and folders" },
        { label: "Carrd", detail: "terms · prices" },
        { label: "Contact", detail: "scriptmoth inquiry" },
      ] },
    ],
  },
  {
    slug: "lantern-festival",
    name: "Lantern Festival",
    useCase: "Character page",
    vibe: "Storybook · festival folklore",
    summary: "A foxfolk courier’s travel dossier with a woodblock route plate, quick-reference facts, and a register of companions.",
    layout: "festival",
    font: "ink",
    palette: {
      backdrop: "#f3ebe4",
      page: "#fffaf6",
      ink: "#4a3428",
      soft: "#78543e",
      accent: "#8c3f2e",
      accentSoft: "#f6e4da",
      panel: "#fff8f3",
      line: "#edd9cc",
      tab: "transparent",
      tabActive: "#8c3f2e",
      headerBar: "#8c3f2e",
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
      { label: "About", title: "Courier’s notes", kind: "about", accentWords: ["lantern", "festival", "wishes"], paragraphs: [
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
