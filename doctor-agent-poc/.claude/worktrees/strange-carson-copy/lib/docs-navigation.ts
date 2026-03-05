/**
 * Navigation tree for the multi-page documentation site.
 * Each group maps to a sidebar section; each item maps to a route.
 */

export interface NavItem {
  id: string
  label: string
  href: string
  /** Iconsax icon name — resolved at render time */
  icon: string
  description?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const docsNavigation: NavGroup[] = [
  {
    label: "Foundations",
    items: [
      {
        id: "colors",
        label: "Colors",
        href: "/foundations/colors",
        icon: "Colorfilter",
        description: "Primitive palettes, semantic tokens, opacity & noise",
      },
      {
        id: "typography",
        label: "Typography",
        href: "/foundations/typography",
        icon: "Text",
        description: "Type scale, font families, and text styles",
      },
      {
        id: "spacing",
        label: "Spacing & Grid",
        href: "/foundations/spacing",
        icon: "Grid2",
        description: "Spacing scale, grid system, and layout breakpoints",
      },
      {
        id: "shadows",
        label: "Shadows & Radius",
        href: "/foundations/shadows",
        icon: "Blur",
        description: "Elevation, border radius, borders, gradients",
      },
      {
        id: "icons",
        label: "Icons",
        href: "/foundations/icons",
        icon: "Star",
        description: "Lucide icon library usage and showcase",
      },
    ],
  },
  {
    label: "Components",
    items: [
      {
        id: "buttons",
        label: "Buttons",
        href: "/components/buttons",
        icon: "Mouse",
        description: "CTA anatomy, states, themes, sizes, and dark variants",
      },
      {
        id: "inputs",
        label: "Inputs",
        href: "/components/inputs",
        icon: "Edit2",
        description: "Text inputs, search, select, checkbox, radio, toggle, date pickers",
      },
      {
        id: "data-display",
        label: "Data Display",
        href: "/components/data-display",
        icon: "TableDocument",
        description: "Tables, pagination, tooltips, and modals",
      },
      {
        id: "feedback",
        label: "Feedback",
        href: "/components/feedback",
        icon: "Notification",
        description: "Toasts, alerts, banners, and date pickers",
      },
      {
        id: "navigation",
        label: "Navigation",
        href: "/components/navigation",
        icon: "Routing2",
        description: "Tabs, segmented controls, dropdowns, breadcrumbs, secondary nav",
      },
      {
        id: "surfaces",
        label: "Surfaces",
        href: "/components/surfaces",
        icon: "Layer",
        description: "Cards, accordion, avatar, badge, divider, slider, progress, skeleton",
      },
      {
        id: "new",
        label: "New Components",
        href: "/components/new",
        icon: "Flash",
        description: "20 new TP components — drawers, pickers, stepper, timeline, tree view, and more",
      },
    ],
  },
]

/** Flat list of all navigation items for search */
export const allNavItems: NavItem[] = docsNavigation.flatMap((g) => g.items)
