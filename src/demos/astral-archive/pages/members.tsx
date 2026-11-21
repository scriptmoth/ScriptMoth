"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import { rankOrder, type Member, type Rank, type Role } from "../data";
import { useDemo } from "../store";
import { Avatar, cx, Drawer, fmtDate, JobBadge, PageHead, Panel, RoleIcon, roleLabel } from "../ui";
import s from "../dashboard.module.css";

type SortKey = "name" | "rank" | "main" | "world" | "joined" | "lastActive";
const presenceLabel = { online: "Online", idle: "Idle", offline: "Offline" };
const lastSeen = (m: Member) => m.lastActive === 0 ? presenceLabel[m.presence] : m.lastActive === 1 ? "Yesterday" : `${m.lastActive} days ago`;

export function Members() {
  const { state, intent, clearIntent } = useDemo();
  const [query, setQuery] = useState(intent);
  const [rank, setRank] = useState<"all" | Rank>("all");
  const [role, setRole] = useState<"all" | Role>("all");
  const [dc, setDc] = useState("all");
  const [scope, setScope] = useState<"all" | "fc" | "discord">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "rank", dir: 1 });
  const [open, setOpen] = useState<string | null>(null);

  // A search typed into the top bar lands here.
  useEffect(() => { if (intent) clearIntent(); }, [intent, clearIntent]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.members
      .filter(m => !q || [m.name, m.discord, m.world, m.main].some(v => v.toLowerCase().includes(q)))
      .filter(m => rank === "all" || m.rank === rank)
      .filter(m => role === "all" || m.prefs.includes(role))
      .filter(m => dc === "all" || m.dc === dc)
      .filter(m => scope === "all" || (scope === "fc" ? m.fc : !m.fc))
      .sort((a, b) => {
        const value = (m: Member) => sort.key === "rank" ? rankOrder.indexOf(m.rank) : m[sort.key];
        const [x, y] = [value(a), value(b)];
        return (x < y ? -1 : x > y ? 1 : a.name.localeCompare(b.name)) * sort.dir;
      });
  }, [state.members, query, rank, role, dc, scope, sort]);

  const header = (key: SortKey, label: string) => (
    <th aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" className={s.sortBtn} data-active={sort.key === key || undefined} onClick={() => setSort(c => ({ key, dir: c.key === key ? (c.dir === 1 ? -1 : 1) : 1 }))}>
        {label}{sort.key === key && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
      </button>
    </th>
  );
  const selected = state.members.find(m => m.id === open);

  return (
    <>
      <PageHead title="Members" sub={`${state.members.length} Discord members, ${state.members.filter(m => m.fc).length} of them in the Free Company. Click anyone to open their record.`}
        actions={<ExportButton count={rows.length} />} />
      <Panel flush>
        <div className={s.filters}>
          <input className={s.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, Discord, world, or job" aria-label="Search members" />
          <select className={cx(s.input, s.select)} value={scope} onChange={e => setScope(e.target.value as typeof scope)} aria-label="Membership">
            <option value="all">Everyone</option><option value="fc">FC members</option><option value="discord">Discord only</option>
          </select>
          <select className={cx(s.input, s.select)} value={rank} onChange={e => setRank(e.target.value as typeof rank)} aria-label="Rank">
            <option value="all">All ranks</option>{rankOrder.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className={cx(s.input, s.select)} value={role} onChange={e => setRole(e.target.value as typeof role)} aria-label="Preferred role">
            <option value="all">All roles</option><option value="tank">Tank</option><option value="healer">Healer</option><option value="dps">DPS</option>
          </select>
          <select className={cx(s.input, s.select)} value={dc} onChange={e => setDc(e.target.value)} aria-label="Data center">
            <option value="all">All data centers</option><option>Crystal</option><option>Aether</option><option>Primal</option>
          </select>
          <span className={cx(s.muted, s.small)} style={{ marginLeft: "auto" }}>{rows.length} shown</span>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr>{header("name", "Character")}<th>Discord</th>{header("world", "World")}{header("main", "Main job")}<th>Roles</th>{header("rank", "FC rank")}{header("joined", "Joined")}{header("lastActive", "Activity")}</tr></thead>
            <tbody>
              {rows.map(m => (
                <tr key={m.id} data-clickable tabIndex={0} onClick={() => setOpen(m.id)} onKeyDown={e => { if (e.key === "Enter") setOpen(m.id); }}>
                  <td><span className={s.person}><Avatar member={m} size={30} /><div><strong>{m.name}</strong><span>{m.race}</span></div></span></td>
                  <td className={s.muted}>@{m.discord}</td>
                  <td>{m.world} <span className={s.muted}>· {m.dc}</span></td>
                  <td><JobBadge job={m.main} /></td>
                  <td><span className={s.row} style={{ gap: ".2rem" }}>{m.prefs.map(r => <RoleIcon key={r} role={r} size={16} />)}</span></td>
                  <td><span className={s.rank} data-rank={m.rank}>{m.rank}</span></td>
                  <td className={s.muted}>{fmtDate(m.joined, { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td><span className={s.chip} data-tone={m.presence === "online" ? "good" : m.presence === "idle" ? "warn" : undefined}>{lastSeen(m)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className={s.empty}>No members match those filters.</p>}
        </div>
      </Panel>
      <MemberDrawer member={selected} onClose={() => setOpen(null)} />
    </>
  );
}

function ExportButton({ count }: { count: number }) {
  const { notify } = useDemo();
  return <button type="button" className={cx(s.btn, s.ghost)} onClick={() => notify(`Exported ${count} members to CSV (simulated — no file was created).`)}><Download size={15} aria-hidden="true" /> Export</button>;
}

export function MemberDrawer({ member, onClose }: { member?: Member; onClose: () => void }) {
  if (!member) return null;
  return <MemberRecord key={member.id} member={member} onClose={onClose} />;
}

function MemberRecord({ member, onClose }: { member: Member; onClose: () => void }) {
  const { state, update, notify, go } = useDemo();
  const [notes, setNotes] = useState(member.notes);
  const staticName = state.statics.find(group => group.slots.some(slot => slot.member === member.id) || group.subs.includes(member.id))?.name;
  return (
    <Drawer open onClose={onClose} title="Member record">
      <div className={s.profileHead}>
        <Avatar member={member} size={60} />
        <div><h2 style={{ fontSize: "1.2rem" }}>{member.name}</h2><p className={s.muted}>@{member.discord} · <span className={s.rank} data-rank={member.rank}>{member.rank}</span></p></div>
      </div>
      <dl className={s.kv}>
        <dt>Home world</dt><dd>{member.world} ({member.dc})</dd>
        <dt>Race</dt><dd>{member.race}</dd>
        <dt>Main job</dt><dd><JobBadge job={member.main} full /></dd>
        <dt>Other jobs</dt><dd className={s.row}>{member.alts.map(job => <JobBadge key={job} job={job} />)}</dd>
        <dt>Preferred roles</dt><dd>{member.prefs.map(r => roleLabel[r]).join(", ")}</dd>
        <dt>Joined</dt><dd>{fmtDate(member.joined, { month: "long", day: "numeric", year: "numeric" })}</dd>
        <dt>Last active</dt><dd>{lastSeen(member)}</dd>
        <dt>Raid static</dt><dd>{staticName ?? "None"}</dd>
        <dt>Messages (30 days)</dt><dd>{member.messages.toLocaleString()}</dd>
        <dt>Events attended</dt><dd>{member.events}</dd>
      </dl>
      <label className={s.field}>
        <span>Officer notes · only visible to staff</span>
        <textarea className={cx(s.textarea, s.notesBox)} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add a private note for other officers…" />
      </label>
      <div className={s.row}>
        <button type="button" className={cx(s.btn, s.primary)} disabled={notes === member.notes} onClick={() => { update(d => { d.members.find(m => m.id === member.id)!.notes = notes; }); notify("Officer note saved to the demo."); }}>Save note</button>
        <button type="button" className={s.btn} onClick={() => { onClose(); go("characters", member.id); }}>View character profile</button>
        {member.fc && member.rank !== "Archivist" && (
          <select className={cx(s.input, s.select)} value={member.rank} aria-label="Change rank"
            onChange={e => { const rank = e.target.value as Rank; update(d => { d.members.find(m => m.id === member.id)!.rank = rank; }); notify(`${member.name} is now ${rank} (demo — no in-game rank changed).`); }}>
            {rankOrder.filter(r => r !== "Archivist" && r !== "Friend").map(r => <option key={r}>{r}</option>)}
          </select>
        )}
      </div>
    </Drawer>
  );
}
