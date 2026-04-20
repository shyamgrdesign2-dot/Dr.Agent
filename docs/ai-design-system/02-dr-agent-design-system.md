---
name: dr-agent-design-system
description: Design-system reference for the Dr. Agent chat panel — the white-label agent UI that drops into any TP-based product (home, rxpad, patient-details) or a third-party EMR. Documents panel anatomy, glass header, animated wash, chat bubbles, input, typing indicator, pills, welcome screen, and card shell — all as a *product layer on top of the TP foundation*. Load alongside `tp-design-system` (foundation tokens) whenever a task touches `components/tp-rxpad/dr-agent/**`. Always co-load `dr-agent-ui-card` when creating a new card.
---

# Dr. Agent — Design System (product layer)

Dr. Agent is a **white-label unit**. It is authored to drop into:
- TatvaPractice surfaces (home, rxpad, patient-details) — consumes TP tokens.
- Any third-party EMR — by pointing it at that EMR's equivalent foundation tokens (see §13).

All **colour and typography come from the foundation layer** (`tp-design-system` skill). This skill documents only what is *unique* to the agent: panel layout, glass, wash, chat primitives, motion, and the card chrome.

Repo anchor: `/Users/shyamsundar/Desktop/Dr.Agent-main`. All agent source lives under `components/tp-rxpad/dr-agent/`.

---

## 1. Hard rules (memorise these)

Constraints the user has re-stated across dozens of polish passes. Violating any of them needs explicit sign-off.

1. **Primary colour is the foundation's primary (default `tp-blue-500 #4B4AD5`).** Active CTAs, focus rings, card header icon bg, selected nav, source-dropdown active — all primary. **Never violet for primary.**
2. **Violet is informative only** (narrative quotation border, source info icon, specialty tag on obstetric).
3. **User chat bubble** = `rgba(255, 255, 255, 0.94)` + `backdrop-filter: blur(14px) saturate(1.4)`, text `tp-slate-800`. **No border. No shadow.**
4. **AI chat bubble** = bare 22px `AiBrandSparkIcon` on the leading edge. **No container / gradient backdrop behind the icon.** Smart alignment: `items-center` single-line, `items-start` multi-line (measured via `ResizeObserver`).
5. **Background wash is always rendered**, not gated on message count. Opacity ≤ 0.07, blur 90px, 22s conic rotation. Respects `prefers-reduced-motion`.
6. **Page background outside the panel** is `bg-tp-slate-100` (foundation `--background`). The panel is white with the wash layered behind.
7. **AI gradient stops are brand-locked** (pink → violet → indigo, from the foundation). Re-themes do not touch them — see §13.
8. **Sentence case everywhere.** No ALL-CAPS. No emoji. Icons only.
9. **Minimum text size 10px** (chart ticks). Everything else from the TP scale.

---

## 2. What comes from the foundation (do not redefine here)

All of the following is documented in the `tp-design-system` skill and consumed by the agent:

- Colour tokens: `--tp-blue-*`, `--tp-violet-*`, `--tp-slate-*`, `--tp-success-*`, `--tp-warning-*`, `--tp-error-*`.
- Semantic aliases: `--primary`, `--foreground`, `--background`, `--ring`, `--border`.
- AI gradient stops: `--ai-pink`, `--ai-violet`, `--ai-indigo` + the named constants in `components/tp-rxpad/dr-agent/constants.ts`.
- Fonts: `--font-sans` (Inter), `--font-heading` (Mulish).
- Radius scale, shadow recipes, icon libraries, chart palette, scrollbar reset, `prefers-reduced-motion` baseline.

If the agent needs a new colour or text size, **add it to the foundation first**, then consume it here.

---

## 3. Panel anatomy

File: `components/tp-rxpad/dr-agent/DrAgentPanel.tsx`.

Three-layer absolute stack inside one `relative flex h-full flex-col overflow-hidden bg-white` root:

```
z-0   .da-gradient-wash       (absolute inset-0, pointer-events-none, aria-hidden)
z-10  chat area                (relative flex flex-1 flex-col overflow-hidden, pt-[52px])
z-30  floating glass header    (absolute inset-x-0 top-0)
```

