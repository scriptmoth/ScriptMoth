/**
 * Discord Embed Style Library — embed designs shown on /portfolio/discord-embeds.
 *
 * Each design has a permanent code: E, two digits for the family, a letter for the design (E03A).
 * Codes are references in quotes and inquiries, so never renumber or reuse one. Retire a design
 * by leaving its code out, and add new ones at the end of a family (E03K, E03L, …).
 *
 * Families group designs by look, not purpose. Every design is a set of formatting templates, and
 * `composeEmbeds` pours any purpose (rules, welcome, FAQ, …) through it, so a visitor can switch
 * the content without losing the style. Output follows Discord's webhook embed format and limits.
 *
 * The art in `images` is example art for previews only. It is not licensed to clients, so copied
 * JSON always uses placeholder image links and clients provide their own art.
 *
 * Keep this file dependency-free so Node can import it directly.
 */

/* ───────────────────────────── Types ───────────────────────────── */

/** How the content is arranged inside the message. */
export type EmbedLayout =
  | "stack"  // one description: intro, items, closing
  | "fields" // items as full-width fields
  | "grid"   // items as inline fields, side by side
  | "frame"  // items inside a border drawn with box characters
  | "tree"   // items hang off a connected branch
  | "quote"  // items as block quotes
  | "code"   // everything in a monospace code block
  | "list"   // a tight bullet or numbered list
  | "cards"; // one embed per item, stacked into a set

export type FontStyle =
  | "plain" | "smallcaps" | "bold-serif" | "italic-serif" | "bold-italic" | "script" | "fraktur"
  | "double" | "sans-bold" | "mono" | "fullwidth" | "spaced" | "snake" | "lower";

export type Numbering =
  | "01" | "001" | "1" | "I" | "i" | "A" | "①" | "❶" | "keycap" | "sub" | "FIRST" | "fm" | "dots" | "bars" | "A1" | "none";

/** Where the heading goes: the embed title, or a markdown header at the top of the description. */
export type HeadingMode = "title" | "h1" | "h2" | "h3";

/** Decoration level: the same design, from text-only to fully illustrated. */
export type EmbedLook = "simple" | "decorated" | "elaborate";

export type PatternName = "dots" | "diamonds" | "leaves" | "stars" | "stripes" | "scanlines" | "none" | "checker" | "paper" | "lace" | "grid" | "waves";

/** Paths under /public for each art slot. `scripts/draw-discord-embed-art.mjs` draws them; hand-painted files replace them. */
export type EmbedImages = { banner?: string; thumbnail?: string; strip?: string };

export type EmbedStyle = {
  id: string;
  family: string;
  name: string;
  /** Sidebar color, #RRGGBB. */
  color: string;
  layout: EmbedLayout;
  /** Main motif, used for generated thumbnails, footer icons, and banners. */
  mark: string;
  /** Item icons, cycled through the items. */
  icons: string[];
  /** Title template. {T} upper-cased title, {t} title, both in the design's font. Empty: no title. */
  head: string;
  heading: HeadingMode;
  /** Opening template. {x} the purpose's intro, {p}/{P} purpose title. */
  intro: string;
  /** Item template. First line becomes a field name in field layouts. {n} number, {i} icon, {t} title, {u} upper title, {ft} title in the font, {b} body. */
  item: string;
  /** Closing template. {x} the purpose's closing line. */
  outro: string;
  /** Divider line between sections. Empty: a blank line. */
  divider: string;
  /** Optional label printed above the items. */
  label?: string;
  font: FontStyle;
  numbering: Numbering;
  frame?: [top: string, prefix: string, bottom: string];
  tree?: [open: string, branch: string, stem: string, last: string];
  /** Code block language for the code layout. */
  lang?: string;
  /** Per-embed colors for card layouts. */
  palette?: string[];
  footer: string;
  pattern: PatternName;
  images?: EmbedImages;
  /** How the message is put together: where the art goes and how many embeds it uses. */
  recipe: EmbedRecipe;
  /** How many of the purpose's items this design shows. */
  itemCount: number;
  /** How the buttons look. */
  buttons: ButtonKind;
  /** Button label template. {l} the label. */
  buttonLabel: string;
  tags: string[];
};

/**
 * Message recipes. Each arranges the same content differently, so designs don't share one shape:
 * hero (banner embed on top), poster (big image inside), sticker (thumbnail + author, no footer),
 * chapters (header card, banner between, body), ribbon (art strip under the text), masthead (banner
 * inside a header card), signature (author line as a label), attachment (banner posted as a plain image),
 * split (items in two embeds with a strip between), closing (banner after the text).
 */
export const embedRecipes = ["hero", "poster", "sticker", "chapters", "ribbon", "masthead", "signature", "attachment", "split", "closing"] as const;
export type EmbedRecipe = typeof embedRecipes[number];

/** Button treatments: blurple, gray, green call to action, link buttons, a dropdown menu, or emoji-led gray buttons. */
export const buttonKinds = ["solid", "soft", "success", "links", "menu", "emoji"] as const;
export type ButtonKind = typeof buttonKinds[number];

const buttonLabels = ["{l}", "✦ {l}", "{l} ♡", "〔 {l} 〕", "{L}", "˚₊ {l} ₊˚"];
const itemCounts = [3, 4, 5, 6, 4, 3, 5, 6, 3, 4];

export type EmbedFamily = {
  number: string;
  title: string;
  blurb: string;
  styles: EmbedStyle[];
};

export type ButtonStyle = "primary" | "secondary" | "success" | "danger" | "link";
export type EmbedButton = { label: string; emoji?: string; style: ButtonStyle };
export type EmbedReaction = { emoji: string; count: number };

export type EmbedPurpose = {
  id: string;
  label: string;
  title: string;
  intro: string;
  items: { title: string; body: string }[];
  outro: string;
  buttons: EmbedButton[];
  reactions: EmbedReaction[];
};

