---
name: tp-design-system
description: Foundational TatvaPractice (TP) design system — the theme-able base layer shared across every product surface (home, patient details, rxpad, appointments, Dr. Agent). Covers colour tokens (TP Blue / Violet / Slate / Success / Warning / Error / Amber), AI gradient stops, typography (Mulish heading + Inter body), radii, spacing, shadows, icon libraries, and how to re-theme (change primary colour, font family, etc.) without breaking anything downstream. Load this whenever a task touches `app/globals.css`, `styles/tp-tokens.scss`, `app/layout.tsx`, or any visual primitive. Always co-load when a product-level skill (like `dr-agent-design-system`) is used.
---

# TatvaPractice (TP) Design System — Foundation

This skill is the **theme-able foundation** that everything else sits on top of. Product-specific skills (e.g. `dr-agent-design-system`) should consume tokens from here rather than re-define them.

Repo anchor: `/Users/shyamsundar/Desktop/Dr.Agent-main`. Same token surface applies in `TP_VoiceRx_L` and `TP_Dental_L`.

The foundation is deliberately narrow: **colour + typography + radius + spacing + icon libs**. Everything else (component behaviour, motion, layout) belongs to a product-layer skill.

---

## 1. The two source-of-truth files

1. **`app/globals.css`** — the single place every CSS custom property is defined (`:root` block) and exposed to Tailwind v4 (`@theme inline` block).
2. **`styles/tp-tokens.scss`** — SCSS aliases for `:root` vars so CSS Modules can do `color: tp.$slate-900;`.

If you change a token, change it in **both** files (globals declares it, tp-tokens.scss re-exports it). Never introduce a hex literal in a component file — always reference a token.

---

## 2. Colour palette

All values are defined in `app/globals.css`. Each family is a 50–900 ramp (10 stops) unless noted.

### TP Blue — Primary brand (theme-able)
| Token              | Hex       | Canonical use                                                       |
|--------------------|-----------|----------------------------------------------------------------------|
| `--tp-blue-50`     | `#EEEEFF` | Subtle fill behind primary chip / icon backdrops                     |
| `--tp-blue-100`    | `#D8D8FA` | Hover fill, soft tag background                                      |
| `--tp-blue-200`    | `#B5B4F2` | Soft border, disabled primary                                        |
| `--tp-blue-300`    | `#8E8DE8` | Secondary emphasis                                                   |
| `--tp-blue-400`    | `#6C6BDE` | Pedia specialty accent                                               |
| **`--tp-blue-500`**| **`#4B4AD5`** | **Primary — CTAs, focus rings, active states, icon colour**       |
| `--tp-blue-600`    | `#3C3BB5` | Primary hover / pressed                                              |
| `--tp-blue-700`    | `#2E2D96` | Text on pale backgrounds when 500 is too light                       |
| `--tp-blue-800`    | `#212077` | High-contrast heading                                                |
| `--tp-blue-900`    | `#161558` | Exported as `--core-primary-900`                                     |

### TP Violet — Secondary / informative
| Token              | Hex       | Use                                                                  |
|--------------------|-----------|----------------------------------------------------------------------|
| `--tp-violet-50`   | `#FAF5FE` | Obstetric specialty backdrop                                         |
| `--tp-violet-100`  | `#EDDFF7` | Soft tag background                                                  |
| `--tp-violet-200`  | `#DBBFEF` | Narrative quotation left-border                                      |
| `--tp-violet-300`  | `#C89FE7` | Informative dividers                                                 |
| `--tp-violet-400`  | `#BA7DE9` | Source-icon idle                                                     |
| **`--tp-violet-500`** | **`#A461D8`** | **Secondary — informative only, never a CTA**                    |
| `--tp-violet-600`  | `#8A4DBB` | Source-icon hover                                                    |
| `--tp-violet-700`  | `#703A9E` | —                                                                    |
| `--tp-violet-800`  | `#572A81` | —                                                                    |
| `--tp-violet-900`  | `#3E1C64` | —                                                                    |

> **Hard rule:** violet is informative. Primary state = blue. Active/selected nav, focus rings, confirm CTAs, filled buttons — all blue. Breaking this requires explicit sign-off.

