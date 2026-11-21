"use client";

import { useState, type ReactNode } from "react";
import {
  findWikiCharacter, findWikiPlace, wikiCharacters, wikiDidYouKnow, wikiPlaces, wikiRecentEdits, wikiTags, wikiTimeline, wikiWorld,
  type WikiCharacter, type WikiPlace,
} from "@/demos/wiki/wiki-templates";
import { assets } from "@/lib/assets";
import { portfolioArtwork } from "@/demos/portfolio-art";
import { eventsForCharacter, eventsForPlace, field, filterCharacters, Pic, tagLabel, timelineEras, useWikiSearch, type Go, type Route, type SkinProps } from "./wiki-core";
import s from "./wiki-encyclopedia.module.css";

/** Classic encyclopedia wiki: page tabs, portlet sidebar, infobox tables, numbered contents, category pages. */

const articleCount = wikiCharacters.length + wikiPlaces.length + 1;

/** Pages that "don't exist yet" render as red links, like a real wiki. */
const redLinks = new Set(["The Wishmail Post", "The Lantern Watch", "Hollowmere Night Market", "Starwell Keepers"]);

function A({ onClick, children, title }: { onClick: () => void; children: ReactNode; title?: string }) {
  return <button type="button" className={s.a} onClick={onClick} title={title}>{children}</button>;
}

function Red({ children }: { children: string }) {
  return <span className={s.red} title={`${children} (page does not exist)`}>{children}</span>;
}

function CharLink({ slug, go, children }: { slug: string; go: Go; children?: ReactNode }) {
  const character = findWikiCharacter(slug);
  return <A onClick={() => go({ view: "character", slug })} title={character?.name}>{children ?? character?.name}</A>;
}

function PlaceLink({ slug, go, children }: { slug: string; go: Go; children?: ReactNode }) {
  const place = findWikiPlace(slug);
  return <A onClick={() => go({ view: "place", slug })} title={place?.name}>{children ?? place?.name}</A>;
}

function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 className={s.h2} data-section={id}>
      {children}
      <span className={s.editsection} aria-hidden="true">[<span>edit</span>]</span>
    </h2>
  );
}

