"use client"

// ─── TatvaPractice Design System v2.0.0: Comprehensive Figma Export ───
// Generates four industry-standard token formats:
//   1. Complete Library (single unified JSON — everything in one file)
//   2. Tokens Studio for Figma (JSON) — most popular plugin
//   3. Figma Variables REST API format (JSON)
//   4. Style Dictionary (JSON) — universal, convertible

import {
  designTokens,
  gradients,
  semanticTokens,
  typographyScale,
  spacingScale,
  gridSystem,
  shadowScale,
  radiusScale,
  sizingScale,
  opacityScale,
  ctaSizes,
  ctaVariants,
  fontSizeScale,
  fontWeightScale,
  letterSpacingScale,
  textCaseOptions,
  textDecorationOptions,
  paragraphSpacingScale,
  borderWidthScale,
  noiseTexture,
  type ColorGroup,
  type FunctionalGroup,
} from "./design-tokens"

const SYSTEM_VERSION = "2.2.0"
const SYSTEM_NAME = "TatvaPractice Design System"

// ─── HELPERS ───

function download(data: object, filename: string) {
  const str =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(data, null, 2))
  const a = document.createElement("a")
  a.setAttribute("href", str)
  a.setAttribute("download", filename)
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const clean = hex.replace("#", "")
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
    a: 1,
  }
}

function iterateColorGroups(
  cb: (slug: string, groupName: string, colors: { token: string | number; value: string; usage?: string }[]) => void
) {
  Object.entries(designTokens).forEach(([key, group]) => {
    if ("subgroups" in group) {
      const fg = group as FunctionalGroup
      fg.subgroups.forEach((sub) => {
        const slug = sub.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")
        cb(slug, sub.name, sub.colors)
      })
    } else {
      const cg = group as ColorGroup
      cb(key, cg.name, cg.colors)
    }
  })
}

// ────────────────────────────────────────────────────
// FORMAT 0: COMPLETE LIBRARY (single unified JSON)
// Everything in one file — primitives, semantic, typography,
// spacing, radius, shadows, gradients, grid, CTA specs,
// plus all three export sub-formats embedded.
// ────────────────────────────────────────────────────