### TP Slate — Neutrals
| Token              | Hex       | Use                                                                  |
|--------------------|-----------|----------------------------------------------------------------------|
| `--tp-slate-0`     | `#FFFFFF` | Surfaces (cards, popovers, inputs)                                   |
| `--tp-slate-50`    | `#FAFAFB` | Hair-line dividers, subtle fill                                      |
| **`--tp-slate-100`** | **`#F1F1F5`** | **Page background** (also `--background`)                         |
| `--tp-slate-200`   | `#E2E2EA` | Default border (`--border`, `--input`)                               |
| `--tp-slate-300`   | `#D0D5DD` | Muted border, disabled                                               |
| `--tp-slate-400`   | `#A2A2A8` | Muted text, icon idle                                                |
| `--tp-slate-500`   | `#717179` | Secondary body (`--muted-foreground`)                                |
| `--tp-slate-600`   | `#545460` | Tertiary heading                                                     |
| `--tp-slate-700`   | `#454551` | Body copy                                                            |
| `--tp-slate-800`   | `#2C2C35` | Emphasised body                                                      |
| **`--tp-slate-900`** | **`#171725`** | **Primary foreground** (also `--foreground`)                      |

### TP Success — Green (full 50–900 ramp)
`#ECFDF5 #D1FAE5 #A7F3D0 #6EE7B7 #34D399 #10B981 #059669 #047857 #065F46 #064E3B`

### TP Warning — Amber (full 50–900 ramp)
`#FFFBEB #FEF3C7 #FDE68A #FCD34D #FBBF24 #F59E0B #D97706 #B45309 #92400E #78350F`

### TP Error — Crimson (full 50–900 ramp)
`#FFF1F2 #FFE4E6 #FECDD3 #FDA4AF #FB7185 #E11D48 #C8102E #9F1239 #881337 #4C0519`
- `--destructive` = `#C8102E` = `--tp-error-600`.

### TP Amber (tertiary — minimised)
Full 50–900 ramp exists for legacy; avoid in new UI. Prefer TP Warning for alert tone and TP Blue-500 for interactive accents.

### Semantic aliases (shadcn-style)
These map to the palette above and are what Tailwind / shadcn components consume. Changing one of these is the primary way to re-theme without touching every component.
```
--background           #F1F1F5   (= tp-slate-100)
--foreground           #171725   (= tp-slate-900)
--card                 #FFFFFF
--card-foreground      #171725
--popover              #FFFFFF
--popover-foreground   #171725
--primary              #4B4AD5   (= tp-blue-500)
--primary-foreground   #FFFFFF
--secondary            #A461D8   (= tp-violet-500)
--secondary-foreground #FFFFFF
--muted                #F1F1F5
--muted-foreground     #717179
--accent               #A461D8
--accent-foreground    #FFFFFF
--destructive          #C8102E
--destructive-foreground #FFFFFF
--border               #E2E2EA
--input                #E2E2EA
--ring                 #4B4AD5
--chart-1              #4B4AD5
--chart-2              #A461D8
--chart-3              #D565EA
--chart-4              #673AAC
--chart-5              #F5B832
--radius               0.75rem  (12px)
```

### AI gradient stops (brand-locked — do not invent new stops)
```
--ai-pink    #D565EA
--ai-violet  #673AAC
--ai-indigo  #1A1994
```

The canonical 3-stop AI gradient is:
```
linear-gradient(91deg, #D565EA 3.04%, #673AAC 66.74%, #1A1994 130.45%)
```
Named constants live in `components/tp-rxpad/dr-agent/constants.ts` (`AI_GRADIENT`, `AI_GRADIENT_SOFT`, `AI_GRADIENT_BORDER`, `AI_GRADIENT_SOFT_ANIMATED`, `AI_PILL_BG`, `AI_PILL_BG_HOVER`, `AI_PILL_BORDER`, `AI_PILL_TEXT_GRADIENT`).

The AI gradient is **locked** and does not re-theme with the primary colour. White-labelling TP keeps the AI gradient intact — it is the brand signature of the agent.

### Icon-clickable surface tokens
```
--tp-icon-clickable-light-bg        rgba(75,74,213,0.10)
--tp-icon-clickable-light-bg-hover  rgba(75,74,213,0.15)
--tp-icon-clickable-dark-bg         rgba(255,255,255,0.25)
--tp-icon-clickable-dark-bg-hover   rgba(255,255,255,0.28)
```
Use these for tappable icon affordances (header buttons, collapse toggles). If the primary colour is re-themed, **these two rgba values must be updated in lock-step** (they encode `tp-blue-500` @ 10% / 15%).

---

## 3. Typography

Configured in `app/layout.tsx` via `next/font/google`.

| Role   | Font   | Google variable         | Weights declared       |
|--------|--------|-------------------------|------------------------|
| Body   | Inter  | `--font-sans`           | default subset         |
| Heading| Mulish | `--font-heading`        | 400, 500, 600, 700, 800|
| Mono   | system | `--font-mono` (@theme)  | ui-monospace stack      |

`<body>` is `font-sans antialiased` — Inter by default, Mulish opt-in via `font-[family-name:var(--font-heading)]` or `var(--font-heading)` in a module.

