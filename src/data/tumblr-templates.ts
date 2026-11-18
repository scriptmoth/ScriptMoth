import { assets, type Artwork } from "@/lib/assets";

export type TumblrLayout = "sidebar" | "grid";
export type TumblrFont = "serif" | "soft";

export interface TumblrPalette {
  backdrop: string;
  surface: string;
  ink: string;
  soft: string;
  accent: string;
  panel: string;
  chip: string;
  glow: string;
}

export type TumblrPost =
  | { kind: "photo"; title: string; caption: string; art: Artwork; tags: string[] }
  | { kind: "text"; title: string; body: string; tags: string[] }
  | { kind: "quote"; quote: string; source: string; tags: string[] };

export interface TumblrLink {
  label: string;
  detail?: string;
}

export interface TumblrTemplate {
  slug: string;
  name: string;
  useCase: string;
  vibe: string;
  summary: string;
  layout: TumblrLayout;
  font: TumblrFont;
  palette: TumblrPalette;
  blog: {
    title: string;
    handle: string;
    tagline: string;
    status: string;
    avatar: Artwork;
    header?: Artwork;
  };
  about: string;
  links: TumblrLink[];
  posts: TumblrPost[];
}

const { velvet, garden } = assets.tumblr;

export const tumblrTemplates: TumblrTemplate[] = [
  {
    slug: "velvet-midnight",
    name: "Velvet Midnight",
    useCase: "Artist Tumblr theme",
    vibe: "Night sky · velvet archive",
    summary: "A classic Tumblr sidebar theme for an art blog: starfield backdrop, velvet panels, and a stream of photo and text posts.",
    layout: "sidebar",
    font: "serif",
    palette: {
      backdrop: `linear-gradient(180deg, rgba(8,10,28,0.88), rgba(18,12,36,0.92)), url(${velvet.bg.src}) center/cover`,
      surface: "linear-gradient(165deg, #1a1434ee, #120c28f2)",
      ink: "#f7f0e8",
      soft: "#c9bfd8",
      accent: "#e8c48a",
      panel: "linear-gradient(150deg, #2a1c48cc, #16102ccc)",
      chip: "#3a2858",
      glow: "#9a7cff",
    },
    blog: {
      title: "velvet archive",
      handle: "@velvetarchive",
      tagline: "sketches after midnight · soft sci-fi · moth notes",
      status: "queue running",
      avatar: velvet.avatar,
      header: velvet.header,
    },
    about: "A demo Tumblr theme for artists who want a dark, curated blog: sidebar bio, custom links, and a post stream that still feels like classic Tumblr.",
    links: [
      { label: "Commission sheet", detail: "rates · terms" },
      { label: "Portfolio", detail: "selected works" },
      { label: "Ask box", detail: "worldbuilding welcome" },
      { label: "Archive", detail: "by month" },
    ],
    posts: [
      {
        kind: "photo",
        title: "summit light",
        caption: "reference study from a cold morning hike. charcoal under pastel.",
        art: velvet.posts[0],
        tags: ["art", "landscape", "wip"],
      },
      {
        kind: "quote",
        quote: "keep the soft parts soft. let the sky do the loud work.",
        source: "studio note · 02:14",
        tags: ["notes"],
      },
      {
        kind: "photo",
        title: "ridge line",
        caption: "value study. trying to keep the fog quiet.",
        art: velvet.posts[1],
        tags: ["study", "mountains"],
      },
      {
        kind: "text",
        title: "queue thoughts",
        body: "this theme ships with a sidebar bio, pinned links, and photo / text / quote posts. swap the images, keep the velvet frame.",
        tags: ["theme", "demo"],
      },
      {
        kind: "photo",
        title: "constellation scrap",
        caption: "night sky collage for a character playlist cover.",
        art: velvet.posts[2],
        tags: ["stars", "mood"],
      },
      {
        kind: "photo",
        title: "orbit",
        caption: "earthlight study — for a soft sci-fi OC page.",
        art: velvet.posts[3],
        tags: ["space", "ref"],
      },
    ],
  },
  {
    slug: "meadow-scrapbook",
    name: "Meadow Scrapbook",
    useCase: "Lifestyle Tumblr theme",
    vibe: "Botanical · scrapbook grid",
    summary: "A bright grid Tumblr theme for photo dumps and soft journaling: meadow header, scrapbook cards, and airy tags.",
    layout: "grid",
    font: "soft",
    palette: {
      backdrop: `linear-gradient(180deg, rgba(244,248,236,0.92), rgba(232,240,220,0.94)), url(${garden.bg.src}) center/cover`,
      surface: "#fffdf8",
      ink: "#2a3424",
      soft: "#5f6d52",
      accent: "#c45c6a",
      panel: "#f3efe4",
      chip: "#e6efd8",
      glow: "#8fb37a",
    },
    blog: {
      title: "meadow scrapbook",
      handle: "@meadowscrap",
      tagline: "petals · polaroids · little essays",
      status: "posting weekly",
      avatar: garden.avatar,
      header: garden.header,
    },
    about: "A demo Tumblr theme built for soft photo grids and short journal posts. Think scrapbook margins, pressed flowers, and an easy archive.",
    links: [
      { label: "About", detail: "who keeps this garden" },
      { label: "Photo dump", detail: "recent rolls" },
      { label: "Reading list", detail: "slow books" },
      { label: "Contact", detail: "collabs & prints" },
    ],
    posts: [
      {
        kind: "photo",
        title: "morning petals",
        caption: "the fence line finally bloomed. keeping this one unedited.",
        art: garden.posts[0],
        tags: ["flowers", "spring"],
      },
      {
        kind: "photo",
        title: "window light",
        caption: "houseplant hour. soil under the nails, tea going cold.",
        art: garden.posts[1],
        tags: ["home", "plants"],
      },
      {
        kind: "text",
        title: "small notes from the porch",
        body: "themes like this are for people who post in batches: a few photos, a short letter, tags that feel like stickers.",
        tags: ["journal"],
      },
      {
        kind: "photo",
        title: "garden path",
        caption: "late light through the hedges.",
        art: garden.posts[2],
        tags: ["walk", "green"],
      },
      {
        kind: "quote",
        quote: "collect the soft days. press them flat. leave room for the next bloom.",
        source: "scrapbook margin",
        tags: ["notes"],
      },
      {
        kind: "photo",
        title: "field study",
        caption: "wild color after rain.",
        art: garden.posts[3],
        tags: ["field", "color"],
      },
    ],
  },
];

export function findTumblrTemplate(slug: string) {
  return tumblrTemplates.find((template) => template.slug === slug);
}
