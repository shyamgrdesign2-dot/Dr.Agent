"use client"

import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { tpTheme } from "@/lib/tp-mui-theme"

export function TPThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={tpTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
