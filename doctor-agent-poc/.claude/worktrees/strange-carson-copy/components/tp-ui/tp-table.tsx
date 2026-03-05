"use client"

import MuiTable from "@mui/material/Table"
import MuiTableHead from "@mui/material/TableHead"
import MuiTableBody from "@mui/material/TableBody"
import MuiTableRow from "@mui/material/TableRow"
import MuiTableCell from "@mui/material/TableCell"
import type { TableProps } from "@mui/material/Table"

export interface TPTableProps extends TableProps {}

export function TPTable(props: TPTableProps) {
  return <MuiTable {...props} />
}

export function TPTableHead(
  props: React.ComponentProps<typeof MuiTableHead>
) {
  return <MuiTableHead {...props} />
}

export function TPTableBody(
  props: React.ComponentProps<typeof MuiTableBody>
) {
  return <MuiTableBody {...props} />
}

export function TPTableRow(
  props: React.ComponentProps<typeof MuiTableRow>
) {
  return <MuiTableRow {...props} />
}

export function TPTableCell(
  props: React.ComponentProps<typeof MuiTableCell>
) {
  return <MuiTableCell {...props} />
}