function buildCompleteLibrary(): object {
  // Primitives
  const primitives: Record<string, unknown> = {}
  iterateColorGroups((slug, _name, colors) => {
    const obj: Record<string, { value: string; description: string }> = {}
    colors.forEach((c) => {
      obj[String(c.token)] = { value: c.value, description: c.usage || "" }
    })
    primitives[slug] = obj
  })

  // Semantic
  const semantic: Record<string, unknown> = {}
  Object.entries(semanticTokens).forEach(([catKey, category]) => {
    const groups: Record<string, unknown> = {}
    category.groups.forEach((group) => {
      const tokens: Record<string, unknown> = {}
      group.tokens.forEach((t) => {
        tokens[t.token] = {
          value: t.value,
          source: t.source,
          usage: t.usage,
        }
      })
      groups[group.name] = tokens
    })
    semantic[catKey] = {
      name: category.name,
      description: category.description,
      groups,
    }
  })

  // Typography
  const typography: Record<string, unknown> = {
    styles: {} as Record<string, unknown>,
    fontSizes: fontSizeScale,
    fontWeights: fontWeightScale,
    letterSpacings: letterSpacingScale,
    textCases: textCaseOptions,
    textDecorations: textDecorationOptions,
    paragraphSpacings: paragraphSpacingScale,
  }
  typographyScale.forEach((t) => {
    const slug = t.name.toLowerCase().replace(/\s+/g, "-")
    ;(typography.styles as Record<string, unknown>)[slug] = {
      fontFamily: t.fontFamily,
      fontWeight: t.weight,
      fontSize: t.size,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      paragraphSpacing: t.paragraphSpacing,
      textCase: t.textCase,
      textDecoration: t.textDecoration,
      element: t.element,
      usage: t.usage,
    }
  })

  // Spacing
  const spacing: Record<string, unknown> = {}
  spacingScale.forEach((s) => {
    spacing[s.token] = { value: `${s.px}px`, px: s.px, usage: s.usage }
  })

  // Radius
  const radius: Record<string, unknown> = {}
  radiusScale.forEach((r) => {
    radius[r.token] = { value: `${r.px}px`, px: r.px, usage: r.usage }
  })

  // Shadows
  const shadows: Record<string, unknown> = {}
  shadowScale.forEach((s) => {
    shadows[s.token] = {
      css: s.css,
      x: s.x, y: s.y, blur: s.blur, spread: s.spread,
      color: s.color,
      usage: s.usage,
    }
  })

  // Gradients
  const grads: Record<string, unknown> = {}
  Object.entries(gradients).forEach(([key, g]) => {
    grads[key] = {
      name: g.name,
      description: g.description,
      stops: g.stops,
      variants: g.variants,
    }
  })

  // Grid
  const grid: Record<string, unknown> = {}
  gridSystem.forEach((g) => {
    const slug = g.breakpoint.split(" ")[0].toLowerCase()
    grid[slug] = {
      breakpoint: g.breakpoint,
      columns: g.columns,
      margin: g.margin,
      gutter: g.gutter,
      usage: g.usage,
    }
  })

  // CTA Specs
  const ctaSpecs: Record<string, unknown> = {
    sizes: {} as Record<string, unknown>,
    variants: {} as Record<string, unknown>,
    shared: {
      radius: "12px",
      fontFamily: "Inter",
      fontWeight: "600",
      fontSize: "14px",
      lineHeight: "20px",
    },
  }
  ctaSizes.forEach((s) => {
    (ctaSpecs.sizes as Record<string, unknown>)[s.token] = {
      height: `${s.height}px`,
      iconSize: `${s.iconSize}px`,
      paddingX: `${s.paddingX}px`,
      usage: s.usage,
    }
  })
  ctaVariants.forEach((v) => {
    (ctaSpecs.variants as Record<string, unknown>)[v.name.toLowerCase()] = {
      description: v.description,
      onLight: v.onLight,
      onDark: v.onDark,
    }
  })

  // Sizing
  const sizing: Record<string, unknown> = {}
  sizingScale.forEach((s) => {
    sizing[s.token] = { value: `${s.px}px`, px: s.px, usage: s.usage }
  })

  // Opacity (white & black overlays)
  const opacity: Record<string, unknown> = {
    white: {} as Record<string, unknown>,
    black: {} as Record<string, unknown>,
  }
  opacityScale.forEach((o) => {
    ;(opacity.white as Record<string, unknown>)[o.token] = {
      value: `rgba(255,255,255,${o.decimal})`,
      percent: o.percent,
      decimal: o.decimal,
    }
    ;(opacity.black as Record<string, unknown>)[o.token] = {
      value: `rgba(0,0,0,${o.decimal})`,
      percent: o.percent,
      decimal: o.decimal,
    }
  })

  return {
    $schema: "TatvaPractice Complete Design Library",
    $metadata: {
      name: SYSTEM_NAME,
      version: SYSTEM_VERSION,
      exportedAt: new Date().toISOString(),
      description: "Single unified export. Covers: color primitives (5 brand + 3 functional scales), semantic tokens (7 categories), typography (28 styles + font sizes, weights, letter spacings, text cases, paragraph spacings), sizing (17 steps), spacing (23 steps), border radius (14 levels), opacity (20 white + 20 black), shadows (6 elevations), gradients (3 families × 3 intensities), grid system (3 breakpoints), and CTA specs (3 variants × 3 sizes × light/dark surfaces).",
      tokenCounts: {
        colorPrimitives: Object.values(designTokens).reduce((sum, g) =>
          sum + ("subgroups" in g ? (g as FunctionalGroup).subgroups.reduce((s, sg) => s + sg.colors.length, 0) : (g as ColorGroup).colors.length), 0),
        semanticTokens: Object.values(semanticTokens).reduce((sum, cat) =>
          sum + cat.groups.reduce((s, g) => s + g.tokens.length, 0), 0),
        typographyStyles: typographyScale.length,
        fontSizes: fontSizeScale.length,
        fontWeights: fontWeightScale.length,
        letterSpacings: letterSpacingScale.length,
        paragraphSpacings: paragraphSpacingScale.length,
        sizingSteps: sizingScale.length,
        spacingSteps: spacingScale.length,
        radiusLevels: radiusScale.length,
        opacitySteps: opacityScale.length,
        shadowElevations: shadowScale.length,
        gradientFamilies: Object.keys(gradients).length,
        gridBreakpoints: gridSystem.length,
        ctaVariants: ctaVariants.length,
        ctaSizes: ctaSizes.length,
      },
      architecture: {
        level1: "Base Palette — raw color values, system maintainers only",
        level2: "Semantic Tokens — named roles (TP.text.primary, TP.bg.card), what designers and developers use",
        rule: "Components must ONLY reference Level 2 semantic tokens. Never use Level 1 base palette values directly.",
        naming: "TP.{category}.{role}.{state}",
        violetRule: "TP Violet is NEVER used for CTAs — it is strictly informative/educational/AI identity.",
      },
    },
    primitives,
    semantic,
    typography,
    sizing,
    spacing,
    radius,
    opacity,
    shadows,
    gradients: grads,
    grid,
    ctaSpecs,
    borderWidths: borderWidthScale.reduce((acc, b) => {
      acc[b.token] = { value: `${b.px}px`, px: b.px, usage: b.usage }
      return acc
    }, {} as Record<string, unknown>),
    noise: noiseTexture,
  }
}

