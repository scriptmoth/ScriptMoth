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

The contact envelope in `public/assets/illustrations/` is an existing export from the original service and feature sheet. The full kit ZIP, original service sheet, and editable SAI file were unavailable in the workspace at the time of this inventory.

The portfolio’s Sketchbook Index sketchbook tile uses the photo-stack illustration. Its web export keeps the full 300 × 300 canvas.

