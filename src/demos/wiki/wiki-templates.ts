import { assets, type Artwork } from "@/lib/assets";

/**
 * OC / character wiki demos. Every template shows the same sample world, the Lantern Routes,
 * so visitors can compare wiki styles side by side. Pages, search, and tags all run client-side.
 */

/** Each layout is its own component: an encyclopedia wiki, a game-style codex, and a scrapbook OC directory. */
export type WikiLayout = "encyclopedia" | "codex" | "scrapbook";

export interface WikiPalette {
  backdrop: string;
  page: string;
  panel: string;
  ink: string;
  soft: string;
  accent: string;
  accentSoft: string;
  line: string;
  head: string;
  headInk: string;
}

export interface WikiField { label: string; value: string }
export interface WikiSection { id: string; title: string; paragraphs: string[] }
export interface WikiRelation { slug: string; bond: string; note: string }
/** 0–100, shown as bars in the codex layout. */
export interface WikiStat { label: string; value: number }

export interface WikiCharacter {
  slug: string;
  name: string;
  title: string;
  summary: string;
  art: Artwork;
  color: string;
  quote: string;
  stats: WikiStat[];
  fields: WikiField[];
  tags: string[];
  home: string;
  sections: WikiSection[];
  relations: WikiRelation[];
  trivia: string[];
  gallery: { caption: string; art: Artwork }[];
}

export interface WikiPlace {
  slug: string;
  name: string;
  kind: string;
  region: string;
  summary: string;
  art: Artwork;
  paragraphs: string[];
  residents: string[];
}

export interface WikiEvent {
  year: string;
  era: string;
  title: string;
  text: string;
  characters: string[];
  place?: string;
}

export interface WikiEdit { page: string; slug: string; kind: "character" | "place" | "timeline"; change: string; when: string }

export interface WikiTemplate {
  slug: string;
  name: string;
  useCase: string;
  vibe: string;
  summary: string;
  layout: WikiLayout;
  palette: WikiPalette;
  banner: Artwork;
}

const { pip, fuji, ceefore, ao, suisen } = assets.toyhouseCast;
const mood = assets.toyhouseMood;

export const wikiWorld = {
  name: "Lantern Routes Wiki",
  tagline: "An encyclopedia of the festival towns, night roads, and the people who carry wishes between them.",
  intro: "The Lantern Routes are a ring of festival towns joined by roads that only open after dark. Couriers carry paper wishes from town to town, wardens keep the gates, and something old lives up in the snow.",
  owner: "demo world · characters by the owner",
};

