"use client"

/**
 * Profile hierarchy — social-platform first.
 * Photo → Name → @handle → GH-ID → Location → Bio → Edit/Share → Stats → GreenHaven Identity
 */

import { useCallback, useMemo, useState } from "react"
import { Copy, Check, MapPin, Pencil, Share2, BadgeCheck } from "lucide-react"
import {
  getOrCreateGreenHavenId,
  formatGreenHavenIdDisplay,
} from "@/lib/domains/greenhaven-id"
import { GreenHavenIdentityCard } from "./greenhaven-identity-card"
import { SignatureGhIdCard } from "./signature-gh-id"
import { ExpandableBio } from "./profile-components"
import { ReputationBadge } from "./reputation-badge"

function toHandle(username?: string | null): string {
  // Pi username is the sole public handle. Preserve the verified username's exact spelling; never synthesize @USER from a display name.
  const canonical = String(username || "").trim().replace(/^@/, "")
  return canonical ? `@${canonical}` : "Pi username not linked"
}

export function ProfileHeroMeta({
  displayName,
  username,
  userId,
  preferredId,
  city,
  country,
  bio,
  verified,
  postsCount,
  friendsCount,
  followingCount,
  onEdit,
  onShare,
  onToast,
  onSendGhc,
  onOpenWallet,
}: {
  displayName: string
  username?: string | null
  userId: string
  preferredId?: string | null
  city?: string | null
  country?: string | null
  bio?: string | null
  verified?: boolean
  postsCount: number
  friendsCount: number
  followingCount: number
  onEdit: () => void
  onShare: () => void
  onToast?: (msg: string, type: "success" | "error" | "info") => void
  onSendGhc?: (ghId: string) => void
  onOpenWallet?: () => void
}) {
  const ghId = useMemo(
    () => getOrCreateGreenHavenId(userId, preferredId),
    [userId, preferredId]
  )
  const ghDisplay = formatGreenHavenIdDisplay(ghId)
  const handle = toHandle(username)
  const locationLine = [city, country].filter(Boolean).join(", ")
  const [copied, setCopied] = useState(false)
  const [handleCopied, setHandleCopied] = useState(false)
  const canonicalUsername = String(username || "").trim().replace(/^@/, "")

  const copyHandle = useCallback(async () => {
    if (!canonicalUsername) return
    try {
      await navigator.clipboard.writeText(`@${canonicalUsername}`)
      setHandleCopied(true)
      onToast?.("Username copied", "success")
      window.setTimeout(() => setHandleCopied(false), 1600)
    } catch {
      onToast?.("Could not copy", "error")
    }
  }, [canonicalUsername, onToast])

  const copyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ghDisplay)
      setCopied(true)
      onToast?.("GreenHaven ID copied", "success")
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      onToast?.("Could not copy", "error")
    }
  }, [ghDisplay, onToast])

  return (
    <div className="min-w-0 flex-1 space-y-3 pt-1">
      {/* Name + verification */}
      <div>
        <h1 className="flex flex-wrap items-center gap-1.5 text-[1.35rem] font-black tracking-tight text-foreground sm:text-2xl">
          <span className="truncate">{String(username || "").trim().replace(/^@/, "") || displayName || "Member"}</span>
          {verified ? (
            <BadgeCheck size={18} className="shrink-0 text-sky-600" aria-label="Verified" />
          ) : null}
        </h1>
        <p className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold text-muted-foreground">
          <span className="min-w-0 truncate">{handle}</span>
          {canonicalUsername ? (
            <button
              type="button"
              onClick={() => void copyHandle()}
              aria-label={handleCopied ? "Username copied" : "Copy username"}
              className="gh-hit-44 -my-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
            >
              {handleCopied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
            </button>
          ) : null}
        </p>
        <p className="mt-0.5 font-mono text-[12px] font-bold tracking-wide text-emerald-800 dark:text-emerald-300">
          {ghDisplay}
        </p>
        {locationLine ? (
          <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
            <MapPin size={13} className="shrink-0 text-emerald-600" aria-hidden />
            <span className="truncate">{locationLine}</span>
          </p>
        ) : null}
      </div>

      {/* Bio */}
      <ExpandableBio
        bio={
          bio?.trim() ||
          "Add a short bio so people know what makes you unique."
        }
      />

      {/* Primary actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-700 px-4 text-[13px] font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:flex-none"
        >
          <Pencil size={14} aria-hidden />
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-bold text-foreground transition hover:bg-muted active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:flex-none"
        >
          <Share2 size={14} aria-hidden />
          Share
        </button>
      </div>

      {/* Compact stats */}
      <div
        className="flex items-center justify-between gap-1 rounded-xl border border-border/70 bg-muted/40 px-2 py-2.5"
        role="group"
        aria-label="Profile stats"
      >
        <StatCell label="Posts" value={postsCount} />
        <span className="h-6 w-px bg-border" aria-hidden />
        <StatCell label="Friends" value={friendsCount} />
        <span className="h-6 w-px bg-border" aria-hidden />
        <StatCell label="Following" value={followingCount} />
      </div>

      <div className="flex flex-col items-start gap-0.5">
        <ReputationBadge />
        <p className="text-[10px] text-muted-foreground">From activity · not for sale · not a balance</p>
      </div>

      {/* GreenHaven Identity — compact card */}
      <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-card dark:border-emerald-900 dark:from-emerald-950/40">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b border-emerald-100/80 px-3 py-2 dark:border-emerald-900/50">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              Social identity · GreenHaven ID
            </p>
            <p className="text-[10px] text-muted-foreground">Who you are — not what you own</p>
          </div>
          <button
            type="button"
            onClick={() => void copyId()}
            className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-100"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy ID"}
          </button>
        </div>
        <div className="p-2.5 pt-2">
          <SignatureGhIdCard
            userId={userId}
            displayName={displayName}
            preferredId={preferredId}
            verified={verified}
            onToast={
              onToast
                ? (msg, type) => {
                    const t =
                      type === "error" || type === "success" || type === "info"
                        ? type
                        : "info"
                    onToast(msg, t)
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}

const compactStat = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 })

function StatCell({ label, value }: { label: string; value: number }) {
  const safe = Number.isFinite(value) ? value : 0
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1">
      <span className="text-[15px] font-black tabular-nums text-foreground" title={safe.toLocaleString()}>
        {safe >= 10000 ? compactStat.format(safe) : safe.toLocaleString()}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </div>
  )
}