### Size scale (px — no responsive scaling)
These are the *only* sizes the product uses. Anything else is a bug.

| Size  | Usage                                                                   |
|-------|-------------------------------------------------------------------------|
| 28px  | Page title (heading sections inside a shell)                            |
| 24px  | Banner title (`AppointmentBanner`)                                      |
| 18px  | Welcome greeting, section H2                                            |
| 16px  | Card title, modal H3, AgentHeader tag, form label                       |
| 14px  | Body copy, table cell, CTA label, SectionTag                            |
| 13px  | Card title fallback when long                                           |
| 12px  | Tags, badges, table headers, section sub-labels                         |
| 11px  | Card date, chart axis labels                                            |
| 10px  | Absolute minimum — chart ticks only                                     |

### Weight scale
`400` body · `500` emphasis · `600` heads and CTAs · `700` only for the banner title. No `800`+ outside hero typography.

### Casing
- Sentence case for headings, tags, badges, CTAs.
- No `text-transform: uppercase` on tags. (Legacy `TPClinicalTable` header uses uppercase — that is the one exception; do not extend it.)
- No ALL-CAPS in chat, empty states, or cards.

---

## 4. Radius scale

Defined in `globals.css` (`@theme inline`):
```
--radius-sm   calc(var(--radius) - 4px)  // 8px
--radius-md   calc(var(--radius) - 2px)  // 10px
--radius-lg   var(--radius)              // 12px
--radius-xl   calc(var(--radius) + 4px)  // 16px
```
Plus arbitrary values used in practice:
- `14px` — CardShell outer, user chat bubble, canned cards.
- `16px` — Banner bottom corners only.
- `6px` — Small badges, collapse toggle.
- `4px` — Keyboard-shortcut chip, tooltip.

Prefer Tailwind `rounded-md` / `rounded-lg` / `rounded-xl` for semantic radii; use `rounded-[14px]` only when the value is design-locked (CardShell, bubble).

---

## 5. Spacing

Tailwind's default 4px scale (`p-1`=4, `p-2`=8, `p-3`=12, `p-4`=16, etc.) — no custom spacing tokens.

Component-level spacing is fixed px (`py-[11px]` on CardShell header, `py-[10px]` on body, etc.) — documented in the product-layer skills, not here.

---

## 6. Shadows

No custom shadow tokens. Shadows are inline and intentionally subtle:
- Liquid-glass outer: `0 2px 8px rgba(23, 23, 37, 0.06)`
- Card hover (rare): `0 1px 2px rgba(75, 74, 213, 0.2)` (primary-tinted)
- Tooltip: `0 4px 16px rgba(0, 0, 0, 0.08)`

**User chat bubbles carry no shadow.** Table rows carry no shadow.

---

## 7. Icon libraries (in preference order)

1. **`iconsax-reactjs`** — primary product-wide. `variant="Bulk"` for emphasised affordances, `variant="Linear"` for secondary.
2. **`lucide-react`** — fallback when iconsax lacks a close match.
3. **`TPMedicalIcon`** (`@/components/tp-ui`) — clinical vocabulary (vitals, labs, gynec, obstetric, pediatric, injection, medical-record). Variants `bulk` / `linear`, size 15–22, colour comes from a token prop.
4. Project-local SVGs under `public/icons/` (e.g. `dr-agent/chat-bg.gif`, Bulk mic).

Default sizes: 14 (inline), 18 (secondary control), 22 (primary control / spark), 26 (card header icon), 36 (welcome spark).

---

## 8. Chart palette

The five-stop chart ramp matches the brand:
```
--chart-1  #4B4AD5   (tp-blue-500)
--chart-2  #A461D8   (tp-violet-500)
--chart-3  #D565EA   (ai-pink)
--chart-4  #673AAC   (ai-violet)
--chart-5  #F5B832   (tp-amber-500)
```
When you need more than five series, re-use the first two tones and vary opacity — **do not invent a 6th colour**.

---

## 9. Scrollbars + motion baseline

- Scrollbars are **globally hidden** (`scrollbar-width: none`; `::-webkit-scrollbar { display: none }`). Do not re-enable them in a component.
- Touch devices get `.touch-show { opacity: 0.6 !important; }` so hover-reveal icons stay visible.
- Any new animation must wrap in `@media (prefers-reduced-motion: reduce) { animation: none; }`.
- Global keyframe available: `@keyframes aiShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }` — use for AI gradient sweeps on text / borders.

---

## 10. Provider stack

