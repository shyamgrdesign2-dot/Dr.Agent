"use client"

// ─── TatvaPractice Design System: Component Specification Export ───
// Generates a comprehensive JSON spec for all 47 components, including
// props, variants, states, token references, and anatomy descriptions.
// Designers use this as a reference when building Figma components.

const SYSTEM_VERSION = "2.2.0"

interface PropSpec {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}

interface VariantSpec {
  name: string
  values: string[]
  description: string
}

interface ComponentSpec {
  name: string
  displayName: string
  category: "MUI-wrapped" | "Radix-based" | "Standalone"
  description: string
  props: PropSpec[]
  variants: VariantSpec[]
  states: string[]
  tokens: string[]
  anatomy: string[]
  figmaNotes?: string
}

const componentSpecs: ComponentSpec[] = [
  // ─── MUI-Wrapped Components ────────────────────────────
  {
    name: "TPButton",
    displayName: "Button",
    category: "MUI-wrapped",
    description: "Primary call-to-action component with multiple variants, sizes, and icon support.",
    props: [
      { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "danger"', default: '"primary"', description: "Visual style variant" },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Button size" },
      { name: "startIcon", type: "ReactNode", description: "Icon before label" },
      { name: "endIcon", type: "ReactNode", description: "Icon after label" },
      { name: "disabled", type: "boolean", default: "false", description: "Disabled state" },
      { name: "fullWidth", type: "boolean", default: "false", description: "Stretch to container width" },
      { name: "children", type: "ReactNode", required: true, description: "Button label" },
    ],
    variants: [
      { name: "variant", values: ["primary", "secondary", "outline", "ghost", "danger"], description: "Visual appearance" },
      { name: "size", values: ["sm (36px)", "md (42px)", "lg (48px)"], description: "Height and padding" },
      { name: "surface", values: ["light", "dark"], description: "Background context" },
    ],
    states: ["default", "hover", "active", "focus", "disabled", "loading"],
    tokens: ["--tp-blue-500 (primary bg)", "--tp-blue-600 (hover)", "--radius: 12px", "font-weight: 600", "font-size: 14px"],
    anatomy: ["Container", "StartIcon (optional)", "Label", "EndIcon (optional)"],
    figmaNotes: "Use auto-layout with 12px horizontal padding. Radius 12px on all corners.",
  },
  {
    name: "TPIconButton",
    displayName: "Icon Button",
    category: "MUI-wrapped",
    description: "Square icon-only button for toolbar actions.",
    props: [
      { name: "variant", type: '"primary" | "outline" | "ghost"', default: '"ghost"', description: "Visual variant" },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Button size" },
      { name: "children", type: "ReactNode", required: true, description: "Icon element" },
    ],
    variants: [
      { name: "variant", values: ["primary", "outline", "ghost"], description: "Visual appearance" },
      { name: "size", values: ["sm (32px)", "md (36px)", "lg (42px)"], description: "Dimensions" },
    ],
    states: ["default", "hover", "active", "focus", "disabled"],
    tokens: ["--tp-blue-500", "--radius: 10px"],
    anatomy: ["Container", "Icon"],
  },
  {
    name: "TPSplitButton",
    displayName: "Split Button",
    category: "MUI-wrapped",
    description: "Button with primary action and dropdown for secondary actions.",
    props: [
      { name: "label", type: "string", required: true, description: "Primary button label" },
      { name: "options", type: "{ label: string; onClick: () => void }[]", required: true, description: "Dropdown options" },
      { name: "variant", type: '"primary" | "outline"', default: '"primary"', description: "Visual variant" },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Button size" },
    ],
    variants: [
      { name: "variant", values: ["primary", "outline"], description: "Visual appearance" },
    ],
    states: ["default", "hover", "dropdown-open"],
    tokens: ["--tp-blue-500", "--radius: 12px"],
    anatomy: ["PrimaryButton", "Divider", "DropdownTrigger (ChevronDown)", "DropdownMenu"],
  },
  {
    name: "TPTextField",
    displayName: "Text Field",
    category: "MUI-wrapped",
    description: "Input field with label, helper text, and validation states.",
    props: [
      { name: "label", type: "string", description: "Field label" },
      { name: "placeholder", type: "string", description: "Placeholder text" },
      { name: "helperText", type: "string", description: "Helper or error message" },
      { name: "error", type: "boolean", default: "false", description: "Error state" },
      { name: "disabled", type: "boolean", default: "false", description: "Disabled state" },
      { name: "fullWidth", type: "boolean", default: "false", description: "Full width" },
      { name: "size", type: '"small" | "medium"', default: '"medium"', description: "Field size" },
    ],
    variants: [
      { name: "size", values: ["small", "medium"], description: "Input height" },
    ],
    states: ["default", "hover", "focus", "filled", "error", "disabled"],
    tokens: ["--tp-blue-500 (focus ring)", "--tp-slate-200 (border)", "--radius: 10px", "border-width: 1px (default), 2px (focus)"],
    anatomy: ["Label", "InputContainer", "Input", "HelperText"],
    figmaNotes: "Focus state: 2px #4B4AD5 border + 3px blue ring. Filled state: 1px #A2A2A8 border.",
  },
  {
    name: "TPCard",
    displayName: "Card",
    category: "MUI-wrapped",
    description: "Surface container with optional header, content, and action areas.",
    props: [
      { name: "elevation", type: "number", default: "1", description: "Shadow elevation (0-6)" },
      { name: "children", type: "ReactNode", required: true, description: "Card content" },
    ],
    variants: [],
    states: ["default", "hover (if interactive)"],
    tokens: ["--card (#FFFFFF)", "--radius: 12px", "--shadow-sm"],
    anatomy: ["Container", "TPCardHeader (optional)", "TPCardContent", "TPCardActions (optional)"],
  },
  {
    name: "TPChip",
    displayName: "Chip",
    category: "MUI-wrapped",
    description: "Compact element for tags, filters, or selections.",
    props: [
      { name: "label", type: "string", required: true, description: "Chip text" },
      { name: "variant", type: '"filled" | "outlined"', default: '"filled"', description: "Visual style" },
      { name: "color", type: '"default" | "primary" | "success" | "error" | "warning"', default: '"default"', description: "Color theme" },
      { name: "onDelete", type: "() => void", description: "Shows delete icon when provided" },
      { name: "size", type: '"small" | "medium"', default: '"medium"', description: "Chip size" },
    ],
    variants: [
      { name: "variant", values: ["filled", "outlined"], description: "Fill style" },
      { name: "color", values: ["default", "primary", "success", "error", "warning"], description: "Color theme" },
    ],
    states: ["default", "hover", "active", "disabled"],
    tokens: ["--tp-blue-500 (primary)", "--radius: 16px (pill)"],
    anatomy: ["Container", "Avatar (optional)", "Label", "DeleteIcon (optional)"],
  },
  {
    name: "TPAlert",
    displayName: "Alert",
    category: "MUI-wrapped",
    description: "Contextual feedback message with severity levels.",
    props: [
      { name: "severity", type: '"info" | "success" | "warning" | "error"', default: '"info"', description: "Alert type" },
      { name: "variant", type: '"standard" | "filled" | "outlined"', default: '"standard"', description: "Visual style" },
      { name: "onClose", type: "() => void", description: "Close handler" },
      { name: "children", type: "ReactNode", required: true, description: "Alert message" },
    ],
    variants: [
      { name: "severity", values: ["info", "success", "warning", "error"], description: "Severity level" },
      { name: "variant", values: ["standard", "filled", "outlined"], description: "Visual style" },
    ],
    states: ["default", "dismissing"],
    tokens: ["--tp-blue-500 (info)", "--tp-success-500", "--tp-warning-500", "--tp-error-500", "--radius: 10px"],
    anatomy: ["Container", "Icon", "Title (optional)", "Message", "CloseButton (optional)"],
  },
  {
    name: "TPDialog",
    displayName: "Dialog",
    category: "MUI-wrapped",
    description: "Modal overlay for focused user interactions.",
    props: [
      { name: "open", type: "boolean", required: true, description: "Open state" },
      { name: "onClose", type: "() => void", required: true, description: "Close handler" },
      { name: "maxWidth", type: '"xs" | "sm" | "md" | "lg"', default: '"sm"', description: "Max width" },
      { name: "fullScreen", type: "boolean", default: "false", description: "Full screen mode" },
    ],
    variants: [
      { name: "maxWidth", values: ["xs (360px)", "sm (480px)", "md (600px)", "lg (800px)"], description: "Maximum width" },
    ],
    states: ["open", "closed", "transitioning"],
    tokens: ["--card (#FFFFFF)", "--radius: 16px", "--shadow-xl"],
    anatomy: ["Backdrop", "Container", "TPDialogTitle", "TPDialogContent", "TPDialogActions"],
  },
  {
    name: "TPTabs",
    displayName: "Tabs",
    category: "MUI-wrapped",
    description: "Tab navigation for switching between views.",
    props: [
      { name: "value", type: "string | number", required: true, description: "Active tab value" },
      { name: "onChange", type: "(event, value) => void", required: true, description: "Tab change handler" },
      { name: "children", type: "ReactNode", required: true, description: "TPTab elements" },
    ],
    variants: [],
    states: ["default", "active", "hover", "disabled"],
    tokens: ["--tp-blue-500 (active indicator)", "--tp-slate-600 (text)", "border-bottom: 2px"],
    anatomy: ["TabContainer", "TabItem[]", "ActiveIndicator"],
  },
  {
    name: "TPTable",
    displayName: "Table",
    category: "MUI-wrapped",
    description: "Data table with header, body, sortable columns, and pagination.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Table content" },
    ],
    variants: [],
    states: ["default", "row-hover", "row-selected", "sorting"],
    tokens: ["--card (#FFFFFF)", "--tp-slate-50 (header bg)", "--tp-slate-200 (border)"],
    anatomy: ["TPTableHead", "TPTableBody", "TPTableRow", "TPTableCell"],
  },
  {
    name: "TPCheckbox",
    displayName: "Checkbox",
    category: "MUI-wrapped",
    description: "Boolean selection control.",
    props: [
      { name: "checked", type: "boolean", description: "Checked state" },
      { name: "onChange", type: "(event) => void", description: "Change handler" },
      { name: "label", type: "string", description: "Checkbox label" },
      { name: "disabled", type: "boolean", default: "false", description: "Disabled state" },
    ],
    variants: [],
    states: ["unchecked", "checked", "indeterminate", "hover", "focus", "disabled"],
    tokens: ["--tp-blue-500 (checked)", "--radius: 4px"],
    anatomy: ["Container", "CheckboxInput", "Checkmark", "Label"],
  },
  {
    name: "TPRadio",
    displayName: "Radio",
    category: "MUI-wrapped",
    description: "Single-selection control within a group.",
    props: [
      { name: "value", type: "string", required: true, description: "Radio value" },
      { name: "label", type: "string", description: "Radio label" },
      { name: "disabled", type: "boolean", default: "false", description: "Disabled state" },
    ],
    variants: [],
    states: ["unselected", "selected", "hover", "focus", "disabled"],
    tokens: ["--tp-blue-500 (selected)"],
    anatomy: ["Container", "RadioInput", "Dot", "Label"],
  },
  {
    name: "TPSwitch",
    displayName: "Switch",
    category: "MUI-wrapped",
    description: "Toggle control for binary settings.",
    props: [
      { name: "checked", type: "boolean", description: "On/off state" },
      { name: "onChange", type: "(event) => void", description: "Change handler" },
      { name: "disabled", type: "boolean", default: "false", description: "Disabled state" },
    ],
    variants: [],
    states: ["off", "on", "hover", "focus", "disabled"],
    tokens: ["--tp-blue-500 (on track)", "--tp-slate-300 (off track)"],
    anatomy: ["Track", "Thumb"],
  },
  {
    name: "TPSelect",
    displayName: "Select",
    category: "MUI-wrapped",
    description: "Dropdown selection field.",
    props: [
      { name: "value", type: "string", required: true, description: "Selected value" },
      { name: "onChange", type: "(event) => void", required: true, description: "Change handler" },
      { name: "label", type: "string", description: "Field label" },
      { name: "children", type: "ReactNode", required: true, description: "MenuItem elements" },
    ],
    variants: [],
    states: ["default", "hover", "focus", "open", "disabled", "error"],
    tokens: ["--tp-blue-500 (focus)", "--tp-slate-200 (border)", "--radius: 10px"],
    anatomy: ["Label", "SelectContainer", "SelectedValue", "ChevronIcon", "Dropdown", "Options"],
  },
  {
    name: "TPSnackbar",
    displayName: "Snackbar",
    category: "MUI-wrapped",
    description: "Brief notification at the bottom of the screen.",
    props: [
      { name: "open", type: "boolean", required: true, description: "Visibility" },
      { name: "message", type: "string", required: true, description: "Snackbar message" },
      { name: "severity", type: '"info" | "success" | "warning" | "error"', default: '"info"', description: "Severity" },
      { name: "onClose", type: "() => void", description: "Close handler" },
      { name: "autoHideDuration", type: "number", default: "4000", description: "Auto-dismiss (ms)" },
    ],
    variants: [
      { name: "severity", values: ["info", "success", "warning", "error"], description: "Severity" },
    ],
    states: ["visible", "hidden", "transitioning"],
    tokens: ["--radius: 10px", "--shadow-lg"],
    anatomy: ["Container", "Icon", "Message", "CloseButton"],
  },
  {
    name: "TPTooltip",
    displayName: "Tooltip",
    category: "MUI-wrapped",
    description: "Informational popup on hover.",
    props: [
      { name: "title", type: "ReactNode", required: true, description: "Tooltip content" },
      { name: "placement", type: '"top" | "bottom" | "left" | "right"', default: '"top"', description: "Position" },
      { name: "children", type: "ReactNode", required: true, description: "Trigger element" },
    ],
    variants: [
      { name: "placement", values: ["top", "bottom", "left", "right"], description: "Position" },
    ],
    states: ["hidden", "visible"],
    tokens: ["--tp-slate-800 (bg)", "--radius: 6px"],
    anatomy: ["Arrow", "Container", "Content"],
  },
  {
    name: "TPBadge",
    displayName: "Badge",
    category: "MUI-wrapped",
    description: "Small status indicator on avatars or icons.",
    props: [
      { name: "badgeContent", type: "ReactNode", description: "Badge content (number or text)" },
      { name: "color", type: '"primary" | "error" | "success" | "warning"', default: '"primary"', description: "Badge color" },
      { name: "children", type: "ReactNode", required: true, description: "Wrapped element" },
    ],
    variants: [
      { name: "color", values: ["primary", "error", "success", "warning"], description: "Badge color" },
    ],
    states: ["visible", "hidden (0 or null content)"],
    tokens: ["--tp-blue-500 (primary)", "--tp-error-500"],
    anatomy: ["ChildElement", "BadgeDot"],
  },
  {
    name: "TPAvatar",
    displayName: "Avatar",
    category: "MUI-wrapped",
    description: "User or entity representation with image, initials, or icon.",
    props: [
      { name: "src", type: "string", description: "Image URL" },
      { name: "alt", type: "string", description: "Alt text" },
      { name: "children", type: "ReactNode", description: "Initials or icon fallback" },
      { name: "size", type: "number", default: "40", description: "Size in px" },
    ],
    variants: [],
    states: ["image", "initials", "icon-fallback"],
    tokens: ["--tp-blue-100 (fallback bg)", "--tp-blue-600 (initials text)", "--radius: 50% (circle)"],
    anatomy: ["Container", "Image | Initials | Icon"],
  },
  {
    name: "TPDivider",
    displayName: "Divider",
    category: "MUI-wrapped",
    description: "Visual separator between sections.",
    props: [
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction" },
    ],
    variants: [
      { name: "orientation", values: ["horizontal", "vertical"], description: "Direction" },
    ],
    states: [],
    tokens: ["--tp-slate-200 (color)", "height: 1px"],
    anatomy: ["Line"],
  },
  {
    name: "TPBreadcrumbs",
    displayName: "Breadcrumbs",
    category: "MUI-wrapped",
    description: "Navigation path showing current location in hierarchy.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Breadcrumb items (TPLink elements)" },
    ],
    variants: [],
    states: ["default", "last-item-active"],
    tokens: ["--tp-blue-500 (links)", "--tp-slate-500 (separators)"],
    anatomy: ["Container", "BreadcrumbItem[]", "Separator"],
  },
  {
    name: "TPPagination",
    displayName: "Pagination",
    category: "MUI-wrapped",
    description: "Page navigation for data sets.",
    props: [
      { name: "count", type: "number", required: true, description: "Total pages" },
      { name: "page", type: "number", required: true, description: "Current page" },
      { name: "onChange", type: "(event, page) => void", required: true, description: "Page change handler" },
    ],
    variants: [],
    states: ["default", "active-page", "hover", "disabled (first/last)"],
    tokens: ["--tp-blue-500 (active)", "--radius: 8px"],
    anatomy: ["PrevButton", "PageNumbers", "NextButton"],
  },
  {
    name: "TPProgress",
    displayName: "Progress",
    category: "MUI-wrapped",
    description: "Linear progress indicator.",
    props: [
      { name: "value", type: "number", description: "Progress value (0-100)" },
      { name: "variant", type: '"determinate" | "indeterminate"', default: '"determinate"', description: "Progress type" },
    ],
    variants: [
      { name: "variant", values: ["determinate", "indeterminate"], description: "Type" },
    ],
    states: ["loading", "complete"],
    tokens: ["--tp-blue-500 (fill)", "--tp-slate-200 (track)", "--radius: 4px", "height: 6px"],
    anatomy: ["Track", "Fill"],
  },
  {
    name: "TPSkeleton",
    displayName: "Skeleton",
    category: "MUI-wrapped",
    description: "Loading placeholder with pulse animation.",
    props: [
      { name: "variant", type: '"text" | "rectangular" | "circular"', default: '"text"', description: "Shape" },
      { name: "width", type: "number | string", description: "Width" },
      { name: "height", type: "number | string", description: "Height" },
    ],
    variants: [
      { name: "variant", values: ["text", "rectangular", "circular"], description: "Shape" },
    ],
    states: ["loading (pulsing)"],
    tokens: ["--tp-slate-200 (base)", "--tp-slate-100 (highlight)", "--radius: varies"],
    anatomy: ["AnimatedShape"],
  },
  {
    name: "TPAccordion",
    displayName: "Accordion",
    category: "MUI-wrapped",
    description: "Expandable content sections.",
    props: [
      { name: "expanded", type: "boolean", description: "Controlled expand state" },
      { name: "onChange", type: "(event, expanded) => void", description: "Expand handler" },
      { name: "children", type: "ReactNode", required: true, description: "Summary + Details" },
    ],
    variants: [],
    states: ["collapsed", "expanded", "hover", "disabled"],
    tokens: ["--card (#FFFFFF)", "--tp-slate-200 (border)", "--radius: 10px"],
    anatomy: ["Container", "TPAccordionSummary (header + chevron)", "TPAccordionDetails (content)"],
  },
  {
    name: "TPSlider",
    displayName: "Slider",
    category: "MUI-wrapped",
    description: "Range selection control.",
    props: [
      { name: "value", type: "number | number[]", required: true, description: "Current value" },
      { name: "onChange", type: "(event, value) => void", required: true, description: "Change handler" },
      { name: "min", type: "number", default: "0", description: "Minimum value" },
      { name: "max", type: "number", default: "100", description: "Maximum value" },
      { name: "step", type: "number", default: "1", description: "Step increment" },
    ],
    variants: [],
    states: ["default", "hover", "active", "disabled"],
    tokens: ["--tp-blue-500 (thumb + active track)", "--tp-slate-200 (inactive track)"],
    anatomy: ["Track", "ActiveTrack", "Thumb", "ValueLabel (optional)"],
  },
  // ─── Radix-Based Components ────────────────────────────
  {
    name: "TPDrawer",
    displayName: "Drawer",
    category: "Radix-based",
    description: "Slide-out panel from the edge of the screen (via Vaul).",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Trigger + Content" },
    ],
    variants: [],
    states: ["closed", "open", "transitioning"],
    tokens: ["--card (#FFFFFF)", "--radius: 16px (top corners)", "--shadow-xl"],
    anatomy: ["Overlay", "TPDrawerContent", "TPDrawerHeader", "TPDrawerTitle", "TPDrawerDescription", "Body", "TPDrawerClose"],
  },
  {
    name: "TPDropdownMenu",
    displayName: "Dropdown Menu",
    category: "Radix-based",
    description: "Context menu or action menu triggered by a button.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Trigger + Content" },
    ],
    variants: [],
    states: ["closed", "open"],
    tokens: ["--card (#FFFFFF)", "--radius: 10px", "--shadow-lg", "--tp-blue-50 (item hover)"],
    anatomy: ["TPDropdownMenuTrigger", "TPDropdownMenuContent", "TPDropdownMenuLabel", "TPDropdownMenuItem[]", "TPDropdownMenuSeparator"],
  },
  {
    name: "TPPopover",
    displayName: "Popover",
    category: "Radix-based",
    description: "Floating content panel triggered by a button.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Trigger + Content" },
    ],
    variants: [],
    states: ["closed", "open"],
    tokens: ["--card (#FFFFFF)", "--radius: 12px", "--shadow-lg"],
    anatomy: ["TPPopoverTrigger", "TPPopoverContent"],
  },
  {
    name: "TPCommand",
    displayName: "Command Palette",
    category: "Radix-based",
    description: "Searchable command menu (via cmdk).",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Input + List + Groups" },
    ],
    variants: [],
    states: ["idle", "searching", "no-results"],
    tokens: ["--card (#FFFFFF)", "--tp-slate-200 (border)", "--radius: 12px"],
    anatomy: ["TPCommandInput", "TPCommandList", "TPCommandEmpty", "TPCommandGroup[]", "TPCommandItem[]"],
  },
  {
    name: "TPOTPInput",
    displayName: "OTP Input",
    category: "Radix-based",
    description: "One-time password input with individual character slots.",
    props: [
      { name: "maxLength", type: "number", default: "6", description: "Number of digits" },
      { name: "value", type: "string", description: "Current value" },
      { name: "onChange", type: "(value: string) => void", description: "Change handler" },
    ],
    variants: [],
    states: ["empty", "filling", "complete", "error"],
    tokens: ["--tp-blue-500 (focus)", "--tp-slate-200 (border)", "--radius: 10px"],
    anatomy: ["TPOTPGroup", "TPOTPSlot[] (one per digit)"],
  },
  // ─── Standalone Components ────────────────────────────
  {
    name: "TPSegmentedControl",
    displayName: "Segmented Control",
    category: "Standalone",
    description: "iOS-style segmented toggle for mutually exclusive options.",
    props: [
      { name: "options", type: "{ value: string; label: string }[]", required: true, description: "Options list" },
      { name: "value", type: "string", required: true, description: "Selected value" },
      { name: "onChange", type: "(value: string) => void", required: true, description: "Change handler" },
    ],
    variants: [],
    states: ["default", "active-segment", "hover"],
    tokens: ["--tp-slate-100 (track bg)", "--card (#FFFFFF active bg)", "--radius: 10px", "--shadow-sm (active)"],
    anatomy: ["Track", "Segment[]", "ActiveIndicator"],
  },
  {
    name: "TPTag",
    displayName: "Tag",
    category: "Standalone",
    description: "Compact label with optional remove action.",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Tag label" },
      { name: "variant", type: '"default" | "primary" | "success" | "warning" | "error"', default: '"default"', description: "Color variant" },
      { name: "removable", type: "boolean", default: "false", description: "Shows remove button" },
      { name: "onRemove", type: "() => void", description: "Remove handler" },
    ],
    variants: [
      { name: "variant", values: ["default", "primary", "success", "warning", "error"], description: "Color theme" },
    ],
    states: ["default", "hover (if removable)"],
    tokens: ["--radius: 6px", "padding: 2px 8px", "font-size: 12px"],
    anatomy: ["Container", "Label", "RemoveIcon (X)"],
  },
  {
    name: "TPBanner",
    displayName: "Banner",
    category: "Standalone",
    description: "Full-width notification bar with severity levels.",
    props: [
      { name: "severity", type: '"info" | "success" | "warning" | "error"', default: '"info"', description: "Banner type" },
      { name: "children", type: "ReactNode", required: true, description: "Banner message" },
      { name: "onClose", type: "() => void", description: "Dismissible when provided" },
    ],
    variants: [
      { name: "severity", values: ["info", "success", "warning", "error"], description: "Severity level" },
    ],
    states: ["visible", "dismissed"],
    tokens: ["--tp-blue-50 (info bg)", "--tp-success-50", "--tp-warning-50", "--tp-error-50", "--radius: 10px"],
    anatomy: ["Container", "Icon (severity)", "Message", "CloseButton (optional)"],
  },
  {
    name: "TPSpinner",
    displayName: "Spinner",
    category: "Standalone",
    description: "Animated loading indicator.",
    props: [
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Spinner size" },
      { name: "color", type: "string", default: '"#4B4AD5"', description: "Spinner color" },
    ],
    variants: [
      { name: "size", values: ["sm (16px)", "md (24px)", "lg (32px)"], description: "Diameter" },
    ],
    states: ["spinning"],
    tokens: ["--tp-blue-500 (default color)"],
    anatomy: ["RotatingIcon (RefreshCw)"],
  },
  {
    name: "TPEmptyState",
    displayName: "Empty State",
    category: "Standalone",
    description: "Placeholder for empty data views.",
    props: [
      { name: "icon", type: "ReactNode", description: "Illustrative icon" },
      { name: "title", type: "string", required: true, description: "Heading" },
      { name: "description", type: "string", description: "Supporting text" },
      { name: "action", type: "ReactNode", description: "CTA button" },
    ],
    variants: [],
    states: ["default"],
    tokens: ["--tp-slate-400 (icon)", "--tp-slate-600 (title)", "--tp-slate-500 (description)"],
    anatomy: ["Icon", "Title", "Description", "ActionButton"],
  },
  {
    name: "TPDatePicker",
    displayName: "Date Picker",
    category: "Standalone",
    description: "Calendar-based date selection.",
    props: [
      { name: "value", type: "Date | undefined", description: "Selected date" },
      { name: "onChange", type: "(date: Date) => void", required: true, description: "Date change handler" },
      { name: "placeholder", type: "string", default: '"Pick a date"', description: "Input placeholder" },
    ],
    variants: [],
    states: ["empty", "selected", "calendar-open", "disabled"],
    tokens: ["--tp-blue-500 (selected day)", "--radius: 10px", "--shadow-lg (dropdown)"],
    anatomy: ["InputTrigger", "CalendarIcon", "CalendarDropdown", "MonthNav", "DayGrid"],
  },
  {
    name: "TPTimePicker",
    displayName: "Time Picker",
    category: "Standalone",
    description: "Time selection with hour/minute controls.",
    props: [
      { name: "value", type: "string", description: "Selected time (HH:mm)" },
      { name: "onChange", type: "(time: string) => void", required: true, description: "Time change handler" },
    ],
    variants: [],
    states: ["empty", "selected", "picker-open"],
    tokens: ["--tp-blue-500 (selected)", "--radius: 10px"],
    anatomy: ["InputTrigger", "ClockIcon", "TimeDropdown", "HourColumn", "MinuteColumn"],
  },
  {
    name: "TPNumberInput",
    displayName: "Number Input",
    category: "Standalone",
    description: "Numeric input with increment/decrement buttons.",
    props: [
      { name: "value", type: "number", required: true, description: "Current value" },
      { name: "onChange", type: "(value: number) => void", required: true, description: "Change handler" },
      { name: "min", type: "number", description: "Minimum value" },
      { name: "max", type: "number", description: "Maximum value" },
      { name: "step", type: "number", default: "1", description: "Increment step" },
    ],
    variants: [],
    states: ["default", "focus", "min-reached", "max-reached", "disabled"],
    tokens: ["--tp-blue-500 (focus)", "--tp-slate-200 (border)", "--radius: 10px"],
    anatomy: ["DecrementButton (Minus)", "NumberInput", "IncrementButton (Plus)"],
  },
  {
    name: "TPFileUpload",
    displayName: "File Upload",
    category: "Standalone",
    description: "Drag-and-drop file upload zone with file list.",
    props: [
      { name: "accept", type: "string", description: "Accepted file types" },
      { name: "multiple", type: "boolean", default: "false", description: "Allow multiple files" },
      { name: "maxSize", type: "number", description: "Max file size in bytes" },
      { name: "onUpload", type: "(files: File[]) => void", required: true, description: "Upload handler" },
    ],
    variants: [],
    states: ["empty", "dragging-over", "has-files", "uploading", "error"],
    tokens: ["--tp-blue-500 (drag highlight)", "--tp-slate-200 (border dashed)", "--radius: 12px"],
    anatomy: ["DropZone", "UploadIcon", "Instructions", "FileList", "FileItem (icon + name + size + remove)"],
  },
  {
    name: "TPStepper",
    displayName: "Stepper",
    category: "Standalone",
    description: "Multi-step progress indicator.",
    props: [
      { name: "steps", type: "{ label: string; description?: string }[]", required: true, description: "Step definitions" },
      { name: "activeStep", type: "number", required: true, description: "Current step index" },
    ],
    variants: [],
    states: ["completed-step", "active-step", "pending-step"],
    tokens: ["--tp-blue-500 (active)", "--tp-success-500 (completed)", "--tp-slate-300 (pending)"],
    anatomy: ["StepCircle (number or checkmark)", "StepLabel", "StepDescription", "Connector (line between steps)"],
  },
  {
    name: "TPRating",
    displayName: "Rating",
    category: "Standalone",
    description: "Star-based rating input.",
    props: [
      { name: "value", type: "number", required: true, description: "Current rating (0-5)" },
      { name: "onChange", type: "(value: number) => void", description: "Change handler" },
      { name: "readOnly", type: "boolean", default: "false", description: "Read-only mode" },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Star size" },
    ],
    variants: [
      { name: "size", values: ["sm (16px)", "md (24px)", "lg (32px)"], description: "Star size" },
    ],
    states: ["empty", "partial", "full", "hover-preview"],
    tokens: ["--tp-amber-500 (filled star)", "--tp-slate-300 (empty star)"],
    anatomy: ["StarContainer", "Star[] (filled or outlined)"],
  },
  {
    name: "TPTimeline",
    displayName: "Timeline",
    category: "Standalone",
    description: "Vertical timeline for chronological events.",
    props: [
      { name: "items", type: "{ title: string; description?: string; date?: string; icon?: ReactNode }[]", required: true, description: "Timeline events" },
    ],
    variants: [],
    states: ["default"],
    tokens: ["--tp-blue-500 (active dot)", "--tp-slate-300 (line)", "--tp-slate-200 (inactive dot)"],
    anatomy: ["TimelineItem[]", "Dot", "Connector", "Content (title + description + date)"],
  },
  {
    name: "TPTreeView",
    displayName: "Tree View",
    category: "Standalone",
    description: "Hierarchical tree structure with expand/collapse.",
    props: [
      { name: "data", type: "TPTreeNode[]", required: true, description: "Tree data (recursive)" },
      { name: "onSelect", type: "(node: TPTreeNode) => void", description: "Selection handler" },
    ],
    variants: [],
    states: ["collapsed", "expanded", "selected", "hover"],
    tokens: ["--tp-blue-50 (selected bg)", "--tp-slate-600 (text)", "--tp-slate-300 (expand icon)"],
    anatomy: ["TreeNode[]", "ExpandIcon (ChevronRight)", "FolderIcon", "FileIcon", "NodeLabel"],
  },
  {
    name: "TPColorPicker",
    displayName: "Color Picker",
    category: "Standalone",
    description: "Color selection with preset swatches and hex input.",
    props: [
      { name: "value", type: "string", required: true, description: "Selected color (hex)" },
      { name: "onChange", type: "(color: string) => void", required: true, description: "Color change handler" },
      { name: "presets", type: "string[]", description: "Preset color swatches" },
    ],
    variants: [],
    states: ["closed", "open", "custom-input"],
    tokens: ["--radius: 10px", "--shadow-lg (dropdown)"],
    anatomy: ["ColorSwatch (trigger)", "Dropdown", "PresetGrid", "HexInput"],
  },
  {
    name: "TPTransferList",
    displayName: "Transfer List",
    category: "Standalone",
    description: "Two-column list for moving items between available and selected.",
    props: [
      { name: "available", type: "TPTransferItem[]", required: true, description: "Left column items" },
      { name: "selected", type: "TPTransferItem[]", required: true, description: "Right column items" },
      { name: "onChange", type: "(available, selected) => void", required: true, description: "Transfer handler" },
    ],
    variants: [],
    states: ["default", "items-checked", "searching"],
    tokens: ["--tp-blue-500 (selected)", "--tp-slate-200 (border)", "--radius: 10px"],
    anatomy: ["LeftPanel (Available)", "SearchInput", "ItemList", "TransferButtons (arrows)", "RightPanel (Selected)"],
  },
]

function buildComponentSpecsJson(): object {
  return {
    $schema: "TatvaPractice Component Specifications",
    $metadata: {
      name: "TatvaPractice Design System",
      version: SYSTEM_VERSION,
      exportedAt: new Date().toISOString(),
      totalComponents: componentSpecs.length,
      categories: {
        "MUI-wrapped": componentSpecs.filter((c) => c.category === "MUI-wrapped").length,
        "Radix-based": componentSpecs.filter((c) => c.category === "Radix-based").length,
        Standalone: componentSpecs.filter((c) => c.category === "Standalone").length,
      },
      description: "Comprehensive component specifications for building Figma component library. Each spec includes props, variants, states, token references, and anatomy.",
    },
    components: componentSpecs,
  }
}

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

export function exportComponentSpecs() {
  const data = buildComponentSpecsJson()
  download(data, `tatvapractice-component-specs-v${SYSTEM_VERSION}.json`)
}
