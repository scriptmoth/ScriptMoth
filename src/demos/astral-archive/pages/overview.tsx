"use client";

import { CalendarPlus, ClipboardCheck, Megaphone, MessageCircleQuestion } from "lucide-react";
import { categoryColors, DEMO_TODAY, memberGrowth, engagement } from "../data";
import { useDemo, useMember } from "../store";
import { occurrences } from "./events";
import { Avatar, cx, fmtDate, fmtTime, LineChart, PageHead, Panel, Progress, Stat } from "../ui";
import s from "../dashboard.module.css";

export function Overview() {
  const { state, go } = useDemo();
  const member = useMember();
  const fc = state.members.filter(m => m.fc);
  const online = state.members.filter(m => m.presence === "online").length;
  const idle = state.members.filter(m => m.presence === "idle").length;
  const activeWeek = state.members.filter(m => m.lastActive <= 7).length;
  const newApps = state.applications.filter(app => app.status === "new").length;
  const upcoming = occurrences(state.events, DEMO_TODAY, 14).slice(0, 5);
  const officers = fc.filter(m => ["Archivist", "Curator", "Raid Lead"].includes(m.rank)).length;

  return (
    <>
      <PageHead title="Overview" sub="Everything happening in the Free Company and on the Discord server this week." />
      <div className={s.grid}>
        <div className={s.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static crest */}
          <img src="/assets/portfolio/astral-archive/crest.svg" alt="" width={78} height={78} />
          <div>
            <h2>{state.profile.name} <span className={s.muted} style={{ fontSize: ".6em" }}>{state.profile.tag}</span></h2>
            <p>“{state.profile.motto}”</p>
            <div className={s.heroMeta}>
              <span>{state.profile.world} · {state.profile.dc} data center</span><span>Mist · Ward 12 · Plot 30</span>
              <span>{state.profile.recruiting ? "Recruiting: open" : "Recruiting: closed"}</span><span>{state.statics.length} raid statics</span>
            </div>
          </div>
        </div>

        <div className={s.stats}>
          <Stat label="Discord members" value={state.members.length} note="+8 in the last 30 days" tone="up" />
          <Stat label="Free Company" value={`${fc.length} / 512`} note={`${officers} officers & raid leads`} />
          <Stat label="Online now" value={online + idle} note={`${online} online · ${idle} idle`} />
          <Stat label="Active this week" value={activeWeek} note={`${Math.round(activeWeek / state.members.length * 100)}% of the server`} tone="up" />
        </div>

        <div className={s.split}>
          <div className={s.stack}>
            <Panel title="Member growth" action={<span className={cx(s.chip)} data-tone="good">+47 this year</span>}>
              <LineChart labels={memberGrowth["12m"].labels} series={[{ label: "Discord members", values: memberGrowth["12m"].values, color: "var(--aa-gold)", area: true }]} />
            </Panel>
            <Panel title="Upcoming events" action={<button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => go("events")}>Open calendar</button>}>
              <ul className={s.list}>
                {upcoming.map(({ event, date }) => (
                  <li key={event.id + date} className={s.eventRow}>
                    <span className={s.dateTile}><small>{fmtDate(date, { weekday: "short" })}</small><strong>{fmtDate(date, { day: "numeric" })}</strong></span>
                    <div>
                      <p><span className={s.catDot} style={{ background: categoryColors[event.category] }} /> <strong>{event.title}</strong></p>
                      <p className={cx(s.muted, s.small)}>{fmtTime(event.start, state.timezone)} · {event.location}</p>
                    </div>
                    <span className={s.chip} data-tone="good">{event.going.length} going</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className={s.stack}>
            <Panel title="Quick actions">
              <div className={s.quick}>
                <button type="button" onClick={() => go("events", "new")}><CalendarPlus size={20} aria-hidden="true" /><span>Create event<small>Post with RSVP buttons</small></span></button>
                <button type="button" onClick={() => go("embeds")}><Megaphone size={20} aria-hidden="true" /><span>Announcement<small>Open the embed builder</small></span></button>
                <button type="button" onClick={() => go("applications")}><ClipboardCheck size={20} aria-hidden="true" /><span>Applications<small>{newApps} waiting for review</small></span></button>
                <button type="button" onClick={() => go("community")}><MessageCircleQuestion size={20} aria-hidden="true" /><span>Question of the day<small>Queue the next one</small></span></button>
              </div>
            </Panel>
            <Panel title="Latest announcements">
              <div className={s.stack} style={{ gap: ".6rem" }}>
                {state.announcements.slice(0, 3).map(note => (
                  <article key={note.id} className={s.notice}>
                    <h4>{note.title}</h4><p>{note.body}</p><small>{member(note.author)?.name} · {fmtDate(note.date)}</small>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className={s.splitEven}>
          <Panel title="Recent activity">
            <ul className={s.list}>
              {state.activity.slice(0, 7).map((item, index) => (
                <li key={index}><Avatar member={member(item.who)} size={28} /><div><p className={s.small}><strong>{member(item.who)?.name ?? "You"}</strong> {item.text}</p></div><span className={cx(s.muted, s.small)}>{item.when}</span></li>
              ))}
            </ul>
          </Panel>
          <Panel title="Community engagement">
            <LineChart labels={engagement.labels} series={[{ label: "Weekly active members", values: engagement.active, color: "var(--aa-blue)", area: true }]} height={150} />
            <div className={s.stack} style={{ gap: ".55rem", marginTop: ".75rem" }}>
              {[["Event attendance rate", 84], ["Members in a static or event this month", 71], ["Messages answered within an hour (#help-desk)", 92]].map(([label, value]) => (
                <div key={label}><div className={s.spread}><span className={s.small}>{label}</span><strong className={s.small}>{value}%</strong></div><Progress value={Number(value)} /></div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
