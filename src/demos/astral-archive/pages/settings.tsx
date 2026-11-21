"use client";

import { useState } from "react";
import { botModules, channels, permissionList, worlds, type DataCenter } from "../data";
import { useDemo } from "../store";
import { cx, PageHead, Panel, Toggle } from "../ui";
import s from "../dashboard.module.css";

const accents = ["#c9a45c", "#6f9fd8", "#76b89a", "#d9776b", "#b08ad6", "#d6d0c2"];
const textChannels = channels.flatMap(c => c.items).filter(c => c.type !== "voice").map(c => `#${c.name}`);
const zones = ["ET", "CT", "MT", "PT", "UTC", "Server (UTC)"];
const notifyRows = [["newApplication", "New application", "DM officers when someone applies"], ["eventFull", "Event is full", "Ping the host when RSVPs hit the cap"], ["staticSub", "Static needs a sub", "Ping the bench when a raider can’t make it"], ["weeklyDigest", "Weekly officer digest", "Sunday summary in #officers"], ["modAlerts", "Moderation alerts", "Ping Curators when auto-mod acts"]] as const;

export function SettingsPage() {
  const { state, update, notify } = useDemo();
  const [profile, setProfile] = useState(state.profile);
  const [server, setServer] = useState(state.server);
  const profileDirty = JSON.stringify(profile) !== JSON.stringify(state.profile);
  const serverDirty = JSON.stringify(server) !== JSON.stringify(state.server);

  return (
    <>
      <PageHead title="Settings" sub="Guild branding, the Discord connection, bot modules, and who can do what. Saving here only updates this demo." />
      <div className={s.splitEven}>
        <div className={s.stack}>
          <Panel title="Guild profile & branding">
            <div className={s.stack} style={{ gap: ".75rem" }}>
              <div className={s.formGrid}>
                <label className={s.field}><span>Free Company name</span><input className={s.input} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} maxLength={20} /></label>
                <label className={s.field}><span>Tag</span><input className={s.input} value={profile.tag} onChange={e => setProfile({ ...profile, tag: e.target.value })} maxLength={9} /></label>
                <label className={s.field}><span>Data center</span><select className={s.input} value={profile.dc} onChange={e => { const dc = e.target.value as DataCenter; setProfile({ ...profile, dc, world: worlds[dc][0] }); }}>{Object.keys(worlds).map(d => <option key={d}>{d}</option>)}</select></label>
                <label className={s.field}><span>Home world</span><select className={s.input} value={profile.world} onChange={e => setProfile({ ...profile, world: e.target.value })}>{worlds[profile.dc as DataCenter].map(w => <option key={w}>{w}</option>)}</select></label>
              </div>
              <label className={s.field}><span>Motto</span><input className={s.input} value={profile.motto} onChange={e => setProfile({ ...profile, motto: e.target.value })} /></label>
              <div className={s.field}>
                <span>Accent color · used across the dashboard and embeds</span>
                <div className={s.accentRow}>{accents.map(c => <button key={c} type="button" aria-label={`Accent ${c}`} aria-pressed={profile.accent === c} style={{ background: c }} onClick={() => setProfile({ ...profile, accent: c })} />)}</div>
              </div>
              <div className={s.settingRow}><div><strong>Recruiting</strong><span>Shows the Apply button in #welcome</span></div><Toggle label="Recruiting" on={profile.recruiting} onChange={on => setProfile({ ...profile, recruiting: on })} /></div>
              <div className={s.row}>
                <button type="button" className={cx(s.btn, s.primary)} disabled={!profileDirty || !profile.name.trim()} onClick={() => { update(d => { d.profile = profile; }); notify("Guild profile saved."); }}>Save profile</button>
                {profileDirty && <button type="button" className={cx(s.btn, s.ghost)} onClick={() => setProfile(state.profile)}>Discard</button>}
              </div>
            </div>
          </Panel>

          <Panel title="Discord server">
            <div className={s.stack} style={{ gap: ".75rem" }}>
              <div className={s.settingRow}><div><strong>{server.name}</strong><span>Connected server · 85 members (demo connection)</span></div><span className={s.chip} data-tone="good">Connected</span></div>
              <div className={s.formGrid}>
                <label className={s.field}><span>Announcements</span><select className={s.input} value={server.announce} onChange={e => setServer({ ...server, announce: e.target.value })}>{textChannels.map(c => <option key={c}>{c}</option>)}</select></label>
                <label className={s.field}><span>Event posts</span><select className={s.input} value={server.events} onChange={e => setServer({ ...server, events: e.target.value })}>{textChannels.map(c => <option key={c}>{c}</option>)}</select></label>
                <label className={s.field}><span>Applications</span><select className={s.input} value={server.applications} onChange={e => setServer({ ...server, applications: e.target.value })}>{textChannels.map(c => <option key={c}>{c}</option>)}</select></label>
                <label className={s.field}><span>Timezone for times</span><select className={s.input} value={state.timezone} onChange={e => { const v = e.target.value; update(d => { d.timezone = v; }); notify(`Times now shown in ${v}.`); }}>{zones.map(z => <option key={z}>{z}</option>)}</select></label>
              </div>
              <div className={s.row}><button type="button" className={cx(s.btn, s.primary)} disabled={!serverDirty} onClick={() => { update(d => { d.server = server; }); notify("Server channels saved (simulated)."); }}>Save server settings</button></div>
            </div>
          </Panel>

          <Panel title="Notifications">
            {notifyRows.map(([key, label, hint]) => (
              <div key={key} className={s.settingRow}><div><strong>{label}</strong><span>{hint}</span></div><Toggle label={label} on={state.notify[key]} onChange={on => update(d => { d.notify[key] = on; })} /></div>
            ))}
          </Panel>
        </div>

        <div className={s.stack}>
          <Panel title="Bot modules" action={<span className={cx(s.muted, s.small)}>{Object.values(state.modules).filter(Boolean).length} of {botModules.length} on</span>}>
            {botModules.map(m => (
              <div key={m.id} className={s.settingRow}><div><strong>{m.label}</strong><span>{m.description}</span></div>
                <Toggle label={m.label} on={state.modules[m.id]} onChange={on => { update(d => { d.modules[m.id] = on; }); notify(`${m.label} ${on ? "enabled" : "disabled"} (demo only).`); }} /></div>
            ))}
          </Panel>

          <Panel title="Staff permissions" flush>
            <div className={s.tableWrap}>
              <table className={cx(s.table, s.permTable)}>
                <thead><tr><th>Permission</th>{Object.keys(state.permissions).map(r => <th key={r}>{r}</th>)}</tr></thead>
                <tbody>{permissionList.map(p => (
                  <tr key={p}><td>{p}</td>{Object.keys(state.permissions).map(rank => (
                    <td key={rank}><input type="checkbox" aria-label={`${rank}: ${p}`} checked={state.permissions[rank][p]} disabled={rank === "Archivist"}
                      onChange={e => { const on = e.target.checked; update(d => { d.permissions[rank][p] = on; }); notify(`${rank}s ${on ? "can now" : "can no longer"} ${p.toLowerCase()}.`); }} /></td>
                  ))}</tr>
                ))}</tbody>
              </table>
            </div>
            <p className={cx(s.muted, s.small)} style={{ padding: ".75rem 1.1rem" }}>The Archivist always has every permission.</p>
          </Panel>
        </div>
      </div>
    </>
  );
}
