"use client";

import { useState, type CSSProperties } from "react";
import type { ToyhouseSection, ToyhouseTemplate } from "@/demos/toyhouse/toyhouse-templates";
import { portfolioArtwork } from "@/demos/portfolio-art";
import styles from "./toyhouse-profile.module.css";

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

function SectionBody({ section, palette }: {
  section: ToyhouseSection;
  palette: ToyhouseTemplate["palette"];
}) {
  switch (section.kind) {
    case "about":
      return (
        <div className="row no-gutters">
          <div className={section.sideArt ? "col-8 pr-2" : "col-12"}>
            <h3 className="mb-2" style={{ fontSize: "1.05rem", fontWeight: 700, color: palette.ink }}>
              {section.title ?? "About"}
            </h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-2" style={{ fontSize: "0.92rem", lineHeight: 1.6, color: palette.ink }}>
                {highlight(paragraph, section.accentWords, palette.accent)}
              </p>
            ))}
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
                  style={{ width: "100%", height: 110, objectFit: "contain", display: "block" }}
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
            </div>
          ))}
        </>
      );
  }
}


function ProfileFacts({ template, horizontal }: { template: ToyhouseTemplate; horizontal?: boolean }) {
  const { bio, palette, character } = template;
  return (
    <dl className={horizontal ? "row no-gutters m-0" : "m-0"}>
      {[...bio, { label: horizontal ? "First sighting" : "Member since", value: character.joined }].map(({ label, value }) => (
        <div key={label} className={horizontal ? "col-6 col-sm-4 col-lg py-2 px-3" : "d-flex justify-content-between py-2"} style={{ borderBottom: `1px solid ${palette.line}`, gap: 8 }}>
          <dt style={{ color: palette.soft, fontSize: ".76rem", fontWeight: 500 }}>{label}</dt>
          <dd className="m-0" style={{ fontWeight: 700, fontSize: ".84rem" }}>{value.replace(/^Joined /, "")}</dd>
        </div>
      ))}
    </dl>
  );
}