- The chat area is the **only** thing that scrolls. The panel itself never scrolls.
- `pt-[52px]` clears the floating header — never remove it.
- Footer (`ChatInput` area) inside the chat area: `sticky bottom-0 z-10 bg-white` with a 24px white-fade gradient above it so scrolled messages fade instead of hard-clip.

---

## 4. Background wash (signature motion)

Defined inline in `DrAgentPanel.tsx` `<style jsx>`:

```css
@property --da-wash-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.da-gradient-wash {
  opacity: 0.07;
  background: conic-gradient(
    from var(--da-wash-angle) at 50% 50%,
    #E38BBE 0deg, #B06CE0 55deg, #8B5CF6 115deg,
    #6B5FE0 180deg, #4B4AD5 235deg, #4FACFE 295deg, #E38BBE 360deg
  );
  filter: blur(90px);
  animation: daWashRotate 22s linear infinite;
}
@keyframes daWashRotate { to { --da-wash-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) {
  .da-gradient-wash { animation: none; }
}
```

Rules:
- Always rendered, never gated on `messages.length`.
- Opacity ceiling 0.07. Blur ceiling 90px. Reducing either produces banding.
- `pointer-events-none`, `aria-hidden`, z-0.
- The seven stops are the AI palette extended with the primary (`#4B4AD5`). If the primary is re-themed, update the 5th stop to match — everything else stays.

---

## 5. Liquid-glass header

File: `components/tp-rxpad/dr-agent/shell/AgentHeader.tsx`.

Two floating tags at 32px tall, 10px radius, both share the glass formula.

- Left: `.da-agent-brand-tag` — `AiBrandSparkIcon` + "Dr. Agent" label (16/600).
- Right: `.da-agent-collapse-tag` — collapse / end-session icon.

Glass formula:
```
backdrop-filter: blur(12px);
background: rgba(255, 255, 255, 0.6);                 /* fallback */
background-image: <subtle AI gradient wash at ~3%>;
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.5),             /* top highlight */
  0 2px 8px rgba(23, 23, 37, 0.06);                   /* outer drop */
```

There is a hidden-behind-`{false && …}` dropdown JSX kept for future specialty switching. Do not delete it.

---

## 6. Chat bubble

File: `components/tp-rxpad/dr-agent/chat/ChatBubble.tsx`.

### AI bubble
- Row: `<AiBrandSparkIcon size={22} />` + content column.
- Content offset `ml-[30px]` when wrapping under icon, bubble width `w-[calc(100%-30px)]`.
- Vertical alignment:
  - Single-line reply → `items-center`.
  - Multi-line / card → `items-start` (pinned to first line).
- Detection: `ResizeObserver` + `useLayoutEffect` comparing line-count against line-height.
- **No background wrapper on AI content.** Cards render via `CardRenderer` and are self-contained.

### User bubble
- Right-aligned, bubble max-width ~85%.
- `background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(14px) saturate(1.4); color: var(--tp-slate-800);`
- `border-radius: 14px; padding: 12px 14px;`
- **No `border`. No `box-shadow`.**

### Data-completeness donut
Renders inside the bubble **only** for these four kinds (donut = "expected data present / missing"; meaningless for open-ended responses):
- `pomr_problem_card`
- `ocr_extraction`
- `ocr_pathology`
- `sbar_critical`

### Source / feedback row
Small utility row beneath the card:
- Source dropdown active = `bg-tp-blue-50 text-tp-blue-600` (not violet).
- Thumbs up/down + copy: 14px icons, slate-400 idle → `tp-blue-500` hover.

---

## 7. Chat input

File: `components/tp-rxpad/dr-agent/chat/ChatInput.tsx`.

- Surface: white pill, 12px radius, `border: 1px solid var(--tp-slate-200)`.
- Focus state: `border-color: var(--tp-blue-500); box-shadow: 0 0 0 3px rgba(75, 74, 213, 0.14);` (always primary, never violet).
- Animated border on prefill: sweeps `AI_GRADIENT_BORDER` over 1.6s.
- Layout, left→right: `+` add-action · `PatientChip` · **neutral Bulk mic** · text field · send.
- Mic button: 28px circle, `bg-tp-slate-100`. Mic SVG manually scaled via `<g transform="translate(12 12) scale(0.67) translate(-12 -12)">…</g>`.
- **No divider** between the `+` and the mic.
- Send: circular, `AI_GRADIENT` background when text present, `bg-tp-slate-100` when empty.
- `PatientChip` locks (non-interactive, label shows focus message) when panel mode is `rxpad` or `visit`. Clickable in `homepage` mode.

