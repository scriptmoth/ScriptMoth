"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { jobs, type Role } from "../data";
import { useDemo } from "../store";
import { Avatar, cx, fmtDate, JobBadge, PageHead, Panel, Portrait, RoleIcon, roleLabel } from "../ui";
import s from "../dashboard.module.css";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const titles: Record<string, string> = { Archivist: "Keeper of the Archive", Curator: "Curator of the Stacks", "Raid Lead": "Raid Leader", Scribe: "Scribe", Reader: "Reader", Initiate: "Initiate", Friend: "Friend of the Archive" };

export function Characters() {
  const { state, intent, clearIntent, update, notify } = useDemo();
  const fc = state.members.filter(m => m.fc);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(intent || fc[0].id);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => { if (intent) clearIntent(); }, [intent, clearIntent]);
  const list = fc.filter(m => !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.main.toLowerCase().includes(query.toLowerCase()));
  const member = state.members.find(m => m.id === current) ?? fc[0];
  const raids = state.statics.filter(group => group.slots.some(slot => slot.member === member.id));

  return (
    <>
      <PageHead title="Character profiles" sub="Character sheets members fill in through the bot’s /profile command. Portraits here are placeholders drawn for the demo." />
      <div className={s.charLayout}>
        <Panel title={`Free Company · ${fc.length}`}>
          <input className={s.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search characters or jobs" aria-label="Search characters" style={{ marginBottom: ".6rem" }} />
          <div className={s.charList}>
            {list.map(m => (
              <button key={m.id} type="button" aria-current={m.id === member.id} onClick={() => { setCurrent(m.id); setEditing(false); }}>
                <Avatar member={m} size={30} />
                <span className={s.person}><div><strong>{m.name}</strong><span>{jobs[m.main].name} · {m.world}</span></div></span>
              </button>
            ))}
          </div>
        </Panel>

        <div className={s.stack}>
          <Panel>
            <div className={s.charHero}>
              <Portrait member={member} />
              <div className={s.stack} style={{ gap: ".85rem" }}>
                <div className={s.charName}>
                  <span className={s.charTitle}>{titles[member.rank]}</span>
                  <h2>{member.name}</h2>
                  <p className={s.muted}>{member.race} · {member.world} ({member.dc}) · «ARCV» since {fmtDate(member.joined, { month: "long", year: "numeric" })}</p>
                </div>
                <div className={s.row}><JobBadge job={member.main} full />{member.alts.map(job => <JobBadge key={job} job={job} full />)}</div>
                <div>
                  <p className={cx(s.muted, s.small)} style={{ marginBottom: ".35rem" }}>Role preferences</p>
                  <div className={s.roleRow}>{(["tank", "healer", "dps"] as Role[]).map(role => <span key={role} data-on={member.prefs.includes(role) || undefined}><RoleIcon role={role} size={16} />{roleLabel[role]}</span>)}</div>
                </div>
                <div className={s.row}>
                  <button type="button" className={cx(s.btn, s.small)} onClick={() => notify("In a live dashboard this opens the character’s Lodestone page. Demo characters don’t have one.")}><ExternalLink size={14} aria-hidden="true" /> Lodestone profile</button>
                  <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => { setBio(member.bio); setEditing(true); }}><Pencil size={14} aria-hidden="true" /> Edit biography</button>
                </div>
              </div>
            </div>
          </Panel>

          <div className={s.splitEven}>
            <Panel title="Biography">
              {editing ? (
                <div className={s.stack} style={{ gap: ".5rem" }}>
                  <textarea className={cx(s.textarea, s.notesBox)} value={bio} onChange={e => setBio(e.target.value)} aria-label="Biography" />
                  <div className={s.row}>
                    <button type="button" className={cx(s.btn, s.small, s.primary)} onClick={() => { update(d => { d.members.find(m => m.id === member.id)!.bio = bio; }); setEditing(false); notify("Biography updated in the demo."); }}>Save</button>
                    <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : <p className={s.bio}>{member.bio}</p>}
            </Panel>
            <Panel title="Availability">
              <div className={s.week}>{days.map((day, index) => <span key={day} data-on={member.availability.includes(index) || undefined}>{day}</span>)}</div>
              <p className={cx(s.muted, s.small)} style={{ marginTop: ".6rem" }}>Evenings, Eastern time. Raid leads see this when filling static slots.</p>
            </Panel>
            <Panel title="Raid experience">
              <ul className={s.achievements}>{member.raidExp.map(item => <li key={item}>{item}</li>)}</ul>
              {raids.length > 0 && <p className={cx(s.small)} style={{ marginTop: ".5rem" }}>Static: <strong>{raids.map(r => r.name).join(", ")}</strong></p>}
            </Panel>
            <Panel title="Achievement highlights">
              <ul className={s.achievements}>{member.achievements.map(item => <li key={item}>{item}</li>)}</ul>
              <p className={cx(s.muted, s.small)} style={{ marginTop: ".5rem" }}>{member.events} FC events · {member.screenshots} screenshots shared</p>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
