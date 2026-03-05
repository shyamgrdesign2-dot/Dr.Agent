"use client"

import MuiAccordion from "@mui/material/Accordion"
import MuiAccordionSummary from "@mui/material/AccordionSummary"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import type { AccordionProps } from "@mui/material/Accordion"

export interface TPAccordionProps extends AccordionProps {}

export function TPAccordion(props: TPAccordionProps) {
  return <MuiAccordion disableGutters {...props} />
}

export function TPAccordionSummary(
  props: Omit<React.ComponentProps<typeof MuiAccordionSummary>, "expandIcon"> & {
    expandIcon?: React.ReactNode
  }
) {
  return (
    <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} {...props} />
  )
}

export function TPAccordionDetails(
  props: React.ComponentProps<typeof MuiAccordionDetails>
) {
  return <MuiAccordionDetails {...props} />
}
