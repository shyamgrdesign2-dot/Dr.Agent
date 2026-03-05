"use client"

// ─── TatvaPractice Design System: React Component Library Export ───
// Generates a downloadable ZIP containing all TP components, tokens,
// theme configuration, styles, and setup instructions.

import JSZip from "jszip"

const SYSTEM_VERSION = "2.2.0"
const SYSTEM_NAME = "TatvaPractice Design System"

// ─── File manifest ───
// Each entry: [zipPath, actualImportPath]
// Files are fetched at export time via dynamic import of raw text

const COMPONENT_FILES = [
  // Root components
  "tp-accordion.tsx",
  "tp-alert.tsx",
  "tp-avatar.tsx",
  "tp-badge.tsx",
  "tp-banner.tsx",
  "tp-breadcrumbs.tsx",
  "tp-button.tsx",
  "tp-card.tsx",
  "tp-checkbox.tsx",
  "tp-chip.tsx",
  "tp-color-picker.tsx",
  "tp-command.tsx",
  "tp-date-picker.tsx",
  "tp-dialog.tsx",
  "tp-divider.tsx",
  "tp-drawer.tsx",
  "tp-dropdown-menu.tsx",
  "tp-empty-state.tsx",
  "tp-file-upload.tsx",
  "tp-number-input.tsx",
  "tp-otp-input.tsx",
  "tp-pagination.tsx",
  "tp-popover.tsx",
  "tp-progress.tsx",
  "tp-radio.tsx",
  "tp-rating.tsx",
  "tp-segmented-control.tsx",
  "tp-select.tsx",
  "tp-skeleton.tsx",
  "tp-slider.tsx",
  "tp-snackbar.tsx",
  "tp-spinner.tsx",
  "tp-stepper.tsx",
  "tp-switch.tsx",
  "tp-table.tsx",
  "tp-tabs.tsx",
  "tp-tag.tsx",
  "tp-textfield.tsx",
  "tp-time-picker.tsx",
  "tp-timeline.tsx",
  "tp-tooltip.tsx",
  "tp-transfer-list.tsx",
  "tp-tree-view.tsx",
]

const BUTTON_SYSTEM_FILES = [
  "index.ts",
  "TPButton.tsx",
  "TPButtonIcon.tsx",
  "TPIconButton.tsx",
  "TPSplitButton.tsx",
]

// ─── Generate package.json for the exported library ───
function generatePackageJson(): string {
  return JSON.stringify(
    {
      name: "@tatvapractice/design-system",
      version: SYSTEM_VERSION,
      description:
        "TatvaPractice Design System — 47 production-ready React components with full design token support",
      main: "components/index.ts",
      types: "components/index.ts",
      sideEffects: ["styles/globals.css"],
      peerDependencies: {
        react: ">=18.0.0",
        "react-dom": ">=18.0.0",
        next: ">=14.0.0",
      },
      dependencies: {
        "@emotion/react": "^11.14.0",
        "@emotion/styled": "^11.14.1",
        "@mui/material": "^7.3.0",
        "@radix-ui/react-accordion": "^1.2.0",
        "@radix-ui/react-dialog": "^1.1.0",
        "@radix-ui/react-dropdown-menu": "^2.1.0",
        "@radix-ui/react-popover": "^1.1.0",
        "@radix-ui/react-slot": "^1.2.0",
        "@radix-ui/react-switch": "^1.2.0",
        "@radix-ui/react-tabs": "^1.1.0",
        "@radix-ui/react-tooltip": "^1.2.0",
        "class-variance-authority": "^0.7.0",
        clsx: "^2.1.0",
        cmdk: "^1.1.0",
        "date-fns": "^4.1.0",
        "input-otp": "^1.4.0",
        "lucide-react": "^0.564.0",
        "react-day-picker": "^9.13.0",
        "tailwind-merge": "^3.3.0",
        vaul: "^1.1.0",
      },
      devDependencies: {
        tailwindcss: "^4.1.0",
        typescript: "^5.7.0",
      },
      keywords: [
        "react",
        "design-system",
        "tatvapractice",
        "components",
        "ui",
        "tailwind",
        "mui",
        "radix",
      ],
      license: "MIT",
    },
    null,
    2
  )
}

// ─── Generate tsconfig.json snippet ───
function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "react-jsx",
        incremental: true,
        paths: {
          "@/*": ["./*"],
          "@/components/tp-ui": ["./components"],
          "@/components/tp-ui/*": ["./components/*"],
          "@/lib/*": ["./lib/*"],
        },
      },
      include: ["**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"],
    },
    null,
    2
  )
}

