---
name: dr-agent-ui-card
description: Playbook for creating a new Dr. Agent UI card. Load whenever the user says "Create a UI card for X scenario" or when a new agent scenario needs a structured visual response instead of plain text. Walks through the scenario → card-kind decision tree, lists every existing card kind (so you reuse before inventing), the shell / primitive anatomy, a 6-step wiring recipe, and a copy/design constraint checklist. Always co-load with `dr-agent-design-system` (panel + card shell) and `tp-design-system` (foundation tokens).
---

# Dr. Agent — UI Card Playbook

Goal: given a scenario description, produce a card that (a) reuses the registry when possible, (b) obeys every shell / motion / copy rule, and (c) wires cleanly into the renderer without a bespoke type tax. The output of this skill should be a minimal, reviewable diff touching at most three files.

> **Always load alongside:** `dr-agent-design-system` (panel + shell specs) and `tp-design-system` (foundation tokens).

---

## 1. Decision tree — do you even need a new card?

Run this *in order*. The first "yes" wins.

1. **Can the answer fit a plain-text kind?** Use these before inventing anything:
   - `text_fact` — "<context>: <value> · Source: <source>"
   - `text_alert` — short message, severity `"critical" | "high" | "medium" | "low"`
   - `text_list` — bulleted items
   - `text_step` — numbered steps (tp-blue-200 left border)
   - `text_quote` — italic quotation (tp-violet-200 left border)
   - `text_comparison` — two-column comparison, `labelA/itemsA` vs `labelB/itemsB`
   - `advice_bundle` — title + items + share message + copy payload (short counselling)
   → If yes, **emit a text kind. Do not build a component.**

2. **Does an existing card kind already fit the shape?** See §2. Reuse wins.

3. **Is the scenario genuinely new?** Proceed to §3.

Build a new card only when plain-text + reuse both fail. Forking an existing card for a small variation almost always goes wrong.

---

## 2. Scenario → existing card kind (cheat sheet)

All kinds are registered in the switch in `components/tp-rxpad/dr-agent/cards/CardRenderer.tsx`. Data shapes for each are in `components/tp-rxpad/dr-agent/types.ts` under the `RxAgentOutput` discriminated union. The fastest way to learn a shape is to open `components/dr-agent-design-system/catalog-data.ts` which has mocks for every kind.

### A — Summaries
| Kind                    | Use when scenario is…                                     |
|-------------------------|-----------------------------------------------------------|
| `patient_summary`       | Specialty-aware GP smart summary (vitals + labs + history) |
| `patient_narrative`     | Italic narrative paragraph, no chrome                     |
| `obstetric_summary`     | Obstetric patient overview                                |
| `gynec_summary`         | Gynec patient overview                                    |
| `pediatric_summary`     | Pedia (with growth hint)                                  |
| `ophthal_summary`       | Ophthal patient overview                                  |
| `symptom_collector`     | Patient-reported symptoms (PatientReportedCard)           |
| `last_visit`            | Previous visit recap                                      |
| `sbar_overview`         | SBAR narrative overview                                   |
| `medical_history`       | Longitudinal medical history                              |

### B — Data
| Kind                 | Use when scenario is…                              |
|----------------------|----------------------------------------------------|
| `lab_panel`          | Grouped lab results with flags                     |
| `vitals_trend_bar`   | Bar trend for one or more vitals                   |
| `vitals_trend_line`  | Line trend for vitals                              |
| `lab_trend`          | Single-parameter lab trend over time               |
| `lab_comparison`     | Side-by-side lab rows with an insight              |
| `med_history`        | Medication history entries + insight               |
| `vitals_summary`     | Current vitals digest                              |
| `vaccination_schedule` | Vaccine schedule with due/overdue status         |
| `patient_timeline`   | Chronological events on a vertical rail            |

### C — Action / recommendation
| Kind                 | Use when scenario is…                              |
|----------------------|----------------------------------------------------|
| `ddx`                | Differential diagnoses with copy-to-diagnosis / rxpad |
| `protocol_meds`      | Protocol-based medication plan with safety check   |
| `investigation_bundle` | Suggested investigations                         |
| `follow_up`          | Follow-up options (days + label)                   |
| `advice_bundle`      | Advice items with share message                    |
| `voice_structured_rx`| Voice-extracted structured Rx                      |
| `rx_preview`         | Preview of a constructed prescription              |

### D — Analysis (OCR)
| Kind              | Use when scenario is…                              |
|-------------------|----------------------------------------------------|
| `ocr_pathology`   | Parsed pathology report with parameters            |
| `ocr_extraction`  | Full extraction of a scanned document              |

