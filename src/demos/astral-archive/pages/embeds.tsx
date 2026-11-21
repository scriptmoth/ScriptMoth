"use client";

import { useState } from "react";
import { Plus, Save, Send, Trash2, X } from "lucide-react";
import { channels, embedArt, type Embed } from "../data";
import { useDemo } from "../store";
import { cx, EmbedPreview, PageHead, Panel } from "../ui";
import s from "../dashboard.module.css";

const colors = ["#c9a45c", "#6f9fd8", "#76b89a", "#d9776b", "#b08ad6", "#e3c27a", "#5865f2", "#2b2d31"];
const textChannels = channels.flatMap(c => c.items).filter(c => c.type !== "voice").map(c => `#${c.name}`);

export function Embeds() {
  const { state, update, notify } = useDemo();
  const [embed, setEmbed] = useState<Embed>(state.templates[0].embed);
  const [name, setName] = useState("");
  const [button, setButton] = useState("");
  const set = <K extends keyof Embed>(key: K, value: Embed[K]) => setEmbed(e => ({ ...e, [key]: value }));
  const length = embed.title.length + embed.description.length + embed.footer.length + embed.author.length;

  return (
    <>
      <PageHead title="Embed builder" sub="Design announcements, rules panels, and event posts. The preview matches how Discord draws embeds." />
      <Panel title="Templates" className={s.grid}>
        <div className={s.templateList}>
          {state.templates.map(t => (
            <button key={t.id} type="button" style={{ "--c": t.embed.color } as React.CSSProperties} onClick={() => { setEmbed(t.embed); notify(`Loaded “${t.name}”.`); }}>
              <strong className={s.small}>{t.name}</strong><span>{t.kind} · {t.embed.channel}</span>
            </button>
          ))}
          <button type="button" style={{ "--c": "var(--aa-line2)" } as React.CSSProperties} onClick={() => setEmbed({ title: "", description: "", color: "#c9a45c", footer: "", thumbnail: "", image: "", author: state.profile.name, buttons: [], channel: "#announcements" })}>
            <strong className={s.small}><Plus size={12} aria-hidden="true" /> Blank embed</strong><span>Start from scratch</span>
          </button>
        </div>
      </Panel>

      <div className={s.builder} style={{ marginTop: "1rem" }}>
        <Panel title="Edit">
          <div className={s.stack} style={{ gap: ".75rem" }}>
            <div className={s.formGrid}>
              <label className={s.field}><span>Author line</span><input className={s.input} value={embed.author} onChange={e => set("author", e.target.value)} maxLength={256} /></label>
              <label className={s.field}><span>Post to</span><select className={s.input} value={embed.channel} onChange={e => set("channel", e.target.value)}>{textChannels.map(c => <option key={c}>{c}</option>)}</select></label>
            </div>
            <label className={s.field}><span>Title</span><input className={s.input} value={embed.title} onChange={e => set("title", e.target.value)} maxLength={256} /></label>
            <label className={s.field}><span>Description · supports **bold**, *italic*, and #channel links</span><textarea className={s.textarea} style={{ minHeight: 140 }} value={embed.description} onChange={e => set("description", e.target.value)} maxLength={4096} /></label>
            <div className={s.field}>
              <span>Accent color</span>
              <div className={s.row}>
                <div className={s.swatches}>{colors.map(c => <button key={c} type="button" aria-label={c} aria-pressed={embed.color === c} style={{ background: c }} onClick={() => set("color", c)} />)}</div>
                <input type="color" className={s.colorInput} value={embed.color} onChange={e => set("color", e.target.value)} aria-label="Custom color" />
              </div>
            </div>
            <div className={s.formGrid}>
              <label className={s.field}><span>Thumbnail</span><select className={s.input} value={embed.thumbnail} onChange={e => set("thumbnail", e.target.value)}>{embedArt.map(a => <option key={a.label} value={a.id}>{a.label}</option>)}</select></label>
              <label className={s.field}><span>Large image</span><select className={s.input} value={embed.image} onChange={e => set("image", e.target.value)}>{embedArt.map(a => <option key={a.label} value={a.id}>{a.label}</option>)}</select></label>
            </div>
            <label className={s.field}><span>Footer</span><input className={s.input} value={embed.footer} onChange={e => set("footer", e.target.value)} maxLength={2048} /></label>
            <div className={s.field}>
              <span>Buttons · up to 5</span>
              <div className={s.row}>{embed.buttons.map((b, i) => <span key={i} className={s.chip}>{b}<button type="button" className={s.chipX} aria-label={`Remove ${b}`} onClick={() => set("buttons", embed.buttons.filter((_, x) => x !== i))}><X size={12} /></button></span>)}</div>
              <form className={s.row} onSubmit={e => { e.preventDefault(); if (button.trim() && embed.buttons.length < 5) { set("buttons", [...embed.buttons, button.trim()]); setButton(""); } }}>
                <input className={s.input} style={{ flex: 1 }} value={button} onChange={e => setButton(e.target.value)} placeholder="Button label" aria-label="Button label" maxLength={80} />
                <button type="submit" className={cx(s.btn, s.small)} disabled={embed.buttons.length >= 5 || !button.trim()}>Add button</button>
              </form>
            </div>
          </div>
        </Panel>

        <div className={cx(s.stack, s.sticky)}>
          <Panel title="Live preview" action={<span className={cx(s.muted, s.small)}>{length} / 6000 characters</span>}>
            <EmbedPreview embed={embed} />
          </Panel>
          <Panel>
            <div className={s.stack} style={{ gap: ".6rem" }}>
              <button type="button" className={cx(s.btn, s.primary)} disabled={!embed.title && !embed.description} onClick={() => {
                update(d => { d.activity.unshift({ who: "m1", text: `posted “${embed.title || "an embed"}” in ${embed.channel}`, when: "Just now", kind: "discord" }); if (embed.channel === "#announcements") d.announcements.unshift({ id: `n${Date.now()}`, title: embed.title || "Announcement", author: "m1", date: "2026-11-18", body: embed.description.replace(/\*/g, "").slice(0, 160) }); });
                notify(`Post to ${embed.channel} simulated — nothing was sent to Discord.`);
              }}><Send size={15} aria-hidden="true" /> Post to {embed.channel}</button>
              <div className={s.row}>
                <input className={s.input} style={{ flex: 1 }} value={name} onChange={e => setName(e.target.value)} placeholder="Template name" aria-label="Template name" />
                <button type="button" className={s.btn} disabled={!name.trim()} onClick={() => { update(d => { d.templates.push({ id: `t${Date.now()}`, name: name.trim(), kind: "Custom", embed }); }); notify(`Saved “${name.trim()}” as a template.`); setName(""); }}><Save size={15} aria-hidden="true" /> Save template</button>
              </div>
              {state.templates.length > 4 && <div className={s.row}>{state.templates.slice(4).map(t => <span key={t.id} className={s.chip}>{t.name}<button type="button" className={s.chipX} aria-label={`Delete ${t.name}`} onClick={() => update(d => { d.templates = d.templates.filter(x => x.id !== t.id); })}><Trash2 size={11} /></button></span>)}</div>}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
