"use client";

import { useState } from "react";
import { Hash, Megaphone, MessagesSquare, Plus, Trash2, Volume2, X } from "lucide-react";
import { channels, FC } from "../data";
import { useDemo } from "../store";
import { cx, EmbedPreview, ModuleGate, PageHead, Panel, Toggle } from "../ui";
import s from "../dashboard.module.css";

const tabs = [["structure", "Channels & roles"], ["welcome", "Welcome"], ["menus", "Role menus"], ["moderation", "Moderation & logs"], ["commands", "Custom commands"], ["automation", "Automations"]] as const;
type Tab = typeof tabs[number][0];
const textChannels = channels.flatMap(c => c.items).filter(c => c.type !== "voice").map(c => `#${c.name}`);
const icon = { text: Hash, announce: Megaphone, forum: MessagesSquare, voice: Volume2 };

export function DiscordPage() {
  const [tab, setTab] = useState<Tab>("structure");
  return (
    <>
      <PageHead title="Server management" sub="Configure how Archive Bot runs the Discord server. Changes here are simulated — this demo isn’t connected to a real server." />
      <div className={s.tabs} role="tablist">
        {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      {tab === "structure" && <Structure />}
      {tab === "welcome" && <ModuleGate id="welcome" label="Welcome messages"><Welcome /></ModuleGate>}
      {tab === "menus" && <RoleMenus />}
      {tab === "moderation" && <Moderation />}
      {tab === "commands" && <Commands />}
      {tab === "automation" && <Automations />}
    </>
  );
}

function Structure() {
  const { state, update, notify } = useDemo();
  return (
    <div className={s.split}>
      <Panel title="Roles" flush>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Role</th><th>Color</th><th>Members</th><th>Mentionable</th><th>Shown separately</th></tr></thead>
            <tbody>{state.roles.map((role, index) => (
              <tr key={role.id}>
                <td><span className={s.row}><span className={s.roleDot} style={{ background: role.color }} /><strong style={{ color: role.color }}>{role.name}</strong>{role.kind !== "rank" && <span className={s.chip}>{role.kind}</span>}</span></td>
                <td><input type="color" className={s.colorInput} value={role.color} aria-label={`${role.name} color`} onChange={e => { const v = e.target.value; update(d => { d.roles[index].color = v; }); }} /></td>
                <td>{role.members}</td>
                <td><Toggle label={`${role.name} mentionable`} on={role.mentionable} onChange={on => { update(d => { d.roles[index].mentionable = on; }); notify(`@${role.name} is ${on ? "now" : "no longer"} mentionable (demo).`); }} /></td>
                <td><Toggle label={`${role.name} hoisted`} on={role.hoisted} onChange={on => update(d => { d.roles[index].hoisted = on; })} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Panel>
      <Panel title={`Channels · ${FC.name}`}>
        {channels.map(category => (
          <div key={category.category} className={s.channelCat}>
            <p>{category.category}</p>
            {category.items.map(channel => { const Icon = icon[channel.type as keyof typeof icon]; return (
              <div key={channel.name} className={s.channel}><Icon size={15} aria-hidden="true" />{channel.name}{channel.messages > 0 && <small>{channel.messages.toLocaleString()} msgs / 30d</small>}</div>
            ); })}
          </div>
        ))}
      </Panel>
    </div>
  );
}

function Welcome() {
  const { state, update, notify } = useDemo();
  const [draft, setDraft] = useState(state.welcome);
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.welcome);
  return (
    <div className={s.splitEven}>
      <Panel title="Welcome message">
        <div className={s.stack} style={{ gap: ".75rem" }}>
          <div className={s.settingRow}><div><strong>Greet new members</strong><span>Posts when someone joins the server</span></div><Toggle label="Greet new members" on={draft.enabled} onChange={on => setDraft({ ...draft, enabled: on })} /></div>
          <div className={s.settingRow}><div><strong>Also send as a DM</strong><span>With the server rules attached</span></div><Toggle label="Send DM" on={draft.dm} onChange={on => setDraft({ ...draft, dm: on })} /></div>
          <div className={s.formGrid}>
            <label className={s.field}><span>Channel</span><select className={s.input} value={draft.channel} onChange={e => setDraft({ ...draft, channel: e.target.value })}>{textChannels.map(c => <option key={c}>{c}</option>)}</select></label>
            <label className={s.field}><span>Give this role on join</span><select className={s.input} value={draft.autoRole} onChange={e => setDraft({ ...draft, autoRole: e.target.value })}>{state.roles.map(r => <option key={r.id}>{r.name}</option>)}</select></label>
          </div>
          <label className={s.field}><span>Message · use {"{user}"} for the new member’s name</span><textarea className={s.textarea} value={draft.message} onChange={e => setDraft({ ...draft, message: e.target.value })} /></label>
          <div className={s.row}>
            <button type="button" className={cx(s.btn, s.primary)} disabled={!dirty} onClick={() => { update(d => { d.welcome = draft; }); notify("Welcome message saved (simulated)."); }}>Save</button>
            <button type="button" className={s.btn} onClick={() => notify(`Test welcome shown below — in a live setup it would post to ${draft.channel}.`)}>Send test</button>
          </div>
        </div>
      </Panel>
      <Panel title="Preview">
        {draft.enabled ? <EmbedPreview embed={{ author: "", title: "✦ A new reader has arrived", description: draft.message.replaceAll("{user}", "**Lysandre**"), color: state.profile.accent, footer: `Member #${state.members.length + 1} · ${draft.autoRole}`, thumbnail: "/assets/portfolio/astral-archive/crest.svg", image: "", buttons: ["Pick roles", "Apply to the FC"], channel: draft.channel }} />
          : <p className={s.empty}>Welcome messages are off.</p>}
      </Panel>
    </div>
  );
}

function RoleMenus() {
  const { state, update, notify } = useDemo();
  const [emoji, setEmoji] = useState("✨");
  const [role, setRole] = useState(state.roles[11]?.name ?? "");
  return (
    <div className={s.cols2}>
      {state.roleMenus.map((menu, index) => (
        <Panel key={menu.id} title={menu.title} action={<span className={s.chip}>{menu.channel} · {menu.style === "buttons" ? "Buttons" : "Reactions"}</span>}>
          <ul className={s.list}>
            {menu.options.map((option, i) => (
              <li key={option.role}><span style={{ fontSize: "1.2rem" }} aria-hidden="true">{option.emoji}</span><div><strong className={s.small}>{option.role}</strong></div>
                <button type="button" className={s.iconBtn} aria-label={`Remove ${option.role}`} onClick={() => update(d => { d.roleMenus[index].options.splice(i, 1); })}><X size={14} /></button></li>
            ))}
          </ul>
          <div className={s.row} style={{ marginTop: ".6rem" }}>
            <input className={s.input} style={{ width: 56 }} value={emoji} onChange={e => setEmoji(e.target.value)} aria-label="Emoji" />
            <select className={cx(s.input, s.select)} value={role} onChange={e => setRole(e.target.value)} aria-label="Role">{state.roles.filter(r => r.kind !== "rank" && r.kind !== "bot").map(r => <option key={r.id}>{r.name}</option>)}</select>
            <button type="button" className={cx(s.btn, s.small)} disabled={menu.options.some(o => o.role === role)} onClick={() => { update(d => { d.roleMenus[index].options.push({ emoji, role }); }); notify(`${emoji} ${role} added to “${menu.title}”.`); }}><Plus size={14} aria-hidden="true" /> Add option</button>
          </div>
          <div className={s.row} style={{ marginTop: ".75rem" }}>
            <span className={cx(s.muted, s.small)}>Style:</span>
            <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => update(d => { d.roleMenus[index].style = menu.style === "buttons" ? "reactions" : "buttons"; })}>Switch to {menu.style === "buttons" ? "reactions" : "buttons"}</button>
            <button type="button" className={cx(s.btn, s.small)} onClick={() => notify(`“${menu.title}” would be re-posted in ${menu.channel} (simulated).`)}>Re-post panel</button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function Moderation() {
  const { state, update, notify } = useDemo();
  const [word, setWord] = useState("");
  const mod = state.moderation, log = state.logging;
  const logRows = [["messages", "Edited & deleted messages"], ["members", "Joins, leaves, and bans"], ["roles", "Role changes"], ["voice", "Voice channel activity"], ["invites", "Invite links created"]] as const;
  return (
    <div className={s.splitEven}>
      <ModuleGate id="moderation" label="Moderation">
      <Panel title="Auto-moderation">
        <div className={s.settingRow}><div><strong>Spam filter</strong><span>Times out members who flood a channel</span></div><Toggle label="Spam filter" on={mod.spam} onChange={on => update(d => { d.moderation.spam = on; })} /></div>
        <div className={s.settingRow}><div><strong>Block invite links</strong><span>Removes other servers’ invites outside #lfg</span></div><Toggle label="Block links" on={mod.links} onChange={on => update(d => { d.moderation.links = on; })} /></div>
        <div className={s.settingRow}><div><strong>All-caps filter</strong><span>Gently reminds members to turn off caps lock</span></div><Toggle label="Caps filter" on={mod.caps} onChange={on => update(d => { d.moderation.caps = on; })} /></div>
        <div className={s.settingRow}><div><strong>Mention limit · {mod.mentions}</strong><span>Max mentions in one message</span></div>
          <input type="range" min={2} max={15} value={mod.mentions} aria-label="Mention limit" onChange={e => update(d => { d.moderation.mentions = Number(e.target.value); })} style={{ accentColor: "var(--aa-gold)" }} /></div>
        <div className={s.settingRow}><div><strong>Timeout length</strong><span>Applied by the filters above</span></div>
          <select className={cx(s.input, s.select)} value={mod.timeout} aria-label="Timeout length" onChange={e => update(d => { d.moderation.timeout = e.target.value; })}>{["1 minute", "10 minutes", "1 hour", "1 day"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ paddingTop: ".6rem" }}>
          <p className={s.small} style={{ marginBottom: ".4rem" }}><strong>Blocked words & phrases</strong></p>
          <div className={s.row}>{mod.words.map(w => <span key={w} className={s.chip}>{w}<button type="button" className={s.chipX} aria-label={`Remove ${w}`} onClick={() => update(d => { d.moderation.words = d.moderation.words.filter(x => x !== w); })}><X size={12} /></button></span>)}</div>
          <form className={s.row} style={{ marginTop: ".5rem" }} onSubmit={e => { e.preventDefault(); if (!word.trim()) return; update(d => { d.moderation.words.push(word.trim()); }); setWord(""); notify("Word added to the filter (demo)."); }}>
            <input className={s.input} style={{ flex: 1 }} value={word} onChange={e => setWord(e.target.value)} placeholder="Add a word or phrase" aria-label="Blocked word" />
            <button type="submit" className={cx(s.btn, s.small)}>Add</button>
          </form>
        </div>
      </Panel>
      </ModuleGate>
      <ModuleGate id="logging" label="Logging">
      <Panel title="Logging">
        <div className={s.settingRow}><div><strong>Log channel</strong><span>Staff-only channel for the audit trail</span></div>
          <select className={cx(s.input, s.select)} value={log.channel} aria-label="Log channel" onChange={e => update(d => { d.logging.channel = e.target.value; })}>{textChannels.map(c => <option key={c}>{c}</option>)}</select></div>
        {logRows.map(([key, label]) => (
          <div key={key} className={s.settingRow}><div><strong>{label}</strong></div><Toggle label={label} on={log[key]} onChange={on => { update(d => { d.logging[key] = on; }); notify(`${label} logging ${on ? "on" : "off"}.`); }} /></div>
        ))}
      </Panel>
      </ModuleGate>
    </div>
  );
}

function Commands() {
  const { state, update, notify } = useDemo();
  const [form, setForm] = useState({ id: "", trigger: "/", reply: "", staffOnly: false });
  const editing = Boolean(form.id);
  function save() {
    update(d => {
      if (editing) d.commands = d.commands.map(c => c.id === form.id ? { ...c, ...form } : c);
      else d.commands.push({ ...form, id: `c${Date.now()}`, uses: 0 });
    });
    notify(editing ? `${form.trigger} updated.` : `${form.trigger} created. In a live bot it would be registered with Discord.`);
    setForm({ id: "", trigger: "/", reply: "", staffOnly: false });
  }
  return (
    <div className={s.split}>
      <Panel title="Custom commands" flush>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Command</th><th>Reply</th><th>Uses</th><th>Access</th><th /></tr></thead>
            <tbody>{state.commands.map(c => (
              <tr key={c.id}>
                <td><code style={{ color: "var(--aa-gold)" }}>{c.trigger}</code></td>
                <td style={{ whiteSpace: "normal", minWidth: 220 }} className={s.small}>{c.reply}</td>
                <td>{c.uses}</td>
                <td>{c.staffOnly ? <span className={s.chip} data-tone="warn">Staff</span> : <span className={s.chip}>Everyone</span>}</td>
                <td><span className={s.row} style={{ flexWrap: "nowrap" }}>
                  <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => setForm({ id: c.id, trigger: c.trigger, reply: c.reply, staffOnly: c.staffOnly })}>Edit</button>
                  <button type="button" className={s.iconBtn} aria-label={`Delete ${c.trigger}`} onClick={() => { update(d => { d.commands = d.commands.filter(x => x.id !== c.id); }); notify(`${c.trigger} deleted.`); }}><Trash2 size={14} /></button>
                </span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Panel>
      <Panel title={editing ? `Edit ${form.trigger}` : "New command"}>
        <div className={s.stack} style={{ gap: ".7rem" }}>
          <label className={s.field}><span>Command</span><input className={s.input} value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value.startsWith("/") ? e.target.value.replace(/\s/g, "") : `/${e.target.value}` })} /></label>
          <label className={s.field}><span>Bot reply</span><textarea className={s.textarea} value={form.reply} onChange={e => setForm({ ...form, reply: e.target.value })} /></label>
          <div className={s.settingRow}><div><strong>Staff only</strong></div><Toggle label="Staff only" on={form.staffOnly} onChange={on => setForm({ ...form, staffOnly: on })} /></div>
          <div className={s.row}>
            <button type="button" className={cx(s.btn, s.primary)} disabled={form.trigger.length < 2 || !form.reply.trim()} onClick={save}>{editing ? "Save command" : "Create command"}</button>
            {editing && <button type="button" className={cx(s.btn, s.ghost)} onClick={() => setForm({ id: "", trigger: "/", reply: "", staffOnly: false })}>Cancel</button>}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Automations() {
  const { state, update, notify } = useDemo();
  const [form, setForm] = useState({ name: "", channel: "#announcements", when: "" });
  const group = (kind: "automatic" | "scheduled") => state.schedules.filter(x => x.kind === kind);
  return (
    <div className={s.split}>
      <div className={s.stack}>
        {(["automatic", "scheduled"] as const).map(kind => (
          <Panel key={kind} title={kind === "automatic" ? "Automated announcements" : "Scheduled messages"}>
            {group(kind).map(item => (
              <div key={item.id} className={s.settingRow}>
                <div><strong>{item.name}</strong><span>{item.channel} · {item.when}</span></div>
                <span className={s.row} style={{ flexWrap: "nowrap" }}>
                  {kind === "scheduled" && <button type="button" className={s.iconBtn} aria-label={`Delete ${item.name}`} onClick={() => update(d => { d.schedules = d.schedules.filter(x => x.id !== item.id); })}><Trash2 size={14} /></button>}
                  <Toggle label={item.name} on={item.enabled} onChange={on => { update(d => { d.schedules.find(x => x.id === item.id)!.enabled = on; }); notify(`${item.name} ${on ? "enabled" : "paused"}.`); }} />
                </span>
              </div>
            ))}
          </Panel>
        ))}
      </div>
      <Panel title="Schedule a message">
        <div className={s.stack} style={{ gap: ".7rem" }}>
          <label className={s.field}><span>Name</span><input className={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Weekly reset reminder" /></label>
          <label className={s.field}><span>Channel</span><select className={s.input} value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>{textChannels.map(c => <option key={c}>{c}</option>)}</select></label>
          <label className={s.field}><span>Send at</span><input className={s.input} type="datetime-local" value={form.when} onChange={e => setForm({ ...form, when: e.target.value })} /></label>
          <button type="button" className={cx(s.btn, s.primary)} disabled={!form.name.trim() || !form.when} onClick={() => {
            const when = new Date(form.when).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
            update(d => { d.schedules.push({ id: `sc${Date.now()}`, name: form.name, channel: form.channel, when: `${when} ET`, enabled: true, kind: "scheduled" }); });
            notify(`“${form.name}” scheduled (simulated — nothing will post).`); setForm({ name: "", channel: "#announcements", when: "" });
          }}>Schedule</button>
        </div>
      </Panel>
    </div>
  );
}
