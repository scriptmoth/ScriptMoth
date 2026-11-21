/* Fictional sample data for The Astral Archive, a made-up FFXIV Free Company.
   Every name, member, and number here is invented for the portfolio demo. */

export type Role = "tank" | "healer" | "dps";
export type Rank = "Archivist" | "Curator" | "Raid Lead" | "Scribe" | "Reader" | "Initiate" | "Friend";
export type Presence = "online" | "idle" | "offline";

export const DEMO_TODAY = "2026-11-18"; // a Wednesday; every date in the demo is relative to this
export const FC = { name: "The Astral Archive", tag: "«ARCV»", world: "Balmung", dc: "Crystal", founded: "2023-02-14", motto: "Every story deserves a shelf." };

export const jobs = {
  PLD: { name: "Paladin", role: "tank" }, WAR: { name: "Warrior", role: "tank" }, DRK: { name: "Dark Knight", role: "tank" }, GNB: { name: "Gunbreaker", role: "tank" },
  WHM: { name: "White Mage", role: "healer" }, SCH: { name: "Scholar", role: "healer" }, AST: { name: "Astrologian", role: "healer" }, SGE: { name: "Sage", role: "healer" },
  MNK: { name: "Monk", role: "dps" }, DRG: { name: "Dragoon", role: "dps" }, NIN: { name: "Ninja", role: "dps" }, SAM: { name: "Samurai", role: "dps" }, RPR: { name: "Reaper", role: "dps" }, VPR: { name: "Viper", role: "dps" },
  BRD: { name: "Bard", role: "dps" }, MCH: { name: "Machinist", role: "dps" }, DNC: { name: "Dancer", role: "dps" },
  BLM: { name: "Black Mage", role: "dps" }, SMN: { name: "Summoner", role: "dps" }, RDM: { name: "Red Mage", role: "dps" }, PCT: { name: "Pictomancer", role: "dps" },
} as const satisfies Record<string, { name: string; role: Role }>;
export type Job = keyof typeof jobs;
export const jobList = Object.keys(jobs) as Job[];
export const jobsFor = (role: Role) => jobList.filter(job => jobs[job].role === role);

export const worlds = {
  Crystal: ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"],
  Aether: ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"],
  Primal: ["Behemoth", "Excalibur", "Exodus", "Famfrit", "Hyperion", "Lamia", "Leviathan", "Ultros"],
} as const;
export type DataCenter = keyof typeof worlds;

export type Member = {
  id: string; discord: string; name: string; world: string; dc: DataCenter; race: string;
  main: Job; alts: Job[]; prefs: Role[]; rank: Rank; joined: string; presence: Presence; lastActive: number;
  messages: number; events: number; screenshots: number; fc: boolean; hue: number; notes: string;
  bio: string; availability: number[]; achievements: string[]; raidExp: string[]; birthday: string;
};

/* Small seeded random so the generated roster is identical on every load. */
function seeded(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const rand = seeded(1402);
const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
const between = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1));
const date = (offsetDays: number) => { const day = new Date(`${DEMO_TODAY}T12:00:00Z`); day.setUTCDate(day.getUTCDate() + offsetDays); return day.toISOString().slice(0, 10); };

const races = ["Hyur", "Elezen", "Lalafell", "Miqo’te", "Roegadyn", "Au Ra", "Viera", "Hrothgar"];
const firstNames: Record<string, string[]> = {
  Hyur: ["Edda", "Corwin", "Maelis", "Tobin", "Rosalind", "Aldric", "Wren", "Isolde"],
  Elezen: ["Aurelie", "Gaspard", "Seraphine", "Ysolde", "Lucien", "Margaux", "Ondine"],
  Lalafell: ["Popoli", "Tatanora", "Mimiru", "Kokoshi", "Lolorito", "Pipina", "Rerenu"],
  "Miqo’te": ["Y'shani", "M'rhali", "Kaiha", "R'aesa", "Nhaza", "S'yrah", "Zhenn"],
  Roegadyn: ["Brynja", "Hjalmar", "Sigrun", "Thorgrim", "Ragnhild", "Osric"],
  "Au Ra": ["Kaede", "Haruki", "Sayo", "Toramaru", "Aiko", "Sora", "Mirei"],
  Viera: ["Ilsabet", "Fyrnn", "Kalinne", "Vessa", "Ryuna", "Ezla"],
  Hrothgar: ["Garrow", "Ursk", "Brannoch", "Tavric", "Hollin"],
};
const lastNames: Record<string, string[]> = {
  Hyur: ["Ashgrove", "Vantell", "Moorcroft", "Halloway", "Brightwater", "Kestrel"],
  Elezen: ["de Valmont", "Laurent", "Beaumarais", "Fontaine", "Duclair"],
  Lalafell: ["Lolo", "Tata", "Mimi", "Koko", "Pipi", "Rere"],
  "Miqo’te": ["Tia", "Nunh", "Rhul", "Sahli", "Khuh"],
  Roegadyn: ["Stormhild", "Ironbrand", "Wavecaller", "Saltmane"],
  "Au Ra": ["Hoshino", "Mizuki", "Takeda", "Kurosawa", "Amane"],
  Viera: ["Rhiel", "Stellan", "Vael", "Orrin"],
  Hrothgar: ["Emberfang", "Greymantle", "Thornhide"],
};
const handles = ["moon", "ink", "lantern", "quill", "star", "folio", "ember", "tide", "ash", "fern", "glim", "dusk", "petal", "rune"];
const bios = [
  "Wandered in for the housing tours and stayed for the people. Usually found decorating the FC house at 2 a.m.",
  "Treasure map enthusiast who swears the next portal will be the good one.",
  "Former PvP main turned weekly-roulette regular. Brings snacks to every voice chat.",
  "Collects minions, glamour plates, and bad puns in roughly equal measure.",
  "Quiet crafter who keeps the FC stocked with food and potions before every raid night.",
  "Came back for the latest expansion and immediately got talked into learning a healer.",
  "Screenshot photographer — if there's a sunset, expect a group photo request.",
  "Ocean fishing addict. Knows every spectral current by heart.",
];
const achievementPool = ["All Savage floors cleared", "Ultimate clear", "Mentor crown", "500 treasure maps", "Every Gold Saucer card", "Island Sanctuary rank 20", "Master crafter (all DoH)", "Hunt train conductor", "Glamour Contest winner", "All Extreme mounts", "Deep Dungeon floor 200", "Ocean Fishing — every blue fish"];
const raidPool = ["Current Savage — on progression", "Previous tier Savage — full clear", "Unreal trials — weekly", "Ultimate — learning", "Alliance raids — every week", "Extreme trials — mount farm", "Chaotic alliance raid — cleared"];

