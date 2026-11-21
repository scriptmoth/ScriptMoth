"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Repeat, Trash2, X } from "lucide-react";
import { categoryColors, DEMO_TODAY, type EventCategory, type FcEvent } from "../data";
import { useDemo, useMember } from "../store";
import { Avatar, cx, Drawer, fmtDate, fmtTime, ModuleGate, PageHead, Panel, Segmented } from "../ui";
import s from "../dashboard.module.css";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (value: string, n: number) => { const d = new Date(`${value}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const weekday = (value: string) => new Date(`${value}T12:00:00Z`).getUTCDay();
const ME = "m1";

/** Expand one-off and weekly events into dated occurrences inside a window. */
export function occurrences(events: FcEvent[], from: string, span: number) {
  const out: { event: FcEvent; date: string }[] = [];
  for (let i = 0; i < span; i++) {
    const day = addDays(from, i);
    for (const event of events) {
      if (event.days.length ? day >= event.date && event.days.includes(weekday(day)) : event.date === day) out.push({ event, date: day });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.event.start.localeCompare(b.event.start));
}

const blank = (): FcEvent => ({ id: "", title: "", category: "Social", date: DEMO_TODAY, start: "20:00", duration: 90, days: [], host: ME, location: "FC House · Mist W12 P30", description: "", reminder: "1 hour before", going: [ME], maybe: [], declined: [], attended: [] });

export function Events() {
  return <ModuleGate id="events" label="Events & RSVPs"><EventsInner /></ModuleGate>;
}

function EventsInner() {
  const { state, intent, clearIntent } = useDemo();
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [month, setMonth] = useState(0);
  const [week, setWeek] = useState(0);
  const [category, setCategory] = useState<"all" | EventCategory>("all");
  const [editing, setEditing] = useState<FcEvent | null>(() => intent === "new" ? blank() : null);
  const [opened, setOpened] = useState<{ id: string; date: string } | null>(null);

  useEffect(() => { if (intent) clearIntent(); }, [intent, clearIntent]);

  const events = state.events.filter(e => category === "all" || e.category === category);
  const base = new Date(Date.UTC(2026, 10 + month, 1, 12));
  const monthLabel = base.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const gridStart = addDays(iso(base), -base.getUTCDay());
  const monthDays = occurrences(events, gridStart, 42);
  const weekStart = addDays(DEMO_TODAY, -weekday(DEMO_TODAY) + week * 7);
  const weekDays = occurrences(events, weekStart, 7);
  const active = opened && state.events.find(e => e.id === opened.id);

  return (
    <>
      <PageHead title="Events & calendar" sub="Members RSVP with buttons on the bot’s event posts. Reminders go out automatically before each event."
        actions={<button type="button" className={cx(s.btn, s.primary)} onClick={() => setEditing(blank())}><Plus size={15} aria-hidden="true" /> New event</button>} />
      <div className={s.split}>
        <Panel>
          <div className={s.calHead}>
            <div className={s.row}>
              {view !== "list" && <>
                <button type="button" className={s.iconBtn} aria-label="Previous" onClick={() => view === "month" ? setMonth(m => m - 1) : setWeek(w => w - 1)}><ChevronLeft size={16} /></button>
                <button type="button" className={s.iconBtn} aria-label="Next" onClick={() => view === "month" ? setMonth(m => m + 1) : setWeek(w => w + 1)}><ChevronRight size={16} /></button>
              </>}
              <h3>{view === "month" ? monthLabel : view === "week" ? `Week of ${fmtDate(weekStart, { month: "long", day: "numeric" })}` : "All events"}</h3>
              {(month !== 0 || week !== 0) && view !== "list" && <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => { setMonth(0); setWeek(0); }}>Today</button>}
            </div>
            <div className={s.row}>
              <select className={cx(s.input, s.select)} value={category} onChange={e => setCategory(e.target.value as typeof category)} aria-label="Category">
                <option value="all">All categories</option>{Object.keys(categoryColors).map(c => <option key={c}>{c}</option>)}
              </select>
              <Segmented label="Calendar view" value={view} onChange={setView} options={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }, { value: "list", label: "List" }]} />
            </div>
          </div>

          {view === "month" && <div className={s.month}>
            {dayNames.map(d => <div key={d} className={s.dow}>{d}</div>)}
            {Array.from({ length: 42 }, (_, i) => {
              const day = addDays(gridStart, i);
              const inMonth = new Date(`${day}T12:00:00Z`).getUTCMonth() === base.getUTCMonth();
              return (
                <div key={day} className={cx(!inMonth && s.out, day === DEMO_TODAY && s.today)}>
                  <span className={s.dayNum}>{Number(day.slice(8))}</span>
                  {monthDays.filter(o => o.date === day).map(({ event }) => (
                    <button key={event.id} type="button" className={s.calEvent} style={{ "--cat": categoryColors[event.category] } as React.CSSProperties} onClick={() => setOpened({ id: event.id, date: day })} title={event.title}>
                      <b>{fmtTime(event.start, state.timezone).replace(/:00/, "").replace(/ (A|P)M.*/, (_, x: string) => x.toLowerCase())}</b> {event.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>}

          {view === "week" && <div className={s.weekView}>
            {Array.from({ length: 7 }, (_, i) => {
              const day = addDays(weekStart, i);
              return (
                <div key={day} className={s.weekDay} data-today={day === DEMO_TODAY || undefined}>
                  <p>{fmtDate(day, { weekday: "short", month: "short", day: "numeric" })}</p>
                  {weekDays.filter(o => o.date === day).map(({ event }) => (
                    <button key={event.id} type="button" className={s.weekEvent} style={{ "--cat": categoryColors[event.category] } as React.CSSProperties} onClick={() => setOpened({ id: event.id, date: day })}>
                      <strong>{event.title}</strong><span>{fmtTime(event.start, state.timezone)} · {event.duration} min</span><span>{event.going.length} going</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>}

          {view === "list" && <ul className={s.list}>
            {events.map(event => (
              <li key={event.id} className={s.eventRow}>
                <span className={s.catDot} style={{ background: categoryColors[event.category] }} />
                <div><p><strong>{event.title}</strong> {event.days.length > 0 && <span className={s.chip}><Repeat size={11} aria-hidden="true" /> Weekly · {event.days.map(d => dayNames[d]).join(", ")}</span>}</p>
                  <p className={cx(s.muted, s.small)}>{event.days.length ? `Since ${fmtDate(event.date)}` : fmtDate(event.date, { weekday: "long", month: "short", day: "numeric" })} · {fmtTime(event.start, state.timezone)} · {event.location}</p></div>
                <span className={s.chip} data-tone="good">{event.going.length} going</span>
                <button type="button" className={cx(s.btn, s.small)} onClick={() => setOpened({ id: event.id, date: event.date })}>Open</button>
              </li>
            ))}
          </ul>}
        </Panel>

        <div className={s.stack}>
          <Panel title="Categories">
            <div className={s.stack} style={{ gap: ".4rem" }}>
              {(Object.entries(categoryColors) as [EventCategory, string][]).map(([name, color]) => (
                <div key={name} className={s.spread}><span className={s.row}><span className={s.catDot} style={{ background: color }} /> {name}</span><span className={cx(s.muted, s.small)}>{state.events.filter(e => e.category === name).length} scheduled</span></div>
              ))}
            </div>
          </Panel>
          <Panel title="Event history">
            <ul className={s.list}>
              {state.history.map(h => (
                <li key={h.id}><span className={s.catDot} style={{ background: categoryColors[h.category] }} /><div><p className={s.small}><strong>{h.title}</strong></p><p className={cx(s.muted, s.small)}>{fmtDate(h.date, { weekday: "short", month: "short", day: "numeric" })}</p></div>
                  <span className={s.small}><strong>{h.attended}</strong><span className={s.muted}> / {h.rsvps} RSVP</span></span></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {active && opened && <EventDetail event={active} date={opened.date} onClose={() => setOpened(null)} onEdit={() => { setEditing(active); setOpened(null); }} />}
      {editing && <EventForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function EventDetail({ event, date, onClose, onEdit }: { event: FcEvent; date: string; onClose: () => void; onEdit: () => void }) {
  const { state, update, notify } = useDemo();
  const member = useMember();
  const [adding, setAdding] = useState("");
  const mine = event.going.includes(ME) ? "going" : event.maybe.includes(ME) ? "maybe" : event.declined.includes(ME) ? "declined" : "";
  const past = date <= DEMO_TODAY;
  const change = (fn: (e: FcEvent) => void) => update(d => fn(d.events.find(e => e.id === event.id)!));
  const setRsvp = (who: string, list: "going" | "maybe" | "declined" | null) => change(e => {
    e.going = e.going.filter(x => x !== who); e.maybe = e.maybe.filter(x => x !== who); e.declined = e.declined.filter(x => x !== who);
    if (list) e[list].push(who);
  });
  const fc = state.members.filter(m => m.fc && ![...event.going, ...event.maybe, ...event.declined].includes(m.id));

  return (
    <Drawer open onClose={onClose} title={event.title} wide>
      <div className={s.spread}>
        <span className={s.row}><span className={s.chip} style={{ color: categoryColors[event.category], borderColor: categoryColors[event.category] }}>{event.category}</span>{event.days.length > 0 && <span className={s.chip}><Repeat size={11} aria-hidden="true" /> Every {event.days.map(d => dayNames[d]).join(" & ")}</span>}</span>
        <button type="button" className={cx(s.btn, s.small)} onClick={onEdit}>Edit event</button>
      </div>
      <dl className={s.kv}>
        <dt>When</dt><dd>{fmtDate(date, { weekday: "long", month: "long", day: "numeric" })} · {fmtTime(event.start, state.timezone)} · {event.duration} min</dd>
        <dt>Where</dt><dd>{event.location}</dd>
        <dt>Host</dt><dd>{member(event.host)?.name}</dd>
        <dt>Reminder</dt><dd>
          <select className={cx(s.input, s.select)} value={event.reminder} aria-label="Reminder" onChange={e => { const v = e.target.value; change(x => { x.reminder = v; }); notify(`Reminder set to “${v}” (simulated — no DMs are sent).`); }}>
            {["Off", "15 minutes before", "1 hour before", "1 day before"].map(o => <option key={o}>{o}</option>)}
          </select>
        </dd>
      </dl>
      {event.description && <p className={s.bio}>{event.description}</p>}

      <Panel title="Your RSVP">
        <div className={s.rsvp}>
          {(["going", "maybe", "declined"] as const).map(kind => (
            <button key={kind} type="button" className={s.btn} aria-pressed={mine === kind} onClick={() => { setRsvp(ME, mine === kind ? null : kind); notify(mine === kind ? "RSVP removed." : `You’re marked as ${kind === "declined" ? "not going" : kind}.`); }}>
              {kind === "going" ? "Going" : kind === "maybe" ? "Maybe" : "Can’t make it"}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={`RSVPs · ${event.going.length} going · ${event.maybe.length} maybe · ${event.declined.length} declined`}>
        {(["going", "maybe", "declined"] as const).map(kind => event[kind].length > 0 && (
          <div key={kind} style={{ marginBottom: ".75rem" }}>
            <p className={cx(s.muted, s.small)} style={{ marginBottom: ".3rem", textTransform: "capitalize" }}>{kind}</p>
            <div className={s.row}>{event[kind].map(id => (
              <span key={id} className={s.chip}>{member(id)?.name}
                <button type="button" className={s.chipX} aria-label={`Remove ${member(id)?.name}`} onClick={() => setRsvp(id, null)}><X size={12} /></button></span>
            ))}</div>
          </div>
        ))}
        <div className={s.row}>
          <select className={cx(s.input, s.select)} value={adding} onChange={e => setAdding(e.target.value)} aria-label="Add a member">
            <option value="">Add a member…</option>{fc.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button type="button" className={cx(s.btn, s.small)} disabled={!adding} onClick={() => { setRsvp(adding, "going"); notify(`${member(adding)?.name} added as going.`); setAdding(""); }}>Add as going</button>
        </div>
      </Panel>

      <Panel title={past ? "Attendance" : "Attendance (opens once the event starts)"}>
        {past ? <>
          <div className={s.attendGrid}>
            {event.going.map(id => (
              <label key={id}><input type="checkbox" checked={event.attended.includes(id)} onChange={e => { const on = e.target.checked; change(x => { x.attended = on ? [...x.attended, id] : x.attended.filter(a => a !== id); }); }} /><Avatar member={member(id)} size={20} />{member(id)?.name}</label>
            ))}
          </div>
          <p className={cx(s.muted, s.small)} style={{ marginTop: ".5rem" }}>{event.attended.length} of {event.going.length} marked present.</p>
        </> : <p className={cx(s.muted, s.small)}>Raid leads and hosts tick off who showed up. Attendance feeds the analytics page.</p>}
      </Panel>
    </Drawer>
  );
}

function EventForm({ initial, onClose }: { initial: FcEvent; onClose: () => void }) {
  const { state, update, notify } = useDemo();
  const [form, setForm] = useState(initial);
  const set = <K extends keyof FcEvent>(key: K, value: FcEvent[K]) => setForm(f => ({ ...f, [key]: value }));
  const hosts = state.members.filter(m => ["Archivist", "Curator", "Raid Lead"].includes(m.rank));
  const isNew = !initial.id;

  function save() {
    update(d => {
      if (isNew) {
        d.events.push({ ...form, id: `e${Date.now()}` });
        d.activity.unshift({ who: ME, text: `scheduled ${form.title}`, when: "Just now", kind: "event" });
      } else d.events = d.events.map(e => e.id === form.id ? form : e);
    });
    notify(isNew ? `“${form.title}” added to the calendar. In a live setup the bot would post it with RSVP buttons.` : "Event updated in the demo.");
    onClose();
  }

  return (
    <Drawer open onClose={onClose} title={isNew ? "New event" : "Edit event"}>
      <label className={s.field}><span>Title</span><input className={s.input} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Weekly Treasure Maps" /></label>
      <div className={s.formGrid}>
        <label className={s.field}><span>Category</span><select className={s.input} value={form.category} onChange={e => set("category", e.target.value as EventCategory)}>{Object.keys(categoryColors).map(c => <option key={c}>{c}</option>)}</select></label>
        <label className={s.field}><span>Host</span><select className={s.input} value={form.host} onChange={e => set("host", e.target.value)}>{hosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label>
        <label className={s.field}><span>{form.days.length ? "Starts on" : "Date"}</span><input className={s.input} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></label>
        <label className={s.field}><span>Start (ET)</span><input className={s.input} type="time" value={form.start} onChange={e => set("start", e.target.value)} /></label>
        <label className={s.field}><span>Length (minutes)</span><input className={s.input} type="number" min={15} step={15} value={form.duration} onChange={e => set("duration", Number(e.target.value))} /></label>
        <label className={s.field}><span>Reminder</span><select className={s.input} value={form.reminder} onChange={e => set("reminder", e.target.value)}>{["Off", "15 minutes before", "1 hour before", "1 day before"].map(o => <option key={o}>{o}</option>)}</select></label>
      </div>
      <div className={s.field}>
        <span>Repeats weekly on</span>
        <div className={s.row}>{dayNames.map((d, i) => (
          <button key={d} type="button" className={cx(s.btn, s.small)} aria-pressed={form.days.includes(i)} style={form.days.includes(i) ? { borderColor: "var(--aa-gold)", color: "var(--aa-parch)", background: "#c9a45c26" } : undefined}
            onClick={() => set("days", form.days.includes(i) ? form.days.filter(x => x !== i) : [...form.days, i].sort())}>{d}</button>
        ))}</div>
        <small className={s.muted}>Leave every day off for a one-time event.</small>
      </div>
      <label className={s.field}><span>Location</span><input className={s.input} value={form.location} onChange={e => set("location", e.target.value)} /></label>
      <label className={s.field}><span>Description</span><textarea className={s.textarea} value={form.description} onChange={e => set("description", e.target.value)} /></label>
      <div className={s.spread}>
        <div className={s.row}>
          <button type="button" className={cx(s.btn, s.primary)} disabled={!form.title.trim()} onClick={save}>{isNew ? "Create event" : "Save changes"}</button>
          <button type="button" className={cx(s.btn, s.ghost)} onClick={onClose}>Cancel</button>
        </div>
        {!isNew && <button type="button" className={cx(s.btn, s.danger)} onClick={() => { update(d => { d.events = d.events.filter(e => e.id !== form.id); }); notify(`“${form.title}” removed from the demo calendar.`); onClose(); }}><Trash2 size={14} aria-hidden="true" /> Delete</button>}
      </div>
    </Drawer>
  );
}
