"use client"

// ═══════════════════════════════════════════════════════════════════════
// TatvaPractice Design System — Figma HTML Preview Export v3.0
// ═══════════════════════════════════════════════════════════════════════
//
// Generates a self-contained, variant-aware HTML file designed for
// import into Figma using the html.to.design (H2D) plugin.
//
// Key design decisions for Figma import quality:
//  1. Every component variant is a separate, named element
//  2. States (default/hover/focus/disabled) are shown side-by-side
//  3. Sizes (sm/md/lg) are shown as separate rows
//  4. Icons are inline SVGs (imported as vector components in Figma)
//  5. Token annotations appear below each component for designer ref
//  6. Naming follows Figma component naming: "Component / Variant / State"
//
// ═══════════════════════════════════════════════════════════════════════

import {
  designTokens,
  semanticTokens,
  typographyScale,
  type ColorGroup,
  type FunctionalGroup,
} from "./design-tokens"

import {
  allComponentTokenGroups,
  ctaTokens,
  inputTokens,
  feedbackTokens,
  dataDisplayTokens,
  navigationTokens,
  surfaceTokens,
} from "./component-tokens"

const SYSTEM_VERSION = "3.0.0"

// ── Inline SVG icons (for Figma vector import) ───────────────────────

const ICONS = {
  plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  chevronRight: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronDown: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  alertCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  checkCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertTriangle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  loader: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starEmpty: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
}

// ── Token annotation helper ──────────────────────────────────────────

function tokenAnnotation(label: string, tokens: { name: string; value: string }[]): string {
  const items = tokens.map(t =>
    `<span class="token-chip"><span class="token-name">${t.name}</span><span class="token-val">${t.value}</span></span>`
  ).join("")
  return `<div class="token-annotation"><span class="token-label">${label}</span><div class="token-list">${items}</div></div>`
}

// ── Build the complete HTML ──────────────────────────────────────────

