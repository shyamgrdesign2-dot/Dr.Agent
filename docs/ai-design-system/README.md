# AI Design System Reference

Three stacked reference docs — read top to bottom for the full picture, or jump to the one you need.

## Files

1. **[01-tp-design-system.md](./01-tp-design-system.md)** · *Foundation*
   The TatvaPractice base layer shared across every product surface. Colour tokens
   (TP Blue / Violet / Slate / Success / Warning / Error / Amber), AI gradient stops,
   typography (Mulish + Inter), radii, spacing, shadows, icon libraries, and the
   re-theme checklist for swapping primary colour / font / radius without breaking
   anything downstream.

2. **[02-dr-agent-design-system.md](./02-dr-agent-design-system.md)** · *Dr. Agent product layer*
   The white-label Dr. Agent panel that sits on the foundation — panel anatomy,
   glass header, animated wash, chat bubbles, input, typing indicator, pills,
   welcome screen, card shell. Includes the white-label-into-any-EMR playbook.

3. **[03-dr-agent-ui-card.md](./03-dr-agent-ui-card.md)** · *Card creation playbook*
   Step-by-step for building a new UI card. Scenario → card-kind decision tree,
   full inventory of existing kinds (so reuse beats invent), `CardShell` +
   primitive anatomy, the 6-step wiring recipe, and a copy/design constraint
   checklist. Read this when the ask is *"Create a UI card for X."*

## How to use these docs

- **Human review**: read straight through for onboarding.
- **AI coding agents**: these three files are also available as loadable Claude
  skills at `~/.claude/skills/{tp-design-system,dr-agent-design-system,dr-agent-ui-card}/SKILL.md`.
  The copies here live inside the repo so they can be reviewed, diffed, and
  version-controlled alongside the code they describe.

## Keeping them in sync

The skill copies in `~/.claude/skills/` and the project copies in
`docs/ai-design-system/` should match. When you update one, update the other —
or treat the project folder as the source of truth and re-copy from it.

```bash
# project copy → skill copy (project is source of truth)
cp docs/ai-design-system/01-tp-design-system.md        ~/.claude/skills/tp-design-system/SKILL.md
cp docs/ai-design-system/02-dr-agent-design-system.md  ~/.claude/skills/dr-agent-design-system/SKILL.md
cp docs/ai-design-system/03-dr-agent-ui-card.md        ~/.claude/skills/dr-agent-ui-card/SKILL.md
```

## Source-of-truth pointers these docs refer to

- `app/globals.css` — CSS variables + Tailwind v4 `@theme`
- `styles/tp-tokens.scss` — SCSS aliases for CSS modules
- `app/layout.tsx` — font wiring + theme provider
- `components/tp-rxpad/dr-agent/**` — Dr. Agent panel surface
- `components/tp-rxpad/dr-agent/cards/CardRenderer.tsx` — card registry
- `components/tp-rxpad/dr-agent/cards/CardShell.tsx` — shell primitive
- `components/tp-rxpad/dr-agent/types.ts` — `RxAgentOutput` discriminated union
- `components/tp-rxpad/dr-agent/constants.ts` — `CARD`, `AI_*`, `SECTION_TAGS`, etc.
- `components/dr-agent-design-system/**` — the live browsable reference surface
