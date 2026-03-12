"use client"

import * as React from "react"
import { useRef, useState, useCallback } from "react"
import { Upload, Trash2, File } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * TPFileUpload — TP-branded file upload dropzone.
 * Dashed border, DocumentUpload icon, drag & drop support.
 */

interface TPFileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // bytes
  onFilesChange?: (files: File[]) => void
  disabled?: boolean
  className?: string
}

export function TPFileUpload({
  accept,
  multiple = false,
  maxSize,
  onFilesChange,
  disabled = false,
  className,
}: TPFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return
      const arr = Array.from(newFiles).filter((f) => {
        if (maxSize && f.size > maxSize) return false
        return true
      })
      const updated = multiple ? [...files, ...arr] : arr.slice(0, 1)
      setFiles(updated)
      onFilesChange?.(updated)
    },
    [files, maxSize, multiple, onFilesChange],
  )

  const removeFile = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!disabled) addFiles(e.dataTransfer.files)
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer",
          dragging
            ? "border-tp-blue-400 bg-tp-blue-50/50"
            : "border-tp-slate-300 bg-tp-slate-50/50 hover:border-tp-blue-300 hover:bg-tp-blue-50/30",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <Upload size={28} style={{ flexShrink: 0 }} className="text-tp-slate-400" />
        <div>
          <p className="text-sm font-medium text-tp-slate-700">
            Drop files here or <span className="text-tp-blue-600">browse</span>
          </p>
          <p className="mt-0.5 text-xs text-tp-slate-400">
            {accept ? `Accepted: ${accept}` : "Any file type"}
            {maxSize && ` · Max ${formatSize(maxSize)}`}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => addFiles(e.target.files)}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-3 rounded-lg border border-tp-slate-200 bg-white px-3 py-2"
            >
              <File size={18} style={{ flexShrink: 0 }} className="shrink-0 text-tp-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-tp-slate-800">
                  {file.name}
                </p>
                <p className="text-xs text-tp-slate-400">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="shrink-0 text-tp-slate-400 hover:text-tp-error-500 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 size={16} style={{ flexShrink: 0 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
