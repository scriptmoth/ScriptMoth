"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import {
  findWikiCharacter, findWikiPlace, wikiCharacters, wikiPlaces, wikiRecentEdits, wikiTimeline, wikiWorld,
  type WikiCharacter, type WikiPlace,
} from "@/demos/wiki/wiki-templates";
import { eventsForCharacter, eventsForPlace, field, filterCharacters, Pic, timelineEras, useWikiSearch, type Go, type SkinProps } from "./wiki-core";
import s from "./wiki-codex.module.css";

/** Game-style codex: character select, split-screen profiles with tabs and stat bars, glowing chronicle. */

const tint = (color: string) => ({ "--c": color }) as CSSProperties;
const entryNo = (slug: string) => String(wikiCharacters.findIndex((c) => c.slug === slug) + 1).padStart(2, "0");
const elements = [...new Set(wikiCharacters.map((c) => field(c.fields, "Element")))];

function Label({ children }: { children: ReactNode }) {
  return <p className={s.label}>{children}</p>;
}

function Element({ character }: { character: WikiCharacter }) {
  return <span className={s.element} style={tint(character.color)}>{field(character.fields, "Element")}</span>;
}

function StatBars({ character, compact }: { character: WikiCharacter; compact?: boolean }) {
  return (
    <dl className={compact ? `${s.stats} ${s.statsCompact}` : s.stats} style={tint(character.color)}>
      {character.stats.map((stat) => (
        <div key={stat.label}>
          <dt>{stat.label}</dt>
          <dd>
            <span className={s.bar}><span style={{ width: `${stat.value}%` }} /></span>
            {!compact && <span className={s.statValue}>{stat.value}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- pages ---------- */

function Home({ go, banner }: { go: Go; banner: string }) {
  const observatory = findWikiPlace("starwell");
  return (
    <>
      <section className={s.hero} style={{ backgroundImage: `linear-gradient(90deg, #0b0f1f 8%, #0b0f1fc9 48%, #0b0f1f30), var(--wiki-cover), url(${banner})` }}>
        <div className={s.heroText}>
          <Label>Codex · {wikiCharacters.length} entries unlocked</Label>
          <h1>Lantern<br />Routes</h1>
          <p>{wikiWorld.intro}</p>
          <div className={s.heroActions}>
            <button type="button" className={s.primary} onClick={() => go({ view: "characters" })}>Browse roster</button>
            <button type="button" className={s.ghost} onClick={() => go({ view: "timeline" })}>Open chronicle</button>
          </div>
        </div>
        {observatory && <button type="button" className={s.heroPlate} onClick={() => go({ view: "place", slug: observatory.slug })}>
          <Pic art={observatory.art} lazy={false} />
          <span><small>Observatory entry</small><strong>{observatory.name}</strong><span aria-hidden="true">↗</span></span>
        </button>}
      </section>

      <section className={s.pad}>
        <Label>Select a character</Label>
        <ul className={s.select}>
          {wikiCharacters.map((character) => (
            <li key={character.slug} style={tint(character.color)}>
              <button type="button" onClick={() => go({ view: "character", slug: character.slug })} aria-label={`${character.name}, ${character.title}`}>
                <Pic art={character.art} />
                <span className={s.selectName}>
                  <small>{entryNo(character.slug)}</small>
                  <strong>{character.name}</strong>
                  <span>{character.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.pad}>
        <div className={s.split2}>
          <div>
            <Label>Regions</Label>
            <ul className={s.regions}>
              {wikiPlaces.map((place) => (
                <li key={place.slug}>
                  <button type="button" onClick={() => go({ view: "place", slug: place.slug })} style={{ backgroundImage: `url(${place.art.src})` }}>
                    <small>{place.region}</small>
                    <strong>{place.name}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Label>Entry log</Label>
            <ul className={s.log}>
              {wikiRecentEdits.map((edit) => (
                <li key={edit.page + edit.change}>
                  <span className={s.logTime}>{edit.when}</span>
                  <button type="button" onClick={() => go(edit.kind === "timeline" ? { view: "timeline" } : { view: edit.kind, slug: edit.slug })}>
                    <strong>{edit.page}</strong> {edit.change.toLowerCase()}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function Roster({ go, tag }: { go: Go; tag?: string }) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<string | null>(null);
  const shown = filterCharacters(query, tag).filter((c) => !element || field(c.fields, "Element") === element);
  return (
    <section className={s.pad}>
      <Label>Roster</Label>
      <h1 className={s.pageTitle}>All characters</h1>
      <div className={s.filterBar}>
        <div className={s.segments} role="group" aria-label="Filter by element">
          <button type="button" aria-pressed={!element} onClick={() => setElement(null)}>All</button>
          {elements.map((name) => <button key={name} type="button" aria-pressed={element === name} onClick={() => setElement(element === name ? null : name)}>{name}</button>)}
        </div>
        <label className={s.filterInput}>
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Filter roster</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter roster…" />
        </label>
        {tag && <button type="button" className={s.activeTag} onClick={() => go({ view: "characters" })}>#{tag} <X size={13} aria-label="Clear tag" /></button>}
      </div>
      <p className={s.count} aria-live="polite">{shown.length} / {wikiCharacters.length} entries</p>
      {shown.length ? (
        <ul className={s.roster}>
          {shown.map((character) => (
            <li key={character.slug} style={tint(character.color)}>
              <button type="button" onClick={() => go({ view: "character", slug: character.slug })}>
                <span className={s.rosterArt}><Pic art={character.art} /></span>
                <span className={s.rosterBody}>
                  <span className={s.rosterHead}><strong>{character.name}</strong><Element character={character} /></span>
                  <span className={s.muted}>{character.title}</span>
                  <StatBars character={character} compact />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className={s.empty}>No entries match these filters.</p>}
    </section>
  );
}

type Tab = "profile" | "story" | "bonds" | "gallery";

function Profile({ character, go }: { character: WikiCharacter; go: Go }) {
  const [tab, setTab] = useState<Tab>("profile");
  const index = wikiCharacters.findIndex((c) => c.slug === character.slug);
  const prev = wikiCharacters[(index - 1 + wikiCharacters.length) % wikiCharacters.length];
  const next = wikiCharacters[(index + 1) % wikiCharacters.length];
  const events = eventsForCharacter(character.slug);
  const tabs: { id: Tab; label: string }[] = [{ id: "profile", label: "Profile" }, { id: "story", label: "Story" }, { id: "bonds", label: "Bonds" }, { id: "gallery", label: "Gallery" }];

  return (
    <article className={s.profile} style={tint(character.color)}>
      <div className={s.stage}>
        <span className={s.ghostName} aria-hidden="true">{character.name}</span>
        <Pic art={character.art} alt={`${character.name} character art`} lazy={false} />
      </div>

      <div className={s.dossier}>
        <button type="button" className={s.back} onClick={() => go({ view: "characters" })}><ChevronLeft size={15} aria-hidden="true" /> Roster</button>
        <Label>Entry {entryNo(character.slug)}</Label>
        <h1 className={s.name}>{character.name}</h1>
        <p className={s.title}>{character.title} <Element character={character} /></p>
        <blockquote className={s.quote}>“{character.quote}”</blockquote>

        <div className={s.tabs} role="tablist" aria-label={`${character.name} sections`}>
          {tabs.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>
          ))}
        </div>

        <div className={s.panel} role="tabpanel">
          {tab === "profile" && (
            <>
              <StatBars character={character} />
              <dl className={s.tiles}>
                {character.fields.filter((f) => f.label !== "Element").map((f) => (
                  <div key={f.label}><dt>{f.label}</dt><dd>{f.label === "Home" ? <button type="button" className={s.link} onClick={() => go({ view: "place", slug: character.home })}>{f.value}</button> : f.value}</dd></div>
                ))}
              </dl>
              <div className={s.tagRow}>{character.tags.map((t) => <button key={t} type="button" onClick={() => go({ view: "characters", tag: t })}>#{t}</button>)}</div>
            </>
          )}
          {tab === "story" && (
            <>
              <p className={s.lead}>{character.summary}</p>
              {character.sections.map((section) => (
                <section key={section.id} className={s.storyBlock}>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
                </section>
              ))}
              {events.length > 0 && (
                <section className={s.storyBlock}>
                  <h2>Chronicle</h2>
                  <ul className={s.eventList}>{events.map((e) => <li key={e.title}><span>{e.year}</span>{e.text}</li>)}</ul>
                </section>
              )}
              <section className={s.storyBlock}>
                <h2>Notes</h2>
                <ul className={s.eventList}>{character.trivia.map((t) => <li key={t}><span>◆</span>{t}</li>)}</ul>
              </section>
            </>
          )}
          {tab === "bonds" && (
            <ul className={s.bonds}>
              {character.relations.map((relation) => {
                const other = findWikiCharacter(relation.slug);
                return other && (
                  <li key={other.slug} style={tint(other.color)}>
                    <button type="button" onClick={() => go({ view: "character", slug: other.slug })}>
                      <span className={s.bondArt}><Pic art={other.art} /></span>
                      <span><small>{relation.bond}</small><strong>{other.name}</strong><span>{relation.note}</span></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {tab === "gallery" && (
            <ul className={s.gallery}>
              {character.gallery.map((item) => <li key={item.caption}><Pic art={item.art} alt={item.caption} /><span>{item.caption}</span></li>)}
            </ul>
          )}
        </div>

        <nav className={s.pager} aria-label="Other entries">
          <button type="button" onClick={() => go({ view: "character", slug: prev.slug })}><ChevronLeft size={15} aria-hidden="true" /> {prev.name}</button>
          <button type="button" onClick={() => go({ view: "character", slug: next.slug })}>{next.name} <ChevronRight size={15} aria-hidden="true" /></button>
        </nav>
      </div>
    </article>
  );
}

function Regions({ go }: { go: Go }) {
  return (
    <section className={s.pad}>
      <Label>Regions</Label>
      <h1 className={s.pageTitle}>Map of the Routes</h1>
      <ul className={s.regionList}>
        {wikiPlaces.map((place, i) => (
          <li key={place.slug}>
            <button type="button" onClick={() => go({ view: "place", slug: place.slug })} style={{ backgroundImage: `linear-gradient(90deg, #0b0f1fee 30%, #0b0f1f55), url(${place.art.src})` }}>
              <span className={s.regionNo}>{String(i + 1).padStart(2, "0")}</span>
              <span>
                <small>{place.kind} · {place.region}</small>
                <strong>{place.name}</strong>
                <span>{place.summary}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Region({ place, go }: { place: WikiPlace; go: Go }) {
  const events = eventsForPlace(place.slug);
  return (
    <>
      <section className={s.placeHero} style={{ backgroundImage: `linear-gradient(to top, #0b0f1f, #0b0f1f33 70%), url(${place.art.src})` }}>
        <button type="button" className={s.back} onClick={() => go({ view: "places" })}><ChevronLeft size={15} aria-hidden="true" /> Regions</button>
        <Label>{place.kind} · {place.region}</Label>
        <h1>{place.name}</h1>
      </section>
      <section className={`${s.pad} ${s.split2}`}>
        <div>
          <p className={s.lead}>{place.summary}</p>
          {place.paragraphs.map((p) => <p key={p}>{p}</p>)}
          {events.length > 0 && (
            <>
              <Label>Chronicle</Label>
              <ul className={s.eventList}>{events.map((e) => <li key={e.title}><span>{e.year}</span>{e.text}</li>)}</ul>
            </>
          )}
        </div>
        <div>
          <Label>Residents</Label>
          <ul className={s.bonds}>
            {place.residents.map((slug) => findWikiCharacter(slug)).filter((c): c is WikiCharacter => !!c).map((c) => (
              <li key={c.slug} style={tint(c.color)}>
                <button type="button" onClick={() => go({ view: "character", slug: c.slug })}>
                  <span className={s.bondArt}><Pic art={c.art} /></span>
                  <span><small>Entry {entryNo(c.slug)}</small><strong>{c.name}</strong><span>{c.title}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Chronicle({ go }: { go: Go }) {
  return (
    <section className={s.pad}>
      <Label>Chronicle</Label>
      <h1 className={s.pageTitle}>History of the Routes</h1>
      <div className={s.chronicle}>
        {timelineEras().map((era) => (
          <div key={era}>
            <p className={s.era}>{era}</p>
            <ol>
              {wikiTimeline.filter((e) => e.era === era).map((event) => (
                <li key={event.title}>
                  <div className={s.node}>
                    <span className={s.year}>{event.year}</span>
                    <h2>{event.title}</h2>
                    <p>{event.text}</p>
                    <div className={s.nodeLinks}>
                      {event.place && <button type="button" onClick={() => go({ view: "place", slug: event.place! })}>{findWikiPlace(event.place)?.name}</button>}
                      {event.characters.map((slug) => {
                        const c = findWikiCharacter(slug);
                        return c && <button key={slug} type="button" style={tint(c.color)} onClick={() => go({ view: "character", slug })}><Pic art={c.art} /> {c.name}</button>;
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- chrome ---------- */

function CodexSearch({ go }: { go: Go }) {
  const search = useWikiSearch(go);
  return (
    <div className={s.search} role="search">
      <label>
        <Search size={14} aria-hidden="true" />
        <span className="sr-only">Search the codex</span>
        <input type="search" value={search.query} onChange={(e) => search.setQuery(e.target.value)} onKeyDown={search.onKeyDown} placeholder="Search codex" autoComplete="off" />
        <kbd aria-hidden="true">↵</kbd>
      </label>
      {search.active && (
        <ul className={s.results}>
          {search.results.length ? search.results.map((r) => (
            <li key={r.kind + r.slug}>
              <button type="button" onClick={() => search.open(r.kind, r.slug)}>
                <small>{r.kind === "character" ? "Entry" : "Region"}</small> <strong>{r.name}</strong> <span>{r.detail}</span>
              </button>
            </li>
          )) : <li className={s.muted}>No entries found.</li>}
        </ul>
      )}
    </div>
  );
}

export function CodexWiki({ template, route, go, random }: SkinProps) {
  let page: ReactNode;
  switch (route.view) {
    case "characters": page = <Roster key={route.tag ?? "all"} go={go} tag={route.tag} />; break;
    case "character": {
      const c = findWikiCharacter(route.slug);
      page = c && <Profile key={c.slug} character={c} go={go} />;
      break;
    }
    case "places": page = <Regions go={go} />; break;
    case "place": {
      const p = findWikiPlace(route.slug);
      page = p && <Region key={p.slug} place={p} go={go} />;
      break;
    }
    case "timeline": page = <Chronicle go={go} />; break;
    default: page = <Home go={go} banner={template.banner.src} />;
  }
  const nav = [
    { label: "Roster", active: route.view === "characters" || route.view === "character", to: { view: "characters" } as const },
    { label: "Regions", active: route.view === "places" || route.view === "place", to: { view: "places" } as const },
    { label: "Chronicle", active: route.view === "timeline", to: { view: "timeline" } as const },
  ];

  return (
    <div className={s.root}>
      <header className={s.hud}>
        <button type="button" className={s.brand} onClick={() => go({ view: "home" })}><span aria-hidden="true">◆</span> Lantern Routes <em>{"// Codex"}</em></button>
        <nav aria-label="Codex">
          {nav.map((item) => <button key={item.label} type="button" aria-current={item.active ? "page" : undefined} onClick={() => go(item.to)}>{item.label}</button>)}
          <button type="button" onClick={random}>Random</button>
        </nav>
        <CodexSearch go={go} />
      </header>
      <main>{page}</main>
      <footer className={s.foot}><span>{wikiWorld.owner}</span><span>v1.4 · {wikiCharacters.length} entries · {wikiPlaces.length} regions</span></footer>
    </div>
  );
}