function Connections({ template }: { template: ToyhouseTemplate }) {
  const { palette, friends, tags, layout } = template;
  return (
    <>
      <h2 className="mt-3 mb-2" style={{ color: palette.ink, fontSize: "1rem" }}>{layout === "festival" ? "Travel companions" : "Studio friends"}</h2>
      <ul className="list-unstyled d-flex flex-wrap m-0" style={{ gap: ".6rem" }}>
        {friends.map((friend) => (
          <li key={friend.name} className="d-inline-flex align-items-center" style={{ gap: ".35rem", fontSize: ".8rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={friend.art.src} alt="" width={30} height={30} style={{ objectFit: "contain", borderRadius: "50%", background: palette.accentSoft }} />
            {friend.name}
          </li>
        ))}
      </ul>
      <ul className="list-unstyled d-flex flex-wrap mt-3 mb-0" aria-label="Tags" style={{ gap: ".4rem" }}>
        {tags.map((tag) => <li key={tag} className="px-2 py-1" style={{ background: palette.accentSoft, color: palette.ink, fontSize: ".73rem" }}>{tag}</li>)}
      </ul>
    </>
  );
}

export function ToyhouseProfile({ template, interactive = true, native = false }: {
  template: ToyhouseTemplate;
  interactive?: boolean;
  native?: boolean;
}) {
  const [active, setActive] = useState(0);
  const { palette, character } = template;
  const festival = template.layout === "festival";
  const portrait = portfolioArtwork[template.slug];
  const prefix = template.slug;
  const titleSize = festival ? "2.65rem" : "2.25rem";
  const titleStyle: CSSProperties = { fontFamily: "Georgia, serif", fontSize: titleSize, lineHeight: 1.08, color: palette.ink };
  const smallStyle: CSSProperties = { fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".13em", color: palette.soft };
  const portraitStyle: CSSProperties = { display: "block", objectFit: "contain", width: "100%", height: festival ? 230 : 122 };

  const characterPortrait = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={character.art.src} alt={character.name} width={character.art.width} height={character.art.height} style={portraitStyle} />
  );

  const sections = (
    <div className={festival ? "p-3 p-md-4" : "col-md-8 order-1 order-md-2 p-3 p-md-4"} style={{ background: palette.page }}>
      <ul className={native ? "nav nav-tabs flex-wrap mb-3" : "nav flex-wrap mb-3"} aria-label={festival ? "Courier dossier sections" : "Studio journal sections"} style={{ gap: ".4rem", borderBottom: `1px solid ${palette.line}` }}>
        {template.sections.map((entry, index) => {
          const id = `${prefix}-section-${index}`;
          const selected = active === index;
          const linkClass = `nav-link px-2 px-sm-3 py-2 ${selected ? "active" : ""}`;
          const linkStyle: CSSProperties = { color: palette.ink, fontSize: ".82rem", fontWeight: 700, textDecoration: "none" };
          return (
            <li key={entry.label} className="nav-item">
              {native ? (
                <a href={`#${id}`} className={linkClass} data-toggle="tab" style={linkStyle}>{entry.label}</a>
              ) : (
                <a href={`#${id}`} className={linkClass} style={linkStyle} aria-current={selected ? "true" : undefined}
                  aria-controls={id} onClick={(event) => { event.preventDefault(); setActive(index); }}>
                  {entry.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <div className="tab-content" style={{ minHeight: 125 }}>
        {template.sections.map((entry, index) => (
          <section key={entry.label} className={`tab-pane ${active === index ? "show active" : ""}`} id={`${prefix}-section-${index}`} aria-label={entry.label}>
            {entry.kind !== "about" && <h3 className="mb-3" style={{ ...titleStyle, fontSize: "1.25rem" }}>{entry.label}</h3>}
            <SectionBody section={entry} palette={palette} />
          </section>
        ))}
      </div>
    </div>
  );

  return (
    <div className={native ? "mx-auto" : `mx-auto ${styles.profile}`} style={{ maxWidth: 900, background: palette.panel, color: palette.ink, border: `1px solid ${palette.line}`, fontFamily: "system-ui, sans-serif" }} inert={!interactive || undefined}>
      {festival ? (
        <>
          <header className="row no-gutters align-items-stretch" style={{ borderBottom: `4px double ${palette.line}` }}>
            <figure className="col-sm-5 d-flex flex-column align-items-center justify-content-end px-3 pt-3 pb-2 m-0" style={{ background: palette.accentSoft }}>
              {characterPortrait}
              <figcaption className="mt-2" style={smallStyle}>Wishmail Post · Field portrait</figcaption>
            </figure>
            <div className="col-sm-7 p-3 p-md-4" style={{ background: palette.page }}>
              <p className="mb-2" style={smallStyle}>Lantern Festival · Courier dossier</p>
              <h1 className="mb-1" style={titleStyle}>{character.name}</h1>
              <p className="mb-2" style={{ color: palette.soft, fontWeight: 600 }}>{character.handle} · {character.status}</p>
              <p className="mb-3">{template.blurb}</p>
              <figure className="m-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={portrait.src} alt="Travelers on a moonlit post road" width={portrait.width} height={portrait.height} className="img-fluid" style={{ width: "100%", maxHeight: 142, objectFit: "contain", objectPosition: "left center" }} />
                <figcaption style={{ ...smallStyle, textTransform: "none", letterSpacing: ".04em" }}>The moonlit post road</figcaption>
              </figure>
            </div>
          </header>
          <ProfileFacts template={template} horizontal />
          {sections}
          <aside className="px-3 px-md-4 pb-3 pt-1" style={{ borderTop: `1px solid ${palette.line}` }}><Connections template={template} /></aside>
        </>
      ) : (
        <>
          <header className={native ? "p-3 p-md-4" : `p-3 p-md-4 ${styles.coast}`} style={{ backgroundColor: "#d6edf0", borderBottom: `1px solid ${palette.line}` }}>
            <div className="d-flex align-items-center flex-wrap" style={{ gap: "1rem" }}>
              <div className="p-1" style={{ width: 112, background: "#f5fdfb", border: `1px solid ${palette.line}` }}>{characterPortrait}</div>
              <div className="p-2" style={{ background: "#edf9f5", color: palette.ink }}>
                <p className="mb-2" style={smallStyle}>Soft Atelier · Studio by the sea</p>
                <h1 className="mb-1" style={titleStyle}>{character.name}</h1>
                <p className="mb-0" style={{ color: palette.soft, fontWeight: 600 }}>{character.handle} · {character.status}</p>
              </div>
              {!native && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.fishStamp} src="/assets/portfolio/soft-atelier/blue-fish.png" alt="" width={46} height={46} />
              )}
            </div>
          </header>
          <div className="row no-gutters">
            <div className="col-md-4 order-2 order-md-1 p-3" style={{ borderRight: `1px solid ${palette.line}` }}>
              <p className="mb-3" style={{ fontFamily: "Georgia, serif" }}>{template.blurb}</p>
              <ProfileFacts template={template} />
              <Connections template={template} />
            </div>
            {sections}
          </div>
        </>
      )}
      {!native && interactive && (
        <p className={`m-0 p-3 ${styles.download}`} style={{ borderTop: `1px solid ${palette.line}` }}>
          <a href={`/assets/portfolio/${template.slug}/toyhouse-profile.txt`} download>Download Toyhouse HTML</a>
        </p>
      )}
    </div>
  );
}
