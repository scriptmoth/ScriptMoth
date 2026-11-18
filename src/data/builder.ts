/**
 * Central project-builder pricing configuration.
 *
 * Every builder price lives here: starter packages, feature add-ons, complexity upgrades,
 * dependencies, package inclusions, shared infrastructure, and third-party notes.
 * Hosting management plan rates live in `src/data/catalog.ts` (`hostingPlans`).
 * Amounts are written in whole dollars and converted to integer cents in `seedFeatures`.
 *
 * Price states:
 *   number                 fixed starting price
 *   number + manual: true  "from" price, confirmed after review ($500+)
 *   null                   custom estimate (scope varies too much to fix a price)
 *   null + unpriced: true  not yet priced by Scriptmoth; shown as "price pending review"
 * Admin overrides saved at /admin/builder and /admin/catalog take precedence at runtime.
 */
import type { Feature, PricingRules } from "@/lib/business/pricing";
import type { HostingMode, ProjectType } from "@/lib/business/rules";

type Seed = PricingRules & { label: string; dollars: number | null; kind?: Feature["kind"] };
type Group = [category: string, features: Seed[]];
const f = (label: string, dollars: number | null, description: string, rules: Omit<Seed, "label" | "dollars" | "description"> = {}): Seed =>
  ({ label, dollars, description, ...rules });

/** Shown when a project type is opened without choosing a starter package. */
export const builderBases: Record<ProjectType, { label: string; dollars: number | null; summary: string }> = {
  "discord-bot": { label: "Custom Discord Bot", dollars: null, summary: "Choose a starter bot to see what is included." },
  "discord-setup": { label: "Discord Server Setup", dollars: null, summary: "Choose the server setup package, or describe a custom layout." },
  "roleplay-bot": { label: "Roleplay Bot", dollars: null, summary: "Choose a starter bot to see what is included." },
  "personal-site": { label: "Website", dollars: null, summary: "Choose a single-page or multipage starter site." },
  "oc-wiki": { label: "OC / Character Wiki", dollars: null, summary: "Choose the wiki starter package." },
  "community-site": { label: "Community Website", dollars: null, summary: "Choose the community website starter package." },
  "web-app": { label: "Dashboards & Applications", dollars: null, summary: "Choose a dashboard, web application, or integration project." },
  improvement: { label: "Existing Project Improvements", dollars: null, summary: "Changes to an existing website, bot, or system. Scriptmoth reviews it before giving a guaranteed price." },
  hosting: { label: "Hosting & Maintenance", dollars: null, summary: "Hosting and upkeep for a project that already exists. Choose a management plan in the hosting step, or ask for a custom plan." },
  other: { label: "Something else", dollars: null, summary: "Not sure where your idea fits? Describe it and Scriptmoth will help scope it." },
};

export type StarterPackage = {
  slug: string; type: ProjectType; title: string; dollars: number | null; summary: string; included: string[];
  /** Feature IDs (without the type prefix) covered by the package price. `choose` lets the customer pick N of them. */
  includes?: { ids: string[]; choose?: number };
  /** Starting price that is confirmed after a requirements review. */
  manual?: boolean;
  /** Listed on /products; title, price, summary, and included lines can then be edited at /admin/catalog. */
  product?: boolean;
};