### E — Utility / safety
| Kind                 | Use when scenario is…                              |
|----------------------|----------------------------------------------------|
| `translation`        | Translate advice to patient language               |
| `completeness`       | "What's missing from this visit" check             |
| `drug_interaction`   | Drug-drug interaction alert                        |
| `allergy_conflict`   | Allergy vs prescribed drug conflict                |
| `follow_up_question` | Agent asking the clinician a clarifying question   |
| `guardrail`          | Refusal / caution wrapper for unsafe requests      |
| `referral`           | Referral recommendation                            |
| `clinical_guideline` | Evidence-based guideline snippet                   |

### Clinical
| Kind                 | Use when scenario is…                              |
|----------------------|----------------------------------------------------|
| `pomr_problem_card`  | Problem-oriented medical record entry (with donut) |
| `sbar_critical`      | Critical SBAR (with donut)                         |
| `patient_search`     | Inline patient search result list                  |

### H — Homepage operations
| Kind                  | Use when scenario is…                              |
|-----------------------|----------------------------------------------------|
| `patient_list`        | A filtered patient list                            |
| `follow_up_list`      | Patients with upcoming follow-ups                  |
| `revenue_bar`         | Revenue bar chart                                  |
| `revenue_comparison`  | Revenue vs prior period                            |
| `bulk_action`         | Multi-patient bulk action proposal                 |
| `donut_chart`         | Percentage-of-whole visual                         |
| `pie_chart`           | Category breakdown                                 |
| `line_graph`          | Time-series trend                                  |
| `analytics_table`     | Rows × columns analytics                           |
| `condition_bar`       | Condition prevalence bar                           |
| `heatmap`             | Day × hour or category × category heatmap          |
| `welcome_card`        | Homepage welcome                                   |
| `due_patients`        | Patients due for contact                           |
| `external_cta`        | External CTA link                                  |
| `follow_up_rate`      | Follow-up adherence rate                           |
| `billing_summary`     | Billing summary                                    |
| `vaccination_due_list`| Patients with vaccinations due                     |
| `anc_schedule_list`   | ANC (antenatal care) schedule                      |

---

## 3. The two objects in every card

Every new card is built from:

1. **`CardShell`** — the chrome (header, icon, badge, actions, sidebar link, collapse, data sources). Docs: `dr-agent-design-system` skill §12. Source: `components/tp-rxpad/dr-agent/cards/CardShell.tsx`.
2. **Primitives** in `components/tp-rxpad/dr-agent/cards/`:
   - `DataRow` / `InlineDataRow` — label / value pairs.
   - `CheckboxRow` / `RadioRow` — selectable rows.
   - `SectionSummaryBar` — full-width 30px section header with `TPMedicalIcon`.
   - `SectionTag` — inline chip for sections (14/600).
   - `InsightBox` — AI insight callout.
   - `ActionRow` — pill row of action buttons.
   - `FooterCTA` — primary CTA button (30px, 10px radius).
   - `SidebarLink` — "See all X →" affordance.
   - `CopyIcon` / `CopyTooltip` / `ActionableTooltip` — copy + tooltip helpers.
   - `DataCompletenessDonut` — **only** for pomr / ocr / sbar_critical cards.
   - `ViewToggle` / `ChartTypeToggle` — tab / chart switchers.
   - `FeedbackRow` — thumbs + copy under an AI bubble (rendered by ChatBubble, not by you).

**Rule: do not hand-roll a row.** If no primitive fits, add a primitive — or the rule loses its meaning.

---

## 4. Wiring a new card (6 steps)

Let the scenario be *"After surgery, show patient's recovery milestones vs expected timeline"* — i.e. a new `post_op_milestones` card.

### Step 1 — Add the data shape + kind to the union
File: `components/tp-rxpad/dr-agent/types.ts`.

```ts
export interface PostOpMilestone {
  label: string
  expectedDay: number
  actualDay: number | null   // null = not reached
  status: "on_track" | "delayed" | "complete"
}

export interface PostOpMilestonesCardData {
  procedure: string
  surgeryDate: string         // ISO
  milestones: PostOpMilestone[]
  insight: string
}

// …inside RxAgentOutput union, alphabetical within its family
| { kind: "post_op_milestones"; data: PostOpMilestonesCardData }
```

### Step 2 — Build the component
File: `components/tp-rxpad/dr-agent/cards/clinical/PostOpMilestonesCard.tsx` (pick the subfolder that best matches the scenario — `summary/`, `data/`, `action/`, `analysis/`, `utility/`, `homepage/`, `clinical/`).

