# OneEngine design system

This document describes the site as it is built today. The source of truth for tokens is the `:root` block at the top of `style.css`; if the two disagree, fix this file. It covers the marketing site (`index.html`, `download.html`, `changelog.html`, `404.html`). The store (`store/`) is a prebuilt app and keeps its own styling (see section 8).

## 1. Direction

A clean, confident, premium tech look: light bands alternating with one near-black band, one strong orange accent, big headlines, generous whitespace, soft glass, and fully rounded shapes. Motion is subtle and always optional.

1. **Say what it is in five seconds.** The hero headline is the product promise, the line under it says the platform and price, and two buttons say what to do.
2. **One primary action.** "Download for Windows" is the solid orange button. "View on GitHub" is the outlined secondary. Everything else is a dark or light pill, or a text link.
3. **No mock data.** No unmeasured figures, benchmarks, ratings or prices. The only numbers on the page come live from GitHub: the commit count and the latest release.
4. **Motion is optional.** Every loop pauses from the hero's pause button, off-screen videos pause, and `prefers-reduced-motion` turns travel off.

## 2. Tokens

### Colour

| Token | Value | Role |
| :--- | :--- | :--- |
| `--bg` | `#fdfdfd` | Page background, footer |
| `--surface` | `#ffffff` | Cards, marquee strip |
| `--ink` | `#0c0a09` | Text, dark buttons |
| `--muted` | `#6d6b66` | Secondary text (5.2:1) |
| `--muted-2` | `#858585` | Grey second line of big headings (3.7:1, large text only) |
| `--line` | `rgba(12,10,9,0.08)` | 1px borders |
| `--tint` | `#f4f3f1` | Tags, inline code |
| `--accent` | `#ff4700` | Chips, icons, glows, borders, focus ring, script word |
| `--accent-hot` | `#ff5200` | Floating button hover, banner gradient |
| `--accent-soft` | `#ff9a3c` | Light end of the banner gradient |
| `--accent-fill` | `#d63a00` | Filled orange buttons with white text (4.7:1) |
| `--accent-fill-hover` | `#c23400` | Their hover |
| `--accent-text` | `#c93800` | Orange text on light (5.1:1) |
| `--accent-wash` | `#fff1ea` | Light icon tiles, FAQ markers, outline-button hover |
| `--dark` | `#0a0a0a` | Architecture band, quote card |
| `--dark-card` / `--dark-card-2` | `#111111` / `#282828` | Terminal and stat cards / nav over dark |
| `--dark-line` | `rgba(255,255,255,0.1)` | Borders on dark |
| `--on-dark` / `--on-dark-2` | `#ffffff` / `rgba(255,255,255,0.7)` | Text on dark |

**Why two oranges.** White text on the brand orange `#ff4700` is only 3.4:1, below AA for button text. Text-bearing fills use `--accent-fill` (4.7:1); the bright orange stays for everything without text on it. The banner gradient starts deep (`#c23400`) where its text sits and only turns bright on the illustration side.

### Type

| Role | Font | Size | Weight |
| :--- | :--- | :--- | :--- |
| Hero headline | Outfit | `clamp(38px, 2.6vw + 30px, 68px)` / 1.05 | 500 |
| Script word (one per hero) | Caveat, in `--accent` | 1.16em | 600 |
| Section heading | Outfit | `clamp(32px, 4vw, 46px)` | 650 |
| Card title | Outfit | 22–28px (26px on dark cards) | 400–500 |
| Body | Manrope | 16–17px / 1.6 | 400–700 |
| Eyebrow | Manrope | 12px uppercase, 0.16em tracking | 600 |
| Logo wordmark | Unbounded | 16px | 600 |
| Terminal, runtime bar, inline code | JetBrains Mono | 11–14px | 400–600 |

All from Google Fonts with `display=swap`. Headings use `text-wrap: balance`, body text `text-wrap: pretty`.

### Shape, depth and layout

| Token | Value | Used for |
| :--- | :--- | :--- |
| `--r-pill` | `9999px` | Nav, buttons, tags, badges |
| `--r-xl` | `32px` | Promo banner |
| `--r-lg` | `24px` | Cards |
| `--r-md` / `--r-sm` | `16px` / `12px` | FAQ rows, steps / button chips |
| `--shadow-soft` | `0 24px 60px -28px rgba(12,10,9,.22)` | Hovered cards, video card |
| `--page-max` | `1240px` | Container (`.wrap`) |
| `--gutter` | `clamp(16px, 4vw, 40px)` | Side padding |
| `--section-y` | `clamp(56px, 8vw, 110px)` | Section padding |

### Motion

- Easing `--ease: cubic-bezier(0.22, 1, 0.36, 1)`; `--ease-in-out` for slow drifts.
- Hero: eyebrow, the three headline lines (80ms stagger), paragraph and buttons rise 24px and fade in; the laptop tilts in.
- Reveal on scroll: blocks with `data-reveal` fade and rise 24px once (700ms, optional `--d` delay). They are only hidden after `site.js` adds `html.js-reveal`, and any block holding keyboard focus is always shown.
- Loops: hero silk drift, marquee (48s), meteors in the dark band, banner circles, terminal caret, live dots. All pause with `html.motion-paused` (set by the hero pause button); the marquee also pauses on hover and focus.
- Buttons: chip nudges 3px right on hover, the button scales to 0.97 while pressed. Card lifts and chip nudges only run with `(hover: hover) and (pointer: fine)`.
- FAQ answers open with a 220ms height and fade and close in 140ms where `::details-content` is supported.
- Smooth scrolling: Lenis 1.1.20 (`lerp: 0.1`) on the home, download and changelog pages.
- Reduced motion: animations and transitions collapse to 0.01ms, meteors and pings disappear, the marquee becomes a static wrapped list, reveal fades no longer travel.

