# Scriptmoth

Moth’s portfolio and storefront (a Next.js site) plus **moth.exe**, the showcase Discord bot. They live in one repo but run and deploy separately.

## Project map

```
src/                 website (Next.js App Router)
  app/               routes: one folder per URL (app/_home/ holds the homepage sections)
  demos/             portfolio demos, one folder per family; see src/demos/README.md
  components/        site chrome (site/), shared UI (ui.tsx), quote builder and portals (business/)
  data/              service info: packages, prices, features, FAQ, policies, hosting providers
  lib/               site helpers, asset registry, and business logic (business/: db, pricing, auth)
  styles/            global CSS
public/assets/       images and downloads served as-is; URLs are linked from outside, don't move them
tests/               site tests (node --test)
scripts/             site maintenance scripts
bot/                 moth.exe Discord bot: its own package.json, .env, and README
design/              source artwork and design notes (not deployed)
```

The site and bot share no code. The bot keeps its own copy of the site links it uses in `bot/src/links.js`.

## Commands

Use Node.js 22.13 or later in the 22.x line, or Node.js 24 LTS.

**Website** (from the repo root; copy `.env.example` to `.env.local` first):

```sh
npm ci
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm test
npm run build && npm start
npm run embed-art    # redraw Discord embed art in public/assets/discord/embeds/
```

**Bot** (from `bot/`; copy `bot/.env.example` to `bot/.env`, or let it fall back to the root `.env`):

```sh
npm install
npm start            # run the bot
npm test
npm run catalog      # list every module and its commands
npm run deploy       # register slash commands with Discord (live)
npm run setup-server -- setup/moths-server.js --dry-run   # preview the server layout
```

## Where to edit service info

| What | File |
| --- | --- |
| Package prices, what’s included, feature prices, builder options | `src/data/builder.ts` (one file for every price) |
| Package art, “optional extras”, hosting plan rates | `src/data/catalog.ts` |
| Homepage service rows and process steps | `src/data/services.ts` |
| FAQ answers | `src/data/faq.ts` |
| Policies | `src/data/policies.ts` |
| Hosting providers on /resources | `src/data/hosting-resources.ts` |
| Site description and navigation | `src/lib/site.ts` |
| Discord channel styles / embed designs | `src/demos/discord/discord-styles.ts`, `discord-embeds.ts` |
| Bot feature list (shown by `/moth features`) | each module’s `index.js` in `bot/src/modules/` |
| Bot links to the site, server welcome/build-your-bot posts | `bot/src/links.js`, `bot/setup/moths-server.js` |

Saved edits at `/admin/builder` and `/admin/catalog` override the file defaults at runtime, so check there if a change doesn’t show up.

Development uses `.scriptmoth/studio.sqlite` when `SCRIPTMOTH_DB_PATH` is blank. Production needs an explicit database path. Visitors can browse the catalog and preview estimates without storage. When storage is missing, the inquiry form says submissions are unavailable.

## Storefront and builder

- `/products` lists published catalog entries. Detail pages expose the appropriate **Build Your Own** link. Edit listings and screenshots at `/admin/catalog`.
- `/contact` is the shared builder and inquiry page. `/build/<type>` and `/request-a-quote` link into the same experience.
- `/admin/builder` controls option availability, base and add-on prices, categories and order, quantity tiers, customization fields, setup charges, minimums, dependency rules, incompatible features, and suggestions.
- Default builder pricing lives in one file, `src/data/builder.ts`: starter packages (and the `/products` listing prices), feature prices, complexity upgrades, dependencies, package inclusions, shared infrastructure, and third-party notes. Hosting plan rates stay in `src/data/catalog.ts`. A `null` price means custom estimate, `unpriced: true` means the price is still pending review, and `manual: true` marks a "from" price.
- Prices are integer minor currency units. Both the browser preview and server use the same pricing function. The server rejects stale pricing versions and records the current configuration, line items, currency, version, and totals together. Manual pricing stays visible in the estimate.
- Guests can save a configuration in their browser. The local save excludes contact and attachment fields. Verified clients can save inquiry drafts to their account and resume them from `/dashboard`.
- `/hosting` explains client-managed and Scriptmoth-managed deployment. For client-managed hosting, the client supplies the intended provider and plan before scope is agreed. Scriptmoth-managed services use third-party infrastructure with setup and provider charges scoped separately. `/resources` links to provider documentation.

## Discord style and embed libraries

`/portfolio/discord-styles` lists 120 Discord category and channel naming styles, and `/portfolio/discord-embeds` lists 120 embed designs (codes like `E03A`). Both have search, a family filter, and copyable text.