export const starterPackages: StarterPackage[] = [
  { slug: "custom-discord-bot", type: "discord-bot", title: "Simple Utility Bot", dollars: 95, product: true,
    summary: "A small helper bot for one Discord server with one starter module.",
    included: ["One bot for one Discord server", "One starter module: welcome messages or reaction roles (up to five existing roles)", "Up to three basic slash commands for that module", "Setup, one review round, testing, and handover instructions"],
    includes: { ids: ["welcome-messages", "reaction-roles"], choose: 1 } },
  { slug: "community-engagement-bot", type: "discord-bot", title: "Community Management Bot", dollars: 150, product: true,
    summary: "Keeps a community active with two scheduled community modules.",
    included: ["Two community modules from: Question of the Day, daily prompts, trivia, birthday announcements, or member spotlights", "One Discord server and time zone, with a channel and posting schedule for each module", "Up to 20 entries you provide per content library", "Setup, one review round, testing, and handover instructions"],
    includes: { ids: ["question-of-the-day", "daily-prompts", "trivia", "birthday-announcements", "member-spotlights"], choose: 2 } },
  { slug: "discord-server-setup", type: "discord-setup", title: "Discord Server Setup", dollars: 85, product: true,
    summary: "A clean Discord layout: channels, roles, permissions, and branded embeds—no bot required.",
    included: [
      "Channel categories and channels with clear names, topics, and descriptions",
      "Role hierarchy with colors for staff, members, and up to eight interest or status roles",
      "Permission overwrites so members only see the channels they should",
      "Up to four branded embeds (for example rules, welcome, FAQ, and links) posted in the right channels",
      "One review round and a short handover note for how the server is organized",
    ],
    includes: { ids: ["channel-layout", "role-hierarchy", "permission-layout", "branded-info-embeds"] } },
  { slug: "custom-rp-bot", type: "roleplay-bot", title: "Roleplay Bot", dollars: 200, product: true,
    summary: "Players submit characters, staff approve them, and members browse the roster in Discord.",
    included: ["Character profiles with up to six fields", "A character roster members can browse", "Staff approval for new and edited characters", "Setup for up to 25 character records you provide", "A database so records survive restarts"],
    includes: { ids: ["character-profiles", "character-roster", "character-approval-workflow"] } },
  { slug: "carrd-site", type: "personal-site", title: "Carrd-Style Creator Site", dollars: 95, product: true,
    summary: "A one-page link-in-bio home for your commission menu, portfolio, or socials.",
    included: ["One card-style page that works on phones and desktops", "Up to three sections, such as about, commission rates, and a small gallery", "Social and contact links styled to match", "A color palette and fonts that fit your look"] },
  { slug: "toyhouse-profile", type: "personal-site", title: "Toyhouse OC & Profile Design", dollars: 75, product: true,
    summary: "A Toyhouse-ready character page or user profile code, built on Bootstrap 4 so it pastes cleanly into Toyhouse.",
    included: [
      "One character page or user profile layout written for Toyhouse’s HTML field",
      "Bootstrap 4 structure with working tabs (data-toggle), cards, and responsive columns",
      "Inline styles + optional Premium CSS matched to your OC palette (Premium needed for custom CSS)",
      "Install notes: turn off WYSIWYG, paste the code, swap in your Toyhouse-hosted images",
    ] },
  { slug: "tumblr-theme", type: "personal-site", title: "Tumblr Theme Design", dollars: 85, product: true,
    summary: "A custom Tumblr theme for an art or lifestyle blog — sidebar or grid layout, styled posts, and install-ready CSS.",
    included: [
      "One Tumblr theme layout (classic sidebar or photo grid) matched to your palette",
      "Styled photo, text, and quote posts with tags and a sidebar bio / links block",
      "Custom CSS written for Tumblr’s theme editor, with notes for swapping images and colors",
      "Install guide: paste CSS, set appearance options, and point header / avatar assets",
    ] },
  { slug: "single-page-website", type: "personal-site", title: "Single-Page Website", dollars: 175, product: true,
    summary: "One polished, responsive page for your art, writing, or project.",
    included: ["One responsive page that works on phones and desktops", "A color palette and type styles that fit you", "Your text, images, and social or contact links", "Page title and search description"] },
  { slug: "personal-website", type: "personal-site", title: "Multipage Website", dollars: 300, product: true,
    summary: "A small site with shared navigation, such as Home, About, and Work pages.",
    included: ["Up to three pages with shared navigation", "Two of them can be an About, Contact, FAQ, or basic page you pick below (the homepage is the third)", "Responsive layouts, color palette, and type styles", "Page titles and search descriptions"],
    includes: { ids: ["about-page", "contact-page", "faq-page", "additional-basic-page"], choose: 2 } },
  { slug: "oc-wiki", type: "oc-wiki", title: "OC / Character Wiki", dollars: 550, product: true,
    summary: "A searchable wiki for your original characters and worlds, with an editor so you can keep it updated.",
    included: ["Public directories and a page for each character or world", "Search across names and summaries", "One editor account and up to eight fields per record type", "Setup for up to ten records you provide", "A database for your entries"] },
  { slug: "community-website", type: "community-site", title: "Community Website", dollars: 650, product: true,
    summary: "A home for your group: rules, staff, announcements, and more.",
    included: ["Up to four public pages, such as home, rules, staff, and announcements", "Responsive layouts that match your community’s look", "Page titles and search descriptions"] },
  { slug: "custom-bot-dashboard", type: "web-app", title: "Custom Dashboard", dollars: 600, product: true,
    summary: "Let staff change a compatible Discord bot’s settings in their browser.",
    included: ["Discord sign-in and staff access for one server", "One screen for editing up to five existing settings", "Connection through the bot’s existing API or data layer, if compatible"],
    includes: { ids: ["authentication"] } },
  { slug: "custom-web-application", type: "web-app", title: "Custom Web Application", dollars: 1500, manual: true,
    summary: "A web app built around your workflow. The starting price is confirmed after reviewing what it needs to do.",
    included: ["A requirements review and written scope", "A responsive web interface", "The features you choose below, scoped individually"] },
  { slug: "bot-website-integration", type: "web-app", title: "Discord Bot + Website Integration", dollars: null,
    summary: "Connect a Discord bot and a website so they share data, like a roster that updates in both places.",
    included: ["A review of the bot and site you have or want", "A custom estimate for connecting them"] },
  { slug: "existing-project-assessment", type: "improvement", title: "Improve an Existing Project", dollars: null,
    summary: "Bug fixes, new features, redesigns, upgrades, migrations, or integrations for a site or bot you already have.",
    included: ["A review of your existing code, setup, and access", "A list of what needs to change", "A guaranteed price for the agreed work before anything starts"] },
];

/** Step one: illustrated category cards. `art` is a key of `assets` in `src/lib/assets.ts`. */
export const projectGroups: { id: string; title: string; blurb: string; art: "bot" | "websites" | "coding" | "process"; choices: { type: ProjectType; slug: string }[] }[] = [
  { id: "discord", title: "Discord Bots & Servers", art: "bot", blurb: "Custom bots, roleplay systems, and full Discord server setup.",
    choices: [
      { type: "discord-bot", slug: "custom-discord-bot" },
      { type: "discord-bot", slug: "community-engagement-bot" },
      { type: "roleplay-bot", slug: "custom-rp-bot" },
      { type: "discord-setup", slug: "discord-server-setup" },
    ] },
  { id: "websites", title: "Website Development", art: "websites", blurb: "Personal sites, Toyhouse codes, Tumblr themes, character wikis, and community homes.",
    choices: [{ type: "personal-site", slug: "carrd-site" }, { type: "personal-site", slug: "toyhouse-profile" }, { type: "personal-site", slug: "tumblr-theme" }, { type: "personal-site", slug: "single-page-website" }, { type: "personal-site", slug: "personal-website" }, { type: "oc-wiki", slug: "oc-wiki" }, { type: "community-site", slug: "community-website" }] },
  { id: "apps", title: "Dashboards & Applications", art: "coding", blurb: "Browser tools for staff, members, and bigger workflows.",
    choices: [{ type: "web-app", slug: "custom-bot-dashboard" }, { type: "web-app", slug: "custom-web-application" }, { type: "web-app", slug: "bot-website-integration" }] },
  { id: "existing", title: "Existing Project Improvements", art: "process", blurb: "Fixes, upgrades, and upkeep for something you already have.",
    choices: [{ type: "improvement", slug: "existing-project-assessment" }, { type: "hosting", slug: "" }, { type: "other", slug: "" }] },
];

/** Work shared by several features. Each is set up once and never charged per feature. */
export const sharedInfrastructure: Record<string, { label: string; explain: string; hosting?: boolean }> = {
  database: { label: "Database", hosting: true,
    explain: "Somewhere to save information like profiles, balances, or tickets. It is set up once, and every feature that saves data shares it. Each feature’s price already covers connecting to it." },
  accounts: { label: "Sign-in and permissions",
    explain: "Lets people log in and controls who can see or change what. Features that need sign-in share one system, priced once under the sign-in feature." },
  scheduler: { label: "Scheduled posting",
    explain: "A timer that posts things like daily questions or birthday messages. Scheduled features share one, so there is no extra charge per feature." },
};