export const wikiCharacters: WikiCharacter[] = [
  {
    slug: "pip",
    name: "Pip",
    title: "Wishmail courier",
    summary: "A foxfolk courier who carries paper wishes between festival towns and never stays anywhere longer than a night.",
    art: pip,
    color: "#e2875f",
    quote: "If it fits in the pack, it gets there by morning.",
    stats: [{ label: "Speed", value: 92 }, { label: "Strength", value: 34 }, { label: "Magic", value: 58 }, { label: "Charm", value: 80 }],
    fields: [
      { label: "Pronouns", value: "she / they" },
      { label: "Species", value: "Foxfolk" },
      { label: "Age", value: "Appears 19" },
      { label: "Home", value: "Hollowmere (roaming)" },
      { label: "Occupation", value: "Wishmail courier" },
      { label: "Affiliation", value: "The Wishmail Post" },
      { label: "Element", value: "Fire" },
      { label: "Status", value: "Active" },
    ],
    tags: ["courier", "foxfolk", "fire", "wishmail", "hollowmere"],
    home: "hollowmere",
    sections: [
      { id: "appearance", title: "Appearance", paragraphs: [
        "Pip is small and quick, with ember-orange fur that brightens when she is excited. She carries a fish-shaped pack stuffed with spare lanterns, sticky notes, and snacks for road spirits.",
      ] },
      { id: "personality", title: "Personality", paragraphs: [
        "Soft-spoken until the fireworks start. Pip is kind to strangers and terrible at staying put. She remembers every address she has ever delivered to, but forgets where she left her own boots.",
      ] },
      { id: "history", title: "History", paragraphs: [
        "Pip was found asleep inside a crate of undelivered wishes at the Wishmail Post. The postmaster gave her the route nobody wanted, the Gate Road after midnight, and she has run it ever since.",
        "During the Long Dark she carried the last lit lantern from Hollowmere to Kiri Pass, which is how she met Ao.",
      ] },
      { id: "abilities", title: "Abilities", paragraphs: [
        "Pip can keep a lantern lit in any weather and uses paper charms to mark safe paths on the night roads. She is faster than she looks and very hard to catch.",
      ] },
    ],
    relations: [
      { slug: "ao", bond: "Travel buddy", note: "Shares snacks on the snow route." },
      { slug: "ceefore", bond: "Friend", note: "Buys her charms in bulk." },
      { slug: "fuji", bond: "Protector", note: "Walks her home from the gate." },
      { slug: "suisen", bond: "Mechanic", note: "Fixes her lantern for free." },
    ],
    trivia: [
      "Her pack is named Gill.",
      "She has never once delivered a wish late.",
      "Pip hates early mornings and sleeps through most of them.",
    ],
    gallery: [
      { caption: "Hollowmere at night", art: mood.lanterns },
      { caption: "Her favorite alley", art: mood.lanternClose },
    ],
  },
  {
    slug: "fuji",
    name: "Fuji",
    title: "Warden of the Gate Road",
    summary: "A horned oxkin brawler who guards the Gate Road at night and pretends not to care about the couriers who pass through.",
    art: fuji,
    color: "#d23b5a",
    quote: "Road's closed. Unless you've got a lantern. Then it's open.",
    stats: [{ label: "Speed", value: 48 }, { label: "Strength", value: 96 }, { label: "Magic", value: 18 }, { label: "Charm", value: 55 }],
    fields: [
      { label: "Pronouns", value: "he / him" },
      { label: "Species", value: "Oxkin" },
      { label: "Age", value: "27" },
      { label: "Home", value: "The Gate Road" },
      { label: "Occupation", value: "Night warden" },
      { label: "Affiliation", value: "The Lantern Watch" },
      { label: "Element", value: "Earth" },
      { label: "Status", value: "Active" },
    ],
    tags: ["warden", "oxkin", "brawler", "lantern-watch", "gate-road"],
    home: "gate-road",
    sections: [
      { id: "appearance", title: "Appearance", paragraphs: [
        "Tall and broad, with curved horns, a long tufted tail, and crimson markings across his shoulders. He wears a dark hakama patterned with red flame shapes and fights with wrapped fists.",
      ] },
      { id: "personality", title: "Personality", paragraphs: [
        "Gruff, loud, and secretly sentimental. Fuji acts like every traveler is a nuisance, then walks them to the next town anyway.",
      ] },
      { id: "history", title: "History", paragraphs: [
        "Fuji joined the Lantern Watch after the Gate Road flooded and he held the old bridge up long enough for a caravan to cross. He has refused every promotion since.",
      ] },
      { id: "abilities", title: "Abilities", paragraphs: [
        "Enormous strength and a stubborn refusal to fall over. He can hear the gate stones shift before the road opens each night.",
      ] },
    ],
    relations: [
      { slug: "pip", bond: "Charge", note: "Calls her “kid” and worries constantly." },
      { slug: "ao", bond: "Wary", note: "Doesn't trust anything that doesn't leave footprints." },
    ],
    trivia: [
      "Keeps a jar of Ceefore's luck charms behind the gatehouse door.",
      "Can't whistle, has tried for years.",
    ],
    gallery: [
      { caption: "The gate at dusk", art: mood.lanternBg },
    ],
  },
  {
    slug: "ceefore",
    name: "Ceefore",
    title: "Night market mage",
    summary: "An elf charm-seller who runs the busiest stall in the Hollowmere night market and knows everyone's business.",
    art: ceefore,
    color: "#a77bd6",
    quote: "First charm's free. The second one costs a secret.",
    stats: [{ label: "Speed", value: 52 }, { label: "Strength", value: 26 }, { label: "Magic", value: 88 }, { label: "Charm", value: 94 }],
    fields: [
      { label: "Pronouns", value: "she / her" },
      { label: "Species", value: "Elf" },
      { label: "Age", value: "23" },
      { label: "Home", value: "Hollowmere" },
      { label: "Occupation", value: "Charm-seller" },
      { label: "Affiliation", value: "Hollowmere Night Market" },
      { label: "Element", value: "Arcane" },
      { label: "Status", value: "Active" },
    ],
    tags: ["mage", "elf", "charms", "market", "hollowmere"],
    home: "hollowmere",
    sections: [
      { id: "appearance", title: "Appearance", paragraphs: [
        "Lilac twin-tails tied with black ribbon, small curled wings, and fingerless gloves stained with charm ink. She is almost never seen without a mouthful of something sweet.",
      ] },
      { id: "personality", title: "Personality", paragraphs: [
        "Playful, nosy, and generous with anyone she likes. Ceefore trades in gossip as much as charms and keeps a mental ledger of who owes her a favor.",
      ] },
      { id: "history", title: "History", paragraphs: [
        "She arrived in Hollowmere with one bag of blank paper and talked her way into a stall by the end of the week. Three years later the stall has a waiting list.",
      ] },
      { id: "abilities", title: "Abilities", paragraphs: [
        "Ceefore writes charms for luck, safe travel, and finding lost things. Her finding charms are unreliable, but nobody has told her.",
      ] },
    ],
    relations: [
      { slug: "pip", bond: "Best customer", note: "Saves the good paper for her." },
      { slug: "suisen", bond: "Rival", note: "They argue about whether magic is just slow engineering." },
    ],
    trivia: [
      "Her wings are mostly decorative and she is a little sensitive about it.",
      "Sells a charm against bad dates. It's her bestseller.",
    ],
    gallery: [
      { caption: "Her stall", art: mood.nightMarket },
      { caption: "Lantern sale", art: mood.goldBokeh },
    ],
  },
  {
    slug: "ao",
    name: "Ao",
    title: "Snow spirit of Kiri Pass",
    summary: "A small, very old spirit who guides travelers through Kiri Pass and claims to have no idea how old they are.",
    art: ao,
    color: "#5b8fc9",
    quote: "Walk where I walk. The snow listens to me.",
    stats: [{ label: "Speed", value: 74 }, { label: "Strength", value: 40 }, { label: "Magic", value: 90 }, { label: "Charm", value: 62 }],
    fields: [
      { label: "Pronouns", value: "they / them" },
      { label: "Species", value: "Snow spirit" },
      { label: "Age", value: "Unknown (old)" },
      { label: "Home", value: "Kiri Pass" },
      { label: "Occupation", value: "Wandering guide" },
      { label: "Affiliation", value: "None" },
      { label: "Element", value: "Ice" },
      { label: "Status", value: "Active" },
    ],
    tags: ["spirit", "ice", "guide", "kiri-pass"],
    home: "kiri-pass",
    sections: [
      { id: "appearance", title: "Appearance", paragraphs: [
        "Pale blue hair in a high ponytail with snowball ties, pointed ears, and an oversized white haori printed with blue leaves. They carry two thin ice blades tucked in the sleeves.",
      ] },
      { id: "personality", title: "Personality", paragraphs: [
        "Calm, teasing, and impossible to surprise. Ao speaks in short sentences and enjoys watching people slip on ice a little more than they should.",
      ] },
      { id: "history", title: "History", paragraphs: [
        "Older records at Starwell mention “the blue guide” centuries before the Routes were mapped. Ao says that was probably someone else. It wasn't.",
      ] },
      { id: "abilities", title: "Abilities", paragraphs: [
        "Ao can calm a snowstorm for as long as they keep walking and can find any path buried under snow.",
      ] },
    ],
    relations: [
      { slug: "pip", bond: "Travel buddy", note: "Met during the Long Dark." },
      { slug: "fuji", bond: "Amused", note: "Likes to appear right behind him." },
    ],
    trivia: [
      "Ao doesn't leave footprints unless they want to.",
      "Their favorite food is anything Pip brings.",
    ],
    gallery: [
      { caption: "The pass under aurora", art: mood.aurora },
    ],
  },
  {
    slug: "suisen",
    name: "Suisen",
    title: "Star mechanic",
    summary: "A construct who keeps the Starwell Observatory running and repairs anything that glows, ticks, or hums.",
    art: suisen,
    color: "#2fc9b4",
    quote: "It isn't broken. It's waiting for me.",
    stats: [{ label: "Speed", value: 38 }, { label: "Strength", value: 70 }, { label: "Magic", value: 30 }, { label: "Charm", value: 46 }],
    fields: [
      { label: "Pronouns", value: "it / she" },
      { label: "Species", value: "Construct" },
      { label: "Age", value: "Activated 3 years ago" },
      { label: "Home", value: "Starwell Observatory" },
      { label: "Occupation", value: "Star mechanic" },
      { label: "Affiliation", value: "Starwell Keepers" },
      { label: "Element", value: "Tech" },
      { label: "Status", value: "Active" },
    ],
    tags: ["construct", "tech", "mechanic", "starwell"],
    home: "starwell",
    sections: [
      { id: "appearance", title: "Appearance", paragraphs: [
        "Short green hair, a single horn-shaped antenna, and two large shield wings lined with teal light. Its oversized boots clank on every step.",
      ] },
      { id: "personality", title: "Personality", paragraphs: [
        "Quiet, literal, and deeply curious. Suisen asks a lot of questions and writes the answers down in a notebook it never lets anyone read.",
      ] },
      { id: "history", title: "History", paragraphs: [
        "The Starwell Keepers found Suisen in pieces beneath the observatory's main lens. When they put it back together, the lens started working again.",
      ] },
      { id: "abilities", title: "Abilities", paragraphs: [
        "Suisen can feel how a machine wants to work and repair it by touch. Its wings fold into a shield large enough for two.",
      ] },
    ],
    relations: [
      { slug: "pip", bond: "Client", note: "Keeps her lantern running." },
      { slug: "ceefore", bond: "Rival", note: "Thinks charms are just slow engineering." },
    ],
    trivia: [
      "Has named every star in the observatory's catalog.",
      "Doesn't sleep, but likes being told goodnight.",
    ],
    gallery: [
      { caption: "Starwell sky", art: mood.milkyWay },
      { caption: "The main lens", art: mood.galaxy },
    ],
  },
];

