"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Gift, Heart, Plus, Trophy } from "lucide-react";
import { fcAchievements } from "../data";
import { useDemo, useMember } from "../store";
import { Avatar, cx, ModuleGate, PageHead, Panel, Progress, Segmented } from "../ui";
import s from "../dashboard.module.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function Community() {
  return <ModuleGate id="community" label="Community"><CommunityInner /></ModuleGate>;
}

function CommunityInner() {
  const { state, update, notify } = useDemo();
  const member = useMember();
  const [question, setQuestion] = useState("");
  const [board, setBoard] = useState<"messages" | "events" | "screenshots">("messages");
  const [pollQ, setPollQ] = useState("");
  const leaders = [...state.members].filter(m => m.fc).sort((a, b) => b[board] - a[board]).slice(0, 8);
  const birthdays = state.members.filter(m => m.fc && m.birthday >= "11-18" && m.birthday <= "12-18").sort((a, b) => a.birthday.localeCompare(b.birthday));
  const g = state.giveaway;

  return (
    <>
      <PageHead title="Community" sub="Engagement features Archive Bot runs in #fc-chat: daily questions, polls, suggestions, giveaways, and contests." />
      <div className={s.cols3}>
        <Panel title="Question of the day">
          <p className={s.bio} style={{ fontSize: "1rem" }}>{state.qotd.current}</p>
          <p className={cx(s.muted, s.small)} style={{ margin: ".5rem 0" }}>{state.qotd.answers} answers in the thread today</p>
          <button type="button" className={cx(s.btn, s.small)} disabled={!state.qotd.queue.length} onClick={() => { update(d => { d.qotd.current = d.qotd.queue.shift()!; d.qotd.answers = 0; }); notify("Next question posted (simulated)."); }}>Post next question now</button>
          <p className={cx(s.muted, s.small)} style={{ margin: ".75rem 0 .35rem" }}>Up next · {state.qotd.queue.length} queued</p>
          <ol className={s.list}>{state.qotd.queue.map((q, i) => <li key={q + i} className={s.small}><span className={s.muted}>{i + 1}.</span><div>{q}</div></li>)}</ol>
          <form className={s.row} style={{ marginTop: ".5rem" }} onSubmit={e => { e.preventDefault(); if (!question.trim()) return; update(d => { d.qotd.queue.push(question.trim()); }); setQuestion(""); notify("Question added to the queue."); }}>
            <input className={s.input} style={{ flex: 1 }} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Add a question" aria-label="New question" />
            <button type="submit" className={cx(s.btn, s.small)}><Plus size={14} aria-hidden="true" /></button>
          </form>
        </Panel>

        <Panel title="Polls">
          {state.polls.map((poll, pi) => {
            const total = poll.options.reduce((sum, o) => sum + o.votes, 0) || 1;
            return (
              <div key={poll.id} style={{ marginBottom: "1rem" }}>
                <div className={s.spread} style={{ marginBottom: ".4rem" }}><strong className={s.small}>{poll.question}</strong>
                  <button type="button" className={cx(s.btn, s.small, s.ghost)} onClick={() => { update(d => { d.polls[pi].open = !poll.open; }); notify(poll.open ? "Poll closed." : "Poll reopened."); }}>{poll.open ? "Close" : "Reopen"}</button></div>
                {poll.options.map((o, oi) => (
                  <button key={o.label} type="button" className={s.pollOption} aria-pressed={poll.voted === oi} disabled={!poll.open} onClick={() => update(d => {
                    const p = d.polls[pi]; if (p.voted !== null) p.options[p.voted].votes--; if (p.voted === oi) { p.voted = null; return; } p.options[oi].votes++; p.voted = oi;
                  })}>
                    <i style={{ width: `${o.votes / total * 100}%` }} /><span>{o.label}</span><span>{Math.round(o.votes / total * 100)}%</span>
                  </button>
                ))}
                <p className={cx(s.muted, s.small)}>{poll.options.reduce((sum, o) => sum + o.votes, 0)} votes{!poll.open && " · closed"}</p>
              </div>
            );
          })}
          <form className={s.row} onSubmit={e => { e.preventDefault(); if (!pollQ.trim()) return; update(d => { d.polls.unshift({ id: `p${Date.now()}`, question: pollQ.trim(), options: [{ label: "Yes", votes: 0 }, { label: "No", votes: 0 }], open: true, voted: null }); }); setPollQ(""); notify("Yes/no poll created (simulated)."); }}>
            <input className={s.input} style={{ flex: 1 }} value={pollQ} onChange={e => setPollQ(e.target.value)} placeholder="Quick yes/no poll" aria-label="New poll question" />
            <button type="submit" className={cx(s.btn, s.small)}>Create</button>
          </form>
        </Panel>

        <Panel title="Giveaway" action={<Gift size={18} color="var(--aa-gold)" aria-hidden="true" />}>
          <p><strong>{g.prize}</strong></p>
          <p className={cx(s.muted, s.small)} style={{ margin: ".3rem 0 .8rem" }}>Ends {g.ends} · {g.entrants} entrants · FC members only</p>
          {g.winner ? <p className={s.notice}><strong>Winner: {g.winner}</strong> 🎉<br /><small>A live bot would DM the winner.</small></p> : (
            <div className={s.row}>
              <button type="button" className={cx(s.btn, g.entered ? s.ghost : s.primary)} onClick={() => update(d => { d.giveaway.entered = !g.entered; d.giveaway.entrants += g.entered ? -1 : 1; })}>{g.entered ? "Leave giveaway" : "Enter giveaway"}</button>
              <button type="button" className={s.btn} onClick={() => { const pool = state.members.filter(m => m.fc); const winner = pool[Math.floor(Math.random() * pool.length)].name; update(d => { d.giveaway.winner = winner; }); notify(`${winner} drew the winning ticket!`); }}>Draw winner</button>
            </div>
          )}
          {g.winner && <button type="button" className={cx(s.btn, s.small, s.ghost)} style={{ marginTop: ".5rem" }} onClick={() => update(d => { d.giveaway.winner = ""; })}>Reroll</button>}
          {state.modules.birthdays && <><p className={cx(s.muted, s.small)} style={{ margin: "1.2rem 0 .4rem" }}>Upcoming birthdays</p>
          <ul className={s.list}>{birthdays.slice(0, 4).map(m => <li key={m.id}><Avatar member={m} size={26} /><div className={s.small}><strong>{m.name}</strong></div><span className={s.chip} data-tone="gold">{months[Number(m.birthday.slice(0, 2)) - 1]} {Number(m.birthday.slice(3))}</span></li>)}</ul></>}
        </Panel>
      </div>

      <div className={s.split} style={{ marginTop: "1rem" }}>
        <Panel title="Screenshot contest · “Light & Shadow”" action={<span className={cx(s.muted, s.small)}>Voting closes Sunday</span>}>
          <div className={s.shots}>
            {[...state.contest].sort((a, b) => b.votes - a.votes).map((entry, rank) => (
              <article key={entry.id} className={s.shot}>
                <div className={s.shotArt} style={{ background: `linear-gradient(160deg, ${entry.palette[0]}, ${entry.palette[1]} 55%, ${entry.palette[2]})` }} />
                <div>
                  <strong>{rank === 0 && <Trophy size={13} color="var(--aa-gold)" aria-hidden="true" />} {entry.title}</strong>
                  <span className={s.muted}>by {member(entry.by)?.name}</span>
                  <button type="button" className={cx(s.btn, s.small, entry.mine ? s.primary : "")} onClick={() => update(d => { const x = d.contest.find(c => c.id === entry.id)!; x.votes += x.mine ? -1 : 1; x.mine = !x.mine; })}><Heart size={13} aria-hidden="true" /> {entry.votes}</button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <div className={s.stack}>
          <Panel title="Suggestions">
            <ul className={s.list}>
              {state.suggestions.map((sg, i) => (
                <li key={sg.id}>
                  <div className={s.vote}>
                    <button type="button" aria-label="Upvote" aria-pressed={sg.mine === 1} onClick={() => update(d => { const x = d.suggestions[i]; x.votes -= x.mine; x.mine = x.mine === 1 ? 0 : 1; x.votes += x.mine; })}><ChevronUp size={18} /></button>
                    <strong>{sg.votes}</strong>
                    <button type="button" aria-label="Downvote" aria-pressed={sg.mine === -1} onClick={() => update(d => { const x = d.suggestions[i]; x.votes -= x.mine; x.mine = x.mine === -1 ? 0 : -1; x.votes += x.mine; })}><ChevronDown size={18} /></button>
                  </div>
                  <div><p className={s.small}>{sg.text}</p><p className={cx(s.muted, s.small)}>{member(sg.by)?.name}</p></div>
                  <select className={cx(s.input, s.select)} value={sg.status} aria-label="Suggestion status" onChange={e => { const v = e.target.value as typeof sg.status; update(d => { d.suggestions[i].status = v; }); notify(`Suggestion marked “${v}”.`); }} style={{ fontSize: ".75rem", minHeight: 28 }}>
                    <option>in review</option><option>planned</option><option>done</option>
                  </select>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Activity leaderboard" action={<Segmented label="Leaderboard" value={board} onChange={setBoard} options={[{ value: "messages", label: "Chat" }, { value: "events", label: "Events" }, { value: "screenshots", label: "Shots" }]} />}>
            <ol className={s.list}>{leaders.map((m, i) => <li key={m.id}><span className={s.rank} style={{ width: 18, color: i < 3 ? "var(--aa-gold)" : undefined }}>{i + 1}</span><Avatar member={m} size={24} /><div className={s.small}><strong>{m.name}</strong></div><strong className={s.small}>{m[board].toLocaleString()}</strong></li>)}</ol>
          </Panel>
          <Panel title="Free Company achievements">
            <div className={s.stack} style={{ gap: ".6rem" }}>
              {fcAchievements.map(a => <div key={a.title}><div className={s.spread}><span className={s.small}>{a.title}</span><span className={cx(s.small, s.muted)}>{a.value} / {a.goal}</span></div><Progress value={a.value / a.goal * 100} /></div>)}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
