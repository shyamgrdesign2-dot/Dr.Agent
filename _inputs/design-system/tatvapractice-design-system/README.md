# TatvaPractice Design System v2.2.0

A production-ready React design system with 47+ components, comprehensive design tokens, and full TypeScript support.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Styles

Import the global stylesheet in your app's root layout:

```tsx
// app/layout.tsx or pages/_app.tsx
import "./styles/globals.css"
```

### 3. Use Components

```tsx
import { TPButton, TPCard, TPCardContent, TPTextField } from "./components"

export default function MyPage() {
  return (
    <TPCard>
      <TPCardContent>
        <TPTextField label="Email" placeholder="you@example.com" />
        <TPButton variant="primary" size="md">
          Submit
        </TPButton>
      </TPCardContent>
    </TPCard>
  )
}
```

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Next.js 16 |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| MUI Components | MUI v7 (wrapped with TP tokens) |
| Radix Components | Radix UI primitives (drawer, dropdown, popover, command) |
| Icons | Lucide React |
| Tokens | Two-level architecture (Base Palette → Semantic Tokens) |

## Component List

### MUI-Wrapped (23)
TPButton, TPIconButton, TPSplitButton, TPTextField, TPCard, TPChip, TPAlert,
TPDialog, TPTabs, TPTable, TPCheckbox, TPRadio, TPSwitch, TPSelect,
TPSnackbar, TPTooltip, TPBadge, TPAvatar, TPDivider, TPBreadcrumbs,
TPPagination, TPProgress, TPSkeleton, TPAccordion, TPSlider

### Radix/shadcn-Based (8)
TPDrawer, TPDropdownMenu, TPPopover, TPCommand, TPOTPInput,
TPSegmentedControl, TPTimeline, TPTag

### Standalone (16)
TPSpinner, TPEmptyState, TPBanner, TPDatePicker, TPTimePicker,
TPNumberInput, TPFileUpload, TPStepper, TPRating, TPTreeView,
TPColorPicker, TPTransferList

## Design Tokens

All tokens are defined in `lib/design-tokens.ts` and exposed as CSS custom properties in `styles/globals.css`.

### Token Architecture
- **Level 1 (Base Palette)**: Raw color values — `--tp-blue-500: #4B4AD5`
- **Level 2 (Semantic)**: Named roles — `--primary: var(--tp-blue-500)`

### Brand Colors
| Color | Token | Hex |
|-------|-------|-----|
| TP Blue (Primary) | `--tp-blue-500` | #4B4AD5 |
| TP Violet (Secondary) | `--tp-violet-500` | #A461D8 |
| TP Amber (Tertiary) | `--tp-amber-500` | #F5B832 |

## File Structure

```
tatvapractice-design-system/
  components/           # All 47 TP components
    button-system/      # Advanced button components
    index.ts            # Barrel export
  lib/
    design-tokens.ts    # Complete token system (600+ tokens)
    tp-mui-theme.ts     # MUI theme configuration
    utils.ts            # cn() utility
    button-system/      # Button token definitions
  styles/
    globals.css         # Tailwind v4 + all CSS custom properties
  package.json          # Dependencies
  tsconfig.json         # TypeScript configuration
  README.md             # This file
```

## License

MIT
