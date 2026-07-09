# Dr. Agent — Complete Context Document

> **Purpose of this file:** A single, self-contained briefing that gives any AI agent (or new engineer) full context on what Dr. Agent is, how it is built, and where everything lives. Share this file alone and the reader should be able to reason about the product without opening the repo.
>
> **Repo:** `Dr.Agent-main` · Next.js 16 + React 19 + Tailwind v4 · **Branch note:** the `legacy` branch is the "Dr. Agent only" build (the V0 / Velora mode toggle in the header has been removed; the underlying V0/Velora code still exists but is no longer reachable from the UI).

---

## 1. What Dr. Agent is

**Dr. Agent is an AI clinical co-pilot embedded inside the TatvaPractice (TP) EMR.** It is not a standalone chatbot — it is a **white-label AI panel** that docks alongside the doctor's prescription workflow (the "RxPad") and turns natural-language questions into **structured, clinically-formatted UI cards**.

The doctor types or dictates a question ("show me her labs", "suggest a DDX", "what changed since last visit") and Dr. Agent replies with the right *shape* of answer — a lab panel, a differential-diagnosis card, a trend chart, a follow-up scheduler, an OCR extraction of an uploaded report, etc. Many cards can **copy their content straight into the RxPad** prescription form, closing the loop between "ask" and "act".

**Core value:**
- **Instant patient intelligence** — summaries, labs, vitals, alerts, last-visit recall.
- **Clinical decision support** — differential diagnoses, investigation bundles, drug-interaction & allergy checks.
- **Workflow acceleration** — voice-to-structured-Rx, document OCR, one-tap copy-to-RxPad, regional-language advice translation.
- **Cross-specialty coverage** — a GP baseline with overlays for Gynecology, Obstetrics, Pediatrics, and Ophthalmology.
- **Operational intelligence** — on the clinic homepage it also answers business questions (revenue, follow-up rates, patient lists, analytics).

**White-label by design:** all colour and typography come from a swappable *foundation* token layer. Point it at another EMR's tokens and Dr. Agent re-themes without code changes. The AI "signature" (gradient wash, spark icon) is a Dr. Agent brand asset kept constant across themes.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.1.6** (App Router, Turbopack) |
| UI runtime | **React 19.2.4** |
| Language | **TypeScript 5.7.3** (strict) |
| Styling | **Tailwind CSS v4.1.9** + PostCSS, CSS custom properties, some SCSS modules |
| Primitives | **Radix UI** (dialog, tabs, tooltip, select, dropdown, popover, …), **MUI 7** + Emotion (select surfaces) |
| Icons | **Iconsax**, **Phosphor**, **Lucide** |
| Charts | **Recharts 2.15** |
| Forms | **React Hook Form** + **Zod** |
| Misc | date-fns, sonner (toasts), vaul (drawers), cmdk, embla-carousel, jszip |
| Fonts | **Mulish** (headings, `--font-heading`) + **Inter** (body, `--font-sans`) via `next/font/google` |

Scripts (`package.json`): `dev` → `next dev`, `build` → `next build`, `start` → `next start`, `lint` → `eslint .`. Type validation is skipped during build (configured in `next.config.mjs`).

---

## 3. App routes / screens

All routes live under `app/` (App Router). Several are **internal documentation / demo surfaces**, not production doctor-facing screens.

| Route | Component | What it is |
|---|---|---|
| `/tp-appointment-screen` | `DrAgentPage` | **Primary entry point.** Appointment queue with tabs (Queue / Finished / Cancelled / Draft / Pending Digitisation), filters, date-range picker, and the embedded Dr. Agent panel on the right. "TypeRx" opens the RxPad + agent for a patient. This is the header that previously held the Dr. Agent / V0 / Velora mode toggle. |
| `/tp-appointment-screen/scenarios` | scenarios page | Internal reference: demo patient scenarios, card families, phase system, coverage matrix. Stakeholder education, not production. |
| `/rx-workspace` | `RxWorkspace` | Full prescription workspace — sidebars + RxPad + agent, expanded layout. |
| `/Rxpad` | RxPad page | Standalone prescription form (no sidebar). |
| `/tp-follow-ups` | `FollowUpsPage` | Follow-up patient listing with smart date picker, filters, and bulk "send reminder". |
| `/patient-details` | `PatientDetailPage` | Patient visit summary / medical-context preview. |
| `/intent-classification` | `IntentClassificationContent` | Internal doc + live demo of the intent-classification system and card anatomy (zone highlighting). |
| `/dr-agent-design-system` | `DrAgentDesignSystemPage` | Interactive, browsable design-system reference (card anatomy, rules, catalog, chat shell, tokens). |
| `/(docs)/foundations/*` | — | Token references: colors, typography, shadows, spacing, icons. |
| `/(docs)/components/*` | — | Component galleries: buttons, inputs, navigation, feedback, surfaces, data-display, clinical, new. |
| `/api/source`, `/api/download/*` | route handlers | Source-view + screen-download (zip) endpoints (dynamic). |

