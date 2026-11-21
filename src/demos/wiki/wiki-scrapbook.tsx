"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Heart, Search, Shuffle } from "lucide-react";
import {
  findWikiCharacter, findWikiPlace, wikiCharacters, wikiPlaces, wikiTags, wikiTimeline, wikiWorld,
  type WikiCharacter, type WikiPlace,
} from "@/demos/wiki/wiki-templates";
import type { Artwork } from "@/lib/assets";
import { portfolioArtwork } from "@/demos/portfolio-art";
import { eventsForCharacter, eventsForPlace, filterCharacters, Pic, timelineEras, useWikiSearch, type Go, type SkinProps } from "./wiki-core";
import s from "./wiki-scrapbook.module.css";

/** Pastel scrapbook OC directory: taped polaroids, sticker tags, sticky notes, postcards, diary timeline. */

const pastels = ["#ffd6e5", "#e6dcff", "#d4f3e6", "#fff1c2", "#d6ecff", "#ffe2cc"];
const pastel = (i: number) => pastels[i % pastels.length];
const tilt = (i: number) => [-3, 2, -1.5, 3, -2.5, 1][i % 6];
const vars = (v: Record<string, string | number>) => v as CSSProperties;

function Polaroid({ art, caption, index, onClick, size = "md", alt = "" }: { art: Artwork; caption: string; index: number; onClick?: () => void; size?: "sm" | "md" | "lg"; alt?: string }) {
  const body = (
    <>
      <span className={s.tape} style={vars({ "--tape": pastel(index + 2) })} aria-hidden="true" />
      <span className={s.photo} style={vars({ "--bg": pastel(index) })}><Pic art={art} alt={alt} /></span>
      <span className={s.caption}>{caption}</span>
    </>
  );
  const style = vars({ "--tilt": `${tilt(index)}deg` });
  return onClick
    ? <button type="button" className={s.polaroid} data-size={size} style={style} onClick={onClick}>{body}</button>
    : <figure className={s.polaroid} data-size={size} style={style}>{body}</figure>;
}

function Sticker({ tag, index, go, active }: { tag: string; index: number; go: Go; active?: boolean }) {
  return (
    <button type="button" className={s.sticker} aria-pressed={active} style={vars({ "--bg": pastel(index), "--tilt": `${tilt(index + 1) / 2}deg` })}
      onClick={() => go(active ? { view: "characters" } : { view: "characters", tag })}>
      {tag.replace(/-/g, " ")}
    </button>
  );
}

function Heading({ children, doodle = "✿" }: { children: ReactNode; doodle?: string }) {
  return <h2 className={s.heading}>{children} <span aria-hidden="true">{doodle}</span></h2>;
}

/* ---------- pages ---------- */

function Home({ go }: { go: Go }) {
  const featured = wikiCharacters[2];
  return (
    <>
      <div className={s.homeTop}>
        <div className={s.scrapOpening}>
          <div className={s.note} style={vars({ "--bg": "#fff1c2", "--tilt": "-2deg" })}>
            <p className={s.hand}>hi, welcome in! ♡</p>
            <p>{wikiWorld.intro}</p>
            <p className={s.hand}>— {wikiCharacters.length} ocs · {wikiPlaces.length} places · {wikiTimeline.length} diary entries</p>
          </div>
          <figure className={s.pressedPostcard}>
            <Pic art={portfolioArtwork["petal-index"]} alt="A figure in an orchard in bloom" lazy={false} />
            <figcaption>First blossoms for the spring page</figcaption>
          </figure>
        </div>
        <div className={s.featured}>
          <span className={s.badge}>oc of the month!</span>
          <Polaroid art={featured.art} caption={featured.name} index={1} size="lg" onClick={() => go({ view: "character", slug: featured.slug })} />
        </div>
      </div>

      <Heading>meet the cast</Heading>
      <ul className={s.wall}>
        {wikiCharacters.map((c, i) => (
          <li key={c.slug}><Polaroid art={c.art} caption={c.name} index={i} onClick={() => go({ view: "character", slug: c.slug })} /></li>
        ))}
      </ul>

      <Heading doodle="✉">postcards from</Heading>
      <ul className={s.postcards}>
        {wikiPlaces.slice(0, 2).map((p, i) => <li key={p.slug}><Postcard place={p} index={i} go={go} /></li>)}
      </ul>

      <Heading doodle="★">sticker drawer</Heading>
      <div className={s.stickers}>{wikiTags().map(({ tag }, i) => <Sticker key={tag} tag={tag} index={i} go={go} />)}</div>
    </>
  );
}