const bot = {
  welcome: ["Welcome & onboarding", [
    f("Welcome messages", 25, "Posts a greeting in a channel you choose whenever someone joins.", { example: "“Welcome to the server, @Sam! Grab your roles in #roles.”" }),
    f("Goodbye messages", 15, "Posts a short message when a member leaves."),
    f("Welcome images", 40, "Creates a welcome card picture with the new member’s name and avatar.", { suggests: ["welcome-messages"] }),
    f("Custom welcome embeds", 25, "Styles the welcome message as a branded card with your colors and links.", { suggests: ["welcome-messages"] }),
    f("Automated onboarding", 60, "Walks new members through steps like reading the rules and picking roles."),
    f("Rules acknowledgment", 35, "Members press a button to accept the rules before the rest of the server opens up."),
    f("New member verification workflow", 75, "Holds new members in a waiting area until they pass a check or staff let them in."),
    f("Account age screening", 40, "Flags very new Discord accounts for staff, which helps stop spam accounts."),
  ]] as Group,
  roles: ["Roles & permissions", [
    f("Reaction roles", 40, "Members click an emoji to give themselves a role, and click again to remove it.", { example: "React with 🎨 to get the Artist role.", max: 20, suggests: ["automatic-role-assignment"],
      note: "The bot needs permission to manage the roles, and its own role must sit above them.",
      fields: [{ key: "roles", label: "Roles per menu", choices: ["Up to five", "Six or more"] }, { key: "selection", label: "Selection behavior", choices: ["Single-select", "Multi-select"] }, { key: "embed", label: "Custom embed or role notes" }] }),
    f("Button-based role menus", 35, "Like reaction roles, but members press labeled buttons instead of emoji.", { max: 20 }),
    f("Dropdown role menus", 40, "A dropdown list of roles, handy when there are too many for buttons.", { max: 20 }),
    f("Color roles", 35, "Members pick a name color from a menu."),
    f("Pronoun role selection", 30, "Members choose pronoun roles so others can see them on their profile."),
    f("Automatic role assignment", 35, "Gives roles automatically, for example to everyone who joins or who reaches a milestone."),
    f("Role synchronization", 75, "Keeps roles matched across two or more servers you run."),
    f("Custom permission workflows", null, "Your own rules for who can do what, such as temporary roles or staff approval for certain roles."),
  ]] as Group,
  moderation: ["Moderation", [
    f("Activity logging", 25, "Keeps a record of server activity in a private staff channel.", {
      standard: { label: "Basic activity logging", description: "Logs joins, leaves, role changes, and nickname changes." },
      complexity: [{ label: "Advanced logging", cents: 3000, description: "Also logs deleted and edited messages and moderation actions, and can send each kind of event to its own channel." }],
      note: "Logging message contents needs extra Discord permissions. We’ll confirm what is available for your server.",
      fields: [{ key: "events", label: "Events you want logged" }, { key: "channels", label: "Logging channel preferences" }] }),
    f("Warning system", 50, "Staff can warn members, and the bot remembers each warning.", { needs: ["database"] }),
    f("Timeout commands", 35, "Quick commands for staff to time out members, with a reason."),
    f("Moderation case history", 75, "A searchable history of warnings, timeouts, and bans for each member.", { needs: ["database"] }),
    f("Automated moderation rules", 100, "Automatically removes things you choose, like spam, invite links, or blocked words."),
    f("Moderation dashboard", 250, "A web page where staff review cases and settings. Starting price; confirmed after review.", { manual: true, needs: ["database", "accounts"] }),
  ]] as Group,
  tickets: ["Tickets & support", [
    f("Ticket system", 125, "Members press a button to open a private conversation with staff.", {
      example: "A member opens a “Report a problem” ticket, staff reply, and the ticket closes when it’s solved.",
      standard: { label: "Basic ticket system", description: "Simple ticket creation and closing, with staff access to every ticket." },
      complexity: [{ label: "Advanced ticket workflows", cents: 5000, description: "Adds ticket categories, custom intake forms, saved transcripts, staff assignment, and configurable steps like claim → escalate → close." }],
      needs: ["database"] }),
    f("Anonymous reports", 65, "Members report a problem to staff without their name being shown."),
    f("Ticket analytics", 100, "Counts tickets, response times, and busiest categories.", { requires: ["ticket-system"], needs: ["database"] }),
  ]] as Group,
  engagement: ["Engagement", [
    f("Question of the Day", 60, "Posts a new question on a schedule to get people talking.", { example: "Every morning at 9: “What’s a snack you’d fight a goose for?”", needs: ["scheduler"] }),
    f("Trivia", 75, "Scheduled trivia questions with answer reveals.", { needs: ["scheduler"] }),
    f("Polls and voting", 50, "Members vote on options with buttons, and results show when the poll closes."),
    f("Suggestion submissions", 45, "Members post ideas to a suggestions channel where others can vote on them."),
    f("Birthday announcements", 35, "Members save their birthday, and the bot celebrates it on the day.", { needs: ["database", "scheduler"] }),
    f("Character birthdays", 45, "Celebrates your characters’ birthdays, not just members’.", { needs: ["database", "scheduler"] }),
    f("Daily prompts", 40, "Posts a creative writing or art prompt on a schedule.", { needs: ["scheduler"] }),
    f("Member spotlights", 50, "Regularly features a member or their work.", { needs: ["scheduler"] }),
    f("Giveaways", 60, "Members enter with a button, and the bot picks winners fairly."),
    f("Scheduled announcements", 40, "Staff write an announcement now, and the bot posts it later.", { needs: ["scheduler"] }),
    f("Prompt submissions", 50, "Members suggest prompts or questions, and staff approve them before they join the posting queue.", { suggests: ["daily-prompts"], needs: ["database"] }),
  ]] as Group,
  characters: ["Characters & OCs", [
    f("Random character picker", 25, "Picks a character at random from a list, for prompts, games, or drawing challenges."),
    f("Character profile cards", 75, "Members save a simple card for each of their OCs and show it with a command.", { example: "/oc show Juniper → a card with art, pronouns, and a short bio.", needs: ["database"] }),
    f("Character of the week", 50, "Features a member’s character on a schedule.", { suggests: ["character-profile-cards"], needs: ["scheduler"] }),
    f("Character birthday calendar", 40, "A monthly list of upcoming character birthdays.", { requires: ["character-birthdays"] }),
    f("Character notes and playlists", 45, "Add notes, inspiration links, or a playlist to each character card.", { requires: ["character-profile-cards"] }),
    f("Fandom directory", 60, "Members list the fandoms they’re in, and others can find people with shared interests.", { needs: ["database"] }),
    f("Searchable character directory", 125, "Browse and search every member’s characters by name, fandom, or tag.", { requires: ["character-profile-cards"] }),
    f("Full OC management system", 500, "Character records, approvals, spotlights, birthdays, and prompts working together as one system. Starting price; confirmed after review.", { manual: true, needs: ["database", "scheduler"] }),
  ]] as Group,
  creators: ["Creators & fandom", [
    f("Art prompt generator", 25, "A command that mixes up a random art or writing prompt on request."),
    f("Art submission gallery", 75, "Members post their art or fan works to a gallery channel with credit and tags.", { needs: ["database"] }),
    f("Featured work voting", 60, "Members vote on submissions, and the top piece is featured.", { requires: ["art-submission-gallery"] }),
    f("Art challenges and contests", 175, "Run themed challenges or contests with entry windows, submissions, judging or voting, and winner announcements.", { needs: ["database", "scheduler"] }),
    f("Commission queue", 150, "Clients request commissions, and the artist tracks each one from open to delivered.", { needs: ["database"] }),
    f("Collaboration matching", 125, "Members post what they want to make, and the bot suggests partners for art trades, collabs, or RPs.", { needs: ["database"] }),
    f("Creator portfolio directory", 150, "Members list their portfolio, commission status, and links so others can browse creators.", { needs: ["database"] }),
    f("Creator dashboard", 400, "A website where creators manage their gallery, commissions, and listings. Starting price; confirmed after review.", { manual: true, needs: ["database", "accounts"] }),
  ]] as Group,
  utilities: ["Community utilities", [
    f("FAQ search", 50, "Members search your FAQ with a command instead of scrolling a channel."),
    f("Bookmarks", 45, "Members save messages to a private list they can look back at.", { needs: ["database"] }),
    f("Emoji statistics", 50, "Shows which server emoji get used most and least.", { needs: ["database"] }),
    f("Emoji suggestion voting", 40, "Members suggest new emoji and vote on which ones get added."),
    f("Temporary private channels", 60, "Members open a short-lived private text or voice channel that removes itself when it’s empty."),
    f("Voice channel naming", 40, "Members rename the voice channel they created."),
    f("Private groups", 125, "Members create small private groups with their own channels and member list.", { needs: ["database"] }),
    f("Resource library", 125, "A searchable library of guides, links, and references that staff maintain.", { needs: ["database"] }),
    f("Mentorship matching", 125, "Pairs new members with experienced mentors based on interests.", { needs: ["database"] }),
    f("Community goal tracker", 125, "Shared goals the whole server works toward, with progress updates.", { needs: ["database"] }),
    f("Community task board", 125, "A board of tasks members can claim and mark done, like event prep or server chores.", { needs: ["database"] }),
    f("Gift exchange", 150, "Secret Santa–style sign-ups, random assignments, and reminders before the exchange.", { needs: ["database", "scheduler"] }),
    f("Server backup and restore", 175, "Saves your channels, roles, and permissions so the layout can be rebuilt if something goes wrong."),
  ]] as Group,
  leveling: ["Leveling & economy", [
    f("XP and leveling", 125, "Members earn experience for chatting and level up over time.", { example: "Sam reached level 5! 🎉", needs: ["database"] }),
    f("Level reward roles", 40, "Gives a role automatically when someone reaches a level.", { requires: ["xp-and-leveling"] }),
    f("Leaderboards", 40, "Shows the top members by level or points.", { needs: ["database"] }),
    f("Virtual currency", 150, "Members earn and spend a server currency with a balance the bot keeps track of.", { suggests: ["virtual-shop"], needs: ["database"] }),
    f("Virtual shop", 125, "Members spend currency on roles or items you set up.", { requires: ["virtual-currency"], needs: ["database"] }),
    f("Daily rewards", 50, "Members claim a small reward once a day.", { needs: ["database"] }),
    f("Achievement badges", 75, "Badges for reaching goals, shown on a member’s profile.", { needs: ["database"] }),
    f("Voice activity rewards", 60, "Members earn experience for time spent in voice channels.", { requires: ["xp-and-leveling"] }),
    f("Custom economy mechanics", null, "Your own earning and spending rules, like interest, taxes, or jobs."),
  ]] as Group,
  events: ["Events & scheduling", [
    f("Event announcements", 40, "Posts event details in a channel ahead of time."),
    f("RSVP buttons", 50, "Members press Going or Maybe, and the bot keeps the list.", { needs: ["database"] }),
    f("Event reminders", 40, "Reminds people who RSVP’d before an event starts.", { needs: ["scheduler"] }),
    f("Reminders", null, "Members set personal reminders, like “/remind 2h feed the cat”.", { unpriced: true, needs: ["database", "scheduler"] }),
    f("Time zone support", 50, "Shows event times in each member’s own time zone."),
    f("Availability polls", 90, "Finds a time that works for the most people."),
    f("Game night scheduling", 150, "Plan recurring game nights with sign-ups and reminders.", { needs: ["database", "scheduler"] }),
    f("Game picker", 100, "Picks a game at random from a list your group builds."),
    f("Custom interactive events", 400, "A one-off or seasonal event with its own commands, rules, and rewards, like a server-wide scavenger hunt. Starting price; confirmed after review.", { manual: true, needs: ["database"] }),
    f("Event management dashboard", 250, "A web page for staff to manage events. Starting price; confirmed after review.", { manual: true, needs: ["database", "accounts"] }),
  ]] as Group,
  automation: ["Applications & automation", [
    f("Application system", null, "Members fill out a form, like a staff application, and staff approve or deny it in a review channel.", { unpriced: true, needs: ["database"] }),
    f("Custom automations", null, "“When this happens, do that” rules made for your server."),
    f("Server analytics", null, "Regular stats about joins, activity, and your busiest channels.", { unpriced: true, needs: ["database"] }),
  ]] as Group,
  customization: ["Customization", [
    f("Custom embed theme", 30, "Gives all the bot’s messages your colors, icon, and footer."),
    f("Additional simple slash command", 20, "One more simple command, like /rules or /links.", { max: 20 }),
    f("Additional advanced command", 50, "One more command with logic or saved data. Starting price; confirmed after review.", { max: 20, manual: true }),
    f("Custom bot status", 20, "Sets the bot’s “Playing…” or “Watching…” status."),
    f("Multi-language support", null, "Lets the bot reply in more than one language."),
    f("External API integration", null, "Connects the bot to another service, like a game’s stats or a spreadsheet.", { thirdParty: ["The other service’s account and any plan or usage fees it charges"] }),
    f("Web dashboard", 350, "A website where staff change bot settings. Starting price; confirmed after review.", { manual: true, needs: ["database", "accounts"] }),
    f("Custom database features", null, "Saving and looking up information in ways specific to your server.", { needs: ["database"] }),
  ]] as Group,
};

