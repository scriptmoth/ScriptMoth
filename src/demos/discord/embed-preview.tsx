import type { CSSProperties, ReactNode } from "react";
import { Noto_Color_Emoji } from "next/font/google";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { ArtSlot, ComposedMessage, DiscordEmbed, EmbedButton, EmbedStyle } from "@/demos/discord/discord-embeds";
import { showcaseArt } from "@/demos/showcase-art";
import styles from "./embed-preview.module.css";

/** Discord draws its own emoji images, so previews bring a color emoji font instead of relying on the visitor's system (older Windows lacks newer emoji). */
const emoji = Noto_Color_Emoji({ weight: "400", subsets: ["emoji"], variable: "--emoji-font", display: "swap", preload: false });

/* ───────────── Discord-flavored markdown (the parts embeds support) ───────────── */

const inlinePattern = /(\|\|[\s\S]+?\|\||`[^`]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\s][^*]*\*|_[^_\s][^_]*_|#[a-z][a-z0-9-]+|@[A-Za-z][\w-]*)/g;

function inline(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(inlinePattern)) {
    const token = match[0];
    const at = match.index ?? 0;
    if (at > last) nodes.push(text.slice(last, at));
    const k = `${key}-${i++}`;
    if (token.startsWith("||")) nodes.push(<span key={k} className={styles.spoiler} tabIndex={0}>{inline(token.slice(2, -2), k)}</span>);
    else if (token.startsWith("`")) nodes.push(<code key={k} className={styles.inlineCode}>{token.slice(1, -1)}</code>);
    else if (token.startsWith("[")) {
      const end = token.indexOf("](");
      nodes.push(<a key={k} className={styles.markdownLink} href={token.slice(end + 2, -1)} target="_blank" rel="noreferrer">{inline(token.slice(1, end), k)}</a>);
    }
    else if (token.startsWith("***")) nodes.push(<strong key={k}><em>{inline(token.slice(3, -3), k)}</em></strong>);
    else if (token.startsWith("**")) nodes.push(<strong key={k}>{inline(token.slice(2, -2), k)}</strong>);
    else if (token.startsWith("__")) nodes.push(<u key={k}>{inline(token.slice(2, -2), k)}</u>);
    else if (token.startsWith("~~")) nodes.push(<s key={k}>{inline(token.slice(2, -2), k)}</s>);
    else if (token.startsWith("*") || token.startsWith("_")) nodes.push(<em key={k}>{inline(token.slice(1, -1), k)}</em>);
    else if (token.startsWith("#")) nodes.push(<span key={k} className={styles.mention}>#{token.slice(1)}</span>);
    else if (token.startsWith("@")) nodes.push(<span key={k} className={/^@[A-Z]/.test(token) && token !== "@sharpnnyx" ? styles.roleMention : styles.mention}>{token}</span>);
    last = at + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function fencedCode(language: string, code: string): ReactNode {
  if (language === "ansi") {
    const parts = code.split(/\x1b\[([\d;]*)m/);
    return parts.map((part, index) => {
      if (index % 2) return null;
      const style = parts[index - 1];
      if (style === "1;36") return <strong key={index} className={styles.ansiReady}>{part}</strong>;
      if (style === "1;33") return <strong key={index} className={styles.ansiWaiting}>{part}</strong>;
      return part;
    });
  }
  if (language === "json") {
    return code.split(/("(?:\\.|[^"\\\r\n])*"|\b(?:true|false|null)\b)/).map((part, index, parts) => {
      if (index % 2 === 0) return part;
      const token = part.startsWith('"') && /^\s*:/.test(parts[index + 1]) ? styles.jsonKey : styles.jsonValue;
      return <span key={index} className={token}>{part}</span>;
    });
  }
  return code;
}

/** Renders the block-level markdown used in Discord embeds. */
export function Markdown({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const parts = text.split(/```([a-z]*)\n([\s\S]*?)```/i);
  parts.forEach((part, index) => {
    if (index % 3 === 1) return;
    if (index % 3 === 2) {
      out.push(<pre key={`c${index}`} className={styles.codeBlock}><code>{fencedCode(parts[index - 1].toLowerCase(), part.replace(/\n$/, ""))}</code></pre>);
      return;
    }
    const lines = part.replace(/^\n|\n$/g, "").split("\n");
    if (index > 0 && !part.trim()) return;
    let quote: ReactNode[] = [];
    let list: { ordered: boolean; items: ReactNode[] } | null = null;
    const flushList = (key: string) => {
      if (list) out.push(list.ordered
        ? <ol key={key} className={styles.list}>{list.items}</ol>
        : <ul key={key} className={styles.list}>{list.items}</ul>);
      list = null;
    };
    const flush = (key: string) => {
      if (quote.length) out.push(<blockquote key={key} className={styles.quote}>{quote}</blockquote>);
      quote = [];
      flushList(`${key}l`);
    };
    lines.forEach((line, n) => {
      const key = `${index}-${n}`;
      if (line.startsWith("> ")) {
        flushList(`${key}l`);
        if (quote.length) quote.push(<br key={`${key}b`} />);
        quote.push(<span key={key}>{inline(line.slice(2), key)}</span>);
        return;
      }
      const bullet = /^(?:- |(\d+)\. )(.*)$/.exec(line);
      if (bullet) {
        if (quote.length) flush(`${key}q`);
        const ordered = !!bullet[1];
        if (list && list.ordered !== ordered) flushList(`${key}l`);
        list ??= { ordered, items: [] };
        list.items.push(<li key={key} value={ordered ? Number(bullet[1]) : undefined}>{inline(bullet[2], key)}</li>);
        return;
      }
      flush(`${key}q`);
      const heading = /^(#{1,3}) (.*)$/.exec(line);
      if (heading) {
        const Tag = (["h3", "h4", "h5"] as const)[heading[1].length - 1];
        out.push(<Tag key={key} className={styles[`h${heading[1].length}`]}>{inline(heading[2], key)}</Tag>);
      } else if (line.startsWith("-# ")) {
        out.push(<small key={key} className={styles.subtext}>{inline(line.slice(3), key)}</small>);
      } else {
        out.push(<span key={key} className={styles.line}>{line ? inline(line, key) : " "}</span>);
      }
    });
    flush(`${index}-end`);
  });
  return <div className={styles.markdown}>{out}</div>;
}

/* ───────────── Generated art ───────────── */

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `rgb(${r} ${g} ${b})`;
}

/**
 * Art for one image slot. Uses the design's painted file when it has one; otherwise draws a
 * stand-in from its color, motif, and pattern so every design previews with coordinated art.
 */
const galleryArt: Record<string, EmbedStyle["images"]> = {
  E01A: { banner: showcaseArt.satinBow },
  E01G: { thumbnail: showcaseArt.rabbitIcon },
  E01J: { banner: showcaseArt.hearts },
  E03A: { strip: showcaseArt.clover },
  E03B: { banner: showcaseArt.whiteTulips },
  E03D: { banner: showcaseArt.awning },
  E03E: { banner: showcaseArt.tulips },
  E03F: { banner: showcaseArt.water },
  E03H: { banner: showcaseArt.forestWindow },
  E03I: { strip: showcaseArt.frogs, thumbnail: showcaseArt.frogIcon },
};

export function EmbedArt({ style, slot }: { style: EmbedStyle; slot: ArtSlot }) {
  const imageSlot = slot === "icon" ? "thumbnail" : slot;
  const painted = galleryArt[style.id]?.[imageSlot] ?? style.images?.[imageSlot];
  const label = `${style.name} ${slot === "strip" ? "divider strip" : slot}`;
  if (painted) {
    // eslint-disable-next-line @next/next/no-img-element -- previews must match what Discord shows: the raw file.
    return <img className={`${styles.art} ${styles[`art_${slot}`]}`} src={painted} alt={label} loading="lazy" decoding="async" />;
  }
  const vars = {
    "--art-a": shade(style.color, -0.45),
    "--art-b": style.color,
    "--art-c": shade(style.color, 0.55),
  } as CSSProperties;
  const icons = style.icons.filter(icon => /\p{Extended_Pictographic}/u.test(icon));
  const motifs = icons.length ? icons : [style.mark];
  return (
    <div className={`${styles.art} ${emoji.variable} ${styles[`art_${slot}`]} ${styles[`pattern_${style.pattern}`]}`} style={vars} role="img" aria-label={`${label} (preview art)`}>
      {slot === "banner" && <>
        <span className={styles.bannerSide} aria-hidden="true">{motifs.slice(0, 2).join(" ")} ✦</span>
        <span className={styles.bannerMark} aria-hidden="true">{style.mark}</span>
        <span className={styles.bannerSide} aria-hidden="true">✦ {motifs.slice(-2).join(" ")}</span>
      </>}
      {slot === "thumbnail" && <><span className={styles.thumbSpark} aria-hidden="true">✦</span><span aria-hidden="true">{style.mark}</span></>}
      {slot === "strip" && <span aria-hidden="true">· ✦ · {style.mark} · ✦ ·</span>}
      {slot === "icon" && <span aria-hidden="true">{style.mark}</span>}
    </div>
  );
}

/* ───────────── Message chrome ───────────── */

const toHex = (color: number) => `#${color.toString(16).padStart(6, "0")}`;

function Embed({ embed, index, style, message }: { embed: DiscordEmbed; index: number; style: EmbedStyle; message: ComposedMessage }) {
  const slots = new Set(message.art.filter(entry => entry.embed === index).map(entry => entry.slot));
  const imageSlot: ArtSlot | undefined = embed.image ? (slots.has("banner") ? "banner" : "strip") : undefined;
  const fields = embed.fields ?? [];
  const imageOnly = !embed.title && !embed.description && !fields.length && embed.image;
  return (
    <article className={`${styles.embed} ${imageOnly ? styles.imageOnly : ""}`} style={{ "--bar": toHex(embed.color) } as CSSProperties}>
      <div className={`${styles.embedGrid} ${embed.thumbnail ? styles.hasThumb : ""}`}>
        {embed.author && (
          <div className={styles.author}>
            <span className={styles.authorIcon}><EmbedArt style={style} slot="icon" /></span>
            <span>{embed.author.name}</span>
          </div>
        )}
        {embed.title && <div className={styles.title}><Markdown text={embed.title} /></div>}
        {embed.description && <div className={styles.description}><Markdown text={embed.description} /></div>}
        {fields.length > 0 && (
          <div className={styles.fields}>
            {fields.map((field, n) => (
              <div key={n} className={field.inline ? styles.fieldInline : styles.field}>
                <div className={styles.fieldName}><Markdown text={field.name} /></div>
                <div className={styles.fieldValue}><Markdown text={field.value} /></div>
              </div>
            ))}
          </div>
        )}
        {imageSlot && <div className={styles.image}><EmbedArt style={style} slot={imageSlot} /></div>}
        {embed.thumbnail && <div className={styles.thumbnail}><EmbedArt style={style} slot="thumbnail" /></div>}
        {embed.footer && (
          <div className={styles.footer}>
            {embed.footer.icon_url && <span className={styles.footerIcon}><EmbedArt style={style} slot="icon" /></span>}
            <span>{embed.footer.text}{embed.timestamp && " • Today at 5:32 PM"}</span>
          </div>
        )}
      </div>
    </article>
  );
}

function Buttons({ buttons }: { buttons: EmbedButton[] }) {
  return (
    <div className={styles.buttons} aria-label="Message buttons">
      {buttons.map(button => (
        <span key={button.label} className={`${styles.button} ${styles[`button_${button.style}`]}`}>
          {button.emoji && <span aria-hidden="true">{button.emoji}</span>}
          {button.label}
          {button.style === "link" && <ExternalLink size={14} aria-hidden="true" />}
        </span>
      ))}
    </div>
  );
}

/** A Discord message with the composed embeds, drawn with Discord's dark theme colors. */
export function DiscordMessage({ style, message, buttons = false, compact = false }: {
  style: EmbedStyle; message: ComposedMessage; buttons?: boolean; compact?: boolean;
}) {
  return (
    <div className={`${styles.message} ${emoji.variable} ${compact ? styles.compact : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed avatar */}
      <img className={styles.avatar} src="/assets/logos/icon-rounded.png" alt="" width={40} height={40} />
      <div className={styles.body}>
        <p className={styles.meta}>
          <strong>Scriptmoth</strong>
          <span className={styles.appTag}>APP</span>
          <time>Today at 5:32 PM</time>
        </p>
        {message.attachments.map(slot => (
          <div key={slot} className={styles.attachment}><EmbedArt style={style} slot={slot} /></div>
        ))}
        <div className={styles.embeds}>
          {message.embeds.map((embed, index) => <Embed key={index} embed={embed} index={index} style={style} message={message} />)}
        </div>
        {buttons && message.buttons.length > 0 && <Buttons buttons={message.buttons} />}
        {buttons && message.menu && (
          <div className={styles.menu} aria-label="Dropdown menu">
            <span>{message.menu.placeholder}</span>
            <ChevronDown size={18} aria-hidden="true" />
          </div>
        )}
        {message.reactions.length > 0 && (
          <div className={styles.reactions} aria-label="Reactions">
            {message.reactions.map(reaction => (
              <span key={reaction.emoji} className={styles.reaction}><span aria-hidden="true">{reaction.emoji}</span> {reaction.count}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
