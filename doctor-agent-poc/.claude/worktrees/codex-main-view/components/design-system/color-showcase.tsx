"use client"

import { ColorSwatch, SemanticSwatch } from "@/components/design-system/color-swatch"
import {
  designTokens,
  semanticTokens,
  opacityScale,
  noiseTexture,
  type ColorGroup,
  type FunctionalGroup,
} from "@/lib/design-tokens"

interface ColorShowcaseProps {
  onCopy: (text: string, message: string) => void
}

/** Map color group display name → CSS variable / Tailwind prefix */
const groupPrefixMap: Record<string, string> = {
  "TP Blue -- Primary": "tp-blue",
  "TP Violet -- Secondary": "tp-violet",
  "TP Amber -- Tertiary (Minimized Use)": "tp-amber",
  "TP Slate (Neutrals)": "tp-slate",
  "AI Gradient Stops": "tp-ai",
}

/** Map functional subgroup name → CSS variable prefix */
const functionalPrefixMap: Record<string, string> = {
  "TP Success (Green)": "tp-success",
  "TP Error (Crimson Red)": "tp-error",
  "TP Warning (Amber)": "tp-warning",
}

/** Primitive color palettes — extracted from the original monolithic page */
export function PrimitiveColorShowcase({ onCopy }: ColorShowcaseProps) {
  const primitiveColorGroups = [
    designTokens.primary as ColorGroup,
    designTokens.secondary as ColorGroup,
    designTokens.tertiary as ColorGroup,
    designTokens.tpSlate as ColorGroup,
    designTokens.aiGradientStops as ColorGroup,
  ]
  const functionalGroup = designTokens.functional as FunctionalGroup

  return (
    <div className="space-y-8">
      {primitiveColorGroups.map((group) => (
        <div key={group.name}>
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-tp-slate-800">{group.name}</h4>
            <p className="text-xs text-tp-slate-500">{group.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {group.colors.map((entry) => (
              <ColorSwatch
                key={`${group.name}-${entry.token}`}
                token={entry.token}
                value={entry.value}
                usage={entry.usage}
                cssPrefix={groupPrefixMap[group.name]}
                onCopy={onCopy}
              />
            ))}
          </div>
        </div>
      ))}

      <div>
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-tp-slate-800">{functionalGroup.name}</h4>
          <p className="text-xs text-tp-slate-500">{functionalGroup.description}</p>
        </div>
        <div className="space-y-6">
          {functionalGroup.subgroups.map((sub) => (
            <div key={sub.name}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-tp-slate-500">
                {sub.name}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {sub.colors.map((entry) => (
                  <ColorSwatch
                    key={`${sub.name}-${entry.token}`}
                    token={entry.token}
                    value={entry.value}
                    usage={entry.usage}
                    cssPrefix={functionalPrefixMap[sub.name]}
                    onCopy={onCopy}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Semantic token categories — extracted from the original monolithic page */
export function SemanticColorShowcase({ onCopy }: ColorShowcaseProps) {
  return (
    <div className="space-y-8">
      {Object.values(semanticTokens).map((category) => (
        <div key={category.name}>
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-tp-slate-800">{category.name}</h4>
            <p className="text-xs text-tp-slate-500">{category.description}</p>
          </div>
          <div className="space-y-5">
            {category.groups.map((group) => (
              <div key={group.name}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-tp-slate-500">
                  {group.name}
                </p>
                <div className="grid gap-3 lg:grid-cols-2">
                  {group.tokens.map((token) => (
                    <SemanticSwatch key={token.token} token={token} onCopy={onCopy} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-tp-slate-200 bg-tp-slate-50 p-4">
        <h4 className="text-sm font-semibold text-tp-slate-800">Opacity + Noise Tokens</h4>
        <p className="mt-1 text-xs text-tp-slate-600">
          Shared opacity scale and grain texture configuration used for layered gradients.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {opacityScale.map((entry) => (
            <button
              key={entry.token}
              className="rounded-lg border border-tp-slate-200 bg-white px-2 py-2 text-left text-xs hover:border-tp-blue-200"
              onClick={() =>
                onCopy(JSON.stringify(entry.decimal), `Copied opacity ${entry.token}`)
              }
            >
              <div className="font-semibold text-tp-slate-700">{entry.token}</div>
              <div className="font-mono text-tp-slate-500">{entry.decimal}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-tp-slate-200 bg-white p-3 text-xs text-tp-slate-600">
          <p>
            <strong>Noise:</strong> hero {noiseTexture.opacity.hero}, card{" "}
            {noiseTexture.opacity.card}, blend {noiseTexture.blend}
          </p>
        </div>
      </div>
    </div>
  )
}
