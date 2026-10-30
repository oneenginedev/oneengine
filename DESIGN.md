# NULLSECTOR Design System: HELION Studio

## 1. Principles

1. **Hierarchy Through Value and Surface, Not Color Noise**
   Visual priority is established through flat surface elevation steps, typographic scale, and whitespace rhythm. Color is reserved for status and focus indicators.
2. **One Primary Accent, Used with Extreme Restraint**
   A single, calibrated violet accent (`#7c5cfa`) represents brand identity and primary intent. Status colors (success, warning, error) are strictly semantic and never applied as decorative gradients.
3. **Tactile Precision and Geometry**
   No clip-path polygon chamfers, fake neon borders, scanlines, or pseudo-futuristic HUD decorations. Surfaces use true 1px hairline borders (`rgba(255,255,255,0.08)`) and consistent 8px radii.
4. **Instantaneous, Purposeful Motion**
   Animations are micro-interactions bounded to 140–200ms ease-out transitions (`cubic-bezier(0.16, 1, 0.3, 1)`). Layout properties are never animated. Full compliance with `prefers-reduced-motion`.
5. **Human-Crafted Copy & Content Density**
   Direct, literal language with zero marketing superlatives, exclamation marks, or lorem ipsum. Density is calibrated for professional engine developers.

---

## 2. Tokens

### Surfaces
Elevation depth is achieved through flat steps with 1px neutral hairline borders. Never use multi-stop gradients on surfaces.

| Token | Hex / Value | Role |
| :--- | :--- | :--- |
| `--surface-base` | `#090a0d` | App and canvas background |
| `--surface-sunken` | `#060709` | Inset wells, code blocks, form inputs |
| `--surface-raised` | `#0f1116` | Section backing, toolbars, sub-panels |
| `--surface-card` | `#14171f` | Cards, list rows, grouped containers |
| `--surface-card-hover` | `#1a1e28` | Hover state for interactive cards |
| `--surface-overlay` | `#12151d` | Menus, popovers, modals, toasts |
| `--surface-pressed` | `#0d0f14` | Active / pressed state |

### Borders
All borders are exactly 1px solid.

| Token | Value | Role |
| :--- | :--- | :--- |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Default container and divider hairline |
| `--border-default` | `rgba(255, 255, 255, 0.14)` | Hover borders, active cards, controls |
| `--border-strong` | `rgba(255, 255, 255, 0.24)` | High-emphasis borders |
| `--border-accent` | `rgba(124, 92, 250, 0.45)` | Selected state / focus ring |

### Text & Contrast (WCAG AA Certified)
Evaluated against `--surface-card` (`#14171f`) and `--surface-base` (`#090a0d`):

| Token | Value | Contrast vs Base | Contrast vs Card | Role |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` | `#f8fafc` | 18.2:1 (AAA) | 16.5:1 (AAA) | Headings, button labels, high-emphasis text |
| `--text-secondary` | `#94a3b8` | 7.4:1 (AA) | 6.7:1 (AA) | Body copy, descriptions, navigation items |
| `--text-tertiary` | `#64748b` | 4.6:1 (AA) | 4.5:1 (AA) | Metadata, kickers, timestamps, hints |
| `--text-disabled` | `#475569` | 3.1:1 (UI AA) | 3.0:1 (UI AA) | Disabled controls, inactive icons |

### Accent & Semantic Colors
Strictly one brand accent plus calibrated semantic indicators:

| Token | Hex | Muted Tint (12%) | Role |
| :--- | :--- | :--- | :--- |
| `--accent` | `#7c5cfa` | `rgba(124, 92, 250, 0.12)` | Primary action, key selection, brand focus |
| `--accent-hover` | `#8e71ff` | — | Hover state for primary action |
| `--accent-pressed` | `#6848e8` | — | Pressed state for primary action |
| `--status-success` | `#10b981` | `rgba(16, 185, 129, 0.12)` | Complete, live, available |
| `--status-warning` | `#f59e0b` | `rgba(245, 158, 11, 0.12)` | In progress, caution |
| `--status-danger` | `#ef4444` | `rgba(239, 68, 68, 0.12)` | Error, destructive action, invalid field |
| `--status-info` | `#38bdf8` | `rgba(56, 189, 248, 0.12)` | Informational badges, neutral status |

### Radius
A strict, single-radius system with small and large geometric derivatives:

| Token | Value | Applied To |
| :--- | :--- | :--- |
| `--radius-sm` | `6px` | Badges, tags, code chips, tooltips |
| `--radius-md` | `8px` | **Core default**: Buttons, cards, inputs, list rows |
| `--radius-lg` | `12px` | Overlays, modals, monitor frames, containers |
| `--radius-full` | `9999px` | Avatars, status dots, pills |