export const wikiPlaces: WikiPlace[] = [
  {
    slug: "hollowmere",
    name: "Hollowmere",
    kind: "Market town",
    region: "Lower Routes",
    summary: "The largest festival town on the Routes, famous for its night market and the Wishmail Post.",
    art: mood.nightMarket,
    paragraphs: [
      "Hollowmere sits in a bowl-shaped valley where every road on the Routes meets. The town sleeps through the day and opens at dusk, when thousands of lanterns light the market streets.",
      "The Wishmail Post is here, along with Ceefore's charm stall and about forty places that claim to sell the best dumplings.",
    ],
    residents: ["pip", "ceefore"],
  },
  {
    slug: "gate-road",
    name: "The Gate Road",
    kind: "Night road",
    region: "Middle Routes",
    summary: "A stone road that only opens after dark, guarded by the Lantern Watch.",
    art: mood.lanternBg,
    paragraphs: [
      "The Gate Road connects Hollowmere to the mountain towns. Its stones shift at sunset to open the way, and only travelers carrying a lit lantern can pass.",
      "The Lantern Watch keeps a gatehouse at the halfway point, where Fuji spends most nights.",
    ],
    residents: ["fuji"],
  },
  {
    slug: "kiri-pass",
    name: "Kiri Pass",
    kind: "Mountain pass",
    region: "Upper Routes",
    summary: "A snowbound pass under the aurora. Travelers who don't ask for a guide tend to get lost.",
    art: mood.aurora,
    paragraphs: [
      "Kiri Pass is covered in snow all year. On clear nights the aurora lights the whole valley green and violet.",
      "Locals leave small offerings at the trailhead for Ao, who decides whether the pass is open that night.",
    ],
    residents: ["ao"],
  },
  {
    slug: "starwell",
    name: "Starwell Observatory",
    kind: "Observatory",
    region: "Upper Routes",
    summary: "An old observatory above the clouds that tracks the stars the night roads follow.",
    art: mood.milkyWay,
    paragraphs: [
      "Starwell's lens maps which roads will open each night. Without it, couriers would be guessing.",
      "The Starwell Keepers are a small order of scholars. Suisen does most of the actual work.",
    ],
    residents: ["suisen"],
  },
];