/* The twelve officers and raid leads, written by hand so they feel like real people. */
const officers: Partial<Member>[] = [
  { name: "Seraphine Laurent", race: "Elezen", main: "AST", alts: ["SCH", "RDM"], rank: "Archivist", discord: "seraphine.ink", bio: "Founded the Archive after one too many PUG wipes. Runs the weekly officer meeting and the FC newsletter.", prefs: ["healer"] },
  { name: "Kaede Hoshino", race: "Au Ra", main: "SAM", alts: ["NIN", "DRG"], rank: "Curator", discord: "kaede_h", bio: "Events coordinator. If it happens on a weekend, Kaede planned it.", prefs: ["dps"] },
  { name: "Brynja Stormhild", race: "Roegadyn", main: "WAR", alts: ["GNB"], rank: "Curator", discord: "brynja.storm", bio: "Recruitment officer and the friendliest wall in Eorzea.", prefs: ["tank"] },
  { name: "Popoli Lolo", race: "Lalafell", main: "BLM", alts: ["PCT", "SMN"], rank: "Curator", discord: "popoli", bio: "Keeps the Discord tidy, writes the embeds, and fears no rotation.", prefs: ["dps"] },
  { name: "Y'shani Tia", race: "Miqo’te", main: "DNC", alts: ["BRD"], rank: "Curator", discord: "yshani.tia", bio: "Glamour Contest judge and screenshot curator.", prefs: ["dps"] },
  { name: "Aldric Moorcroft", race: "Hyur", main: "PLD", alts: ["DRK"], rank: "Curator", discord: "aldric.m", bio: "New player mentor. Runs Help Night every Wednesday.", prefs: ["tank", "healer"] },
  { name: "Ilsabet Rhiel", race: "Viera", main: "SGE", alts: ["WHM"], rank: "Curator", discord: "ilsabet", bio: "Housing chair. Has opinions about wallpaper.", prefs: ["healer"] },
  { name: "Garrow Emberfang", race: "Hrothgar", main: "MNK", alts: ["RPR"], rank: "Curator", discord: "garrow_ember", bio: "Treasury and the FC's craft-and-gather supply lead.", prefs: ["dps"] },
  { name: "Haruki Takeda", race: "Au Ra", main: "GNB", alts: ["DRK", "WAR"], rank: "Raid Lead", discord: "haruki.gnb", bio: "Leads Starlight Codex. Has a spreadsheet for everything.", prefs: ["tank"] },
  { name: "Margaux Fontaine", race: "Elezen", main: "WHM", alts: ["AST"], rank: "Raid Lead", discord: "margaux.f", bio: "Leads Inkwell, the Archive's midcore Savage static.", prefs: ["healer"] },
  { name: "Thorgrim Ironbrand", race: "Roegadyn", main: "DRK", alts: ["PLD"], rank: "Raid Lead", discord: "thorgrim", bio: "Leads Margin Notes — patient prog, no blame, lots of jokes.", prefs: ["tank"] },
  { name: "Mimiru Mimi", race: "Lalafell", main: "MCH", alts: ["BRD", "DNC"], rank: "Raid Lead", discord: "mimiru.mimi", bio: "Leads Bookends, the Extreme and Unreal farm group.", prefs: ["dps"] },
];

const used = new Set(officers.map(item => item.name));
function uniqueName(race: string) {
  for (let tries = 0; tries < 40; tries++) {
    const name = `${pick(firstNames[race])} ${pick(lastNames[race])}`;
    if (!used.has(name)) { used.add(name); return name; }
  }
  const fallback = `${pick(firstNames[race])} ${pick(lastNames[race])} ${used.size}`;
  used.add(fallback); return fallback;
}