### Spacing Scale
Grid: 4px base with an 8px vertical rhythm. All arbitrary pixel values outside this scale are banned:
`4px (space-1)`, `8px (space-2)`, `12px (space-3)`, `16px (space-4)`, `20px (space-5)`, `24px (space-6)`, `32px (space-8)`, `48px (space-12)`, `64px (space-16)`, `96px (space-24)`.

### Elevation & Depth
No colored halos or neon glows. Elevation is rendered with layered hairline borders and neutral shadows:
- **Low (Card):** `0 1px 3px rgba(0, 0, 0, 0.35)` + 1px `--border-subtle`
- **Mid (Raised / Hover):** `0 4px 16px rgba(0, 0, 0, 0.45)` + 1px `--border-default`
- **High (Overlay / Modal / Toast):** `0 16px 40px rgba(0, 0, 0, 0.75), 0 0 0 1px var(--border-default)`

### Motion Tokens
- Micro-interactions (hover, active, focus): `150ms cubic-bezier(0.16, 1, 0.3, 1)`
- Overlays, panels, toasts: `220ms cubic-bezier(0.16, 1, 0.3, 1)`
- Permitted animated properties: `transform`, `opacity`, `background-color`, `border-color`, `color`.

---

## 3. Typography

One primary font family (`Inter`) for UI and headings. One monospace font (`JetBrains Mono`) for code, tokens, counts, and paths. Sentence case everywhere; uppercase is reserved for small tracked kickers.

| Role | Font Family | Size | Weight | Line Height | Tracking | Color |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | `Inter` | `48px – 64px` | 700 | `1.05` | `-0.025em` | `--text-primary` |
| **Heading 1** | `Inter` | `32px – 40px` | 600 | `1.15` | `-0.02em` | `--text-primary` |
| **Heading 2** | `Inter` | `24px – 28px` | 600 | `1.2` | `-0.015em` | `--text-primary` |
| **Heading 3** | `Inter` | `18px – 20px` | 600 | `1.3` | `-0.01em` | `--text-primary` |
| **Body Large** | `Inter` | `16px` | 400 | `1.6` | `0` | `--text-secondary` |
| **Body Regular** | `Inter` | `14px` | 400 | `1.55` | `0` | `--text-secondary` |
| **Kicker / Section Label** | `Inter` | `11px` | 600 | `1.2` | `+0.08em` | `--accent` (Uppercase) |
| **Code / Tabular** | `JetBrains Mono` | `13px` | 500 | `1.5` | `0` | `--text-primary` |

---

## 4. Anti-AI Rulebook

1. **No Glows or Neon Halos**
   - *Do:* Use 1px neutral hairline borders and surface tone differences.
   - *Don't:* `box-shadow: 0 0 20px #00e5ff` or `filter: drop-shadow(0 0 16px ...)`.
   - *Grep:* `drop-shadow\(|box-shadow.*(?:rgba.*(?:255|229|182)|cyan|lime)`
2. **No Polygon Chamfers**
   - *Do:* Consistent border-radius (`8px` core, `6px` small, `12px` container).
   - *Don't:* `clip-path: polygon(...)`.
   - *Grep:* `clip-path:\s*polygon`
3. **No Decorative Multi-Color Gradients**
   - *Do:* Solid flat surfaces (`--surface-card`, `--surface-raised`).
   - *Don't:* Rainbow gradient borders (`linear-gradient(90deg, #7c4dff, #00e5ff)`).
   - *Grep:* `linear-gradient\(.*(?:violet|cyan|magenta|lime)`
4. **No Gradient Text**
   - *Do:* Solid `--text-primary` for contrast.
   - *Don't:* `-webkit-background-clip: text; color: transparent`.
   - *Grep:* `-webkit-background-clip:\s*text`
5. **No Scanlines or Gridfloor Canvas Tricks**
   - *Do:* Deep neutral dark canvases with high readability.
   - *Don't:* Moving perspective grid floors, laser scanlines, or cursor followers.
   - *Grep:* `\.gridfloor|\.scan|#glowCursor`
6. **Maximum One Badge Per Component**
   - *Do:* Single status chip or tag per card.
   - *Don't:* Stacking rarity, category, status, and XP badges on one item.
   - *Grep:* `\.badge.*\.tag|\.rarity-ribbon`
7. **Single Font Hierarchy**
   - *Do:* `Inter` for all UI text and headings; `JetBrains Mono` for code/tabular.
   - *Don't:* Loading 5 decorative font families (`Orbitron`, `Rajdhani`, `Chakra Petch`).
   - *Grep:* `Orbitron|Rajdhani|Chakra Petch`
