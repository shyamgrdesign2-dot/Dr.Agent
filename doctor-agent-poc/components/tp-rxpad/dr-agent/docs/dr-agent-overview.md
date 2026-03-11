# Dr. Agent — Product Overview & v0 Capabilities

## What is Dr. Agent?

Dr. Agent is not just an AI assistant — it's an **AI co-pilot for doctors** embedded directly into the TatvaPractice EMR workflow. It sits alongside the prescription pad (RxPad) and provides real-time, context-aware clinical intelligence during patient consultations.

---

## Core Concept: AAGUI & A2UI

### AAGUI — AI-Augmented Graphical User Interface
Traditional EMR interfaces require doctors to navigate multiple screens, manually look up patient history, and recall clinical guidelines. AAGUI embeds AI capabilities directly into existing UI surfaces — every card, every section header, every sidebar panel becomes an AI-touchpoint.

### A2UI — Agent-to-UI Communication
Dr. Agent introduces a bidirectional communication layer between the AI agent and the EMR interface:
- **Agent → UI**: AI generates structured outputs (cards, tables, charts) that render natively in the EMR
- **UI → Agent**: Doctor interactions (clicking pills, tapping sidebar sections, copying to RxPad) feed context back to the agent
- **Result**: The doctor never leaves their workflow. AI intelligence is woven into the clinical interface itself.

---

## v0 Feature Set

### 1. Patient Context Intelligence
- Auto-loads patient summary when consultation begins
- Surfaces chronic conditions, active medications, allergies, and key labs
- Highlights abnormal vitals with clinical severity (warning/critical)
- Shows patient-reported symptom data from the Visit app's symptom collector

### 2. Specialty-Aware Consultation
- Supports GP, Gynecology, Ophthalmology, Obstetrics, and Pediatrics
- Specialty switch auto-loads relevant patient context and card types
- Obstetric data includes ANC tracking, pregnancy history, GPLA
- Pediatric data includes growth charts, vaccination schedules, milestones

### 3. Smart Card System (30+ card types)
- **Summary cards**: Patient summary, patient-reported intake, last visit
- **Data cards**: Vital trends (bar/line), lab panels, lab comparisons, med history
- **Action cards**: DDX generation, Rx preview, investigation suggestions, advice drafts
- **Utility cards**: Completeness checker, clinical guidelines, referral, translation
- **Homepage cards**: Welcome schedule, analytics, revenue, follow-up lists, patient queues
- Every card supports: copy-to-RxPad, collapse/expand, sidebar deep-links

### 4. Contextual Prompt System
- Phase-aware pill suggestions (empty → symptoms → dx → meds → complete)
- Tab-aware prompts change based on which sidebar section is active
- Canned message pills guide doctors through the consultation flow
- Pills appear only in the action bar, never on intro cards (clean separation)

### 5. Voice-to-Structured-Rx
- Dictate an entire consultation via voice
- AI parses voice into structured fields: symptoms, examinations, diagnoses, medications, investigations, advice, follow-up
- Each field maps directly to an RxPad section for one-click acceptance

### 6. Document Intelligence (OCR)
- Upload pathology reports, prescriptions, or medical records
- AI extracts structured data via OCR
- Presents extracted data in reviewable cards before copying to RxPad

### 7. Sidebar AI Integration
- Every sidebar section (Vitals, History, Labs, Past Visits, etc.) has an AI trigger icon
- Hover to reveal, click to ask Dr. Agent about that specific section
- Deep-links from cards navigate to relevant sidebar tabs

### 8. Homepage / Clinic Overview Mode
- Schedule overview with patient queue stats
- Follow-up list with SMS reminder capabilities (with success confirmation UI)
- Revenue analytics, condition distribution, appointment heatmaps
- Patient-level drill-down from clinic overview

---

## UX Design Principles

1. **Minimal cognitive load**: Cards are compact (12px body, 10px chips), collapsible, and scannable
2. **Copy-first workflow**: Every data point can be copied to the RxPad with one click
3. **No modal interruptions**: AI operates in a side panel, never blocks the prescription flow
4. **Progressive disclosure**: Start with summary, drill down on demand
5. **Hover-to-discover**: AI icons appear on hover, reducing visual clutter
6. **Trust indicators**: Every AI output is labeled as AI-assisted with a verification reminder

---

## Technical Architecture (v0)

- **Frontend**: Next.js + React, styled with Tailwind CSS + TP design tokens
- **Card system**: 30+ card types rendered via a unified CardRenderer
- **Intent engine**: Classifies doctor queries into card-type responses
- **Phase engine**: Tracks consultation progress to suggest relevant next actions
- **Pill engine**: Generates context-aware prompt suggestions
- **Reply engine**: Maps intents to mock data responses (v0), ready for API integration
- **RxPad sync**: Bidirectional context via React context (useRxPadSync)

---

## What's Next (v1 Roadmap)

- Live LLM integration replacing mock engines
- Real-time symptom collector integration with Visit app
- Multi-language advice translation
- Drug interaction checking
- Clinical decision support with evidence citations
- Cross-patient analytics and population health insights