function makeMember(index: number, base: Partial<Member>, fc: boolean): Member {
  const race = base.race ?? pick(races);
  const main = base.main ?? pick(jobList);
  const role = jobs[main].role;
  const alts = base.alts ?? Array.from(new Set([pick(jobList), pick(jobList)])).filter(job => job !== main).slice(0, between(1, 2));
  const name = base.name ?? uniqueName(race);
  const officer = ["Archivist", "Curator", "Raid Lead"].includes(base.rank ?? "");
  const dc: DataCenter = officer ? "Crystal" : fc ? (rand() < .82 ? "Crystal" : pick(["Aether", "Primal"] as const)) : pick(["Crystal", "Aether", "Primal"] as const);
  const world = officer || (fc && dc === "Crystal" && rand() < .7) ? "Balmung" : pick(worlds[dc]);
  const presenceRoll = rand();
  const lastActive = presenceRoll < .3 ? 0 : between(0, presenceRoll < .85 ? 6 : 40);
  return {
    id: `m${index}`,
    discord: base.discord ?? `${name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}.${pick(handles)}${between(1, 99)}`,
    name, world, dc, race, main, alts,
    prefs: base.prefs ?? (rand() < .25 ? [role, pick(["tank", "healer", "dps"] as const)].filter((v, i, a) => a.indexOf(v) === i) as Role[] : [role]),
    rank: base.rank ?? "Reader",
    joined: date(-between(officer ? 500 : 20, officer ? 1350 : 900)),
    presence: lastActive === 0 ? (presenceRoll < .2 ? "online" : "idle") : "offline",
    lastActive,
    messages: between(officer ? 600 : 20, officer ? 2400 : 900),
    events: between(officer ? 18 : 0, officer ? 40 : 22),
    screenshots: between(0, 30),
    fc, hue: between(0, 359), notes: "",
    bio: base.bio ?? pick(bios),
    availability: [0, 1, 2, 3, 4, 5, 6].filter(() => rand() < .5),
    achievements: Array.from(new Set([pick(achievementPool), pick(achievementPool), pick(achievementPool)])),
    raidExp: Array.from(new Set([pick(raidPool), pick(raidPool)])),
    birthday: `${String(between(1, 12)).padStart(2, "0")}-${String(between(1, 28)).padStart(2, "0")}`,
  };
}

/* 62 Free Company members (1 Archivist, 7 Curators, 4 Raid Leads, then Scribes, Readers, Initiates)
   plus 23 Discord-only friends = 85 Discord members. */
const fcRanks: Rank[] = [...Array(20).fill("Scribe"), ...Array(22).fill("Reader"), ...Array(8).fill("Initiate")];
export const seedMembers: Member[] = [
  ...officers.map((base, index) => makeMember(index + 1, base, true)),
  ...fcRanks.map((rank, index) => makeMember(index + 13, { rank }, true)),
  ...Array.from({ length: 23 }, (_, index) => makeMember(index + 63, { rank: "Friend" }, false)),
];
// A few hand-placed details so the story lines up across pages.
seedMembers[0].joined = FC.founded;
seedMembers[0].notes = "FC leader. Holds the Discord owner account and the FC chest keys.";
seedMembers[2].notes = "Runs recruitment interviews on Tuesdays and Saturdays.";
seedMembers[20].notes = "Asked about joining a Savage static — talk to Haruki.";
seedMembers[0].presence = "online"; seedMembers[0].lastActive = 0;
seedMembers[1].birthday = "11-21"; seedMembers[14].birthday = "11-24"; seedMembers[33].birthday = "11-29"; seedMembers[48].birthday = "12-03";

export const rankOrder: Rank[] = ["Archivist", "Curator", "Raid Lead", "Scribe", "Reader", "Initiate", "Friend"];

/* ───────────── Events ───────────── */

export type EventCategory = "Raid" | "Casual" | "Social" | "Contest" | "Learning";
export const categoryColors: Record<EventCategory, string> = { Raid: "#d9776b", Casual: "#6f9fd8", Social: "#c9a45c", Contest: "#b08ad6", Learning: "#76b89a" };

export type FcEvent = {
  id: string; title: string; category: EventCategory; date: string; start: string; duration: number;
  days: number[]; // weekly repeat days (0 = Sunday); empty for one-off events
  host: string; location: string; description: string; reminder: string;
  going: string[]; maybe: string[]; declined: string[]; attended: string[];
};

const fcIds = seedMembers.filter(member => member.fc).map(member => member.id);
const crowd = (count: number, offset: number) => Array.from({ length: count }, (_, index) => fcIds[(offset + index * 7) % fcIds.length]).filter((v, i, a) => a.indexOf(v) === i);

function rsvps(count: number) {
  const going = crowd(count, count * 3);
  const maybe = crowd(12, count * 5 + 2).filter(id => !going.includes(id)).slice(0, Math.min(6, Math.ceil(count / 3)));
  const declined = crowd(12, count + 11).filter(id => !going.includes(id) && !maybe.includes(id)).slice(0, 3);
  return { going, maybe, declined };
}

const ev = (id: string, title: string, category: EventCategory, day: number, start: string, duration: number, days: number[], host: string, location: string, description: string, going: number): FcEvent => ({
  id, title, category, date: date(day), start, duration, days, host, location, description, reminder: "1 hour before",
  ...rsvps(going), attended: [],
});

