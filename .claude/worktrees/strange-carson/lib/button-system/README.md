# TatvaPractice Button System

Strategic expansion of the TatvaPractice Action System. Token-driven, workflow-native, enterprise-ready.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component API Reference](#component-api-reference)
3. [Split Button — Interaction Model](#split-button--interaction-model)
4. [Token Reference](#token-reference)
5. [Export Structure](#export-structure)
6. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### Design Philosophy

- **Clinical clarity** — Actions must be unambiguous
- **Workflow efficiency** — Hierarchy reflects workflow importance
- **Cognitive economy** — Predictable interaction behavior
- **Brand consistency** — Token-driven, no ad-hoc styling

### Hard Constraints (Immutable)

| Property | Value |
|----------|-------|
| Radius | 10px smooth |
| Typography | 14px / 600 / Inter |
| Icon Size | 18px (sm), 20px (md), 22px (lg) |
| Heights | S: 36px, M: 42px, L: 48px |
| CTA Themes | Primary, Neutral only (Secondary/Violet = non-clickable) |
| Destructive | Error theme, only when explicitly required |

### Structural Requirements

- **No direct base library usage** — All components are TatvaPractice wrappers
- **Strict export model** — Single entry point from `@/components/tp-ui`
- **Controlled props** — `open`, `selected`, `value` where stateful
- **Token-driven styling** — All colors/dimensions from `lib/button-system/tokens.ts`
- **Accessible by default** — Focus, keyboard, ARIA built-in

---

## Component API Reference

### 1. TPButton (Standard Action)

```
Variant: solid | outline | ghost | link
Theme: primary | neutral | error
Size: sm | md | lg
```

**Props:** `TPStandardButtonProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | TPButtonVariant | required | solid, outline, ghost, link |
| theme | TPButtonTheme | "primary" | primary, neutral, error |
| size | TPButtonSize | "md" | sm, md, lg |
| disabled | boolean | false | |
| loading | boolean | false | Shows spinner, blocks click |
| surface | TPButtonSurface | "light" | light, dark (inverted on dark) |
| leftIcon | ReactNode | — | Iconsax Linear |
| rightIcon | ReactNode | — | e.g. ChevronDown for dropdown |
| children | ReactNode | required | Button label |

**Usage:** Save Changes, Confirm Rx, Check In Patient, Reschedule, Delete Record

---

### 2. TPIconButton (Icon-Based)

**Props:** `TPIconButtonProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | ReactNode | required | |
| theme | TPButtonTheme | "neutral" | |
| size | TPButtonSize | "md" | |
| aria-label | string | required | For icon-only |
| label | string | — | Tooltip / extended label |

**Usage:** Toolbar actions, compact controls

---

### 3. TPToggleIconButton

**Props:** `TPToggleIconButtonProps` (extends TPIconButtonProps)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| pressed | boolean | required | Selected state |
| aria-pressed | boolean | required | Must match pressed |
| onToggle | (pressed: boolean) => void | — | |

**Usage:** Bold/italic in editor, view mode switcher

---

### 4. TPToggleButton

**Props:** `TPToggleButtonProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | TPButtonVariant | required | |
| selected | boolean | required | |
| value | string | — | For group context |
| onSelect | (selected: boolean) => void | — | |

**Usage:** Filter toggles, sort order

---

### 5. TPSplitButton ⭐

**Props:** `TPSplitButtonProps`

Primary action + dropdown of secondary actions. See [Split Button Interaction Model](#split-button--interaction-model).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| primaryAction | { label, icon?, onClick } | required | Main button action |
| secondaryActions | TPSplitButtonAction[] | required | Menu items |
| variant | solid \| outline \| ghost | "solid" | |
| open | boolean | — | Controlled |
| onOpenChange | (open: boolean) => void | — | |
| loading | boolean | false | Primary only |

**Usage:** More Actions, Export ▼, Save ▼ (with quick variants)

---

### 6. TPButtonGroup

**Props:** `TPButtonGroupProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| layout | connected \| segmented \| toggle | required | |
| orientation | horizontal \| vertical | "horizontal" | |
| disabled | boolean | false | |
| value | string \| string[] | — | For toggle group |
| onChange | (value) => void | — | For toggle group |

**Usage:** Daily/Weekly/Monthly, Grid/List, Sort A/Z

---

### 7. TPFab (Floating Action)

**Props:** `TPFabProps` | `TPFabWithMenuProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | primary \| extended \| contextual | required | |
| icon | ReactNode | required | |
| label | string | — | Required for extended |
| position | bottom-right \| ... | "bottom-right" | |
| actions | Array | — | For FAB with menu |

**Usage:** Quick add patient, New prescription (extended)

---

## Split Button — Interaction Model

### Overview

A Split Button combines a primary action (main button) with a dropdown of secondary actions. The interaction must feel refined, deliberate, and workflow-safe.

### Anatomy

```
┌─────────────────────────┬──────┐
│  [Icon] Primary Action  │  ▼   │  ← Dropdown trigger
└─────────────────────────┴──────┘
         ↑                    ↑
    Primary region      Secondary region
    (75% width)         (25% width)
```

### States

| State | Primary | Dropdown |
|-------|---------|----------|
| Default | Theme fill | Same theme, separator |
| Hover (primary) | Hover token | — |
| Hover (dropdown) | — | Hover token |
| Focus (primary) | Focus ring | — |
| Focus (dropdown) | — | Focus ring on trigger |
| Open | — | Menu visible, trigger active |
| Disabled | Disabled tokens | Disabled |
| Loading | Spinner, no click | Disabled |

### Keyboard Navigation

| Key | Behavior |
|-----|----------|
| `Enter` / `Space` (primary) | Execute primary action |
| `Enter` / `Space` (dropdown) | Toggle menu |
| `↓` / `ArrowDown` (dropdown focused) | Open menu, focus first item |
| `↑` / `ArrowUp` (menu open) | Focus previous item |
| `↓` / `ArrowDown` (menu open) | Focus next item |
| `Enter` (menu item) | Execute item, close menu |
| `Escape` | Close menu, return focus to dropdown trigger |
| `Tab` | Move focus (menu closes) |

### Focus Management

1. **On open:** Focus moves to first menu item (or last if opening with ArrowUp)
2. **On close:** Focus returns to dropdown trigger button
3. **Focus trap:** When menu is open, Tab cycles within menu + trigger
4. **Click outside:** Closes menu, focus stays on trigger (or previously focused element)

### Loading Logic

- **Loading = true:** Primary shows spinner; primary click disabled
- **Dropdown:** Always disabled when loading (no partial state)
- **No loading on secondary:** Secondary actions do not have per-item loading; use optimistic UI or toast

### Disabled States

- **Component disabled:** Both primary and dropdown disabled
- **Primary disabled:** Entire component disabled (invalid use case — don’t render)
- **Secondary item disabled:** Item grayed, not focusable, not clickable

### Separator

- 1px vertical line between primary and dropdown
- Color: `currentColor` at 20–30% opacity (adapts to theme)
- On dark surface: `rgba(255,255,255,0.3)`

### Dropdown Menu Constraints

- **Radius:** 12px (TP.radius.12)
- **Shadow:** TP.shadow.lg
- **Min width:** Match button width
- **Max height:** 320px, scroll if needed
- **Item height:** 40px
- **Padding:** 4px (inset)
- **Danger items:** Red text (TP.error.500)

### Accessibility

- **Primary:** `role="button"` or native `<button>`
- **Dropdown:** `aria-haspopup="menu"`, `aria-expanded={open}`
- **Menu:** `role="menu"`, items `role="menuitem"`
- **aria-label:** "More actions" or action-specific label

### Real Workflow Example

```tsx
<TPSplitButton
  primaryAction={{
    label: "Save Changes",
    icon: <TickCircle size={20} variant="Linear" />,
    onClick: handleSave,
  }}
  secondaryActions={[
    { id: "save-draft", label: "Save as Draft", onClick: handleDraft },
    { id: "save-copy", label: "Save a Copy", onClick: handleCopy },
  ]}
  variant="solid"
  theme="primary"
  loading={isSaving}
/>
```

---

## Token Reference

### Mapping: Theme × Surface × State

All values resolve via `getButtonTokens(theme, surface)` in `lib/button-system/tokens.ts`.

| Token Path | Usage |
|------------|-------|
| TP.interactive.primary.bg | Solid primary fill |
| TP.interactive.primary.hover | Primary hover |
| TP.interactive.primary.active | Primary active/pressed |
| TP.interactive.primary.text | Label on primary |
| TP.interactive.primary.dark.bg | Primary on dark surface |
| TP.interactive.primary.dark.text | Label on white (dark surface) |
| TP.interactive.secondary.border | Outline border |
| TP.interactive.secondary.hover | Outline/ghost hover fill |
| TP.interactive.neutral.bg | Neutral solid fill |
| TP.interactive.neutral.text | Neutral label |
| TP.interactive.destructive.bg | Error/destructive fill |
| TP.interactive.disabled.bg | Disabled fill |
| TP.interactive.disabled.text | Disabled label |

### Size Tokens

From `BUTTON_SIZE_TOKENS`:

| Size | Height | Padding X | Icon |
|------|--------|-----------|------|
| sm | 36 | 14 | 18 |
| md | 42 | 18 | 20 |
| lg | 48 | 22 | 22 |

---

## Export Structure

### components/tp-ui/

```
tp-ui/
├── index.ts                    # Public exports only
├── button-system/
│   ├── TPButton.tsx            # Standard action
│   ├── TPIconButton.tsx
│   ├── TPToggleIconButton.tsx
│   ├── TPToggleButton.tsx
│   ├── TPLoadingButton.tsx     # Or merged into TPButton
│   ├── TPSplitButton.tsx
│   ├── TPSplitButtonMenu.tsx   # Internal
│   ├── TPButtonGroup.tsx
│   ├── TPFab.tsx
│   └── TPFabMenu.tsx           # Internal (contextual FAB)
└── tp-button.tsx               # Legacy MUI wrapper (deprecate)
```

### index.ts Exports

```ts
// Button System (new)
export { TPButton } from "./button-system/TPButton"
export { TPIconButton } from "./button-system/TPIconButton"
export { TPToggleIconButton } from "./button-system/TPToggleIconButton"
export { TPToggleButton } from "./button-system/TPToggleButton"
export { TPSplitButton } from "./button-system/TPSplitButton"
export { TPButtonGroup } from "./button-system/TPButtonGroup"
export { TPFab } from "./button-system/TPFab"

// Types (for consumers)
export type {
  TPButtonTheme,
  TPButtonSize,
  TPButtonVariant,
  TPStandardButtonProps,
  TPIconButtonProps,
  TPSplitButtonProps,
  TPSplitButtonAction,
} from "@/lib/button-system/types"
```

### lib/button-system/

```
lib/button-system/
├── types.ts       # All TypeScript interfaces
├── tokens.ts      # Token resolution
└── README.md      # This document
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] TPButton (standard) — token-driven, no MUI
- [ ] TPIconButton
- [ ] Loading state on TPButton
- [ ] Dark surface support

### Phase 2: Stateful
- [ ] TPToggleIconButton
- [ ] TPToggleButton

### Phase 3: Split
- [ ] TPSplitButton structure
- [ ] Dropdown menu
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Loading/disabled logic

### Phase 4: Groups
- [ ] TPButtonGroup (connected)
- [ ] TPButtonGroup (segmented)
- [ ] TPButtonGroup (toggle)

### Phase 5: FAB
- [ ] TPFab (primary)
- [ ] TPFab (extended)
- [ ] TPFab (contextual / with menu)

### Phase 6: Documentation
- [ ] Usage guidelines per type
- [ ] When to use / when not
- [ ] Anatomy diagrams
- [ ] Real workflow examples
- [ ] Implementation snippets
