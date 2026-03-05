"use client"

import MuiAvatar from "@mui/material/Avatar"
import type { AvatarProps } from "@mui/material/Avatar"

export interface TPAvatarProps extends AvatarProps {}

export function TPAvatar(props: TPAvatarProps) {
  return <MuiAvatar {...props} />
}
