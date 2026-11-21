"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Cinzel } from "next/font/google";
import {
  ArrowUpRight, BarChart3, BookUser, CalendarDays, ClipboardList, Gauge, Hash, LayoutTemplate, Menu, MessagesSquare,
  RotateCcw, Search, Settings, Sparkles, Swords, Users, X, type LucideIcon,
} from "lucide-react";
import { DemoProvider, useDemo, type Page } from "./store";
import { Avatar, cx } from "./ui";
import { Overview } from "./pages/overview";
import { Members } from "./pages/members";
import { Characters } from "./pages/characters";
import { Events } from "./pages/events";
import { Raids } from "./pages/raids";
import { DiscordPage } from "./pages/discord";
import { Embeds } from "./pages/embeds";
import { Applications } from "./pages/applications";
import { Community } from "./pages/community";
import { Analytics } from "./pages/analytics";
import { SettingsPage } from "./pages/settings";
import s from "./dashboard.module.css";

const display = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--aa-display" });

const nav: { group: string; items: { id: Page; label: string; icon: LucideIcon }[] }[] = [
  { group: "Free Company", items: [
    { id: "overview", label: "Overview", icon: Gauge },
    { id: "members", label: "Members", icon: Users },
    { id: "characters", label: "Character profiles", icon: BookUser },
    { id: "events", label: "Events & calendar", icon: CalendarDays },
    { id: "raids", label: "Raid planner", icon: Swords },
  ] },
  { group: "Discord", items: [
    { id: "discord", label: "Server management", icon: Hash },
    { id: "embeds", label: "Embed builder", icon: LayoutTemplate },
    { id: "applications", label: "Applications", icon: ClipboardList },
    { id: "community", label: "Community", icon: MessagesSquare },
  ] },
  { group: "Archive", items: [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ] },
];

const pages: Record<Page, () => React.JSX.Element> = {
  overview: Overview, members: Members, characters: Characters, events: Events, raids: Raids, discord: DiscordPage,
  embeds: Embeds, applications: Applications, community: Community, analytics: Analytics, settings: SettingsPage,
};

function Shell({ embedded }: { embedded: boolean }) {
  const { state, page, go, reset, toasts } = useDemo();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const Current = pages[page];
  const newApps = state.applications.filter(app => app.status === "new").length;
  const me = state.members[0];
  const label = nav.flatMap(group => group.items).find(item => item.id === page)?.label;

  return (
    <div className={cx(s.root, display.variable)} style={{ "--aa-gold": state.profile.accent } as CSSProperties} inert={embedded || undefined}>
      <div className={s.demoStrip} role="note">
        <span className={s.demoPill}><Sparkles size={13} aria-hidden="true" /> Demo mode</span>
        <span className={s.demoText}>Portfolio demo by Scriptmoth. The Free Company and its data are fictional, and nothing here connects to Discord.</span>
        <span className={s.demoLinks}>
          <Link href="/portfolio#dashboards">Portfolio</Link>
          <Link href="/contact?type=custom-bot-dashboard">Build one like this <ArrowUpRight size={13} aria-hidden="true" /></Link>
        </span>
      </div>

      <div className={s.shell}>
        <aside className={cx(s.sidebar, menu && s.sidebarOpen)}>
          <div className={s.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG crest */}
            <img src="/assets/portfolio/astral-archive/crest.svg" alt="" width={42} height={42} />
            <div><strong>{state.profile.name}</strong><span>{state.profile.tag} · {state.profile.world}</span></div>
            <button type="button" className={cx(s.iconBtn, s.closeMenu)} onClick={() => setMenu(false)} aria-label="Close menu"><X size={18} /></button>
          </div>
          <nav aria-label="Dashboard pages">
            {nav.map(group => (
              <div key={group.group} className={s.navGroup}>
                <p>{group.group}</p>
                {group.items.map(({ id, label: text, icon: Icon }) => (
                  <button key={id} type="button" className={s.navItem} aria-current={page === id ? "page" : undefined} onClick={() => { go(id); setMenu(false); }}>
                    <Icon size={17} aria-hidden="true" /><span>{text}</span>
                    {id === "applications" && newApps > 0 && <span className={s.count}>{newApps}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className={s.me}>
            <Avatar member={me} size={34} />
            <div><strong>{me.name}</strong><span>Archivist · signed in (demo)</span></div>
          </div>
        </aside>
        {menu && <div className={s.menuScrim} onClick={() => setMenu(false)} />}

        <div className={s.main}>
          <header className={s.topbar}>
            <button type="button" className={cx(s.iconBtn, s.openMenu)} onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={20} /></button>
            <p className={s.crumb}><span>{state.profile.name}</span> / {label}</p>
            <form className={s.search} role="search" onSubmit={event => { event.preventDefault(); go("members", query); }}>
              <Search size={16} aria-hidden="true" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a member or character…" aria-label="Search members" />
            </form>
            {confirmReset ? (
              <span className={s.confirm}>
                Reset all demo data?
                <button type="button" className={cx(s.btn, s.small, s.danger)} onClick={() => { reset(); setConfirmReset(false); }}>Reset</button>
                <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => setConfirmReset(false)}>Cancel</button>
              </span>
            ) : (
              <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => setConfirmReset(true)}><RotateCcw size={14} aria-hidden="true" /> Reset demo</button>
            )}
          </header>
          <main className={s.content} key={page}>
            <Current />
          </main>
        </div>
      </div>

      <div className={s.toasts} aria-live="polite">
        {toasts.map(toast => <p key={toast.id} className={s.toast}><Sparkles size={14} aria-hidden="true" /> {toast.text}</p>)}
      </div>
    </div>
  );
}

export function AstralArchiveDashboard({ embedded = false }: { embedded?: boolean }) {
  return <DemoProvider persist={!embedded}><Shell embedded={embedded} /></DemoProvider>;
}