export const seedEvents: FcEvent[] = [
  ev("e1", "Weekly Treasure Maps", "Casual", -15, "21:00", 90, [2], "m8", "FC House · Mist W12 P30", "Bring your timeworn maps — we run portals until someone gets the good room.", 14),
  ev("e2", "Savage Raid Progression", "Raid", -16, "20:00", 180, [1, 4], "m9", "Party Finder · Starlight Codex", "Starlight Codex prog nights. Food and pots provided by the FC chest.", 8),
  ev("e3", "Mount Farming", "Casual", -11, "19:00", 120, [6], "m12", "Duty Finder · Extreme trials", "Ten clears of this patch's Extremes, then we vote on an old one.", 11),
  ev("e4", "Glamour Contest: Starfall Gala", "Contest", 10, "20:30", 120, [], "m5", "FC House · Grand Hall", "Theme: celestial formalwear. Judges announced the day before.", 19),
  ev("e5", "Housing Decoration Night", "Social", 3, "20:00", 120, [], "m7", "FC House · Mist W12 P30", "Help redecorate the library wing for winter. Furnishing glamours welcome.", 12),
  ev("e6", "Ocean Fishing", "Casual", -10, "18:00", 60, [0], "m4", "Limsa Lominsa · Arcanists' Guild dock", "Every Sunday route. Bring Versatile Lures and good vibes.", 9),
  ev("e7", "Alliance Raid Roulette", "Casual", -12, "20:00", 120, [5], "m2", "Duty Finder", "Queue as a full party and fill the rest. Tomes for everyone.", 16),
  ev("e8", "New Player Help Night", "Learning", -14, "19:00", 90, [3], "m6", "Discord · #help-desk + Voice", "MSQ help, dungeon runs, and a no-judgement Q&A for anyone new.", 10),
  ev("e9", "Screenshot Gathering", "Social", 17, "21:00", 90, [], "m5", "Kugane · Bokairo Inn rooftop", "Monthly group photo. Dress code: winter coats.", 22),
];
seedEvents[7].attended = seedEvents[7].going.slice(0, 8);

export const seedHistory = [
  { id: "h1", title: "Halloween Costume Crawl", category: "Contest" as EventCategory, date: "2026-10-31", rsvps: 27, attended: 24 },
  { id: "h2", title: "Savage Raid Progression", category: "Raid" as EventCategory, date: "2026-11-16", rsvps: 8, attended: 8 },
  { id: "h3", title: "Ocean Fishing", category: "Casual" as EventCategory, date: "2026-11-15", rsvps: 11, attended: 9 },
  { id: "h4", title: "Mount Farming", category: "Casual" as EventCategory, date: "2026-11-14", rsvps: 12, attended: 10 },
  { id: "h5", title: "Alliance Raid Roulette", category: "Casual" as EventCategory, date: "2026-11-13", rsvps: 15, attended: 17 },
  { id: "h6", title: "Savage Raid Progression", category: "Raid" as EventCategory, date: "2026-11-12", rsvps: 8, attended: 7 },
  { id: "h7", title: "New Player Help Night", category: "Learning" as EventCategory, date: "2026-11-11", rsvps: 9, attended: 11 },
  { id: "h8", title: "Weekly Treasure Maps", category: "Casual" as EventCategory, date: "2026-11-10", rsvps: 13, attended: 12 },
];

/* ───────────── Raid statics ───────────── */

export const slotNames = ["MT", "OT", "H1", "H2", "M1", "M2", "R1", "R2"] as const;
export const slotRole = (slot: string): Role => slot.startsWith("H") ? "healer" : slot.endsWith("T") ? "tank" : "dps";
export type Slot = { slot: typeof slotNames[number]; member: string | null; job: Job | null };
export type Static = {
  id: string; name: string; lead: string; goal: string; schedule: string; days: number[]; start: string;
  slots: Slot[]; subs: string[]; waitlist: string[]; floors: { name: string; cleared: boolean; best: number }[];
  notes: string; attendance: { date: string; present: string[] }[]; availability: Record<string, number[]>;
};

const party = (pairs: [string, Job][]): Slot[] => slotNames.map((slot, index) => ({ slot, member: pairs[index]?.[0] ?? null, job: pairs[index]?.[1] ?? null }));
const floors = (cleared: number, best: number) => ["Floor 1", "Floor 2", "Floor 3", "Floor 4"].map((name, index) => ({ name, cleared: index < cleared, best: index < cleared ? 100 : index === cleared ? best : 0 }));
const attendance = (slots: Slot[], dates: string[]) => dates.map((day, index) => ({ date: day, present: slots.filter((s, i) => s.member && (index + i) % 9 !== 0).map(s => s.member!) }));
const availability = (slots: Slot[], days: number[]) => Object.fromEntries(slots.filter(s => s.member).map((s, i) => [s.member!, days.filter((_, d) => (i + d) % 5 !== 0)]));

const codex = party([["m9", "GNB"], ["m3", "WAR"], ["m1", "AST"], ["m7", "SGE"], ["m2", "SAM"], ["m8", "MNK"], ["m5", "DNC"], ["m4", "BLM"]]);
const inkwell = party([["m6", "PLD"], ["m16", "DRK"], ["m10", "WHM"], ["m19", "SCH"], ["m22", "RPR"], ["m25", "VPR"], ["m28", "BRD"], ["m31", "PCT"]]);
const margin = party([["m11", "DRK"], ["m34", "PLD"], ["m37", "WHM"], [null as never, null as never], ["m40", "DRG"], ["m43", "NIN"], ["m46", "MCH"], ["m49", "SMN"]]);
const bookends = party([["m52", "WAR"], ["m55", "GNB"], ["m58", "AST"], ["m61", "SGE"], ["m14", "MNK"], ["m17", "RPR"], ["m12", "MCH"], ["m20", "RDM"]]);