function buildHtml(): string {
  // ── Collect colors for palette ──
  const tokenColors: { group: string; token: string; value: string }[] = []
  Object.entries(designTokens).forEach(([, group]) => {
    if ("subgroups" in group) {
      const fg = group as FunctionalGroup
      fg.subgroups.forEach(sub => {
        sub.colors.forEach(c => {
          tokenColors.push({ group: sub.name, token: String(c.token), value: c.value })
        })
      })
    } else {
      const cg = group as ColorGroup
      cg.colors.forEach(c => {
        tokenColors.push({ group: cg.name, token: String(c.token), value: c.value })
      })
    }
  })

  // Semantic CSS vars
  const semanticCss: string[] = []
  Object.entries(semanticTokens).forEach(([, category]) => {
    category.groups.forEach(group => {
      group.tokens.forEach(t => {
        if (t.value.startsWith("#") || t.value.startsWith("rgba")) {
          semanticCss.push(`  --${t.token.replace(/\./g, "-")}: ${t.value};`)
        }
      })
    })
  })

  // Color swatches HTML
  const colorGroups = new Map<string, { token: string; value: string }[]>()
  tokenColors.forEach(({ group, token, value }) => {
    if (!colorGroups.has(group)) colorGroups.set(group, [])
    colorGroups.get(group)!.push({ token, value })
  })

  let colorHtml = ""
  colorGroups.forEach((colors, groupName) => {
    colorHtml += `<div class="color-group"><h3 class="section-subtitle">${groupName}</h3><div class="swatch-grid">`
    colors.forEach(({ token, value }) => {
      colorHtml += `<div class="swatch"><div class="swatch-color" style="background:${value};"></div><div class="swatch-info"><span class="swatch-token">${token}</span><span class="swatch-value">${value}</span></div></div>`
    })
    colorHtml += `</div></div>`
  })

  // Typography HTML
  const typographyHtml = typographyScale.map(t =>
    `<div class="type-sample" style="font-family:${t.fontFamily};font-weight:${t.weight};font-size:${t.size};line-height:${t.lineHeight};letter-spacing:${t.letterSpacing};">
      <div class="type-header"><span class="type-label">${t.name}</span><span class="type-meta">${t.size} / ${t.lineHeight} / ${t.weight}</span></div>
      <div class="type-text">The quick brown fox jumps over the lazy dog</div>
    </div>`
  ).join("\n")

  // Token spec tables for export
  const tokenSpecHtml = allComponentTokenGroups.map(group => {
    const rows = group.tokens.map(t =>
      `<tr><td class="spec-token">${t.token}</td><td class="spec-prop">${t.property || "—"}</td><td class="spec-value">${t.value}</td><td class="spec-desc">${t.description || ""}</td></tr>`
    ).join("")
    return `<div class="token-spec-section">
      <h3 class="section-subtitle">${group.component}</h3>
      <p class="section-desc">${group.description}</p>
      <table class="token-spec-table"><thead><tr><th>Token</th><th>Property</th><th>Value</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>
    </div>`
  }).join("\n")

  // ══════════════════════════════════════════════════════════════════
  // COMPONENT VARIANTS — Full state × size × theme matrix
  // ══════════════════════════════════════════════════════════════════

  const componentPreviews = `

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- CTA / BUTTONS — Variant × State × Size Matrix          -->
    <!-- ═══════════════════════════════════════════════════════ -->

    <div class="component-frame" data-component="CTA">
      <h3 class="component-name">CTA / Buttons</h3>
      <p class="component-desc">Call-to-action system with 5 variants, 5 states, 3 sizes. Icon is a swappable component slot.</p>

      <!-- Variant: Primary Solid -->
      <div class="variant-group" data-variant="Primary / Solid">
        <h4 class="variant-label">Primary / Solid</h4>

        <div class="state-row">
          <div class="state-item">
            <span class="state-label">Default</span>
            <button class="tp-btn tp-btn-primary tp-btn-md">${ICONS.plus}<span>Primary Action</span></button>
          </div>
          <div class="state-item">
            <span class="state-label">Hover</span>
            <button class="tp-btn tp-btn-primary tp-btn-md tp-btn-hover">${ICONS.plus}<span>Primary Action</span></button>
          </div>
          <div class="state-item">
            <span class="state-label">Focus</span>
            <button class="tp-btn tp-btn-primary tp-btn-md tp-btn-focus">${ICONS.plus}<span>Primary Action</span></button>
          </div>
          <div class="state-item">
            <span class="state-label">Loading</span>
            <button class="tp-btn tp-btn-primary tp-btn-md tp-btn-loading">${ICONS.loader}<span>Loading...</span></button>
          </div>
          <div class="state-item">
            <span class="state-label">Disabled</span>
            <button class="tp-btn tp-btn-disabled tp-btn-md">${ICONS.plus}<span>Disabled</span></button>
          </div>
        </div>

        <div class="size-row">
          <div class="size-item"><span class="size-label">SM — 32px</span><button class="tp-btn tp-btn-primary tp-btn-sm">${ICONS.plus}<span>Small</span></button></div>
          <div class="size-item"><span class="size-label">MD — 38px</span><button class="tp-btn tp-btn-primary tp-btn-md">${ICONS.plus}<span>Medium</span></button></div>
          <div class="size-item"><span class="size-label">LG — 44px</span><button class="tp-btn tp-btn-primary tp-btn-lg">${ICONS.plus}<span>Large</span></button></div>
        </div>

        ${tokenAnnotation("Primary CTA Tokens", [
          { name: "TP.cta.bg.primary.default", value: "#4B4AD5" },
          { name: "TP.cta.bg.primary.hover", value: "#3C3AB3" },
          { name: "TP.cta.text.primary", value: "#FFFFFF" },
          { name: "TP.cta.radius", value: "10px" },
          { name: "TP.cta.icon.size", value: "20px" },
        ])}
      </div>

      <!-- Variant: Outline -->
      <div class="variant-group" data-variant="Outline">
        <h4 class="variant-label">Outline</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Default</span><button class="tp-btn tp-btn-outline tp-btn-md">${ICONS.plus}<span>Outline</span></button></div>
          <div class="state-item"><span class="state-label">Hover</span><button class="tp-btn tp-btn-outline tp-btn-md tp-btn-outline-hover">${ICONS.plus}<span>Outline</span></button></div>
          <div class="state-item"><span class="state-label">Focus</span><button class="tp-btn tp-btn-outline tp-btn-md tp-btn-focus">${ICONS.plus}<span>Outline</span></button></div>
          <div class="state-item"><span class="state-label">Disabled</span><button class="tp-btn tp-btn-disabled-outline tp-btn-md"><span>Disabled</span></button></div>
        </div>
        ${tokenAnnotation("Outline CTA Tokens", [
          { name: "TP.cta.bg.outline.default", value: "transparent" },
          { name: "TP.cta.border.outline", value: "#4B4AD5" },
          { name: "TP.cta.bg.outline.hover", value: "#EEEEFF" },
        ])}
      </div>

      <!-- Variant: Ghost -->
      <div class="variant-group" data-variant="Ghost">
        <h4 class="variant-label">Ghost</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Default</span><button class="tp-btn tp-btn-ghost tp-btn-md"><span>Ghost</span></button></div>
          <div class="state-item"><span class="state-label">Hover</span><button class="tp-btn tp-btn-ghost tp-btn-md tp-btn-ghost-hover"><span>Ghost</span></button></div>
          <div class="state-item"><span class="state-label">Disabled</span><button class="tp-btn tp-btn-disabled tp-btn-md"><span>Disabled</span></button></div>
        </div>
        ${tokenAnnotation("Ghost CTA Tokens", [
          { name: "TP.cta.bg.ghost.default", value: "transparent" },
          { name: "TP.cta.text.ghost", value: "#4B4AD5" },
          { name: "TP.cta.bg.ghost.hover", value: "#EEEEFF" },
        ])}
      </div>

      <!-- Variant: Tonal -->
      <div class="variant-group" data-variant="Tonal">
        <h4 class="variant-label">Tonal</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Default</span><button class="tp-btn tp-btn-tonal tp-btn-md">${ICONS.plus}<span>Tonal</span></button></div>
          <div class="state-item"><span class="state-label">Hover</span><button class="tp-btn tp-btn-tonal tp-btn-md tp-btn-tonal-hover">${ICONS.plus}<span>Tonal</span></button></div>
          <div class="state-item"><span class="state-label">Disabled</span><button class="tp-btn tp-btn-disabled tp-btn-md"><span>Disabled</span></button></div>
        </div>
      </div>

      <!-- Variant: Neutral -->
      <div class="variant-group" data-variant="Neutral">
        <h4 class="variant-label">Neutral</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Default</span><button class="tp-btn tp-btn-neutral tp-btn-md"><span>Neutral</span></button></div>
          <div class="state-item"><span class="state-label">Hover</span><button class="tp-btn tp-btn-neutral tp-btn-md tp-btn-neutral-hover"><span>Neutral</span></button></div>
          <div class="state-item"><span class="state-label">Disabled</span><button class="tp-btn tp-btn-disabled tp-btn-md"><span>Disabled</span></button></div>
        </div>
      </div>

      <!-- Variant: Destructive -->
      <div class="variant-group" data-variant="Destructive">
        <h4 class="variant-label">Destructive / Error</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Default</span><button class="tp-btn tp-btn-danger tp-btn-md">${ICONS.x}<span>Delete</span></button></div>
          <div class="state-item"><span class="state-label">Hover</span><button class="tp-btn tp-btn-danger tp-btn-md tp-btn-danger-hover">${ICONS.x}<span>Delete</span></button></div>
          <div class="state-item"><span class="state-label">Disabled</span><button class="tp-btn tp-btn-disabled tp-btn-md"><span>Disabled</span></button></div>
        </div>
        ${tokenAnnotation("Destructive CTA Tokens", [
          { name: "TP.cta.bg.error.default", value: "#E11D48" },
          { name: "TP.cta.bg.error.hover", value: "#BE123C" },
          { name: "TP.cta.text.error", value: "#FFFFFF" },
        ])}
      </div>

      <!-- Icon-only & Split button -->
      <div class="variant-group" data-variant="Icon Only">
        <h4 class="variant-label">Icon-Only Buttons</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Primary</span><button class="tp-btn tp-btn-primary tp-btn-icon">${ICONS.plus}</button></div>
          <div class="state-item"><span class="state-label">Outline</span><button class="tp-btn tp-btn-outline tp-btn-icon">${ICONS.search}</button></div>
          <div class="state-item"><span class="state-label">Ghost</span><button class="tp-btn tp-btn-ghost tp-btn-icon">${ICONS.settings}</button></div>
          <div class="state-item"><span class="state-label">Neutral</span><button class="tp-btn tp-btn-neutral tp-btn-icon">${ICONS.x}</button></div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- INPUT FIELDS — State Matrix                             -->
    <!-- ═══════════════════════════════════════════════════════ -->

    <div class="component-frame" data-component="Input">
      <h3 class="component-name">Input Fields</h3>
      <p class="component-desc">Text input with label, helper text, icon slots. All states and sizes.</p>

      <div class="variant-group" data-variant="Text Input / States">
        <h4 class="variant-label">Text Input — All States</h4>
        <div class="input-grid">
          <div class="input-state-item" data-state="default">
            <label class="tp-label">Default</label>
            <div class="tp-input-wrap"><span class="tp-input-icon">${ICONS.search}</span><input class="tp-input" type="text" placeholder="Enter text..." /></div>
            <span class="tp-helper">Helper text</span>
          </div>
          <div class="input-state-item" data-state="hover">
            <label class="tp-label">Hover</label>
            <div class="tp-input-wrap tp-input-hover"><span class="tp-input-icon">${ICONS.search}</span><input class="tp-input" type="text" placeholder="Hover state" /></div>
          </div>
          <div class="input-state-item" data-state="focus">
            <label class="tp-label">Focus</label>
            <div class="tp-input-wrap tp-input-focus"><span class="tp-input-icon">${ICONS.search}</span><input class="tp-input" type="text" value="Focused input" /></div>
          </div>
          <div class="input-state-item" data-state="filled">
            <label class="tp-label">Filled</label>
            <div class="tp-input-wrap tp-input-filled"><span class="tp-input-icon">${ICONS.search}</span><input class="tp-input" type="text" value="Has value" /></div>
          </div>
          <div class="input-state-item" data-state="error">
            <label class="tp-label">Error</label>
            <div class="tp-input-wrap tp-input-error"><span class="tp-input-icon">${ICONS.alertCircle}</span><input class="tp-input" type="text" value="Invalid value" /></div>
            <span class="tp-helper tp-helper-error">This field is required</span>
          </div>
          <div class="input-state-item" data-state="success">
            <label class="tp-label">Success</label>
            <div class="tp-input-wrap tp-input-success"><span class="tp-input-icon">${ICONS.checkCircle}</span><input class="tp-input" type="text" value="Valid value" /></div>
            <span class="tp-helper tp-helper-success">Looks good!</span>
          </div>
          <div class="input-state-item" data-state="disabled">
            <label class="tp-label tp-label-disabled">Disabled</label>
            <div class="tp-input-wrap tp-input-disabled"><span class="tp-input-icon">${ICONS.search}</span><input class="tp-input" type="text" value="Disabled" disabled /></div>
          </div>
        </div>
        ${tokenAnnotation("Input Tokens", [
          { name: "TP.input.height.md", value: "42px" },
          { name: "TP.input.radius", value: "10px" },
          { name: "TP.input.border.default", value: "#E2E2EA" },
          { name: "TP.input.border.focus", value: "#4B4AD5" },
          { name: "TP.input.border.error", value: "#E11D48" },
          { name: "TP.input.icon.color", value: "#A2A2A8" },
        ])}
      </div>

      <div class="variant-group" data-variant="Text Input / Sizes">
        <h4 class="variant-label">Input Sizes</h4>
        <div class="input-grid">
          <div class="input-state-item"><label class="tp-label">Small — 36px</label><div class="tp-input-wrap tp-input-sm"><input class="tp-input" type="text" placeholder="Small input" /></div></div>
          <div class="input-state-item"><label class="tp-label">Medium — 42px</label><div class="tp-input-wrap"><input class="tp-input" type="text" placeholder="Medium input" /></div></div>
          <div class="input-state-item"><label class="tp-label">Large — 48px</label><div class="tp-input-wrap tp-input-lg"><input class="tp-input" type="text" placeholder="Large input" /></div></div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SELECTION CONTROLS — Checkbox, Radio, Switch             -->
    <!-- ═══════════════════════════════════════════════════════ -->

    <div class="component-frame" data-component="Selection Controls">
      <h3 class="component-name">Selection Controls</h3>
      <p class="component-desc">Checkbox, radio, and switch with all states.</p>

      <div class="variant-group" data-variant="Checkbox">
        <h4 class="variant-label">Checkbox</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Unchecked</span><div class="tp-checkbox"><div class="tp-checkbox-box"></div><span>Option</span></div></div>
          <div class="state-item"><span class="state-label">Checked</span><div class="tp-checkbox"><div class="tp-checkbox-box tp-checkbox-checked">${ICONS.check}</div><span>Selected</span></div></div>
          <div class="state-item"><span class="state-label">Indeterminate</span><div class="tp-checkbox"><div class="tp-checkbox-box tp-checkbox-indeterminate"><div class="tp-checkbox-dash"></div></div><span>Partial</span></div></div>
          <div class="state-item"><span class="state-label">Disabled</span><div class="tp-checkbox tp-checkbox-disabled"><div class="tp-checkbox-box tp-checkbox-box-disabled"></div><span>Disabled</span></div></div>
        </div>
      </div>

      <div class="variant-group" data-variant="Radio">
        <h4 class="variant-label">Radio Button</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Unselected</span><div class="tp-radio"><div class="tp-radio-circle"></div><span>Option A</span></div></div>
          <div class="state-item"><span class="state-label">Selected</span><div class="tp-radio"><div class="tp-radio-circle tp-radio-selected"><div class="tp-radio-dot"></div></div><span>Option B</span></div></div>
          <div class="state-item"><span class="state-label">Disabled</span><div class="tp-radio tp-radio-disabled"><div class="tp-radio-circle tp-radio-circle-disabled"></div><span>Disabled</span></div></div>
        </div>
      </div>

      <div class="variant-group" data-variant="Switch">
        <h4 class="variant-label">Toggle Switch</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Off</span><div class="tp-switch tp-switch-off"><div class="tp-switch-thumb"></div></div></div>
          <div class="state-item"><span class="state-label">On</span><div class="tp-switch tp-switch-on"><div class="tp-switch-thumb"></div></div></div>
          <div class="state-item"><span class="state-label">Off (Disabled)</span><div class="tp-switch tp-switch-off tp-switch-disabled"><div class="tp-switch-thumb"></div></div></div>
          <div class="state-item"><span class="state-label">On (Disabled)</span><div class="tp-switch tp-switch-on tp-switch-disabled"><div class="tp-switch-thumb"></div></div></div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- FEEDBACK — Alerts, Toasts, Banners                      -->
    <!-- ═══════════════════════════════════════════════════════ -->

    <div class="component-frame" data-component="Feedback">
      <h3 class="component-name">Feedback & Alerts</h3>
      <p class="component-desc">Alert variants for all semantic statuses. Icon slot is swappable.</p>

      <div class="variant-group" data-variant="Alert">
        <h4 class="variant-label">Alerts</h4>
        <div class="component-col">
          <div class="tp-alert tp-alert-info"><span class="tp-alert-icon">${ICONS.info}</span><div class="tp-alert-content"><strong>Information</strong><p>This is an informational alert with details.</p></div><button class="tp-alert-close">${ICONS.x}</button></div>
          <div class="tp-alert tp-alert-success"><span class="tp-alert-icon">${ICONS.checkCircle}</span><div class="tp-alert-content"><strong>Success</strong><p>Operation completed successfully!</p></div><button class="tp-alert-close">${ICONS.x}</button></div>
          <div class="tp-alert tp-alert-warning"><span class="tp-alert-icon">${ICONS.alertTriangle}</span><div class="tp-alert-content"><strong>Warning</strong><p>Please review before proceeding.</p></div><button class="tp-alert-close">${ICONS.x}</button></div>
          <div class="tp-alert tp-alert-error"><span class="tp-alert-icon">${ICONS.alertCircle}</span><div class="tp-alert-content"><strong>Error</strong><p>An error occurred. Please try again.</p></div><button class="tp-alert-close">${ICONS.x}</button></div>
        </div>
        ${tokenAnnotation("Alert Tokens", [
          { name: "TP.alert.info.bg", value: "#EEEEFF" },
          { name: "TP.alert.success.bg", value: "#ECFDF5" },
          { name: "TP.alert.warning.bg", value: "#FFFBEB" },
          { name: "TP.alert.error.bg", value: "#FFF1F2" },
        ])}
      </div>

      <div class="variant-group" data-variant="Toast">
        <h4 class="variant-label">Toast / Snackbar</h4>
        <div class="component-col">
          <div class="tp-toast tp-toast-dark"><span class="tp-toast-icon">${ICONS.info}</span><span>Notification message</span><button class="tp-toast-close">${ICONS.x}</button></div>
          <div class="tp-toast tp-toast-success"><span class="tp-toast-icon">${ICONS.checkCircle}</span><span>Changes saved successfully</span><button class="tp-toast-close">${ICONS.x}</button></div>
          <div class="tp-toast tp-toast-error"><span class="tp-toast-icon">${ICONS.alertCircle}</span><span>Failed to save changes</span><button class="tp-toast-close">${ICONS.x}</button></div>
        </div>
      </div>

      <div class="variant-group" data-variant="Progress">
        <h4 class="variant-label">Progress Bar</h4>
        <div class="component-col" style="gap:16px;">
          <div><span class="progress-label">25%</span><div class="tp-progress"><div class="tp-progress-fill" style="width:25%;"></div></div></div>
          <div><span class="progress-label">50%</span><div class="tp-progress"><div class="tp-progress-fill" style="width:50%;"></div></div></div>
          <div><span class="progress-label">75% (Warning)</span><div class="tp-progress"><div class="tp-progress-fill tp-progress-warning" style="width:75%;"></div></div></div>
          <div><span class="progress-label">100% (Success)</span><div class="tp-progress"><div class="tp-progress-fill tp-progress-success" style="width:100%;"></div></div></div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- DATA DISPLAY — Tags, Badges, Avatars, Cards, Tooltips  -->
    <!-- ═══════════════════════════════════════════════════════ -->

    <div class="component-frame" data-component="Data Display">
      <h3 class="component-name">Data Display</h3>

      <div class="variant-group" data-variant="Tags / Chips">
        <h4 class="variant-label">Tags & Chips</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Default</span><span class="tp-tag tp-tag-default">Default<button class="tp-tag-close">${ICONS.x}</button></span></div>
          <div class="state-item"><span class="state-label">Primary</span><span class="tp-tag tp-tag-primary">Primary<button class="tp-tag-close">${ICONS.x}</button></span></div>
          <div class="state-item"><span class="state-label">Success</span><span class="tp-tag tp-tag-success">Success<button class="tp-tag-close">${ICONS.x}</button></span></div>
          <div class="state-item"><span class="state-label">Warning</span><span class="tp-tag tp-tag-warning">Warning<button class="tp-tag-close">${ICONS.x}</button></span></div>
          <div class="state-item"><span class="state-label">Error</span><span class="tp-tag tp-tag-error">Error<button class="tp-tag-close">${ICONS.x}</button></span></div>
        </div>
      </div>

      <div class="variant-group" data-variant="Badges">
        <h4 class="variant-label">Badges</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Primary</span><span class="tp-badge-pill tp-badge-primary">New</span></div>
          <div class="state-item"><span class="state-label">Success</span><span class="tp-badge-pill tp-badge-success">Active</span></div>
          <div class="state-item"><span class="state-label">Warning</span><span class="tp-badge-pill tp-badge-warning">Pending</span></div>
          <div class="state-item"><span class="state-label">Error</span><span class="tp-badge-pill tp-badge-error">Urgent</span></div>
          <div class="state-item"><span class="state-label">Neutral</span><span class="tp-badge-pill tp-badge-neutral">Draft</span></div>
        </div>
      </div>

      <div class="variant-group" data-variant="Avatars">
        <h4 class="variant-label">Avatars — Sizes & Statuses</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">SM (32px)</span><div class="tp-avatar tp-avatar-sm">JD</div></div>
          <div class="state-item"><span class="state-label">MD (40px)</span><div class="tp-avatar tp-avatar-md">AB</div></div>
          <div class="state-item"><span class="state-label">LG (48px)</span><div class="tp-avatar tp-avatar-lg">CD</div></div>
          <div class="state-item"><span class="state-label">XL (64px)</span><div class="tp-avatar tp-avatar-xl">EF</div></div>
          <div class="state-item"><span class="state-label">With Status</span><div class="tp-avatar-wrap"><div class="tp-avatar tp-avatar-md">GH</div><span class="tp-avatar-status tp-status-online"></span></div></div>
          <div class="state-item"><span class="state-label">Busy</span><div class="tp-avatar-wrap"><div class="tp-avatar tp-avatar-md tp-avatar-blue">IJ</div><span class="tp-avatar-status tp-status-busy"></span></div></div>
        </div>
      </div>

      <div class="variant-group" data-variant="Card">
        <h4 class="variant-label">Card Variants</h4>
        <div class="card-grid">
          <div class="tp-card">
            <div class="tp-card-header">Standard Card</div>
            <div class="tp-card-content">Card content with example text. Components use TP design tokens.</div>
            <div class="tp-card-actions"><button class="tp-btn tp-btn-ghost tp-btn-sm"><span>Cancel</span></button><button class="tp-btn tp-btn-primary tp-btn-sm"><span>Action</span></button></div>
          </div>
          <div class="tp-card tp-card-elevated">
            <div class="tp-card-header">Elevated Card</div>
            <div class="tp-card-content">Higher elevation shadow for prominent content.</div>
          </div>
        </div>
        ${tokenAnnotation("Card Tokens", [
          { name: "TP.card.bg", value: "#FFFFFF" },
          { name: "TP.card.border", value: "#E2E2EA" },
          { name: "TP.card.radius", value: "16px" },
          { name: "TP.card.padding", value: "18px" },
          { name: "TP.card.shadow", value: "TP.shadow.sm" },
        ])}
      </div>

      <div class="variant-group" data-variant="Rating">
        <h4 class="variant-label">Rating</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">3 of 5</span><div class="tp-rating"><span class="tp-star-filled">${ICONS.star}</span><span class="tp-star-filled">${ICONS.star}</span><span class="tp-star-filled">${ICONS.star}</span><span class="tp-star-empty">${ICONS.starEmpty}</span><span class="tp-star-empty">${ICONS.starEmpty}</span></div></div>
        </div>
      </div>

      <div class="variant-group" data-variant="Tooltip">
        <h4 class="variant-label">Tooltip</h4>
        <div class="state-row">
          <div class="state-item"><span class="state-label">Dark (default)</span><div class="tp-tooltip">Tooltip message<div class="tp-tooltip-arrow"></div></div></div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- NAVIGATION — Tabs, Sidebar, Breadcrumbs, Pagination     -->
    <!-- ═══════════════════════════════════════════════════════ -->

    <div class="component-frame" data-component="Navigation">
      <h3 class="component-name">Navigation</h3>

      <div class="variant-group" data-variant="Tabs">
        <h4 class="variant-label">Tabs</h4>
        <div class="tp-tabs"><button class="tp-tab tp-tab-active">Overview</button><button class="tp-tab">Activity</button><button class="tp-tab">Settings</button><button class="tp-tab tp-tab-disabled">Archived</button></div>
      </div>

      <div class="variant-group" data-variant="Breadcrumbs">
        <h4 class="variant-label">Breadcrumbs</h4>
        <nav class="tp-breadcrumb"><a class="tp-breadcrumb-link">Home</a><span class="tp-breadcrumb-sep">/</span><a class="tp-breadcrumb-link">Patients</a><span class="tp-breadcrumb-sep">/</span><span class="tp-breadcrumb-current">John Doe</span></nav>
      </div>

      <div class="variant-group" data-variant="Sidebar Item">
        <h4 class="variant-label">Sidebar Navigation Items</h4>
        <div class="tp-sidebar-demo">
          <div class="tp-sidebar-item tp-sidebar-active">${ICONS.home}<span>Dashboard</span></div>
          <div class="tp-sidebar-item">${ICONS.user}<span>Patients</span></div>
          <div class="tp-sidebar-item">${ICONS.settings}<span>Settings</span></div>
        </div>
        ${tokenAnnotation("Sidebar Tokens", [
          { name: "TP.sidebar.item.text.active", value: "#4B4AD5" },
          { name: "TP.sidebar.item.bg.active", value: "#EEEEFF" },
          { name: "TP.sidebar.item.radius", value: "8px" },
        ])}
      </div>

      <div class="variant-group" data-variant="Pagination">
        <h4 class="variant-label">Pagination</h4>
        <div class="tp-pagination">
          <button class="tp-page-btn">&lt;</button>
          <button class="tp-page-btn">1</button>
          <button class="tp-page-btn tp-page-active">2</button>
          <button class="tp-page-btn">3</button>
          <button class="tp-page-btn">...</button>
          <button class="tp-page-btn">10</button>
          <button class="tp-page-btn">&gt;</button>
        </div>
      </div>
    </div>
  `

  // ══════════════════════════════════════════════════════════════════
  // FULL HTML DOCUMENT
  // ══════════════════════════════════════════════════════════════════

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TatvaPractice Design System v${SYSTEM_VERSION}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Mulish:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --tp-blue-50: #EEEEFF; --tp-blue-100: #D8D8FA; --tp-blue-200: #B5B5F0;
      --tp-blue-500: #4B4AD5; --tp-blue-600: #3C3BB5; --tp-blue-700: #2D2D80;
      --tp-violet-50: #FAF5FE; --tp-violet-500: #A461D8;
      --tp-slate-50: #FAFAFB; --tp-slate-100: #F1F1F5; --tp-slate-200: #E2E2EA;
      --tp-slate-300: #D0D5DD; --tp-slate-400: #A2A2A8; --tp-slate-500: #717179;
      --tp-slate-600: #515158; --tp-slate-700: #3A3A42; --tp-slate-800: #2B2B35;
      --tp-slate-900: #171725;
      --tp-success-50: #ECFDF5; --tp-success-500: #10B981; --tp-success-600: #059669; --tp-success-700: #047857;
      --tp-warning-50: #FFFBEB; --tp-warning-500: #F59E0B; --tp-warning-600: #D97706;
      --tp-error-50: #FFF1F2; --tp-error-500: #E11D48; --tp-error-600: #BE123C; --tp-error-700: #9F1239;
      ${semanticCss.join("\n")}
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #F1F1F5; color: #171725; padding: 32px; line-height: 1.5; }

    /* ── Page Layout ── */
    .page-header { text-align: center; margin-bottom: 40px; padding: 32px; background: white; border-radius: 20px; box-shadow: 0 1px 3px rgba(23,23,37,0.06); }
    .page-header h1 { font-family: 'Mulish', sans-serif; font-size: 28px; font-weight: 700; color: #171725; }
    .page-header p { font-size: 14px; color: #717179; margin-top: 6px; }
    .page-header .version-badge { display: inline-block; margin-top: 8px; padding: 4px 12px; background: #EEEEFF; color: #4B4AD5; border-radius: 20px; font-size: 12px; font-weight: 600; }

    .section { margin-bottom: 48px; }
    .section-title { font-family: 'Mulish', sans-serif; font-size: 22px; font-weight: 700; color: #171725; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #E2E2EA; }
    .section-subtitle { font-size: 13px; font-weight: 600; color: #515158; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-desc { font-size: 13px; color: #717179; margin-bottom: 16px; }

    /* ── Color Swatches ── */
    .color-group { margin-bottom: 20px; }
    .swatch-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .swatch { width: 96px; }
    .swatch-color { width: 96px; height: 56px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.06); }
    .swatch-info { margin-top: 4px; }
    .swatch-token { display: block; font-size: 10px; font-weight: 600; color: #3A3A42; }
    .swatch-value { display: block; font-size: 10px; color: #A2A2A8; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }

    /* ── Typography ── */
    .type-sample { margin-bottom: 16px; padding: 12px 16px; background: white; border-radius: 10px; border: 1px solid #E2E2EA; }
    .type-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 4px; }
    .type-label { font-size: 11px; font-weight: 600; color: #4B4AD5; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }
    .type-meta { font-size: 10px; color: #A2A2A8; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }
    .type-text { color: #171725; }

    /* ── Component Frame ── */
    .component-frame { margin-bottom: 40px; padding: 28px; background: white; border-radius: 16px; border: 1px solid #E2E2EA; box-shadow: 0 1px 3px rgba(23,23,37,0.06); }
    .component-name { font-family: 'Mulish', sans-serif; font-size: 18px; font-weight: 700; color: #171725; margin-bottom: 4px; }
    .component-desc { font-size: 13px; color: #717179; margin-bottom: 20px; }

    /* ── Variant Groups ── */
    .variant-group { margin-bottom: 24px; padding: 20px; background: #FAFAFB; border: 1px solid #F1F1F5; border-radius: 12px; }
    .variant-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #4B4AD5; margin-bottom: 16px; }

    /* ── State & Size Rows ── */
    .state-row { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
    .state-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .state-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #A2A2A8; }
    .size-row { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px dashed #E2E2EA; }
    .size-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .size-label { font-size: 10px; font-weight: 600; color: #A2A2A8; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }

    /* ── Token Annotations ── */
    .token-annotation { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #E2E2EA; }
    .token-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #A2A2A8; display: block; margin-bottom: 6px; }
    .token-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .token-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: #EEEEFF; border-radius: 4px; font-size: 10px; }
    .token-name { font-weight: 600; color: #4B4AD5; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }
    .token-val { color: #717179; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }

    .component-col { display: flex; flex-direction: column; gap: 12px; }

    /* ═══ BUTTONS ═══ */
    .tp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; border: none; cursor: pointer; border-radius: 10px; transition: all 0.15s; white-space: nowrap; }
    .tp-btn svg { flex-shrink: 0; }
    .tp-btn-sm { height: 32px; padding: 0 10px; font-size: 13px; }
    .tp-btn-md { height: 38px; padding: 0 14px; }
    .tp-btn-lg { height: 44px; padding: 0 18px; font-size: 15px; }
    .tp-btn-icon { width: 38px; height: 38px; padding: 0; }
    .tp-btn-primary { background: #4B4AD5; color: white; }
    .tp-btn-primary.tp-btn-hover { background: #3C3AB3; }
    .tp-btn-primary.tp-btn-focus { background: #4B4AD5; box-shadow: 0 0 0 4px rgba(75,74,213,0.15); }
    .tp-btn-primary.tp-btn-loading { background: #4B4AD5; opacity: 0.7; }
    .tp-btn-outline { background: transparent; color: #4B4AD5; border: 1.5px solid #4B4AD5; }
    .tp-btn-outline.tp-btn-outline-hover { background: #EEEEFF; }
    .tp-btn-outline.tp-btn-focus { box-shadow: 0 0 0 4px rgba(75,74,213,0.15); }
    .tp-btn-ghost { background: transparent; color: #4B4AD5; }
    .tp-btn-ghost.tp-btn-ghost-hover { background: #EEEEFF; }
    .tp-btn-tonal { background: #EEEEFF; color: #4B4AD5; }
    .tp-btn-tonal.tp-btn-tonal-hover { background: #D8D8FA; }
    .tp-btn-neutral { background: #F1F1F5; color: #454551; }
    .tp-btn-neutral.tp-btn-neutral-hover { background: #E2E2EA; }
    .tp-btn-danger { background: #E11D48; color: white; }
    .tp-btn-danger.tp-btn-danger-hover { background: #BE123C; }
    .tp-btn-disabled { background: #E2E2EA; color: #A2A2A8; cursor: not-allowed; }
    .tp-btn-disabled-outline { background: transparent; color: #A2A2A8; border: 1.5px solid #E2E2EA; cursor: not-allowed; }

    /* ═══ INPUTS ═══ */
    .input-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .input-state-item { display: flex; flex-direction: column; gap: 4px; }
    .tp-label { font-size: 13px; font-weight: 600; color: #3A3A42; }
    .tp-label-disabled { color: #A2A2A8; }
    .tp-input-wrap { display: flex; align-items: center; gap: 8px; height: 42px; padding: 0 12px; background: white; border: 1px solid #E2E2EA; border-radius: 10px; }
    .tp-input-wrap.tp-input-sm { height: 36px; }
    .tp-input-wrap.tp-input-lg { height: 48px; }
    .tp-input-icon { color: #A2A2A8; flex-shrink: 0; display: flex; }
    .tp-input { border: none; outline: none; flex: 1; font-family: 'Inter', sans-serif; font-size: 14px; color: #171725; background: transparent; width: 100%; }
    .tp-input-hover { border-color: #D0D5DD; }
    .tp-input-focus { border: 2px solid #4B4AD5; box-shadow: 0 0 0 3px rgba(75,74,213,0.08); padding: 0 11px; }
    .tp-input-filled { border-color: #A2A2A8; background: #F8F8FC; }
    .tp-input-error { border: 2px solid #E11D48; box-shadow: 0 0 0 3px rgba(225,29,72,0.08); padding: 0 11px; }
    .tp-input-error .tp-input-icon { color: #E11D48; }
    .tp-input-success { border: 2px solid #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); padding: 0 11px; }
    .tp-input-success .tp-input-icon { color: #10B981; }
    .tp-input-disabled { background: #F8F8FC; border-color: #F1F1F5; }
    .tp-input-disabled .tp-input { color: #A2A2A8; }
    .tp-helper { font-size: 12px; color: #717179; }
    .tp-helper-error { color: #E11D48; }
    .tp-helper-success { color: #10B981; }

    /* ═══ SELECTION CONTROLS ═══ */
    .tp-checkbox, .tp-radio { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #3A3A42; }
    .tp-checkbox-disabled, .tp-radio-disabled { color: #A2A2A8; }
    .tp-checkbox-box { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #D0D5DD; display: flex; align-items: center; justify-content: center; }
    .tp-checkbox-checked { background: #4B4AD5; border-color: #4B4AD5; color: white; }
    .tp-checkbox-indeterminate { background: #4B4AD5; border-color: #4B4AD5; }
    .tp-checkbox-dash { width: 10px; height: 2px; background: white; border-radius: 1px; }
    .tp-checkbox-box-disabled { border-color: #E2E2EA; background: #F1F1F5; }
    .tp-radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #D0D5DD; display: flex; align-items: center; justify-content: center; }
    .tp-radio-selected { border-color: #4B4AD5; }
    .tp-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #4B4AD5; }
    .tp-radio-circle-disabled { border-color: #E2E2EA; background: #F1F1F5; }
    .tp-switch { width: 44px; height: 24px; border-radius: 12px; position: relative; cursor: pointer; }
    .tp-switch-off { background: #D0D5DD; }
    .tp-switch-on { background: #4B4AD5; }
    .tp-switch-disabled { opacity: 0.5; cursor: not-allowed; }
    .tp-switch-thumb { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .tp-switch-off .tp-switch-thumb { left: 3px; }
    .tp-switch-on .tp-switch-thumb { left: 23px; }

    /* ═══ ALERTS & TOASTS ═══ */
    .tp-alert { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 12px; font-size: 14px; }
    .tp-alert-icon { flex-shrink: 0; display: flex; margin-top: 1px; }
    .tp-alert-content { flex: 1; }
    .tp-alert-content strong { display: block; font-weight: 600; margin-bottom: 2px; }
    .tp-alert-content p { font-size: 13px; opacity: 0.85; }
    .tp-alert-close { background: none; border: none; cursor: pointer; opacity: 0.5; flex-shrink: 0; display: flex; }
    .tp-alert-info { background: #EEEEFF; color: #2D2D80; }
    .tp-alert-info .tp-alert-icon { color: #4B4AD5; }
    .tp-alert-success { background: #ECFDF5; color: #065F46; }
    .tp-alert-success .tp-alert-icon { color: #059669; }
    .tp-alert-warning { background: #FFFBEB; color: #92400E; }
    .tp-alert-warning .tp-alert-icon { color: #D97706; }
    .tp-alert-error { background: #FFF1F2; color: #9F1239; }
    .tp-alert-error .tp-alert-icon { color: #E11D48; }

    .tp-toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; max-width: 400px; }
    .tp-toast-icon { flex-shrink: 0; display: flex; }
    .tp-toast-close { background: none; border: none; cursor: pointer; opacity: 0.6; flex-shrink: 0; margin-left: auto; display: flex; }
    .tp-toast-dark { background: #171725; color: white; box-shadow: 0 12px 24px rgba(23,23,37,0.15); }
    .tp-toast-dark .tp-toast-icon { color: rgba(255,255,255,0.7); }
    .tp-toast-dark .tp-toast-close { color: white; }
    .tp-toast-success { background: #059669; color: white; }
    .tp-toast-success .tp-toast-close { color: white; }
    .tp-toast-error { background: #E11D48; color: white; }
    .tp-toast-error .tp-toast-close { color: white; }

    .tp-progress { height: 8px; background: #F1F1F5; border-radius: 9999px; overflow: hidden; }
    .tp-progress-fill { height: 100%; background: #4B4AD5; border-radius: 9999px; }
    .tp-progress-warning { background: #F59E0B; }
    .tp-progress-success { background: #10B981; }
    .progress-label { font-size: 11px; font-weight: 600; color: #717179; margin-bottom: 4px; display: block; }

    /* ═══ TAGS & BADGES ═══ */
    .tp-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 12px; font-weight: 500; border-radius: 6px; }
    .tp-tag-close { background: none; border: none; cursor: pointer; opacity: 0.5; display: flex; padding: 0; }
    .tp-tag-close svg { width: 12px; height: 12px; }
    .tp-tag-default { background: #F1F1F5; color: #515158; }
    .tp-tag-primary { background: #EEEEFF; color: #4B4AD5; }
    .tp-tag-success { background: #ECFDF5; color: #059669; }
    .tp-tag-warning { background: #FFFBEB; color: #D97706; }
    .tp-tag-error { background: #FFF1F2; color: #E11D48; }

    .tp-badge-pill { display: inline-flex; padding: 3px 10px; font-size: 11px; font-weight: 600; border-radius: 9999px; }
    .tp-badge-primary { background: #EEEEFF; color: #4B4AD5; }
    .tp-badge-success { background: #ECFDF5; color: #059669; }
    .tp-badge-warning { background: #FFFBEB; color: #D97706; }
    .tp-badge-error { background: #FFF1F2; color: #E11D48; }
    .tp-badge-neutral { background: #F1F1F5; color: #515158; }

    /* ═══ AVATARS ═══ */
    .tp-avatar { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #4B4AD5; background: #EEEEFF; }
    .tp-avatar-sm { width: 32px; height: 32px; font-size: 12px; }
    .tp-avatar-md { width: 40px; height: 40px; font-size: 14px; }
    .tp-avatar-lg { width: 48px; height: 48px; font-size: 16px; }
    .tp-avatar-xl { width: 64px; height: 64px; font-size: 20px; }
    .tp-avatar-blue { color: white; background: #4B4AD5; }
    .tp-avatar-wrap { position: relative; display: inline-flex; }
    .tp-avatar-status { position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; }
    .tp-status-online { background: #10B981; }
    .tp-status-busy { background: #E11D48; }

    /* ═══ CARDS ═══ */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .tp-card { background: white; border-radius: 16px; border: 1px solid #E2E2EA; box-shadow: 0 1px 3px rgba(23,23,37,0.06); overflow: hidden; }
    .tp-card-elevated { box-shadow: 0 4px 8px rgba(23,23,37,0.08), 0 2px 4px rgba(23,23,37,0.06); }
    .tp-card-header { padding: 16px 18px 0; font-size: 16px; font-weight: 600; color: #171725; }
    .tp-card-content { padding: 10px 18px; font-size: 14px; color: #515158; line-height: 1.6; }
    .tp-card-actions { padding: 8px 18px 16px; display: flex; gap: 8px; justify-content: flex-end; }

    /* ═══ RATING ═══ */
    .tp-rating { display: flex; gap: 2px; }
    .tp-star-filled { color: #F59E0B; display: flex; }
    .tp-star-empty { color: #E2E2EA; display: flex; }

    /* ═══ TOOLTIP ═══ */
    .tp-tooltip { position: relative; display: inline-block; background: #171725; color: white; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 8px; }
    .tp-tooltip-arrow { position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: #171725; transform: translateX(-50%) rotate(45deg); }

    /* ═══ NAVIGATION ═══ */
    .tp-tabs { display: flex; gap: 0; border-bottom: 2px solid #E2E2EA; }
    .tp-tab { padding: 10px 16px; font-size: 14px; font-weight: 500; color: #717179; background: none; border: none; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    .tp-tab-active { color: #4B4AD5; border-bottom-color: #4B4AD5; font-weight: 600; }
    .tp-tab-disabled { color: #A2A2A8; cursor: not-allowed; }

    .tp-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .tp-breadcrumb-link { color: #717179; text-decoration: none; cursor: pointer; }
    .tp-breadcrumb-sep { color: #A2A2A8; }
    .tp-breadcrumb-current { color: #171725; font-weight: 600; }

    .tp-sidebar-demo { display: flex; flex-direction: column; gap: 4px; max-width: 240px; }
    .tp-sidebar-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #717179; cursor: pointer; }
    .tp-sidebar-item svg { flex-shrink: 0; }
    .tp-sidebar-active { background: #EEEEFF; color: #4B4AD5; font-weight: 600; }

    .tp-pagination { display: flex; gap: 4px; }
    .tp-page-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #E2E2EA; background: white; font-size: 14px; font-weight: 500; color: #515158; cursor: pointer; }
    .tp-page-active { background: #4B4AD5; color: white; border-color: #4B4AD5; }

    /* ═══ TOKEN SPEC TABLES ═══ */
    .token-spec-section { margin-bottom: 32px; }
    .token-spec-table { width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #E2E2EA; border-radius: 8px; overflow: hidden; }
    .token-spec-table th { background: #FAFAFB; padding: 8px 12px; text-align: left; font-weight: 600; color: #515158; border-bottom: 1px solid #E2E2EA; }
    .token-spec-table td { padding: 6px 12px; border-bottom: 1px solid #F1F1F5; color: #3A3A42; }
    .spec-token { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-weight: 600; color: #4B4AD5; white-space: nowrap; }
    .spec-prop { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; color: #717179; white-space: nowrap; }
    .spec-value { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; color: #3A3A42; }
    .spec-desc { color: #717179; }
  </style>
</head>
<body>

  <div class="page-header">
    <h1>TatvaPractice Design System</h1>
    <p>Variant-aware component library for Figma import via html.to.design</p>
    <span class="version-badge">v${SYSTEM_VERSION} — ${allComponentTokenGroups.reduce((a, g) => a + g.tokens.length, 0)}+ design tokens</span>
  </div>

  <!-- ═══ COLOR PALETTE ═══ -->
  <div class="section">
    <h2 class="section-title">Color Palette</h2>
    ${colorHtml}
  </div>

  <!-- ═══ TYPOGRAPHY ═══ -->
  <div class="section">
    <h2 class="section-title">Typography Scale</h2>
    ${typographyHtml}
  </div>

  <!-- ═══ COMPONENTS ═══ -->
  <div class="section">
    <h2 class="section-title">Components — Variant × State Matrix</h2>
    ${componentPreviews}
  </div>

  <!-- ═══ TOKEN SPECIFICATIONS ═══ -->
  <div class="section">
    <h2 class="section-title">Design Token Specifications</h2>
    ${tokenSpecHtml}
  </div>

</body>
</html>`
}

function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportFigmaHtml() {
  const html = buildHtml()
  downloadHtml(html, `tatvapractice-figma-preview-v${SYSTEM_VERSION}.html`)
}