`app/layout.tsx`:
```
<TPThemeProvider>
  {children}
  <Analytics />
</TPThemeProvider>
```
`TPThemeProvider` (at `components/tp-theme-provider.tsx`) wires the dark-mode class toggle. The product is **light-mode-first**; dark mode exists as a variant (`.dark *`) but is not actively styled outside shadcn defaults. Do not author dark-mode-only components.

---

## 11. White-labelling: how to re-theme TP

The foundation was designed so that **changing a handful of values in `app/globals.css`** rethemes every downstream product (including Dr. Agent) without touching components.

### Re-theme checklist (do these in order)

1. **Primary brand colour** — change `--tp-blue-50` through `--tp-blue-900` to the new ramp. Keep 10 stops; keep 500 as the mid-tone CTA colour.
2. **Update `--primary` and `--ring`** — both alias `--tp-blue-500`. Point them at the new 500.
3. **Update the icon-clickable tokens** — `--tp-icon-clickable-light-bg` and `--tp-icon-clickable-light-bg-hover` are the new primary @ 10% / 15%; rewrite their rgba values.
4. **Chart-1** — `--chart-1` mirrors primary; update.
5. **Secondary (violet)** — only update if the product intentionally re-skins the informative surface. Most re-themes leave violet alone.
6. **AI gradient stops** — **do not change.** `--ai-pink`, `--ai-violet`, `--ai-indigo` are Dr. Agent's brand signature and are locked. The animated wash, pills, and spark halo all inherit from these; if the white-label demands a different AI palette, that is a separate, scoped change.
7. **Font family** — swap the `next/font/google` imports in `app/layout.tsx`. Keep two slots: heading (`--font-heading`) and body (`--font-sans`). Weights stay `400 500 600 700 (800)`.
8. **Radius** — `--radius` is the single knob (12px default). Smaller `--radius` cascades through `--radius-sm/md/lg/xl`.
9. **`styles/tp-tokens.scss`** — if you added a new token, re-export it here so SCSS modules can consume it.

Do **not** change in a re-theme:
- Slate ramp (it's a neutral — reworking slate = a rewrite, not a theme).
- Semantic status ramps (success / warning / error). Products depend on these colour associations.
- AI gradient stops.
- Typography *scale* (px values). Only the *family* changes.

### Safe re-theme smoke test

After a re-theme, verify these five screens render without hard-coded hex bleed-through:
1. `/` (home appointments)
2. `/Rxpad`
3. `/patient-details`
4. `/dr-agent-design-system`
5. The Dr. Agent panel in any of the above.

---

## 12. Where products sit on top

Every product-layer surface consumes these tokens. Their product skills document their *own* component behaviour + motion but **must not redefine colour or typography**. Known surfaces:

- `app/Rxpad/` + `components/tp-rxpad/**` — Rx prescription pad.
- `app/tp-appointment-screen/` + `components/appointments/**` — home/appointments.
- `app/patient-details/` + `components/patient-details/**` — clinical patient detail.
- `app/tp-follow-ups/` — follow-up flows.
- `app/dr-agent-design-system/` + `components/dr-agent-design-system/**` — the browsable reference.
- **Dr. Agent panel** (`components/tp-rxpad/dr-agent/**`) — see the `dr-agent-design-system` skill.

---

## 13. Quick sanity checklist

Before committing any change that touches styling:
- [ ] No fresh hex literal in a component file. Use a CSS variable or Tailwind `tp-*` class.
- [ ] Primary state uses `tp-blue`, not violet.
- [ ] Text size comes from the 28 / 24 / 18 / 16 / 14 / 13 / 12 / 11 / 10 set.
- [ ] Radius comes from `--radius-*` or a design-locked value (14, 6, 4).
- [ ] Font family uses `--font-sans` (Inter) or `--font-heading` (Mulish).
- [ ] Scrollbars stay hidden.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] Casing is sentence case.
- [ ] Icons from iconsax / lucide / TPMedicalIcon — no inline emoji, no random SVG.
- [ ] If a token was added, both `globals.css` and `tp-tokens.scss` were updated.

---

## Source-of-truth pointers

- `app/globals.css` — every CSS variable + `@theme inline` exposure to Tailwind v4.
- `styles/tp-tokens.scss` — SCSS aliases for CSS modules.
- `app/layout.tsx` — font wiring + TPThemeProvider.
- `components/tp-theme-provider.tsx` — dark-mode class toggle.
- `tailwind.config.*` — not present in this repo; Tailwind v4 reads `@theme inline` from `globals.css` directly.
- `postcss.config.mjs` — PostCSS / Tailwind build config.
- `components/dr-agent-design-system/sections/DesignTokensSection.tsx` — the live browsable token reference.
- `components/tp-ui/**` — TP primitives (buttons, tables, clinical icons) that consume these tokens.
