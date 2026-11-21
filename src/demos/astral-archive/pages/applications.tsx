"use client";

import { useState } from "react";
import { Check, MessageSquarePlus, X } from "lucide-react";
import { DEMO_TODAY, jobs, type Application, type Member } from "../data";
import { useDemo, useMember } from "../store";
import { cx, fmtDate, JobBadge, ModuleGate, PageHead, Panel, Segmented } from "../ui";
import s from "../dashboard.module.css";

const tone = { new: "blue", interview: "warn", accepted: "good", declined: "bad" } as const;
const statusLabel = { new: "New", interview: "Interview", accepted: "Accepted", declined: "Declined" };

export function Applications() {
  return <ModuleGate id="applications" label="Applications"><ApplicationsInner /></ModuleGate>;
}

function ApplicationsInner() {
  const { state, update, notify } = useDemo();
  const member = useMember();
  const [filter, setFilter] = useState<"open" | "all" | "closed">("open");
  const list = state.applications.filter(a => filter === "all" || (filter === "open" ? ["new", "interview"].includes(a.status) : ["accepted", "declined"].includes(a.status)));
  const [current, setCurrent] = useState(list[0]?.id ?? state.applications[0].id);
  const [comment, setComment] = useState("");
  const app = state.applications.find(a => a.id === current) ?? state.applications[0];
  const change = (fn: (a: Application) => void) => update(d => fn(d.applications.find(a => a.id === app.id)!));

  function decide(status: Application["status"]) {
    update(d => {
      const target = d.applications.find(a => a.id === app.id)!;
      target.status = status;
      target.comments.push({ by: "m1", text: status === "accepted" ? "Accepted. Welcome to the Archive!" : status === "declined" ? "Declined." : "Moved to interview.", when: DEMO_TODAY });
      d.activity.unshift({ who: "m1", text: `${status === "interview" ? "moved" : status} ${app.character}’s application${status === "interview" ? " to interview" : ""}`, when: "Just now", kind: "app" });
      if (status === "accepted" && !d.members.some(m => m.name === app.character)) {
        const newcomer: Member = { id: `m${Date.now()}`, discord: app.discord, name: app.character, world: app.world, dc: app.dc, race: "Hyur", main: app.jobs[0], alts: app.jobs.slice(1), prefs: Array.from(new Set(app.jobs.map(j => jobs[j].role))), rank: "Initiate", joined: DEMO_TODAY, presence: "online", lastActive: 0, messages: 0, events: 0, screenshots: 0, fc: true, hue: 210, notes: `Joined via application ${app.id}.`, bio: app.about, availability: [], achievements: [], raidExp: [], birthday: "01-01" };
        d.members.push(newcomer);
      }
    });
    notify(status === "accepted" ? `${app.character} accepted and added to the roster as an Initiate (demo — no in-game invite sent).` : status === "declined" ? `${app.character}’s application declined. A polite DM would be sent in a live setup.` : `${app.character} moved to interview.`);
  }

  return (
    <>
      <PageHead title="Applications" sub="Recruitment applications from the Apply button in #welcome. Officers discuss and decide here." />
      <div className={s.appLayout}>
        <Panel title={`${state.applications.filter(a => a.status === "new").length} new · ${state.applications.filter(a => a.status === "interview").length} in interview`}>
          <Segmented label="Filter applications" value={filter} onChange={setFilter} options={[{ value: "open", label: "Open" }, { value: "closed", label: "Decided" }, { value: "all", label: "All" }]} />
          <div className={s.appList} style={{ marginTop: ".75rem" }}>
            {list.map(a => (
              <button key={a.id} type="button" aria-current={a.id === app.id} onClick={() => setCurrent(a.id)}>
                <span className={s.spread}><strong>{a.character}</strong><span className={s.chip} data-tone={tone[a.status]}>{statusLabel[a.status]}</span></span>
                <span className={cx(s.muted, s.small)}>{a.world} · {a.jobs.join(" / ")} · {fmtDate(a.submitted)}</span>
              </button>
            ))}
            {!list.length && <p className={s.empty}>Nothing here.</p>}
          </div>
        </Panel>

        <div className={s.stack}>
          <Panel title={app.character} action={<span className={s.chip} data-tone={tone[app.status]}>{statusLabel[app.status]}</span>}>
            <div className={s.splitEven}>
              <dl className={s.kv}>
                <dt>Discord</dt><dd>@{app.discord}</dd>
                <dt>Home world</dt><dd>{app.world} ({app.dc})</dd>
                <dt>Preferred jobs</dt><dd className={s.row}>{app.jobs.map(j => <JobBadge key={j} job={j} full />)}</dd>
                <dt>Playstyle</dt><dd>{app.playstyle}</dd>
                <dt>Usually online</dt><dd>{app.hours}</dd>
                <dt>Found us via</dt><dd>{app.found}</dd>
                <dt>Submitted</dt><dd>{fmtDate(app.submitted, { weekday: "short", month: "long", day: "numeric" })}</dd>
              </dl>
              <div><p className={cx(s.muted, s.small)} style={{ marginBottom: ".35rem" }}>In their words</p><p className={s.bio}>{app.about}</p></div>
            </div>
            <div className={s.row} style={{ marginTop: "1rem" }}>
              <button type="button" className={cx(s.btn, s.primary)} disabled={app.status === "accepted"} onClick={() => decide("accepted")}><Check size={15} aria-hidden="true" /> Accept</button>
              <button type="button" className={s.btn} disabled={app.status !== "new"} onClick={() => decide("interview")}>Move to interview</button>
              <button type="button" className={cx(s.btn, s.danger)} disabled={app.status === "declined"} onClick={() => decide("declined")}><X size={15} aria-hidden="true" /> Decline</button>
            </div>
          </Panel>

          <Panel title={`Officer discussion · ${app.comments.length}`}>
            <div className={s.stack} style={{ gap: ".5rem" }}>
              {app.comments.map((c, i) => <div key={i} className={s.comment}><p>{member(c.by)?.name} · {fmtDate(c.when)}</p><p>{c.text}</p></div>)}
              {!app.comments.length && <p className={cx(s.muted, s.small)}>No comments yet.</p>}
              <form className={s.row} onSubmit={e => { e.preventDefault(); if (!comment.trim()) return; change(a => { a.comments.push({ by: "m1", text: comment.trim(), when: DEMO_TODAY }); }); setComment(""); notify("Comment added for other officers."); }}>
                <input className={s.input} style={{ flex: 1 }} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment for other officers" aria-label="Officer comment" />
                <button type="submit" className={s.btn} disabled={!comment.trim()}><MessageSquarePlus size={15} aria-hidden="true" /> Comment</button>
              </form>
            </div>
          </Panel>

          <Panel title="Application history" flush>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Applicant</th><th>Jobs</th><th>Submitted</th><th>Status</th></tr></thead>
                <tbody>{state.applications.map(a => <tr key={a.id} data-clickable onClick={() => setCurrent(a.id)}><td><strong>{a.character}</strong></td><td>{a.jobs.join(", ")}</td><td className={s.muted}>{fmtDate(a.submitted)}</td><td><span className={s.chip} data-tone={tone[a.status]}>{statusLabel[a.status]}</span></td></tr>)}</tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