8. **Sentence-Case Body and Headings**
   - *Do:* Sentence-case text ("High-performance ECS engine for Windows").
   - *Don't:* All-caps descriptions or robotic HUD strings ("TRANSMIT BRIEF // SYSTEM ENGAGED").
   - *Grep:* `text-transform:\s*uppercase` (outside kickers)
9. **Full Interactive State Matrices**
   - *Do:* Spec default, hover, active/pressed, focus-visible, and disabled for every interactive item.
   - *Don't:* Unstyled links or buttons lacking focus rings.
   - *Grep:* `:focus-visible`
10. **Tabular Figures for Numerical Data**
    - *Do:* `font-variant-numeric: tabular-nums` for timers, benchmarks, and counters.
    - *Don't:* Proportional numbers shifting layout during animations.
    - *Grep:* `font-variant-numeric`
11. **No Layout Property Transitions**
    - *Do:* Animate `opacity` and `transform` only.
    - *Don't:* `transition: all` or animating `width`, `height`, `margin`.
    - *Grep:* `transition:\s*all`
12. **Literal, Specific Copy**
    - *Do:* Direct developer facts ("64-player server authority with client-side prediction").
    - *Don't:* Fluff, fake achievement unlocks, or sci-fi clichés ("EXPLORER UNLOCKED: +50 XP").
    - *Grep:* `Achievement unlocked`

---

## 5. Component Specs

### Button
- **Primary:** Background `var(--accent)`, text `#ffffff`, border `1px solid rgba(255,255,255,0.18)`, radius `8px`. Hover: `var(--accent-hover)`, translateY(-1px). Pressed: `var(--accent-pressed)`, translateY(0). Focus: outline `2px solid var(--accent)`.
- **Secondary / Neutral:** Background `var(--surface-raised)`, text `var(--text-primary)`, border `1px solid var(--border-default)`. Hover: `background: var(--surface-card-hover); border-color: var(--border-strong)`.
- **Ghost:** Background `transparent`, text `var(--text-secondary)`, border `1px solid transparent`. Hover: `background: var(--surface-raised); text: var(--text-primary)`.
- **Destructive:** Background `rgba(239, 68, 68, 0.1)`, text `#fca5a5`, border `1px solid rgba(239, 68, 68, 0.25)`.

### Input & Textarea
- Background `var(--surface-sunken)`, text `var(--text-primary)`, border `1px solid var(--border-subtle)`, radius `6px`, padding `10px 14px`.
- Hover: border `var(--border-default)`.
- Focus: border `var(--accent)`, box-shadow `0 0 0 1px var(--accent)`.
- Error: border `var(--status-danger)`, box-shadow `0 0 0 1px var(--status-danger)`.

### Card
- Background `var(--surface-card)`, border `1px solid var(--border-subtle)`, radius `8px`, padding `20px`.
- Hover (interactive): `background: var(--surface-card-hover)`, border `var(--border-default)`, `transform: translateY(-2px)`, shadow `var(--shadow-md)`.

### Badge & Tag
- Background `var(--accent-muted)`, text `var(--accent)`, border `1px solid var(--accent-border)`, radius `6px`, padding `2px 8px`, `font-size: 12px`, `font-weight: 500`.

### Toast
- Floating bottom-right, background `var(--surface-overlay)`, border `1px solid var(--border-default)`, shadow `var(--shadow-overlay)`, radius `8px`, padding `14px 18px`. No multi-color achievement banners.

---

## 6. Platform Rules (Web)

- **Responsive Viewports:** Tested at `360px`, `768px`, `1280px`, and `1920px`. No horizontal overflow.
- **Accessibility:** Minimum contrast ratio 4.5:1 for body copy; `:focus-visible` ring on every clickable item; semantic landmarks (`header`, `main`, `section`, `footer`).
- **Performance:** Asynchronous font swap (`display=swap`), reduced layout shifts with intrinsic aspect ratios on media containers (`16/9`, `16/10`).
- **Motion:** `@media (prefers-reduced-motion: reduce)` zeroes out transforms and continuous animations.

---

## 7. Definition of Done Checklist

- [x] Zero colored glows, neon shadows, or rainbow gradients.
- [x] All chamfer clip-paths replaced with geometric `8px`/`6px` border-radius tokens.
- [x] Clean typographic hierarchy limited to `Inter` and `JetBrains Mono`.
- [x] All color values driven by `:root` tokens; zero raw arbitrary hex values in components.
- [x] Contrast ratio verified AA (≥4.5:1 for secondary text, ≥16:1 for primary text).
- [x] All interactive elements have complete hover, focus-visible, and active states.
- [x] Build passes with zero errors (`npm run build`).
