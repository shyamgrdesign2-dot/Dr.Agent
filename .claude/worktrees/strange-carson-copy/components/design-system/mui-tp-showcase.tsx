"use client"

import { useState } from "react"
import { MenuItem } from "@mui/material"
import {
  TPButton,
  TPTextField,
  TPCard,
  TPCardHeader,
  TPCardContent,
  TPCardActions,
  TPChip,
  TPAlert,
  TPDialog,
  TPDialogTitle,
  TPDialogContent,
  TPDialogActions,
  TPTabs,
  TPTab,
  TPTable,
  TPTableHead,
  TPTableBody,
  TPTableRow,
  TPTableCell,
  TPCheckbox,
  TPRadio,
  TPRadioGroup,
  FormControlLabel,
  TPSwitch,
  TPSelect,
  TPTooltip,
  TPBadge,
  TPAvatar,
  TPDivider,
  TPBreadcrumbs,
  TPLink,
  TPTypography,
  TPPagination,
  TPProgress,
  TPSkeleton,
  TPAccordion,
  TPAccordionSummary,
  TPAccordionDetails,
  TPSlider,
} from "@/components/tp-ui"
import { Box, Stack } from "@mui/material"

export function MuiTPShowcase() {
  const [tabValue, setTabValue] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [radioValue, setRadioValue] = useState("a")

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Buttons & CTA
        </h4>
        <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
          <TPButton variant="contained">Primary</TPButton>
          <TPButton variant="outlined">Secondary</TPButton>
          <TPButton variant="text">Tertiary</TPButton>
          <TPButton variant="contained" color="error">
            Destructive
          </TPButton>
          <TPButton variant="contained" disabled>
            Disabled
          </TPButton>
          <TPButton variant="contained" loading>
            Loading
          </TPButton>
          <TPButton variant="contained" size="small">
            Small
          </TPButton>
          <TPButton variant="contained" size="large">
            Large
          </TPButton>
        </Stack>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Form Controls
        </h4>
        <Stack gap={3} maxWidth={400}>
          <TPTextField label="Outlined" placeholder="Placeholder text" />
          <TPTextField label="With error" error helperText="Error message" />
          <Stack direction="row" gap={3} alignItems="center">
            <FormControlLabel control={<TPCheckbox />} label="Checkbox" />
            <FormControlLabel control={<TPCheckbox defaultChecked />} label="Checked" />
          </Stack>
          <TPRadioGroup value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
            <FormControlLabel value="a" control={<TPRadio />} label="Option A" />
            <FormControlLabel value="b" control={<TPRadio />} label="Option B" />
          </TPRadioGroup>
          <TPSwitch label="Toggle switch" defaultChecked />
          <TPSelect label="Select" defaultValue="">
            <MenuItem value="">Choose...</MenuItem>
            <MenuItem value="1">Option 1</MenuItem>
            <MenuItem value="2">Option 2</MenuItem>
          </TPSelect>
          <TPSlider defaultValue={50} valueLabelDisplay="auto" />
        </Stack>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Tabs
        </h4>
        <TPTabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <TPTab label="Overview" />
          <TPTab label="Details" />
          <TPTab label="Settings" />
        </TPTabs>
        <Box sx={{ py: 2 }}>
          {tabValue === 0 && <p className="text-sm text-tp-slate-600">Overview content</p>}
          {tabValue === 1 && <p className="text-sm text-tp-slate-600">Details content</p>}
          {tabValue === 2 && <p className="text-sm text-tp-slate-600">Settings content</p>}
        </Box>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Cards
        </h4>
        <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
          <TPCard sx={{ minWidth: 280 }}>
            <TPCardHeader title="Card Title" subheader="Subheader" />
            <TPCardContent>
              <p className="text-sm text-tp-slate-600">
                Card content with TP styling. Border radius 12px, shadow from design tokens.
              </p>
            </TPCardContent>
            <TPCardActions>
              <TPButton size="small">Action</TPButton>
            </TPCardActions>
          </TPCard>
        </Stack>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Chips & Tags
        </h4>
        <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
          <TPChip label="Default" />
          <TPChip label="Primary" color="primary" />
          <TPChip label="Success" color="success" />
          <TPChip label="Warning" color="warning" />
          <TPChip label="Error" color="error" />
          <TPChip label="Outlined" variant="outlined" />
          <TPChip label="With delete" onDelete={() => {}} />
        </Stack>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Alerts
        </h4>
        <Stack gap={2}>
          <TPAlert severity="success" title="Success">
            Operation completed successfully.
          </TPAlert>
          <TPAlert severity="warning" title="Warning">
            Please review before proceeding.
          </TPAlert>
          <TPAlert severity="error" title="Error">
            Something went wrong.
          </TPAlert>
          <TPAlert severity="info">Informational message.</TPAlert>
        </Stack>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Table
        </h4>
        <TPTable size="small">
          <TPTableHead>
            <TPTableRow>
              <TPTableCell>Name</TPTableCell>
              <TPTableCell>Status</TPTableCell>
              <TPTableCell>Date</TPTableCell>
            </TPTableRow>
          </TPTableHead>
          <TPTableBody>
            <TPTableRow>
              <TPTableCell>Patient A</TPTableCell>
              <TPTableCell>Active</TPTableCell>
              <TPTableCell>2024-01-15</TPTableCell>
            </TPTableRow>
            <TPTableRow>
              <TPTableCell>Patient B</TPTableCell>
              <TPTableCell>Pending</TPTableCell>
              <TPTableCell>2024-01-14</TPTableCell>
            </TPTableRow>
          </TPTableBody>
        </TPTable>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Feedback & Data Display
        </h4>
        <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center" useFlexGap>
          <TPTooltip title="Tooltip with TP styling">
            <span>
              <TPButton size="small">Hover</TPButton>
            </span>
          </TPTooltip>
          <TPBadge badgeContent={4} color="primary">
            <TPAvatar>JD</TPAvatar>
          </TPBadge>
          <TPAvatar>AB</TPAvatar>
          <TPProgress value={60} sx={{ width: 120 }} />
        </Stack>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Divider & Breadcrumbs
        </h4>
        <TPDivider sx={{ my: 1 }} />
        <TPBreadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <TPLink href="#" underline="hover">
            Home
          </TPLink>
          <TPLink href="#" underline="hover">
            Patients
          </TPLink>
          <TPTypography color="text.secondary">Patient Details</TPTypography>
        </TPBreadcrumbs>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Pagination & Accordion
        </h4>
        <Stack gap={2}>
          <TPPagination count={10} color="primary" size="small" />
          <TPAccordion>
            <TPAccordionSummary>Accordion header</TPAccordionSummary>
            <TPAccordionDetails>
              <p className="text-sm text-tp-slate-600">Accordion content with TP theme.</p>
            </TPAccordionDetails>
          </TPAccordion>
        </Stack>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tp-slate-600">
          Skeleton & Dialog
        </h4>
        <Stack gap={2}>
          <Stack direction="row" gap={2}>
            <TPSkeleton variant="circular" width={40} height={40} />
            <TPSkeleton variant="text" width={200} />
          </Stack>
          <TPButton variant="outlined" onClick={() => setDialogOpen(true)}>
            Open Dialog
          </TPButton>
        </Stack>
      </section>

      <TPDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <TPDialogTitle>Dialog Title</TPDialogTitle>
        <TPDialogContent>
          <p className="text-sm text-tp-slate-600">
            Modal with TP elevation, 20px border radius, dimmed backdrop.
          </p>
        </TPDialogContent>
        <TPDialogActions>
          <TPButton onClick={() => setDialogOpen(false)}>Cancel</TPButton>
          <TPButton variant="contained" onClick={() => setDialogOpen(false)}>
            Confirm
          </TPButton>
        </TPDialogActions>
      </TPDialog>
    </Box>
  )
}
