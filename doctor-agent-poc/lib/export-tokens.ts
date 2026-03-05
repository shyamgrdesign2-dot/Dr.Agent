import {
  designTokens,
  gradients,
  semanticTokens,
  hexToRgbNormalized,
  ctaVariants,
  typographyScale,
  spacingScale,
  gridSystem,
  shadowScale,
  radiusScale,
  sizingScale,
  opacityScale,
  borderWidthScale,
  noiseTexture,
  ctaSizes,
  type ColorGroup,
  type FunctionalGroup,
  type ColorEntry,
} from "./design-tokens"

interface FigmaTokenValue {
  $type: string
  $value: {
    colorSpace: string
    components: number[]
    alpha: number
    hex: string
  }
  $description: string
  $extensions: {
    "com.figma.variableId": string
    "com.figma.scopes": string[]
    "com.figma.isOverride": boolean
  }
}

function createTokenNode(
  groupName: string,
  colors: ColorEntry[],
  description: string
): Record<string, FigmaTokenValue> {
  const groupObj: Record<string, FigmaTokenValue> = {}
  colors.forEach((color) => {
    const rgb = hexToRgbNormalized(color.value)
    const key = String(color.token)

    groupObj[key] = {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [rgb.r, rgb.g, rgb.b],
        alpha: 1,
        hex: color.value,
      },
      $description:
        color.usage || description || "Generated from TatvaPractice Design System",
      $extensions: {
        "com.figma.variableId": `VariableID:custom:${groupName}:${key}`,
        "com.figma.scopes": ["ALL_SCOPES"],
        "com.figma.isOverride": true,
      },
    }
  })
  return groupObj
}