/** Manual Discord layout work—no bot process. Available standalone or as add-ons on a bot build. */
const serverSetup = {
  structure: ["Server structure", [
    f("Channel layout", 40, "Creates and organizes channels with clear names, topics, and descriptions.", {
      example: "Categories like Welcome, Community, Support, and Staff, each with the channels your group actually uses.",
    }),
    f("Category organization", 25, "Groups channels into labeled categories so the sidebar is easy to scan.", { suggests: ["channel-layout"] }),
    f("Permission layout", 45, "Sets who can see and use each channel, including staff-only and member areas.", {
      example: "New members only see #rules and #verify until they accept the rules; staff see private mod channels.",
      suggests: ["role-hierarchy"],
    }),
    f("Server branding pass", 35, "Matches channel names, topics, and icons to your community’s look and naming style."),
  ]] as Group,
  roles: ["Roles & access", [
    f("Role hierarchy", 40, "Builds a clear role list with colors—staff above members, interests below.", {
      example: "Owner → Admin → Moderator → Member → Artist / Writer / He/Him, with colors that match your palette.",
    }),
    f("Interest and status roles", 30, "Adds self-serve or staff-assigned roles for hobbies, pronouns, or status.", { suggests: ["role-hierarchy"] }),
    f("Staff permission roles", 35, "Sets up admin and mod roles with the Discord permissions they need—and nothing extra."),
  ]] as Group,
  embeds: ["Content & embeds", [
    f("Branded info embeds", 40, "Writes and posts styled embed cards for rules, welcome, FAQ, or links.", {
      example: "A rules embed with your accent color, emoji section headers, and a footer with the server name.",
      fields: [{ key: "posts", label: "How many embed posts do you need?" }, { key: "topics", label: "Topics (rules, welcome, FAQ, links, etc.)" }],
    }),
    f("Welcome and rules posts", 30, "Formats the first things new members should read, with clear next steps.", { suggests: ["branded-info-embeds"] }),
    f("Resource and links board", 25, "A pinned or dedicated channel post with your important links and resources."),
    f("Onboarding checklist post", 25, "A short “start here” guide: read rules, pick roles, introduce yourself."),
  ]] as Group,
  polish: ["Polish & extras", [
    f("Existing server cleanup", 50, "Reorganizes a messy server: rename, archive, and regroup without wiping what still works.", {
      fields: [{ key: "current", label: "Invite or description of the current layout" }],
    }),
    f("Emoji and sticker placement", 20, "Places your custom emoji where they belong in reaction menus and info posts. You supply the art."),
    f("Channel topic and slowmode pass", 15, "Fills in helpful channel topics and sets slowmode where it helps."),
  ]] as Group,
};