function Cast({ go, tag }: { go: Go; tag?: string }) {
  const [query, setQuery] = useState("");
  const shown = filterCharacters(query, tag);
  return (
    <>
      <h1 className={s.pageTitle}>the cast <span aria-hidden="true">♡</span></h1>
      <p className={s.lede}>tap a sticker to sort by tag, or search for someone.</p>
      <div className={s.stickers}>{wikiTags().map(({ tag: t }, i) => <Sticker key={t} tag={t} index={i} go={go} active={tag === t} />)}</div>
      <label className={s.pill}>
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">Search the cast</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search the cast…" />
      </label>
      <p className={s.hand} aria-live="polite">{shown.length} of {wikiCharacters.length} {tag ? `with “${tag.replace(/-/g, " ")}”` : "ocs"}</p>
      {shown.length ? (
        <ul className={s.wall}>
          {shown.map((c) => {
            const i = wikiCharacters.indexOf(c);
            return <li key={c.slug}><Polaroid art={c.art} caption={c.name} index={i} onClick={() => go({ view: "character", slug: c.slug })} /><p className={s.under}>{c.title}</p></li>;
          })}
        </ul>
      ) : <p className={s.note} style={vars({ "--bg": "#ffd6e5", "--tilt": "1deg" })}>nobody here yet… try another word!</p>}
    </>
  );
}