```tsx
"use client"

import { CardShell } from "../CardShell"
import { DataRow } from "../DataRow"
import { InsightBox } from "../InsightBox"
import { SidebarLink } from "../SidebarLink"
import { ClipboardText } from "iconsax-reactjs"
import type { PostOpMilestonesCardData } from "../../types"

interface Props {
  data: PostOpMilestonesCardData
  onSidebarNav?: (tab: string) => void
}

export function PostOpMilestonesCard({ data, onSidebarNav }: Props) {
  return (
    <CardShell
      icon={<ClipboardText size={15} variant="Bulk" />}
      title={`Recovery: ${data.procedure}`}
      date={new Date(data.surgeryDate).toLocaleDateString()}
      badge={{
        label: `${data.milestones.filter(m => m.status === "complete").length}/${data.milestones.length} done`,
        color: "var(--tp-blue-700)",
        bg: "var(--tp-blue-50)",
      }}
      sidebarLink={
        <SidebarLink onClick={() => onSidebarNav?.("pastVisits")}>
          See surgical history →
        </SidebarLink>
      }
    >
      <div className="flex flex-col gap-[6px]">
        {data.milestones.map((m, i) => (
          <DataRow
            key={i}
            label={m.label}
            value={m.actualDay !== null ? `Day ${m.actualDay}` : "—"}
            hint={`Expected: Day ${m.expectedDay}`}
            accent={m.status === "delayed" ? "warning" : m.status === "complete" ? "success" : undefined}
          />
        ))}
      </div>
      <InsightBox>{data.insight}</InsightBox>
    </CardShell>
  )
}
```