const rp: Group[] = [
  ["Character management", [
    f("Character profiles", 100, "Each player gets a profile page for their character with the fields you choose.", { example: "Name, age, species, faction, appearance, and a picture.", suggests: ["character-roster"], needs: ["database"],
      complexity: [{ label: "Custom profile template", cents: 5000, description: "A custom-designed layout for each profile instead of the standard card." }],
      fields: [{ key: "fields", label: "Profile fields or field count" }, { key: "visibility", label: "Default visibility", choices: ["Public", "Members only", "Private"] }, { key: "images", label: "Image and approval requirements" }] }),
    f("Character roster", 75, "A browsable list of every approved character.", { needs: ["database"] }),
    f("Character search", 50, "Find characters by name, faction, or other fields.", { requires: ["character-roster"] }),
    f("Multiple characters per member", 50, "Players can own and switch between several characters.", { requires: ["character-profiles"] }),
    f("Character images", 40, "Upload or link character art on each profile.", { requires: ["character-profiles"] }),
    f("Character approval workflow", 100, "New characters and edits wait for staff approval before going live.", { requires: ["character-profiles"] }),
    f("Character statistics", 100, "Stats like strength or charm on each character, for games and checks.", { requires: ["character-profiles"] }),
    f("Character birthday tracking", 45, "Remembers in-world birthdays and can announce them.", { requires: ["character-profiles"], needs: ["scheduler"] }),
    f("Character relationships", 125, "Link characters as friends, family, rivals, or partners, shown on each profile.", { requires: ["character-profiles"] }),
    f("Faction or group membership", 150, "Characters join a faction, village, or guild, with its own roster and leaders.", { requires: ["character-profiles"] }),
  ]],
  ["Activity & participation", [
    f("RP activity tracking", 150, "Counts who is roleplaying and how often.", { needs: ["database"] }),
    f("Writing submission tracking", 100, "Members log their writing pieces for credit or rewards.", { needs: ["database"] }),
    f("Art submission tracking", 100, "Members log their art pieces for credit or rewards.", { needs: ["database"] }),
    f("Member activity reports", 100, "Regular reports so staff can see who is active.", { needs: ["database"] }),
    f("RP thread tracking", 150, "Tracks open roleplay threads, who is in them, and whose turn it is to reply.", { needs: ["database"] }),
    f("Activity check system", 125, "Runs activity checks and lists who has and hasn’t responded.", { needs: ["database"] }),
    f("Inactivity notifications", 50, "Gently pings members who have gone quiet.", { needs: ["scheduler"] }),
  ]],
  ["Progression", [
    f("Experience points", 100, "Characters earn experience for taking part.", { requires: ["character-profiles"], needs: ["database"] }),
    f("Character leveling", 150, "Characters level up from experience points.", { requires: ["experience-points"] }),
    f("Skills and abilities", 200, "Characters learn and improve skills over time.", { requires: ["character-profiles"], needs: ["database"] }),
    f("Unlockable abilities", 150, "Special abilities that open up at certain levels or milestones.", { requires: ["character-profiles"] }),
    f("Milestone rewards", 100, "Rewards for reaching goals, like a title or item.", { requires: ["character-profiles"] }),
    f("Achievements", null, "Collectible achievements for things characters or players do.", { unpriced: true, needs: ["database"] }),
    f("Custom progression formulas", null, "Your own math for how experience, levels, or stats grow."),
  ]],
  ["Inventory & economy", [
    f("Character inventories", 225, "Each character has a bag of items. Inventory needs somewhere to store everyone’s items, rules for adding and removing them, and checks so items can’t be duplicated by mistake.", { requires: ["character-profiles"], needs: ["database"] }),
    f("Item catalog", 125, "A list of every item in your world with descriptions and pictures.", { needs: ["database"] }),
    f("Currency system", 150, "Characters have a balance of your world’s money that the bot keeps track of.", { suggests: ["player-shops"], needs: ["database"] }),
    f("Player shops", 200, "Characters buy items with currency from shops you stock.", { requires: ["currency-system"] }),
    f("Automated transactions", 150, "Pay wages, fees, or rewards automatically.", { requires: ["currency-system"] }),
    f("Trading", 175, "Characters trade items with each other safely.", { requires: ["character-inventories"] }),
    f("Crafting", 250, "Combine items into new items using recipes you write.", { requires: ["character-inventories"] }),
    f("Equipment management", 200, "Equip items like weapons or outfits that change a character’s stats.", { requires: ["character-inventories"] }),
    f("Jobs and professions", null, "Characters take jobs that earn currency or unlock recipes.", { unpriced: true, requires: ["character-profiles"] }),
  ]],
  ["Quests & gameplay", [
    f("Quest system", 250, "A quest board where characters claim quests, submit their work, and get rewards approved by staff.", { needs: ["database"] }),
    f("Quest submissions", 100, "Players hand in finished quests for staff to review.", { requires: ["quest-system"] }),
    f("Quest rewards", 100, "Automatically gives items, currency, or experience when a quest is approved.", { requires: ["quest-system"] }),
    f("Daily quests", 150, "Fresh small quests every day.", { needs: ["scheduler"] }),
    f("Random encounters", 175, "Surprise events or creatures that show up as characters explore."),
    f("Dice mechanics", 75, "Dice rolls with modifiers, like /roll 1d20+3."),
    f("RP prompt generator", 40, "A command that suggests a random scene, plot hook, or writing prompt."),
    f("Combat system", 500, "Turn-based fights with health, attacks, and outcomes. Starting price: combat rules vary a lot between groups, so the final price is confirmed after review.", { manual: true, requires: ["character-profiles"], needs: ["database"] }),
    f("Cooldowns", null, "Limits how often an action can be used, like one hunt per hour.", { unpriced: true }),
    f("Raids or multiplayer encounters", null, "Group battles or events for several characters at once."),
    f("World exploration", null, "Move around a map of your world and discover places."),
    f("Travel system", null, "Travel between locations, with travel time or costs."),
    f("Weather system", null, "Changing in-world weather that can affect events or encounters.", { unpriced: true, needs: ["scheduler"] }),
    f("In-world events", null, "Timed events with sign-ups, special rules, and rewards.", { unpriced: true }),
  ]],
  ["Community administration", [
    f("Applications", 125, "Members apply to join, become staff, or take a role, and staff review it.", { needs: ["database"] }),
    f("Staff approval queue", 125, "One place for staff to approve characters, applications, and submissions.", { requires: ["applications"] }),
    f("Member dashboard", 300, "A website where members see their characters, items, and progress.", { requires: ["discord-authentication"] }),
    f("Staff dashboard", 350, "A website where staff manage members, characters, and settings.", { requires: ["discord-authentication"] }),
    f("Automated announcements", 50, "Posts updates like new members or approved characters automatically."),
    f("Rule acknowledgment", 50, "Members confirm they’ve read the rules before playing."),
    f("Reporting and analytics", 150, "Reports on activity, economy, and growth.", { needs: ["database"] }),
    f("Custom staff tools", null, "Commands or pages made for how your staff team works."),
  ]],
  ["Integration", [
    f("Discord authentication", 150, "Members sign in to a website with their Discord account, with permissions based on their roles.", { needs: ["accounts"] }),
    f("Discord and website synchronization", 250, "Keeps information like the roster the same on Discord and a website. Starting price; confirmed after review.", { manual: true, requires: ["discord-authentication"], needs: ["database"] }),
    f("Web inventory management", 300, "Members view and manage their characters’ items on a website. Starting price; confirmed after review.", { manual: true, requires: ["discord-authentication", "character-inventories"] }),
    f("Database migration", null, "Moves your existing records (spreadsheets, another bot) into the new system."),
    f("Custom API integration", null, "Connects to another service you use.", { thirdParty: ["The other service’s account and any plan or usage fees it charges"] }),
  ]],
];

