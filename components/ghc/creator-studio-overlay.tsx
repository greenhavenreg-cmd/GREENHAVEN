"use client"

import { useEffect, useState } from "react"
import { useDialogA11y } from "@/hooks/use-dialog-a11y"
import { CreatorStudioPanel } from "./creator-studio-panel"

export function CreatorStudioOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener("ghc:open-creator-studio", onOpen)
    return () => window.removeEventListener("ghc:open-creator-studio", onOpen)
  }, [])

  const panelRef = useDialogA11y<HTMLDivElement>(open, () => setOpen(false))

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Creator Studio"
        tabIndex={-1}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-background pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none sm:rounded-[1.75rem]">
        <CreatorStudioPanel onClose={() => setOpen(false)} />
      </div>
    </div>
  )
}
