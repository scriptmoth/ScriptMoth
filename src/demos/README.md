# Portfolio demos

Each demo family keeps its React components and template data together in one folder here.
Images stay in `public/assets/` so their URLs never change. Downloaded Tumblr/Toyhouse codes
and hotlinked images point at those URLs, so **don't move files in `public/assets/`**.

| Family | Code | Demos (`/demos/<slug>`) | Images and downloads |
| --- | --- | --- | --- |
| One-page sites | `carrd/` (`carrd-templates.ts` holds every design) | celestial-observatory, strawberry-milk, jade-teahouse, midnight-tarot, glitter-guestbook, neon-district | `public/assets/portfolio/<slug>/`, chibis in `public/assets/carrd/` |
| Tumblr themes | `tumblr/` | velvet-midnight, meadow-scrapbook | `public/assets/portfolio/<slug>/` (incl. `tumblr-theme.txt`), shared art in `public/assets/tumblr/` |
| Toyhouse profiles | `toyhouse/` | soft-atelier, lantern-festival | `public/assets/portfolio/<slug>/` (incl. `toyhouse-profile.txt`), cast and backdrops in `public/assets/toyhouse/`, Bootstrap in `public/assets/vendor/` |
| Character wikis | `wiki/` (one skin per layout: encyclopedia, codex, scrapbook) | lantern-archive, starlit-codex, petal-index | `public/assets/portfolio/<slug>/`, characters reuse `public/assets/toyhouse/` |
| Bot dashboard | `astral-archive/` | `/demos/astral-archive` (its own route) | `public/assets/portfolio/astral-archive/` |
| Discord styles & embeds | `discord/` | `/portfolio/discord-styles`, `/portfolio/discord-embeds` | `public/assets/discord/embeds/` (drawn by `npm run embed-art`) |

Shared pieces:

- `demo-gallery.tsx`: the live-thumbnail grid used by every family's `*-gallery.tsx`.
- `portfolio-art.ts`: the main artwork for each demo slug, with dimensions.
- `showcase-art.ts`: decorative art in `public/assets/showcase/`, shared by several demos.

Routes:

- `src/app/demos/[slug]/page.tsx` renders the carrd, tumblr, toyhouse, and wiki demos and the "Switch design" bar.
- `src/app/demos/velvet-midnight/theme/route.ts` serves the real Tumblr theme HTML (from `tumblr-theme.txt`) in an iframe.
- `src/app/demos/astral-archive/page.tsx` renders the dashboard.

To add a demo, add an entry to the family's `*-templates.ts`, then put its images in `public/assets/portfolio/<slug>/`.
`generateStaticParams`, the sitemap, the portfolio grid, and the homepage pick it up from the template list.