// ────────────────────────────────────────────────────
// FORMAT 1: TOKENS STUDIO FOR FIGMA
// Plugin: https://tokens.studio
// Import: Plugin > Load > Import JSON
// ────────────────────────────────────────────────────

function buildTokensStudio(): object {
  const core: Record<string, unknown> = {}

  iterateColorGroups((slug, _name, colors) => {
    const obj: Record<string, unknown> = {}
    colors.forEach((c) => {
      obj[String(c.token)] = { value: c.value, type: "color", description: c.usage || "" }
    })
    core[slug] = obj
  })

  // Typography
  const typo: Record<string, unknown> = {}
  typographyScale.forEach((t) => {
    const slug = t.name.toLowerCase().replace(/\s+/g, "-")
    typo[slug] = {
      value: {
        fontFamily: t.fontFamily,
        fontWeight: String(t.weight),
        fontSize: t.size,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
        paragraphSpacing: t.paragraphSpacing,
        textCase: t.textCase,
        textDecoration: t.textDecoration,
      },
      type: "typography",
      description: t.usage || "",
    }
  })
  core["typography"] = typo

  // Spacing
  const sp: Record<string, unknown> = {}
  spacingScale.forEach((s) => {
    sp[s.token] = { value: `${s.px}`, type: "spacing", description: s.usage || "" }
  })
  core["spacing"] = sp

  // Border radius
  const rad: Record<string, unknown> = {}
  radiusScale.forEach((r) => {
    rad[r.token] = { value: `${r.px}`, type: "borderRadius", description: r.usage || "" }
  })
  core["borderRadius"] = rad

  // Shadows
  const shad: Record<string, unknown> = {}
  shadowScale.forEach((s) => {
    shad[s.token] = {
      value: {
        x: String(s.x), y: String(s.y), blur: String(s.blur),
        spread: String(s.spread), color: s.color, type: "dropShadow",
      },
      type: "boxShadow",
      description: s.usage,
    }
  })
  core["boxShadow"] = shad

  // Gradients
  const grad: Record<string, unknown> = {}
  Object.entries(gradients).forEach(([key, g]) => {
    grad[key] = {
      hero: { value: g.variants.hero, type: "other", description: `${g.name} hero` },
      card: { value: g.variants.card, type: "other", description: `${g.name} card` },
      subtle: { value: g.variants.subtle, type: "other", description: `${g.name} subtle` },
    }
  })
  core["gradient"] = grad

  // Grid
  const grid: Record<string, unknown> = {}
  gridSystem.forEach((g) => {
    const slug = g.breakpoint.split(" ")[0].toLowerCase()
    grid[slug] = {
      columns: { value: String(g.columns), type: "other" },
      margin: { value: g.margin, type: "spacing" },
      gutter: { value: g.gutter, type: "spacing" },
    }
  })
  core["grid"] = grid

  // Sizing
  const siz: Record<string, unknown> = {}
  sizingScale.forEach((s) => {
    siz[s.token] = { value: `${s.px}`, type: "sizing", description: s.usage || "" }
  })
  core["sizing"] = siz

  // Opacity
  const opWhite: Record<string, unknown> = {}
  const opBlack: Record<string, unknown> = {}
  opacityScale.forEach((o) => {
    opWhite[o.token] = { value: `rgba(255,255,255,${o.decimal})`, type: "color", description: `White ${o.percent}%` }
    opBlack[o.token] = { value: `rgba(0,0,0,${o.decimal})`, type: "color", description: `Black ${o.percent}%` }
  })
  core["opacity-white"] = opWhite
  core["opacity-black"] = opBlack

  // Semantic set
  const semantic: Record<string, unknown> = {}
  Object.entries(semanticTokens).forEach(([catKey, category]) => {
    const catObj: Record<string, unknown> = {}
    category.groups.forEach((group) => {
      group.tokens.forEach((t) => {
        const isColor = t.value.startsWith("#") || t.value.startsWith("rgba")
        catObj[t.token] = {
          value: t.value,
          type: isColor ? "color" : "other",
          description: `${t.usage} (source: ${t.source})`,
        }
      })
    })
    semantic[catKey] = catObj
  })

  // CTA composition tokens
  semantic["cta-specs"] = {
    "primary-bg": { value: "{blue.500}", type: "color", description: "Primary CTA bg" },
    "primary-text": { value: "#FFFFFF", type: "color", description: "Primary CTA text" },
    "primary-hover": { value: "{blue.600}", type: "color", description: "Primary hover" },
    "outline-border": { value: "{blue.500}", type: "color", description: "Outline border" },
    "outline-text": { value: "{blue.500}", type: "color", description: "Outline text" },
    "danger-bg": { value: "#E11D48", type: "color", description: "Danger bg" },
    "disabled-bg": { value: "{slate.200}", type: "color", description: "Disabled bg" },
    "disabled-text": { value: "{slate.400}", type: "color", description: "Disabled text" },
    radius: { value: "{borderRadius.lg}", type: "borderRadius", description: "CTA radius 12px" },
    "height-sm": { value: "36", type: "sizing" },
    "height-md": { value: "42", type: "sizing" },
    "height-lg": { value: "48", type: "sizing" },
  }

  return {
    core,
    semantic,
    $themes: [{
      id: "tp-light",
      name: "TatvaPractice Light",
      selectedTokenSets: { core: "enabled", semantic: "enabled" },
    }],
    $metadata: { tokenSetOrder: ["core", "semantic"] },
  }
}

