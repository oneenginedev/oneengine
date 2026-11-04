# OneEngine design system

This document describes the site as it is built today. The source of truth for tokens is the `:root` block at the top of `style.css`; if the two disagree, fix this file. It covers two surfaces: the marketing site (`index.html`, `download.html`, `changelog.html`, `404.html`) and the store (`store/`).

## 1. Principles

1. **Say what it is in five seconds.** The hero answers three questions in order: what OneEngine is (eyebrow + wordmark + lead), why it is fast (four headline figures), and how to get it (one primary button).
2. **One primary action per view.** "Download for Windows" is the only solid button in the hero and the nav. "View on GitHub" is the outlined secondary. Everything else is a text link.
3. **Every number is sourced or labelled.** Engine figures are labelled as v1.0 design targets, the telemetry chart as illustrative, and store/game ratings and prices as sample data. Versions, sizes and dates come live from GitHub Releases, never from hand-written copy.
4. **Light paper with dark engine panels.** Pages sit on a pale paper background. Content that represents the engine itself (systems stage, code, telemetry, philosophy card, laptop screen) uses near-black panels.
5. **Motion is optional.** Everything that loops can be paused with a visible control, pauses off screen, and stops entirely for `prefers-reduced-motion`.

## 2. Tokens

### Colour

| Token | Value | Role |
| :--- | :--- | :--- |
| `--paper` | `#f6f6f9` | Page background |
| `--paper-2` | `#ececf2` | Hover fills, inset areas, quiet cards |
| `--card` | `#ffffff` | Cards, outlined buttons |
| `--ink` | `#0e0c1d` | Headings, primary text, primary button |
| `--ink-2` | `#4b4960` | Body copy, nav links |
| `--ink-3` | `#67657c` | Metadata, hints, labels (was `#807e93`, which failed AA) |
| `--line` | `#e1e0ea` | Borders and dividers |
| `--violet` | `#5b3df5` | Brand accent, links, eyebrows, focus ring on light |
| `--cyan` | `#2fd3e6` | Secondary accent (brand mark, telemetry bars, code) |
| `--grad` | `linear-gradient(120deg, violet, cyan)` | Telemetry bars |
| `--style-accent` | `#7c5cfa` (default) | Accent of the selected system. `site.js` sets it per tab |
| `--dark` | `#0c0b14` | Systems band, telemetry card, philosophy card |
| `--dark-2` | `#141320` | Panel inside the systems band |
| `--dark-code` | `#090812` | Code window |
| `--on-dark` | `#f4f2fb` | Primary text on dark |
| `--on-dark-2` | `#b9b6c9` | Body text on dark |
| `--on-dark-3` | `#a19eb3` | Labels and captions on dark |
| `--violet-on-dark` | `#b9a9ff` | Eyebrows, badges and the focus ring on dark panels |

The per-system accents set by `site.js` are `#7c5cfa`, `#2fd3e6`, `#ff7a2f`, `#3fe3a0`, `#e2435a` and `#8a6cff`. Nav link icons use darker variants (`#1f9fc4`, `#e0661c`, `#1a9e6c`, `#d4344c`) so they reach 3:1 on white.

Code highlighting: keywords `#8a6cff`, functions `#2fd3e6`, numbers `#ff9e42`, strings `#3fe3a0`, comments `#8a87a0`.

### Contrast (WCAG 2.2 AA, checked by calculation)

| Pair | Ratio |
| :--- | :--- |
| `--ink-2` on `--paper` | 8.0:1 |
| `--ink-3` on `--paper` / `--paper-2` | 5.2:1 / 4.8:1 |
| `--violet` on `--paper` | 5.7:1 |
| `--on-dark-3` on `--dark-2` | 7.0:1 |
| `--violet-on-dark` on `--dark` | 9.5:1 |
| Code comment on `--dark-code` | 5.7:1 |
| White on discount badge `#c2410c` | 5.2:1 |

### Layout and spacing

| Token | Value | Used for |
| :--- | :--- | :--- |
| `--page-max` | `1240px` | Content width of every section, the nav and the footer |
| `--gutter` | `clamp(16px, 5vw, 72px)` | Minimum side padding |
| `--section-y` | `clamp(72px, 9vw, 128px)` | Vertical padding of every section |
| `--head-gap` | `clamp(32px, 4vw, 48px)` | Space between a section heading block and its content |

Sections pad themselves with `max(var(--gutter), calc((100% - var(--page-max)) / 2))`, so content lines up with the nav at every width. The FAQ uses a narrower 780px measure.

### Shape and depth

| Token | Value | Used for |
| :--- | :--- | :--- |
| `--radius` | `26px` | Cards and panels |
| `--radius-lg` | `40px` | Systems band (28px on phones) |
| | `22px` / `18px` / `16px` | Stage panel / tabs and steps / code window |
| | `999px` | Buttons, nav, presets, pills |

Shadows are soft, offset downward and tinted with the ink colour, for example `0 20px 45px -16px rgba(14, 12, 29, 0.14)`.

### Motion

- Easing: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.
- Hover and press transitions: 140–220ms. Telemetry bars animate height over 600ms and the stage glow over 700ms.
- Entrance (`rise`): 900ms, staggered by 120ms.
- `prefers-reduced-motion`: all animations and transitions collapse to 0.01ms, loops stop, videos start paused, the fire canvas draws one static frame, and the systems tabs don't auto-rotate.
- Never use `transition: all`.

