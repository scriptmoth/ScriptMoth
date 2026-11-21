import { assets, type Artwork } from "@/lib/assets";
import { showcaseArt } from "../showcase-art";
import { portfolioArtwork } from "../portfolio-art";

export type TumblrLayout = "sidebar" | "grid";

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
  | { kind: "photo"; title: string; caption: string; art: Artwork; alt: string; tags: string[] }
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
  palette: TumblrPalette;
  blog: {
    title: string;
    handle: string;
    tagline: string;
    status: string;
    avatar: Artwork;
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
    vibe: "Gothic archive · burgundy and brass",
    summary: "A gothic art journal with a portrait rail, framed fragments, and a searchable single-column archive.",
    layout: "sidebar",
    palette: {
      backdrop: "radial-gradient(ellipse at 88% 6%, #3b0c17, transparent 50%), #10090c",
      surface: "#24141a",
      ink: "#f3dfb9",
      soft: "#d0bba5",
      accent: "#dfba6d",
      panel: "#391720",
      chip: "#3a2228",
      glow: "#0e0609",
    },
    blog: {
      title: "velvet archive",
      handle: "@velvetarchive",
      tagline: "sketches after midnight · soft sci-fi · moth notes",
      status: "queue running",
      avatar: velvet.avatar,
    },
    about: "Somewhere between an art journal and a cabinet of curiosities. I keep landscape studies, character sketches, and scraps of stories here, usually after midnight.",
    links: [
      { label: "Commission sheet", detail: "rates · terms" },
      { label: "Portfolio", detail: "selected works" },
      { label: "Ask box", detail: "worldbuilding welcome" },
      { label: "Archive", detail: "by month" },
    ],
    posts: [
      {
        kind: "photo",
        title: "moonlight in saint-cloud",
        caption: "An etching for the moonlit end of the archive. Edvard Munch, 1895.",
        art: portfolioArtwork["velvet-midnight"],
        alt: "A pale moon reflected in dark water beneath the trees",
        tags: ["art", "moonlight"],
      },
      {
        kind: "photo",
        title: "summit light",
        caption: "reference study from a cold morning hike. charcoal under pastel.",
        art: velvet.posts[0],
        alt: "A road winding through rust-colored mountains",
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
        alt: "A forested valley beneath a line of snow-covered peaks",
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
        alt: "A bright streak crossing a violet night sky",
        tags: ["stars", "mood"],
      },
      {
        kind: "photo",
        title: "orbit",
        caption: "earthlight study — for a soft sci-fi OC page.",
        art: velvet.posts[3],
        alt: "White cloud cover over the blue Earth",
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
    palette: {
      backdrop: `linear-gradient(180deg, rgba(244,248,236,0.92), rgba(232,240,220,0.94)), url(${garden.bg.src}) center/cover`,
      surface: "#fffdf8",
      ink: "#2a3424",
      soft: "#5f6d52",
      accent: "#a13f58",
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
    },
    about: "A little record of what grows here. I keep photos from walks, pressed petals, and the occasional letter from the porch.",
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
        art: { src: "/assets/tumblr/garden-petals.webp", width: 720, height: 654 },
        alt: "A colorful field of red, white, and yellow pixel-art tulips",
        tags: ["flowers", "spring"],
      },
      {
        kind: "photo",
        title: "window light",
        caption: "houseplant hour. soil under the nails, tea going cold.",
        art: { src: showcaseArt.gardenRoom, width: 461, height: 820 },
        alt: "Afternoon sunlight beyond a garden window",
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
        art: { src: "/assets/tumblr/garden-path.webp", width: 640, height: 480 },
        alt: "A path winding through a mossy green woodland",
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
        alt: "Rows of purple lavender lit by a golden sunset",
        tags: ["field", "color"],
      },
    ],
  },
];

export function findTumblrTemplate(slug: string) {
  return tumblrTemplates.find((template) => template.slug === slug);
}
