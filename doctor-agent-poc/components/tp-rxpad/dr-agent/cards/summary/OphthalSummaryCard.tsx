"use client"

import React from "react"

import { CardShell } from "../CardShell"
import { InlineDataRow } from "../InlineDataRow"
import { InsightBox } from "../InsightBox"
import { SidebarLink } from "../SidebarLink"
import type { OphthalData } from "../../types"

interface OphthalSummaryCardProps {
  data: OphthalData
  onSidebarNav?: (tab: string) => void
}

export function OphthalSummaryCard({ data, onSidebarNav }: OphthalSummaryCardProps) {
  type FlagValue = "normal" | "high" | "low" | "warning" | "success"

  /* ─ OD (Right eye) values ─ */
  const odValues = [
    data.vaRight && { key: "UC Dist", value: data.vaRight },
    data.nearVaRight && { key: "UC Near", value: data.nearVaRight },
    data.glassPrescription && { key: "C Dist", value: data.glassPrescription },
  ].filter(Boolean) as Array<{ key: string; value: string; flag?: FlagValue }>

  /* ─ OS (Left eye) values ─ */
  const osValues = [
    data.vaLeft && { key: "UC Dist", value: data.vaLeft },
    data.nearVaLeft && { key: "UC Near", value: data.nearVaLeft },
  ].filter(Boolean) as Array<{ key: string; value: string; flag?: FlagValue }>

  /* ─ Supplementary findings (IOP, Slit Lamp, Fundus) ─ */
  const suppValues = [
    data.iop && { key: "IOP", value: data.iop },
    data.slitLamp && { key: "Slit Lamp", value: data.slitLamp },
    data.fundus && { key: "Fundus", value: data.fundus },
  ].filter(Boolean) as Array<{ key: string; value: string; flag?: FlagValue }>

  /* ─ Alerts ─ */
  const hasAlerts = data.alerts && data.alerts.length > 0
  const alertVariant = hasAlerts
    ? data.alerts!.some(
        (a) =>
          a.toLowerCase().includes("critical") ||
          a.toLowerCase().includes("severe"),
      )
      ? ("red" as const)
      : ("amber" as const)
    : undefined

  return (
    <CardShell
      icon={<span />}
      tpIconName="eye"
      title="Ophthal Summary"
      dataSources={["EMR Records"]}
      collapsible
      sidebarLink={
        onSidebarNav ? (
          <SidebarLink
            text="View detailed ophthal history"
            onClick={() => onSidebarNav("ophthal")}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-1">
        {/* OD line */}
        {odValues.length > 0 && (
          <InlineDataRow tag="OD (Right)" tagIcon="eye" values={odValues} source="existing" />
        )}

        {/* OS line */}
        {osValues.length > 0 && (
          <InlineDataRow tag="OS (Left)" tagIcon="eye" values={osValues} source="existing" />
        )}

        {/* Supplementary findings */}
        {suppValues.length > 0 && (
          <InlineDataRow tag="Findings" tagIcon="stethoscope" values={suppValues} source="existing" />
        )}

        {/* Alerts */}
        {hasAlerts && alertVariant && (
          <InsightBox variant={alertVariant}>
            {data.alerts!.join(" · ")}
          </InsightBox>
        )}
      </div>
    </CardShell>
  )
}