export const seedStatics: Static[] = [
  { id: "s1", name: "Starlight Codex", lead: "m9", goal: "Week-one Savage clears", schedule: "Mon & Thu · 8–11 PM ET", days: [1, 4], start: "20:00", slots: codex, subs: ["m13", "m23"], waitlist: ["m21"], floors: floors(3, 41), notes: "Floor 4: two-tank LB3 at the second enrage check. Healers swap cleanse duty after the add phase.", attendance: attendance(codex, ["2026-11-02", "2026-11-05", "2026-11-09", "2026-11-12", "2026-11-16"]), availability: availability(codex, [1, 2, 4, 6]) },
  { id: "s2", name: "Inkwell", lead: "m10", goal: "Clear the tier before the next patch", schedule: "Tue & Fri · 9–12 PM ET", days: [2, 5], start: "21:00", slots: inkwell, subs: ["m26"], waitlist: ["m29", "m32"], floors: floors(2, 63), notes: "Floor 3: use the clock spots from the FC strat board. Melee uptime plan pinned in #static-inkwell.", attendance: attendance(inkwell, ["2026-11-03", "2026-11-06", "2026-11-10", "2026-11-13", "2026-11-17"]), availability: availability(inkwell, [2, 3, 5, 0]) },
  { id: "s3", name: "Margin Notes", lead: "m11", goal: "Relaxed prog, no blame, all welcome", schedule: "Sat · 7–10 PM ET", days: [6], start: "19:00", slots: margin, subs: ["m35"], waitlist: ["m38", "m41", "m44"], floors: floors(1, 28), notes: "Need a second healer — ask in #lfg if you're curious. We review a pull log at the end of each night.", attendance: attendance(margin, ["2026-10-24", "2026-10-31", "2026-11-07", "2026-11-14"]), availability: availability(margin, [5, 6, 0]) },
  { id: "s4", name: "Bookends", lead: "m12", goal: "Extreme & Unreal farm", schedule: "Sun · 4–6 PM ET", days: [0], start: "16:00", slots: bookends, subs: [], waitlist: ["m47"], floors: [{ name: "Extreme I", cleared: true, best: 100 }, { name: "Extreme II", cleared: true, best: 100 }, { name: "Unreal", cleared: true, best: 100 }, { name: "Extreme III", cleared: false, best: 74 }], notes: "Mount totem count lives in the pinned spreadsheet. Bring food!", attendance: attendance(bookends, ["2026-10-25", "2026-11-01", "2026-11-08", "2026-11-15"]), availability: availability(bookends, [0, 6]) },
];

/* ───────────── Applications ───────────── */

export type Application = {
  id: string; character: string; discord: string; world: string; dc: DataCenter; jobs: Job[]; playstyle: string;
  hours: string; found: string; about: string; submitted: string; status: "new" | "interview" | "accepted" | "declined";
  comments: { by: string; text: string; when: string }[];
};
export const seedApplications: Application[] = [
  { id: "a1", character: "Lysandre Vautrin", discord: "lysandre.v", world: "Balmung", dc: "Crystal", jobs: ["RDM", "SCH"], playstyle: "Midcore · wants to try Savage", hours: "Weeknights after 7 PM ET", found: "Party Finder — ran a map with Kaede", about: "Returning player, finished the latest MSQ last week. Looking for a social FC with raid options.", submitted: date(-1), status: "new", comments: [] },
  { id: "a2", character: "Nanazu Nazu", discord: "nanazu", world: "Mateus", dc: "Crystal", jobs: ["WHM"], playstyle: "Casual · events and housing", hours: "Weekends", found: "Recruitment post on the Balmung board", about: "Brand new to the game! I love decorating and want people to do dungeons with.", submitted: date(-2), status: "new", comments: [{ by: "m6", text: "Perfect fit for Help Night. Happy to mentor.", when: date(-1) }] },
  { id: "a3", character: "Corvin Ashgrove", discord: "corvin.ash", world: "Gilgamesh", dc: "Aether", jobs: ["DRK", "GNB"], playstyle: "Hardcore · Ultimate prog", hours: "Mon–Thu 8 PM ET", found: "Friend of Haruki", about: "Cleared every Savage tier since Stormblood. Would move worlds for the right static.", submitted: date(-4), status: "interview", comments: [{ by: "m3", text: "Interview booked for Saturday.", when: date(-3) }, { by: "m9", text: "Could cover Starlight Codex OT sub slot.", when: date(-2) }] },
  { id: "a4", character: "Sayo Kurosawa", discord: "sayo.k", world: "Balmung", dc: "Crystal", jobs: ["DNC", "BRD"], playstyle: "Casual · screenshots and glamour", hours: "Evenings, varies", found: "Glamour Contest last month", about: "Came to the Halloween crawl as a guest and had a blast. Photographer at heart.", submitted: date(-5), status: "interview", comments: [] },
  { id: "a5", character: "Hollin Thornhide", discord: "hollin", world: "Coeurl", dc: "Crystal", jobs: ["WAR"], playstyle: "Midcore · roulettes, Extremes", hours: "Late nights", found: "Discord server list", about: "Looking for chill people to run Extremes with.", submitted: date(-9), status: "accepted", comments: [{ by: "m3", text: "Accepted — invite sent in-game.", when: date(-7) }] },
  { id: "a6", character: "Vessa Orrin", discord: "vessa.o", world: "Siren", dc: "Aether", jobs: ["SGE", "AST"], playstyle: "Casual", hours: "Weekends", found: "Reddit recruitment thread", about: "Want an FC on Crystal for when my friends transfer.", submitted: date(-12), status: "declined", comments: [{ by: "m3", text: "Not transferring yet — invited to apply again after the move.", when: date(-10) }] },
  { id: "a7", character: "Edda Kestrel", discord: "edda.k", world: "Balmung", dc: "Crystal", jobs: ["MCH", "PLD"], playstyle: "Midcore · wants a static", hours: "Tue & Fri nights", found: "Inkwell recruitment post", about: "Looking at the Inkwell waitlist — flexible on job.", submitted: date(0), status: "new", comments: [] },
];