---

## 4. The Dr. Agent panel — anatomy

**File:** `components/tp-rxpad/dr-agent/DrAgentPanel.tsx`

A three-layer absolute stack inside one `relative flex h-full flex-col overflow-hidden bg-white` root:

```
z-0   .da-gradient-wash      animated conic-gradient signature (opacity 0.07, blur 90px, 22s rotation, always on, prefers-reduced-motion aware)
z-10  chat area              the only thing that scrolls; pt-[52px] clears the floating header
z-30  floating glass header  brand tag ("Dr. Agent" + spark icon) + collapse/end-session
```

**Key sub-components** (`components/tp-rxpad/dr-agent/`):
- `shell/AgentHeader.tsx` — liquid-glass floating header (blur 12px, translucent white, inset highlight + drop shadow).
- `chat/ChatThread.tsx` — scrollable message list.
- `chat/ChatBubble.tsx` — **AI bubble** = bare 22px spark icon + content, no container; **user bubble** = translucent white glass, no border, no shadow. Renders a data-completeness donut only for `pomr_problem_card`, `ocr_extraction`, `ocr_pathology`, `sbar_critical`.
- `chat/ChatInput.tsx` — white pill input; `+` add-action · patient chip · mic · text field · send. Send/focus states use **primary blue**, never violet.
- `chat/WelcomeScreen.tsx` — rotating spark + context-aware greeting ("Ask anything about {clinic / patient / billing} today") + up to 4 canned cards.
- `chat/PillBar.tsx` — horizontally-scrolling canned-prompt pills (gradient text, 3s tap cooldown).
- `chat/TypingIndicator.tsx` — coin-flip spark + rotating "thinking" lines while a reply builds.
- `chat/AttachPanel.tsx` + `chat/DocumentBottomSheet.tsx` — document upload (pathology / radiology / prescription / discharge summary / vaccination / other) and uploaded-docs list.
- `cards/CardShell.tsx` — the chrome (gradient-tinted border, icon header, title/date/badge, copy-all, collapse toggle, actions slot, sidebar-link slot) wrapping every card.
- `cards/CardRenderer.tsx` — the registry: a switch over `RxAgentOutput.kind` that renders the right card component.

**Design hard-rules** (from `docs/ai-design-system/02-dr-agent-design-system.md`): primary = blue `#4B4AD5` (never violet for CTAs); violet is informative only; sentence case everywhere, no emoji, icons only; min text size 10px; all motion wrapped in `prefers-reduced-motion`.

---

## 5. The card system

Dr. Agent's replies are a **discriminated union** — `RxAgentOutput` in `components/tp-rxpad/dr-agent/types.ts` — keyed by `kind`. `CardRenderer.tsx` maps each `kind` to a component. The chat message that carries a card is `RxAgentChatMessage.rxOutput`.

```ts
interface RxAgentChatMessage {
  id: string
  role: "assistant" | "user"
  text: string
  createdAt: string
  rxOutput?: RxAgentOutput          // the structured card / text block
  attachment?: ChatAttachment       // pdf | image
  feedbackGiven?: "up" | "down" | null
  suggestions?: Array<{ label: string; message: string }>  // inline redirect chips
}
```

### Card kinds (grouped)

**Patient summaries & narrative**
`patient_summary` · `patient_narrative` · `symptom_collector` · `last_visit` · `medical_history` · `sbar_overview` · `sbar_critical`

**Specialty summaries**
`obstetric_summary` · `gynec_summary` · `pediatric_summary` · `ophthal_summary`

**Labs & vitals (data)**
`lab_panel` · `lab_comparison` · `lab_trend` · `vitals_trend_bar` · `vitals_trend_line` · `vitals_summary` · `med_history`

