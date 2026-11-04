# OneEngine design system

This document describes the site as it is built today. The source of truth for tokens is the `:root` block at the top of `style.css`; if the two disagree, fix this file. It covers two surfaces: the marketing site (`index.html`, `download.html`, `404.html`) and the store (`store/`).

## 1. Principles

1. **Light paper with dark engine panels.** Pages sit on a pale paper background. Content that represents the engine itself (the systems stage, code windows, telemetry card, the philosophy card) uses near-black panels.
2. **One brand accent, with cyan as its partner.** Violet is the brand colour. Cyan appears next to it in the brand mark, code highlighting and telemetry bars.
3. **Big rounded geometry.** Cards use a 26px radius, controls are pills. There are no hard-edged panels.
4. **Eased, purposeful motion.** Entrances and hovers share one easing curve. Anything that loops pauses when it is off screen and stops for visitors who ask for reduced motion.
5. **Literal copy.** Say what the engine does, in numbers where possible. Demo content is labelled as demo content.

## 2. Tokens

### Colour (marketing site)

| Token | Value | Role |
| :--- | :--- | :--- |
| `--paper` | `#f6f6f9` | Page background |
| `--paper-2` | `#ececf2` | Hover fills, inset areas |
| `--card` | `#ffffff` | Cards, outlined buttons |
| `--ink` | `#0e0c1d` | Headings, primary text, primary button |
| `--ink-2` | `#4b4960` | Body copy, nav links |
| `--ink-3` | `#807e93` | Metadata, hints, hover borders |
| `--line` | `#e1e0ea` | Borders and dividers |
| `--violet` | `#5b3df5` | Brand accent, links, focus ring |
| `--cyan` | `#2fd3e6` | Secondary accent |
| `--grad` | `linear-gradient(120deg, violet, cyan)` | Telemetry bars |
| `--style-accent` | `#7c5cfa` (default) | Accent of the selected system. `site.js` sets it per tab |

The per-system accents set by `site.js` are `#7c5cfa`, `#2fd3e6`, `#ff7a2f`, `#3fe3a0`, `#e2435a` and `#8a6cff`.

### Dark panels

| Value | Used for |
| :--- | :--- |
| `#0c0b14` | Systems stage, telemetry card, philosophy card |
| `#141320` | Panel inside the systems stage |
| `#090812` | Code window |
| `#f4f2fb` | Primary text on dark |
| `#b9b6c9`, `#a19eb3` | Secondary text on dark |

Code highlighting: keywords `#8a6cff`, functions `#2fd3e6`, numbers `#ff9e42`, strings `#3fe3a0`, comments `#696680`.

### Shape and depth

| Token | Value | Used for |
| :--- | :--- | :--- |
| `--radius` | `26px` | Cards and panels |
| | `40px` / `34px` | Systems stage / philosophy card |
| | `22px` / `18px` / `16px` | Stage inner panel / tiles and steps / code window |
| | `999px` | Buttons, nav, presets, pills |

Shadows are soft, offset downward and tinted with the ink colour, for example `0 20px 45px -16px rgba(14, 12, 29, 0.14)`. The systems stage glows in the selected system's accent.

### Spacing

There is no fixed scale. Sections use `padding: clamp(80px, 10vw, 140px) clamp(20px, 5vw, 72px)` and cards use `clamp()` padding between 26px and 42px.

### Motion

- Easing: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.
- Hover and press transitions: 140–220ms. Telemetry bars animate height over 600ms and the stage glow over 700ms.
- Entrance (`rise`): 900ms, staggered by 120ms.
- Never use `transition: all`.

## 3. Typography

| Role | Font | Size | Weight |
| :--- | :--- | :--- | :--- |
| Body | Figtree | 17px / 1.55 | 400–600 |
| Heading 2 | Figtree | `clamp(34px, 4.6vw, 56px)` | 750 |
| Heading 3 | Figtree | 21px | 700 |
| Wordmark, brand, footer brand | Unbounded | 16px and up | 500–700 |
| Code, stats, telemetry | JetBrains Mono | 12–13px | 400–600 |

Headings use `letter-spacing: -0.03em` and `line-height: 1.05`. Small uppercase labels (stat captions, spec labels, service pills) use 11–12px with 0.04–0.05em tracking. Everything else is sentence case.

## 4. Components

- **Buttons.** 52px tall (38px for `.btn-small`), pill radius, 650 weight. `.btn-ink` is solid ink with white text. `.btn-line` has a 1.5px `--line` border on `--card`. Pressing scales to 0.97. `.text-link` is violet, weight 600.
- **Nav.** A floating white pill, fixed 16px from the top, with a blurred backdrop. At 700px and below the links collapse into a menu button (`.nav-toggle`). The menu closes on link click, outside click and Escape. Below 480px the "Open Store" button hides and the Store link lives in the menu.
- **Systems tabs.** A six-button tablist driving one tabpanel (`#stagePanel`). Left/Right move between tabs, Home/End jump, and focus uses a roving tabindex. Tabs rotate every 5 seconds until the pointer or keyboard focus enters the section.
- **Performance presets.** A radio group with a roving tabindex. Arrow keys move and select, Home/End jump.
- **Game card.** Shows a video, tags, specs and a rating and price row. The rating and price are sample data and carry a visible "Sample data" note.
- **FAQ.** Native `<details>` elements with a `+` marker.
- **Focus.** One global ring: `2.5px solid var(--violet)`, 3px offset.

## 5. Media

- Videos ship as WebM (VP9) and MP4 (H.264) at 1280px wide, roughly 2 MB each. Both videos on the home page are paused when off screen, and neither autoplays for visitors who prefer reduced motion. The game video uses `preload="none"`.
- Posters and card images are WebP. The social preview image is `og-image.jpg` (1200 × 630).
- `gameplay-preview.mp4` is the original source recording and is not referenced by any page.

## 6. Store (`store/`)

The store is a built single-page app (Vite output with Tailwind classes). Only the build output is in this repo, so styling changes mean editing compiled files.

- **Shared with the site:** the violet accent `#7c5cfa`, JetBrains Mono for code and numbers, and a "OneEngine Site" pill that links back.
- **Different on purpose:** it is a dark app shell (`#07090C` background, light text) and uses Inter for UI text where the site uses Figtree.
- The store's accent used to be orange `#FF7A00`. It was replaced with the site's violet.

## 7. Conventions

1. Keep gradients to the brand mark, the telemetry bars and the accent glow. No gradient text.
2. Use `transform` and `opacity` for motion where possible, and always provide a reduced-motion path.
3. Every interactive element needs a visible `:focus-visible` state and a keyboard path.
4. Any number that is not a measured fact (reviews, prices, store data) must be labelled as sample data.
5. Link to real URLs. GitHub links point at `https://github.com/oneenginedev/oneengine`.

## 8. Known gaps

- The systems tabs auto-rotate and have no visible pause button. Hover and keyboard focus pause them, but a visible control is still needed for full WCAG 2.2.2 compliance.
- The telemetry card is `aria-hidden`, so screen-reader users miss the bar values.
- The store body is `select-none overflow-hidden`, which blocks text selection.
- Colour contrast has not been formally audited.