/* ───────────── Discord ───────────── */

export const channels = [
  { category: "Start here", items: [{ name: "welcome", type: "text", messages: 120 }, { name: "rules", type: "text", messages: 4 }, { name: "pick-your-roles", type: "text", messages: 9 }, { name: "announcements", type: "announce", messages: 86 }] },
  { category: "Free Company", items: [{ name: "fc-chat", type: "text", messages: 6420 }, { name: "screenshots", type: "text", messages: 1980 }, { name: "glamour", type: "text", messages: 1150 }, { name: "housing", type: "text", messages: 640 }, { name: "lfg", type: "text", messages: 1720 }, { name: "help-desk", type: "text", messages: 890 }] },
  { category: "Raiding", items: [{ name: "raid-announcements", type: "announce", messages: 74 }, { name: "static-starlight", type: "text", messages: 1310 }, { name: "static-inkwell", type: "text", messages: 960 }, { name: "static-margin", type: "text", messages: 520 }, { name: "static-bookends", type: "text", messages: 310 }, { name: "strats", type: "forum", messages: 260 }] },
  { category: "Voice", items: [{ name: "The Reading Room", type: "voice", messages: 0 }, { name: "Raid VC 1", type: "voice", messages: 0 }, { name: "Raid VC 2", type: "voice", messages: 0 }, { name: "Fishing Dock", type: "voice", messages: 0 }] },
  { category: "Staff", items: [{ name: "officers", type: "text", messages: 1480 }, { name: "applications", type: "text", messages: 210 }, { name: "mod-log", type: "text", messages: 380 }] },
];

export type DiscordRole = { id: string; name: string; color: string; members: number; mentionable: boolean; hoisted: boolean; kind: "rank" | "job" | "ping" | "bot" };
export const seedRoles: DiscordRole[] = [
  { id: "r1", name: "Archivist", color: "#e3c27a", members: 1, mentionable: false, hoisted: true, kind: "rank" },
  { id: "r2", name: "Curator", color: "#d9a25f", members: 7, mentionable: true, hoisted: true, kind: "rank" },
  { id: "r3", name: "Raid Lead", color: "#d9776b", members: 4, mentionable: true, hoisted: true, kind: "rank" },
  { id: "r4", name: "Scribe", color: "#8fb3e0", members: 20, mentionable: false, hoisted: true, kind: "rank" },
  { id: "r5", name: "Reader", color: "#7aa0c4", members: 22, mentionable: false, hoisted: true, kind: "rank" },
  { id: "r6", name: "Initiate", color: "#93a3b8", members: 8, mentionable: false, hoisted: true, kind: "rank" },
  { id: "r7", name: "Friend of the Archive", color: "#a4b49a", members: 23, mentionable: false, hoisted: true, kind: "rank" },
  { id: "r8", name: "Tank", color: "#5b8bd6", members: 19, mentionable: true, hoisted: false, kind: "job" },
  { id: "r9", name: "Healer", color: "#5fae7c", members: 17, mentionable: true, hoisted: false, kind: "job" },
  { id: "r10", name: "DPS", color: "#c95e5e", members: 41, mentionable: true, hoisted: false, kind: "job" },
  { id: "r11", name: "Crafter / Gatherer", color: "#b49455", members: 15, mentionable: true, hoisted: false, kind: "job" },
  { id: "r12", name: "Event Pings", color: "#b08ad6", members: 48, mentionable: true, hoisted: false, kind: "ping" },
  { id: "r13", name: "Raid Pings", color: "#d98a6b", members: 33, mentionable: true, hoisted: false, kind: "ping" },
  { id: "r14", name: "Archive Bot", color: "#6f9fd8", members: 1, mentionable: false, hoisted: false, kind: "bot" },
];

export type Command = { id: string; trigger: string; reply: string; uses: number; staffOnly: boolean };
export const seedCommands: Command[] = [
  { id: "c1", trigger: "/house", reply: "The Archive lives at Mist, Ward 12, Plot 30 (Balmung). Ring the bell!", uses: 214, staffOnly: false },
  { id: "c2", trigger: "/strats", reply: "Strat boards for every static are pinned in #strats.", uses: 389, staffOnly: false },
  { id: "c3", trigger: "/apply", reply: "Applications are open! Use the Apply button in #welcome.", uses: 97, staffOnly: false },
  { id: "c4", trigger: "/fcchest", reply: "Raid food and pots: ask a Curator to open the FC chest.", uses: 61, staffOnly: false },
  { id: "c5", trigger: "/warn", reply: "Logs a staff warning and DMs the member the server rules.", uses: 6, staffOnly: true },
];

export type Scheduled = { id: string; name: string; channel: string; when: string; enabled: boolean; kind: "automatic" | "scheduled" };
export const seedSchedules: Scheduled[] = [
  { id: "sc1", name: "Event reminders", channel: "#announcements", when: "1 hour before each event", enabled: true, kind: "automatic" },
  { id: "sc2", name: "Weekly reset recap", channel: "#fc-chat", when: "Tuesdays at 11:00 AM ET", enabled: true, kind: "automatic" },
  { id: "sc3", name: "New patch notes digest", channel: "#announcements", when: "When patch notes are posted", enabled: true, kind: "automatic" },
  { id: "sc4", name: "Birthday shout-outs", channel: "#fc-chat", when: "Daily at 10:00 AM ET", enabled: true, kind: "automatic" },
  { id: "sc5", name: "Glamour Contest voting opens", channel: "#glamour", when: "Nov 28 at 10:30 PM ET", enabled: true, kind: "scheduled" },
  { id: "sc6", name: "Screenshot Gathering reminder", channel: "#screenshots", when: "Dec 4 at 6:00 PM ET", enabled: false, kind: "scheduled" },
];