export function exportFigmaTokens() {
  const figmaTokens: Record<string, unknown> = {
    $metadata: {
      name: "TatvaPractice Design System",
      version: "2.2.0",
      description:
        "Complete token pack: TP Blue, TP Violet, TP Amber, AI, TP Slate, Functional, Semantic, Gradients, CTAs, Typography, Spacing, Radius, Shadows, Grid.",
    },
  }

  // Color primitives
  Object.entries(designTokens).forEach(([key, group]) => {
    if ("subgroups" in group) {
      const functionalGroup = group as FunctionalGroup
      functionalGroup.subgroups.forEach((sub) => {
        const cleanName = sub.name.split(" ")[0].toLowerCase()
        figmaTokens[cleanName] = createTokenNode(
          cleanName,
          sub.colors,
          functionalGroup.description
        )
      })
    } else {
      const colorGroup = group as ColorGroup
      figmaTokens[key] = createTokenNode(
        key,
        colorGroup.colors,
        colorGroup.description
      )
    }
  })

  // Gradient tokens
  const gradientTokens: Record<string, unknown> = {}
  Object.entries(gradients).forEach(([key, gradient]) => {
    gradientTokens[key] = {
      hero: {
        $type: "string",
        $value: gradient.variants.hero,
        $description: `${gradient.name} - Hero intensity`,
      },
      card: {
        $type: "string",
        $value: gradient.variants.card,
        $description: `${gradient.name} - Card intensity`,
      },
      subtle: {
        $type: "string",
        $value: gradient.variants.subtle,
        $description: `${gradient.name} - Subtle intensity`,
      },
    }
  })
  figmaTokens["gradient"] = gradientTokens

  // Noise tokens
  figmaTokens["noise"] = {
    opacity: { hero: 0.08, card: 0.06 },
    scale: { hero: 1.0, card: 0.8 },
    blendMode: "overlay",
  }

  // CTA tokens
  const ctaTokens: Record<string, unknown> = {}
  ctaVariants.forEach((v) => {
    const name = v.name.toLowerCase()
    ctaTokens[name] = {
      specs: v.specs,
      onLight: v.onLight,
      onDark: v.onDark,
    }
  })
  figmaTokens["cta"] = ctaTokens

  // Typography tokens
  const typoTokens: Record<string, unknown> = {}
  typographyScale.forEach((t) => {
    const key = t.name.toLowerCase().replace(/\s+/g, "-")
    typoTokens[key] = {
      fontFamily: t.fontFamily,
      fontSize: t.size,
      fontWeight: t.weight,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
    }
  })
  figmaTokens["typography"] = typoTokens

  // Spacing tokens
  const spacingTokens: Record<string, unknown> = {}
  spacingScale.forEach((s) => {
    spacingTokens[s.token] = { $type: "dimension", $value: `${s.px}px` }
  })
  figmaTokens["spacing"] = spacingTokens

  // Radius tokens
  const radiusTokens: Record<string, unknown> = {}
  radiusScale.forEach((r) => {
    radiusTokens[r.token] = { $type: "dimension", $value: `${r.px}px`, $description: r.usage }
  })
  figmaTokens["radius"] = radiusTokens

  // Shadow tokens
  const shadowTokens: Record<string, unknown> = {}
  shadowScale.forEach((s) => {
    shadowTokens[s.token] = {
      $type: "boxShadow",
      $value: s.css,
      $description: s.usage,
    }
  })
  figmaTokens["shadow"] = shadowTokens

  // CTA size tokens
  const ctaSizeTokens: Record<string, unknown> = {}
  ctaSizes.forEach((s) => {
    ctaSizeTokens[s.token] = {
      height: { $type: "dimension", $value: `${s.height}px` },
      iconSize: { $type: "dimension", $value: `${s.iconSize}px` },
      paddingX: { $type: "dimension", $value: `${s.paddingX}px` },
    }
  })
  figmaTokens["ctaSizes"] = ctaSizeTokens

  // Sizing tokens
  const sizingTokens: Record<string, unknown> = {}
  sizingScale.forEach((s) => {
    sizingTokens[s.token] = { $type: "dimension", $value: `${s.px}px`, $description: s.usage }
  })
  figmaTokens["sizing"] = sizingTokens

  // Opacity tokens
  const opacityWhiteTokens: Record<string, unknown> = {}
  const opacityBlackTokens: Record<string, unknown> = {}
  opacityScale.forEach((o) => {
    opacityWhiteTokens[o.token] = { $type: "color", $value: `rgba(255,255,255,${o.decimal})`, $description: `White ${o.percent}%` }
    opacityBlackTokens[o.token] = { $type: "color", $value: `rgba(0,0,0,${o.decimal})`, $description: `Black ${o.percent}%` }
  })
  figmaTokens["opacity-white"] = opacityWhiteTokens
  figmaTokens["opacity-black"] = opacityBlackTokens

  // Border width tokens
  const borderWidthTokens: Record<string, unknown> = {}
  borderWidthScale.forEach((b) => {
    borderWidthTokens[b.token] = { $type: "dimension", $value: `${b.px}px`, $description: b.usage }
  })
  figmaTokens["borderWidths"] = borderWidthTokens

  // Noise texture
  figmaTokens["noise"] = {
    $type: "other",
    $value: noiseTexture,
    $description: "Surface noise texture settings for gradient surfaces",
  }

  // Grid tokens
  const gridTokens: Record<string, unknown> = {}
  gridSystem.forEach((g) => {
    const key = g.breakpoint.split(" ")[0].toLowerCase()
    gridTokens[key] = {
      columns: g.columns,
      margin: g.margin,
      gutter: g.gutter,
    }
  })
  figmaTokens["grid"] = gridTokens

  // Semantic tokens (Level 2)
  const semanticOut: Record<string, unknown> = {}
  Object.entries(semanticTokens).forEach(([catKey, category]) => {
    const catObj: Record<string, unknown> = {}
    category.groups.forEach((group) => {
      group.tokens.forEach((t) => {
        catObj[t.token] = {
          $type: t.value.startsWith("#") ? "color" : "string",
          $value: t.value,
          $description: `${t.usage} (source: ${t.source})`,
        }
      })
    })
    semanticOut[catKey] = catObj
  })
  figmaTokens["semantic"] = semanticOut

  figmaTokens["$extensions"] = {
    "com.figma.modeName": "Default",
  }

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(figmaTokens, null, 2))
  const downloadAnchorNode = document.createElement("a")
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute(
    "download",
    "tatva_practice_tokens.json"
  )
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
