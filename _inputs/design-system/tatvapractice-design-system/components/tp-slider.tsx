"use client"

import MuiSlider from "@mui/material/Slider"
import type { SliderProps } from "@mui/material/Slider"

export interface TPSliderProps extends Omit<SliderProps, "color"> {
  color?: "primary" | "secondary"
}

export function TPSlider({ color = "primary", ...props }: TPSliderProps) {
  return <MuiSlider color={color} {...props} />
}