const pages: Group = ["Pages", [
  f("Additional basic page", 65, "One more simple page, like Credits or Links, using your text and images.", { max: 30, pageNames: true,
    fields: [{ key: "names", label: "Names of these pages, separated by commas" }],
    note: "Count only pages that aren’t already listed as their own option below." }),
  f("Additional complex page", 125, "A page with custom layouts or interactive pieces, like a character sheet. Starting price; confirmed after review.", { max: 10, manual: true, pageNames: true,
    fields: [{ key: "names", label: "Names of these pages, separated by commas" }] }),
  f("About page", 60, "A page about you or your project."),
  f("Contact page", 60, "A page with ways to reach you. Add a contact form separately if you want one."),
  f("Gallery page", 100, "A page that shows your images in a grid.", { conflicts: ["image-gallery"] }),
  f("Portfolio page", 125, "A page that shows off your work with descriptions."),
  f("Blog or news page", 150, "Posts listed newest first, each with its own page."),
  f("FAQ page", 50, "Questions and answers in an easy-to-scan list."),
]];
const design = (withCustomAnimations = false): Group => ["Design", [
  f("Animated elements", 60, "Small touches like hover effects or a twinkling background.", withCustomAnimations ? { conflicts: ["custom-animations"] } : {}),
  f("Advanced CSS effects", 100, "Eye-catching visual effects made with code, like layered parallax."),
  f("Interactive navigation", 75, "A menu with personality, like a folder or game-style menu."),
  f("Light/dark theme", 75, "Visitors can switch between a light and dark version."),
  f("Custom layout design", 150, "A one-of-a-kind layout designed just for you instead of a standard grid."),
  f("Custom illustrated assets", null, "Original drawings, icons, or decorations for your site."),
]];
const launch: Group = ["Setup & launch", [
  f("Domain configuration", 30, "Connects your own web address, like yourname.com, to the site.", { kind: "addon", thirdParty: ["Domain registration, paid yearly to a domain registrar"] }),
  f("Deployment setup", 50, "Puts the finished site online on the hosting you choose and checks it works.", { kind: "addon" }),
  f("Analytics setup", 40, "Adds visitor statistics so you can see what people look at.", { kind: "addon", thirdParty: ["An analytics service account (some are free, some charge monthly)"] }),
  f("Advanced SEO work", null, "Extra work to help search engines find and understand your site.", { kind: "addon" }),
]];
const site: Group[] = [
  pages, design(true),
  ["Features", [
    f("Contact form", 85, "Visitors send you a message from the site without seeing your email address.", { thirdParty: ["A form or email delivery service account (often free for low volume)"] }),
    f("Image gallery", 100, "A grid of images that open larger when clicked.", { fields: [{ key: "images", label: "Approximate gallery size" }] }),
    f("Portfolio filtering", 75, "Visitors filter your work by type or tag.", { requires: ["portfolio-page"] }),
    f("Search", 125, "A search box that finds pages and posts on your site."),
    f("Character directory", null, "A browsable list of your characters with a page for each.", { unpriced: true, needs: ["database"] }),
    f("Content management system", 250, "Edit your text and images yourself without touching code. Starting price; confirmed after review.", { manual: true, needs: ["database", "accounts"] }),
    f("Newsletter integration", 75, "Visitors sign up for your email newsletter.", { thirdParty: ["A newsletter service account (may have a monthly plan)"] }),
    f("Social media integration", 40, "Show your latest posts or follow buttons from your social accounts."),
    f("Custom animations", 100, "Bigger animated moments made for your site. Starting price; confirmed after review.", { manual: true }),
    f("Password-protected page", 100, "A page only people with the password can open."),
    f("Member accounts", 350, "Visitors create accounts and log in. Starting price; confirmed after review.", { manual: true, needs: ["database", "accounts"] }),
    f("Admin dashboard", 400, "A private area where you manage members and content. Starting price; confirmed after review.", { requires: ["member-accounts"], manual: true }),
    f("Database integration", 200, "Store and show information that changes, like a list of entries. Starting price; confirmed after review.", { manual: true, needs: ["database"] }),
  ]],
  ["Integrations", [
    f("Discord widget", 40, "Shows your Discord server and an invite button on the site."),
    f("Discord OAuth", 150, "Visitors sign in with their Discord account.", { needs: ["accounts"] }),
    f("External API integration", null, "Show or send information to another service.", { thirdParty: ["The other service’s account and any plan or usage fees it charges"] }),
    f("Payment integration", 200, "Accept payments on the site. Starting price; confirmed after review.", { manual: true, thirdParty: ["A payment processor account, which takes a fee from each payment"] }),
    f("Booking or scheduling", 200, "Visitors book a time with you. Starting price; confirmed after review.", { manual: true, thirdParty: ["A booking or calendar service account, if one is used"] }),
  ]],
  launch,
];
const wiki: Group[] = [
  ["Content", [
    f("Multiple worlds", 100, "Keep separate settings or universes apart, each with its own characters.", { max: 20 }),
    f("Character relationships", 100, "Link characters as friends, family, rivals, and more."),
    f("Lore encyclopedia", 125, "Articles about your world’s history, magic, and culture."),
    f("Timelines", 150, "Events in order, linked to the characters involved."),
    f("Location directory", 100, "Pages for places in your world."),
    f("Organization directory", 100, "Pages for groups, guilds, or factions."),
    f("Character tagging", 75, "Tag characters so visitors can find related ones."),
    f("Search and filtering", 100, "Adds filters, like by tag, world, or faction, on top of the included name search."),
  ]],
  ["Management", [
    f("Multiple editors", 150, "More than one person can add and edit entries."),
    f("User accounts", 250, "Visitors make accounts, for example to follow characters or submit entries.", { needs: ["accounts"] }),
    f("Private entries", 100, "Entries only you or chosen people can see."),
    f("Import existing data", null, "Bring in entries from a spreadsheet, document, or another site.", { fields: [{ key: "records", label: "Approximate number of records" }, { key: "format", label: "Current storage or file format" }] }),
    f("Revision history", 150, "See and restore earlier versions of an entry."),
  ]],
  ["Advanced", [
    f("Relationship visualization", 200, "A web diagram showing how characters connect.", { requires: ["character-relationships"] }),
    f("Interactive world maps", 250, "A clickable map of your world. Starting price; confirmed after review.", { manual: true }),
    f("Family trees", 250, "Family trees drawn from your character data. Starting price; confirmed after review.", { manual: true }),
    f("Custom taxonomy system", 150, "Your own categories and sub-categories for organizing entries."),
    f("Public submissions", 200, "Visitors submit entries for you to review.", { needs: ["accounts"] }),
    f("Approval workflows", 150, "Submissions wait for approval before going public.", { requires: ["public-submissions"] }),
  ]],
  design(), launch,
];
const community: Group[] = [
  ["Pages & membership", [
    f("Additional basic page", 65, "One more public page beyond the four included.", { max: 25, fields: [{ key: "names", label: "Pages beyond the first four" }] }),
    f("Member registration", 250, "Members sign up for an account on the site.", { needs: ["database", "accounts"] }),
    f("Discord login", 150, "Members sign in with Discord.", { needs: ["accounts"] }),
    f("Member profiles", 200, "Each member gets a public profile page.", { requires: ["member-registration"] }),
    f("Applications", 200, "An application form with a staff review step.", { needs: ["database"] }),
    f("Approval workflows", 150, "Staff approve applications or content before it goes live.", { requires: ["applications"] }),
    f("Advanced permissions", null, "Detailed rules for which members and staff can see or change what."),
  ]],
  ["Community tools", [
    f("News management", 150, "Staff post announcements and news on the site.", { needs: ["database"] }),
    f("Event calendar", 150, "A calendar of upcoming community events.", { needs: ["database"] }),
    f("Search", 125, "Search across the site’s pages and posts."),
    f("Character directory", null, "A browsable list of community characters.", { unpriced: true, needs: ["database"] }),
    f("Community statistics", 150, "Show numbers like members, posts, or events.", { needs: ["database"] }),
    f("Member dashboard", 350, "A private page where members manage their account and activity.", { requires: ["member-registration"] }),
    f("Staff dashboard", 400, "A private area where staff manage members and content.", { requires: ["member-registration"] }),
    f("Discord bot integration", 250, "Connect the site to your Discord bot. Starting price; confirmed after review.", { manual: true }),
  ]],
  design(), launch,
];
const appFeatures: [string, string, string[]?][] = [
  ["Authentication", "People sign in, and the app knows who they are.", ["accounts"]],
  ["User profiles", "A profile page for each user.", ["database"]],
  ["Database", "Stores the app’s information safely.", ["database"]],
  ["Admin tools", "Pages for you to manage the app."],
  ["Data management", "Add, edit, and remove records."],
  ["Search and filtering", "Find records quickly."],
  ["Scheduling", "Calendars, bookings, or timed tasks."],
  ["Notifications", "Emails or alerts when something happens."],
  ["File storage", "Users upload and download files."],
  ["Third-party integrations", "Connect to other services you use."],
  ["Payment processing", "Take payments in the app."],
  ["Dashboards", "Summary screens with key numbers."],
  ["Analytics", "Reports on how the app is used."],
  ["Collaboration", "Several people working on the same things."],
  ["API development", "Let other apps or bots talk to this one."],
  ["Import/export tools", "Bring data in or take it out as files."],
];
const app: Group[] = [
  ["Application capabilities", appFeatures.map(([label, description, needs]) => f(label, null, description, {
    needs, fields: [{ key: "behavior", label: "Describe what it should do" }],
    thirdParty: label === "Payment processing" ? ["A payment processor account, which takes a fee from each payment"]
      : label === "Notifications" ? ["An email delivery service account"] : label === "Third-party integrations" ? ["The other services’ accounts and any fees they charge"] : undefined,
  }))],
  launch,
];
const assess = (label: string, description: string) => f(label, null, description, {
  fields: [{ key: "details", label: "What’s happening now, and what should happen?" }],
  note: "Existing work needs a look at the current code and setup before a guaranteed price.",
});
const improvement: Group[] = [["What needs work", [
  assess("Bug fixes", "Something that used to work, or should work, doesn’t."),
  assess("New features", "Add something new to a site or bot you already have."),
  assess("Website redesign", "A fresh look or layout for an existing site."),
  assess("Discord bot upgrade", "Update an existing bot, for example to newer Discord features or to add commands."),
  assess("Database migration", "Move your data to a new database or format."),
  assess("Existing system integration", "Connect what you have to another bot, site, or service."),
]]];
const hosting: Group[] = [
  ["Infrastructure", [
    f("Website hosting", null, "Keeping a website online.", { kind: "recurring", suggests: ["scheduled-backups"] }),
    f("Discord bot hosting", null, "Keeping a bot online around the clock.", { kind: "recurring", suggests: ["scheduled-backups"] }),
    f("Database hosting", null, "Keeping your database online and backed up.", { kind: "recurring" }),
    f("Additional storage", null, "More room for files or data.", { kind: "recurring" }),
    f("Additional environments", null, "A separate test copy of your project.", { kind: "recurring" }),
  ]],
  ["Maintenance services", [
    f("Uptime monitoring", null, "Alerts when your project goes offline.", { kind: "recurring" }),
    f("Scheduled backups", null, "Regular copies of your data.", { kind: "recurring" }),
    f("Maintenance updates", null, "Keeping software and dependencies up to date.", { kind: "recurring" }),
    f("Priority support", null, "Faster responses within agreed hours.", { kind: "recurring" }),
    f("Custom domain assistance", 30, "Help connecting your own web address.", { kind: "addon", thirdParty: ["Domain registration, paid yearly to a domain registrar"] }),
  ]],
];

