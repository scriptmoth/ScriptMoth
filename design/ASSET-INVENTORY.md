# Scriptmoth artwork inventory

This directory holds the source artwork. The website serves its exports from [`public/assets/`](../public/assets/) and reads their paths and dimensions from [the asset registry](../src/lib/assets.ts). The app icon in `src/app/icon.png` follows Next.js’s file convention. Cropped exports retain the artwork’s colors and proportions.

| Folder | Contents |
| --- | --- |
| [`logos/`](logos/) | Full Scriptmoth lockup and app mark |
| [`mascot/`](mascot/) | Standalone coding moth |
| [`illustrations/`](illustrations/) | Service, feature, and gallery artwork |
| [`buttons/`](buttons/) | Blank button skin sheet |
| [`backgrounds/`](backgrounds/) | Full-size PNGs for site backgrounds and patterns |
| [`references/`](references/) | Approved reference, concept sheet, and kit overview |
| [`discord-assets/`](discord-assets/README.md) | Downloaded artwork and source links. Selected assets have optimized [portfolio exports](../public/assets/showcase/). |

Source paths below are relative to this directory.

| Source | Size and transparency | Use |
| --- | --- | --- |
| `logos/logo-scriptmoth-app-mark.png` | 1254 × 1254, transparent | App mark in navigation and footer. A proportionally downsized copy is used as the favicon. |
| `logos/logo-scriptmoth-full-lockup.png` | 2172 × 724, transparent | Full lockup in the hero. |
| `buttons/button-skin-sheet.png` | 1448 × 1086, transparent | Cream and lavender exports use nine-slice borders so labels can grow. |
| `mascot/illustration-terminal-moth.png` | 300 × 300, transparent | Coding moth for development and loading sections. |
| `illustrations/illustration-*.png` | 300 × 300 each, transparent | Browser code and gallery, checklist, cloud servers, Discord, question bubble, robot, and star-heart. |
| `backgrounds/background-*.png` and `backgrounds/pattern-*.png` | Full-size PNGs | Masters for the cream-frame, cloud-frame, and moth-flight WebP exports in [`public/assets/backgrounds/`](../public/assets/backgrounds/). |
| `references/original-user-approved-reference.png` | 1536 × 1024, partial alpha | Approved logo variants, service icons, button hierarchy, palette, and visual direction. |
| `references/concept-sheet.png` | 1536 × 1024, alpha range 31–253 | Reference for mascot expressions, buttons, frames, controls, badges, spot art, dividers, and palette. The expressions sit on a semi-opaque backdrop and need dedicated exports. |
| `references/kit-overview.jpg` | 1500 × 1420, opaque | Kit summary and component examples. |

### Web-only files without a master here

These live only in [`public/assets/`](../public/assets/).

| File in `public/assets/` | Size and transparency | Use |
| --- | --- | --- |
| `logos/icon-rounded.png` | 1254 × 1254, opaque black corners | Moth app icon on a rounded plum tile. Bot avatar in the Discord embed previews. |
| `mascot/holding-discord.png` | 1254 × 1254, transparent | Smiling moth hugging the Discord logo. Sticker in the homepage hero. |

The contact envelope in `public/assets/illustrations/` is an existing export from the original service and feature sheet. The full kit ZIP, original service sheet, and editable SAI file were unavailable in the workspace at the time of this inventory.

The [footer background](../public/assets/backgrounds/footer-night-background.jpg) uses its original file directly.



Unused masters (tile set, icon sheet, unexported illustrations) were removed in the November 2026 cleanup. They are in git history under `design/` if you need them again.
