"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ImageIcon, Maximize2, Search, X } from "lucide-react";
import type { TumblrPost, TumblrTemplate } from "@/demos/tumblr/tumblr-templates";
import { showcaseArt } from "@/demos/showcase-art";
import { portfolioArtwork } from "@/demos/portfolio-art";
import styles from "./tumblr-theme.module.css";

type PhotoPost = Extract<TumblrPost, { kind: "photo" }>;
const kinds = ["all", "photo", "text", "quote"] as const;
type PostKind = typeof kinds[number];

function searchableText(post: TumblrPost) {
  const content = post.kind === "quote"
    ? [post.quote, post.source]
    : [post.title, post.kind === "photo" ? post.caption : post.body];

  return [...content, ...post.tags].join(" ").toLowerCase();
}

function PostCard({ post, activeTag, onTag, onPhoto }: {
  post: TumblrPost;
  activeTag: string | null;
  onTag?: (tag: string) => void;
  onPhoto?: (post: PhotoPost) => void;
}) {
  const photo = post.kind === "photo" && (
    // eslint-disable-next-line @next/next/no-img-element -- The standalone preview uses the original file for the full-size viewer.
    <img className={styles.postMedia} src={post.art.src} alt={post.alt} width={post.art.width}
      height={post.art.height} loading="lazy" decoding="async" />
  );

  return (
    <article className={styles.post} data-kind={post.kind}>
      {post.kind === "photo" && (onPhoto ? (
        <button type="button" className={styles.photoButton} onClick={() => onPhoto(post)}
          aria-label={`Enlarge photo: ${post.title}`} aria-haspopup="dialog">
          {photo}
          <span className={styles.enlarge} aria-hidden="true"><Maximize2 size={16} /></span>
        </button>
      ) : photo)}
      <div className={styles.postBody}>
        <p className={styles.postKind}>{post.kind}</p>
        {post.kind === "quote" ? (
          <>
            <blockquote className={styles.quote}>“{post.quote}”</blockquote>
            <p className={styles.quoteSource}>— {post.source}</p>
          </>
        ) : (
          <>
            <h2 className={styles.postTitle}>{post.title}</h2>
            <p className={styles.postText}>{post.kind === "photo" ? post.caption : post.body}</p>
          </>
        )}
        <ul className={styles.tags} aria-label="Post tags">
          {post.tags.map((tag) => (
            <li key={tag}>{onTag ? (
              <button type="button" className={styles.tag} aria-pressed={activeTag === tag} onClick={() => onTag(tag)}>#{tag}</button>
            ) : <span className={styles.tag}>#{tag}</span>}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function PhotoViewer({ post, onClose }: { post: PhotoPost; onClose: () => void }) {
  const modal = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = modal.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog ref={modal} aria-labelledby={titleId} className={styles.dialog} onClose={onClose}>
      <form method="dialog" className={styles.dialogTop}>
        <h2 id={titleId}>{post.title}</h2>
        <button type="submit" aria-label="Close photo" autoFocus><X size={21} aria-hidden="true" /></button>
      </form>
      {/* eslint-disable-next-line @next/next/no-img-element -- Display the complete, uncropped artwork. */}
      <img src={post.art.src} alt={post.alt} width={post.art.width} height={post.art.height} />
      <p>{post.caption}</p>
    </dialog>
  );
}

export function TumblrTheme({ template, interactive = true }: { template: TumblrTemplate; interactive?: boolean }) {
  const { palette, blog } = template;
  const [kind, setKind] = useState<PostKind>("all");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PhotoPost | null>(null);
  const searchId = useId();
  const searchInput = useRef<HTMLInputElement>(null);
  const artwork = portfolioArtwork[template.slug];
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = kind !== "all" || terms.length > 0 || tag !== null;
  const posts = template.posts.filter(post =>
    (kind === "all" || post.kind === kind) &&
    (!tag || post.tags.includes(tag)) &&
    terms.every(term => searchableText(post).includes(term)),
  );

  function clearFilters() {
    setKind("all");
    setQuery("");
    setTag(null);
    searchInput.current?.focus();
  }

  const shellStyle = {
    "--blog-ink": palette.ink,
    "--blog-soft": palette.soft,
    "--blog-accent": palette.accent,
    "--blog-surface": palette.surface,
    "--blog-panel": palette.panel,
    "--blog-chip": palette.chip,
    "--blog-glow": palette.glow,
    "--cover": `url(${showcaseArt.tulips})`,
    "--paper": `url(${showcaseArt.gingham})`,
    "--divider": `url(${showcaseArt.clover})`,
    "--plate": `url(${artwork.src})`,
  } as CSSProperties;

  return (
    <div className={styles.shell} style={shellStyle} data-layout={template.layout} inert={!interactive || undefined}>
      <header className={styles.header}>
        <div className={styles.headerBody}>
          <div className={styles.identity}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Use the same local avatar in the full demo and portfolio thumbnail. */}
            <img className={styles.avatar} src={blog.avatar.src} alt="" width={blog.avatar.width} height={blog.avatar.height} />
            <p className={styles.handle}>{blog.handle}</p>
          </div>
          <h1 className={styles.blogTitle}>{blog.title}</h1>
          <p className={styles.tagline}>{blog.tagline}</p>
          <span className={styles.status}>{blog.status}</span>
        </div>
        <div className={styles.cover} aria-hidden="true" />
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="About this blog">
          <div id={`${template.slug}-about`}>
            <h2>About</h2>
            <p className={styles.aboutText}>{template.about}</p>
          </div>
          <div>
            <h2>Links</h2>
            <dl className={styles.links}>
              {template.links.map(({ label, detail }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  {detail && <dd>{detail}</dd>}
                </div>
              ))}
            </dl>
          </div>
        </aside>

        <section className={styles.journal} id={`${template.slug}-posts`} aria-label="Blog posts">
          {interactive && (
            <div className={styles.tools}>
              <div className={styles.controlRow}>
                <div className={styles.nav} role="group" aria-label="Filter posts">
                  {kinds.map(option => (
                    <button key={option} type="button" aria-pressed={kind === option} onClick={() => setKind(option)}>
                      {option}
                    </button>
                  ))}
                </div>
                <label className={styles.search} htmlFor={searchId}>
                  <Search size={17} aria-hidden="true" />
                  <input ref={searchInput} id={searchId} type="search" aria-label="Search posts" placeholder="Search posts…" value={query}
                    onChange={event => setQuery(event.target.value)} />
                </label>
              </div>
              <div className={styles.results}>
                <p aria-live="polite" aria-atomic="true">{posts.length} {posts.length === 1 ? "post" : "posts"}</p>
                {tag && <button type="button" onClick={() => setTag(null)} aria-label={`Remove tag ${tag}`}>#{tag} <X size={13} aria-hidden="true" /></button>}
                {filtered && <button className={styles.reset} type="button" onClick={clearFilters}>Clear filters</button>}
              </div>
            </div>
          )}

          {posts.length ? (
            <div className={styles.feed}>
              {posts.map(post => (
                <PostCard key={post.kind === "quote" ? post.quote : post.title} post={post} activeTag={tag}
                  onTag={interactive ? nextTag => setTag(tag === nextTag ? null : nextTag) : undefined}
                  onPhoto={interactive ? setPhoto : undefined} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <ImageIcon size={22} aria-hidden="true" />
              <p>No posts match those filters.</p>
            </div>
          )}
        </section>
      </div>

      <footer className={styles.footerNote}>
        theme by scriptmoth
        {interactive && <div className={styles.downloads}>
          <a href={`/assets/portfolio/${template.slug}/tumblr-theme.txt`} download>Download Tumblr HTML</a>
        </div>}
      </footer>
      {photo && <PhotoViewer post={photo} onClose={() => setPhoto(null)} />}
    </div>
  );
}
