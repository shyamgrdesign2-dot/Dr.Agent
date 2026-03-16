"use client"

import { useState } from "react"
import { ComponentBlock } from "@/components/design-system/design-system-section"

// Import all 20 new TP components
import { TPDrawer, TPDrawerTrigger, TPDrawerContent, TPDrawerHeader, TPDrawerTitle, TPDrawerDescription, TPDrawerClose } from "@/components/tp-ui/tp-drawer"
import { TPDropdownMenu, TPDropdownMenuTrigger, TPDropdownMenuContent, TPDropdownMenuItem, TPDropdownMenuLabel, TPDropdownMenuSeparator } from "@/components/tp-ui/tp-dropdown-menu"
import { TPPopover, TPPopoverTrigger, TPPopoverContent } from "@/components/tp-ui/tp-popover"
import { TPSpinner } from "@/components/tp-ui/tp-spinner"
import { TPEmptyState } from "@/components/tp-ui/tp-empty-state"
import { TPCommand, TPCommandInput, TPCommandList, TPCommandEmpty, TPCommandGroup, TPCommandItem } from "@/components/tp-ui/tp-command"
import { TPOTPInput, TPOTPGroup, TPOTPSlot } from "@/components/tp-ui/tp-otp-input"
import { TPSegmentedControl } from "@/components/tp-ui/tp-segmented-control"
import { TPTag } from "@/components/tp-ui/tp-tag"
import { TPBanner } from "@/components/tp-ui/tp-banner"
import { TPDatePicker } from "@/components/tp-ui/tp-date-picker"
import { TPTimePicker } from "@/components/tp-ui/tp-time-picker"
import { TPNumberInput } from "@/components/tp-ui/tp-number-input"
import { TPFileUpload } from "@/components/tp-ui/tp-file-upload"
import { TPStepper } from "@/components/tp-ui/tp-stepper"
import { TPRating } from "@/components/tp-ui/tp-rating"
import { TPTimeline } from "@/components/tp-ui/tp-timeline"
import { TPTreeView, type TPTreeNode } from "@/components/tp-ui/tp-tree-view"
import { TPColorPicker } from "@/components/tp-ui/tp-color-picker"
import { TPTransferList, type TPTransferItem } from "@/components/tp-ui/tp-transfer-list"

import { Search, Settings, User, LogOut, Pencil, FileText, FolderOpen, Trash2, Calendar, Clock, CheckCircle2, AlertTriangle, Info } from "lucide-react"

// ─── Drawer Showcase ─────────────────────────────────────────
function DrawerDemo() {
  return (
    <TPDrawer>
      <TPDrawerTrigger asChild>
        <button className="rounded-[10px] bg-tp-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-tp-blue-600 transition-colors">
          Open Drawer
        </button>
      </TPDrawerTrigger>
      <TPDrawerContent>
        <TPDrawerHeader>
          <TPDrawerTitle>Patient Details</TPDrawerTitle>
          <TPDrawerDescription>View and edit patient information.</TPDrawerDescription>
        </TPDrawerHeader>
        <div className="flex-1 px-6 py-4">
          <p className="text-sm text-tp-slate-600">Drawer body content goes here. Supports any layout.</p>
        </div>
      </TPDrawerContent>
    </TPDrawer>
  )
}

// ─── Dropdown Menu Showcase ──────────────────────────────────
function DropdownMenuDemo() {
  return (
    <TPDropdownMenu>
      <TPDropdownMenuTrigger asChild>
        <button className="rounded-[10px] border border-tp-slate-300 bg-white px-4 py-2 text-sm font-semibold text-tp-slate-700 hover:bg-tp-slate-50 transition-colors">
          Actions
        </button>
      </TPDropdownMenuTrigger>
      <TPDropdownMenuContent>
        <TPDropdownMenuLabel>Account</TPDropdownMenuLabel>
        <TPDropdownMenuItem>
          <User size={16} /> Profile
        </TPDropdownMenuItem>
        <TPDropdownMenuItem>
          <Settings size={16} /> Settings
        </TPDropdownMenuItem>
        <TPDropdownMenuSeparator />
        <TPDropdownMenuItem>
          <LogOut size={16} /> Sign out
        </TPDropdownMenuItem>
      </TPDropdownMenuContent>
    </TPDropdownMenu>
  )
}