const groups: Record<ProjectType, Group[]> = {
  "discord-bot": [
    bot.welcome, bot.roles, bot.moderation, bot.tickets, bot.engagement, bot.characters, bot.creators, bot.leveling, bot.events, bot.utilities,
    bot.automation, bot.customization,
    // Optional: same server-setup work can be bundled with a bot project.
    serverSetup.structure, serverSetup.roles, serverSetup.embeds, serverSetup.polish,
  ],
  "discord-setup": [serverSetup.structure, serverSetup.roles, serverSetup.embeds, serverSetup.polish],
  "roleplay-bot": [
    ...rp, bot.welcome, bot.roles, bot.moderation, bot.tickets, bot.engagement, bot.creators, bot.events, bot.customization,
    serverSetup.structure, serverSetup.roles, serverSetup.embeds, serverSetup.polish,
  ],
  "personal-site": site, "oc-wiki": wiki, "community-site": community, "web-app": app, improvement, hosting, other: [],
};
/** Base packages that always need a database (shown in shared infrastructure and hosting advice). */
export const packageNeeds: Partial<Record<string, string[]>> = { "custom-rp-bot": ["database"], "oc-wiki": ["database", "accounts"], "custom-bot-dashboard": ["accounts"] };

export const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function seedFeatures(type: ProjectType): Feature[] {
  const qualify = (ids: string[] | undefined) => ids?.map(id => `${type}:${id}`);
  const items: Feature[] = groups[type].flatMap(([category, features]) => features.map(({ label, dollars, kind, ...rules }) => ({
    id: `${type}:${slug(label)}`, label, cents: dollars === null ? null : dollars * 100, kind: kind ?? "feature" as const,
    ...rules, category, requires: qualify(rules.requires), conflicts: qualify(rules.conflicts), suggests: qualify(rules.suggests),
  })));
  if (type !== "hosting" && type !== "other") items.push({ id: `${type}:content-migration`, label: "Content migration", cents: null, kind: "addon", category: "Setup & launch",
    description: "Moving existing text, images, or records from somewhere else into the new project." });
  return items;
}