---

## 8. Typing indicator

File: `components/tp-rxpad/dr-agent/chat/TypingIndicator.tsx`.

- Spark: 22px, Y-axis rotation 0→720° over 2.2s, `cubic-bezier(0.6, 0, 0.4, 1)`. Scale pulses 0.85 → 1.15.
- Halo: 26×26 `AI_GRADIENT_SOFT` radial. Opacity 0.55 → 1, scale 0.85 → 1.15, synchronised with the flip.
- Thinking carousel: 2-3 themed follow-ups that rotate every ~900ms. 260ms slide-in (`cubic-bezier(0.22, 1, 0.36, 1)`), 260ms slide-out (`cubic-bezier(0.55, 0, 1, 0.45)`).
- Ellipsis: 3 dots, 1.4s fade cycle, staggered delays.
- Alignment: `items-center`.

---

## 9. Pills (PillBar)

File: `components/tp-rxpad/dr-agent/chat/PillBar.tsx`.

- Horizontal scroll, `gap-6px`, softly masked edges.
- Each pill: 26px tall, `rounded-full`, `px-[14px]`, `AI_PILL_BG` → `AI_PILL_BG_HOVER` on hover, `AI_PILL_BORDER` outline.
- Text: `AI_PILL_TEXT_GRADIENT` via `WebkitBackgroundClip: "text"`.
- 3s cooldown after tap (prevents double-send).
- Never shimmer. The old `animate-pulse` on "forced" pills was removed — do not reintroduce it.

---

## 10. Welcome screen

File: `components/tp-rxpad/dr-agent/chat/WelcomeScreen.tsx`.

- Rotating 36px `AiBrandSparkIcon` with `/icons/dr-agent/chat-bg.gif` overlay at 30% opacity.
- Greeting: 18px `tp-slate-900`.
- Subtitle pattern (single line, whitespace-nowrap): `"Ask anything about {X} today"`.
  - `homepage` → "your clinic"
  - `rxpad` → patient first name
  - `patient_detail` → patient first name
  - `billing` → "billing"
- Up to 4 canned cards below. Locked styling:
  ```
  borderRadius: 14
  padding: "14px 12px 16px"
  background: "rgba(255, 255, 255, 0.55)"
  border: "1px solid rgba(255, 255, 255, 0.75)"
  ```
  Child `<div>` overlay at 6% gif opacity. **Do not** tint the border with the AI gradient (user has explicitly rejected this).

---

## 11. Motion inventory

All motion is vanilla CSS keyframes (no `framer-motion` inside the panel).

| Animation        | Spec                                                          | Source                   |
|------------------|---------------------------------------------------------------|--------------------------|
| Wash rotate      | 22s linear infinite, `--da-wash-angle` 0→360°                 | `DrAgentPanel.tsx`       |
| Spark coin-flip  | 2.2s `cubic-bezier(0.6,0,0.4,1)`, rotateY 0→720 + scale pulse | `TypingIndicator.tsx`    |
| Halo pulse       | Synced with spark, opacity 0.55→1 + scale 0.85→1.15           | `TypingIndicator.tsx`    |
| Thinking line    | 900ms hold, 260ms transition                                  | `TypingIndicator.tsx`    |
| Ellipsis         | 1.4s fade, 3 dots staggered                                   | `TypingIndicator.tsx`    |
| Prefill border   | 1.6s AI gradient sweep                                        | `ChatInput.tsx`          |
| Canned-card flow | `AI_GRADIENT_SOFT_ANIMATED`, slow BG-position shift           | `WelcomeScreen.tsx`      |

Every animation is wrapped in `@media (prefers-reduced-motion: reduce) { animation: none; }`. Any new motion must be too.

---

## 12. Card shell (the chrome around every card)

File: `components/tp-rxpad/dr-agent/cards/CardShell.tsx`. For *how to build a new card* see the `dr-agent-ui-card` skill.