// ─── Popover Showcase ────────────────────────────────────────
function PopoverDemo() {
  return (
    <TPPopover>
      <TPPopoverTrigger asChild>
        <button className="rounded-[10px] border border-tp-slate-300 bg-white px-4 py-2 text-sm font-semibold text-tp-slate-700 hover:bg-tp-slate-50 transition-colors">
          Show Popover
        </button>
      </TPPopoverTrigger>
      <TPPopoverContent>
        <h4 className="mb-1 text-sm font-semibold text-tp-slate-900">Quick Info</h4>
        <p className="text-sm text-tp-slate-500">This is a floating popover with TP styling. 12px radius, subtle shadow.</p>
      </TPPopoverContent>
    </TPPopover>
  )
}

// ─── Spinner Showcase ────────────────────────────────────────
function SpinnerDemo() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <TPSpinner size="sm" />
        <span className="text-xs text-tp-slate-400">SM</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TPSpinner size="md" />
        <span className="text-xs text-tp-slate-400">MD</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TPSpinner size="lg" />
        <span className="text-xs text-tp-slate-400">LG</span>
      </div>
    </div>
  )
}

// ─── Empty State Showcase ────────────────────────────────────
function EmptyStateDemo() {
  return (
    <TPEmptyState
      icon={<FileText size={24} />}
      title="No documents yet"
      description="Upload your first document to get started with the patient record system."
      action={
        <button className="rounded-[10px] bg-tp-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-tp-blue-600">
          Upload Document
        </button>
      }
    />
  )
}

// ─── Command Showcase ────────────────────────────────────────
function CommandDemo() {
  return (
    <TPCommand className="max-w-sm">
      <TPCommandInput placeholder="Search commands..." />
      <TPCommandList>
        <TPCommandEmpty>No results found.</TPCommandEmpty>
        <TPCommandGroup heading="Actions">
          <TPCommandItem><Pencil size={16} /> Edit Patient</TPCommandItem>
          <TPCommandItem><Calendar size={16} /> Schedule Visit</TPCommandItem>
          <TPCommandItem><FileText size={16} /> Create Report</TPCommandItem>
        </TPCommandGroup>
      </TPCommandList>
    </TPCommand>
  )
}

// ─── OTP Input Showcase ──────────────────────────────────────
function OTPInputDemo() {
  const [otp, setOtp] = useState("")
  return (
    <div className="flex flex-col gap-2">
      <TPOTPInput maxLength={4} value={otp} onChange={setOtp}>
        <TPOTPGroup>
          <TPOTPSlot index={0} />
          <TPOTPSlot index={1} />
          <TPOTPSlot index={2} />
          <TPOTPSlot index={3} />
        </TPOTPGroup>
      </TPOTPInput>
      <p className="text-xs text-tp-slate-400">Enter 4-digit code</p>
    </div>
  )
}