/** Plain-language hosting advice for the "Not sure" option. Uses plan names only, never invented amounts. */
export function recommendHosting(type: ProjectType, needs: string[], packageSlug = ""): { mode: HostingMode; title: string; reason: string } {
  if (packageSlug === "toyhouse-profile") return { mode: "client", title: "No separate hosting",
    reason: "Toyhouse codes run on Toyhouse. You paste HTML into the character or profile field (and optional Premium CSS). Host images on Toyhouse — no separate site host is needed." };
  if (packageSlug === "tumblr-theme") return { mode: "client", title: "No separate hosting",
    reason: "Tumblr themes run on Tumblr. You paste custom CSS into the theme editor and host images on Tumblr or another image host — no separate site host is needed." };
  if (type === "discord-setup" || packageSlug === "discord-server-setup") return { mode: "client", title: "No separate hosting",
    reason: "Server setup is configuration inside Discord itself. There is no website or bot process to host unless you also order a custom bot." };
  if (type === "discord-bot" || type === "roleplay-bot") return { mode: "managed", title: "Scriptmoth-managed hosting",
    reason: "A bot has to stay switched on all day and night to answer commands. If you don’t already run a server, letting Scriptmoth manage it is the simplest option." };
  if (needs.includes("database") || needs.includes("accounts")) return { mode: "managed", title: "Scriptmoth-managed hosting",
    reason: "Your build saves information or has sign-ins, so it needs a server and a database that are looked after and backed up." };
  if (type === "personal-site" || type === "community-site") return { mode: "client", title: "Host it yourself",
    reason: "A site without a database is just files. Static hosts are simple to use and many have free plans, so hosting it yourself is usually easy. Scriptmoth can do the deployment setup for you." };
  return { mode: "unsure", title: "Decide together", reason: "This depends on what the project needs. Scriptmoth will recommend an option after reviewing it." };
}

export const builderRoutes = {
  "discord-bot": "discord-bot", "discord-setup": "discord-setup", "rp-system": "roleplay-bot",
  "personal-website": "personal-site", "oc-wiki": "oc-wiki", "community-website": "community-site",
  "web-application": "web-app", hosting: "hosting", improvements: "improvement",
} as const;