export const wikiTimeline: WikiEvent[] = [
  { year: "Year 0", era: "Founding", title: "The first lantern", text: "Hollowmere lights the first festival lantern and the Gate Road opens for the first time.", characters: [], place: "hollowmere" },
  { year: "Year 112", era: "Founding", title: "Starwell is built", text: "Scholars build the observatory to track which night roads will open.", characters: [], place: "starwell" },
  { year: "Year 340", era: "The Long Dark", title: "The lanterns go out", text: "A winter storm puts out every lantern on the Routes for forty nights.", characters: ["ao"], place: "kiri-pass" },
  { year: "Year 341", era: "The Long Dark", title: "The last lantern", text: "Pip carries the last lit lantern from Hollowmere to Kiri Pass and meets Ao on the way.", characters: ["pip", "ao"], place: "kiri-pass" },
  { year: "Year 346", era: "Present day", title: "The bridge holds", text: "Fuji holds up the flooded Gate Road bridge and joins the Lantern Watch.", characters: ["fuji"], place: "gate-road" },
  { year: "Year 348", era: "Present day", title: "A stall opens", text: "Ceefore opens her charm stall in the Hollowmere night market.", characters: ["ceefore"], place: "hollowmere" },
  { year: "Year 349", era: "Present day", title: "Suisen wakes", text: "The Keepers rebuild Suisen and the Starwell lens starts working again.", characters: ["suisen"], place: "starwell" },
];

