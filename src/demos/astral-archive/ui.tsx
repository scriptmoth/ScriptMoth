"use client";

import { useEffect, type ReactNode } from "react";
import { Power, X } from "lucide-react";
import { jobs, type Embed, type Job, type Member, type ModuleId, type Role } from "./data";
import { useDemo } from "./store";
import s from "./dashboard.module.css";

export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
export const roleColor: Record<Role, string> = { tank: "#5b8bd6", healer: "#5fae7c", dps: "#c95e5e" };
export const roleLabel: Record<Role, string> = { tank: "Tank", healer: "Healer", dps: "DPS" };

export function fmtDate(iso: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", ...options });
}
const offsets: Record<string, number> = { ET: 0, CT: -1, MT: -2, PT: -3, UTC: 5, "Server (UTC)": 5 };
/** Times are stored in Eastern; the settings page picks the zone they're shown in. */
export function fmtTime(time: string, zone = "ET") {
  const [h, m] = time.split(":").map(Number);
  const hour = (h + (offsets[zone] ?? 0) + 24) % 24;
  const label = zone.startsWith("Server") ? "ST" : zone;
  return `${hour % 12 || 12}:${String(m).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"} ${label}`;
}

/* ───────── Icons drawn for this demo (no game assets) ───────── */

export function RoleIcon({ role, size = 18 }: { role: Role; size?: number }) {
  const fill = roleColor[role];
  return (
    <svg className={s.roleIcon} width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={roleLabel[role]}>
      <circle cx="12" cy="12" r="11" fill={fill} stroke="#0008" strokeWidth="1" />
      {role === "tank" && <path d="M12 5.2 17.2 7v4.3c0 3.2-2.2 5.8-5.2 7.2-3-1.4-5.2-4-5.2-7.2V7Z" fill="#fff" opacity=".92" />}
      {role === "healer" && <path d="M10.3 6h3.4v4.3H18v3.4h-4.3V18h-3.4v-4.3H6v-3.4h4.3Z" fill="#fff" opacity=".92" />}
      {role === "dps" && <path d="m6.2 5.6 6.8 6.8-1.3 1.3-1.1-.6-2.9 2.9 1 1-1.2 1.2-3-3 1.2-1.2 1 1 2.9-2.9-.6-1.1Zm11.6 0-4.4 4.4 1.3 1.3 4.4-4.4Zm-3 6.8 1.1-.6 2.9 2.9-1 1 1.2 1.2 3-3-1.2-1.2-1 1-2.9-2.9.6-1.1Z" fill="#fff" opacity=".92" />}
    </svg>
  );
}

export function JobBadge({ job, full = false }: { job: Job; full?: boolean }) {
  const role = jobs[job].role;
  return (
    <span className={s.job} style={{ "--role": roleColor[role] } as React.CSSProperties} title={jobs[job].name}>
      <RoleIcon role={role} size={14} />{full ? jobs[job].name : job}
    </span>
  );
}

export function Avatar({ member, size = 32 }: { member?: Member; size?: number }) {
  if (!member) return <span className={s.avatar} style={{ width: size, height: size }} aria-hidden="true">?</span>;
  const initials = member.name.split(" ").map(part => part.replace(/[^A-Za-z]/g, "")[0]).slice(0, 2).join("");
  return (
    <span className={s.avatar} aria-hidden="true" data-presence={member.presence}
      style={{ width: size, height: size, fontSize: size * .38, background: `linear-gradient(145deg, hsl(${member.hue} 42% 52%), hsl(${(member.hue + 40) % 360} 38% 28%))` }}>
      {initials}
    </span>
  );
}