- `src/demos/discord/discord-styles.ts` and `discord-embeds.ts` are the single lists. Codes are permanent: two digits for the family and a letter for the design (`02F`, or `E03A` for embeds). Never renumber or reuse one; add new styles at the end of a family.
- Clients add codes in the quote builder for Discord projects. Links such as `/contact?type=discord-server-setup&showcase=02F,04B` open the builder with those codes filled in. The form fields keep the older `showcase_ids` / `showcase_notes` names so saved inquiries still load.

## Client and studio operations

- `/login` uses Better Auth email codes. A successful code verifies the email and can create a client account. Admin access is limited to verified addresses listed in `SCRIPTMOTH_ADMIN_EMAILS`.
- `/admin` shows incoming builds, the submitted pricing snapshot, quote history, deadlines, invoices, support, and hosting counts. To issue a formal quote for a guest inquiry, ask the guest to sign in with their inquiry email first.
- Quotes use one line per item in the format `Label | Amount | one-time`; also supported are `recurring` and `discount`. A revision creates a new quote version. Client acceptance records the decision and creates a project in one transaction.
- `/dashboard` shows the signed-in client’s inquiries, drafts, quotes, projects, support, and profile. The project workspace contains milestones, updates, messages, files, invoices, and hosting. Clients can download an account data export and request account deletion. Review those requests against the studio’s retention policy before manually fulfilling them.
- Admin workspaces publish updates, set project status, manage milestones, issue invoices, and track work time, internal notes, support classifications, and hosting details. Internal notes stay out of client views and export queries.
- `/admin/settings` controls commission availability, intake maintenance mode, catalog visibility, hosting plans, payment availability, upload limits, notification templates, and policy publication. Read the business policy draft and publish owner-approved text before public launch.

## Database, files, and deployment

The business schema uses Node’s SQLite module. SQL migrations in `src/lib/business/schema.ts` run transactionally at first access and are tracked in `schema_migrations`. Better Auth applies its own schema when account routes first initialize. Back up the database before upgrades.

Run a single Next.js Node server on a private persistent volume, such as a VM or container with mounted storage. Set `SCRIPTMOTH_DB_PATH` to an absolute path outside public directories. Each environment needs a separate database, origin, email configuration, and payment configuration. Keep SQLite off ephemeral serverless filesystems and network shares. Apply the deployment platform’s request body limits. In production behind a reverse proxy, set `SCRIPTMOTH_TRUSTED_IP_HEADER` to the header your proxy overwrites with the real client IP; without it, guest inquiry rate limits share one bucket. Keep the database, WAL, logs, and backups private.

Project and inquiry uploads are stored in SQLite alongside their ownership records. Each upload allows up to four files and a combined maximum of 4 MB by default. Upload checks enforce matching file signatures and reject executable web file types. Project downloads require both an authorized account and a short-lived signature. Deleting an attachment removes its stored bytes from the live database. Follow the provider’s backup expiration policy for historical copies. Set up an independent malware-scanning workflow before accepting sensitive documents or archives.

Use SQLite’s online backup mechanism to create consistent backups, encrypt the backup destination, retain copies off the application volume, and test restoring them. Configure production error monitoring for server errors and provider failures, and redact customer details in logging. Review secure transport and CSP at the deployment edge.

## External services checklist

- [ ] Configure `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` with the same final HTTPS origin. Set a random `BETTER_AUTH_SECRET` and the verified administrator email addresses.
- [ ] Set up a verified Resend domain and sender. Set `RESEND_API_KEY`, `SCRIPTMOTH_MAIL_FROM`, and `SCRIPTMOTH_INQUIRY_EMAIL`. The app records email events in a durable outbox. Delivery is attempted after relevant requests, and admins can retry pending delivery from settings.
- [ ] Test Stripe Checkout with `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in test mode. Subscribe `/api/payments/webhook` to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `customer.subscription.updated`, and `customer.subscription.deleted`. Use monthly Price IDs matching the exact currency, amount, and interval for hosting plans.
- [ ] Confirm production plans, provisional prices, availability, legal copy, and support coverage. Record receipt and invoice handling, cancellation, data retention and deletion, and account ownership practices.
- [ ] Configure private storage backups, monitoring and alerting, malware scanning, and `SCRIPTMOTH_TRUSTED_IP_HEADER` for proxy-aware rate limiting. Check public metadata, logos, demo media, provider accounts, and repository history for personal identifiers before launch.

Stripe Checkout uses stored invoice amounts and only updates payment state after a signed provider webhook. When any required Stripe settings are missing, the portal shows that online payments are unavailable. Refunds are initiated in Stripe and recorded from its webhook. Hosting provision, legal review, email delivery, and production Stripe confirmation require external setup. Scheduled due-date and renewal delivery, automated retention/purge, and provider monitoring require deployment-side operations.