function Toc({ items, onJump }: { items: { id: string; title: string }[]; onJump: (id: string) => void }) {
  const [shown, setShown] = useState(true);
  return (
    <nav className={s.toc} aria-label="Contents">
      <div className={s.tocTitle}>
        <strong>Contents</strong> <span className={s.tocToggle}>[<button type="button" className={s.a} onClick={() => setShown(!shown)}>{shown ? "hide" : "show"}</button>]</span>
      </div>
      {shown && (
        <ol>
          {items.map((item, index) => (
            <li key={item.id}>
              <button type="button" className={s.a} onClick={() => onJump(item.id)}><span className={s.tocNumber}>{index + 1}</span> {item.title}</button>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

function CatLinks({ tags, go, extra = [] }: { tags: string[]; go: Go; extra?: { label: string; route: Route }[] }) {
  return (
    <div className={s.catlinks}>
      <A onClick={() => go({ view: "characters" })}>Categories</A>:
      <ul>
        {extra.map((item) => <li key={item.label}><A onClick={() => go(item.route)}>{item.label}</A></li>)}
        {tags.map((tag) => <li key={tag}><A onClick={() => go({ view: "characters", tag })}>{tagLabel(tag)}</A></li>)}
      </ul>
    </div>
  );
}

function useJump() {
  return (id: string) => document.querySelector(`.${s.content} [data-section="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- pages ---------- */

function MainPage({ go }: { go: Go }) {
  const featured = wikiCharacters[0];
  return (
    <>
      <div className={s.mpWelcome}>
        <div>
          <p className={s.edition}>A reference to the festival towns</p>
          <h1 className={s.mpWelcomeTitle}>Lantern Archive</h1>
          <p>{wikiWorld.intro}</p>
          <p className={s.small}><strong>{articleCount}</strong> articles · <strong>{wikiTimeline.length}</strong> recorded events</p>
          <ul className={s.mpPortals}>
            <li><A onClick={() => go({ view: "characters" })}>Characters</A></li>
            <li><A onClick={() => go({ view: "places" })}>Places</A></li>
            <li><A onClick={() => go({ view: "timeline" })}>Timeline</A></li>
            <li><A onClick={() => go({ view: "characters", tag: "hollowmere" })}>Hollowmere</A></li>
          </ul>
        </div>
        <figure className={s.plate}>
          <Pic art={portfolioArtwork["lantern-archive"]} alt="Travelers on a misty road in a Hiroshige woodblock print" lazy={false} />
          <figcaption>Morning Mist · Utagawa Hiroshige</figcaption>
        </figure>
      </div>

      <div className={s.mpColumns}>
        <div>
          <section className={`${s.mpBox} ${s.mpGreen}`}>
            <h2>From today’s featured article</h2>
            <div className={s.mpBody}>
              <div className={s.mpThumb}><Pic art={featured.art} alt={featured.name} /></div>
              <p>
                <b><CharLink slug={featured.slug} go={go} /></b> is {featured.summary.charAt(0).toLowerCase() + featured.summary.slice(1, -1)}.
                {" "}{featured.sections[2]?.paragraphs[0]}
                {" "}(<CharLink slug={featured.slug} go={go}><b>Full article…</b></CharLink>)
              </p>
            </div>
          </section>
          <section className={`${s.mpBox} ${s.mpGreen}`}>
            <h2>Did you know…</h2>
            <ul className={s.mpBody}>
              {wikiDidYouKnow.map((fact) => (
                <li key={fact.slug}>… that <b><CharLink slug={fact.slug} go={go} /></b> {fact.text}?</li>
              ))}
            </ul>
          </section>
        </div>
        <div>
          <section className={`${s.mpBox} ${s.mpBlue}`}>
            <h2>Recent changes</h2>
            <ul className={s.mpBody}>
              {wikiRecentEdits.map((edit) => (
                <li key={edit.page + edit.change}>
                  <A onClick={() => go(edit.kind === "timeline" ? { view: "timeline" } : { view: edit.kind, slug: edit.slug })}>{edit.page}</A>
                  {" "}— {edit.change.toLowerCase()} <span className={s.muted}>({edit.when})</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={`${s.mpBox} ${s.mpBlue}`}>
            <h2>On this day in history</h2>
            <ul className={s.mpBody}>
              {wikiTimeline.slice(-3).map((event) => (
                <li key={event.title}>
                  <b>{event.year}</b> – {event.text.replace(/\.$/, "")}
                  {event.place && <> (<PlaceLink slug={event.place} go={go} />)</>}
                </li>
              ))}
            </ul>
            <p className={`${s.mpBody} ${s.small}`}><A onClick={() => go({ view: "timeline" })}>More events…</A></p>
          </section>
        </div>
      </div>
    </>
  );
}

type SortKey = "name" | "Species" | "Home" | "Occupation";

function CategoryPage({ go, tag }: { go: Go; tag?: string }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const rows = filterCharacters(query, tag).sort((a, b) => {
    const value = (c: WikiCharacter) => (sort.key === "name" ? c.name : field(c.fields, sort.key));
    return value(a).localeCompare(value(b)) * sort.dir;
  });
  const title = tag ? tagLabel(tag) : "Characters";
  const toggle = (key: SortKey) => setSort((current) => ({ key, dir: current.key === key ? (current.dir === 1 ? -1 : 1) : 1 }));
  const letters = [...new Set(rows.map((c) => c.name[0]))];
  const columns: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" }, { key: "Species", label: "Species" }, { key: "Home", label: "Home" }, { key: "Occupation", label: "Occupation" },
  ];

  return (
    <>
      <h1 className={s.h1}><span className={s.ns}>Category:</span>{title}</h1>
      <p className={s.sub}>From {wikiWorld.name}</p>
      <p>{tag
        ? <>This category lists characters tagged <b>{tagLabel(tag)}</b>. See also the <A onClick={() => go({ view: "characters" })}>full list of characters</A>.</>
        : <>This category lists every character article on the wiki. Narrow it down with the filter, or click a column heading to sort the table.</>}
      </p>
      <label className={s.filter}>
        <span>Filter:</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, title, or description" />
      </label>

      <h2 className={s.h2}>Pages in category “{title}”</h2>
      <p>The following {rows.length} page{rows.length === 1 ? " is" : "s are"} in this category, out of {wikiCharacters.length} total.</p>
      {rows.length ? (
        <>
          <div className={s.catColumns}>
            {letters.map((letter) => (
              <div key={letter}>
                <h3>{letter}</h3>
                <ul>{rows.filter((c) => c.name[0] === letter).map((c) => <li key={c.slug}><CharLink slug={c.slug} go={go} /></li>)}</ul>
              </div>
            ))}
          </div>
          <div className={s.tableWrap}>
            <table className={s.wikitable}>
              <caption>Character overview</caption>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} aria-sort={sort.key === column.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
                      <button type="button" onClick={() => toggle(column.key)}>
                        {column.label} <span className={s.sortIcon} aria-hidden="true">{sort.key === column.key ? (sort.dir === 1 ? "▲" : "▼") : "⇅"}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.slug}>
                    <td><b><CharLink slug={c.slug} go={go} /></b></td>
                    <td>{field(c.fields, "Species")}</td>
                    <td><PlaceLink slug={c.home} go={go}>{field(c.fields, "Home")}</PlaceLink></td>
                    <td>{field(c.fields, "Occupation")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <p className={s.muted}><i>There are no pages matching “{query}” in this category.</i></p>}
      <CatLinks tags={wikiTags().map((t) => t.tag).filter((t) => t !== tag).slice(0, 8)} go={go} />
    </>
  );
}

function CharacterArticle({ character, go }: { character: WikiCharacter; go: Go }) {
  const jump = useJump();
  const events = eventsForCharacter(character.slug);
  const toc = [
    ...character.sections.map(({ id, title }) => ({ id, title })),
    { id: "relationships", title: "Relationships" },
    { id: "timeline", title: "Timeline" },
    { id: "trivia", title: "Trivia" },
    { id: "gallery", title: "Gallery" },
    { id: "see-also", title: "See also" },
  ];
  const fieldValue = (label: string, value: string) => {
    if (label === "Home") return <PlaceLink slug={character.home} go={go}>{value}</PlaceLink>;
    if (redLinks.has(value)) return <Red>{value}</Red>;
    return value;
  };

  return (
    <>
      <h1 className={s.h1}>{character.name}</h1>
      <p className={s.sub}>From {wikiWorld.name}, the festival encyclopedia</p>
      <p className={s.hatnote}>This article is about the {character.title.toLowerCase()}. For other uses, see <A onClick={() => go({ view: "characters" })}>List of characters</A>.</p>

      <table className={s.infobox} style={{ "--c": character.color } as React.CSSProperties}>
        <caption className="sr-only">{character.name} infobox</caption>
        <tbody>
          <tr><th colSpan={2} className={s.ibAbove}>{character.name}</th></tr>
          <tr>
            <td colSpan={2} className={s.ibImage}>
              <Pic art={character.art} alt={character.name} lazy={false} />
              <div className={s.ibCaption}>{character.name}, official reference</div>
            </td>
          </tr>
          <tr><th colSpan={2} className={s.ibHeader}>Information</th></tr>
          {character.fields.map((f) => (
            <tr key={f.label}><th scope="row">{f.label}</th><td>{fieldValue(f.label, f.value)}</td></tr>
          ))}
          <tr><th colSpan={2} className={s.ibHeader}>Relations</th></tr>
          {character.relations.slice(0, 3).map((relation) => (
            <tr key={relation.slug}><th scope="row">{relation.bond}</th><td><CharLink slug={relation.slug} go={go} /></td></tr>
          ))}
        </tbody>
      </table>

      <p><b>{character.name}</b> is {character.summary.charAt(0).toLowerCase() + character.summary.slice(1)} {character.name} lives in <PlaceLink slug={character.home} go={go} /> and is known for the saying “{character.quote}”</p>

      <Toc items={toc} onJump={jump} />

      {character.sections.map((section) => (
        <section key={section.id}>
          <H2 id={section.id}>{section.title}</H2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}

      <H2 id="relationships">Relationships</H2>
      <ul>
        {character.relations.map((relation) => (
          <li key={relation.slug}><b><CharLink slug={relation.slug} go={go} /></b> ({relation.bond.toLowerCase()}) — {relation.note}</li>
        ))}
      </ul>

      <H2 id="timeline">Timeline</H2>
      {events.length ? (
        <ul>{events.map((event) => <li key={event.title}><b>{event.year}</b> – {event.text}</li>)}</ul>
      ) : <p className={s.muted}><i>No events have been recorded.</i></p>}
      <p className={s.mainArticle}>Main article: <A onClick={() => go({ view: "timeline" })}>Timeline of the Lantern Routes</A></p>

      <H2 id="trivia">Trivia</H2>
      <ul>{character.trivia.map((item) => <li key={item}>{item}</li>)}</ul>

      <H2 id="gallery">Gallery</H2>
      <ul className={s.gallery}>
        {[{ caption: `${character.name} reference`, art: character.art, portrait: true }, ...character.gallery].map((item) => (
          <li key={item.caption}>
            <div className={s.thumb} data-portrait={"portrait" in item || undefined}><Pic art={item.art} alt={item.caption} /></div>
            <p>{item.caption}</p>
          </li>
        ))}
      </ul>

      <H2 id="see-also">See also</H2>
      <ul>
        <li><PlaceLink slug={character.home} go={go} /></li>
        <li><A onClick={() => go({ view: "characters" })}>List of characters</A></li>
      </ul>

      <CatLinks tags={character.tags} go={go} extra={[{ label: "Characters", route: { view: "characters" } }]} />
    </>
  );
}

function PlacesList({ go }: { go: Go }) {
  return (
    <>
      <h1 className={s.h1}>List of places</h1>
      <p className={s.sub}>From {wikiWorld.name}</p>
      <p>This is a list of towns, roads, and landmarks on the Lantern Routes, from the lower valley to the mountains.</p>
      <div className={s.tableWrap}>
        <table className={s.wikitable}>
          <thead><tr><th>Image</th><th>Name</th><th>Type</th><th>Region</th><th>Notes</th></tr></thead>
          <tbody>
            {wikiPlaces.map((place) => (
              <tr key={place.slug}>
                <td className={s.cellThumb}><Pic art={place.art} alt="" /></td>
                <td><b><PlaceLink slug={place.slug} go={go} /></b></td>
                <td>{place.kind}</td>
                <td>{place.region}</td>
                <td>{place.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CatLinks tags={[]} go={go} extra={[{ label: "Places", route: { view: "places" } }, { label: "Geography", route: { view: "places" } }]} />
    </>
  );
}

function PlaceArticle({ place, go }: { place: WikiPlace; go: Go }) {
  const events = eventsForPlace(place.slug);
  return (
    <>
      <h1 className={s.h1}>{place.name}</h1>
      <p className={s.sub}>From {wikiWorld.name}, the festival encyclopedia</p>
      <table className={s.infobox}>
        <caption className="sr-only">{place.name} infobox</caption>
        <tbody>
          <tr><th colSpan={2} className={s.ibAbove}>{place.name}</th></tr>
          <tr><td colSpan={2} className={s.ibImage}><Pic art={place.art} alt={place.name} lazy={false} /><div className={s.ibCaption}>{place.name} at night</div></td></tr>
          <tr><th scope="row">Type</th><td>{place.kind}</td></tr>
          <tr><th scope="row">Region</th><td>{place.region}</td></tr>
          <tr><th scope="row">Residents</th><td>{place.residents.map((slug, i) => <span key={slug}>{i > 0 && ", "}<CharLink slug={slug} go={go} /></span>)}</td></tr>
        </tbody>
      </table>
      <p><b>{place.name}</b> is a {place.kind.toLowerCase()} in the {place.region}. {place.summary}</p>
      <H2>Description</H2>
      {place.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <H2>Notable residents</H2>
      <ul>{place.residents.map((slug) => <li key={slug}><CharLink slug={slug} go={go} />, {findWikiCharacter(slug)?.title.toLowerCase()}</li>)}</ul>
      {events.length > 0 && (
        <>
          <H2>History</H2>
          <ul>{events.map((event) => <li key={event.title}><b>{event.year}</b> – {event.text}</li>)}</ul>
        </>
      )}
      <CatLinks tags={[]} go={go} extra={[{ label: "Places", route: { view: "places" } }, { label: place.region, route: { view: "places" } }]} />
    </>
  );
}

function TimelineArticle({ go }: { go: Go }) {
  const jump = useJump();
  const eras = timelineEras();
  return (
    <>
      <h1 className={s.h1}>Timeline of the Lantern Routes</h1>
      <p className={s.sub}>From {wikiWorld.name}, the festival encyclopedia</p>
      <p>This is a timeline of major events on the Lantern Routes, counted in years since the first festival lantern was lit in <PlaceLink slug="hollowmere" go={go} />.</p>
      <Toc items={eras.map((era) => ({ id: era, title: era }))} onJump={jump} />
      {eras.map((era) => (
        <section key={era}>
          <H2 id={era}>{era}</H2>
          <div className={s.tableWrap}>
            <table className={s.wikitable}>
              <thead><tr><th>Year</th><th>Event</th><th>Related</th></tr></thead>
              <tbody>
                {wikiTimeline.filter((event) => event.era === era).map((event) => (
                  <tr key={event.title}>
                    <td className={s.nowrap}><b>{event.year}</b></td>
                    <td><b>{event.title}.</b> {event.text}</td>
                    <td>
                      {event.place && <PlaceLink slug={event.place} go={go} />}
                      {event.characters.map((slug) => <span key={slug}>, <CharLink slug={slug} go={go} /></span>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <CatLinks tags={[]} go={go} extra={[{ label: "History", route: { view: "timeline" } }, { label: "Timelines", route: { view: "timeline" } }]} />
    </>
  );
}

/* ---------- chrome ---------- */

function SearchBox({ go }: { go: Go }) {
  const search = useWikiSearch(go);
  return (
    <div className={s.search} role="search">
      <label className="sr-only" htmlFor="enc-search">Search {wikiWorld.name}</label>
      <input id="enc-search" type="search" value={search.query} onChange={(e) => search.setQuery(e.target.value)} onKeyDown={search.onKeyDown} placeholder={`Search ${wikiWorld.name}`} autoComplete="off" />
      <button type="button" onClick={() => search.results[0] && search.open(search.results[0].kind, search.results[0].slug)}>Search</button>
      {search.active && (
        <ul className={s.suggest}>
          {search.results.length
            ? search.results.map((r) => <li key={r.kind + r.slug}><button type="button" onClick={() => search.open(r.kind, r.slug)}><b>{r.name}</b> <span>{r.detail}</span></button></li>)
            : <li className={s.muted}>No pages match. <Red>{search.query.trim()}</Red></li>}
        </ul>
      )}
    </div>
  );
}

export function EncyclopediaWiki({ route, go, random }: SkinProps) {
  let page: ReactNode;
  let pageTab = "Article";
  switch (route.view) {
    case "characters": page = <CategoryPage key={route.tag ?? "all"} go={go} tag={route.tag} />; pageTab = "Category"; break;
    case "character": {
      const character = findWikiCharacter(route.slug);
      page = character && <CharacterArticle key={character.slug} character={character} go={go} />;
      break;
    }
    case "places": page = <PlacesList go={go} />; break;
    case "place": {
      const place = findWikiPlace(route.slug);
      page = place && <PlaceArticle key={place.slug} place={place} go={go} />;
      break;
    }
    case "timeline": page = <TimelineArticle go={go} />; break;
    default: page = <MainPage go={go} />; pageTab = "Main Page";
  }

  return (
    <div className={s.root}>
      <aside className={s.side}>
        <button type="button" className={s.logo} onClick={() => go({ view: "home" })} aria-label={`${wikiWorld.name} main page`}>
          <Pic art={assets.toyhouseMood.moonIcon} alt="" lazy={false} />
          <span><strong>Lantern Routes</strong><small>The festival encyclopedia</small></span>
        </button>
        <nav className={s.portlet} aria-label="Navigation">
          <ul>
            <li><A onClick={() => go({ view: "home" })}>Main page</A></li>
            <li><A onClick={() => go({ view: "characters" })}>Characters</A></li>
            <li><A onClick={() => go({ view: "places" })}>Places</A></li>
            <li><A onClick={() => go({ view: "timeline" })}>Timeline</A></li>
            <li><A onClick={random}>Random page</A></li>
          </ul>
        </nav>
        <nav className={s.portlet} aria-label="Categories">
          <h3>Categories</h3>
          <ul>{wikiTags().slice(0, 7).map(({ tag }) => <li key={tag}><A onClick={() => go({ view: "characters", tag })}>{tagLabel(tag)}</A></li>)}</ul>
        </nav>
      </aside>

      <div className={s.column}>
        <div className={s.tabs}>
          <ul>
            <li className={s.selected}><span>{pageTab}</span></li>
          </ul>
          <SearchBox go={go} />
        </div>
        <main className={s.content}>{page}</main>
        <footer className={s.footer}>
          <p>{wikiWorld.name} · {wikiWorld.owner}</p>
        </footer>
      </div>
    </div>
  );
}
