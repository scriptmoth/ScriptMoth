# Scriptmoth

Scriptmoth’s storefront, project configurator, and client portal. The application uses the existing Next.js App Router, TypeScript, Tailwind styles, and Scriptmoth illustrations.

## Run locally

Use Node.js 22.13 or later in the 22.x line, or Node.js 24 LTS. Copy `.env.example` to `.env.local` before configuring any providers.

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

Open [localhost:3000](http://localhost:3000). Development automatically uses `.scriptmoth/studio.sqlite` when `SCRIPTMOTH_DB_PATH` is blank. Production needs an explicit database path. Public catalog browsing and estimate previews remain available without storage. Submissions clearly show when they are unavailable.

## Architecture

The storefront and pricing engine feed persisted inquiries. Email OTP gates the admin and client portals. Formal quote acceptance creates a project that anchors milestones, messages, invoices, support, and hosting. Stripe and transactional email are configured separately. Portfolio demos are template-driven under `src/data/*-templates.ts`, with illustrations in `design/` and `public/assets/`. Discord channel and category styles are in the style library (see below).

## Storefront and builder

- `/products` lists published catalog entries. Detail pages expose the appropriate **Build Your Own** link. Edit listings and screenshots at `/admin/catalog`.
- `/contact` is the shared builder and inquiry page. `/build/<type>` and `/request-a-quote` link into the same experience.
- `/admin/builder` controls option availability, base and add-on prices, categories and order, quantity tiers, customization fields, setup charges, minimums, dependency rules, incompatible features, and suggestions.
- Default builder pricing lives in one file, `src/data/builder.ts`: starter packages (and the `/products` listing prices), feature prices, complexity upgrades, dependencies, package inclusions, shared infrastructure, and third-party notes. Hosting plan rates stay in `src/data/catalog.ts`. A `null` price means custom estimate, `unpriced: true` means the price is still pending review, and `manual: true` marks a "from" price.
- Prices are integer minor currency units. Both the browser preview and server use the same pricing function. The server rejects stale pricing versions and records the current configuration, line items, currency, version, and totals together. Manual pricing stays visible in the estimate.
- Guests can save a configuration in their browser. The local save excludes contact and attachment fields. Verified clients can save inquiry drafts to their account and resume them from `/dashboard`.
- `/hosting` explains client-managed and Scriptmoth-managed deployment. For client-managed hosting, the client supplies the intended provider and plan before scope is agreed. Scriptmoth-managed services use third-party infrastructure with setup and provider charges scoped separately. `/resources` links to provider documentation.

## Discord style library

`/portfolio/discord-styles` lists 100 Discord category and channel naming styles, with search, a family filter, copyable names, and formatting notes.

- `src/data/discord-styles.ts` is the single list. Codes are permanent: two digits for the family and a letter for the design (`02F`). Never renumber or reuse one; add new styles at the end of a family.
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
