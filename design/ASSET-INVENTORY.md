# Scriptmoth artwork inventory

This directory holds the source artwork. The website serves its exports from [`public/assets/`](../public/assets/) and reads their paths and dimensions from [the asset registry](../src/lib/assets.ts). The app icon in `src/app/icon.png` follows Next.js’s file convention. Cropped exports retain the artwork’s colors and proportions.

| Folder | Contents |
| --- | --- |
| [`logos/`](logos/) | Full Scriptmoth lockup and app mark |
| [`mascot/`](mascot/) | Standalone coding moth |
| [`icons/`](icons/) | Navigation and decoration sheet plus standalone exports |
| [`illustrations/`](illustrations/) | Service, feature, and gallery artwork |
| [`buttons/`](buttons/) | Blank button skin sheet |
| [`backgrounds/`](backgrounds/) | PNG and SVG seamless tiles and the footer background |
| [`references/`](references/) | Approved reference, concept sheet, and kit overview |

Source paths below are relative to this directory.

| Source | Size and transparency | Use |
| --- | --- | --- |
| `logos/logo-scriptmoth-app-mark.png` | 1254 × 1254, transparent | App mark in navigation and footer. A proportionally downsized copy is used as the favicon. |
| `logos/logo-scriptmoth-full-lockup.png` | 2172 × 724, transparent | Full lockup in the hero. |
| `icons/icon-navigation-sheet.png` | 1448 × 1086, transparent | Navigation and decoration sheet for future exports. |
| `icons/icon-*.png` (standalone) | 300 × 300 each, transparent | Home, sparkles, moon, pixel cross, leaf sprig, moth flight, question bubble, mail, tag, layout grid, and code. |
| `buttons/button-skin-sheet.png` | 1448 × 1086, transparent | Cream and lavender exports use nine-slice borders so labels can grow. The plum skin is available for future use. |
| `mascot/illustration-terminal-moth.png` | 300 × 300, transparent | Coding moth for development and loading sections. |
| `illustrations/illustration-*.png` | 300 × 300 each, transparent | Browser code and gallery, checklist, cloud servers and upload, code brackets, Discord, moth gear, shield and tickets, photo stack, question bubble, robot, and star-heart. |
| `backgrounds/tile_*.png` | Nine opaque 512 × 512 tiles | Stars for the hero and grid for technical previews. Other tiles are available for future use. |
| `backgrounds/tile_*.svg` | Nine scalable tiles, 256 × 256 viewBox | Alternate tile masters. |
| `backgrounds/footer_night_background.jpg` | 1536 × 384, opaque | Footer background. |
| `references/original_user_approved_reference.png` | 1536 × 1024, partial alpha | Approved logo variants, service icons, button hierarchy, palette, and visual direction. |
| `references/concept_sheet.png` | 1536 × 1024, alpha range 31–253 | Reference for mascot expressions, buttons, frames, controls, badges, spot art, dividers, and palette. The expressions sit on a semi-opaque backdrop and need dedicated exports. |
| `references/kit_overview.jpg` | 1500 × 1420, opaque | Kit summary and component examples. |

### Web-only files without a master here

These live only in [`public/assets/`](../public/assets/). None are used by the site yet unless noted.

| File in `public/assets/` | Size and transparency | Use |
| --- | --- | --- |
| `logos/icon-rounded.png` | 1254 × 1254, opaque black corners | Moth app icon on a rounded plum tile. Trim the corners before using it as a transparent icon. |
| `logos/icon-rounded-arc.png` | 1254 × 1254, opaque black corners | Rounded plum tile with a lavender arc above the moth. |
| `logos/icon-square-arc.png` | 1254 × 1254, opaque | Full-bleed plum square with an arc and sparkles. Suits a Discord server icon, which Discord crops to a circle. |
| `logos/badge-round-wordmark.png` | 1254 × 1254, opaque white corners | Round badge with the Scriptmoth wordmark and laurels. |
| `logos/mark-sparkle-ring.png` | 1254 × 1254, transparent | Moth mark inside a dotted ring of sparkles. |
| `mascot/holding-discord.png` | 1254 × 1254, transparent | Smiling moth hugging the Discord logo, for Discord-related sections. |
| `illustrations/divider-moth.png` | 2172 × 724, transparent | Section divider: lavender rules and sparkles around a smiling moth. |
| `discord/embed-pink-sparkle-strip.gif` | 500 × 36, 9-frame animation | Thin sparkle band for Discord embed images. Cropped from a third-party GIF, so confirm usage rights before public use. |

The contact envelope in `public/assets/illustrations/` is an existing export from the original service and feature sheet. The full kit ZIP, original service sheet, and editable SAI file were unavailable in the workspace at the time of this inventory.

The portfolio’s Sketchbook Index sketchbook tile uses the photo-stack illustration. Its web export keeps the full 300 × 300 canvas.