// ─── Generate README ───
function generateReadme(): string {
  return `# ${SYSTEM_NAME} v${SYSTEM_VERSION}

A production-ready React design system with 47+ components, comprehensive design tokens, and full TypeScript support.

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Add Styles

Import the global stylesheet in your app's root layout:

\`\`\`tsx
// app/layout.tsx or pages/_app.tsx
import "./styles/globals.css"
\`\`\`

### 3. Use Components

\`\`\`tsx
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
\`\`\`

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

All tokens are defined in \`lib/design-tokens.ts\` and exposed as CSS custom properties in \`styles/globals.css\`.

### Token Architecture
- **Level 1 (Base Palette)**: Raw color values — \`--tp-blue-500: #4B4AD5\`
- **Level 2 (Semantic)**: Named roles — \`--primary: var(--tp-blue-500)\`

### Brand Colors
| Color | Token | Hex |
|-------|-------|-----|
| TP Blue (Primary) | \`--tp-blue-500\` | #4B4AD5 |
| TP Violet (Secondary) | \`--tp-violet-500\` | #A461D8 |
| TP Amber (Tertiary) | \`--tp-amber-500\` | #F5B832 |

## File Structure

\`\`\`
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
\`\`\`

## License

MIT
`
}

// ─── Main export function ───
export async function exportReactLibrary(
  onProgress?: (step: string) => void
): Promise<void> {
  const zip = new JSZip()
  const root = zip.folder("tatvapractice-design-system")!

  onProgress?.("Collecting component sources...")

  // ── Fetch all source files via raw fetch ──
  // We fetch from the app's own server since these are source files
  // that Next.js can serve via API route or we embed them inline

  const componentsFolder = root.folder("components")!
  const buttonSystemFolder = componentsFolder.folder("button-system")!
  const libFolder = root.folder("lib")!
  const libButtonFolder = libFolder.folder("button-system")!
  const stylesFolder = root.folder("styles")!

  // Use dynamic fetch to get raw file contents from our API
  const baseUrl = window.location.origin

  // Fetch component files
  onProgress?.("Packaging components...")
  const componentPromises = COMPONENT_FILES.map(async (file) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/source?path=components/tp-ui/${file}`
      )
      if (res.ok) {
        const text = await res.text()
        componentsFolder.file(file, text)
      }
    } catch {
      // Skip files that can't be fetched
    }
  })

  // Fetch button system files
  const buttonPromises = BUTTON_SYSTEM_FILES.map(async (file) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/source?path=components/tp-ui/button-system/${file}`
      )
      if (res.ok) {
        const text = await res.text()
        buttonSystemFolder.file(file, text)
      }
    } catch {
      // Skip files that can't be fetched
    }
  })

  // Fetch barrel export
  const indexPromise = fetch(
    `${baseUrl}/api/source?path=components/tp-ui/index.ts`
  ).then(async (res) => {
    if (res.ok) componentsFolder.file("index.ts", await res.text())
  }).catch(() => {})

  // Fetch lib files
  onProgress?.("Packaging tokens and configuration...")
  const libFiles = [
    "design-tokens.ts",
    "tp-mui-theme.ts",
    "utils.ts",
    "export-tokens.ts",
  ]
  const libPromises = libFiles.map(async (file) => {
    try {
      const res = await fetch(`${baseUrl}/api/source?path=lib/${file}`)
      if (res.ok) {
        const text = await res.text()
        libFolder.file(file, text)
      }
    } catch {
      // Skip
    }
  })

  // Fetch lib/button-system files
  const libButtonFiles = ["index.ts", "tokens.ts", "types.ts"]
  const libButtonPromises = libButtonFiles.map(async (file) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/source?path=lib/button-system/${file}`
      )
      if (res.ok) {
        const text = await res.text()
        libButtonFolder.file(file, text)
      }
    } catch {
      // Skip
    }
  })

  // Fetch globals.css
  const cssPromise = fetch(
    `${baseUrl}/api/source?path=app/globals.css`
  ).then(async (res) => {
    if (res.ok) stylesFolder.file("globals.css", await res.text())
  }).catch(() => {})

  // Wait for all fetches
  await Promise.all([
    ...componentPromises,
    ...buttonPromises,
    indexPromise,
    ...libPromises,
    ...libButtonPromises,
    cssPromise,
  ])

  // Add generated files
  onProgress?.("Generating configuration files...")
  root.file("package.json", generatePackageJson())
  root.file("tsconfig.json", generateTsConfig())
  root.file("README.md", generateReadme())

  // Generate ZIP and trigger download
  onProgress?.("Creating ZIP archive...")
  const blob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `tatvapractice-design-system-v${SYSTEM_VERSION}.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  onProgress?.("Download complete!")
}