> Colours come from tokens (`var(--tp-blue-700)` / `var(--tp-blue-50)` / primitives' `accent` prop). Never inline a hex.

### Step 3 — Register the kind in `CardRenderer.tsx`
File: `components/tp-rxpad/dr-agent/cards/CardRenderer.tsx`.

Import alongside its siblings, then add a case to the switch next to the related family:

```ts
import { PostOpMilestonesCard } from "./clinical/PostOpMilestonesCard"

// …in renderCard switch, under the clinical family
case "post_op_milestones":
  return <PostOpMilestonesCard data={output.data} onSidebarNav={onSidebarNav} />
```

### Step 4 — Add a mock to the live catalog
File: `components/dr-agent-design-system/catalog-data.ts`.

Add an entry matching the discriminated union shape. This unlocks the card on `/dr-agent-design-system` so a designer can eyeball it in isolation.

### Step 5 — CTA pills (if any)
If the card emits follow-up pills (e.g. "Copy to Rxpad", "Snooze"), thread `onPillTap?.(label)` through the component. The parent `PillBar` handles the 3s cooldown. Don't hand-roll pill styling — use primitives or the pill constants from `constants.ts` (`AI_PILL_BG` / `_HOVER` / `_BORDER` / `_TEXT_GRADIENT`).

### Step 6 — Copy / sidebar wiring (if any)
- If the card has a `copyAll` on the shell, route the payload through `onCopy?.({ section: "<destination>", … })`. Destination keys come from `SECTION_TAGS[*].copyDestination` in `constants.ts` — do not invent a new destination string.
- If the card has a sidebar link, register an entry in `SIDEBAR_CTA_MAP` in `constants.ts` so the text and tab are consistent with other cards, and read from it.

That's the full diff: 3 files (types, component, renderer) + 1 optional (catalog-data) + possibly 1 constants edit.

---

## 5. Copy rules (what the card *says*)

- Sentence case. No ALL-CAPS. No emoji.
- Second person for patient-facing strings, third person for clinician-facing.
- No diagnostic claim without a `GuardrailCard` wrapper.
- No exclamation marks.
- Body 14px, hint 12px, muted 12px `tp-slate-400`.
- Units go in `DataRow`'s `unit` slot, not in the value string.
- Dates render via the user's locale (`toLocaleDateString()` at minimum). ISO strings are fine in the data shape.

---

## 6. Donut rule (very specific)

`DataCompletenessDonut` renders inside `ChatBubble`'s header extras **only** for:
- `pomr_problem_card`
- `ocr_extraction`
- `ocr_pathology`
- `sbar_critical`

Do not add a donut to a new card. Donuts mean "expected fields vs present fields". For any open-ended response the donut is meaningless and confusing — the response *is* the available data.

If you want a completion indicator on a different card, use a `badge` in the shell header (e.g. `"6/8 done"`), not a donut.

---

## 7. Specialty-aware cards

If the card's content changes per specialty (GP / Gynec / Ophthal / Obstetric / Pediatrics):
- Accept `activeSpecialty?: SpecialtyTabId` prop.
- Read specialty visual config from `SPECIALTY_TABS` in `constants.ts` (header bg, accent colour, icon).
- Primary CTA still uses `tp-blue-500` regardless of specialty. Only the header tint shifts.
- See `GPSummaryCard` / `ObstetricExpandedCard` for the reference pattern.

---

## 8. Constraint checklist (run before committing)

- [ ] Kind has been added to `RxAgentOutput` in `types.ts`.
- [ ] Component wraps in `CardShell`.
- [ ] Body uses primitives (`DataRow`, `InsightBox`, `SectionSummaryBar`, `SectionTag`, …) — no hand-rolled rows.
- [ ] All colours come from tokens (`var(--tp-*)` or primitive `accent` prop). No inline hex.
- [ ] Text sizes from the foundation scale (18 / 16 / 14 / 13 / 12 / 11 / 10).
- [ ] Primary state uses primary (tp-blue). No violet for a CTA.
- [ ] Badge labels and section strings use sentence case.
- [ ] No emoji. No ALL-CAPS. No exclamation marks.
- [ ] Donut is **not** added unless the kind is pomr / ocr / sbar_critical.
- [ ] New copy destination (if any) was added to `SECTION_TAGS`.
- [ ] New sidebar link (if any) was added to `SIDEBAR_CTA_MAP`.
- [ ] Mock added to `catalog-data.ts`.
- [ ] Card has been eyeballed on `/dr-agent-design-system` (live catalog).
- [ ] Motion (if any) respects `prefers-reduced-motion`.
- [ ] Exhaustiveness check in `CardRenderer.tsx`'s default branch still passes TypeScript.

---

## 9. Self-test before calling done

Answer these without re-reading any code:
1. Which foundation token did I change, if any? (Expected: none.)
2. What's the minimal diff? (Expected: types.ts + one component file + CardRenderer.tsx + catalog-data.ts mock.)
3. Can I delete this card later without breaking any other card? (Expected: yes — the registry is a switch; cards don't import each other.)
4. Does any new text size or colour violate the foundation? (Expected: no.)

If any answer is "no" or "not sure", stop and re-check the constraint checklist.

---

## 10. Worked examples

### "Show a post-operative recovery milestone tracker"
Walkthrough in §4 above. Minimal new card with `DataRow` per milestone + `InsightBox` + `badge` with completion ratio + `sidebarLink`.

### "Show the patient's last 5 visits as a timeline"
**Reuse.** `patient_timeline` already exists. Fill its data shape from the timeline events — no new component.

### "Tell the clinician the patient missed their last 2 follow-ups"
**Plain text.** `text_alert` with `severity: "high"` and a bolded patient name via `**…**` markdown (the renderer handles it).

### "Recommend two antibiotics with dosing"
**Reuse.** `protocol_meds` is the canonical home. Provide the `ProtocolMed[]` shape + safety check.

### "Ask the clinician which symptom is worse before generating DDX"
**Reuse.** `follow_up_question` with `multiSelect: false`, options pre-filled.

### "Show that this request can't be answered (out of scope)"
**Reuse.** `guardrail` with an explanation + optional pill suggestions.

---

## Source-of-truth pointers

Open the *first* one in each group; fall through only if needed.

**Registry + union:**
- `components/tp-rxpad/dr-agent/cards/CardRenderer.tsx`
- `components/tp-rxpad/dr-agent/types.ts`

**Shell + primitives:**
- `components/tp-rxpad/dr-agent/cards/CardShell.tsx`
- `components/tp-rxpad/dr-agent/cards/{DataRow,InlineDataRow,CheckboxRow,RadioRow,SectionSummaryBar,SectionTag,InsightBox,ActionRow,FooterCTA,SidebarLink,CopyIcon,CopyTooltip,ActionableTooltip,DataCompletenessDonut,ViewToggle,ChartTypeToggle,FeedbackRow}.tsx`

**Constants to extend, not fork:**
- `components/tp-rxpad/dr-agent/constants.ts` — `CARD`, `SECTION_TAGS`, `SIDEBAR_CTA_MAP`, `SPECIALTY_TABS`, `VITAL_META`, `AI_*` gradient constants, `PHASE_PROMPTS`, `TAB_PROMPTS`.

**Mocks + live preview:**
- `components/dr-agent-design-system/catalog-data.ts`
- `components/dr-agent-design-system/sections/CardCatalogSection.tsx`
- `components/dr-agent-design-system/sections/CardRulesSection.tsx`
- `components/dr-agent-design-system/sections/CardAnatomySection.tsx`

**Always co-load these skills:**
- `dr-agent-design-system` — panel + card shell + motion.
- `tp-design-system` — foundation tokens + typography + theming.