/** Discord's webhook embed shape (the parts we use). */
export type DiscordEmbed = {
  title?: string;
  description?: string;
  color: number;
  author?: { name: string; icon_url?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  thumbnail?: { url: string };
  image?: { url: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
};

/** Image slots the preview fills with art. URLs in the payload point at these. */
export type ArtSlot = "banner" | "thumbnail" | "strip" | "icon";

export type EmbedMenu = { placeholder: string; options: { label: string; emoji?: string }[] };

export type ComposedMessage = {
  embeds: DiscordEmbed[];
  buttons: EmbedButton[];
  /** A dropdown in place of buttons, for designs that use one. */
  menu?: EmbedMenu;
  /** Images posted above the embeds as plain attachments. */
  attachments: ArtSlot[];
  reactions: EmbedReaction[];
  /** Which image slot each embed's image/thumbnail/icon is, so previews can draw them. */
  art: { embed: number; slot: ArtSlot }[];
};

/* ─────────────────────────── Purposes ─────────────────────────── */

export const SERVER_NAME = "Moth Café";

export const embedPurposes: EmbedPurpose[] = [
  {
    id: "rules", label: "Rules", title: "Server Rules",
    intro: "Please read these before you start chatting.",
    items: [
      { title: "Be kind", body: "Treat everyone with respect." },
      { title: "Stay on topic", body: "Keep things in their proper channels." },
      { title: "Listen to staff", body: "@Moderators have the final say." },
      { title: "No spam", body: "Keep messages, pings, and emoji to a sensible amount." },
      { title: "Keep it SFW", body: "No NSFW content in any channel." },
      { title: "English in main chats", body: "Other languages have their own channels." },
    ],
    outro: "Thank you for being here",
    buttons: [{ label: "I’ve read the rules", emoji: "✅", style: "success" }, { label: "Report a problem", style: "secondary" }],
    reactions: [{ emoji: "✅", count: 225 }],
  },
  {
    id: "welcome", label: "Welcome", title: "Welcome",
    intro: "Browse #bot-features, then run `/moth try` in #try-the-bot to see a bot in action.",
    items: [
      { title: "Explore the catalogue", body: "Pick a category and open a feature to see how it works." },
      { title: "Try a demo", body: "Use fictional names and sample content when you test commands." },
      { title: "Request a custom bot", body: "See packages and send a project inquiry from #commissions." },
      { title: "Read the rules and choose roles", body: "Read #rules before posting. Use #roles to choose a name color or notifications." },
      { title: "Chat and share art", body: "Say hello in #general or post your art in #share-your-work." },
    ],
    outro: "Make yourself at home",
    buttons: [{ label: "Get roles", emoji: "🎨", style: "primary" }, { label: "Server guide", style: "secondary" }],
    reactions: [{ emoji: "👋", count: 48 }, { emoji: "💖", count: 19 }],
  },
  {
    id: "info", label: "Server guide", title: "Where to find things",
    intro: "Find the server’s event times, links, and staff contacts.",
    items: [
      { title: "About us", body: "A cozy space for artists and friends." },
      { title: "Server time", body: "Events run on Eastern Time." },
      { title: "Links", body: "Website, shop, and socials in #links." },
      { title: "Staff", body: "@Moderators keep things running smoothly." },
      { title: "Partners", body: "Partnership requests go to #partners." },
      { title: "Levels", body: "Chat to earn levels and unlock perks." },
    ],
    outro: "Questions? Ask a moderator",
    buttons: [{ label: "Website", style: "link" }],
    reactions: [],
  },
  {
    id: "announcement", label: "Announcement", title: "Announcement",
    intro: "Big news for everyone!",
    items: [
      { title: "What’s new", body: "The art gallery channel is now open." },
      { title: "When", body: "Starting this Friday." },
      { title: "How to join", body: "Share up to three pieces a week." },
      { title: "Rules", body: "Normal server rules still apply." },
      { title: "Prizes", body: "The top three get a special role." },
      { title: "Feedback", body: "Tell us what you think in #suggestions." },
    ],
    outro: "Ping a moderator with questions",
    buttons: [{ label: "Notify me", emoji: "🔔", style: "primary" }],
    reactions: [{ emoji: "🎉", count: 87 }, { emoji: "❤️", count: 32 }],
  },
  {
    id: "roles", label: "Role selection", title: "Choose Your Roles",
    intro: "Click a button below to add or remove a role.",
    items: [
      { title: "Colors", body: "Pick a name color you love." },
      { title: "Pings", body: "Choose which announcements reach you." },
      { title: "Pronouns", body: "Let others know how to refer to you." },
      { title: "Interests", body: "Art, gaming, music, and more." },
      { title: "Age", body: "Choose an age range role." },
      { title: "Region", body: "Find people in your time zone." },
    ],
    outro: "Change them any time",
    buttons: [{ label: "Colors", emoji: "🎨", style: "secondary" }, { label: "Pings", emoji: "🔔", style: "secondary" }, { label: "Pronouns", emoji: "💬", style: "secondary" }],
    reactions: [],
  },
  {
    id: "faq", label: "FAQ", title: "Demos, commissions, and support",
    intro: "Try commands with moth.exe in #try-the-bot. Start with `/moth try`.",
    items: [
      { title: "Where can I see more demos?", body: "Open #bot-features and choose a category, or run `/moth features`." },
      { title: "How much will my bot cost?", body: "See starting prices in #commissions. Your written quote confirms the total and the scope." },
      { title: "How do I report a bug?", body: "Run `/feedback send` with the command and what happened. Keep the ID for `/feedback status`." },
      { title: "How do I earn chat XP?", body: "Run `/rank opt-in`, then check your progress with `/rank profile`." },
    ],
    outro: "Report conduct concerns to a moderator privately.",
    buttons: [],
    reactions: [],
  },
  {
    id: "quote", label: "Project estimate", title: "Your bot estimate",
    intro: "**$135 USD estimated development total.** [Submit a project inquiry](https://scriptmoth.com/contact?type=discord-bot) to get a written quote.",
    items: [
      { title: "Simple Utility Bot · $115", body: "One supported main module, branded bot messages, and up to three basic slash commands." },
      { title: "One extra slash command · $20", body: "Add one simple command, such as `/links`, beyond the package allowance." },
      { title: "Next steps", body: "Review scope, currency, payment dates, and any recurring costs in your written quote. Work starts after you accept and meet its start conditions." },
    ],
    outro: "Example estimate in USD. Hosting and third-party costs depend on the written quote.",
    buttons: [],
    reactions: [],
  },
  {
    id: "events", label: "Events", title: "Upcoming Events",
    intro: "Join us this week. Everyone is welcome!",
    items: [
      { title: "Art Jam", body: "Saturday · 3 PM" },
      { title: "Movie Night", body: "Sunday · 8 PM" },
      { title: "Game Night", body: "Wednesday · 7 PM" },
      { title: "Karaoke", body: "Friday · 9 PM" },
      { title: "Trivia", body: "Thursday · 6 PM" },
      { title: "Book Club", body: "Monday · 5 PM" },
    ],
    outro: "See you there",
    buttons: [{ label: "Interested", emoji: "⭐", style: "primary" }, { label: "Calendar", style: "link" }],
    reactions: [{ emoji: "⭐", count: 41 }],
  },
  {
    id: "tickets", label: "Tickets", title: "Open a support ticket",
    intro: "Select **Open a ticket**, choose a topic, and tell staff what you need help with.",
    items: [
      { title: "Report a problem", body: "Tell staff what happened. Add a message link if it helps them find it." },
      { title: "Ask a server question", body: "Include the channel, role, or feature you need help with." },
      { title: "Appeal a decision", body: "Identify the action you want staff to review." },
      { title: "Partnership", body: "Ask about partnering with us." },
      { title: "Purchase", body: "Questions about shop orders." },
      { title: "Other", body: "Anything that doesn’t fit above." },
    ],
    outro: "Tickets are private to you and staff",
    buttons: [{ label: "Open a ticket", emoji: "🎫", style: "success" }],
    reactions: [],
  },
  {
    id: "boost", label: "Boost thanks", title: "Thank You for Boosting",
    intro: "@sharpnnyx just boosted the server!",
    items: [
      { title: "Your role", body: "You now have the @Booster role." },
      { title: "Perks", body: "Check out your perks in #perks." },
      { title: "Colors", body: "Pick an exclusive name color in #roles." },
      { title: "Booster chat", body: "You can now see #booster-lounge." },
      { title: "Emoji", body: "Suggest a new server emoji." },
      { title: "Thank-you art", body: "Get a doodle from our artists." },
    ],
    outro: "We appreciate you so much",
    buttons: [],
    reactions: [{ emoji: "💜", count: 12 }, { emoji: "🎉", count: 9 }],
  },
];

export const embedLooks: { id: EmbedLook; label: string; blurb: string }[] = [
  { id: "simple", label: "Simple", blurb: "Formatted text and a matching sidebar color." },
  { id: "decorated", label: "Decorated", blurb: "Adds the design’s main art pieces." },
  { id: "elaborate", label: "Elaborate", blurb: "The full art set, arranged the way this design arranges it." },
];

/* ─────────────────────────── Catalog ─────────────────────────── */

type Opts = Partial<Omit<EmbedStyle, "id" | "family" | "name" | "color" | "layout" | "mark" | "icons" | "tags">> & { tags?: string };
type Row = [letter: string, name: string, color: string, layout: EmbedLayout, mark: string, icons: string, opts: Opts];

const family = (number: string, title: string, blurb: string, pattern: PatternName, base: Opts, rows: Row[]): EmbedFamily => ({
  number, title, blurb,
  styles: rows.map(([letter, name, color, layout, mark, icons, opts]) => {
    const merged = { ...base, ...opts };
    return {
      id: `E${number}${letter}`, family: number, name, color, layout, mark, icons: icons.split(" "),
      head: merged.head ?? "{t}", heading: merged.heading ?? (["stack", "frame", "tree", "quote", "list"].includes(layout) ? "h2" : "title"), intro: merged.intro ?? "{x}", item: merged.item ?? "{n}. **{t}**\n{b}",
      outro: merged.outro ?? "{x}", divider: merged.divider ?? "", label: merged.label,
      font: merged.font ?? "plain", numbering: merged.numbering ?? "01",
      frame: merged.frame, tree: merged.tree, lang: merged.lang, palette: merged.palette,
      footer: merged.footer ?? "{s} · {p}", pattern: merged.pattern ?? pattern,
      images: { ...art(`E${number}${letter}`, "banner", "thumbnail", "strip"), ...merged.images },
      tags: [title.split(" & ")[0], ...(merged.tags ?? "").split(" ").filter(Boolean)],
      ...variety(number, letter, layout, merged),
    };
  }),
});

/**
 * Spreads recipes, item counts, and button treatments so that within a family every design has a
 * different recipe, and the same letter in another family lands on a different combination.
 */
function variety(number: string, letter: string, layout: EmbedLayout, opts: Opts) {
  const v = letter.charCodeAt(0) - 65, f = Number(number) - 1;
  let itemCount = opts.itemCount ?? itemCounts[(v * 7 + f) % itemCounts.length];
  if (layout === "grid") itemCount = itemCount <= 4 ? 3 : 6;
  return {
    recipe: opts.recipe ?? embedRecipes[(v + f * 3) % embedRecipes.length],
    itemCount,
    buttons: opts.buttons ?? buttonKinds[(v * 5 + f * 2) % buttonKinds.length],
    buttonLabel: opts.buttonLabel ?? buttonLabels[(v + f * 5) % buttonLabels.length],
  };
}

const art = (id: string, ...slots: (keyof EmbedImages)[]): EmbedImages =>
  Object.fromEntries(slots.map(slot => [slot, `/assets/discord/embeds/${id}-${slot === "strip" ? "footer" : slot}.webp`]));

export const embedFamilies: EmbedFamily[] = [
  family("01", "Cute & Kawaii", "Bows, hearts, sweets, and soft little decorations.", "dots", {}, [
    ["A", "Strawberry Ribbon", "#F3A5BB", "stack", "🍓", "🍰 🎀 💌", {
      head: "୨୧  🍓  {T}  ୨୧", intro: "꒰ ♡ ꒱  **{x}**", item: "୨{i}୧  {n}  **{t}**\n{b}",
      divider: "⋆｡˚ ♡ ˚｡⋆ ─────── ⋆｡˚ ♡ ˚｡⋆", outro: "꒰ 💌 ꒱  {x} ♡", tags: "pink sweet" }],
    ["B", "Candy Hearts", "#F7B2D9", "grid", "🍬", "🍭 🍬 🧁", {
      head: "♡₊˚ {t} ˚₊♡", intro: "♡ {x}", item: "{i} {t}\n{b}", divider: "‧₊˚ ♡ ˚₊‧", tags: "pink candy" }],
    ["C", "Dango Charm", "#E9A3B8", "tree", "🍡", "🍡 🍮 🍥", {
      head: "˚₊ 🍡 {T} ₊˚", tree: ["ε🍡з  ", "├ ", "┊ ", "╰ "], item: "{i}  **{t}**\n{b}", tags: "pink snacks" }],
    ["D", "Tiny Plushies", "#F1E3C8", "frame", "🧸", "🎀 🧸 🍪", {
      head: "꒰ 🧸 {t} ꒱", heading: "title", frame: ["╭──────── .✧˚✿˚✧. ────────╮", "  ", "╰──────── .✧˚✿˚✧. ────────╯"],
      intro: "*{x}* (^‿^)人(^‿^)", item: "{i} **{t}** ⁺\n↳ ˚ {b}", outro: "-# {x} ⋆˚✿˖°", tags: "cream plush" }],
    ["E", "Strawberry Milk", "#F6C1CC", "fields", "🥛", "🍓 🥛 🍰", {
      head: "꒰ 🍓 {T} ♡ ꒱", font: "smallcaps", item: "♡_ : {ft} . {i}\n{b}", divider: "♡ ‧₊˚ ♡", tags: "pink soft" }],
    ["F", "Pastel Sticker", "#B9D8F2", "stack", "🧃", "🧁 🎨 🧃", {
      head: "✿ 🧃 {T} ✿", item: "✦・{i}・**{t}**・♡\n{b}", divider: "✿ ・ ✧ ・ ✿ ・ ✧ ・ ✿", tags: "blue stickers" }],
    ["G", "Little Bunny", "#F2D0E4", "cards", "🐰", "🐰 🥕 🌷", {
      head: "૮꒰ ˶• ༝ •˶꒱ა  {t}", item: "꒰ {i} ꒱  {t}\n{b}", outro: "🐾 {x}", palette: ["#F2D0E4", "#F7E1B5", "#CDE7C9", "#F2D0E4"], tags: "bunny pastel" }],
    ["H", "Peach Parlor", "#FFB89A", "frame", "🍑", "🥐 🍰 🍓", {
      head: "˚₊ʚ 🍑 {t} ɞ₊˚", frame: ["╭・🍑・──────────・♡・╮", "┊ ", "╰・♡・──────────・🍑・╯"], item: "{i}  **{t}**\n{b}", tags: "peach cafe" }],
    ["I", "Bakery Labels", "#E7C08F", "grid", "🥐", "🥐 🧇 🥯", {
      head: "︰꒰₊˚⊹🥞﹕{T}", item: "︰꒰₊˚⊹{i}﹕{t}\n{b}", tags: "bakery warm" }],
    ["J", "Cutie Collage", "#FF9EC4", "stack", "🍒", "🍒 🧃 🍓", {
      head: "┊ : - 🎀 {T} !", numbering: "①", item: "・◡・ {n} ・ **{t}** ・{i}\n{b}", divider: "﹏﹏﹏﹏﹏﹏﹏﹏", tags: "pink collage" }],
  ]),
  family("02", "Elegant & Ornate", "Gilded frames, flourishes, crests, and formal invitations.", "diamonds", { numbering: "I" }, [
    ["A", "Gilded Invitation", "#C9A15D", "stack", "🗝️", "🕯️ 🗝️ 📜", {
      head: "❖  {T}  ❖", intro: "╔═══════ ❦ ═══════╗\n          **{P}**\n╚═══════ ❦ ═══════╝\n*{x}*",
      item: "{n}.  {i}  **{t}**\n-# {b}", outro: "❧  **FINIS**  ☙\n-# {x}", tags: "gold formal" }],
    ["B", "Pearl Salon", "#E8DCC8", "fields", "🦪", "◇ ❖ ♡", {
      head: "╭══ 🦪 {T} ══╮", font: "bold-serif", item: "〔{i}〕 {ft}\n{b}", divider: "◇ ─── ◇ ─── ◇", tags: "cream pearl" }],
    ["C", "Royal Decree", "#9B6FB0", "stack", "👑", "♕ ♜ ♝", {
      head: "♛ ❖ {T} ❖ ♛", intro: "-# BY ORDER OF THE COURT\n*{x}*", item: "{i}  **Article {n}** · {t}\n{b}",
      divider: "━━━━━━━ ♛ ━━━━━━━", tags: "royal purple" }],
    ["D", "Velvet Theatre", "#8E2D45", "cards", "🎭", "🎭 🥀 🕯️", {
      head: "༺ 🎭 {t} ༻", font: "script", item: "Act {n} · {t}\n*{b}*", palette: ["#8E2D45", "#A5394F", "#B5485D", "#8E2D45"], tags: "red theatre" }],
    ["E", "Lace Corners", "#E9C4CF", "quote", "🎀", "❀ ✿ ❦", {
      head: "❦༺ {t} ༻❦", font: "script", item: "༺{i}༻  **{t}**\n{b}", outro: "*{x}*", tags: "lace pink" }],
    ["F", "Stained Glass", "#6F8FC9", "grid", "🪟", "🌹 ☀️ 🦋", {
      head: "◇◆◇ {T} ◇◆◇", item: "◈ {i} {t}\n{b}", divider: "◇◆◇◆◇◆◇", tags: "blue glass" }],
    ["G", "Mirror Hall", "#BFC7D9", "frame", "🪞", "⟡ ✦ ✧", {
      head: "✧༺ 🪞 {t} ༻✧", font: "bold-serif", frame: ["✧༺ ───────────── ༻✧", "  ", "✧༺ ───────────── ༻✧"], item: "{i} **{t}**\n{b}", tags: "silver mirror" }],
    ["H", "Rococo Cameo", "#D8A7B1", "stack", "🦢", "🦢 🌸 🎀", {
      head: "𓆩 ♡ 𓆪  {t}  𓆩 ♡ 𓆪", font: "script", intro: "*{x}*", numbering: "i", item: "❧ {n}  **{t}**\n{b}",
      divider: "· · ─────── ·♡· ─────── · ·", tags: "rose swan" }],
    ["I", "Diamond Panels", "#A9C5D6", "fields", "💎", "💍 🪞 ✨", {
      head: "◇◆◇ 💎 {T} ◇◆◇", item: "◈〔{i}〕 {t}\n{b}", tags: "jewel blue" }],
    ["J", "Golden Filigree", "#D4AF37", "stack", "⚜️", "⚜️ ✦ ❖", {
      head: "✥ ╞══ {t} ══ • •", heading: "title", numbering: "sub", item: "**{n}** {t}. {b}", tags: "gold filigree" }],
  ]),
  family("03", "Cottagecore & Nature", "Gardens, honey, mushrooms, flowers, and seaside calm.", "leaves", {}, [
    ["A", "Honeycomb Cottage", "#A5B989", "tree", "🍯", "🌼 🍄 🐝", {
      head: "🍯  {T}", tree: ["╭┈┈ 🌿  ", "├  ", "│  ", "╰┈┈ 🐝  "], item: "{i}  {n}. **{t}**\n{b}", tags: "green honey" }],
    ["B", "Pressed Flowers", "#C4B5D8", "stack", "🌼", "🌼 🪻 🍀", {
      head: "❀ 🌱 {T} / VOL. I ❀", item: "⌁ {n} / {i}  **{t}**\n{b}", divider: "⌁ ⌁ ⌁ ⌁ ⌁", tags: "lilac flowers" }],
    ["C", "Mushroom Patch", "#C97B63", "grid", "🍄", "🍄 🌰 🐌", {
      head: "꒰ 🍄 {t} ꒱", item: "{i} {t}\n{b}", tags: "red forest" }],
    ["D", "Herb Garden", "#8DAA7E", "fields", "🌿", "🌿 🪴 🌱", {
      head: "ꕤ {T} ꕤ", item: "ꕤ {i} {t}\n{b}", divider: "ꕤ ─── ꕤ ─── ꕤ", tags: "green herbs" }],
    ["E", "Wildflower Meadow", "#E7B9C9", "quote", "🌷", "🌷 🪻 🦋", {
      head: "ʚ🦋ɞ {t}", item: "ʚ{i}ɞ  **{t}**\n{b}", tags: "pink meadow" }],
    ["F", "Seafoam Shore", "#8CCBC1", "stack", "🐚", "🐚 🫧 🐠", {
      head: "𓇼 {T} 𓇼", intro: "°｡ {x}", item: "﹏ {i}  **{t}**\n{b}", divider: "﹏﹏﹏ 🫧 ﹏﹏﹏", pattern: "waves", tags: "teal ocean" }],
    ["G", "Autumn Grove", "#C8642B", "cards", "🍂", "🍁 🌰 🥧", {
      head: "🍂 {T} 🍂", heading: "h2", numbering: "keycap", item: "## {n} {u} {i}\n{b}", divider: "——— · ˚✧ 🌰 ✧˚ · ———",
      palette: ["#C8642B"], tags: "orange autumn" }],
    ["H", "Woodland Spirits", "#7A9A6A", "cards", "🌲", "🍄 🌿 🦌", {
      head: "𖤣𖥧 {t} 𖥧𖤣", item: "{i} {t}\n{b}", palette: ["#5F7F52", "#7A9A6A", "#93B07F", "#5F7F52"], tags: "green forest" }],
    ["I", "Cherry Blossom", "#F4B6C2", "stack", "🌸", "⛩️ 🍵 🎐", {
      head: "【🌸】{t}", item: "「{i}」 **{t}**\n{b}", divider: "‧₊˚ 🌸 ˚₊‧ ─── ‧₊˚ 🌸 ˚₊‧", tags: "pink blossom" }],
    ["J", "Moss & Stone", "#9CAF88", "grid", "🪨", "🌿 🍄 🪨", {
      head: "༄ {t}", font: "smallcaps", item: "◌ {i} {ft}\n{b}", tags: "green moss" }],
  ]),
  family("04", "Celestial & Fantasy", "Moons, spells, constellations, crystals, and dragons.", "stars", {}, [
    ["A", "Moonlit Grimoire", "#8B80CC", "stack", "🌙", "☽ ✧ ✦", {
      head: "☾  {T}  ☽", intro: "-# ✦  CHAPTER Ⅰ  ✦\n*{x}*", numbering: "FIRST", item: "### {i}  THE {n} SPELL\n**{t}.** {b}",
      outro: "⋆｡°✩  {x}", tags: "purple moon" }],
    ["B", "Constellation Thread", "#5C6FB5", "tree", "🌌", "✦ ✧ ⋆", {
      head: "✧ {T} ✧", tree: ["✦ · · ·  ", "· ✦ ", "·   ", "· · · ✦  "], item: "**{t}**\n{b}", tags: "blue stars" }],
    ["C", "Magical Girl", "#F2A7D8", "cards", "🪄", "🎀 💖 🪄", {
      head: "✧₊⁺ {t} ⁺₊✧", item: "{i}﹒{t}\n{b}", palette: ["#F2A7D8", "#C9A3F7", "#A3C9F7", "#F2A7D8"], tags: "pink magic" }],
    ["D", "Moon Phases", "#9AA4C9", "grid", "🌕", "🌒 🌓 🌔", {
      head: "☽ ◐ ● ◑ ☾  {T}", item: "{i} {t}\n{b}", divider: "🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘", tags: "grey moon" }],
    ["E", "Star Charms", "#F1D28A", "stack", "⭐", "⭐ 🌙 💫", {
      head: "✦ ⋆ {T} ⋆ ✦", item: "₊˚⊹〔{i}〕 **{t}**\n{b}", divider: "⋆ ˚｡⋆୨୧˚ ˚｡⋆", tags: "yellow stars" }],
    ["F", "Witching Hour", "#6B4C9A", "frame", "🔮", "🕯️ 🔮 🌙", {
      head: "{t}", font: "fraktur", frame: ["༺ ☾ ───────────── ☽ ༻", "  ", "༺ ☾ ───────────── ☽ ༻"], item: "✧ {i} **{t}**\n{b}", tags: "purple witch" }],
    ["G", "Crystal Cave", "#A8D8E8", "fields", "💎", "💎 🔷 ✨", {
      head: "⟡ {T} ⟡", item: "◇{i}◇ {t}\n{b}", tags: "ice crystal" }],
    ["H", "Dragon’s Hoard", "#C0504D", "stack", "🐉", "🐉 💰 🗡️", {
      head: "⚔ {T} ⚔", intro: "-# FROM THE DRAGON’S LEDGER\n{x}", numbering: "I", item: "{i}  **{n}** · {t}\n{b}",
      divider: "═══════ 🐉 ═══════", tags: "red dragon" }],
    ["I", "Spell Circle", "#7D6BC2", "quote", "✨", "📜 🪄 🌙", {
      head: "⊹ ✧ {T} ✧ ⊹", item: "⟡〔{i}〕 **{t}**\n{b}", tags: "purple arcane" }],
    ["J", "Starlit Crown", "#E8C66E", "grid", "👑", "🌟 🌙 ✨", {
      head: "♕ ✦ {T} ✦ ♕", font: "bold-serif", item: "♔ {i} {t}\n{b}", tags: "gold crown" }],
  ]),
  family("05", "Gothic & Dark Academia", "Manuscripts, candlelight, ravens, roses, and old archives.", "stripes", { numbering: "I" }, [
    ["A", "Midnight Manuscript", "#786B83", "stack", "📜", "§ § §", {
      head: "❦  {T}", intro: "**MANUSCRIPT NO. 001**\n━━━━━━━━━━━━━━━━\n{x}", item: "**§ {n}.  {u}**\n{b}",
      outro: "❧  *{x}*\n-# Filed by the Archivist", tags: "grey manuscript" }],
    ["B", "Library Index", "#8C6B4F", "fields", "📚", "📕 📗 📘", {
      head: "📚 INDEX / {T}", item: "{i} {n} : {t}\n{b}", tags: "brown library" }],
    ["C", "Velvet Coffin", "#5E1F2E", "frame", "🥀", "🕯️ 🥀 🦇", {
      head: "{t}", font: "fraktur", frame: ["╔══ 🥀 ══════════════╗", "║ ", "╚══ 🦇 ══════════════╝"], item: "{i} **{t}**\n{b}", tags: "red gothic" }],
    ["D", "Raven’s Quill", "#3E3B4A", "quote", "🪶", "🪶 🖋️ 🕯️", {
      head: "✒ {t}", font: "italic-serif", intro: "*{x}*", item: "{i} **{t}**\n*{b}*", tags: "black raven" }],
    ["E", "Candlelit Study", "#B08A57", "stack", "🕯️", "📖 🕯️ 🖋️", {
      head: "❦ {T} ❦", font: "smallcaps", intro: "*{x}*", item: "### {n}. {i} {t}\n{b}", divider: "· · ── ⟡ ── · ·", tags: "amber study" }],
    ["F", "Cathedral Bell", "#6E6A86", "cards", "🔔", "⛪ 🔔 🕊️", {
      head: "✠ {T} ✠", item: "✠ {i} {t}\n{b}", palette: ["#4E4A66", "#6E6A86", "#8E8AA6", "#4E4A66"], tags: "grey cathedral" }],
    ["G", "Old Archive", "#9C8A6B", "code", "🗄️", "▪ ▪ ▪", {
      head: "🗄️ {T}", intro: "REF: SM-042 · CLASS: PUBLIC\n{x}", numbering: "001", item: "[{n}] {u}\n      {b}", outro: "— {x} —", tags: "sepia archive" }],
    ["H", "Thorned Rose", "#8B1E3F", "tree", "🥀", "🌹 🥀 🗝️", {
      head: "🥀 {T} 🥀", font: "bold-serif", tree: ["⸙  ", "├ ", "│ ", "╰ ⸙  "], item: "{i} **{t}**\n{b}", tags: "crimson rose" }],
    ["I", "Ink & Parchment", "#C2A878", "grid", "🖋️", "📜 🖋️ 🔏", {
      head: "✒︎ {t}", font: "script", item: "{i} {t}\n{b}", tags: "parchment ink" }],
    ["J", "Haunted Portrait", "#575265", "stack", "🖼️", "👁️ 🕯️ 🗝️", {
      head: "⟢ {T} ⟢", intro: "-# the eyes follow you…\n{x}", item: "{i}  **{t}**\n||{b}||", outro: "*{x}*", tags: "spooky spoilers" }],
  ]),
  family("06", "Retro & Cyber", "Terminals, arcades, broadcasts, neon, and old computers.", "scanlines", {}, [
    ["A", "System Override", "#48C6B4", "code", "💻", "> > >", {
      head: "[SYS://{T}]", font: "snake", intro: "STATUS ........ ONLINE\nACCESS ........ PUBLIC\nVERSION ....... 2.0.1\n\n{x}",
      item: "[{n}] > {u}\n     {b}", outro: "✓ {x}.", tags: "teal terminal" }],
    ["B", "Vaporwave FM", "#E58FD8", "stack", "📼", "🌴 📼 🗿", {
      head: "▰ {T} ▰", font: "fullwidth", item: "░ {i} **{t}**\n{b}", divider: "▓▒░ ░▒▓ ▓▒░ ░▒▓", tags: "pink vapor" }],
    ["C", "Arcade Cabinet", "#F2C94C", "grid", "🕹️", "▶ ◆ ◇", {
      head: "▣ 🕹️ {T} ▣", item: "{i} STAGE {n}\n**{t}**: {b}", outro: "INSERT COIN · {x}", tags: "yellow arcade" }],
    ["D", "CRT Terminal", "#39FF88", "code", "📟", "> > >", {
      head: "▣ {t}.exe", font: "snake", intro: "C:\\SERVER> _\n{x}", item: "> {t}\n  {b}", outro: "C:\\SERVER> {x}", tags: "green crt" }],
    ["E", "Pixel Hearts", "#FF6F91", "stack", "👾", "♥ ♦ ★", {
      head: "♥ ░ {T} ░ ♥", numbering: "keycap", item: "### {n} {t}\n[{i}] {b}", divider: "░░░░░░░░░░░░░░", tags: "pink pixel" }],
    ["F", "Neon Nights", "#FF3EA5", "cards", "⚡", "⚡ 💿 🌃", {
      head: "✦ {T} ✦", font: "sans-bold", item: "{i} // {t}\n{b}", palette: ["#FF3EA5", "#B03EFF", "#3EC5FF", "#FF3EA5"], tags: "neon city" }],
    ["G", "Lost Broadcast", "#A3A3A3", "fields", "📺", "📺 📡 📻", {
      head: "▤ {T} ▤", item: "▌{n}▐ {u}\n{b}", outro: "▌99▐ OFF AIR · {x}", tags: "static tv" }],
    ["H", "Floppy Disk", "#5A8DEE", "frame", "💾", "▸ ▸ ▸", {
      head: "💾 A:\\{T}", font: "snake", frame: ["┌──────────────────┐", "│ ", "└──────────────────┘"], item: "[{n}] **{t}**\n{b}", tags: "blue computer" }],
    ["I", "Radio Moth", "#E2A04B", "tree", "📻", "📻 🎙️ 🎧", {
      head: "◉ 📻 {T}", tree: ["◉ ", "├ ", "│ ", "╰ ◉ "], numbering: "fm", item: "FM {n} · **{t}**\n{b}", tags: "orange radio" }],
    ["J", "Holo Dashboard", "#7FDBFF", "grid", "🛰️", "🛰️ 📊 🔒", {
      head: "◢ {T} ◣", font: "mono", item: "◆ {u}\n{b}", tags: "cyan sci-fi" }],
  ]),
  family("07", "Simple & Professional", "Clean type, clear structure, and quiet details.", "none", {}, [
    ["A", "Modern Editorial", "#7D9AB6", "stack", "📰", "· · ·", {
      intro: "*{x}*", item: "`{n}`  **{t}**\n{b}", tags: "blue clean" }],
    ["B", "Role Panel", "#5865F2", "cards", "📌", "👤 🔔 💬", { item: "{i} {t}\n{b}", tags: "blurple panel" }],
    ["C", "Two Column", "#4F7A64", "grid", "📋", "· · ·", { item: "{t}\n{b}", tags: "green" }],
    ["D", "Bullet Rules", "#F38BB5", "list", "📋", "· · ·", { head: "{t} ♡", heading: "title", item: "- **{t}**: {b}", tags: "pink list" }],
    ["E", "Subtle Headers", "#8A8F98", "stack", "📄", "· · ·", {
      head: "", intro: "# {p}\n{x}", item: "### {t}\n{b}", tags: "headers" }],
    ["F", "Soft Brackets", "#9DB4C0", "quote", "💬", "· · ·", { head: "[ {t} ]", item: "( {n} ) **{t}**\n{b}", tags: "light blue" }],
    ["G", "Fine Lines", "#B0B7C3", "list", "✏️", "· · ·", {
      head: "── {T} ──", numbering: "1", item: "{n}. **{t}** — {b}", divider: "────────────────", tags: "lines numbered" }],
    ["H", "Small Caps", "#A3A7C2", "grid", "✦", "› › ›", { head: "✦ {T}", font: "smallcaps", item: "{i} {ft}\n{b}", tags: "small caps" }],
    ["I", "Team Memo", "#3E5C76", "fields", "🗂️", "· · ·", {
      intro: "**To:** Everyone\n**From:** The Team\n**Re:** {p}\n\n{x}", item: "{n} · {t}\n{b}", tags: "navy memo" }],
    ["J", "Negative Space", "#D0D0D0", "stack", "◻️", "· · ·", {
      head: "{T}", font: "spaced", item: "·  **{t}**\n·  {b}", divider: "\u200b", tags: "minimal white" }],
  ]),
  family("08", "Anime & Gaming", "Quests, bosses, inventories, title cards, and visual novels.", "checker", {}, [
    ["A", "Quest Board", "#E4A66B", "stack", "⚔️", "📜 🛡️ 🏆", {
      head: "⚔️  {T}", intro: "╔══  QUEST: {P}  ══╗\n{x}", item: "{i}  **OBJECTIVE {n}**\n{t}: {b}", outro: "🏆  REWARD: {x}!", tags: "orange rpg" }],
    ["B", "Character Select", "#FF7A59", "grid", "🎮", "🗡️ 🏹 🔮", {
      head: "▶ {T} ◀", item: "{i} {u}\nLv.{n} · {b}", tags: "orange game" }],
    ["C", "Shonen Title Card", "#F25C54", "cards", "💥", "💥 🔥 ⚡", {
      head: "‼️ {T} ‼️", font: "sans-bold", item: "{i} EPISODE {n} · {t}\n{b}", palette: ["#F25C54", "#F2A541", "#F2D541", "#F25C54"], tags: "red anime" }],
    ["D", "Magical School", "#B79CED", "fields", "🏫", "🏫 📚 🎒", {
      head: "🌸 {t} 🌸", numbering: "A", item: "{i} Class {n}: {t}\n{b}", tags: "lilac school" }],
    ["E", "Inventory Screen", "#6BA368", "frame", "🎒", "🧪 🗝️ 💎", {
      head: "🎒 {T}", numbering: "1", frame: ["╔═[ INVENTORY ]══════════", "║ ", "╚════════════════════════"], item: "{i} x{n}  **{t}**\n{b}", tags: "green rpg" }],
    ["F", "Visual Novel", "#F7A1C4", "quote", "💬", "💬 🌸 ✨", {
      head: "【 {t} 】", intro: "*{x}*", item: "**Moth-chan:** 「{t}!」\n{b}", tags: "pink dialogue" }],
    ["G", "Boss Battle", "#8B2FC9", "stack", "👹", "⚔️ 🛡️ ❤️", {
      head: "☠ {T} ☠", intro: "**HP** ▰▰▰▰▰▰▰▱▱▱\n{x}", numbering: "1", item: "{i}  **PHASE {n}** · {t}\n{b}", outro: "🎉 {x}", tags: "purple boss" }],
    ["H", "Gacha Pull", "#FFD166", "grid", "🌟", "🌟 ✨ 💫", {
      head: "✦ {T} ✦", intro: "**SSR GET!** ✨ {x}", item: "{i} ★★★★★\n**{t}**: {b}", tags: "gold gacha" }],
    ["I", "Speech Bubble", "#8AC6D1", "cards", "💭", "💭 🗯️ 💬", {
      head: "( ˘▽˘)っ {t}", item: "{i} {t}\n{b}", tags: "teal manga" }],
    ["J", "Pixel RPG", "#6C8EBF", "code", "🗡️", "> > >", {
      head: "⚔ {T}", intro: "> {x}", item: "[{n}] {u}\n    {b}", outro: "> PRESS START · {x}", tags: "blue retro" }],
  ]),
  family("09", "Scrapbook & Stationery", "Diaries, washi tape, sticky notes, tickets, and letters.", "paper", {}, [
    ["A", "Dear Diary", "#D9A0A8", "tree", "💌", "🌷 🎀 🍓", {
      head: "💌  {t}", font: "lower", tree: ["┌  ", "│  ", "│  ", "└  "], intro: "dear new friend ♡ {x}", item: "{i} **{t}**: {b}", outro: "{x}, with love ♡", tags: "pink diary" }],
    ["B", "Washi Tape", "#F2C6A0", "stack", "🎞️", "📎 ✂️ 🖍️", {
      head: "▨▨ {t} ▨▨", item: "{i} **{t}**\n{b}", divider: "▨▧▨▧▨▧▨▧▨▧▨▧", tags: "tape craft" }],
    ["C", "Sticky Notes", "#F9E79F", "grid", "📝", "📌 📌 📌", { head: "📝 {t}", item: "{i} {t}\n{b}", tags: "yellow notes" }],
    ["D", "Polaroid Wall", "#E6D5C3", "cards", "📸", "📸 🖼️ 🎞️", {
      head: "📸 {t}", item: "{i} {t}\n*{b}*", palette: ["#E6D5C3", "#D9C4AE", "#CDB59B", "#E6D5C3"], tags: "photo cream" }],
    ["E", "Notebook Margin", "#A7C7E7", "stack", "✎", "✎ ✎ ✎", {
      head: "✎ {t}", intro: "-# p. 01\n{x}", item: "{n}.  **{t}**\n{b}", divider: "─ ─ ─ ─ ─ ─ ─ ─ ─ ─", tags: "blue notebook" }],
    ["F", "Letter Seal", "#B5485D", "frame", "✉️", "🌹 🕊️ 💌", {
      head: "✉︎ {t}", font: "script", frame: ["┌─ ✉ ──────────────", "│ ", "└────────────── 🔏 ─"], item: "{i} **{t}**\n{b}", tags: "red letter" }],
    ["G", "Admit One", "#D98E73", "fields", "🎟️", "🎟️ 🎫 🎪", {
      head: "🎟️ ADMIT ONE · {T}", numbering: "001", item: "{i} No. {n} · {t}\n{b}", tags: "ticket stub" }],
    ["H", "Planner Spread", "#C5B4E3", "grid", "🗓️", "☐ ☐ ☐", { head: "🗓️ {t} · this week", item: "{i} {t}\n{b}", tags: "lilac planner" }],
    ["I", "Cut & Paste", "#FF8FAB", "stack", "✂️", "✂️ 🧷 🖍️", {
      head: "✂ - - - {T} - - -", item: "【{i}】 **{t}**\n{b}", divider: "- - - - - ✂ - - - - -", tags: "pink craft" }],
    ["J", "Receipt Roll", "#EDE6DA", "code", "🧾", "· · ·", {
      head: "🧾 {T}", intro: "MOTH CAFÉ            #0042\n- - - - - - - - - - - - - -\n{x}", numbering: "1", item: "{n} x {u}\n    {b}",
      outro: "- - - - - - - - - - - - - -\nTOTAL: {x}  ♡", tags: "receipt" }],
  ]),
  family("10", "Decorative ASCII & Unicode", "Pure symbol work: borders, kaomoji, braille lace, and glyphs.", "diamonds", {}, [
    ["A", "Ornamental Divider", "#BBA9D6", "frame", "✧", "✦ ✦ ✦", {
      head: "✧༺  {T}  ༻✧", frame: ["╭────── ⋆⋅☆⋅⋆ ──────╮", "  ", "╰────── ⋆⋅☆⋅⋆ ──────╯"], item: "{i}  {n}  **{t}**\n{b}", tags: "lilac ornament" }],
    ["B", "Double Rule", "#A0B3D9", "stack", "═", "╠ ╠ ╠", {
      head: "═══ {T} ═══", item: "{i} **{t}**\n║ {b}", divider: "══════════════════", tags: "blue lines" }],
    ["C", "Kaomoji Parade", "#F7C6D9", "quote", "🐾", "(˶ᵔᵕᵔ˶) (｡•̀ᴗ-)✧ (っ˘ω˘ς)", {
      head: "₍ᐢ. .ᐢ₎ {t}", item: "{i}  **{t}**\n{b}", tags: "kaomoji pink" }],
    ["D", "Wing Study", "#C8B6E2", "grid", "🦋", "✦ ♡ ❀", { head: "ʚ ɞ {T} ʚ ɞ", item: "ʚ{i}ɞ {t}\n{b}", tags: "wings lilac" }],
    ["E", "Braille Lace", "#E3D5F5", "stack", "🕸️", "⣿ ⣿ ⣿", {
      head: "⢀⣠ {t} ⣄⡀", item: "{i} **{t}**\n{b}", divider: "⠁⠂⠄⡀⢀⠠⠐⠈⠁⠂⠄⡀⢀⠠⠐⠈", pattern: "lace", tags: "lace braille" }],
    ["F", "Box Drawing", "#9FB7C9", "frame", "▦", "▸ ▸ ▸", {
      head: "▛ {T} ▜", frame: ["┏━━━━━━━━━━━━━━━━┓", "┃ ", "┗━━━━━━━━━━━━━━━━┛"], item: "{i} **{t}**\n  {b}", tags: "boxes" }],
    ["G", "Star Garland", "#F0D78C", "stack", "☁️", "✧˖° ✧˖° ✧˖°", {
      head: "⋆｡˚ ☁︎ {t} ☾ ˚｡⋆", item: "{i} **{t}**\n{b}", divider: "⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆", tags: "gold stars" }],
    ["H", "Bracket Stack", "#B9C4E0", "tree", "⌜", "〔 〔 〔", {
      head: "⌜ {T} ⌟", tree: ["⌜ ", "├ ", "│ ", "⌞ "], item: "〔{n}〕 **{t}**\n{b}", tags: "brackets" }],
    ["I", "Arrow Flow", "#A8D5BA", "stack", "➳", "↳ ↳ ↳", {
      head: "➳ {t}", item: "{i} **{t}**\n   ⤷ {b}", divider: "⇢ ⇢ ⇢ ⇢ ⇢ ⇢ ⇢", tags: "mint arrows" }],
    ["J", "Glyph Lab", "#C6A2D9", "grid", "⌘", "⌁⟡ ✣⊹ ⌘✧", { head: "⌁ ✣ {T} ✣ ⌁", item: "{i} {t}\n{b}", tags: "glyphs" }],
  ]),
  family("11", "Themed Objects & Interfaces", "Labels, tickets, players, forecasts, and machines that frame your text.", "grid", {}, [
    ["A", "Potion Label", "#82B5A2", "stack", "⚗️", "🌿 🍄 ✨", {
      head: "⚗️  {T} · LABEL NO. 01", intro: "〔 CONTENTS 〕\n{x}", label: "〔 INGREDIENTS 〕", item: "{i}  **{t}**\n{b}", outro: "〔 WARNING 〕\n{x}", tags: "green potion" }],
    ["B", "Treasure Map", "#C9A66B", "stack", "🗺️", "🧭 ⛵ 💰", {
      head: "🗺️ {T}", intro: "-# X marks the spot\n{x}", item: "{i} **Clue {n}** · {t}\n{b}", divider: "· · · · · · · · ✕", tags: "map pirate" }],
    ["C", "Library Card", "#B89B72", "fields", "📇", "· · ·", {
      head: "📇 {T} · LIBRARY CARD", intro: "**Borrower:** you ♡\n{x}", numbering: "001", item: "{n} · {t}\n{b}", tags: "card brown" }],
    ["D", "Weather Report", "#7DB9E8", "grid", "🌦️", "☀️ ⛅ 🌧️", { head: "☁︎ {T} · FORECAST", item: "{i} {t}\n{b}", tags: "sky weather" }],
    ["E", "Train Ticket", "#D96C5B", "stack", "🚂", "🚉 🛤️ 🎫", {
      head: "🚂 {T} EXPRESS", intro: "-# PLATFORM 9 · CAR 3\n{x}", item: "### {i}  Stop {n} · {t}\n{b}", divider: "▭▭▭▭▭▭▭▭▭▭▭▭", tags: "red train" }],
    ["F", "Recipe Card", "#E8A87C", "tree", "🍳", "🥄 🥄 🥄", {
      head: "🍳 {t} (serves everyone)", tree: ["🥣 ", "├ ", "│ ", "╰ 🍽️ "], numbering: "1", item: "Step {n}: **{t}**\n{b}", tags: "recipe orange" }],
    ["G", "Music Player", "#C38FFF", "stack", "🎵", "🎵 🎶 🎧", {
      head: "♪ Now playing: {t}", intro: "0:42 ━━━━━●──────── 3:14\n⇄　◁◁　❚❚　▷▷　↻\n\n{x}", numbering: "1", item: "{n}. **{t}**\n{b}", tags: "purple music" }],
    ["H", "Phone Notifications", "#8FA3BF", "cards", "📱", "🔔 💬 📩", {
      head: "📱 {t}", item: "{i} {t} · now\n{b}", tags: "phone" }],
    ["I", "Tarot Spread", "#9E7BB5", "grid", "🃏", "🌞 🌙 ⭐", {
      head: "✦ {T} ✦", numbering: "I", item: "{i} {n} · {u}\n{b}", tags: "tarot purple" }],
    ["J", "Vending Machine", "#6FC2C9", "frame", "🥤", "🥤 🍫 🍬", {
      head: "🥤 {T}", numbering: "A1", frame: ["╔══[ SELECT ]══════════", "║ ", "╚══[ ◉ COIN ]══════════"], item: "[{n}] {i} **{t}**\n{b}", tags: "teal machine" }],
  ]),
  family("12", "Experimental & Artistic", "Exhibits, stitches, specimens, rhythm, poetry, and color shifts.", "stripes", {}, [
    ["A", "Museum Exhibit", "#C8A78C", "frame", "🏛️", "🖼️ 🏺 🗿", {
      head: "EXHIBIT 001  ◇  {T}", intro: "COLLECTION: {P}\nPERIOD: PRESENT DAY\n\n{x}", frame: ["┌───────────────────┐", "│  ", "└───────────────────┘"],
      item: "{i}  **{u}**\n{b}", outro: "-# On display for all visitors · {x}", tags: "museum tan" }],
    ["B", "Cross-Stitch", "#D88C9A", "stack", "🧵", "✕□✕ ✕□✕ ✕□✕", {
      head: "✕ ✕ ✕ {T} ✕ ✕ ✕", item: "{i} **{t}**\n{b}", divider: "✕□✕□✕□✕□✕□✕□✕", tags: "stitch rose" }],
    ["C", "Petri Dish", "#9BD3AE", "code", "🧫", "+ ÷ ∴", {
      head: "SPECIMEN 〔 {T} 〕", intro: "OBSERVATION LOG · LIVE\n{x}", numbering: "1", item: "({n}) {t}\n    {b}", tags: "lab mint" }],
    ["D", "Moving Dots", "#C7B6E8", "fields", "⚪", "· · ·", { head: "● ○ ○  {T}", numbering: "dots", item: "{n}  {t}\n{b}", tags: "dots" }],
    ["E", "Optical Rhythm", "#A6B1E1", "stack", "▌", "· · ·", {
      head: "▏▎▍▌ {T}", numbering: "bars", item: "{n}  **{t}**\n{b}", divider: "▏▎▍▌▋▊▉█▉▊▋▌▍▎▏", tags: "rhythm" }],
    ["F", "Mirror Text", "#B3C8D9", "quote", "🪞", "〈〉 《》 〈〈〉〉", { head: "〈 {t} 〉", item: "{i}  **{t}**\n{b}", tags: "mirror" }],
    ["G", "Barcode", "#2E2E2E", "code", "▌", "│ │ │", {
      head: "▌│▏▌▏ {T}", intro: "▌│█║▌║▌║█│▌ 0042\n{x}", item: "{n} {i} {u}\n    {b}", tags: "barcode black" }],
    ["H", "Zine Collage", "#FF6B6B", "cards", "✂️", "✶ ✷ ✸", {
      head: "✁ {T} !!", font: "sans-bold", item: "{i} {u}\n{b} ✶", palette: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF"], tags: "zine bright" }],
    ["I", "Poetry Stanza", "#B7A3C8", "stack", "🪶", "· · ·", {
      head: "{t}", font: "italic-serif", intro: "*{x}*", numbering: "none", item: "*{t},*\n*{b}*", outro: "~ *{x}*", divider: "~", tags: "poem" }],
    ["J", "Gradient Shift", "#F7A1C4", "cards", "🌈", "◔ ◑ ◕", {
      head: "◐ {t}", item: "{i} {t}\n{b}", palette: ["#F7A1C4", "#C9A3F7", "#A3C9F7", "#A3F7D8"], tags: "gradient rainbow" }],
  ]),
];

export const embedStyles: EmbedStyle[] = embedFamilies.flatMap(group => group.styles);
const byId = new Map(embedStyles.map(style => [style.id, style]));

export function embedStyle(id: string) {
  return byId.get(id.trim().toUpperCase());
}

export function embedPurpose(id: string | undefined) {
  return embedPurposes.find(purpose => purpose.id === id) ?? embedPurposes[0];
}

export function embedFamily(number: string) {
  return embedFamilies.find(group => group.number === number);
}

/** Pulls known embed codes out of free text (“e03a, E1-B”), deduplicated, in catalog order. */
export function parseEmbedIds(text: string): string[] {
  const found = new Set<string>();
  for (const [, number, letter] of text.toUpperCase().matchAll(/(?<![A-Z0-9])E[\s-]?(\d{1,2})[\s-]?([A-Z])(?![A-Z0-9])/g)) {
    const id = `E${number.padStart(2, "0")}${letter}`;
    if (byId.has(id)) found.add(id);
  }
  return embedStyles.map(style => style.id).filter(id => found.has(id));
}

/* ─────────────────────────── Typography ─────────────────────────── */

const offsets: Partial<Record<FontStyle, [upper: number, lower: number, digit?: number]>> = {
  "bold-serif": [0x1d400, 0x1d41a, 0x1d7ce],
  "italic-serif": [0x1d434, 0x1d44e],
  "bold-italic": [0x1d468, 0x1d482],
  script: [0x1d4d0, 0x1d4ea],
  fraktur: [0x1d56c, 0x1d586],
  double: [0x1d538, 0x1d552, 0x1d7d8],
  "sans-bold": [0x1d5d4, 0x1d5ee, 0x1d7ec],
  mono: [0x1d670, 0x1d68a, 0x1d7f6],
  fullwidth: [0xff21, 0xff41, 0xff10],
};
const holes: Record<string, string> = { "italic-serif:h": "ℎ", "double:C": "ℂ", "double:H": "ℍ", "double:N": "ℕ", "double:P": "ℙ", "double:Q": "ℚ", "double:R": "ℝ", "double:Z": "ℤ" };
const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";

/** Rewrites plain letters in a Unicode “font”. Leaves emoji and symbols alone. */
export function applyFont(text: string, font: FontStyle): string {
  if (font === "plain") return text;
  if (font === "lower") return text.toLowerCase();
  if (font === "snake") return text.toUpperCase().replace(/[’']/g, "").replace(/\s+/g, "_");
  if (font === "spaced") return [...text.toUpperCase()].join(" ").replace(/ {3}/g, "   ");
  if (font === "smallcaps") return text.replace(/[A-Za-z]/g, ch => smallCaps[ch.toLowerCase().charCodeAt(0) - 97]);
  const table = offsets[font];
  if (!table) return text;
  return text.replace(/[A-Za-z0-9 ]/g, ch => {
    if (ch === " ") return font === "fullwidth" ? "\u3000" : ch;
    const hole = holes[`${font}:${ch}`];
    if (hole) return hole;
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(table[0] + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(table[1] + code - 97);
    return table[2] ? String.fromCodePoint(table[2] + code - 48) : ch;
  });
}

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const ordinals = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH"];

export function formatNumber(kind: Numbering, index: number): string {
  const n = index + 1;
  switch (kind) {
    case "01": return String(n).padStart(2, "0");
    case "001": return String(n).padStart(3, "0");
    case "1": return String(n);
    case "I": return roman[index] ?? String(n);
    case "i": return (roman[index] ?? String(n)).toLowerCase();
    case "A": return String.fromCharCode(65 + index);
    case "①": return String.fromCodePoint(0x2460 + index);
    case "❶": return String.fromCodePoint(0x2776 + index);
    case "keycap": return n <= 9 ? `${n}\uFE0F\u20E3` : String(n);
    case "sub": return `1.${n}`;
    case "FIRST": return ordinals[index] ?? String(n);
    case "fm": return (88.1 + index * 2.2).toFixed(1);
    case "dots": return Array.from({ length: 3 }, (_, i) => (i === index % 3 ? "●" : "○")).join(" ");
    case "bars": return "▏▎▍▌▋▊▉".slice(index % 6, (index % 6) + 2);
    case "A1": return `A${n}`;
    case "none": return "";
  }
}

/* ─────────────────────────── Composition ─────────────────────────── */

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(ft|fT|[TtxnibupPs])\}/g, (_, key: string) => values[key] ?? "");

/** Code blocks show markdown literally, so drop the markers. */
const plain = (text: string) => text.replace(/\*\*|__|\|\||(?<![*\w])\*(?!\s)|(?<!\s)\*(?![*\w])|`/g, "").replace(/^-# /gm, "").replace(/^#{1,3} /gm, "");

const blank = "\u200b";

function itemText(style: EmbedStyle, purpose: EmbedPurpose, index: number) {
  const entry = purpose.items[index];
  return fill(style.item, {
    n: formatNumber(style.numbering, index),
    i: style.icons[index % style.icons.length],
    t: entry.title,
    u: entry.title.toUpperCase(),
    ft: applyFont(entry.title, style.font),
    fT: applyFont(entry.title.toUpperCase(), style.font),
    b: entry.body,
  });
}

function splitFirst(text: string): [string, string] {
  const at = text.indexOf("\n");
  return at < 0 ? [text, blank] : [text.slice(0, at), text.slice(at + 1) || blank];
}

/** Text of the items block for description-based layouts. */
function itemsBlock(style: EmbedStyle, items: string[]): string {
  switch (style.layout) {
    case "frame": {
      const [top, prefix, bottom] = style.frame ?? ["┌──────────────", "│ ", "└──────────────"];
      const body = items.flatMap((item, index) => [...(index ? [""] : []), ...item.split("\n")]).map(line => (prefix + line).trimEnd() || prefix.trimEnd());
      return [top, ...body, bottom].join("\n");
    }
    case "tree": {
      const [, branch, stem] = style.tree ?? ["╭ ", "├ ", "│ ", "╰ "];
      return items.map(item => {
        const [first, ...rest] = item.split("\n");
        return [branch + first, ...rest.map(line => stem + line), stem.trimEnd()].join("\n");
      }).join("\n");
    }
    case "list":
      return items.join("\n");
    case "quote":
      return items.map(item => item.split("\n").map(line => `> ${line}`).join("\n")).join("\n\n");
    default:
      return items.join("\n\n");
  }
}

function joinSections(parts: (string | undefined)[], divider: string) {
  const present = parts.filter((part): part is string => !!part && part.length > 0);
  return present.join(divider ? `\n\n${divider}\n\n` : "\n\n");
}

export type ComposeOptions = {
  look?: EmbedLook;
};

/**
 * Image URL for a slot in the copied JSON. Always a placeholder: the art on this site is example art
 * for previews only, so clients swap in links to their own images.
 */
export function artUrl(style: EmbedStyle, slot: ArtSlot) {
  return `https://example.com/your-art/${style.id}-${slot}.png`;
}

/** Builds the webhook embeds for one design, one purpose, and one decoration level. */
export function composeEmbeds(style: EmbedStyle, purpose: EmbedPurpose, options: ComposeOptions = {}): ComposedMessage {
  const look = options.look ?? "simple";
  const decorated = look !== "simple";
  const elaborate = look === "elaborate";
  const url = (slot: ArtSlot) => artUrl(style, slot);
  const color = parseInt(style.color.slice(1), 16);
  const values = { p: purpose.title, P: purpose.title.toUpperCase(), s: SERVER_NAME };
  const headText = fill(style.head, { ...values, T: applyFont(purpose.title.toUpperCase(), style.font), t: applyFont(purpose.title, style.font) }) || undefined;
  // Code blocks keep a real title; other layouts can lift it into a markdown header, like most server embeds do.
  const asHeader = headText && style.heading !== "title" && style.layout !== "code" && !/^#{1,3} /.test(headText);
  const title = asHeader ? undefined : headText?.replace(/^#{1,3} /, "");
  const withHeader = (text: string) => (asHeader ? `${"#".repeat(Number(style.heading.slice(1)))} ${headText}\n${text}` : text);
  const count = Math.min(style.itemCount, purpose.items.length);
  const items = purpose.items.slice(0, count).map((_, index) => itemText(style, purpose, index));
  const tree = style.layout === "tree" ? style.tree ?? ["╭ ", "├ ", "│ ", "╰ "] : undefined;
  let intro = fill(style.intro, { ...values, x: purpose.intro });
  let outro = fill(style.outro, { ...values, x: purpose.outro });
  if (tree) {
    intro = `${tree[0]}${intro.replace(/\n/g, `\n${tree[2]}`)}\n${tree[2].trimEnd()}`;
    outro = `${tree[3]}${outro}`;
  }
  const labelled = (block: string) => (style.label ? `**${style.label}**\n${block}` : block);
  const footerText = fill(style.footer, values);
  const recipe = style.recipe;

  /** One embed holding the header (title + intro), some items, and/or the closing line. */
  const part = (header: boolean, list: string[], closing: boolean): DiscordEmbed => {
    const embed: DiscordEmbed = { color };
    if (header && title) embed.title = title;
    if (style.layout === "fields" || style.layout === "grid") {
      const inline = style.layout === "grid";
      embed.fields = list.map(item => {
        const [name, value] = splitFirst(item);
        return { name, value, inline };
      });
      if (closing) embed.fields.push({ name: style.divider || blank, value: outro, inline: false });
      if (header) embed.description = withHeader(labelled(intro));
      if (!embed.fields.length) delete embed.fields;
    } else if (style.layout === "code") {
      const fence = "```" + (style.lang ?? "");
      const body = [header ? plain(intro) : "", header ? plain(style.label ?? "") : "", ...list.map(plain), closing ? plain(outro) : ""].filter(Boolean).join("\n\n");
      embed.description = `${fence}\n${body}\n\`\`\``;
    } else if (tree) {
      const lines = [header ? intro : "", list.length ? labelled(itemsBlock(style, list)) : "", closing ? outro : ""].filter(Boolean).join("\n");
      embed.description = header ? withHeader(lines) : lines;
    } else {
      const text = joinSections([header ? intro : undefined, list.length ? labelled(itemsBlock(style, list)) : undefined, closing ? outro : undefined], style.divider);
      embed.description = header ? withHeader(text) : text;
    }
    return embed;
  };

  /* 1. The text, split into embeds the way this design's recipe wants. */
  let core: DiscordEmbed[];
  if (purpose.id === "quote") {
    const [packageLine, extra, next] = purpose.items;
    core = [
      { title: purpose.title, description: purpose.intro, color },
      { title: "Itemized features", description: [packageLine, extra].map(({ title, body }) => `**${title}**\n${body}`).join("\n\n"), color },
      { title: next.title, description: `${next.body}\n\n-# ${purpose.outro}`, color },
    ];
  } else if (style.layout === "cards") {
    const colors = style.palette?.length ? style.palette.map(hex => parseInt(hex.slice(1), 16)) : [color];
    const colorAt = (index: number) => colors[index % colors.length];
    core = [{ title, description: withHeader(intro), color: colorAt(0) }];
    items.forEach((item, index) => {
      // Sections that open with a header stay in the description; others use the embed title.
      const card: DiscordEmbed = /^#{1,3} /.test(item)
        ? { description: item, color: colorAt(index + 1) }
        : { title: splitFirst(item)[0], description: splitFirst(item)[1], color: colorAt(index + 1) };
      if (style.divider && !elaborate) card.description += `\n\n${style.divider}`;
      core.push(card);
    });
    core.push({ description: outro, color: colorAt(items.length + 1) });
  } else if (recipe === "chapters" || recipe === "masthead") {
    core = [part(true, [], false), part(false, items, true)];
  } else if (recipe === "split") {
    const half = Math.ceil(items.length / 2);
    core = [part(true, items.slice(0, half), false), part(false, items.slice(half), true)];
  } else {
    core = [part(true, items, true)];
  }
  const first = core[0];
  const last = core[core.length - 1];

  /* 2. Art and chrome, placed by recipe. */
  const slots = new Map<DiscordEmbed, ArtSlot[]>();
  const mark = (embed: DiscordEmbed, slot: ArtSlot) => slots.set(embed, [...(slots.get(embed) ?? []), slot]);
  const thumb = (embed: DiscordEmbed) => { embed.thumbnail = { url: url("thumbnail") }; mark(embed, "thumbnail"); };
  const image = (embed: DiscordEmbed, slot: "banner" | "strip") => { embed.image = { url: url(slot) }; mark(embed, slot); };
  const author = (embed: DiscordEmbed, icon = true) => {
    embed.author = { name: recipe === "signature" ? `${SERVER_NAME} · ${purpose.label}` : SERVER_NAME };
    if (icon) { embed.author.icon_url = url("icon"); mark(embed, "icon"); }
  };
  const footer = (embed: DiscordEmbed, icon: boolean, time: boolean) => {
    embed.footer = { text: footerText };
    if (icon) { embed.footer.icon_url = url("icon"); mark(embed, "icon"); }
    if (time) embed.timestamp = "2026-11-18T17:32:00.000Z";
  };
  const imageEmbed = (slot: "banner" | "strip"): DiscordEmbed => {
    const embed: DiscordEmbed = { color };
    image(embed, slot);
    return embed;
  };
  const before: DiscordEmbed[] = [];
  const after: DiscordEmbed[] = [];
  const attachments: ArtSlot[] = [];

  if (purpose.id === "quote") {
    if (decorated) core.forEach((card) => image(card, "strip"));
    if (elaborate) thumb(first);
  } else switch (recipe) {
    case "hero":
      if (elaborate) before.push(imageEmbed("banner"));
      if (decorated) thumb(first);
      if (elaborate) { author(first); image(last, "strip"); }
      footer(last, decorated, elaborate);
      break;
    case "poster":
      if (decorated) image(last, "banner");
      if (elaborate) { author(first, false); thumb(first); }
      footer(last, false, elaborate);
      break;
    case "sticker":
      if (decorated) { thumb(first); author(first); }
      if (elaborate) image(last, "strip");
      break;
    case "chapters":
      if (decorated) thumb(first);
      if (elaborate) { core.splice(1, 0, imageEmbed("banner")); image(last, "strip"); }
      footer(last, elaborate, false);
      break;
    case "ribbon":
      if (decorated) image(last, "strip");
      if (elaborate) { author(first); thumb(first); }
      footer(last, decorated, elaborate);
      break;
    case "masthead":
      if (decorated) image(first, "banner");
      if (elaborate) thumb(last);
      footer(last, elaborate, elaborate);
      break;
    case "signature":
      if (decorated) author(first);
      if (elaborate) { thumb(first); image(last, "strip"); }
      break;
    case "attachment":
      if (decorated) attachments.push("banner");
      if (elaborate) thumb(first);
      footer(last, false, elaborate);
      break;
    case "split":
      if (decorated) core.splice(Math.ceil(core.length / 2), 0, imageEmbed("strip"));
      if (elaborate) { thumb(first); author(first, false); }
      footer(last, decorated, false);
      break;
    case "closing":
      if (decorated) thumb(first);
      if (elaborate) { after.push(imageEmbed("banner")); author(first); }
      footer(last, decorated, elaborate);
      break;
  }

  const embeds = [...before, ...core, ...after];
  const art: ComposedMessage["art"] = [];
  embeds.forEach((embed, index) => (slots.get(embed) ?? []).forEach(slot => art.push({ embed: index, slot })));

  /* 3. Buttons in this design's treatment. */
  const pictographs = style.icons.filter(icon => /\p{Extended_Pictographic}/u.test(icon));
  const label = (text: string) => fill(style.buttonLabel.replace("{L}", "{P}"), { l: text, P: text.toUpperCase() }).replace("{l}", text);
  let buttons: EmbedButton[] = purpose.buttons.map((button, index) => {
    const kind = style.buttons;
    const next: EmbedButton = { ...button, label: label(button.label) };
    if (kind === "solid" && button.style !== "link") next.style = "primary";
    if (kind === "soft" && button.style !== "link") next.style = "secondary";
    if (kind === "success" && button.style !== "link") next.style = index === 0 ? "success" : "secondary";
    if (kind === "links") next.style = "link";
    if (kind === "emoji") {
      next.style = button.style === "link" ? "link" : "secondary";
      next.emoji = pictographs[index % Math.max(pictographs.length, 1)] ?? button.emoji ?? style.mark;
    }
    return next;
  });
  let menu: EmbedMenu | undefined;
  if (style.buttons === "menu" && purpose.buttons.length) {
    menu = {
      placeholder: label(purpose.id === "roles" ? "Pick your roles" : "Choose an option"),
      options: purpose.buttons.map((button, index) => ({ label: button.label, emoji: button.emoji ?? pictographs[index] })),
    };
    buttons = [];
  }

  return { embeds, buttons, menu, attachments, reactions: purpose.reactions, art };
}

/* ─────────────────────────── Export helpers ─────────────────────────── */

/** Plain text of every embed, for pasting into a bot's embed builder. */
export function embedText(message: ComposedMessage): string {
  return message.embeds.map(embed => [
    embed.title,
    embed.description,
    ...(embed.fields ?? []).map(field => `${field.name === blank ? "" : field.name}\n${field.value}`.trim()),
  ].filter(Boolean).join("\n\n")).filter(Boolean).join("\n\n───\n\n");
}

const buttonStyles: Record<ButtonStyle, number> = { primary: 1, secondary: 2, success: 3, danger: 4, link: 5 };

/** Webhook JSON (works in Discohook and with bot-owned webhooks; plain webhooks ignore buttons). */
export function webhookPayload(style: EmbedStyle, message: ComposedMessage, withButtons: boolean) {
  const payload: Record<string, unknown> = { content: null, embeds: message.embeds };
  if (withButtons && message.menu) {
    payload.components = [{
      type: 1,
      components: [{
        type: 3, custom_id: `${style.id.toLowerCase()}_menu`, placeholder: message.menu.placeholder,
        options: message.menu.options.map((option, index) => ({ label: option.label, value: `option_${index + 1}`, ...(option.emoji ? { emoji: { name: option.emoji } } : {}) })),
      }],
    }];
  } else if (withButtons && message.buttons.length) {
    payload.components = [{
      type: 1,
      components: message.buttons.map((button, index) => ({
        type: 2,
        style: buttonStyles[button.style],
        label: button.label,
        ...(button.emoji ? { emoji: { name: button.emoji } } : {}),
        ...(button.style === "link" ? { url: "https://example.com" } : { custom_id: `${style.id.toLowerCase()}_${index + 1}` }),
      })),
    }];
  }
  return payload;
}

/** Notes about how Discord treats this design, shown on the detail page. */
export function embedNotes(style: EmbedStyle): string[] {
  const notes: string[] = [];
  if (!["plain", "lower", "snake"].includes(style.font)) notes.push("Uses Unicode letter styles in headings. Screen readers may spell them out, so keep them to short titles.");
  if (style.layout === "grid") notes.push("Inline fields sit side by side on desktop and stack on phones.");
  if (style.layout === "code") notes.push("Code blocks show text exactly as typed: no bold, links, or custom emoji inside.");
  if (style.layout === "frame" || style.layout === "tree") notes.push("Discord’s font isn’t monospaced, so only the left edge of borders lines up. That’s by design here.");
  if (style.layout === "cards") notes.push("Sent as several embeds in one message (up to 10). Each card can have its own color.");
  if (style.item.includes("||")) notes.push("Uses spoiler tags, so readers click to reveal each line.");
  return notes;
}

/** Discord's documented embed limits. */
export const EMBED_LIMITS = { title: 256, description: 4096, fields: 25, fieldName: 256, fieldValue: 1024, footer: 2048, total: 6000, embeds: 10, buttons: 5 };

export function embedLength(embed: DiscordEmbed) {
  return (embed.title?.length ?? 0) + (embed.description?.length ?? 0) + (embed.footer?.text.length ?? 0) + (embed.author?.name.length ?? 0)
    + (embed.fields ?? []).reduce((sum, field) => sum + field.name.length + field.value.length, 0);
}