/** A painted-style placeholder portrait: gradient sky, crystal, and a bust silhouette. */
export function Portrait({ member, className }: { member: Member; className?: string }) {
  const a = `hsl(${member.hue} 45% 42%)`, b = `hsl(${(member.hue + 50) % 360} 40% 18%)`;
  const ears = member.race === "Miqo’te" || member.race === "Viera" || member.race === "Hrothgar";
  const tall = member.race === "Viera";
  const small = member.race === "Lalafell";
  const horns = member.race === "Au Ra";
  return (
    <svg className={cx(s.portrait, className)} viewBox="0 0 120 150" role="img" aria-label={`Portrait placeholder for ${member.name}`}>
      <defs>
        <linearGradient id={`p-${member.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <radialGradient id={`g-${member.id}`} cx=".5" cy=".35" r=".5"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="120" height="150" fill={`url(#p-${member.id})`} />
      <rect width="120" height="150" fill={`url(#g-${member.id})`} />
      {[18, 34, 92, 104, 70].map((x, i) => <circle key={x} cx={x} cy={14 + i * 11 % 40} r={i % 2 ? .9 : 1.4} fill="#fff" opacity=".6" />)}
      <path d="M60 18 66 30 60 44 54 30Z" fill="#d6ecff" opacity=".5" />
      <g fill="#0b0f1c" opacity=".82" transform={small ? "translate(15 30) scale(.75)" : undefined}>
        <ellipse cx="60" cy={tall ? 74 : 78} rx="17" ry="20" />
        {ears && !tall && <path d="M45 66 47 50 55 61ZM75 66 73 50 65 61Z" />}
        {tall && <path d="M50 58 46 22 56 55ZM70 58 74 22 64 55Z" />}
        {horns && <path d="M45 72 36 62 46 66ZM75 72 84 62 74 66Z" />}
        <path d="M24 150c2-26 16-40 36-40s34 14 36 40Z" />
      </g>
      <rect x="4" y="4" width="112" height="142" fill="none" stroke="#e3c27a" strokeOpacity=".55" />
    </svg>
  );
}

/* ───────── Building blocks ───────── */

export function Panel({ title, action, children, className, flush }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={cx(s.panel, flush && s.flush, className)}>
      {(title || action) && <header className={s.panelHead}>{title && <h3>{title}</h3>}{action}</header>}
      {children}
    </section>
  );
}

export function PageHead({ title, sub, actions }: { title: string; sub: string; actions?: ReactNode }) {
  return (
    <header className={s.pageHead}>
      <div><h1>{title}</h1><p>{sub}</p></div>
      {actions && <div className={s.headActions}>{actions}</div>}
    </header>
  );
}

export function Stat({ label, value, note, tone }: { label: string; value: ReactNode; note?: string; tone?: "up" | "down" }) {
  return (
    <div className={s.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small data-tone={tone}>{note}</small>}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={s.toggle} onClick={() => onChange(!on)}><span /></button>;
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className={s.seg} role="radiogroup" aria-label={label}>
      {options.map(option => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
    </div>
  );
}

export function Drawer({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={s.scrim} onClick={onClose}>
      <aside className={cx(s.drawer, wide && s.drawerWide)} role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <header className={s.drawerHead}><h2>{title}</h2><button type="button" className={s.iconBtn} onClick={onClose} aria-label="Close"><X size={18} /></button></header>
        <div className={s.drawerBody}>{children}</div>
      </aside>
    </div>
  );
}

export function Progress({ value, color }: { value: number; color?: string }) {
  return <span className={s.progress} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, value)}%`, background: color }} /></span>;
}

/** Shown in place of a page when its bot module is switched off in Settings. */
export function ModuleGate({ id, label, children }: { id: ModuleId; label: string; children: ReactNode }) {
  const { state, update, notify } = useDemo();
  if (state.modules[id]) return <>{children}</>;
  return (
    <div className={s.gate}>
      <Power size={28} aria-hidden="true" />
      <h2>{label} is switched off</h2>
      <p>This bot module is disabled in Settings, so its commands and pages are hidden from members.</p>
      <button type="button" className={cx(s.btn, s.primary)} onClick={() => { update(d => { d.modules[id] = true; }); notify(`${label} module turned on (demo only).`); }}>Turn it back on</button>
    </div>
  );
}

/* ───────── Charts (plain SVG, no chart library) ───────── */

export function LineChart({ labels, series, height = 180, format = (v: number) => String(v) }: {
  labels: string[]; series: { label: string; values: number[]; color: string; area?: boolean }[]; height?: number; format?: (v: number) => string;
}) {
  const width = 640, pad = { l: 34, r: 10, t: 12, b: 24 };
  const all = series.flatMap(line => line.values);
  const min = Math.floor(Math.min(...all) * .92), max = Math.ceil(Math.max(...all) * 1.04);
  const x = (i: number) => pad.l + i * (width - pad.l - pad.r) / Math.max(1, labels.length - 1);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (height - pad.t - pad.b);
  const ticks = [0, .5, 1].map(t => min + (max - min) * t);
  const every = Math.ceil(labels.length / 7);
  return (
    <figure className={s.chart}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={series.map(line => `${line.label}: ${line.values.at(-1)}`).join(", ")}>
        {ticks.map(t => <g key={t}><line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} className={s.gridLine} /><text x={pad.l - 6} y={y(t) + 4} textAnchor="end" className={s.axis}>{format(Math.round(t))}</text></g>)}
        {labels.map((label, i) => i % every === 0 && <text key={label + i} x={x(i)} y={height - 6} textAnchor="middle" className={s.axis}>{label}</text>)}
        {series.map(line => {
          const d = line.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
          return <g key={line.label}>
            {line.area && <path d={`${d}L${x(line.values.length - 1)},${height - pad.b}L${x(0)},${height - pad.b}Z`} fill={line.color} opacity=".14" />}
            <path d={d} fill="none" stroke={line.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(line.values.length - 1)} cy={y(line.values.at(-1)!)} r="3.5" fill={line.color} />
          </g>;
        })}
      </svg>
      {series.length > 1 && <figcaption className={s.legend}>{series.map(line => <span key={line.label}><i style={{ background: line.color }} />{line.label}</span>)}</figcaption>}
    </figure>
  );
}

export function BarChart({ labels, values, color = "var(--aa-gold)", height = 170, second, secondColor, names }: {
  labels: string[]; values: number[]; color?: string; height?: number; second?: number[]; secondColor?: string; names?: [string, string];
}) {
  const width = 640, pad = { l: 8, r: 8, t: 14, b: 24 };
  const max = Math.max(...values, ...(second ?? [])) * 1.1;
  const band = (width - pad.l - pad.r) / labels.length;
  const barW = band * (second ? .34 : .56);
  const h = (v: number) => v / max * (height - pad.t - pad.b);
  return (
    <figure className={s.chart}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={labels.map((l, i) => `${l} ${values[i]}`).join(", ")}>
        <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} className={s.gridLine} />
        {labels.map((label, i) => {
          const cx0 = pad.l + band * i + band / 2;
          return <g key={label}>
            <rect className={s.bar} x={second ? cx0 - barW - 1 : cx0 - barW / 2} y={height - pad.b - h(values[i])} width={barW} height={h(values[i])} rx="3" fill={color}><title>{`${label}: ${values[i]}`}</title></rect>
            {second && <rect className={s.bar} x={cx0 + 1} y={height - pad.b - h(second[i])} width={barW} height={h(second[i])} rx="3" fill={secondColor}><title>{`${label}: ${second[i]}`}</title></rect>}
            <text x={cx0} y={height - 7} textAnchor="middle" className={s.axis}>{label}</text>
          </g>;
        })}
      </svg>
      {names && <figcaption className={s.legend}><span><i style={{ background: color }} />{names[0]}</span><span><i style={{ background: secondColor }} />{names[1]}</span></figcaption>}
    </figure>
  );
}

export function HBars({ items, color = "var(--aa-blue)", format = (v: number) => v.toLocaleString() }: { items: { label: string; value: number; color?: string }[]; color?: string; format?: (v: number) => string }) {
  const max = Math.max(...items.map(item => item.value));
  return (
    <ul className={s.hbars}>
      {items.map(item => <li key={item.label}><span>{item.label}</span><span className={s.hbarTrack}><span style={{ width: `${item.value / max * 100}%`, background: item.color ?? color }} /></span><strong>{format(item.value)}</strong></li>)}
    </ul>
  );
}

/* ───────── Discord-style embed preview ───────── */

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|#[a-z-]+)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    if (/^#[a-z-]+$/.test(part)) return <span key={i} className={s.mention}>{part}</span>;
    return part;
  });
}

export function EmbedPreview({ embed, bot = "Archive Bot" }: { embed: Embed; bot?: string }) {
  return (
    <div className={s.discord}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG */}
      <img className={s.discordAvatar} src="/assets/portfolio/astral-archive/crest.svg" alt="" width={40} height={40} />
      <div className={s.discordBody}>
        <p className={s.discordMeta}><strong>{bot}</strong><span className={s.appTag}>APP</span><time>Today at 8:02 PM</time></p>
        <div className={s.embed} style={{ borderColor: embed.color }}>
          <div className={s.embedText}>
            {embed.author && <p className={s.embedAuthor}>{embed.author}</p>}
            {embed.title && <p className={s.embedTitle}>{embed.title}</p>}
            {embed.description && <div className={s.embedDesc}>{embed.description.split("\n").map((line, i) => <p key={i}>{line ? inline(line) : " "}</p>)}</div>}
            {/* eslint-disable-next-line @next/next/no-img-element -- local demo art */}
            {embed.image && <img className={s.embedImage} src={embed.image} alt="" />}
            {embed.footer && <p className={s.embedFooter}>{embed.footer}</p>}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- local demo art */}
          {embed.thumbnail && <img className={s.embedThumb} src={embed.thumbnail} alt="" width={80} height={80} />}
        </div>
        {embed.buttons.length > 0 && <div className={s.discordButtons}>{embed.buttons.map((label, i) => <span key={i} data-primary={i === 0 || undefined}>{label}</span>)}</div>}
      </div>
    </div>
  );
}