## 3. Typography

| Role | Font | Size | Weight |
| :--- | :--- | :--- | :--- |
| Body | Figtree | 17px / 1.55 | 400–600 |
| Eyebrow | Figtree | 13px, uppercase, 0.06em tracking | 700 |
| Heading 2 | Figtree | `clamp(34px, 4.6vw, 56px)` | 750 |
| Heading 3 | Figtree | 21px | 700 |
| Wordmark, brand, footer brand | Unbounded | 16px and up | 500–700 |
| Code, stats, telemetry | JetBrains Mono | 12–13.5px | 400–600 |

Headings use `letter-spacing: -0.03em` and `line-height: 1.05`. Every section heading has an eyebrow above it.

## 4. Page structure (`index.html`)

1. **Hero.** Eyebrow "Game engine for Windows 10 & 11", wordmark (h1), lead, Download (primary) + View on GitHub (secondary), one meta line, four figures with a "Design targets for v1.0" note, and the laptop with a gameplay loop and a pause button.
2. **Architecture** (`#systems`, dark band). Tablist first, then the panel, then a "Pause auto-rotate" button and the targets note.
3. **Profiling** (`#telemetry`). Presets radio group and the telemetry chart, labelled illustrative.
4. **Built with OneEngine** (`#features`). Railbound video and info card with the sample-data note.
5. **Services** (`#services`). Two cards with text-link actions (no competing solid buttons).
6. **Get started** (`#download`). Windows card, Linux/macOS card and the philosophy quote card in one grid. This replaced the separate Vision section.
7. **FAQ** (`#faq`).
8. **Footer.** About, Product, Project and Help & contact columns.

`download.html` reads the latest GitHub release and shows its file, size and date, or "No public build yet" when there is none. `changelog.html` lists every release from the GitHub API. Both have static fallbacks without JavaScript.

## 5. Components

- **Buttons.** 52px tall (38px for `.btn-small`), pill radius, 650 weight. `.btn-ink` is solid ink with white text. `.btn-line` has a 1.5px `--line` border on `--card`. Pressing scales to 0.97 (not under reduced motion). `.text-link` is violet, weight 600.
- **Nav.** Full-width white bar (max `--page-max`), fixed 16px from the top, blurred backdrop. Brand left, six section links centred with tinted icons, GitHub `</>` button and the primary "Download" button right. Icons hide below 1120px. At 700px and below the links move into a menu (`.nav-toggle`) that closes on link click, outside click and Escape. Below 480px the GitHub button hides so Download always stays visible.
- **Skip link.** First focusable element on every page, jumps to `#main`.
- **Systems tabs.** Six-tab tablist driving one tabpanel. Left/Right/Home/End with a roving tabindex. Auto-rotates every 5s; pauses while hovered or focused; stops for good once the visitor picks a tab; a visible "Pause/Resume auto-rotate" button (WCAG 2.2.2). Hidden and off under reduced motion.
- **Hero motion toggle.** Round button on the laptop screen that pauses and resumes the video and the fire canvas.
- **Performance presets.** Radio group with a roving tabindex; arrow keys move and select.
- **Telemetry chart.** `role="img"`; `site.js` writes every bar value into its `aria-label` when the preset changes.
- **Game card.** Video with Play/Pause and Mute, genre list, spec `<dl>`, rating and price row, and a visible "Sample data" note.
- **FAQ.** Native `<details>` with a `+` marker.
- **Focus.** `2.5px solid var(--violet)`, 3px offset; `--violet-on-dark` inside dark panels.

## 6. Media

- Videos ship as WebM (VP9) and MP4 (H.264) at 1280px wide, roughly 2 MB each. Both pause when off screen and start paused for reduced-motion visitors. The game video uses `preload="none"`.
- Posters are WebP. The social image is `og-image.jpg` (1200 × 630).

## 7. Store (`store/`)

The store is a built single-page app (Vite output with Tailwind classes). Only the build output is in this repo, so it is not redesigned here.

- **Shared with the site:** the violet accent `#7c5cfa`, JetBrains Mono for numbers, and a "OneEngine Site" pill that links back.
- **Different on purpose:** a dark app shell (`#07090C`) with Inter for UI text.
- A fixed "Sample data" note sits next to the back pill (in `store/index.html`, outside the bundle).

## 8. Conventions

1. Keep gradients to the brand mark, the telemetry bars and the accent glow. No gradient text.
2. Use `transform` and `opacity` for motion, and always provide a reduced-motion path and a visible pause for anything that loops longer than 5 seconds.
3. Every interactive element needs a visible `:focus-visible` state and a keyboard path.
4. Every figure is either sourced, labelled "design target", labelled "illustrative", or labelled "sample data".
5. Don't hand-write versions, file sizes or release dates; `site.js` fills `[data-release-version]`, `[data-release-title]`, `[data-release-status]` and `[data-release-link]` from GitHub.
6. New sections use an eyebrow, an h2 with an `id`, and `aria-labelledby` on the `<section>`.

## 9. Known gaps

- No docs page exists yet; the FAQ and GitHub are the only help.
- The store body is `select-none overflow-hidden`, which blocks text selection, and the store has not been audited for contrast or keyboard use.
- Contrast was checked by calculation for the token pairs above, not with an automated audit of every element.
