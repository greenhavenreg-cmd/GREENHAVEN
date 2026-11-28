"use client"

/**
 * Create hub — four intentional actions:
 *  1) Post (unified text + photo + video + files)
 *  2) Poll
 *  3) Community board
 *  4) Challenge (reward quest)
 * Photo/Video are attachments inside Post — not separate product surfaces.
 */

import { useEffect, useMemo, useState } from "react"
import {
  X,
  PenLine,
  CircleDot,
  BarChart3,
  Users,
  Trophy,
  Lightbulb,
  MoreHorizontal,
  Bookmark,
  FileText,
  Images,
  BarChart3 as ActivityIcon,
  ChevronLeft,
} from "lucide-react"
import { useDialogA11y } from "@/hooks/use-dialog-a11y"

export type CreateHubAction = "post" | "story" | "poll" | "community" | "challenge"

const ACTIONS: {
  id: CreateHubAction
  label: string
  desc: string
  icon: typeof PenLine
  accent: string
}[] = [
  {
    id: "post",
    label: "Post",
    desc: "Text, photos, video & files",
    icon: PenLine,
    accent: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "story",
    label: "Story",
    desc: "24h status for friends & followers",
    icon: CircleDot,
    accent: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "poll",
    label: "Poll",
    desc: "Ask your network",
    icon: BarChart3,
    accent: "bg-amber-600/15 text-amber-800 dark:text-amber-200",
  },
  {
    id: "community",
    label: "Community",
    desc: "Post on a group board",
    icon: Users,
    accent: "bg-teal-600/15 text-teal-700 dark:text-teal-300",
  },
  {
    id: "challenge",
    label: "Challenge",
    desc: "Start a reward quest",
    icon: Trophy,
    accent: "bg-rose-600/15 text-rose-700 dark:text-rose-300",
  },
]

const HUB_TIPS = [
  "Share a moment with text, photos, or video in one post",
  "Stories disappear after 24 hours — great for casual updates",
  "💡 Ask a poll when you want a clear decision",
  "Challenges track meaningful participation (server-validated)",
  "Community boards keep group discussion organised",
] as const

export function CreateHubSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (action: CreateHubAction) => void
}) {
  const [showOthers, setShowOthers] = useState(false)
  const tip = useMemo(() => {
    try {
      return HUB_TIPS[Math.floor(Date.now() / (1000 * 60 * 30)) % HUB_TIPS.length]
    } catch {
      return HUB_TIPS[0]
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    const onVis = () => {
      if (document.hidden) onClose()
    }
    const onTab = () => onClose()
    window.addEventListener("keydown", onKey)
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("ghc:tab-change", onTab)
    window.addEventListener("ghc:close-transient-ui", onTab)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("ghc:tab-change", onTab)
      window.removeEventListener("ghc:close-transient-ui", onTab)
    }
  }, [open, onClose])

  useEffect(() => { if (open) setShowOthers(false) }, [open])

  const dialogRef = useDialogA11y<HTMLDivElement>(open, onClose)
  if (!open) return null

  const openOwnerTool = (tool: "drafts" | "saved" | "stories" | "activity") => {
    // The Create surface is only mounted inside the authenticated account shell.
    onClose()
    if (tool === "drafts" || tool === "activity") {
      window.dispatchEvent(new CustomEvent("ghc:open-creator-studio"))
    } else if (tool === "saved") {
      window.dispatchEvent(new CustomEvent("ghc:navigate-tab", { detail: "home" }))
      window.dispatchEvent(new CustomEvent("ghc:open-saved-posts"))
    } else {
      window.dispatchEvent(new CustomEvent("ghc:open-story-creator"))
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Create">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close create"
        onClick={onClose}
      />
      <div className="relative z-[81] max-h-[min(90dvh,44rem)] w-full max-w-[var(--gh-content-max,28rem)] overflow-y-auto overscroll-contain rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-card/95 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            {showOthers ? <button type="button" onClick={() => setShowOthers(false)} className="gh-hit-44 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted" aria-label="Back to create"><ChevronLeft size={18}/></button> : null}
            <div><p className="text-[15px] font-bold text-foreground">{showOthers ? "Others" : "Create"}</p><p className="text-[11px] text-muted-foreground">{showOthers ? "Private account tools" : "Share with GreenHaven"}</p></div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="gh-hit-44 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {showOthers ? (
          <div className="grid grid-cols-2 gap-2.5 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {[
              { id: "drafts" as const, label: "Drafts", desc: "Continue unfinished posts", icon: FileText },
              { id: "saved" as const, label: "Saved posts", desc: "Posts you bookmarked", icon: Bookmark },
              { id: "stories" as const, label: "Stories", desc: "Create a 24-hour story", icon: Images },
              { id: "activity" as const, label: "Creator activity", desc: "Your posts and performance", icon: ActivityIcon },
            ].map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => openOwnerTool(item.id)} className="flex min-h-[5.5rem] items-center gap-3 rounded-2xl border border-border bg-background p-3 text-left transition-colors hover:border-emerald-400/70 hover:bg-emerald-50/40 active:bg-muted dark:hover:bg-emerald-950/20"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground"><Icon size={19}/></span><span className="min-w-0"><span className="block text-[13px] font-bold text-foreground">{item.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{item.desc}</span></span></button> })}
          </div>
        ) : (
          <>
            <div className="px-4 pt-3">
              <div className="flex items-start gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/40">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                <p className="text-[12px] leading-relaxed text-emerald-900 dark:text-emerald-100">{tip}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {ACTIONS.map((a) => { const Icon = a.icon; return <button key={a.id} type="button" onClick={() => { onSelect(a.id); onClose() }} className="flex min-h-[7rem] flex-col items-start gap-2 rounded-2xl border border-border bg-background px-3.5 py-3.5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 active:bg-muted dark:hover:bg-emerald-950/30"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.accent}`}><Icon size={20} strokeWidth={2.25}/></span><span><span className="block text-[13px] font-bold text-foreground">{a.label}</span><span className="block text-[11px] text-muted-foreground">{a.desc}</span></span></button> })}
              <button type="button" onClick={() => setShowOthers(true)} className="col-span-2 flex min-h-12 items-center justify-between rounded-2xl border border-dashed border-border bg-muted/35 px-4 text-left transition-colors hover:bg-muted/70"><span className="flex items-center gap-2.5"><MoreHorizontal size={19}/><span className="text-[13px] font-bold text-foreground">Others</span></span><span className="text-[11px] text-muted-foreground">Drafts, saved posts, stories & more</span></button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateHubSheet
