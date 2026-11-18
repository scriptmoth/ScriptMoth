# Scriptmoth launch catalog

Internal pricing and delivery draft. All figures are proposed direct-sale starting prices in USD. Limits are working assumptions to confirm before taking orders.

## Launch offers

| Offer | Starting price | Base purchase |
| --- | ---: | --- |
| Custom Discord Bot | $75 | One standard module for one server |
| Community Engagement Bot | $150 | Two engagement modules for one server |
| Custom RP Bot | $250 | One character-roster workflow for one server |
| Personal Website | $200 | Up to three responsive public pages |
| OC Wiki Website | $500 | Searchable, editable character and world encyclopedia |
| Custom Bot Dashboard | $500 | One administration screen for a compatible Discord bot |

### Custom Discord Bot · $75+

- **Included.** Choose welcome messages or self-assignable roles for one Discord server. Configure one welcome channel and message, or one role menu with up to five existing roles. Includes up to three basic slash commands if the selected module uses them.
- **Client supplies.** A Discord server admin to authorize installation, the message copy or role list, and a test channel. For role menus, the bot needs a role above the roles it assigns.
- **Acceptance.** A test join posts the agreed message in the selected channel, or a test member can add and remove only the agreed roles through the menu.
- **Extras.** A second module, custom embeds, moderation workflows, tickets, or multi-server configuration.
- **Reuse candidate.** Welcome-event handling, template rendering, role menus, and configuration validation. The Role Call portfolio concept can illustrate onboarding.

### Community Engagement Bot · $150+

- **Included.** Choose two of QOTD, creative prompts, trivia, birthdays, or spotlights. Use one timezone and one destination channel per module. Include one posting schedule per module, up to 20 supplied entries per content library, and self-service birthday registration if selected. Trivia uses scheduled question posts and answer reveals.
- **Client supplies.** A server admin, channels, timezone, posting schedule, and any question, answer, prompt, or spotlight copy.
- **Acceptance.** Staff can preview both modules, and each posts the agreed content to the configured channel on a test schedule. If birthdays are selected, a member can register or remove their month and day, and an opted-in test birthday triggers an announcement.
- **Extras.** A third module, QOTD submission and review, trivia scoring, custom sourcing, or multiple schedules per module.
- **Reuse candidate.** Scheduler, content queue, prompt rendering, and birthday registration.

### Custom RP Bot · $250+

- **Included.** One Discord character roster with up to six agreed profile fields and up to 25 sample or launch records supplied in an agreed template. Players can submit, edit, view, and list their own records. Staff can approve or reject submissions and browse approved profiles.
- **Client supplies.** A server admin, character schema, staff role, submission rules, sample records, and a database environment or hosting choice.
- **Acceptance.** A player submits a character, staff reviews it, and the agreed audience can browse the approved profile. A player cannot edit another member’s record or approve submissions. Records persist across bot restarts.
- **Extras.** Additional workflows, inventory, currency, quests, progression, legacy imports, or a web dashboard.
- **Reuse candidate.** Character schemas, record ownership, review states, role checks, and persistence adapters. Party Sheet can illustrate a broader RP workflow.

### Personal Website · $200+

- **Included.** Up to three responsive pages using supplied text and imagery, one visual direction, basic page titles and descriptions, and contact or social links. A typical site has Home, About, and Work pages.
- **Client supplies.** Final copy, cleared artwork, page names, contact links, brand references, and access to the chosen deployment account if launch assistance is needed.
- **Acceptance.** All agreed pages and navigation work at mobile and desktop widths. Supplied content appears on the agreed pages, and contact and social links open their intended destinations.
- **Extras.** Extra pages, a filterable gallery, a contact form, editable content, copywriting, or a domain purchase. The $250 Personal tier in the brief can cover a simple contact form once the form and delivery scope are priced.
- **Reuse candidate.** Responsive page layouts, navigation, artwork components, and page metadata. Sketchbook Index can illustrate how an artist site organizes work.

### OC Wiki Website · $500+

- **Included.** Public directories and detail pages for characters and worlds, one search across names and summaries, and one editor account. Include up to eight agreed fields per record type and entry of up to ten supplied launch records total. Use image URLs from an agreed source.
- **Client supplies.** Record fields, sample records, approved copy and images, editor email, and a deployment and database choice.
- **Acceptance.** Visitors can browse both directories and find test entries by name or summary. The editor can create, update, and remove records, and public users cannot use the editing tools. Saved changes appear on the public site.
- **Extras.** Timelines, lore articles, uploads, multiple editor roles, private entries, relationships, or bulk migration.
- **Reuse candidate.** Record schemas, public directory and profile templates, search, and editor forms. Sketchbook Index can demonstrate character-led navigation.

### Custom Bot Dashboard · $500+

- **Included.** One Discord OAuth sign-in, one configured server, and one settings screen that reads and updates up to five existing values through a compatible bot API or data layer. Access is limited to the agreed server administrator or staff role.
- **Client supplies.** Access to the bot source or documented integration, a test server, the settings schema, the authorized staff role, and a deployment environment with a callback URL. Confirm compatibility before quoting the base price.
- **Acceptance.** Authorized staff can sign in, view current settings, and save a change that the bot uses. An account without the required access cannot view or edit server settings. Invalid inputs are rejected without changing saved settings.
- **Extras.** Bot integration work, additional screens, analytics, multiple servers, advanced permission rules, or a new bot. Quote a combined bot and dashboard from $750 where both are needed.
- **Reuse candidate.** OAuth session handling, server and role checks, settings forms, validation, and bot configuration adapters.

## Delivery and quoting

- Each base quote covers configuration, one review round against the written scope, acceptance testing, and a handover with the client-specific source or build, setup instructions, and a deployment walkthrough. Specify any reusable components and their license in the quote. For a client-managed production deployment, identify the account owner and any setup work before accepting the project.
- Proposed support is 14 calendar days after acceptance for reproducible failures against the agreed acceptance checks. Quote added features and changed requirements separately. Confirm the schedule once client access, content, dependencies, and scope are known.
- Estimate discovery, build, testing, revisions, installation, and handover at the proposed $35–$50 internal hourly target. At $40/hour, the $75 direct-sale tier supports about 1.9 hours before expenses. Using the brief’s 80% Fiverr payout assumption, it supports 1.5 hours before expenses. Quote template departures based on the actual hours and costs.
- Example add-on ranges from the brief. Simple command $15–$30, standard bot module $50–$125, additional page $50–$100, gallery $75–$150, and form or submission workflow $75–$200. Quote migrations and existing-code integration after reviewing the input.
- Domains, paid third-party services, and hosting are separate. Use the hosting figures in the brief as proposed management fees of $15, $30, or $60 per month, with infrastructure usage billed separately at cost and setup quoted by project. Confirm monitoring, backup scope, support hours, and cancellation and export terms in the hosting quote.

## Module catalog for estimates

Use these as candidate building blocks. Before quoting, confirm the implementation is portable, the license permits commercial reuse, and the expected inputs and integrations match. Estimate adaptation and testing time for each selected module.

| Module | Estimate from the brief | Scope inputs that affect a quote |
| --- | --- | --- |
| Scheduled posts and content library | $75+ for a standalone QOTD or birthday bot | Channels, timezones, schedules, review queues |
| Polls, RSVPs, and reminders | $100+ | Event recurrence, signup caps, eligibility, reminder timing |
| Tickets and moderation | $125+ each | Staff roles, transcripts, escalation, retention |
| Character roster | $150+ | Fields, visibility, edit rights, import size |
| RP activity tracking | $175+ | Qualifying actions, manual review, reporting |
| Applications and approvals | $200+ | Form fields, reviewers, decision states, notifications |
| Quest board | $250+ | Claim rules, submissions, approval, rewards |
| Currency and shop | $300+ | Earning rules, prices, spending, transaction history |
| Inventory | $300+ | Item schema, assignment, transfers, quantity rules |
| Progression | $350+ | XP events, ranks, unlocks, reward delivery |
| Editable character and world directory | $500+ for an OC Wiki site | Record types, editor roles, entry count, image handling |
| Bot dashboard | $500+ for the launch package | API compatibility, access checks, settings, analytics |

Use one applicable base package and price the extra scope. Where an add-on overlaps a base feature, estimate only the work beyond the included limits. Use the launch package price for the full deliverable even when an individual module starts lower.

Reuse assessments above are based on the supplied capability audit and local portfolio descriptions. Review original code and ownership before selecting a component. Build public demos with fictional data and Scriptmoth-owned assets, and review any imported code or assets for private data, credentials, and identifying metadata.

## Storefront handoff

Use the six launch offers on a Products page and link each to a quote inquiry that carries the selected product into the form. Use the existing Services page for custom development, with case studies under Portfolio and hosting under its own page once the plan terms are set. Checkout is outside the proposed inquiry workflow. The current contact form validates drafts locally, with live delivery pending configuration.
