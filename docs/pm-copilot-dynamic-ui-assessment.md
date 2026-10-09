# PM Copilot dynamic UI assessment

Inspected 23 September 2026. Recommendation: use JSON Render for catalog-constrained card composition, retain Streamdown for narrative Markdown, and render through the existing Doctor Agent components and TP tokens. The first integration can use the existing `RxAgentOutput` renderer before introducing JSON Render's composition layer.

## Evidence and scope

- Signed in to the supplied `/turbopuffer` and `/chat` prototype pages.
- Inspected the `uat` source at commit `ec211462e15e79669ca05a41d5ca86e78b236cd9`, plus the deployed JavaScript bundle. The bundle includes Streamdown, the SSE client and the trend-card renderer; this is consistent with the source inspected, but is not proof that every deployed backend file matches that commit.
- Created one conversation for the existing patient named Test. Sent a summary request directly to the same live HTTP endpoint used by the frontend, measured its stream, then reloaded that conversation in the browser and verified the rendered answer. This was an HTTP stream inspection, not a browser DevTools HAR capture.
- Inspected a previously saved trend conversation and verified custom charts and recorded-value tables in the DOM.
- Read the complete Card Anatomy Blueprint component, architecture document, card data fallback document, UI card playbook, design-system references, and relevant renderer/types/tokens.
- Neither supplied page exposes an upload workflow; `/turbopuffer` explicitly presents a read-only corpus explorer. No upload endpoint was found in the inspected app/frontend sources. Document-upload/OCR ingestion was therefore not tested.
- No application implementation or deployment was changed. This document records the assessment. Authentication credentials and patient record contents are omitted.

## What the prototype does today

The prototype already uses `streamdown` (`^2.6.0` in its package manifest). JSON Render is not listed in that manifest.

```text
Patient selection → conversation session → question
  → backend retrieves patient evidence
  → model produces structured answer_parts
  → backend resolves evidence references
  → Markdown answer + separate chart data
  → SSE stream
  → Streamdown + TrendChart + EvidenceCard
```

The internal model contract in `search/answer_schema.py` supports `text`, `measurement_refs`, `prescription_refs`, and `trend_refs`. The backend renders recorded measurements and prescription instructions from source rows. This is useful: preserve this separation between generated narrative and recorded facts.

`search/streaming.py` incrementally parses model JSON. It resolves completed, usable references and emits answer previews and chart updates. The frontend never receives those internal `answer_parts` as a general Doctor Agent card catalog.

`frontend/src/Answer.jsx` renders charts first, then a Markdown answer, then scope/evidence. Consequently, even if the model interleaves prose and trends internally, the frontend groups charts above the narrative. An ordered block contract would preserve intended placement.

### Live request and response

```http
POST /api/search/patients/{patientUid}/ask
Authorization: Bearer <access token>
Content-Type: application/json
Accept: text/event-stream
```

```json
{
  "session_id": "<current session>",
  "question": "Summarise this patient’s chart",
  "parent_request_id": null
}
```

The optional `intent: "patient_summary"` requires the exact full starter question provided by the application. An initial probe with that intent and a shortened question was rejected with HTTP 422 before generation; the ordinary question above succeeded. When wiring starter pills, preserve their full question and action metadata.

Observed successful response: HTTP 200; `Content-Type: text/event-stream; charset=utf-8`; chunked transfer; `Cache-Control: no-store`.

| Event | Observed / source-defined behavior |
|---|---|
| `activity` | Step ID, label and status; subsequent events update the same step. |
| `answer` | Initial reset can contain only `answer`; later events carry `answer` and `append`. Append when true; replace otherwise. |
| `charts` | Replaces the current chart array. The summary test emitted an empty array. |
| `final` | Complete answer, evidence, suggestions, scope, session/request IDs, coverage and timing metadata. Chart data is optional. |
| `error` | Source-defined failure event with detail/status; not observed in the successful run. |

One summary run produced 7 activity events, 224 answer events, 1 empty charts event and 1 final event. First nonempty answer content arrived at about 14.0 seconds; final arrived at 39.5 seconds. The final answer was 10,826 characters with 732 evidence entries. These are observations from one large test chart, not latency or payload benchmarks for all patients.

The final result did not include `ui`, a JSON Render spec, or Doctor Agent `{kind,data}` cards. It was Markdown plus evidence. Changing the Markdown renderer alone will not create the documented card anatomy.

## Streamdown versus JSON Render