## 3. Page structure (`index.html`)

1. **Floating nav.** White glass pill 16px from the top: logo, Systems / Games / Services / Store / FAQ, and a black "Download" pill with a white round chip holding an orange arrow. Over the dark band (`data-nav-dark`) it turns into dark glass and the button turns white. The link for the section on screen gets `aria-current`.
2. **Hero.** Silk shapes and faint vertical hairlines behind centred content: eyebrow, three-line headline ending in *zero bloat* in Caveat, one paragraph, Download (primary) + View on GitHub (outline), then the laptop playing the gameplay capture with the fire overlay and the pause button.
3. **Marquee.** The engine's systems plus LuaJIT and Direct3D 12, separated by orange rings.
4. **Architecture** (`#systems`, dark). Heading, paragraph and a "Learn more" pill; a bento grid of the six systems (orange icon tiles), a terminal card running the `oneengine build --server` example from the FAQ, and a live commits card.
5. **Get OneEngine** (`#download`). The orange banner with the Windows download and the live release line, a code-drawn illustration of stacked engine windows, then the Linux/macOS card and the philosophy quote card.
6. **Games** (`#features`). Two-line heading (game name in ink, "Built with OneEngine." in grey), a dark "Open the store" pill, then the Railbound video and info card.
7. **Services** (`#services`). Two white cards with orange icon tiles.
8. **FAQ** (`#faq`). Heading on the left, rounded accordion rows on the right.
9. **Closing call to action.** "Built for developers who actually ship." with the primary Download button.
10. **Footer.** Brand, GitHub icon, Product / Project / Help & contact columns, copyright row.
11. **Floating button.** Orange circle bottom-right that opens GitHub Issues.

## 4. Components

- **Buttons (arrow-chip pattern).** `.btn` plus one of `.btn-primary` (orange fill, white chip), `.btn-outline` (orange border, orange chip), `.btn-dark` (ink fill, white chip), `.btn-light` (white fill, orange chip), `.btn-ghost-dark` (for dark bands). The chip is `.btn-chip` (12px-radius square) or `.btn-chip.round`. `.btn-small` for the nav. Minimum height 46–52px.
- **Bento cards.** Translucent dark glass with a 1px light border and 24px radius; hover lifts 4px and the border glows orange.
- **Live commits card.** `site.js` fetches commits from the last 12 weeks (`/repos/oneenginedev/oneengine/commits?since=…`), counts up the total and sets one bar per week. If GitHub cannot be reached it keeps the dash and says so; it never shows an invented number.
- **Terminal card.** macOS-style window; the commands come from the FAQ.
- **Focus.** `2.5px solid var(--accent)`, 3px offset, on every interactive element.
- **Touch targets.** 44px minimum for buttons, nav links, the logo, video controls and FAQ rows.

## 5. Media

- Videos ship as WebM (VP9) and MP4 (H.264) at 1280px wide, roughly 2 MB each, and pause when off screen. The hero poster is preloaded.
- The banner illustration is inline SVG drawn for this site. There are no stock or reference images.

## 6. Contrast (WCAG 2.2 AA, checked by calculation)

| Pair | Ratio |
| :--- | :--- |
| White on `--accent-fill` | 4.7:1 |
| `--accent-text` on `--bg` | 5.1:1 |
| `--muted` on `--bg` | 5.2:1 |
| `--muted-2` on white (headings only) | 3.7:1 |
| `--on-dark-2` on `--dark` | 9.4:1 |
| `--accent` focus ring on `--bg` / `--dark` | 3.4:1 / 5.8:1 |

## 7. Conventions

1. Define new colours, radii and spacing as tokens first; never hard-code them in components.
2. Don't add figures (benchmarks, sizes, player counts, ratings, prices) unless they are measured and sourced.
3. Don't hand-write versions, file sizes or release dates; `site.js` fills `[data-release-*]` from GitHub.
4. New sections: `<section>` with `aria-labelledby`, an `h2` with an `id`, content inside `.wrap`, and `data-reveal` on blocks that should fade in.
5. Anything that loops gets a selector in the `html.motion-paused` list and a reduced-motion path.
6. Hover effects that move things go inside `@media (hover: hover) and (pointer: fine)`.

## 8. Store (`store/`)

The store is a built single-page app (Vite output with Tailwind classes) without its source in this repo. It still uses the previous violet accent (`#7c5cfa`) on a dark shell and was not restyled. A fixed "Sample data" note sits next to its "OneEngine Site" back pill.

## 9. Known gaps

- The store does not match the new orange accent.
- Only one game (Railbound) has media, so the brief's scrolling projects row is a single showcase instead.
- Contrast was checked by calculation for the token pairs above, not with an automated audit of every element.