/** "Did you know…" hooks for the encyclopedia main page. */
export const wikiDidYouKnow: { slug: string; text: string }[] = [
  { slug: "pip", text: "has never once delivered a wish late" },
  { slug: "fuji", text: "keeps a jar of luck charms behind the gatehouse door" },
  { slug: "ceefore", text: "sells a charm against bad dates, and it is her bestseller" },
  { slug: "suisen", text: "has named every star in the Starwell catalog" },
];

export const wikiRecentEdits: WikiEdit[] = [
  { page: "Pip", slug: "pip", kind: "character", change: "Added trivia", when: "2 hours ago" },
  { page: "Kiri Pass", slug: "kiri-pass", kind: "place", change: "New photo", when: "Yesterday" },
  { page: "Suisen", slug: "suisen", kind: "character", change: "Updated history", when: "3 days ago" },
  { page: "Timeline", slug: "timeline", kind: "timeline", change: "Added Year 349", when: "Last week" },
];

export const wikiTemplates: WikiTemplate[] = [
  {
    slug: "lantern-archive",
    name: "Lantern Archive",
    useCase: "Character wiki",
    vibe: "Encyclopedia · classic wiki",
    summary: "Looks like a real wiki: page tabs, a sidebar, infobox tables, a numbered table of contents, category pages, and blue links everywhere.",
    layout: "encyclopedia",
    palette: {
      backdrop: "#f6f6f6",
      page: "#ffffff",
      panel: "#f8f9fa",
      ink: "#202122",
      soft: "#54595d",
      accent: "#3366cc",
      accentSoft: "#eaf3ff",
      line: "#a2a9b1",
      head: "#f6f6f6",
      headInk: "#202122",
    },
    banner: mood.lanterns,
  },
  {
    slug: "starlit-codex",
    name: "Starlit Codex",
    useCase: "Worldbuilding wiki",
    vibe: "Night sky · game codex",
    summary: "A dark, game-style character database: a character select screen, split-screen profiles with stat bars and tabs, and a glowing timeline.",
    layout: "codex",
    palette: {
      backdrop: "#0b0f1f",
      page: "#121832",
      panel: "#1a2244",
      ink: "#e7ecff",
      soft: "#97a2cc",
      accent: "#5ee0c8",
      accentSoft: "#1f3a4d",
      line: "#2a3561",
      head: "#0e1329",
      headInk: "#e7ecff",
    },
    banner: mood.galaxy,
  },
  {
    slug: "petal-index",
    name: "Petal Index",
    useCase: "OC directory",
    vibe: "Pastel · scrapbook",
    summary: "A pastel scrapbook for your OCs: taped polaroids, sticker tags, sticky-note sections, postcard places, and a diary timeline.",
    layout: "scrapbook",
    palette: {
      backdrop: "#efe8f6",
      page: "#ffffff",
      panel: "#f8f3fd",
      ink: "#43385a",
      soft: "#8e82a8",
      accent: "#a07fd4",
      accentSoft: "#ece3f8",
      line: "#e6dcf2",
      head: "#c9b6ea",
      headInk: "#2f2545",
    },
    banner: mood.sakura,
  },
];

export function findWikiTemplate(slug: string) {
  return wikiTemplates.find((template) => template.slug === slug);
}

export function findWikiCharacter(slug: string) {
  return wikiCharacters.find((character) => character.slug === slug);
}

export function findWikiPlace(slug: string) {
  return wikiPlaces.find((place) => place.slug === slug);
}

/** Every tag used by a character, most common first. */
export function wikiTags() {
  const counts = new Map<string, number>();
  for (const character of wikiCharacters) for (const tag of character.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag, count]) => ({ tag, count }));
}

export type WikiSearchResult = { kind: "character" | "place"; slug: string; name: string; detail: string };

/** Search names, titles, summaries, and tags. */
export function searchWiki(query: string): WikiSearchResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const matches = (...values: string[]) => values.some((value) => value.toLowerCase().includes(needle));
  return [
    ...wikiCharacters.filter((c) => matches(c.name, c.title, c.summary, ...c.tags)).map((c) => ({ kind: "character" as const, slug: c.slug, name: c.name, detail: c.title })),
    ...wikiPlaces.filter((p) => matches(p.name, p.kind, p.summary)).map((p) => ({ kind: "place" as const, slug: p.slug, name: p.name, detail: p.kind })),
  ];
}