**Clinical decision & action**
`ddx` (3-tier: can't-miss / most-likely / consider) · `protocol_meds` (with safety check + copy-to-RxPad) · `investigation_bundle` · `follow_up` · `advice_bundle` · `voice_structured_rx` · `rx_preview`

**Workflow & utility**
`completeness` · `translation` · `drug_interaction` · `allergy_conflict` · `follow_up_question` · `guardrail` (out-of-scope redirect)

**Document OCR**
`ocr_pathology` · `ocr_extraction`

**POMR & clinical problem**
`pomr_problem_card` (per-problem labs/meds/missing-fields + data-completeness donut)

**Patient search**
`patient_search`

**Text-only variants**
`text_fact` · `text_alert` · `text_list` · `text_step` · `text_quote` · `text_comparison`

**Homepage / operational (business intelligence)**
`welcome_card` · `patient_list` · `follow_up_list` · `revenue_bar` · `revenue_comparison` · `bulk_action` · `donut_chart` · `pie_chart` · `line_graph` · `analytics_table` · `condition_bar` · `heatmap` · `due_patients` · `external_cta` · `follow_up_rate`

**Newer variants**
`referral` · `vaccination_schedule` · `vaccination_due_list` · `anc_schedule_list` · `clinical_guideline` · `patient_timeline` · `billing_summary`

**Velora (advanced cross-specialty — see §6)**
`velora_brief` · `care_gap_window` · `clinical_correlation_chain` · `velora_scenario_card`

> To learn any card's exact data shape, read its interface in `types.ts`, or see mock data in `components/dr-agent-design-system/catalog-data.ts`. To build a **new** card, follow `docs/ai-design-system/03-dr-agent-ui-card.md`.

---

## 6. Modes: full, V0, and Velora

The header on `/tp-appointment-screen` historically offered a 3-way toggle: **Dr. Agent | V0 | Velora**.

- **Dr. Agent (full)** — the complete panel with all card kinds. `DrAgentVariant = "full"`.
- **V0** — a **summary-only, simplified** variant (`DrAgentPanelV0.tsx`, `DrAgentVariant = "v0"`) for a lighter first rollout. State persisted in `localStorage` (`dr-agent-v0-mode`), synced across tabs. Hook: `hooks/useV0Mode.ts`.
- **Velora** — an **advanced multi-specialist correlation** demo mode for complex patients, showing how signals invisible to any single department become obvious once connected. Hook: `hooks/useVeloraMode.ts`; logic in `velora/{velora-patients,velora-router,velora-scenarios}.ts`.
  - Demo patients: **Priya** (post-mastectomy, missed radiation-oncology window → `care_gap_window`) and **Rajesh** (CKD-5 on dialysis, dialysis-adequacy ↔ cardiac-stress → `clinical_correlation_chain`).
  - Velora cards: `velora_brief` (compact intro), `care_gap_window` and `clinical_correlation_chain` (extensive assessments revealed on pill tap), `velora_scenario_card` (flexible drill-down: bullets / steps / key-values / table / comparison / narrative / highlight).

> **Legacy branch status:** the header toggle now shows **only "Dr. Agent"**; V0 and Velora are no longer selectable from the UI. Their code remains in the repo but is unreachable through the header. (Edit is in `components/tp-appointment-screen/DrAgentPage.tsx`, the `aria-label="Dr. Agent mode"` tablist.)

---

## 7. How a reply is produced (engines)

Located in `components/tp-rxpad/dr-agent/engines/` (names approximate the responsibilities):

1. **Intent classification** — a user query is classified into an `IntentCategory` and a target `ResponseFormat`.
   - `IntentCategory`: `data_retrieval` · `clinical_decision` · `action` · `comparison` · `document_analysis` · `clinical_question` · `operational` · `ambiguous` · `follow_up` · `out_of_scope`
   - `ResponseFormat`: `text` · `hybrid` (text + card) · `card`
   - Result shape: `IntentResult { category, format, confidence }`.
2. **Reply building** — produces `ReplyResult { text, rxOutput?, followUpPills?, suggestions? }` — i.e. the message text plus an optional card and next-step pills.
3. **Pill generation** — canned prompt pills are chosen from the current **consultation phase** and patient data (safety "force" pills always surface).
4. **Voice → structured Rx** — dictation is parsed into `VoiceStructuredRxData` sections (symptoms / examination / diagnosis / medication / advice / investigation / follow-up / history) ready to copy into RxPad.

**Consultation phases** (`ConsultPhase`) drive which pills appear:
`empty` → `symptoms_entered` → `dx_accepted` → `meds_written` → `near_complete`.

**Specialties** (`SpecialtyTabId`): `gp` · `gynec` · `ophthal` · `obstetric` · `pediatrics`.
**Doctor view types** (`DoctorViewType`): `specialist_first_visit` · `treating_physician` · `emergency_oncall` — control summary depth and intro flow (e.g. emergency on-call surfaces the `sbar_critical` view).

---

## 8. Design system (foundation + product layer)

Two layers, documented in `docs/ai-design-system/`:

**Foundation — TatvaPractice tokens** (`01-tp-design-system.md`; source of truth `app/globals.css` + `styles/tp-tokens.scss`):
- **TP Blue** = primary, `--tp-blue-500 #4B4AD5` (CTAs, focus rings, active states, card icon colour).
- **TP Violet** = secondary/informative only, `--tp-violet-500 #A461D8` (never a CTA).
- **TP Slate** = neutrals, `--tp-slate-0 #FFFFFF` … `--tp-slate-900 #171725`; page background = `--tp-slate-100 #F1F1F5`.
- **Status ramps**: Success (green), Warning (amber), Error (crimson, `--destructive #C8102E`).
- **AI gradient signature**: pink → violet → indigo (`--ai-pink`, `--ai-violet`, `--ai-indigo`) — brand-locked, untouched by re-themes.
- **Type**: Mulish (headings) + Inter (body). Fixed px sizes: 18 (welcome headline) / 16 (card & header titles) / 14 (body) / 12 (labels, tags) / 10 (chart ticks, minimum). Weights 400–800. Sentence case; no ALL-CAPS; no emoji.
- **Radius** `--radius 0.75rem`; card/bubble corners locked at 14px. Subtle shadows only.

**Product layer — Dr. Agent** (`02-dr-agent-design-system.md`): panel anatomy, glass header, animated wash, chat bubbles, input, typing indicator, pills, welcome screen, and `CardShell` chrome — all consuming foundation tokens. **White-labelling playbook** (§13 of that doc) explains porting into another EMR: remap the token ramps, keep the AI signature, add/remove card kinds in `CardRenderer.tsx`.

**Card creation** (`03-dr-agent-ui-card.md`): scenario → card-kind decision tree, existing-kind inventory (reuse before invent), `CardShell` + primitive anatomy, 6-step wiring recipe, copy/design checklist.

---

## 9. Key file map

```
app/
  tp-appointment-screen/page.tsx        Primary screen (queue + embedded agent + mode header)
  tp-appointment-screen/scenarios/      Demo-scenario reference
  rx-workspace/ · Rxpad/                 Full workspace / standalone RxPad
  tp-follow-ups/ · patient-details/      Follow-up list / patient preview
  intent-classification/                 Intent + card-anatomy demo
  dr-agent-design-system/                Interactive design-system reference
  (docs)/foundations/* · (docs)/components/*   Token & component galleries
  globals.css                            All CSS custom properties + Tailwind v4 @theme
  layout.tsx                             Font wiring + theme provider

components/tp-rxpad/dr-agent/            ← the entire agent lives here
  DrAgentPanel.tsx                       Full panel (3-layer stack + wash)
  DrAgentPanelV0.tsx                     Summary-only V0 variant
  types.ts                               RxAgentOutput union + all card interfaces
  constants.ts                           CARD, AI_*, SECTION_TAGS, SPECIALTY_TABS, etc.
  shell/     AgentHeader, PatientSelector, DrAgentFab
  chat/      ChatThread, ChatBubble, ChatInput, WelcomeScreen, PillBar,
             TypingIndicator, AttachPanel, DocumentBottomSheet
  cards/     CardRenderer (registry), CardShell (chrome),
             clinical/ (POMR, SBAR, Velora), + summary/data/action/analysis/homepage/utility cards
  engines/   intent / reply / pill / phase / voice-rx generation
  velora/    velora-patients, velora-router, velora-scenarios
  hooks/     useV0Mode, useVeloraMode
  shared/ · utils/

components/tp-appointment-screen/DrAgentPage.tsx   Appointment screen shell + mode header
components/dr-agent-design-system/                 Live design-system page + catalog-data.ts (mock data per card kind)

docs/ai-design-system/
  01-tp-design-system.md      Foundation tokens (colour, type, radius)
  02-dr-agent-design-system.md Dr. Agent panel + white-label playbook
  03-dr-agent-ui-card.md       How to build a new card
```

---

## 10. Reading order for a new agent

1. **This file** — the map.
2. `components/tp-rxpad/dr-agent/types.ts` — the `RxAgentOutput` union is the product's vocabulary.
3. `components/tp-rxpad/dr-agent/cards/CardRenderer.tsx` — how kinds become components.
4. `docs/ai-design-system/02-dr-agent-design-system.md` — the panel + its rules.
5. `components/dr-agent-design-system/catalog-data.ts` — concrete example data for every card.
6. `app/tp-appointment-screen/page.tsx` — the real screen it all runs inside.

---

*Note: this is a UI/UX prototype (POC). Replies are produced by deterministic mock engines over demo patient data, not a live LLM or real EMR backend — the architecture is built so those engines can later be swapped for real services.*
