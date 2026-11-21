"use client";

import { useState } from "react";
import { categoryColors, channels, engagement, fcGrowth12m, memberGrowth, messagesByDay, messagesByHour, recruitment, type EventCategory } from "../data";
import { useDemo } from "../store";
import { BarChart, cx, HBars, LineChart, PageHead, Panel, Segmented, Stat } from "../ui";
import s from "../dashboard.module.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Analytics() {
  const { state } = useDemo();
  const [range, setRange] = useState<"30d" | "90d" | "12m">("12m");
  const growth = memberGrowth[range];
  const popular = channels.flatMap(c => c.items).filter(c => c.messages > 0).sort((a, b) => b.messages - a.messages).slice(0, 7);
  const byCategory = (Object.keys(categoryColors) as EventCategory[]).map(cat => {
    const past = state.history.filter(h => h.category === cat);
    return { label: cat, value: past.reduce((sum, h) => sum + h.attended, 0) + state.events.filter(e => e.category === cat).reduce((sum, e) => sum + e.going.length, 0), color: categoryColors[cat] };
  });
  const raidRates = state.statics.map(g => {
    const slots = g.attendance.length * g.slots.filter(x => x.member).length;
    const present = g.attendance.reduce((sum, a) => sum + a.present.length, 0);
    return { label: g.name, value: slots ? Math.round(present / slots * 100) : 0, color: "var(--aa-good)" };
  });
  const maxHeat = Math.max(...messagesByHour.flat());

  return (
    <>
      <PageHead title="Analytics" sub="How the server and Free Company are doing. Numbers come from Archive Bot’s message, event, and member logs."
        actions={<Segmented label="Range" value={range} onChange={setRange} options={[{ value: "30d", label: "30 days" }, { value: "90d", label: "90 days" }, { value: "12m", label: "12 months" }]} />} />
      <div className={s.grid}>
        <div className={s.stats}>
          <Stat label="Messages / week" value="13.9k" note="+21% vs. last quarter" tone="up" />
          <Stat label="Weekly active" value={engagement.active.at(-1)} note={`of ${state.members.length} members`} />
          <Stat label="Event attendance" value="84%" note="RSVPs who showed up" tone="up" />
          <Stat label="Raid attendance" value={`${Math.round(raidRates.reduce((a, r) => a + r.value, 0) / Math.max(1, raidRates.length))}%`} note="Across all statics" />
          <Stat label="Applications" value={recruitment.applied.at(-1)} note={`${recruitment.accepted.at(-1)} accepted this month`} />
        </div>

        <div className={s.split}>
          <Panel title="Member growth">
            <LineChart labels={growth.labels} series={[
              { label: "Discord members", values: growth.values, color: "var(--aa-gold)", area: true },
              ...(range === "12m" ? [{ label: "Free Company members", values: fcGrowth12m, color: "#6f9fd8" }] : []),
            ]} />
          </Panel>
          <Panel title="Popular channels · 30 days"><HBars items={popular.map(c => ({ label: `#${c.name}`, value: c.messages }))} /></Panel>
        </div>

        <div className={s.splitEven}>
          <Panel title="Message activity by day"><BarChart labels={messagesByDay.labels} values={messagesByDay.values} color="#6f9fd8" /></Panel>
          <Panel title="When members are chatting" action={<span className={cx(s.muted, s.small)}>Eastern time</span>}>
            <div className={s.heat} role="img" aria-label="Busiest times are 8 PM to midnight, especially on weekends">
              <b />{Array.from({ length: 24 }, (_, h) => <b key={h} style={{ textAlign: "center" }}>{h % 6 === 0 ? h : ""}</b>)}
              {messagesByHour.map((row, d) => [<b key={`d${d}`}>{days[d]}</b>, ...row.map((v, h) => <span key={`${d}-${h}`} title={`${days[d]} ${h}:00 — ${v} messages`} style={{ background: `color-mix(in srgb, var(--aa-gold) ${Math.round(v / maxHeat * 100)}%, #ffffff08)` }} />)])}
            </div>
          </Panel>
        </div>

        <div className={s.cols3}>
          <Panel title="Event participation"><HBars items={byCategory} format={v => `${v} people`} /></Panel>
          <Panel title="Raid attendance"><HBars items={raidRates} format={v => `${v}%`} /></Panel>
          <Panel title="Recruitment"><BarChart labels={recruitment.labels} values={recruitment.applied} second={recruitment.accepted} color="#6f9fd8" secondColor="var(--aa-good)" names={["Applied", "Accepted"]} height={150} /></Panel>
        </div>

        <Panel title="Engagement over time">
          <LineChart labels={engagement.labels} height={160} series={[
            { label: "Weekly active members", values: engagement.active, color: "var(--aa-gold)" },
            { label: "Messages (hundreds)", values: engagement.messages.map(v => Math.round(v * 10) / 2.5), color: "#b08ad6" },
          ]} />
        </Panel>
      </div>
    </>
  );
}
