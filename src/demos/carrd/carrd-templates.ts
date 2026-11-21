import { assets, type Artwork } from "@/lib/assets";

export type CarrdLayout = "split" | "stacked" | "sidebar" | "ticket" | "retro" | "cyber";
export type CarrdFont = "regal" | "bubbly" | "ink" | "arcade" | "pixel" | "cyber";
export type CarrdSocial = "discord" | "twitter" | "vgen" | "instagram" | "kofi" | "bluesky" | "twitch" | "youtube" | "music";

export interface CarrdPalette {
  /** Page background behind the card. */
  backdrop: string;
  /** Card surface. */
  card: string;
  /** Main text on the card. */
  ink: string;
  /** Muted text. */
  soft: string;
  /** Primary accent: borders, numerals, highlights. */
  accent: string;
  /** Button / tab surface. */
  tab: string;
  /** Active tab surface. */
  tabActive: string;
  /** Text on the active tab. */
  tabActiveInk: string;
  /** Info panel surface. */
  panel: string;
  /** Glow / shadow tint. */
  glow: string;
}

export interface CarrdPair { label: string; value: string; note?: string }
export interface CarrdExample { title: string; art: Artwork; tint: string }
export interface CarrdLink { label: string; detail?: string }

/** One menu tab and the panel it opens. Each design picks its own three. */
export type CarrdSection = { label: string; title?: string } & (
  | { kind: "list"; items: string[] }
  | { kind: "pairs"; pairs: CarrdPair[] }
  | { kind: "gallery"; gallery: CarrdExample[] }
  | { kind: "links"; links: CarrdLink[] }
  | { kind: "text"; paragraphs: string[] }
);

export interface CarrdTemplate {
  slug: string;
  name: string;
  /** What the page is for, e.g. "Commission sheet". Shown on the portfolio card. */
  useCase: string;
  vibe: string;
  summary: string;
  layout: CarrdLayout;
  font: CarrdFont;
  palette: CarrdPalette;
  motif: "stars" | "hearts" | "leaves" | "cards" | "sparkles" | "neon";
  /** Little markers shown before each menu tab. */
  markers: [string, string, string];
  owner: { name: string; subtitle: string; status: string; art: Artwork };
  /** Label for the intro text shown before any tab is picked. */
  introLabel: string;
  intro: string;
  sections: [CarrdSection, CarrdSection, CarrdSection];
  socials: CarrdSocial[];
  /** Optional flourishes some designs use: a window title bar, a scrolling ticker, a hit counter. */
  extras?: { windowTitle?: string; ticker?: string; counter?: string };
}

const chibi = (n: number): Artwork => ({ src: `/assets/carrd/chibi-${n}.png`, width: 510, height: 510 });
export const chibis = [chibi(1), chibi(2), chibi(3), chibi(4)];

const galleryArt = [chibis[0], chibis[1], chibis[2], chibis[3], assets.sparkle, assets.moon];

function gallery(tints: string[], titles: string[]): CarrdExample[] {
  return titles.map((title, index) => ({ title, art: galleryArt[index % galleryArt.length], tint: tints[index % tints.length] }));
}

