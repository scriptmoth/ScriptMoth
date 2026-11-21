# moth.exe feature roadmap

✅ built (module id in brackets) · ⬜ planned. *Source* points at an existing bot of yours to port from, where one exists. Port the logic, not the storage, and go through `ctx.store`.

## Characters & OCs

| | Feature | Tier | Notes |
| --- | --- | --- | --- |
| ✅ | Random character picker | L1 | Part of `characters` (`/character random`) |
| ✅ | Character profile cards | L2 | `characters` |
| ✅ | Character birthday announcements | L2 | `character-birthdays` · source: Character-Birthday-Bot, OCHUB |
| ✅ | Character birthday calendar | L2 | `character-birthdays` |
| ✅ | Character of the week spotlight | L2 | `spotlight` · source: OCHUB |
| ✅ | User-submitted RP prompts | L2 | `rp-prompt` |
| ⬜ | Character notes | L2 | Private owner notes on a character |
| ⬜ | Character playlists | L2 | |
| ⬜ | Fandom directory | L2 | |
| ⬜ | Searchable character directory | L3 | Filters by species, owner, tags; paginated |
| ⬜ | Full OC management system | L4 | source: OCHUB |
| ⬜ | Character web dashboard | L4 | source: OCHUB `web/` |

## Roleplay & gaming

| | Feature | Tier | Notes |
| --- | --- | --- | --- |
| ✅ | RP dice commands | L1 | `dice` |
| ✅ | Random encounter generator | L2 | `encounter` |
| ✅ | RP prompt generator | L2 | `rp-prompt` |
| ⬜ | Character application forms | L2 | |
| ⬜ | Character approval workflow | L3 | source: Tinglebot 2.0 |
| ⬜ | RP thread tracking | L3 | |
| ⬜ | Character activity checks | L3 | |
| ⬜ | Character inventories | L3 | source: Tinglebot 2.0, Pokimono |
| ⬜ | Character relationships | L3 | |
| ⬜ | Quest management | L3 | source: Tinglebot 2.0 |
| ⬜ | Quest submission and approval | L3 | source: Tinglebot 2.0 |
| ⬜ | Faction or village membership | L3 | source: Tinglebot 2.0 |
| ⬜ | In-game currency and shops | L3 | source: Tinglebot 2.0, Pokimono |
| ⬜ | Battle system | L4 | source: Pokimono |
| ⬜ | Travel and location system | L4 | source: Tinglebot 2.0 |
| ⬜ | Crafting and material collection | L4 | source: Tinglebot 2.0 |
| ⬜ | Interactive world map | L4 | |
| ⬜ | Full RP character dashboard | L4 | source: Tinglebot 2.0 `dashboard/` |

## Creators, artists & fandom

| | Feature | Tier | Notes |
| --- | --- | --- | --- |
| ✅ | Art prompt generator | L1 | `art-prompt` |
| ⬜ | Random OC spotlight | L2 | Could reuse `spotlight` with a different source |
| ⬜ | Art submission gallery | L2 | |
| ⬜ | Fan creation submissions | L2 | |
| ⬜ | Featured fan art voting | L2 | |
| ⬜ | Creator announcement scheduling | L2 | |
| ⬜ | Commission queue | L3 | |
| ⬜ | Commission request management | L3 | |
| ⬜ | Art challenge management | L3 | |
| ⬜ | Art contest management | L3 | |
| ⬜ | Community collaboration matching | L3 | |
| ⬜ | Creator portfolio directory | L3 | |
| ⬜ | Integrated creator dashboard | L4 | |

## Website integration

| | Feature | Tier | Notes |
| --- | --- | --- | --- |
| ⬜ | Public server statistics page | L3 | |
| ⬜ | Discord account login | L3 | source: Tinglebot-Dashboard |
| ⬜ | Personal member dashboard | L4 | |
| ⬜ | Bot configuration website | L4 | |
| ⬜ | Member progress synchronization | L4 | |
| ⬜ | Web-based inventory management | L4 | |
| ⬜ | Website and Discord data synchronization | L4 | |
| ⬜ | Custom database-backed portal | L4 | |

## Community extras

| | Feature | Tier | Notes |
| --- | --- | --- | --- |
| ✅ | Self-assign role panels | L1 | `role-panels` · source: Ruubot `panels.js` |
| ✅ | Secret Santa exchange | L3 | `secret-santa` |
| ✅ | Gift exchange assignment and reminders | L3 | Part of `secret-santa` (reminders still planned) |
| ⬜ | Emoji usage statistics | L2 | Needs GuildMessages + MessageContent intents · source: Tinglebot 2.0 emoji export |
| ⬜ | Emoji popularity leaderboard | L2 | |
| ⬜ | Emoji suggestion voting | L2 | |
| ⬜ | Temporary private text channels | L2 | |
| ⬜ | Voice channel activity rewards | L2 | Needs GuildVoiceStates |
| ⬜ | Voice channel name customization | L2 | |
| ⬜ | Bookmark and saved-message system | L2 | Message context-menu command |
| ⬜ | FAQ search | L2 | |
| ⬜ | Private group creation | L3 | |
| ⬜ | Server backup and restore tools | L3 | |
| ⬜ | Community resource library | L3 | |
| ⬜ | Community mentorship matching | L3 | |
| ⬜ | Collaborative goal tracker | L3 | |
| ⬜ | Community chore or task board | L3 | |
| ⬜ | Community achievement tracker | L3 | |
| ⬜ | Custom interactive event system | L4 | |

## Notes

- L4 systems will likely need a real database and a web app. At that point, add a Mongo-backed store adapter in `src/core/` rather than changing module code.
- Message context-menu commands (for bookmarks) need a small runtime addition: route `isMessageContextMenuCommand()` the same way as slash commands.