### Outer container
```
w-full overflow-hidden rounded-[14px] bg-white
border: 1px solid transparent
backgroundImage:
  linear-gradient(white, white),
  linear-gradient(180deg,
    rgba(75,74,213,0.18) 0%,
    rgba(75,74,213,0.04) 25%,
    rgba(23,23,37,0.02) 50%,
    rgba(75,74,213,0.04) 75%,
    rgba(75,74,213,0.18) 100%)
backgroundOrigin: border-box
backgroundClip: padding-box, border-box
```
(Primary-tinted gradient border via double-background trick.)

### Header row — `px-3 py-[11px]`
- 26×26 icon container, `rounded-[8px]`, `background: var(--tp-blue-50)`. Icon inside at `var(--tp-blue-500)` via `TPMedicalIcon` (15px) or raw node.
- Title: 13/600, leading 1.4, truncated at 200px.
- Optional 11px `tp-slate-400` date beneath.
- Copy-all: 14px `Copy` iconsax, idle `tp-blue-500` → hover `tp-blue-600` with `Linear`→`Bulk` swap. Wrapped in `ActionableTooltip` when tooltip text given.
- Badge: max-w 100px, 4px radius, `px-[6px] py-[3px]`, 12/600.
- `headerExtra`: slot for completeness donut or custom chip.
- Collapse toggle: 22×22, 6px radius, `bg-tp-slate-100` → `hover:bg-tp-slate-200`, 12px `ArrowUp2`/`ArrowDown2` iconsax Linear.
- Header background: `linear-gradient(180deg, rgba(75,74,213,0.05) 0%, #FFFFFF 100%)`.
- Bottom hair-line: `1px solid var(--tp-slate-50)`.

### Body — `px-3 py-[10px]`, transparent.

### Actions slot (optional)
Horizontally-scrolling, `px-3 pt-[2px] pb-[10px]`, `flex gap-1 whitespace-nowrap`.

### Sidebar-link slot (optional, below actions)
- `px-3 py-[8px]`
- `border-top: 0.5px solid var(--tp-slate-50)`
- `background: linear-gradient(180deg, #FFFFFF 0%, rgba(75,74,213,0.04) 100%)`

### Prop surface
```
icon: ReactNode            // inline icon (used if tpIconName absent)
iconBg?: string            // deprecated — always tp-blue-50
title: string
date?: string
tpIconName?: string
badge?: { label; color; bg }
copyAll?: () => void
copyAllTooltip?: string
collapsible?: boolean       // default true
defaultCollapsed?: boolean
actions?: ReactNode
sidebarLink?: ReactNode
headerExtra?: ReactNode
dataSources?: string[]
children: ReactNode
```

---

## 13. White-labelling Dr. Agent into another EMR

The panel is designed to drop into any host. There are three categories of theming.

### A) Fully retheme with host EMR tokens
If the host already has TP (or TP-compatible) CSS variables, you get a themed Dr. Agent for free.

If the host uses its own design tokens, map them by rewriting the short list below inside a host-scoped stylesheet or a wrapper that sets CSS vars:

```
--tp-blue-50 … 900   → host primary ramp
--tp-slate-0 … 900   → host neutral ramp
--tp-success/warning/error → host status ramps
--font-sans          → host body font
--font-heading       → host heading font
--radius             → host base radius
```

After remapping, re-run the foundation skill's re-theme checklist.

### B) Keep the agent's AI signature
The AI palette (`--ai-pink`, `--ai-violet`, `--ai-indigo`) and the wash are **brand signatures of Dr. Agent**, not of TP. Re-themes should leave them alone unless the host explicitly requires a different agent palette.

If the host requires its own "AI palette":
1. Redefine `--ai-pink`, `--ai-violet`, `--ai-indigo` in the host stylesheet.
2. Update the seven-stop wash in `DrAgentPanel.tsx` to new stops (keep them 3-stop-compatible with the new AI palette).
3. Re-verify `AI_PILL_TEXT_GRADIENT`, `AI_GRADIENT_BORDER`, and `AI_GRADIENT_SOFT` still read cleanly against host backgrounds.

### C) Add or remove card kinds per host
See the `dr-agent-ui-card` skill. Cards are registered in `CardRenderer.tsx` — the panel itself does not need to change.

