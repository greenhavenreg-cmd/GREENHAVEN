"use client"

/**
 * Skeleton design system — consistent loading placeholders across modules.
 */

export function ImageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-full w-full animate-pulse rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] ${className}`}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="gh-card w-full space-y-3 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-1/4 animate-pulse rounded bg-muted/70" />
        </div>
      </div>
      <div className="h-4 w-full animate-pulse rounded bg-muted/80" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-muted/60" />
      <div className="h-40 w-full animate-pulse rounded-[var(--gh-radius-md)] bg-muted/50" />
    </div>
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 animate-pulse rounded bg-gradient-to-r from-muted to-muted/60 ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  )
}

export function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" }
  return <div className={`${sizes[size]} animate-pulse rounded-full bg-muted`} />
}

export function DiscoverCardSkeleton() {
  return (
    <div className="w-full space-y-3 rounded-2xl border border-border/50 bg-card p-3">
      <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 animate-pulse rounded-full bg-muted/60" />
        <div className="h-9 flex-1 animate-pulse rounded-full bg-muted/60" />
      </div>
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted/70" />
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 px-3 py-3" aria-busy="true" aria-label="Loading feed">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ConversationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-border/60" aria-busy="true" aria-label="Loading messages">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  )
}

/** Wallet activity list placeholder */
export function WalletActivitySkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading activity">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="gh-card flex items-center gap-3 p-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading profile">
      <div className="h-36 bg-muted sm:h-44" />
      <div className="relative mx-auto -mt-12 max-w-2xl px-4">
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-full bg-muted ring-4 ring-background" />
            <div className="flex-1 space-y-2 pb-2">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted/60" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CommunityCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-3">
      <div className="h-14 w-14 animate-pulse rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
      </div>
    </div>
  )
}


/** Feed placeholder rows for incremental loading on mobile */
export function FeedSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 p-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-2 w-1/4 animate-pulse rounded bg-muted/60" />
            </div>
          </div>
          <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted/60" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  )
}

/** Rewards "at a glance" balance panel skeleton */
export function RewardsBalanceSkeleton() {
  return (
    <div className="mx-3 mt-3 rounded-[1.25rem] border border-border/60 bg-card px-3.5 py-3 shadow-sm" aria-busy="true" aria-label="Loading rewards balances">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          <div className="h-3 w-48 animate-pulse rounded bg-muted/70" />
          <div className="h-2.5 w-36 animate-pulse rounded bg-muted/50" />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-muted/40 px-2.5 py-2">
            <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-14 animate-pulse rounded bg-muted/80" />
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-16 animate-pulse rounded-xl bg-muted/40" />
        <div className="h-16 animate-pulse rounded-xl bg-muted/40" />
      </div>
    </div>
  )
}

/** Membership status + plan list skeleton */
export function MembershipScreenSkeleton() {
  return (
    <div className="space-y-3 px-3 pt-2" aria-busy="true" aria-label="Loading membership">
      <div className="gh-card space-y-3 px-3 py-3">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
        </div>
        <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted/40" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted/70" />
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted/40" />
          <div className="h-11 w-full animate-pulse rounded-full bg-muted/60" />
        </div>
      ))}
    </div>
  )
}

/** Pi earnings / wallet balance card skeleton */
export function PiEarningsSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={compact ? "overflow-hidden rounded-2xl border border-border/60 bg-card" : "mx-3 mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"}
      aria-busy="true"
      aria-label="Loading Pi balances"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-violet-200 dark:bg-violet-900" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-muted/60" />
          </div>
        </div>
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2.5 w-12 animate-pulse rounded bg-muted/70" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="border-t border-border/40 px-4 py-3 space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-muted/60" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
      </div>
    </section>
  )
}

/** GHC → Pi settlement panel skeleton */
export function SettlementPanelSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading settlement options">
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-muted/40 px-2.5 py-2">
            <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-16 animate-pulse rounded bg-muted/80" />
          </div>
        ))}
      </div>
      <div className="h-11 w-full animate-pulse rounded-xl bg-muted/50" />
    </div>
  )
}
