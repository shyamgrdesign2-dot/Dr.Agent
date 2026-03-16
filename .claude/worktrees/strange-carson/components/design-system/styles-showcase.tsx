"use client"

import { useState } from "react"
import { MaterialFamiliesShowcase } from "@/components/design-system/material-families-showcase"
import {
  advancedColorTools,
  colorFoundationSections,
  colorRules,
  colorSchemes,
  colorSystemRoles,
  componentTokenContracts,
  elevationFoundationSections,
  figmaStyleFoundationMap,
  iconFoundationSections,
  iconSystemRules,
  interactionStateTokens,
  motionDuration,
  motionEasing,
  motionFoundationSections,
  motionTransitions,
  shapeFoundationSections,
  styleDosAndDonts,
  tokenFoundationModel,
  typographyFoundationSections,
} from "@/lib/design-tokens"

const styleStateDiagrams = [
  {
    family: "Buttons / CTA",
    flow: ["Default", "Hover", "Focus", "Pressed", "Disabled"],
    notes: "Outlined icons in default; dual-tone icons on hover/pressed/selected.",
  },
  {
    family: "Sidebar & Tabs",
    flow: ["Default", "Hover", "Selected", "Focus-visible", "Disabled"],
    notes: "Line icon becomes dual-tone on hover/selected to strengthen active context.",
  },
  {
    family: "Inputs / Select",
    flow: ["Default", "Hover", "Focus", "Error", "Disabled"],
    notes: "Focus uses TP Blue 500 outline + TP Blue 200 focus ring.",
  },
  {
    family: "Feedback / Overlays",
    flow: ["Hidden", "Enter", "Active", "Exit", "Dismissed"],
    notes: "Use decelerate easing for entry and accelerate for dismiss.",
  },
] as const

const styleSnippets = [
  {
    title: "CTA With Icon Rule",
    code: `<button className="tp-cta tp-cta-primary">
  <TpIcon icon="search" size="md" tone="default" />
  Search
</button>
{/* On hover/selected -> same icon switches to dual-tone mode */}`,
  },
  {
    title: "Sidebar Item State",
    code: `<button className={isActive ? "tp-sidebar-item active" : "tp-sidebar-item"}>
  <TpIcon icon="calendar" size="md" tone={isActive ? "brand" : "inverse"} />
  <span>Appointments</span>
</button>`,
  },
  {
    title: "Motion Token Usage",
    code: `.tp-transition-standard {
  transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
}
.tp-transition-enter {
  transition: all 250ms cubic-bezier(0, 0, 0, 1);
}`,
  },
] as const

const doDontExamples = [
  {
    title: "Icon Interaction",
    doText: "Use outlined icons in default; dual-tone when hovered/selected.",
    dontText: "Mix random filled/outline styles in same nav surface.",
  },
  {
    title: "Token Discipline",
    doText: "Use semantic tokens (TP.bg.*, TP.text.*, TP.icon.*).",
    dontText: "Use raw hex values directly in components.",
  },
  {
    title: "CTA Geometry",
    doText: "Keep 38px height, 10px radius, 14/8 padding, 20px icon.",
    dontText: "Change CTA height/radius per page or component.",
  },
] as const