export const carrdTemplates: CarrdTemplate[] = [
  {
    slug: "celestial-observatory",
    name: "Celestial Observatory",
    useCase: "Commission sheet",
    vibe: "Night sky · celestial",
    summary: "An artist's commission page: terms, a price list, and examples behind an arched observatory window.",
    layout: "split",
    font: "regal",
    motif: "stars",
    markers: ["☾", "◐", "●"],
    palette: {
      backdrop: "radial-gradient(ellipse at 30% 20%, #2b3270, transparent 55%), radial-gradient(ellipse at 80% 90%, #3a2a6a, transparent 50%), #0c0f2a",
      card: "linear-gradient(140deg, #141a4a, #0b0f33 60%, #1a1650)",
      ink: "#fdf6e3",
      soft: "#c9cdf2",
      accent: "#f3d38b",
      tab: "#0e1240",
      tabActive: "#b7b5e4",
      tabActiveInk: "#1a1a44",
      panel: "linear-gradient(135deg, #3c57a8, #5b7fd0)",
      glow: "#7c8cff",
    },
    owner: { name: "Celeste Atelier", subtitle: "commissions & curiosities", status: "Commissions open", art: chibis[2] },
    introLabel: "About",
    intro: "Welcome to the observatory! I draw chibis, portraits, and reference sheets under the night sky. Pick a moon phase to read terms, prices, or past work.",
    sections: [
      { label: "Terms of Service", kind: "list", items: [
        "Payment is upfront through invoice. Work begins once it clears.",
        "Personal use only unless commercial rights are purchased.",
        "Allow 2–4 weeks for delivery. Rush orders by request.",
        "Two free revisions at the sketch stage.",
        "I may decline any request without explanation.",
      ] },
      { label: "Prices", kind: "pairs", pairs: [
        { label: "Chibi headshot", value: "$25" },
        { label: "Chibi full body", value: "$40", note: "+$15 per extra character" },
        { label: "Bust portrait", value: "$60" },
        { label: "Reference sheet", value: "$120", note: "front + back + 2 expressions" },
      ] },
      { label: "Examples", kind: "gallery", gallery: gallery(["#3c57a8", "#5b4a9e", "#2a6f9e"], ["Chibi set", "Bust portrait", "Emote pack", "Moon icon", "Ref sheet", "Mail art"]) },
    ],
    socials: ["discord", "twitter", "vgen", "instagram"],
  },
  {
    slug: "strawberry-milk",
    name: "Strawberry Milk",
    useCase: "BYF / DNI bio",
    vibe: "Pastel · soft & sweet",
    summary: "A \"before you follow\" page for a fan account: about-me basics, BYF notes, and a DNI list on a bubbly pink card.",
    layout: "stacked",
    font: "bubbly",
    motif: "hearts",
    markers: ["♡", "♡", "♡"],
    palette: {
      backdrop: "radial-gradient(circle at 20% 20%, #ffe3ef 0 18%, transparent 19%) 0 0 / 120px 120px, linear-gradient(160deg, #ffd6e7, #ffeaf2 50%, #fff4e8)",
      card: "#fffaf7",
      ink: "#6b3a4f",
      soft: "#a07687",
      accent: "#ff7fa8",
      tab: "#ffe4ee",
      tabActive: "#ff8fb3",
      tabActiveInk: "#fffaf7",
      panel: "#fff0f5",
      glow: "#ffb3cc",
    },
    owner: { name: "momo ♡", subtitle: "multifandom · artist · yapper", status: "mutuals welcome", art: chibis[1] },
    introLabel: "hi hi",
    intro: "welcome to my lil carrd! i post fanart, wips, and way too many thoughts about my blorbos. please read my byf before following ♡",
    sections: [
      { label: "about me", kind: "pairs", pairs: [
        { label: "name", value: "momo / mo" },
        { label: "pronouns", value: "she / they" },
        { label: "age", value: "20+" },
        { label: "timezone", value: "EST" },
        { label: "fandoms", value: "idol rpgs, cozy games", note: "+ whatever i'm hyperfixated on" },
      ] },
      { label: "byf", kind: "list", items: [
        "i tag spoilers & flashing images, ask if you need a tag!",
        "i retweet a LOT of art",
        "i'm slow to reply but i love talking to mutuals",
        "pls don't repost my art without credit",
      ] },
      { label: "dni", kind: "list", items: [
        "basic dni criteria",
        "ai art users or reposters",
        "under 16, sorry!",
        "if you're here to start drama",
      ] },
    ],
    socials: ["twitter", "kofi", "bluesky"],
  },
  {
    slug: "jade-teahouse",
    name: "Jade Teahouse",
    useCase: "OC profile",
    vibe: "Sea glass · ocean",
    summary: "A sea-glass OC profile for Lin Qiao with an underwater portrait, a tile menu, and tabs for stats, backstory, and art.",
    layout: "sidebar",
    font: "ink",
    motif: "leaves",
    markers: ["一", "二", "三"],
    palette: {
      backdrop: "radial-gradient(ellipse at 85% 12%, #b6f5e6, transparent 50%), linear-gradient(155deg, #9fdfdb, #337d93 72%, #133d61)",
      card: "#e5f5f0",
      ink: "#133943",
      soft: "#41636a",
      accent: "#176875",
      tab: "#f1fcf8",
      tabActive: "#176875",
      tabActiveInk: "#f5fffa",
      panel: "#f0fbf5",
      glow: "#7ccacd",
    },
    owner: { name: "Lin Qiao", subtitle: "the tile-reader of Jade Street", status: "OC · open for art", art: chibis[0] },
    introLabel: "Lin Qiao",
    intro: "A cheerful fortune-teller who reads the future in game tiles, mostly to win bets. Lucky to a fault and allergic to paperwork.",
    sections: [
      { label: "Profile", kind: "pairs", pairs: [
        { label: "Age", value: "23" },
        { label: "Height", value: "5′1″" },
        { label: "Birthday", value: "Lunar 8th" },
        { label: "Occupation", value: "Tile reader, part-time clerk" },
        { label: "Likes", value: "Lucky draws, fish snacks, rainy afternoons" },
        { label: "Dislikes", value: "Losing streaks, early mornings" },
      ] },
      { label: "Story", kind: "text", paragraphs: [
        "Lin grew up above her family's teahouse, learning tile games from regulars long before she learned her letters.",
        "Now she runs a fortune stall on Jade Street. Her readings are only half accurate, but her customers always leave smiling, and usually a little poorer.",
      ] },
      { label: "Gallery", kind: "gallery", gallery: gallery(["#cde6da", "#e7dcc3", "#bfdcd6"], ["Ref sheet", "Teahouse", "Lucky draw", "Night market", "Outfit 2", "Doodles"]) },
    ],
    socials: ["discord", "instagram", "vgen"],
  },
  {
    slug: "midnight-tarot",
    name: "Midnight Tarot",
    useCase: "VTuber hub",
    vibe: "Indigo · playful cards",
    summary: "A streamer's info hub: weekly schedule, chat rules, and where to watch, with ticket-stub tabs on a deep indigo card.",
    layout: "ticket",
    font: "arcade",
    motif: "cards",
    markers: ["♠", "♥", "♦"],
    palette: {
      backdrop: "repeating-linear-gradient(45deg, #1c1a52 0 14px, #211f5c 14px 28px)",
      card: "linear-gradient(160deg, #2c2a7a, #1b1950)",
      ink: "#fff3f8",
      soft: "#c7c3ff",
      accent: "#ff8db4",
      tab: "#3a37a0",
      tabActive: "#ff8db4",
      tabActiveInk: "#24204f",
      panel: "#24225f",
      glow: "#8f86ff",
    },
    owner: { name: "Ace Lucky", subtitle: "card-shark vtuber", status: "Live Tue · Thu · Sat", art: chibis[3] },
    introLabel: "Hey dealer",
    intro: "I'm Ace, a down-on-his-luck card shark who streams cozy games, card battlers, and the occasional horror game I regret. Grab a seat at the table!",
    sections: [
      { label: "Schedule", kind: "pairs", pairs: [
        { label: "Tuesday", value: "7pm EST", note: "card battler ranked grind" },
        { label: "Thursday", value: "8pm EST", note: "cozy farm game" },
        { label: "Saturday", value: "3pm EST", note: "viewer games + karaoke" },
        { label: "Sunday", value: "off", note: "touching grass" },
      ] },
      { label: "Chat Rules", kind: "list", items: [
        "Be kind to chat and to me (mostly me).",
        "No backseating unless I ask for help.",
        "No spoilers for games I'm playing.",
        "Keep it PG-13 and leave drama at the door.",
      ] },
      { label: "Where to Watch", kind: "links", links: [
        { label: "Twitch", detail: "live streams" },
        { label: "YouTube", detail: "VODs & clips" },
        { label: "Discord", detail: "the Card Table community" },
        { label: "Throne wishlist", detail: "spoil the dealer" },
      ] },
    ],
    socials: ["twitch", "youtube", "discord", "twitter"],
  },
  {
    slug: "glitter-guestbook",
    name: "Glitter Guestbook",
    useCase: "Fan shrine",
    vibe: "Y2K · early-web nostalgia",
    summary: "A Y2K fan-club shrine with a holographic CD sleeve, an update journal, and a guestbook ready for a note.",
    layout: "retro",
    font: "pixel",
    motif: "sparkles",
    markers: ["★", "♥", "☆"],
    palette: {
      backdrop: "radial-gradient(ellipse at 50% 0%, #493375, #281b4a 70%)",
      card: "#f7f2ff",
      ink: "#26204b",
      soft: "#695988",
      accent: "#7742ad",
      tab: "#eee4ff",
      tabActive: "#54378a",
      tabActiveInk: "#fff6ff",
      panel: "#fffafc",
      glow: "#bda7e4",
    },
    owner: { name: "Starlight Shrine", subtitle: "★ a fan shrine for the idol band", status: "Updated Nov 14", art: assets.sparkle },
    introLabel: "welcome!!",
    intro: "My little corner of the web for my favorite idol group. Catch up on the shrine, meet the band, and leave a note for the next fan.",
    sections: [
      { label: "updates", kind: "pairs", pairs: [
        { label: "11.14", value: "new icons!!", note: "20 glitter icons added" },
        { label: "11.02", value: "lyrics page", note: "translations for the new single" },
        { label: "10.21", value: "guestbook fixed", note: "sry it was broken lol" },
        { label: "10.01", value: "shrine opened!!", note: "thx 4 visiting" },
      ] },
      { label: "the band", kind: "text", paragraphs: [
        "5 members, 1 dream ★ they sing, they dance, they save the world in their music videos!!",
        "my bias is the blond one w/ the microphone. he's literally sunshine.",
      ] },
      { label: "affiliates", kind: "links", links: [
        { label: "moonbeam.fan", detail: "the BEST fan site" },
        { label: "sparkle-graphics", detail: "free blinkies!!" },
        { label: "sign my guestbook", detail: "pls i'm begging" },
        { label: "link 2 me!", detail: "88x31 button available" },
      ] },
    ],
    socials: ["discord", "twitter", "kofi"],
    extras: {
      windowTitle: "starlight_shrine.htm",
      counter: "0013337",
    },
  },
  {
    slug: "neon-district",
    name: "Neon District",
    useCase: "Link in bio",
    vibe: "Cyberpunk · neon terminal",
    summary: "A musician's link-in-bio: latest releases, upcoming shows, and every platform link on a chamfered HUD with scanlines and a glitching title.",
    layout: "cyber",
    font: "cyber",
    motif: "neon",
    markers: ["01", "02", "03"],
    palette: {
      backdrop: "linear-gradient(transparent 0 calc(100% - 1px), #ff2bd655 0) 0 0 / 100% 46px, linear-gradient(90deg, transparent 0 calc(100% - 1px), #00f0ff33 0) 0 0 / 46px 100%, radial-gradient(ellipse at 50% 110%, #ff2bd640, transparent 60%), #05040d",
      card: "linear-gradient(160deg, #0d0b1f, #070611 70%)",
      ink: "#e6fbff",
      soft: "#7c8db5",
      accent: "#00f0ff",
      tab: "#0f0d24",
      tabActive: "#ff2bd6",
      tabActiveInk: "#05040d",
      panel: "#070612",
      glow: "#ff2bd6",
    },
    owner: { name: "GHOST//WIRE", subtitle: "synthwave producer", status: "NEW EP OUT", art: chibis[3] },
    introLabel: "Signal",
    intro: "Synthwave and darksynth beamed from a rooftop in the rain. New EP NIGHT//SHIFT is out everywhere. Pick a channel below.",
    sections: [
      { label: "Releases", kind: "pairs", pairs: [
        { label: "NIGHT//SHIFT", value: "EP · 2026", note: "6 tracks" },
        { label: "Chrome Rain", value: "Single", note: "feat. vox_07" },
        { label: "Low Battery", value: "Single" },
        { label: "Neon Static", value: "Album · 2025", note: "12 tracks" },
      ] },
      { label: "Shows", kind: "pairs", pairs: [
        { label: "DEC 06", value: "Virtual rave", note: "online · free" },
        { label: "JAN 18", value: "Synth Night", note: "Chicago, IL" },
        { label: "FEB 22", value: "Retro Future Fest", note: "Austin, TX" },
      ] },
      { label: "Links", kind: "links", links: [
        { label: "Spotify", detail: "stream NIGHT//SHIFT" },
        { label: "Bandcamp", detail: "buy lossless + merch" },
        { label: "YouTube", detail: "visualizers" },
        { label: "Discord", detail: "the Grid" },
        { label: "Booking", detail: "for shows & collabs" },
      ] },
    ],
    socials: ["music", "youtube", "discord", "instagram"],
    extras: {
      ticker: "SYS://GHOSTWIRE ▮ NEW EP NIGHT//SHIFT OUT NOW ▮ NEXT SHOW DEC 06 ▮ SIGNAL STABLE ▮ ",
    },
  },
];

export function findCarrdTemplate(slug: string) {
  return carrdTemplates.find((template) => template.slug === slug);
}
