import type { CSSProperties } from "react";
import type { ToyhouseSection, ToyhouseTemplate } from "@/data/toyhouse-templates";
import styles from "./toyhouse-profile.module.css";

/**
 * Softblog Toyhouse profile — banner, overlapping round avatar, sidebar, feed tabs.
 * Bootstrap 4 + inline styles so the delivered code pastes into Toyhouse cleanly.
 */

function highlight(text: string, words: string[] = [], accent: string) {
  if (!words.length) return text;
  const pattern = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, index) =>
    words.some((word) => word.toLowerCase() === part.toLowerCase())
      ? <span key={index} style={{ color: accent, fontWeight: 600 }}>{part}</span>
      : <span key={index}>{part}</span>,
  );
}

function SectionBody({ section, palette, interactive }: {
  section: ToyhouseSection;
  palette: ToyhouseTemplate["palette"];
  interactive: boolean;
}) {
  switch (section.kind) {
    case "about":
      return (
        <div className="row no-gutters">
          <div className={section.sideArt ? "col-8 pr-2" : "col-12"}>
            <h3 className="mb-2" style={{ fontSize: "1.05rem", fontWeight: 700, color: palette.ink }}>
              :: {section.title ?? "about me"}
            </h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-2" style={{ fontSize: "0.92rem", lineHeight: 1.6, color: palette.ink }}>
                {highlight(paragraph, section.accentWords, palette.accent)}
              </p>
            ))}
            <p className="mb-0 mt-3" style={{ fontSize: "0.72rem", color: palette.soft }}>Posted just now · ♡ · ↺</p>
          </div>
          {section.sideArt && (
            <div className="col-4 text-right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.sideArt.src}
                alt=""
                width={section.sideArt.width}
                height={section.sideArt.height}
                style={{ maxWidth: "100%", height: 160, objectFit: "contain", objectPosition: "bottom right" }}
              />
            </div>
          )}
        </div>
      );
    case "stats":
      return (
        <div className="p-1">
          {section.stats.map(({ label, value }, index) => (
            <div key={label}>
              <div className="d-flex justify-content-between py-2">
                <span style={{ color: palette.soft, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                <span style={{ color: palette.ink, fontWeight: 600 }}>{value}</span>
              </div>
              {index < section.stats.length - 1 && <hr className="my-0" style={{ borderColor: palette.line }} />}
            </div>
          ))}
        </div>
      );
    case "list":
      return (
        <ul className="mb-0 pl-3">
          {section.items.map((item) => (
            <li key={item} className="mb-2" style={{ color: palette.ink, fontSize: "0.92rem" }}>{item}</li>
          ))}
        </ul>
      );
    case "roster":
      return (
        <div>
          {section.roster.map((entry) => (
            <div key={entry.name} className="mb-2" style={{ border: `1px solid ${palette.line}`, background: palette.page }}>
              <div className="px-2 py-1" style={{ background: palette.headerBar, color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>
                {entry.name} <span style={{ fontWeight: 500, opacity: 0.9 }}>— {entry.title}</span>
              </div>
              <div className="d-flex p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.art.src}
                  alt=""
                  width={72}
                  height={72}
                  style={{ width: 72, height: 72, objectFit: "cover", objectPosition: "center top", borderRadius: 4, flex: "0 0 72px" }}
                />
                <div className="pl-2 flex-grow-1" style={{ fontSize: "0.78rem" }}>
                  <div className="row no-gutters">
                    {entry.stats.map((stat) => (
                      <div key={stat.label} className="col-6 mb-1">
                        <span style={{ color: palette.soft }}>{stat.label}: </span>
                        <strong style={{ color: palette.ink }}>{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: palette.accent }}>♡♡♡ · ✦✦</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    case "gallery":
      return (
        <div className="row no-gutters m-n1">
          {section.gallery.map(({ title, art }) => (
            <div key={title} className="col-6 p-1">
              <div style={{ background: palette.accentSoft, border: `1px solid ${palette.line}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.src}
                  alt=""
                  width={art.width}
                  height={art.height}
                  style={{ width: "100%", height: 110, objectFit: "cover", objectPosition: "center top", display: "block" }}
                />
                <div className="px-2 py-1" style={{ fontSize: "0.75rem", color: palette.soft }}>{title}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case "links":
      return (
        <>
          {section.links.map(({ label, detail }) => (
            <div
              key={label}
              className="d-flex justify-content-between align-items-center mb-2 px-3 py-2"
              style={{ background: palette.page, border: `1px solid ${palette.line}`, borderRadius: 6 }}
            >
              <span>
                <strong style={{ color: palette.ink, display: "block" }}>{label}</strong>
                {detail && <small style={{ color: palette.soft }}>{detail}</small>}
              </span>
              <span style={{ color: palette.accent }} aria-hidden="true">{interactive ? "→" : "→"}</span>
            </div>
          ))}
        </>
      );
  }
}

export function ToyhouseProfile({ template, interactive = true }: { template: ToyhouseTemplate; interactive?: boolean }) {
  const { palette, character } = template;
  const prefix = template.slug.replace(/[^a-z0-9]/gi, "");
  const fontFamily = template.font === "ink"
    ? "Georgia, 'Times New Roman', serif"
    : "Arial, Helvetica, sans-serif";

  const themeVars = {
    "--th-accent": palette.accent,
    "--th-chip": palette.accentSoft,
    "--th-soft": palette.soft,
    "--th-ink": palette.ink,
    "--th-tab-active": palette.tabActive,
  } as CSSProperties;

  return (
    <div className={styles.root} style={themeVars}>
      <div
        className="mx-auto"
        data-layout={template.layout}
        aria-label={`${character.name}: ${template.useCase}`}
        style={{
          fontFamily,
          maxWidth: 920,
          background: palette.page,
          color: palette.ink,
          border: `1px solid ${palette.line}`,
          boxShadow: "0 18px 40px -24px rgba(60,40,90,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Banner */}
        <div
          style={{
            height: 180,
            backgroundImage: `url(${template.banner.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderBottom: `1px solid ${palette.line}`,
          }}
        />

        <div className="row no-gutters">
          {/* Sidebar */}
          <div className="col-lg-3 px-3 pb-3" style={{ background: palette.page, borderRight: `1px solid ${palette.line}` }}>
            <div className="text-center" style={{ marginTop: -58 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={character.art.src}
                alt=""
                width={116}
                height={116}
                style={{
                  width: 116,
                  height: 116,
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  border: `4px solid ${palette.page}`,
                  boxShadow: `0 0 0 1px ${palette.line}`,
                  background: palette.accentSoft,
                }}
              />
            </div>

            <h1 className="mb-0 mt-2 text-center" style={{ fontSize: "1.25rem", fontWeight: 700, color: palette.ink }}>
              {character.name}
            </h1>
            <p className="mb-2 text-center" style={{ color: palette.accent, fontSize: "0.85rem" }}>{character.handle}</p>
            <p className="mb-3 text-center" style={{ color: palette.soft, fontSize: "0.8rem", lineHeight: 1.45 }}>{template.blurb}</p>

            <div className="mb-3" style={{ fontSize: "0.8rem" }}>
              {template.bio.map((row) => (
                <div key={row.label} className="d-flex justify-content-between py-1" style={{ borderBottom: `1px solid ${palette.line}` }}>
                  <span style={{ color: palette.soft }}>{row.label}</span>
                  <span style={{ color: palette.ink, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              <p className="mb-0 mt-2" style={{ color: palette.soft, fontSize: "0.75rem" }}>📅 {character.joined}</p>
            </div>

            <div className="mb-3 p-2" style={{ background: palette.panel, border: `1px solid ${palette.line}`, fontSize: "0.75rem", color: palette.soft }}>
              <strong style={{ color: palette.accent }}>Layout</strong>
              <div className="mt-1">Softblog Toyhouse sample by Scriptmoth. Banner + sidebar + feed tabs.</div>
            </div>

            <div className="mb-3">
              <div className="mb-2" style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: palette.soft }}>Best friends</div>
              {template.friends.map((friend) => (
                <div key={friend.name} className="d-flex align-items-center mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={friend.art.src}
                    alt=""
                    width={28}
                    height={28}
                    style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", objectPosition: "center top", marginRight: 8 }}
                  />
                  <span className="flex-grow-1" style={{ fontSize: "0.82rem", color: palette.ink }}>{friend.name}</span>
                  <span className="px-2 py-1" style={{ fontSize: "0.68rem", color: palette.accent, border: `1px solid ${palette.accent}`, borderRadius: 999 }}>Follow</span>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: palette.soft }}>Current obsessions</div>
              {template.tags.map((tag) => (
                <div key={tag} style={{ color: palette.accent, fontSize: "0.82rem", marginBottom: 2 }}>{tag}</div>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div className="col-lg-9 px-3 py-3" style={{ background: palette.panel }}>
            <div className="mb-2 text-right">
              <span className="px-2 py-1" style={{ fontSize: "0.72rem", color: "#fff", background: palette.accent, borderRadius: 4, fontWeight: 700 }}>
                {character.status}
              </span>
            </div>

            <ul className="nav justify-content-center mb-3" style={{ borderBottom: `1px solid ${palette.line}`, gap: 4 }}>
              {template.sections.map((entry, index) => {
                const id = `${prefix}${index}`;
                const active = index === 0;
                return (
                  <li key={entry.label} className="nav-item">
                    <a
                      href={`#${id}`}
                      className={`nav-link px-3 py-2 ${active ? "active" : ""}`}
                      {...(interactive ? { "data-toggle": "tab" } : {})}
                      style={{
                        color: active ? palette.tabActive : palette.soft,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        borderBottom: active ? `2px solid ${palette.tabActive}` : "2px solid transparent",
                        borderRadius: 0,
                        background: "transparent",
                      }}
                      tabIndex={interactive ? undefined : -1}
                    >
                      {entry.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div
              className="tab-content p-3"
              style={{
                background: palette.page,
                border: `1px solid ${palette.line}`,
                height: 420,
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              {template.sections.map((entry, index) => {
                const id = `${prefix}${index}`;
                return (
                  <div key={entry.label} className={`tab-pane ${index === 0 ? "show active" : ""}`} id={id}>
                    <SectionBody section={entry} palette={palette} interactive={interactive} />
                  </div>
                );
              })}
            </div>

            <p className="mb-0 mt-2 text-right" style={{ color: palette.soft, fontSize: "0.7rem", letterSpacing: "0.06em" }}>
              code by scriptmoth · toyhouse-ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
