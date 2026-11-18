"use client";

import { useState, type CSSProperties } from "react";
import type { TumblrPost, TumblrTemplate } from "@/data/tumblr-templates";
import styles from "./tumblr-theme.module.css";

function PostCard({ post }: { post: TumblrPost }) {
  return (
    <article className={styles.post}>
      {post.kind === "photo" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.postMedia}
          src={post.art.src}
          alt=""
          width={post.art.width}
          height={post.art.height}
        />
      )}
      <div className={styles.postBody}>
        <p className={styles.postKind}>{post.kind}</p>
        {post.kind === "photo" && (
          <>
            <h3 className={styles.postTitle}>{post.title}</h3>
            <p className={styles.postCaption}>{post.caption}</p>
          </>
        )}
        {post.kind === "text" && (
          <>
            <h3 className={styles.postTitle}>{post.title}</h3>
            <p className={styles.postText}>{post.body}</p>
          </>
        )}
        {post.kind === "quote" && (
          <blockquote className={styles.quote}>
            “{post.quote}”
            <cite>— {post.source}</cite>
          </blockquote>
        )}
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function TumblrTheme({ template, interactive = true }: { template: TumblrTemplate; interactive?: boolean }) {
  const { palette, blog } = template;
  const [filter, setFilter] = useState<"all" | TumblrPost["kind"]>("all");
  const fontFamily = template.font === "soft"
    ? "'Trebuchet MS', 'Segoe UI', 'Lucida Grande', sans-serif"
    : "Georgia, 'Palatino Linotype', 'Book Antiqua', serif";

  const posts = filter === "all" ? template.posts : template.posts.filter((post) => post.kind === filter);

  const shellStyle = {
    "--ink": palette.ink,
    "--soft": palette.soft,
    "--accent": palette.accent,
    "--surface": palette.surface,
    "--panel": palette.panel,
    "--chip": palette.chip,
    "--glow": palette.glow,
    "--font": fontFamily,
    "--header-image": blog.header ? `url(${blog.header.src})` : "none",
  } as CSSProperties;

  return (
    <div className={styles.shell} style={shellStyle} data-layout={template.layout} data-font={template.font} aria-label={`${blog.title}: ${template.useCase}`}>
      <header className={styles.header}>
        <div className={styles.headerBody}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.avatar} src={blog.avatar.src} alt="" width={blog.avatar.width} height={blog.avatar.height} />
          <div>
            <h2 className={styles.blogTitle}>{blog.title}</h2>
            <p className={styles.handle}>{blog.handle}</p>
            <p className={styles.tagline}>{blog.tagline}</p>
            <span className={styles.status}>{blog.status}</span>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div>
            <p className={styles.aboutLabel}>about</p>
            <p className={styles.aboutText}>{template.about}</p>
          </div>
          <div>
            <p className={styles.sectionLabel}>links</p>
            <div className={styles.links}>
              {template.links.map(({ label, detail }) => (
                <div key={label} className={styles.link}>
                  <span>
                    <strong>{label}</strong>
                    {detail && <small>{detail}</small>}
                  </span>
                  <span aria-hidden="true">↗</span>
                </div>
              ))}
            </div>
          </div>
          {interactive && (
            <div>
              <p className={styles.sectionLabel}>filter</p>
              <div className={styles.nav} role="group" aria-label="Filter posts">
                {(["all", "photo", "text", "quote"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={filter === kind}
                    onClick={() => setFilter(kind)}
                  >
                    {kind}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className={styles.feed}>
          {posts.map((post, index) => (
            <PostCard key={`${post.kind}-${index}`} post={post} />
          ))}
        </div>
      </div>

      <p className={styles.footerNote}>theme by scriptmoth · tumblr-ready</p>
    </div>
  );
}