export function StylesShowcase() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (title: string, code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(title)
    window.setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div className="space-y-10">
      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Foundation Token Model</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {tokenFoundationModel.layers.map((layer) => (
            <div key={layer.layer} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-tp-slate-500">{layer.layer}</p>
              <p className="mt-2 text-xs text-tp-slate-600">{layer.purpose}</p>
              <div className="mt-3 space-y-1">
                {layer.examples.map((ex) => (
                  <code key={ex} className="block rounded bg-tp-slate-100 px-2 py-1 text-[11px] text-tp-slate-700">
                    {ex}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-tp-slate-500">
          <strong>Principle:</strong> {tokenFoundationModel.principle}
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">State Diagrams</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {styleStateDiagrams.map((diagram) => (
            <div key={diagram.family} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-tp-slate-800">{diagram.family}</p>
              <p className="mt-2 text-xs text-tp-blue-600 font-mono">
                {diagram.flow.join(" -> ")}
              </p>
              <p className="mt-2 text-xs text-tp-slate-500">{diagram.notes}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Color</h3>
        <p className="text-sm text-tp-slate-600 mb-3">{colorFoundationSections.overview}</p>
        <div className="rounded-xl border border-tp-slate-200 bg-white p-4 mb-4">
          <p className="text-sm font-semibold text-tp-slate-800 mb-2">Color System</p>
          <ul className="space-y-1 text-xs text-tp-slate-600">
            {colorFoundationSections.system.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorSystemRoles.map((role) => (
            <div key={role.role} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-tp-slate-500">{role.role}</p>
              <p className="text-sm font-semibold text-tp-slate-800 mt-1">{role.token}</p>
              <p className="text-xs text-tp-slate-500 mt-2">{role.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Color Rules & Schemes</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Rules</p>
            <ul className="space-y-2 text-xs text-tp-slate-600">
              {colorRules.map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Schemes</p>
            <div className="space-y-3">
              {colorSchemes.map((scheme) => (
                <div key={scheme.name} className="rounded-lg border border-tp-slate-100 bg-tp-slate-50/50 p-3">
                  <p className="text-xs font-bold text-tp-slate-700">{scheme.name}</p>
                  <p className="text-[11px] text-tp-slate-500 mt-1">
                    Surface: <code>{scheme.surface}</code> • Text: <code>{scheme.text}</code> • Border: <code>{scheme.border}</code>
                  </p>
                  <p className="text-[11px] text-tp-slate-500 mt-1">{scheme.usage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Choosing Schemes</p>
            <ul className="space-y-1 text-xs text-tp-slate-600">
              {colorFoundationSections.choosingSchemes.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Dynamic & Advanced Schemes</p>
            <p className="text-xs text-tp-slate-600">{colorFoundationSections.dynamicTheming}</p>
            <ul className="mt-2 space-y-1 text-xs text-tp-slate-600">
              {colorFoundationSections.advanced.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Elevation</h3>
        <p className="text-sm text-tp-slate-600 mb-3">{elevationFoundationSections.overview}</p>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Elevation Levels</p>
            <div className="space-y-2">
              {elevationFoundationSections.levels.map((lvl) => (
                <div key={lvl.level} className="text-xs text-tp-slate-600">
                  <strong>Level {lvl.level}:</strong> <code>{lvl.token}</code> — {lvl.usage}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Focus Elevation States</p>
            <div className="space-y-2">
              {elevationFoundationSections.focus.map((focus) => (
                <div key={focus.state} className="text-xs text-tp-slate-600">
                  <strong>{focus.state}:</strong> <code>{focus.token}</code> — {focus.usage}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Icons</h3>
        <p className="text-sm text-tp-slate-600 mb-3">{iconFoundationSections.overview}</p>
        <div className="grid gap-4 lg:grid-cols-3 mb-4">
          {iconFoundationSections.families.map((family) => (
            <div key={family.family} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-tp-slate-800">{family.family}</p>
              <p className="mt-1 text-xs text-tp-slate-600">{family.usage}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Size Family</p>
            <p className="text-xs text-tp-slate-600">{iconFoundationSections.sizes.join(" • ")}</p>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Constraints</p>
            <ul className="space-y-1 text-xs text-tp-slate-600">
              {iconFoundationSections.constraints.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Figma Styles Mapping</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(figmaStyleFoundationMap).map(([key, cfg]) => (
            <div key={key} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-tp-slate-800">{key}</p>
              <p className="mt-2 text-xs text-tp-slate-600">
                <strong>Source:</strong> {cfg.source}
              </p>
              <p className="mt-1 text-xs text-tp-slate-600">
                <strong>Naming:</strong> <code>{cfg.naming}</code>
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {cfg.styleGroups.map((group) => (
                  <span key={group} className="rounded bg-tp-slate-100 px-2 py-1 text-[11px] text-tp-slate-600">
                    {group}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Advanced Color Tools</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Advanced Color Tools</p>
            <div className="space-y-2">
              {advancedColorTools.map((tool) => (
                <div key={tool.tool} className="text-xs text-tp-slate-600">
                  <strong>{tool.tool}:</strong> {tool.usage}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Icon System Rules</h3>
        <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
          <div className="space-y-2">
            {iconSystemRules.map((rule) => (
              <div key={rule.rule} className="text-xs text-tp-slate-600">
                <strong>{rule.rule}:</strong> {rule.behavior} <span className="text-tp-slate-400">({rule.appliesTo})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Interaction State Tokens</h3>
        <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
          <p className="text-xs text-tp-slate-600">
            <strong>States:</strong> {interactionStateTokens.states.join(" • ")}
          </p>
          <p className="mt-2 text-xs text-tp-blue-600">
            <strong>Icon mode:</strong> {interactionStateTokens.iconModeRule}
          </p>
          <ul className="mt-3 space-y-2 text-xs text-tp-slate-600">
            {interactionStateTokens.stateRules.map((rule) => (
              <li key={rule}>• {rule}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Component Token Contracts</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800">Button Contract</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-tp-slate-900 p-3 text-[11px] text-tp-slate-100">
              <code>{JSON.stringify(componentTokenContracts.button, null, 2)}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800">Field Contract</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-tp-slate-900 p-3 text-[11px] text-tp-slate-100">
              <code>{JSON.stringify(componentTokenContracts.field, null, 2)}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800">Tab Contract</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-tp-slate-900 p-3 text-[11px] text-tp-slate-100">
              <code>{JSON.stringify(componentTokenContracts.navTab, null, 2)}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800">Sidebar Contract</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-tp-slate-900 p-3 text-[11px] text-tp-slate-100">
              <code>{JSON.stringify(componentTokenContracts.sidebarItem, null, 2)}</code>
            </pre>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Motion</h3>
        <p className="text-sm text-tp-slate-600 mb-3">{motionFoundationSections.overview}</p>
        <div className="rounded-xl border border-tp-slate-200 bg-white p-4 mb-4">
          <p className="text-sm font-semibold text-tp-slate-800 mb-2">Motion Principles</p>
          <ul className="space-y-1 text-xs text-tp-slate-600">
            {motionFoundationSections.principles.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Easing</p>
            <div className="space-y-2">
              {motionEasing.map((item) => (
                <div key={item.token} className="text-xs text-tp-slate-600">
                  <strong>{item.token}:</strong> <code>{item.curve}</code>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Durations</p>
            <div className="space-y-2">
              {motionDuration.map((item) => (
                <div key={item.token} className="text-xs text-tp-slate-600">
                  <strong>{item.token}:</strong> {item.ms}ms
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Transitions</p>
            <div className="space-y-2">
              {motionTransitions.map((item) => (
                <div key={item.component} className="text-xs text-tp-slate-600">
                  <strong>{item.component}:</strong> {item.transition}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Shapes</h3>
        <p className="text-sm text-tp-slate-600 mb-3">{shapeFoundationSections.overview}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {shapeFoundationSections.geometry.map((shape) => (
            <div key={shape.shape} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-tp-slate-800">{shape.shape}</p>
              <p className="mt-1 text-xs text-tp-slate-600">{shape.usage}</p>
              <p className="mt-2 text-[11px] text-tp-slate-500">
                Tokens:{" "}
                {shape.tokens.map((t) => (
                  <code key={t} className="mr-1">{t}</code>
                ))}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-tp-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-tp-slate-800 mb-2">Shape Rules</p>
          <ul className="space-y-1 text-xs text-tp-slate-600">
            {shapeFoundationSections.rules.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Typography</h3>
        <p className="text-sm text-tp-slate-600 mb-3">{typographyFoundationSections.overview}</p>
        <div className="grid gap-4 lg:grid-cols-3 mb-4">
          {typographyFoundationSections.fonts.map((font) => (
            <div key={font.family} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-tp-slate-800">{font.family}</p>
              <p className="mt-1 text-xs text-tp-slate-600">{font.role}</p>
              <p className="mt-1 text-[11px] text-tp-slate-500">Weights: {font.weights}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Type Scale</p>
            <ul className="space-y-1 text-xs text-tp-slate-600">
              {typographyFoundationSections.typeScale.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Tokenization</p>
            <ul className="space-y-1 text-xs text-tp-slate-600">
              {typographyFoundationSections.tokenization.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Applying Type</p>
            <ul className="space-y-1 text-xs text-tp-slate-600">
              {typographyFoundationSections.applyingType.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-tp-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-tp-slate-800 mb-2">Editorial Treatment</p>
            <ul className="space-y-1 text-xs text-tp-slate-600">
              {typographyFoundationSections.editorialTreatment.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Do & Don’t</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-tp-success-200 bg-tp-success-50/40 p-4">
            <p className="text-sm font-semibold text-tp-success-700 mb-2">Do</p>
            <ul className="space-y-2 text-xs text-tp-slate-700">
              {styleDosAndDonts.dos.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-tp-error-200 bg-tp-error-50/40 p-4">
            <p className="text-sm font-semibold text-tp-error-700 mb-2">Don’t</p>
            <ul className="space-y-2 text-xs text-tp-slate-700">
              {styleDosAndDonts.donts.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Copyable Usage Snippets</h3>
        <div className="grid lg:grid-cols-3 gap-4">
          {styleSnippets.map((snippet) => (
            <div key={snippet.title} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-tp-slate-800">{snippet.title}</p>
                <button
                  onClick={() => void handleCopy(snippet.title, snippet.code)}
                  className="rounded-md border border-tp-blue-200 bg-tp-blue-50 px-2 py-1 text-[11px] font-semibold text-tp-blue-600 hover:bg-tp-blue-100"
                >
                  {copied === snippet.title ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-tp-slate-900 p-3 text-[11px] leading-relaxed text-tp-slate-100">
                <code>{snippet.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Do / Don’t Examples</h3>
        <div className="grid lg:grid-cols-3 gap-4">
          {doDontExamples.map((example) => (
            <div key={example.title} className="rounded-xl border border-tp-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-tp-slate-800 mb-3">{example.title}</p>
              <div className="space-y-3">
                <div className="rounded-lg border border-tp-success-200 bg-tp-success-50/50 p-2">
                  <p className="text-[11px] font-bold text-tp-success-700">Do</p>
                  <p className="text-xs text-tp-slate-700 mt-1">{example.doText}</p>
                </div>
                <div className="rounded-lg border border-tp-error-200 bg-tp-error-50/50 p-2">
                  <p className="text-[11px] font-bold text-tp-error-700">Don’t</p>
                  <p className="text-xs text-tp-slate-700 mt-1">{example.dontText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-tp-slate-900 mb-3 font-heading">Material Families (Continuing Rollout)</h3>
        <MaterialFamiliesShowcase />
      </section>
    </div>
  )
}
