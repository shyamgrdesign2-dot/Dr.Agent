/**
 * TatvaPractice UI — Component Library
 *
 * Import from @tatvapractice/ui or @/components/tp-ui
 * Never use @mui/material directly in product code.
 */

// ─── MUI-wrapped Components ─────────────────────────────────
export { TPButton } from "./tp-button"
export { TPButton as TPButtonToken, TPIconButton, TPSplitButton } from "./button-system"
export { TPTextField } from "./tp-textfield"
export { TPCard, TPCardHeader, TPCardContent, TPCardActions } from "./tp-card"
export { TPChip } from "./tp-chip"
export { TPAlert } from "./tp-alert"
export {
  TPDialog,
  TPDialogTitle,
  TPDialogContent,
  TPDialogActions,
} from "./tp-dialog"
export { TPTabs, TPTab } from "./tp-tabs"
export { TPTable, TPTableHead, TPTableBody, TPTableRow, TPTableCell } from "./tp-table"
export { TPCheckbox } from "./tp-checkbox"
export { TPRadio, TPRadioGroup, FormControlLabel } from "./tp-radio"
export { TPSwitch } from "./tp-switch"
export { TPSelect } from "./tp-select"
export { TPSnackbar } from "./tp-snackbar"
export { TPTooltip } from "./tp-tooltip"
export { TPBadge } from "./tp-badge"
export { TPAvatar } from "./tp-avatar"
export { TPDivider } from "./tp-divider"
export { TPBreadcrumbs, TPLink, TPTypography } from "./tp-breadcrumbs"
export { TPPagination } from "./tp-pagination"
export { TPProgress } from "./tp-progress"
export { TPSkeleton } from "./tp-skeleton"
export { TPAccordion, TPAccordionSummary, TPAccordionDetails } from "./tp-accordion"
export { TPSlider } from "./tp-slider"

// ─── Radix / shadcn-based Components ────────────────────────
export {
  TPDrawer,
  TPDrawerTrigger,
  TPDrawerContent,
  TPDrawerHeader,
  TPDrawerTitle,
  TPDrawerDescription,
  TPDrawerClose,
} from "./tp-drawer"
export {
  TPDropdownMenu,
  TPDropdownMenuTrigger,
  TPDropdownMenuContent,
  TPDropdownMenuItem,
  TPDropdownMenuLabel,
  TPDropdownMenuSeparator,
} from "./tp-dropdown-menu"
export { TPPopover, TPPopoverTrigger, TPPopoverContent } from "./tp-popover"
export {
  TPCommand,
  TPCommandInput,
  TPCommandList,
  TPCommandEmpty,
  TPCommandGroup,
  TPCommandItem,
} from "./tp-command"
export { TPOTPInput, TPOTPGroup, TPOTPSlot } from "./tp-otp-input"

// ─── Standalone Components ──────────────────────────────────
export { TPSpinner } from "./tp-spinner"
export { TPEmptyState } from "./tp-empty-state"
export { TPSegmentedControl } from "./tp-segmented-control"
export { TPTag } from "./tp-tag"
export { TPBanner } from "./tp-banner"
export { TPDatePicker } from "./tp-date-picker"
export { TPTimePicker } from "./tp-time-picker"
export { TPNumberInput } from "./tp-number-input"
export { TPFileUpload } from "./tp-file-upload"
export { TPStepper } from "./tp-stepper"
export { TPRating } from "./tp-rating"
export { TPTimeline } from "./tp-timeline"
export { TPTreeView } from "./tp-tree-view"
export type { TPTreeNode } from "./tp-tree-view"
export { TPColorPicker } from "./tp-color-picker"
export { TPTransferList } from "./tp-transfer-list"
export type { TPTransferItem } from "./tp-transfer-list"