// ────────────────────────────────────────────────────
// FORMAT 2: FIGMA VARIABLES REST API FORMAT
// ────────────────────────────────────────────────────

function buildFigmaVariables(): object {
  const collections: unknown[] = []
  const variables: unknown[] = []
  let varIdx = 0

  function addColorVar(colId: string, group: string, name: string, hex: string, desc: string) {
    const rgba = hexToRgba(hex)
    variables.push({
      id: `var-${varIdx++}`,
      name: `${group}/${name}`,
      resolvedType: "COLOR",
      description: desc,
      valuesByMode: { "mode-light": { r: rgba.r / 255, g: rgba.g / 255, b: rgba.b / 255, a: rgba.a } },
      scopes: ["ALL_SCOPES"],
      collectionId: colId,
    })
  }

  function addNumVar(colId: string, group: string, name: string, val: number, desc: string) {
    variables.push({
      id: `var-${varIdx++}`,
      name: `${group}/${name}`,
      resolvedType: "FLOAT",
      description: desc,
      valuesByMode: { "mode-light": val },
      scopes: ["ALL_SCOPES"],
      collectionId: colId,
    })
  }

  // Primitives collection
  const primId = "col-primitives"
  collections.push({ id: primId, name: "TP Primitives", modes: [{ modeId: "mode-light", name: "Light" }], defaultModeId: "mode-light" })

  iterateColorGroups((slug, _name, colors) => {
    const groupLabel = slug.charAt(0).toUpperCase() + slug.slice(1)
    colors.forEach((c) => {
      addColorVar(primId, `TP ${groupLabel}`, String(c.token), c.value, c.usage || "")
    })
  })

  // Spacing collection
  const spId = "col-spacing"
  collections.push({ id: spId, name: "TP Spacing", modes: [{ modeId: "mode-light", name: "Light" }], defaultModeId: "mode-light" })
  spacingScale.forEach((s) => addNumVar(spId, "spacing", s.token, s.px, s.usage || ""))

  // Radius collection
  const radId = "col-radius"
  collections.push({ id: radId, name: "TP Radius", modes: [{ modeId: "mode-light", name: "Light" }], defaultModeId: "mode-light" })
  radiusScale.forEach((r) => addNumVar(radId, "radius", r.token, r.px, r.usage || ""))

  // Sizing collection
  const sizId = "col-sizing"
  collections.push({ id: sizId, name: "TP Sizing", modes: [{ modeId: "mode-light", name: "Light" }], defaultModeId: "mode-light" })
  sizingScale.forEach((s) => addNumVar(sizId, "sizing", s.token, s.px, s.usage || ""))

  // Semantic collection
  const semId = "col-semantic"
  collections.push({ id: semId, name: "TP Semantic", modes: [{ modeId: "mode-light", name: "Light" }], defaultModeId: "mode-light" })
  Object.entries(semanticTokens).forEach(([, category]) => {
    category.groups.forEach((group) => {
      group.tokens.forEach((t) => {
        if (t.value.startsWith("#")) {
          addColorVar(semId, category.name, t.token, t.value, `${t.usage} (${t.source})`)
        }
      })
    })
  })

  return {
    $schema: "https://www.figma.com/developers/api#variables",
    $metadata: { name: SYSTEM_NAME, version: SYSTEM_VERSION, exportedAt: new Date().toISOString() },
    variableCollections: collections,
    variables,
  }
}