export const seedRoleMenus = [
  { id: "rm1", title: "Choose your role", channel: "#pick-your-roles", style: "buttons" as const, options: [{ emoji: "🛡️", role: "Tank" }, { emoji: "💚", role: "Healer" }, { emoji: "⚔️", role: "DPS" }, { emoji: "🔨", role: "Crafter / Gatherer" }] },
  { id: "rm2", title: "Notifications", channel: "#pick-your-roles", style: "reactions" as const, options: [{ emoji: "📅", role: "Event Pings" }, { emoji: "🐉", role: "Raid Pings" }] },
];

export const announcements = [
  { id: "n1", title: "Winter decorating starts Saturday", author: "m7", date: date(-1), body: "The library wing is getting a winter makeover. Bring furnishings, dyes, and opinions." },
  { id: "n2", title: "Starlight Codex cleared Floor 3!", author: "m9", date: date(-2), body: "Huge congrats to the Codex. Floor 4 prog starts Thursday — food is on the FC." },
  { id: "n3", title: "Glamour Contest theme announced", author: "m5", date: date(-4), body: "Starfall Gala: celestial formalwear. Entries close Nov 28 at 8 PM ET." },
];

export const activity = [
  { who: "m3", text: "accepted Hollin Thornhide's application", when: "2h ago", kind: "app" },
  { who: "m9", text: "updated Starlight Codex progression — Floor 4 best pull 41%", when: "5h ago", kind: "raid" },
  { who: "m2", text: "scheduled Glamour Contest: Starfall Gala", when: "Yesterday", kind: "event" },
  { who: "m4", text: "posted a new rules panel in #rules", when: "Yesterday", kind: "discord" },
  { who: "m7", text: "added Housing Decoration Night to the calendar", when: "2 days ago", kind: "event" },
  { who: "m30", text: "won Screenshot of the Week", when: "3 days ago", kind: "community" },
];

/* ───────────── Community ───────────── */

export const seedPolls = [
  { id: "p1", question: "Next FC house theme?", options: [{ label: "Winter library", votes: 21 }, { label: "Kugane tea house", votes: 14 }, { label: "Sky pirate hideout", votes: 9 }], open: true, voted: null as number | null },
  { id: "p2", question: "Best night for Treasure Maps?", options: [{ label: "Tuesday", votes: 18 }, { label: "Thursday", votes: 7 }, { label: "Sunday", votes: 11 }], open: true, voted: null as number | null },
];
export const seedSuggestions = [
  { id: "g1", by: "m27", text: "Monthly FC-wide fashion report help session", votes: 18, status: "planned" as const, mine: 0 },
  { id: "g2", by: "m33", text: "A #crafting-orders channel with a request bot", votes: 24, status: "in review" as const, mine: 0 },
  { id: "g3", by: "m41", text: "Mentor sign-ups for new player dungeon runs", votes: 12, status: "done" as const, mine: 0 },
  { id: "g4", by: "m18", text: "Gold Saucer night with a mini-cactpot pool", votes: 7, status: "in review" as const, mine: 0 },
];
export const qotdQueue = ["What was the first moment the game made you cry?", "Which zone would you live in, and why?", "Your most-used emote?", "Favorite dungeon music track?"];

export const contestEntries = [
  { id: "x1", by: "m30", title: "Dawn over the Rhalgr's Reach cliffs", votes: 17, palette: ["#f2b880", "#d76f6f", "#3a3d6b"] },
  { id: "x2", by: "m24", title: "Library wing, finally finished", votes: 12, palette: ["#e8d6a8", "#8a6b45", "#2a2238"] },
  { id: "x3", by: "m15", title: "Group photo — Halloween crawl", votes: 21, palette: ["#e58b3a", "#5b2a66", "#121225"] },
  { id: "x4", by: "m44", title: "Ocean fishing at dusk", votes: 9, palette: ["#88c3e8", "#3c6aa8", "#141c3a"] },
];

export const fcAchievements = [
  { title: "Raid nights hosted", value: 142, goal: 150 },
  { title: "Treasure maps opened together", value: 388, goal: 500 },
  { title: "New players mentored", value: 31, goal: 40 },
  { title: "Glamour contests held", value: 11, goal: 12 },
];

/* ───────────── Analytics ───────────── */