| Requirement | Streamdown | JSON Render |
|---|---|---|
| Smooth incomplete Markdown while text streams | Direct fit | Use a text component alongside it |
| Paragraphs, headings, tables and citations | Direct fit; already integrated | Requires components for these roles |
| Doctor Agent shell, badges, rows, selectors, footers | Requires additional structured data and custom routing | Direct fit through a custom catalog and registry |
| Model chooses components and their arrangement | Not its core contract | Core capability |
| Exact colors/fonts/spacing | Controlled by application CSS | Controlled by registered components and application CSS |
| Progressive card composition | Needs another protocol | SpecStream JSONL patches progressively build a UI spec |

Streamdown is a streaming Markdown renderer, not a catalog of clinical UI components. JSON Render defines a catalog of permitted components/actions and maps generated JSON to application-owned implementations. Its example catalog is not a visual design system that must replace yours. See [Streamdown announcement](https://vercel.com/changelog/introducing-streamdown), [JSON Render introduction](https://json-render.dev/docs), [catalog](https://json-render.dev/docs/catalog), [registry](https://json-render.dev/docs/registry), and [streaming format](https://json-render.dev/docs/streaming).

**Choose JSON Render for the dynamic-card requirement, with Streamdown inside narrative blocks.** Retaining the current renderer is the smallest first step if the immediate requirement is selecting existing cards and supplying their data. JSON Render becomes most useful when compositions and section combinations vary within a controlled vocabulary.

## Matching Doctor Agent's UI

Existing source already supplies most of the needed frontend foundation:

- `components/dr-agent-design-system/sections/CardAnatomySection.tsx`: the complete blueprint, examples, primitives and footer rules. The page route is `/dr-agent-design-system#card-anatomy`.
- `components/tp-rxpad/dr-agent/cards/CardShell.tsx`: common visual shell.
- `components/tp-rxpad/dr-agent/cards/CardRenderer.tsx`: kind-to-component routing.
- `components/tp-rxpad/dr-agent/types.ts`: current `RxAgentOutput` union with 67 kinds.
- `app/globals.css` and `app/layout.tsx`: TP tokens and Inter/Mulish font loading.
- `docs/ai-design-system/03-dr-agent-ui-card.md`: reuse rules and card integration guidance.

| Foundation | Implementation target |
|---|---|
| Primary/action color | TP primary `--tp-blue-500`, currently `#4B4AD5` |
| Typography | Inter body; Mulish heading token where specified by components |
| Card silhouette | White surface, 14px radius, subtle primary-tinted gradient border |
| Header | 26px icon container, current shell title 13px/600, date 11px |
| Body | Shared rows, section headers, tables and charts; existing spacing and type scale |
| Section headers | 30px height, 18px icon, 14px semibold label; subtle slate fill |
| Follow-up pills | Above the footer |
| Footer | Maximum two CTAs; one CTA has an arrow, two have a vertical divider and no arrows |
| Sources/feedback | Existing bubble-level source and feedback conventions |
| Completeness donut | Only applicable fixed-expectation card kinds; not every generated response |

The current prototype uses a teal palette; its stylesheet names Inter but that alone does not establish font loading. Reuse the Doctor Agent font setup and scoped TP theme instead of asking the model to reproduce CSS.

There is documentation drift: the older architecture document says 63 kinds while the current union has 67; the ASCII blueprint says title/date 12px/10px while the current shell uses 13px/11px. Some older color examples also differ from the TP foundation. Use the current components/tokens for exact rendering and reconcile the written specs before turning them into automated rules.

## Recommended scalable contract

Keep clinical meaning separate from the renderer. Extend the response with a versioned, ordered array of blocks. Each block needs a stable ID; known cards reuse the existing `{kind,data}` shape; narrative blocks carry Markdown. Add source references at card or field level without exposing arbitrary React props.

Illustrative proposed envelope, with synthetic data; this is not today's API:

```json
{
  "schemaVersion": "doctor-agent.response.v1",
  "requestId": "example-request",
  "blocks": [
    {
      "id": "intro",
      "type": "narrative",
      "markdown": "The supplied report contains one flagged result."
    },
    {
      "id": "labs",
      "type": "card",
      "output": {
        "kind": "lab_panel",
        "data": {
          "panelDate": "2026-09-23",
          "flagged": [
            {
              "name": "Example parameter",
              "value": "12",
              "unit": "example unit",
              "flag": "high",
              "refRange": "4–10"
            }
          ],
          "hiddenNormalCount": 0
        }
      },
      "sources": [
        { "field": "/flagged/0", "ref": "example-record" }
      ]
    }
  ]
}
```

`schemaVersion`, `blocks`, IDs and field sources are proposed additions; `output` uses the existing lab-panel data shape. The production adapter must resolve source references within the authenticated patient context. Do not derive clinical values by parsing the final Markdown back into cards.

A JSON Render adapter can map each known card to a catalog entry whose registry renders the existing component. For example, a `DoctorAgentCard` entry can accept the validated `RxAgentOutput` union and call `CardRenderer`; a narrative entry calls Streamdown. JSON Render's UI spec then references these entries through its standard `root`/`elements` structure. This avoids replacing the domain API with a renderer-specific tree.

For more flexible responses, add a constrained composition card with approved sections such as `MeasurementsSection`, `HistorySection`, `TrendSection`, `InsightSection`, and `EvidenceSection`. These sections use the existing primitives internally. Let the model select sections, their order and allowed semantic variants; keep shell zones, spacing, fonts, colors and footer limits in code. Do not expose every CSS property or unconstrained HTML/layout primitives to the model.

The canonical domain blocks should remain authoritative. Any presentation spec must bind to those validated blocks; it should not generate a second, potentially divergent copy of measurements or prescription instructions.

### Streaming and validation

Keep the existing SSE transport. JSONL/SpecStream is a payload format, not a replacement for HTTP/SSE. Introduce a dedicated event carrying UI patches, and explicitly adapt those payloads to the JSON Render compiler. The existing named SSE events cannot be passed unchanged to a hook expecting raw SpecStream.

Start with complete, validated card updates per block and streamed text. Add section-level patches only when needed. Render a shell/skeleton while required fields are incomplete; publish a numeric row only after value, unit, source and required context form a valid record. Keep consequential actions disabled until the relevant result is validated and final.

Add runtime validation on server and client, using shared JSON Schema and corresponding Python/TypeScript validators. TypeScript interfaces alone do not validate incoming JSON. Validate card kinds, required props, evidence references, nesting/size bounds, and permitted action IDs. Unknown or invalid blocks should show a recoverable fallback, with available narrative preserved. A schema-valid UI is not a guarantee that clinical content is correct.

Retain the current reference-resolution behavior: the model selects source references; trusted backend code supplies exact recorded values, units and instruction fields. Map semantic tones such as warning or critical to frontend tokens. Keep action execution in registered application handlers with explicit doctor interaction; a received patch must not execute a prescription/write action.

Preserve `request_id`, `parent_request_id` and the existing session-recovery behavior. The current backend can finish and persist a turn after the browser disconnects; blindly resending may duplicate a question. Add patch sequence/revision handling if replay/resume is introduced.

## Practical rollout

1. Reuse the TP theme and current CardShell/primitives in the PM Copilot frontend. Resolve Next.js-specific imports and RxPad host-context dependencies during extraction; both projects use React 19, but copying files alone is not a complete integration.
2. Add the versioned block response alongside the existing Markdown/evidence response. First map summary, lab results, trends, medication history and alerts. Keep unsupported material as narrative.
3. Wrap those components in a small JSON Render catalog; introduce flexible section composition only where existing cards are insufficient. Supply the model only the relevant catalog subset for the request.
4. Validate missing data, unknown kinds, interrupted streams, source-link resolution, narrow panels, footer limits and clinician-triggered actions. Use synthetic fixtures and side-by-side snapshots against the existing card catalog.
5. Persist the validated final blocks with their schema version, and provide migration/fallback behavior when reopening older sessions. Lazy-render or page large evidence sets; the live summary's 732 evidence entries make this worth checking separately.

The achievable first milestone is matching colors, loaded fonts, card chrome, body primitives, section ordering and footer behavior for those five response families. Broad scenario coverage can expand without asking the model to recreate visual styling on every response.

## Developer source links

- [Prototype dependencies](https://github.com/DHSPL-Tatvacare/Pm-copilot/blob/ec211462e15e79669ca05a41d5ca86e78b236cd9/frontend/package.json)
- [HTTP client and SSE reader](https://github.com/DHSPL-Tatvacare/Pm-copilot/blob/ec211462e15e79669ca05a41d5ca86e78b236cd9/frontend/src/api.js)
- [Frontend answer renderer](https://github.com/DHSPL-Tatvacare/Pm-copilot/blob/ec211462e15e79669ca05a41d5ca86e78b236cd9/frontend/src/Answer.jsx)
- [Model answer schema](https://github.com/DHSPL-Tatvacare/Pm-copilot/blob/ec211462e15e79669ca05a41d5ca86e78b236cd9/search/answer_schema.py)
- [Backend streaming renderer](https://github.com/DHSPL-Tatvacare/Pm-copilot/blob/ec211462e15e79669ca05a41d5ca86e78b236cd9/search/streaming.py)
- [Literal recorded-value renderer](https://github.com/DHSPL-Tatvacare/Pm-copilot/blob/ec211462e15e79669ca05a41d5ca86e78b236cd9/search/rendering.py)
