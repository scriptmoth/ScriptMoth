"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  activity, announcements, botModules, contestEntries, permissionList, qotdQueue, seedApplications, seedCommands, seedEvents, seedHistory,
  seedMembers, seedPolls, seedRoleMenus, seedRoles, seedSchedules, seedStatics, seedSuggestions, seedTemplates, FC, type ModuleId,
} from "./data";

/* All demo state lives here: one object, cloned from the seed data, saved to this browser only. */

const STORAGE_KEY = "astral-archive-demo-v1";

export type Page = "overview" | "members" | "characters" | "events" | "raids" | "discord" | "embeds" | "applications" | "community" | "analytics" | "settings";

function seed() {
  return structuredClone({
    members: seedMembers, events: seedEvents, history: seedHistory, statics: seedStatics, applications: seedApplications,
    roles: seedRoles, commands: seedCommands, schedules: seedSchedules, roleMenus: seedRoleMenus,
    polls: seedPolls, suggestions: seedSuggestions, contest: contestEntries.map(entry => ({ ...entry, mine: false })),
    qotd: { current: "What's the best glamour you've ever seen in the wild?", answers: 23, queue: qotdQueue },
    giveaway: { prize: "Starlit Gala glamour set (FC raffle)", ends: "Nov 25", entrants: 31, entered: false, winner: "" },
    templates: seedTemplates, announcements, activity,
    modules: Object.fromEntries(botModules.map(module => [module.id, true])) as Record<ModuleId, boolean>,
    welcome: { enabled: true, channel: "#welcome", dm: true, message: "Welcome to **The Astral Archive**, {user}! ✦\nGrab your roles in #pick-your-roles and say hi in #fc-chat. Applications to join the FC are in #welcome.", autoRole: "Friend of the Archive" },
    logging: { channel: "#mod-log", messages: true, members: true, roles: true, voice: false, invites: true },
    moderation: { spam: true, links: false, caps: true, mentions: 5, words: ["spoilers-without-tags", "rmt", "gil selling"], timeout: "10 minutes" },
    profile: { name: FC.name, tag: FC.tag, world: FC.world, dc: FC.dc, motto: FC.motto, accent: "#c9a45c", recruiting: true },
    server: { name: "The Astral Archive", announce: "#announcements", events: "#announcements", applications: "#applications", prefix: "/" },
    timezone: "ET",
    notify: { newApplication: true, eventFull: true, staticSub: true, weeklyDigest: false, modAlerts: true },
    permissions: Object.fromEntries(["Archivist", "Curator", "Raid Lead"].map(rank => [rank, Object.fromEntries(permissionList.map(p => [p, rank !== "Raid Lead" || ["Manage statics", "Edit events"].includes(p)]))])) as Record<string, Record<string, boolean>>,
  });
}
export type DemoState = ReturnType<typeof seed>;

type Toast = { id: number; text: string };
type Ctx = {
  state: DemoState;
  update: (change: (draft: DemoState) => void) => void;
  reset: () => void;
  notify: (text: string) => void;
  toasts: Toast[];
  page: Page;
  go: (page: Page, intent?: string) => void;
  intent: string;
  clearIntent: () => void;
};
const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children, persist = true }: { children: ReactNode; persist?: boolean }) {
  const [state, setState] = useState(seed);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [page, setPage] = useState<Page>("overview");
  const [intent, setIntent] = useState("");
  const loaded = useRef(false);

  // Load saved demo data after mount so the server render always matches the seed.
  useEffect(() => {
    if (!persist) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Syncing from browser storage after hydration is the intended use of this effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setState({ ...seed(), ...JSON.parse(saved) });
    } catch { /* storage blocked: fall back to seed data */ }
    loaded.current = true;
  }, [persist]);

  useEffect(() => {
    if (!persist || !loaded.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, persist]);

  const notify = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current.slice(-2), { id, text }]);
    setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 3600);
  }, []);

  const value = useMemo<Ctx>(() => ({
    state, toasts, page, intent,
    update: change => setState(current => { const draft = structuredClone(current); change(draft); return draft; }),
    reset: () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setState(seed()); setPage("overview");
      notify("Demo data reset to the original sample Free Company.");
    },
    notify,
    go: (next, nextIntent = "") => { setPage(next); setIntent(nextIntent); },
    clearIntent: () => setIntent(""),
  }), [state, toasts, page, intent, notify]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}

/** Look up a member by id, with a harmless fallback for removed ids. */
export function useMember() {
  const { state } = useDemo();
  return useCallback((id: string | null | undefined) => state.members.find(member => member.id === id), [state.members]);
}
