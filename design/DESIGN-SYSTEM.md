# Scriptmoth design system

Scriptmoth pairs an illustrated nighttime setting with cream reading surfaces and interface details borrowed from retro RPG menus, file folders, and terminals.

## Color and type

| Role | Palette or typeface |
| --- | --- |
| Plum and night | `#2E1128` ink and `#1E1128` for the hero, header, and footer |
| Cream and lavender | `#FFF6E9` and `#D6C4F0` for button skins, illustrations, and section accents |
| Purple and gold | `#7A5CA6` and `#F4C590` for selection marks, illustrations, and dark-surface focus |
| Heading | Bricolage Grotesque Variable, with tight tracking |
| Body | DM Sans Variable, with a 1.6 line height |
| Terminal details | Courier New monospace for compact labels, window bars, and commands |

The theme tokens in [foundation.css](../src/styles/foundation.css) control `--paper`, `--surface`, `--surface-alt`, `--ink`, `--muted`, `--line`, `--accent`, `--focus`, and `--danger`. Composites such as `--panel-cream` and `--panel-lavender` derive from theme surfaces. Keep body copy on an opaque surface or on the quiet side of an illustrated gradient. Use explicit text for disabled, unavailable, and error states.

## Layout and components

- Public content uses a 72rem container, comfortable gutters, and section padding that scales from 2.75rem to 5.25rem. Use the narrower reading container for FAQs and long-form copy.
- Use double rules for illustrated mastheads and the footer, dotted rules for dividers and estimate lines, and an inset edge or a low shadow for interactive panels. Reserve corners and browser chrome for components that benefit from framing.
- Primary and secondary actions use the supplied lavender and cream button skins with scalable nine-slice borders and real text. Use an outline for supporting actions and an underlined text link for navigation. Use Lucide icons for functional controls with visible labels or accessible names. Keep keyboard focus visible and essential controls at least 44px tall.
- Give service cards a category-specific illustration and a tinted surface. Keep the whole card link for compact previews with one destination. Use explicit links when a card has more than one action.
- Portfolio categories use folder tabs and expose the selected filter via `aria-pressed`. Concept art and real screenshots keep their proportions inside the preview frame.
- Form controls retain labels, native behavior, visible focus, and inline error text. The quote builder uses a moon marker for the current step, native checkboxes for features, and separate one-time and recurring subtotals.
- Business forms and tables favor readable labels, quieter backgrounds, and explicit state. Add an illustrated empty state only when it makes the next action easier to find.

## Artwork

Use the night-scene WebP in the homepage hero and position its clouds independently on narrow screens. Reserve the moons and clouds texture for lavender intros and leaf sprigs for warm studio and inquiry surfaces. The footer uses the dedicated moon strip beneath its navigation. The cream and lavender illustrated frames fit the 16:9 workshop illustration, and project previews use separate checker, scallop, and leaf patterns.

See the [asset inventory](ASSET-INVENTORY.md) for original artwork. Keep editable and full-size exports in `design/` where possible. Prefer WebP for decorative background exports. Give meaningful images descriptive alternative text and leave decorative art silent.

## Motion

| Interaction | Timing |
| --- | --- |
| Hover or press | 160–180ms |
| Page introduction | 440ms with a slight upward settle |
| Quote step heading | 220ms |
| Moth hover and action sparkles | 520–650ms, once per interaction |
| Add-on corner peel | 300ms |
| Homepage command | 900ms on the first homepage visit per tab |
| Button press squish and star wink | 60ms press, 560ms star once per hover |
| Scroll reveal | Tied to scroll position via `animation-timeline: view()`; skipped where unsupported |
| Feature collected (quote builder) | 360ms bounce, price-tag pop, sticker corner peel |
| Ambient loops (hero float, hero stars, footer status light, 404 moth) | 3.4–11s, low amplitude, at most one per area |

Use transform and opacity for movement. Keep continuous loops rare and slow; everything else plays once per interaction. Use `--star-shape` and `--moth-shape` for decorative sparkles and moths instead of new clip paths, and place a resting moth in one spot per page at most. The cursor companion is off by default, toggled from the footer, and hidden on touch and reduced-motion devices. The global reduced-motion rule disables animations, transitions, and smooth scrolling. Labels, focus, form results, and progress markers carry all necessary information independently of motion.