const wave = (count: number, base: number, slope: number, swing: number, seed: number) => {
  const r = seeded(seed);
  return Array.from({ length: count }, (_, index) => Math.round(base + slope * index + Math.sin(index / 2.3) * swing + (r() - .5) * swing));
};
export const memberGrowth = {
  "30d": { labels: Array.from({ length: 30 }, (_, i) => date(i - 29).slice(5)), values: wave(30, 77, .27, 1.2, 7).map((v, i, a) => i === a.length - 1 ? 85 : Math.min(v, 85)) },
  "90d": { labels: Array.from({ length: 13 }, (_, i) => date((i - 12) * 7).slice(5)), values: [61, 63, 64, 66, 68, 70, 71, 73, 75, 78, 80, 83, 85] },
  "12m": { labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], values: [38, 41, 44, 47, 49, 53, 56, 58, 62, 69, 77, 85] },
};
export const fcGrowth12m = [29, 31, 33, 35, 37, 40, 42, 44, 47, 52, 57, 62];
export const messagesByDay = { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [1420, 1960, 1580, 1710, 2240, 2610, 2130] };
export const messagesByHour = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => {
  const evening = Math.max(0, 1 - Math.abs(h - 21) / 6); const weekend = d >= 5 ? .3 : 0;
  return Math.round((evening + weekend) * 100 * (0.7 + ((d * 7 + h * 13) % 10) / 30));
}));
export const engagement = { labels: Array.from({ length: 12 }, (_, i) => `W${i + 36}`), active: [38, 41, 40, 44, 43, 47, 46, 49, 52, 51, 55, 57], messages: [9.1, 9.8, 9.4, 10.6, 10.2, 11.4, 11.1, 12.0, 12.8, 12.3, 13.6, 13.9] };
export const recruitment = { labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], applied: [6, 8, 7, 12, 14, 9], accepted: [4, 5, 5, 8, 10, 4] };

/* ───────────── Embeds & settings ───────────── */

export type Embed = { title: string; description: string; color: string; footer: string; thumbnail: string; image: string; author: string; buttons: string[]; channel: string };
export const embedArt = [
  { id: "", label: "None" },
  { id: "/assets/portfolio/astral-archive/crest.svg", label: "Archive crest" },
  { id: "/assets/portfolio/astral-archive/banner.svg", label: "Library banner" },
  { id: "/assets/portfolio/astral-archive/crystal.svg", label: "Crystal" },
];
export const seedTemplates: { id: string; name: string; kind: string; embed: Embed }[] = [
  { id: "t1", name: "Event announcement", kind: "Event", embed: { author: "The Astral Archive", title: "✦ Glamour Contest: Starfall Gala", description: "**When:** Sat, Nov 28 · 8:30 PM ET\n**Where:** FC House · Grand Hall\n\nTheme: *celestial formalwear*. Bring your best starlit look — judges announced the day before.", color: "#b08ad6", footer: "React below to RSVP · Archive Bot", thumbnail: "/assets/portfolio/astral-archive/crystal.svg", image: "", buttons: ["Going", "Maybe"], channel: "#announcements" } },
  { id: "t2", name: "Rules panel", kind: "Rules", embed: { author: "The Astral Archive", title: "📜 House Rules", description: "**1.** Be kind — everyone was new once.\n**2.** No drama in FC chat; take it to an officer.\n**3.** Spoilers go in spoiler tags for 2 weeks after a patch.\n**4.** Have fun and say hi!", color: "#c9a45c", footer: "Questions? Ping a Curator.", thumbnail: "/assets/portfolio/astral-archive/crest.svg", image: "", buttons: ["I've read the rules"], channel: "#rules" } },
  { id: "t3", name: "General announcement", kind: "Announcement", embed: { author: "Seraphine Laurent", title: "Winter decorating starts Saturday", description: "The library wing is getting a winter makeover. Bring furnishings, dyes, and opinions.", color: "#6f9fd8", footer: "The Astral Archive · Balmung", thumbnail: "", image: "/assets/portfolio/astral-archive/banner.svg", buttons: [], channel: "#announcements" } },
  { id: "t4", name: "FC information", kind: "Info", embed: { author: "The Astral Archive", title: "About the Archive", description: "A social Free Company on **Balmung (Crystal)** with four raid statics, weekly events, and a house full of books.\n\n🏠 Mist · Ward 12 · Plot 30\n📅 Events every night of the week", color: "#76b89a", footer: "Est. 2023", thumbnail: "/assets/portfolio/astral-archive/crest.svg", image: "", buttons: ["Apply to join", "Event calendar"], channel: "#welcome" } },
];

export const botModules = [
  { id: "events", label: "Events & RSVPs", description: "Calendar, RSVP buttons, and reminders" },
  { id: "raids", label: "Raid planner", description: "Statics, party slots, and attendance" },
  { id: "applications", label: "Applications", description: "Recruitment form and officer review" },
  { id: "community", label: "Community", description: "Polls, QOTD, giveaways, and contests" },
  { id: "welcome", label: "Welcome messages", description: "Greets new members in #welcome" },
  { id: "moderation", label: "Moderation", description: "Auto-mod filters and staff warnings" },
  { id: "logging", label: "Logging", description: "Message, member, and role logs" },
  { id: "birthdays", label: "Birthdays", description: "Daily birthday shout-outs" },
] as const;
export type ModuleId = typeof botModules[number]["id"];

export const permissionList = ["Edit events", "Manage statics", "Review applications", "Post announcements", "Edit bot settings", "View officer notes"] as const;

// Keep the roster consistent with the statics: anyone in a slot can play the job they're slotted on.
for (const group of seedStatics) for (const { member, job } of group.slots) {
  const person = seedMembers.find(item => item.id === member);
  if (!person || !job) continue;
  if (person.main !== job && !person.alts.includes(job)) person.alts = [job, ...person.alts].slice(0, 3);
  if (!person.prefs.includes(jobs[job].role)) person.prefs = [...person.prefs, jobs[job].role];
  if (!person.raidExp.includes("Current Savage — on progression") && group.id !== "s4") person.raidExp = ["Current Savage — on progression", ...person.raidExp];
}
