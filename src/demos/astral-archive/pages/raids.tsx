"use client";

import { useState } from "react";
import { Plus, UserMinus, UserPlus } from "lucide-react";
import { jobs, jobsFor, slotNames, slotRole, type Job, type Static } from "../data";
import { useDemo, useMember } from "../store";
import { Avatar, cx, fmtDate, JobBadge, ModuleGate, PageHead, Panel, Progress, RoleIcon, roleColor } from "../ui";
import s from "../dashboard.module.css";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Raids() {
  return <ModuleGate id="raids" label="Raid planner"><RaidsInner /></ModuleGate>;
}

function RaidsInner() {
  const { state, update, notify } = useDemo();
  const member = useMember();
  const [current, setCurrent] = useState(state.statics[0]?.id);
  const group = state.statics.find(g => g.id === current) ?? state.statics[0];
  const [notes, setNotes] = useState(group?.notes ?? "");
  const [pick, setPick] = useState("");
  const change = (fn: (g: Static) => void) => update(d => fn(d.statics.find(g => g.id === group.id)!));

  function select(id: string) { setCurrent(id); setNotes(state.statics.find(g => g.id === id)?.notes ?? ""); }
  function createStatic() {
    const id = `s${Date.now()}`;
    update(d => { d.statics.push({ id, name: `New static ${d.statics.length + 1}`, lead: "m1", goal: "Set a goal for the group", schedule: "Pick days and times", days: [], start: "20:00", slots: slotNames.map(slot => ({ slot, member: null, job: null })), subs: [], waitlist: [], floors: ["Floor 1", "Floor 2", "Floor 3", "Floor 4"].map(name => ({ name, cleared: false, best: 0 })), notes: "", attendance: [], availability: {} }); });
    setCurrent(id); setNotes("");
    notify("New static created. Fill the eight slots to finish the party.");
  }

  if (!group) return <button type="button" className={cx(s.btn, s.primary)} onClick={createStatic}>Create a static</button>;
  const assigned = new Set(group.slots.map(slot => slot.member).filter(Boolean));
  const roster = state.members.filter(m => m.fc);
  const filled = group.slots.filter(slot => slot.member).length;
  const players = group.slots.filter(slot => slot.member);
  const bench = roster.filter(m => !assigned.has(m.id) && !group.subs.includes(m.id) && !group.waitlist.includes(m.id));

  return (
    <>
      <PageHead title="Raid planner" sub={`${state.statics.length} active statics. Assign the eight party slots, keep a bench, and track progression and attendance.`}
        actions={<button type="button" className={cx(s.btn, s.primary)} onClick={createStatic}><Plus size={15} aria-hidden="true" /> New static</button>} />
      <div className={s.staticTabs}>
        {state.statics.map(g => (
          <button key={g.id} type="button" className={s.staticTab} aria-pressed={g.id === group.id} onClick={() => select(g.id)}>
            <strong>{g.name}</strong><span>{g.schedule}</span><span>{g.slots.filter(x => x.member).length}/8 filled · {g.floors.filter(f => f.cleared).length}/{g.floors.length} cleared</span>
          </button>
        ))}
      </div>

      <div className={s.split}>
        <div className={s.stack}>
          <Panel title={`Party composition · ${filled}/8`} action={<span className={cx(s.muted, s.small)}>Led by {member(group.lead)?.name}</span>}>
            <div className={s.party}>
              {group.slots.map((slot, index) => {
                const role = slotRole(slot.slot);
                const person = member(slot.member);
                const eligible = roster.filter(m => m.id === slot.member || (!assigned.has(m.id) && (m.prefs.includes(role) || jobs[m.main].role === role)));
                return (
                  <div key={slot.slot} className={s.slot} data-empty={!person || undefined} style={{ "--role": roleColor[role] } as React.CSSProperties}>
                    <div className={s.slotHead}><b>{slot.slot}</b><RoleIcon role={role} size={16} /></div>
                    {person ? <span className={s.person}><Avatar member={person} size={26} /><div><strong>{person.name}</strong><span>{person.world}</span></div></span> : <span className={cx(s.muted, s.small)}>Open slot</span>}
                    <select className={s.input} value={slot.member ?? ""} aria-label={`${slot.slot} player`} onChange={e => {
                      const id = e.target.value || null; const m = member(id);
                      const job = m ? ([m.main, ...m.alts].find(j => jobs[j].role === role) ?? jobsFor(role)[0]) : null;
                      change(g => { g.slots[index] = { ...g.slots[index], member: id, job }; g.subs = g.subs.filter(x => x !== id); g.waitlist = g.waitlist.filter(x => x !== id); });
                      notify(id ? `${m?.name} assigned to ${slot.slot}.` : `${slot.slot} cleared.`);
                    }}>
                      <option value="">— Empty —</option>{eligible.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <select className={s.input} value={slot.job ?? ""} disabled={!person} aria-label={`${slot.slot} job`} onChange={e => change(g => { g.slots[index].job = e.target.value as Job; })}>
                      {!slot.job && <option value="">Job</option>}
                      {jobsFor(role).map(job => <option key={job} value={job}>{jobs[job].name}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Availability" action={<span className={cx(s.muted, s.small)}>Players set this with /availability — click a cell to toggle</span>}>
            <div className={s.tableWrap}>
              <table className={cx(s.table, s.availTable)}>
                <thead><tr><th>Player</th>{dayNames.map(d => <th key={d}>{d}</th>)}</tr></thead>
                <tbody>
                  {players.map(slot => {
                    const days = group.availability[slot.member!] ?? [];
                    return (
                      <tr key={slot.slot}>
                        <td><span className={s.row}>{slot.job && <JobBadge job={slot.job} />}{member(slot.member)?.name}</span></td>
                        {dayNames.map((d, i) => (
                          <td key={d}><button type="button" className={s.availCell} aria-pressed={days.includes(i)} aria-label={`${member(slot.member)?.name} ${d}`}
                            onClick={() => change(g => { const list = g.availability[slot.member!] ?? []; g.availability[slot.member!] = list.includes(i) ? list.filter(x => x !== i) : [...list, i]; })}>{days.includes(i) ? "✓" : ""}</button></td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
                {players.length > 0 && <tfoot><tr><td className={cx(s.muted, s.small)}>Everyone free</td>{dayNames.map((d, i) => {
                  const all = players.every(slot => (group.availability[slot.member!] ?? []).includes(i));
                  return <td key={d}>{all ? <span className={s.chip} data-tone="good">{d}</span> : <span className={s.muted}>–</span>}</td>;
                })}</tr></tfoot>}
              </table>
            </div>
          </Panel>

          <Panel title="Attendance history">
            {group.attendance.length ? <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Player</th>{group.attendance.map(a => <th key={a.date}>{fmtDate(a.date)}</th>)}<th>Rate</th></tr></thead>
                <tbody>{players.map(slot => {
                  const present = group.attendance.filter(a => a.present.includes(slot.member!)).length;
                  return <tr key={slot.slot}><td>{member(slot.member)?.name}</td>{group.attendance.map(a => <td key={a.date}><span className={s.dots}><i data-on={a.present.includes(slot.member!) || undefined} /></span></td>)}<td><strong>{Math.round(present / group.attendance.length * 100)}%</strong></td></tr>;
                })}</tbody>
              </table>
            </div> : <p className={s.empty}>No raid nights logged yet.</p>}
            <button type="button" className={cx(s.btn, s.small)} style={{ marginTop: ".75rem" }} disabled={!players.length} onClick={() => { change(g => { g.attendance = [...g.attendance, { date: "2026-11-18", present: g.slots.filter(x => x.member).map(x => x.member!) }].slice(-6); }); notify("Tonight’s attendance logged — everyone in a slot marked present."); }}>Log tonight’s raid</button>
          </Panel>
        </div>

        <div className={s.stack}>
          <Panel title="Schedule & goal">
            <dl className={s.kv}>
              <dt>Goal</dt><dd>{group.goal}</dd>
              <dt>Schedule</dt><dd>{group.schedule}</dd>
              <dt>Raid lead</dt><dd>{member(group.lead)?.name}</dd>
            </dl>
          </Panel>
          <Panel title="Progression">
            <ul className={s.floors}>
              {group.floors.map((floor, index) => (
                <li key={floor.name}>
                  <span>{floor.name}</span>
                  <Progress value={floor.best} color={floor.cleared ? "var(--aa-good)" : undefined} />
                  <button type="button" className={cx(s.btn, s.small, floor.cleared ? s.ghost : "")} onClick={() => { change(g => { const f = g.floors[index]; f.cleared = !f.cleared; f.best = f.cleared ? 100 : Math.min(f.best, 60); }); notify(floor.cleared ? `${floor.name} marked as not cleared.` : `${floor.name} cleared! 🎉 (demo)`); }}>{floor.cleared ? "Clear ✓" : `${floor.best}%`}</button>
                </li>
              ))}
            </ul>
            <p className={cx(s.muted, s.small)} style={{ marginTop: ".6rem" }}>Percent is the best pull so far. Click to toggle a clear.</p>
          </Panel>
          <Panel title="Substitutes & waitlist">
            {(["subs", "waitlist"] as const).map(list => (
              <div key={list} style={{ marginBottom: ".75rem" }}>
                <p className={cx(s.muted, s.small)} style={{ marginBottom: ".3rem" }}>{list === "subs" ? "Substitutes" : "Waitlist"}</p>
                <ul className={s.list}>
                  {group[list].map(id => (
                    <li key={id}><Avatar member={member(id)} size={26} /><div><p className={s.small}><strong>{member(id)?.name}</strong></p><p className={cx(s.muted, s.small)}>{member(id) && jobs[member(id)!.main].name}</p></div>
                      {list === "waitlist" && <button type="button" className={cx(s.btn, s.small)} onClick={() => { change(g => { g.waitlist = g.waitlist.filter(x => x !== id); g.subs.push(id); }); notify(`${member(id)?.name} promoted to substitute.`); }}>Make sub</button>}
                      <button type="button" className={s.iconBtn} aria-label={`Remove ${member(id)?.name}`} onClick={() => change(g => { g[list] = g[list].filter(x => x !== id); })}><UserMinus size={15} /></button></li>
                  ))}
                  {!group[list].length && <li className={cx(s.muted, s.small)}>Nobody yet.</li>}
                </ul>
              </div>
            ))}
            <div className={s.row}>
              <select className={cx(s.input, s.select)} value={pick} onChange={e => setPick(e.target.value)} aria-label="Add to waitlist" style={{ flex: 1 }}>
                <option value="">Add a member to the waitlist…</option>{bench.map(m => <option key={m.id} value={m.id}>{m.name} · {m.main}</option>)}
              </select>
              <button type="button" className={cx(s.btn, s.small)} disabled={!pick} onClick={() => { change(g => { g.waitlist.push(pick); }); notify(`${member(pick)?.name} added to the waitlist.`); setPick(""); }}><UserPlus size={14} aria-hidden="true" /> Add</button>
            </div>
          </Panel>
          <Panel title="Encounter notes">
            <textarea className={cx(s.textarea, s.notesBox)} value={notes} onChange={e => setNotes(e.target.value)} aria-label="Encounter notes" style={{ minHeight: 120 }} />
            <button type="button" className={cx(s.btn, s.small, s.primary)} style={{ marginTop: ".5rem" }} disabled={notes === group.notes} onClick={() => { change(g => { g.notes = notes; }); notify("Encounter notes saved."); }}>Save notes</button>
          </Panel>
        </div>
      </div>
    </>
  );
}