function Sheet({ character, go }: { character: WikiCharacter; go: Go }) {
  const index = wikiCharacters.indexOf(character);
  const events = eventsForCharacter(character.slug);
  return (
    <article style={vars({ "--c": character.color })}>
      <button type="button" className={s.backLink} onClick={() => go({ view: "characters" })}>← back to the cast</button>
      <div className={s.sheetTop}>
        <div className={s.sheetPhoto}>
          <Polaroid art={character.art} caption={`${character.name} ♡`} index={index} size="lg" alt={`${character.name} character art`} />
          <span className={s.doodle} aria-hidden="true">✦</span>
        </div>
        <div className={s.aboutCard}>
          <p className={s.hand}>all about…</p>
          <h1 className={s.name}>{character.name}</h1>
          <p className={s.subtitle}>{character.title}</p>
          <p className={s.bubble}>{character.quote}</p>
          <ul className={s.facts}>
            {character.fields.map((f, i) => (
              <li key={f.label} style={vars({ "--bg": pastel(i + index) })}>
                <span>{f.label.toLowerCase()}</span>
                {f.label === "Home"
                  ? <button type="button" onClick={() => go({ view: "place", slug: character.home })}>{f.value}</button>
                  : <strong>{f.value}</strong>}
              </li>
            ))}
          </ul>
          <div className={s.stickers}>{character.tags.map((t, i) => <Sticker key={t} tag={t} index={i + index} go={go} />)}</div>
        </div>
      </div>

      <div className={s.notes}>
        {character.sections.map((section, i) => (
          <section key={section.id} className={s.note} style={vars({ "--bg": pastel(i + index + 1), "--tilt": `${tilt(i) / 2}deg` })}>
            <h2 className={s.noteTitle}>{section.title.toLowerCase()}</h2>
            {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
        <section className={s.note} style={vars({ "--bg": "#fff", "--tilt": "1deg" })}>
          <h2 className={s.noteTitle}>fun facts</h2>
          <ul className={s.hearts}>{character.trivia.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      </div>

      <Heading doodle="♡">friends &amp; foes</Heading>
      <ul className={s.friends}>
        {character.relations.map((relation) => {
          const other = findWikiCharacter(relation.slug);
          return other && (
            <li key={other.slug}>
              <button type="button" onClick={() => go({ view: "character", slug: other.slug })} style={vars({ "--c": other.color })}>
                <span className={s.circle}><Pic art={other.art} /></span>
                <strong>{other.name}</strong>
                <span className={s.hand}>{relation.bond.toLowerCase()}</span>
                <small>{relation.note}</small>
              </button>
            </li>
          );
        })}
      </ul>

      {events.length > 0 && (
        <>
          <Heading doodle="✎">diary mentions</Heading>
          <ul className={s.mentions}>{events.map((e) => <li key={e.title}><span className={s.date}>{e.year}</span> {e.text}</li>)}</ul>
        </>
      )}

      <Heading doodle="✿">photo album</Heading>
      <ul className={s.album}>
        {character.gallery.map((item, i) => <li key={item.caption}><Polaroid art={item.art} caption={item.caption.toLowerCase()} index={i + index + 3} alt={item.caption} /></li>)}
      </ul>
    </article>
  );
}

function Postcard({ place, index, go }: { place: WikiPlace; index: number; go: Go }) {
  return (
    <button type="button" className={s.postcard} style={vars({ "--tilt": `${tilt(index) / 2}deg`, "--bg": pastel(index + 3) })} onClick={() => go({ view: "place", slug: place.slug })}>
      <span className={s.postImage} style={{ backgroundImage: `url(${place.art.src})` }}>
        <span className={s.greetings}>greetings from<strong>{place.name}</strong></span>
      </span>
      <span className={s.postBack}>
        <span className={s.stamp} aria-hidden="true">{place.name.replace(/^The /, "")[0]}</span>
        <span className={s.hand}>{place.summary}</span>
        <span className={s.lines} aria-hidden="true"><span /><span /><span /></span>
        <small>{place.region.toLowerCase()} · {place.kind.toLowerCase()}</small>
      </span>
    </button>
  );
}

function Places({ go }: { go: Go }) {
  return (
    <>
      <h1 className={s.pageTitle}>places <span aria-hidden="true">✉</span></h1>
      <p className={s.lede}>postcards from every corner of the routes.</p>
      <ul className={s.postcards}>{wikiPlaces.map((p, i) => <li key={p.slug}><Postcard place={p} index={i} go={go} /></li>)}</ul>
    </>
  );
}

function Place({ place, go }: { place: WikiPlace; go: Go }) {
  const events = eventsForPlace(place.slug);
  const index = wikiPlaces.indexOf(place);
  return (
    <article>
      <button type="button" className={s.backLink} onClick={() => go({ view: "places" })}>← back to places</button>
      <div className={s.placeHero} style={{ backgroundImage: `url(${place.art.src})` }}>
        <span className={s.tape} style={vars({ "--tape": pastel(index) })} aria-hidden="true" />
        <span className={s.greetings}>greetings from<strong>{place.name}</strong></span>
      </div>
      <div className={s.notes}>
        <section className={s.note} style={vars({ "--bg": pastel(index + 1), "--tilt": "-1deg" })}>
          <h2 className={s.noteTitle}>about this place</h2>
          <p>{place.summary}</p>
          {place.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </section>
        {events.length > 0 && (
          <section className={s.note} style={vars({ "--bg": "#fff", "--tilt": "1deg" })}>
            <h2 className={s.noteTitle}>what happened here</h2>
            <ul className={s.mentions}>{events.map((e) => <li key={e.title}><span className={s.date}>{e.year}</span> {e.text}</li>)}</ul>
          </section>
        )}
      </div>
      <Heading doodle="♡">who lives here</Heading>
      <ul className={s.wall}>
        {place.residents.map((slug) => findWikiCharacter(slug)).filter((c): c is WikiCharacter => !!c).map((c) => (
          <li key={c.slug}><Polaroid art={c.art} caption={c.name} index={wikiCharacters.indexOf(c)} size="sm" onClick={() => go({ view: "character", slug: c.slug })} /></li>
        ))}
      </ul>
    </article>
  );
}

function Diary({ go }: { go: Go }) {
  let n = 0;
  return (
    <>
      <h1 className={s.pageTitle}>the diary <span aria-hidden="true">✎</span></h1>
      <p className={s.lede}>everything that’s happened on the routes, oldest first.</p>
      {timelineEras().map((era) => (
        <section key={era} className={s.diaryEra}>
          <h2 className={s.eraTitle}>{era.toLowerCase()}</h2>
          <ol className={s.diary}>
            {wikiTimeline.filter((e) => e.era === era).map((event) => {
              const i = n++;
              return (
                <li key={event.title} className={s.page} style={vars({ "--tilt": `${tilt(i) / 3}deg` })}>
                  <span className={s.dateTape} style={vars({ "--tape": pastel(i) })}>{event.year.toLowerCase()}</span>
                  <h3>{event.title.toLowerCase()}</h3>
                  <p>{event.text}</p>
                  <p className={s.diaryLinks}>
                    {event.place && <button type="button" onClick={() => go({ view: "place", slug: event.place! })}>📍 {findWikiPlace(event.place)?.name}</button>}
                    {event.characters.map((slug) => <button key={slug} type="button" onClick={() => go({ view: "character", slug })}>♡ {findWikiCharacter(slug)?.name}</button>)}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}

/* ---------- chrome ---------- */

function TinySearch({ go }: { go: Go }) {
  const search = useWikiSearch(go);
  return (
    <div className={s.search} role="search">
      <label className={s.pill}>
        <Heart size={14} aria-hidden="true" />
        <span className="sr-only">Search the index</span>
        <input type="search" value={search.query} onChange={(e) => search.setQuery(e.target.value)} onKeyDown={search.onKeyDown} placeholder="find someone…" autoComplete="off" />
      </label>
      {search.active && (
        <ul className={s.results}>
          {search.results.length ? search.results.map((r, i) => (
            <li key={r.kind + r.slug}>
              <button type="button" style={vars({ "--bg": pastel(i) })} onClick={() => search.open(r.kind, r.slug)}><strong>{r.name}</strong> <span>{r.detail.toLowerCase()}</span></button>
            </li>
          )) : <li className={s.hand}>no one by that name…</li>}
        </ul>
      )}
    </div>
  );
}

export function ScrapbookWiki({ route, go, random }: SkinProps) {
  let page: ReactNode;
  switch (route.view) {
    case "characters": page = <Cast key={route.tag ?? "all"} go={go} tag={route.tag} />; break;
    case "character": {
      const c = findWikiCharacter(route.slug);
      page = c && <Sheet key={c.slug} character={c} go={go} />;
      break;
    }
    case "places": page = <Places go={go} />; break;
    case "place": {
      const p = findWikiPlace(route.slug);
      page = p && <Place key={p.slug} place={p} go={go} />;
      break;
    }
    case "timeline": page = <Diary go={go} />; break;
    default: page = <Home go={go} />;
  }
  const tabs = [
    { label: "home", color: "#ffd6e5", active: route.view === "home", to: { view: "home" } as const },
    { label: "the cast", color: "#e6dcff", active: route.view === "characters" || route.view === "character", to: { view: "characters" } as const },
    { label: "places", color: "#d4f3e6", active: route.view === "places" || route.view === "place", to: { view: "places" } as const },
    { label: "diary", color: "#fff1c2", active: route.view === "timeline", to: { view: "timeline" } as const },
  ];

  return (
    <div className={s.root}>
      <header className={s.header}>
        <button type="button" className={s.titleTape} onClick={() => go({ view: "home" })}>lantern routes <span aria-hidden="true">♡</span> oc index</button>
        <p className={s.hand}>a little book of ocs, places &amp; memories</p>
      </header>
      <div className={s.tabRow}>
        <nav className={s.tabs} aria-label="Index">
          {tabs.map((t) => (
            <button key={t.label} type="button" aria-current={t.active ? "page" : undefined} style={vars({ "--bg": t.color })} onClick={() => go(t.to)}>{t.label}</button>
          ))}
          <button type="button" style={vars({ "--bg": "#d6ecff" })} onClick={random}><Shuffle size={13} aria-hidden="true" /> surprise me</button>
        </nav>
        <TinySearch go={go} />
      </div>
      <main className={s.sheet}>{page}</main>
      <footer className={s.foot}>made with ♡ · {wikiWorld.owner}</footer>
    </div>
  );
}