// ────────────────────────────────────────────────────
// FORMAT 3: STYLE DICTIONARY
// ────────────────────────────────────────────────────

function buildStyleDictionary(): object {
  const tokens: Record<string, unknown> = {}

  // Colors
  const color: Record<string, unknown> = {}
  iterateColorGroups((slug, _name, colors) => {
    const obj: Record<string, unknown> = {}
    colors.forEach((c) => {
      obj[String(c.token)] = { value: c.value, comment: c.usage || "" }
    })
    color[slug] = obj
  })
  tokens["color"] = color

  // Semantic
  const sem: Record<string, unknown> = {}
  Object.entries(semanticTokens).forEach(([catKey, category]) => {
    const catObj: Record<string, unknown> = {}
    category.groups.forEach((group) => {
      group.tokens.forEach((t) => {
        if (t.value.startsWith("#") || t.value.startsWith("rgba")) {
          catObj[t.token.replace(/\./g, "-")] = { value: t.value, comment: `${t.usage} (${t.source})` }
        }
      })
    })
    sem[catKey] = catObj
  })
  tokens["semantic"] = sem

  // Typography
  const typo: Record<string, unknown> = {}
  typographyScale.forEach((t) => {
    const slug = t.name.toLowerCase().replace(/\s+/g, "-")
    typo[slug] = {
      "font-family": { value: t.fontFamily },
      "font-weight": { value: String(t.weight) },
      "font-size": { value: t.size },
      "line-height": { value: t.lineHeight },
      "letter-spacing": { value: t.letterSpacing },
      "paragraph-spacing": { value: t.paragraphSpacing },
      "text-case": { value: t.textCase },
      "text-decoration": { value: t.textDecoration },
    }
  })
  tokens["typography"] = typo

  // Spacing
  const sp: Record<string, unknown> = {}
  spacingScale.forEach((s) => { sp[s.token] = { value: `${s.px}px` } })
  tokens["spacing"] = sp

  // Sizing
  const siz: Record<string, unknown> = {}
  sizingScale.forEach((s) => { siz[s.token] = { value: `${s.px}px` } })
  tokens["sizing"] = siz

  // Radius
  const rad: Record<string, unknown> = {}
  radiusScale.forEach((r) => { rad[r.token] = { value: `${r.px}px` } })
  tokens["radius"] = rad

  // Opacity
  const opWhite: Record<string, unknown> = {}
  const opBlack: Record<string, unknown> = {}
  opacityScale.forEach((o) => {
    opWhite[o.token] = { value: `rgba(255,255,255,${o.decimal})` }
    opBlack[o.token] = { value: `rgba(0,0,0,${o.decimal})` }
  })
  tokens["opacity-white"] = opWhite
  tokens["opacity-black"] = opBlack

  // Shadows
  const shad: Record<string, unknown> = {}
  shadowScale.forEach((s) => {
    shad[s.token] = {
      value: { x: String(s.x), y: String(s.y), blur: String(s.blur), spread: String(s.spread), color: s.color, type: "dropShadow" },
      type: "boxShadow",
      comment: s.usage,
    }
  })
  tokens["boxShadow"] = shad

  // Gradients
  const grad: Record<string, unknown> = {}
  Object.entries(gradients).forEach(([key, g]) => {
    grad[key] = {
      hero: { value: g.variants.hero, comment: `${g.name} hero` },
      card: { value: g.variants.card, comment: `${g.name} card` },
      subtle: { value: g.variants.subtle, comment: `${g.name} subtle` },
    }
  })
  tokens["gradient"] = grad

  // Grid
  const grid: Record<string, unknown> = {}
  gridSystem.forEach((g) => {
    const slug = g.breakpoint.split(" ")[0].toLowerCase()
    grid[slug] = {
      columns: { value: String(g.columns) },
      margin: { value: g.margin },
      gutter: { value: g.gutter },
    }
  })
  tokens["grid"] = grid

  // CTA specs
  const cta: Record<string, unknown> = {}
  ctaVariants.forEach((v) => {
    cta[`${v.name.toLowerCase()}-onLight`] = v.onLight
    cta[`${v.name.toLowerCase()}-onDark`] = v.onDark
  })
  cta["radius"] = { value: "12px" }
  ctaSizes.forEach((s) => {
    cta[`height-${s.token}`] = { value: `${s.height}px` }
    cta[`icon-${s.token}`] = { value: `${s.iconSize}px` }
  })
  tokens["cta"] = cta

  return tokens
}

