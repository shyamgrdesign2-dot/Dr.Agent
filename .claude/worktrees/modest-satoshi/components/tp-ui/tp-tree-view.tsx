"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronRight, FolderOpen, Folder, File } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPTreeView — TP-branded hierarchical tree navigation.
 * Recursive collapsible tree with indent levels.
 */

export interface TPTreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TPTreeNode[]
}

interface TPTreeViewProps {
  nodes: TPTreeNode[]
  selectedId?: string
  onSelect?: (id: string) => void
  className?: string
}

function TreeNode({
  node,
  level,
  selectedId,
  onSelect,
  expanded,
  onToggle,
}: {
  node: TPTreeNode
  level: number
  selectedId?: string
  onSelect?: (id: string) => void
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded[node.id] ?? false
  const isSelected = selectedId === node.id

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (hasChildren) onToggle(node.id)
          onSelect?.(node.id)
        }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-sm transition-colors",
          isSelected
            ? "bg-tp-blue-50 text-tp-blue-700 font-medium"
            : "text-tp-slate-700 hover:bg-tp-slate-50",
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <ChevronRight
            size={14}
            style={{ flexShrink: 0 }}
            className={cn(
              "shrink-0 text-tp-slate-400 transition-transform",
              isExpanded && "rotate-90",
            )}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Icon */}
        {node.icon || (
          hasChildren ? (
            isExpanded ? (
              <FolderOpen size={16} style={{ flexShrink: 0 }} className="shrink-0 text-tp-amber-500" />
            ) : (
              <Folder size={16} style={{ flexShrink: 0 }} className="shrink-0 text-tp-amber-500" />
            )
          ) : (
            <File size={16} style={{ flexShrink: 0 }} className="shrink-0 text-tp-slate-400" />
          )
        )}

        <span className="truncate">{node.label}</span>
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TPTreeView({ nodes, selectedId, onSelect, className }: TPTreeViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const handleToggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className={cn("rounded-xl border border-tp-slate-200 bg-white p-2", className)}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          expanded={expanded}
          onToggle={handleToggle}
        />
      ))}
    </div>
  )
}
