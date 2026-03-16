# CTA Icon Guidelines

TatvaPractice CTA system — standards for icon usage and visual consistency.

**Icon library:** `lucide-react` — stroke-based, layout-stable, inherits `currentColor`.

---

## 1. Icon Style Rule (Non-Negotiable)

**Inside all CTAs, use line/linear icons only.**

| Use | Don't use |
|-----|-----------|
| `variant="Linear"` | `variant="Bulk"`, `variant="Bold"` |
| Line / outline icons | Filled, dual-tone, or solid icons |
| **strokeWidth 1.5** (minimum) | Thinner or thicker strokes |

Applies to:

- Standard buttons
- Split CTAs
- Icon buttons (TPIconButton)
- Toggle buttons
- Button groups
- FABs

Goal: Clear, lightweight visual language.

---

## 2. Icon-Only CTA (Square Rule)

For icon-only buttons:

- Height and width must be equal.
- Output must be a perfect square.
- Icon must be centered.
- Padding must be consistent across S / M / L.

No rectangular icon-only CTAs.

---

## 3. Icon Placement (Left, Right, or Both)

**Support icons on left, right, or both sides.**

- Left icon is common for primary actions (e.g. Save, Delete, Export).
- Right icon for dropdown chevrons, external links, or action indicators.
- Use both when it clarifies the action. Provide examples of both left and right in the design system.

When using icons on both sides:

- Use the same icon on both sides if needed for balance.
- Do **not** use arrow icons on the right unless they represent a dropdown.

Arrows used arbitrarily can be confusing.

---

## 4. Arrow / Chevron Usage (Strict)

Use arrow or chevron icons only for:

- Indicating a dropdown
- Expandable content
- Direction for navigation

Do **not** use arrows as generic right-side icons.

---

## 5. TPIconButton

- Structure is correct as implemented.
- All icons must remain linear.
- Size is square: `width = height` for S / M / L.

---

## 6. Optional Enhancements

Where possible, improve:

- Icon spacing
- Hover feedback
- Active press feedback
- Focus visibility
- Split CTA separation

Without changing core icon and layout rules.

---

## 7. Split CTA Icons

- Split buttons typically use **text-only** for the primary action.
- Add an icon to the primary action only when it clarifies the action (e.g. Save, Export).
- The dropdown chevron on the right is standard and should remain.

---

## 8. Spacing & Layout

- **Icon-Text Gap:** Use **6px** between icon and text in all CTAs.
- **Center alignment:** Text and icons must be center-aligned vertically and horizontally.
- **Split CTA divider:** For neutral theme + outline, use a lighter divider (#A2A2A8, ~65% opacity) so it doesn’t compete with content.

## 9. Neutral Theme (TP Slate 700)

- For neutral theme, use **TP slate-700** (#454551) for text and icons (primary text color).
- Do not use lighter grays for neutral CTA text/icons.

---

## Outcomes

- Consistent visual language
- Less cognitive load
- Clear CTA hierarchy
- Stronger system integrity
