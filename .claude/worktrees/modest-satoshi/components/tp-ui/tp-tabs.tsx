"use client"

import MuiTabs from "@mui/material/Tabs"
import MuiTab from "@mui/material/Tab"
import type { TabsProps } from "@mui/material/Tabs"
import type { TabProps } from "@mui/material/Tab"

export interface TPTabsProps extends Omit<TabsProps, "indicatorColor" | "textColor"> {
  indicatorColor?: "primary" | "secondary"
  textColor?: "primary" | "secondary" | "inherit"
}

export function TPTabs(props: TPTabsProps) {
  return <MuiTabs indicatorColor="primary" textColor="primary" {...props} />
}

export interface TPTabProps extends TabProps {}

export function TPTab(props: TPTabProps) {
  return <MuiTab {...props} />
}