### Decoupling checklist (run when porting to a new host)
- [ ] All TP token imports resolve (host provides the same variable names, or a shim maps them).
- [ ] Fonts are wired (either TP defaults or host-provided `--font-sans` / `--font-heading`).
- [ ] No `@/components/tp-ui` import breaks — if the host doesn't ship TP UI, copy `TPMedicalIcon` over (it's self-contained).
- [ ] `@/components/tp-rxpad/rxpad-sync-context` is either present (TP) or stubbed — some cards reference `RxPadCopyPayload` from it.
- [ ] The wash `@property --da-wash-angle` is declared once per page (not per instance).
- [ ] The panel is mounted inside a parent that can give it `height: 100%`.

---

## 14. Adding or modifying theme in this repo (common edits)

### Change the primary colour
1. Update `--tp-blue-50` … `--tp-blue-900` in `app/globals.css`.
2. Update `--primary` and `--ring` (they alias `--tp-blue-500`).
3. Update `--tp-icon-clickable-light-bg` / `-bg-hover` (primary @ 10% / 15%).
4. Update the 5th stop in the wash `conic-gradient` inside `DrAgentPanel.tsx`.
5. Leave AI gradient alone.

### Change the font family
Swap `Mulish` / `Inter` in `app/layout.tsx`. Keep the two `next/font/google` slots (`--font-heading`, `--font-sans`) and the weight set `400–800`.

### Change the corner radius
Update `--radius` in `app/globals.css`. CardShell, bubble (14px) and banner corners (16px) are locked and override this intentionally — leave them.

### Tone down or disable motion
Users with `prefers-reduced-motion: reduce` get it automatically. To disable globally for a host, add:
```css
.da-gradient-wash, .ds-typing-spark-halo { animation: none !important; }
```

### Add a new specialty
Append to `SPECIALTY_TABS` in `components/tp-rxpad/dr-agent/constants.ts`. `headerBg` + `accentColor` are free to diverge from TP blue; primary CTA stays blue.

---

## 15. Quick sanity checklist (any visual change in the panel)

- [ ] Uses foundation tokens — no fresh hex.
- [ ] Primary state uses primary (blue by default), never violet.
- [ ] Text sizes from the TP scale.
- [ ] Card wraps in `CardShell`; body uses primitives, not custom divs.
- [ ] No `border` / `box-shadow` on a user bubble.
- [ ] No gradient container wrapping the 22px AI spark.
- [ ] Wash is z-0, always-on, opacity ≤ 0.07.
- [ ] New motion is wrapped in `prefers-reduced-motion`.
- [ ] Strings are sentence case. No emoji. No ALL-CAPS.
- [ ] If a new token was needed, it was added to `globals.css` + `tp-tokens.scss` (foundation), not inlined.

---

## Source-of-truth pointers

**Foundation (consume — do not redefine):**
- Load the `tp-design-system` skill for tokens, typography, fonts, radii.
- `app/globals.css`, `styles/tp-tokens.scss`, `app/layout.tsx`.

**Agent surface:**
- `components/tp-rxpad/dr-agent/DrAgentPanel.tsx`
- `components/tp-rxpad/dr-agent/shell/AgentHeader.tsx`
- `components/tp-rxpad/dr-agent/chat/ChatBubble.tsx`
- `components/tp-rxpad/dr-agent/chat/ChatInput.tsx`
- `components/tp-rxpad/dr-agent/chat/TypingIndicator.tsx`
- `components/tp-rxpad/dr-agent/chat/WelcomeScreen.tsx`
- `components/tp-rxpad/dr-agent/chat/PillBar.tsx`
- `components/tp-rxpad/dr-agent/cards/CardShell.tsx`
- `components/tp-rxpad/dr-agent/cards/CardRenderer.tsx`
- `components/tp-rxpad/dr-agent/cards/*` (primitives)

**Agent constants + types:**
- `components/tp-rxpad/dr-agent/constants.ts` (`CARD`, `AI_*`, `SECTION_TAGS`, `SIDEBAR_CTA_MAP`, `VITAL_META`, `SPECIALTY_TABS`).
- `components/tp-rxpad/dr-agent/types.ts` (`RxAgentOutput` discriminated union).

**Live browsable reference:**
- `components/dr-agent-design-system/DrAgentDesignSystemPage.tsx`
- `components/dr-agent-design-system/sections/{CardAnatomy,CardRules,CardCatalog,ChatShell,DesignTokens}Section.tsx`
- `components/dr-agent-design-system/catalog-data.ts` — mock data for every card kind; fastest way to learn a card's data shape.