// ─── Segmented Control Showcase ──────────────────────────────
function SegmentedDemo() {
  const [view, setView] = useState("day")
  return (
    <div className="flex flex-col gap-3">
      <TPSegmentedControl
        value={view}
        onValueChange={setView}
        items={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />
      <TPSegmentedControl
        value={view}
        onValueChange={setView}
        size="sm"
        items={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />
    </div>
  )
}

// ─── Tag Showcase ────────────────────────────────────────────
function TagDemo() {
  const colors = ["blue", "violet", "amber", "success", "error", "warning", "slate"] as const
  const variants = ["light", "medium", "filled", "outline"] as const
  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          <span className="w-14 text-xs font-medium text-tp-slate-400">{variant}</span>
          {colors.map((color) => (
            <TPTag key={`${variant}-${color}`} color={color} variant={variant} size="md">
              {color}
            </TPTag>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2">
        <span className="w-14 text-xs font-medium text-tp-slate-400">remove</span>
        <TPTag color="blue" onRemove={() => {}}>Removable</TPTag>
        <TPTag color="error" variant="medium" onRemove={() => {}}>Error</TPTag>
      </div>
    </div>
  )
}

// ─── Banner Showcase ─────────────────────────────────────────
function BannerDemo() {
  return (
    <div className="flex flex-col gap-3">
      <TPBanner status="info" title="System Update">Scheduled maintenance this Saturday.</TPBanner>
      <TPBanner status="success">Patient record saved successfully.</TPBanner>
      <TPBanner status="warning" dismissible>Your session expires in 5 minutes.</TPBanner>
      <TPBanner status="error" title="Connection Lost">Unable to reach the server.</TPBanner>
    </div>
  )
}

// ─── Date Picker Showcase ────────────────────────────────────
function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>()
  return (
    <div className="max-w-xs">
      <TPDatePicker value={date} onChange={setDate} />
      {date && <p className="mt-2 text-xs text-tp-slate-500">Selected: {date.toLocaleDateString()}</p>}
    </div>
  )
}

// ─── Time Picker Showcase ────────────────────────────────────
function TimePickerDemo() {
  const [time, setTime] = useState("09:30")
  return (
    <div className="flex gap-4">
      <div className="max-w-xs flex-1">
        <p className="mb-1 text-xs font-medium text-tp-slate-500">24h</p>
        <TPTimePicker value={time} onChange={setTime} />
      </div>
      <div className="max-w-xs flex-1">
        <p className="mb-1 text-xs font-medium text-tp-slate-500">12h</p>
        <TPTimePicker value={time} onChange={setTime} use24h={false} />
      </div>
    </div>
  )
}

// ─── Number Input Showcase ───────────────────────────────────
function NumberInputDemo() {
  const [qty, setQty] = useState(3)
  return <TPNumberInput value={qty} onChange={setQty} min={0} max={99} label="Quantity" />
}

// ─── File Upload Showcase ────────────────────────────────────
function FileUploadDemo() {
  return <TPFileUpload accept=".pdf,.doc,.docx,.jpg,.png" maxSize={5 * 1024 * 1024} multiple />
}

// ─── Stepper Showcase ────────────────────────────────────────
function StepperDemo() {
  const [step, setStep] = useState(1)
  return (
    <div className="flex flex-col gap-4">
      <TPStepper
        activeStep={step}
        steps={[
          { label: "Patient Info", description: "Basic details" },
          { label: "Medical History", description: "Past records" },
          { label: "Vitals", description: "Current readings" },
          { label: "Review", description: "Confirm & save" },
        ]}
      />
      <div className="flex gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} className="rounded-lg border border-tp-slate-300 px-3 py-1.5 text-sm font-medium text-tp-slate-700 hover:bg-tp-slate-50">
          Back
        </button>
        <button onClick={() => setStep(Math.min(3, step + 1))} className="rounded-lg bg-tp-blue-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-tp-blue-600">
          Next
        </button>
      </div>
    </div>
  )
}

// ─── Rating Showcase ─────────────────────────────────────────
function RatingDemo() {
  const [rating, setRating] = useState(3)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <TPRating value={rating} onChange={setRating} size="lg" />
        <span className="text-sm font-medium text-tp-slate-600">{rating}/5</span>
      </div>
      <div className="flex items-center gap-3">
        <TPRating value={4} readOnly size="sm" />
        <span className="text-xs text-tp-slate-400">Read-only</span>
      </div>
    </div>
  )
}

// ─── Timeline Showcase ───────────────────────────────────────
function TimelineDemo() {
  return (
    <TPTimeline
      items={[
        { title: "Patient checked in", timestamp: "9:00 AM", color: "blue", description: "Front desk registered the patient." },
        { title: "Vitals recorded", timestamp: "9:15 AM", color: "success", description: "BP: 120/80, HR: 72, Temp: 98.6°F" },
        { title: "Doctor consultation", timestamp: "9:30 AM", color: "violet" },
        { title: "Lab tests ordered", timestamp: "10:00 AM", color: "warning", description: "CBC, Lipid Panel, HbA1c" },
        { title: "Prescription issued", timestamp: "10:30 AM", color: "success" },
      ]}
    />
  )
}

// ─── Tree View Showcase ──────────────────────────────────────
function TreeViewDemo() {
  const [selected, setSelected] = useState("vitals")
  const nodes: TPTreeNode[] = [
    {
      id: "patients",
      label: "Patients",
      children: [
        { id: "active", label: "Active Patients" },
        { id: "archived", label: "Archived" },
      ],
    },
    {
      id: "records",
      label: "Medical Records",
      children: [
        { id: "vitals", label: "Vitals" },
        { id: "prescriptions", label: "Prescriptions" },
        { id: "lab-results", label: "Lab Results" },
      ],
    },
    { id: "settings", label: "Settings" },
  ]
  return <TPTreeView nodes={nodes} selectedId={selected} onSelect={setSelected} className="max-w-xs" />
}

// ─── Color Picker Showcase ───────────────────────────────────
function ColorPickerDemo() {
  const [color, setColor] = useState("#4B4AD5")
  return <TPColorPicker value={color} onChange={setColor} />
}

// ─── Transfer List Showcase ──────────────────────────────────
function TransferListDemo() {
  const [available, setAvailable] = useState<TPTransferItem[]>([
    { id: "1", label: "Dr. Andrew Chapman" },
    { id: "2", label: "Dr. Sarah Mitchell" },
    { id: "3", label: "Dr. Emily Chen" },
    { id: "4", label: "Dr. James Wilson" },
    { id: "5", label: "Dr. Michael Brown" },
  ])
  const [selected, setSelected] = useState<TPTransferItem[]>([
    { id: "6", label: "Dr. Lisa Park" },
  ])
  return (
    <TPTransferList
      available={available}
      selected={selected}
      onTransfer={(a, s) => { setAvailable(a); setSelected(s) }}
      availableTitle="All Doctors"
      selectedTitle="On Call"
    />
  )
}

// ─── Main Showcase Export ────────────────────────────────────
export function NewComponentsShowcase() {
  return (
    <div className="flex flex-col gap-8">
      <ComponentBlock id="tp-drawer" title="TPDrawer" badge="Overlay" description="TP-branded slide-out panel. Radius 20px, overlay backdrop, multiple sizes.">
        <DrawerDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-dropdown-menu" title="TPDropdownMenu" badge="Menu" description="Context and action menus. 12px radius, tp-blue hover, grouped items.">
        <DropdownMenuDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-popover" title="TPPopover" badge="Overlay" description="Floating content container. 12px radius, shadow-md.">
        <PopoverDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-spinner" title="TPSpinner" badge="Feedback" description="Loading spinner. 3 sizes, tp-blue-500 default color.">
        <SpinnerDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-empty-state" title="TPEmptyState" badge="Feedback" description="Zero/empty state display. Icon + title + description + optional action CTA.">
        <EmptyStateDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-command" title="TPCommand" badge="Input" description="Command palette (cmdk). Searchable, grouped items, keyboard navigation.">
        <CommandDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-otp-input" title="TPOTPInput" badge="Input" description="OTP code entry. 42px slots, 8px radius, tp-blue focus ring, auto-advance.">
        <OTPInputDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-segmented-control" title="TPSegmentedControl" badge="Navigation" description="Segmented toggle. Animated active indicator, 3 sizes.">
        <SegmentedDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-tag" title="TPTag" badge="Display" description="Multi-variant tag. 7 colors × 4 intensities, removable, with optional icon.">
        <TagDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-banner" title="TPBanner" badge="Feedback" description="Full-width status banner. Info, success, warning, error. Dismissible.">
        <BannerDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-date-picker" title="TPDatePicker" badge="Input" description="Date picker with popover calendar. DayPicker integration, tp-blue selection.">
        <DatePickerDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-time-picker" title="TPTimePicker" badge="Input" description="Time selection. Scrollable HH:MM columns in popover. 24h and 12h modes.">
        <TimePickerDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-number-input" title="TPNumberInput" badge="Input" description="Number stepper. 42px height, increment/decrement buttons, min/max/step.">
        <NumberInputDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-file-upload" title="TPFileUpload" badge="Input" description="File upload dropzone. Drag & drop, file list with remove, size validation.">
        <FileUploadDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-stepper" title="TPStepper" badge="Navigation" description="Multi-step progress. Horizontal layout, completed/active/pending states.">
        <StepperDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-rating" title="TPRating" badge="Input" description="Star rating. tp-amber-500 filled stars, 3 sizes, read-only mode.">
        <RatingDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-timeline" title="TPTimeline" badge="Display" description="Vertical activity timeline. Colored dots, timestamps, descriptions.">
        <TimelineDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-tree-view" title="TPTreeView" badge="Navigation" description="Hierarchical tree navigation. Recursive collapsible nodes, folder/file icons.">
        <TreeViewDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-color-picker" title="TPColorPicker" badge="Input" description="Color picker. TP palette swatches + custom hex input in popover.">
        <ColorPickerDemo />
      </ComponentBlock>

      <ComponentBlock id="tp-transfer-list" title="TPTransferList" badge="Input" description="Dual-list selector. Checkbox selection, move buttons, search filter.">
        <TransferListDemo />
      </ComponentBlock>
    </div>
  )
}