// ─── PUBLIC API ───

export type FigmaExportFormat = "complete-library" | "tokens-studio" | "figma-variables" | "style-dictionary"

export const exportFormats: {
  id: FigmaExportFormat
  name: string
  plugin: string
  description: string
  filename: string
  recommended?: boolean
}[] = [
  {
    id: "complete-library",
    name: "Complete Library",
    plugin: "Universal",
    description:
      "Single unified JSON with everything: primitives, semantic tokens, typography (28 styles + font sizes, weights, letter spacings, text cases, paragraph spacings), sizing, spacing, radius, opacity (white + black), shadows, gradients, grid, and CTA specs. Ideal for documentation, handoff, or custom pipelines.",
    filename: "tatva-practice-complete-library.json",
    recommended: true,
  },
  {
    id: "tokens-studio",
    name: "Tokens Studio",
    plugin: "tokens.studio",
    description:
      "Most popular Figma plugin. Imports colors, typography, spacing, shadows, radius, gradients, grid, and CTA composition tokens. Plugin > Load > Import JSON.",
    filename: "tatva-practice-tokens-studio.json",
  },
  {
    id: "figma-variables",
    name: "Figma Variables",
    plugin: "Figma REST API",
    description:
      "Native Figma Variables format with 4 collections (Primitives, Spacing, Radius, Semantic). Import via REST API or plugins.",
    filename: "tatva-practice-figma-variables.json",
  },
  {
    id: "style-dictionary",
    name: "Style Dictionary",
    plugin: "amzn/style-dictionary",
    description:
      "Universal token format by Amazon. Includes all token categories. Use with Supernova, Specify, or custom build pipelines.",
    filename: "tatva-practice-style-dictionary.json",
  },
]

export function exportForFigma(format: FigmaExportFormat) {
  const fmt = exportFormats.find((f) => f.id === format)
  if (!fmt) return

  let data: object
  switch (format) {
    case "complete-library":
      data = buildCompleteLibrary()
      break
    case "tokens-studio":
      data = buildTokensStudio()
      break
    case "figma-variables":
      data = buildFigmaVariables()
      break
    case "style-dictionary":
      data = buildStyleDictionary()
      break
  }

  download(data, fmt.filename)
}
