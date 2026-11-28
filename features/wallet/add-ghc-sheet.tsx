"use client"

/**
 * Get GHC — Rewards · Receive · Governed Pi packs (not free FX).
 */
import { fetchWithTimeout } from "@/lib/client/fetch-timeout"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDialogA11y } from "@/hooks/use-dialog-a11y"
import { X, Gift, ArrowDownLeft, Lock, Coins, Loader2 } from "lucide-react"
import { GhcCoinIcon } from "@/components/ghc/ghc-coin-icon"
import { ASSET_POLICY } from "@/lib/asset-separation"
import { createGhcPackIntent } from "@/lib/economy/buy-ghc-pack"

export const GHC_BUY_WITH_PI_ENABLED =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_GHC_BUY_WITH_PI === "true" ||
    process.env.NEXT_PUBLIC_GHC_BUY_WITH_PI_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_GHC_TESTNET_UNLOCK === "true" ||
    process.env.NEXT_PUBLIC_GHC_TESTNET_UNLOCK === "1")

type Pack = {
  productId: string
  ghcAmount: number
  piAmount: number
  label?: string
}

export function AddGhcSheet({
  open,
  onClose,
  onEarn,
  onReceive,
  onBuy,
  onSelectPack,
}: {
  open: boolean
  onClose: () => void
  onEarn: () => void
  onReceive: () => void
  onBuy?: () => void
  /** Optional: parent opens GH Pay with selected pack productId */
  onSelectPack?: (pack: Pack) => void
}) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [packsLoading, setPacksLoading] = useState(false)
  const [packsEnabled, setPacksEnabled] = useState(GHC_BUY_WITH_PI_ENABLED)
  const [packsError, setPacksError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [startingPackId, setStartingPackId] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const startingRef = useRef(false)
  const panelRef = useDialogA11y<HTMLDivElement>(open, onClose)

  useEffect(() => {
    if (!open || !GHC_BUY_WITH_PI_ENABLED) return
    let cancelled = false
    setPacksLoading(true)
    setPacksError(null)
    setPurchaseError(null)
    ;(async () => {
      try {
        const res = await fetchWithTimeout("/api/economy/purchase-ghc", { credentials: "include", timeoutMs: 15_000 })
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          enabled?: boolean
          packs?: Pack[]
          message?: string
        }
        if (cancelled) return
        if (!res.ok || data.ok === false) {
          setPacksError(data.message || "Could not load GHC packs right now.")
          return
        }
        setPacksEnabled(Boolean(data.enabled ?? GHC_BUY_WITH_PI_ENABLED))
        if (Array.isArray(data.packs)) setPacks(data.packs)
      } catch {
        if (!cancelled) {
          setPacks([])
          setPacksError("Could not load GHC packs. Check your connection and try again.")
        }
      } finally {
        if (!cancelled) setPacksLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, reloadToken])

  const startPackPurchase = useCallback(
    async (pack: Pack) => {
      // A double tap must never create two payment intents.
      if (startingRef.current) return
      startingRef.current = true
      setStartingPackId(pack.productId)
      setPurchaseError(null)
      try {
        onSelectPack?.(pack)
        const intent = await createGhcPackIntent(pack.productId)
        if (!intent.ok) {
          setPurchaseError(intent.message || intent.error || "Could not start the pack purchase. Nothing was charged.")
          return
        }
        try {
          window.dispatchEvent(
            new CustomEvent("ghc:toast", {
              detail: { message: `Ready to pay ${intent.amountPi} π for ${intent.label}`, type: "info" },
            }),
          )
          window.dispatchEvent(new CustomEvent("ghc:ghc-pack-intent", { detail: intent }))
        } catch {
          /* non-critical UI events */
        }
        onBuy?.()
        onClose()
      } catch {
        setPurchaseError("Could not start the pack purchase. Nothing was charged. Please try again.")
      } finally {
        startingRef.current = false
        setStartingPackId(null)
      }
    },
    [onBuy, onClose, onSelectPack],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button type="button" tabIndex={-1} className="absolute inset-0 bg-black/45" aria-label="Close" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Get GHC"
        tabIndex={-1}
        className="gh-sheet-panel relative z-[81] max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[1.5rem] border border-border/60 bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:rounded-[1.5rem]"
      >
        <div className="mb-3 flex items-center gap-2">
          <GhcCoinIcon size={28} />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-foreground">Get GHC</h2>
            <p className="text-[11px] text-muted-foreground">
              Earn, receive, or buy a fixed utility pack with π
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted" aria-label="Close Get GHC">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => {
                onEarn()
                onClose()
              }}
              className="gh-list-row flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-3 text-left transition hover:bg-muted/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/12 text-emerald-700">
                <Gift size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold">Rewards</span>
                <span className="block text-[11px] text-muted-foreground">
                  Daily Claim and eligible server-approved credits. Mission milestones unlock achievements, not GHC, under current policy.
                </span>
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onReceive()
                onClose()
              }}
              className="gh-list-row flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-3 text-left transition hover:bg-muted/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600/12 text-sky-700">
                <ArrowDownLeft size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold">Receive GHC</span>
                <span className="block text-[11px] text-muted-foreground">
                  Share your GH ID so another member can send you GHC
                </span>
              </span>
            </button>
          </li>
        </ul>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Buy with π · fixed packs
          </p>
          {!GHC_BUY_WITH_PI_ENABLED || !packsEnabled ? (
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
              <Lock size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-[12px] text-muted-foreground">
                Buying GHC packs with π isn&apos;t available yet. You can still earn GHC through Rewards or receive it from another member.
              </p>
            </div>
          ) : packsLoading ? (
            <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Loading packs…
            </p>
          ) : packsError ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3" role="alert">
              <p className="text-[12px] text-amber-900 dark:text-amber-100">{packsError}</p>
              <button
                type="button"
                onClick={() => setReloadToken((n) => n + 1)}
                className="mt-2 min-h-11 text-[12px] font-bold text-amber-900 underline dark:text-amber-100"
              >
                Try again
              </button>
            </div>
          ) : packs.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No GHC packs are available right now. Check back soon.</p>
          ) : (
            <ul className="space-y-2">
              {packs.map((pack) => (
                <li key={pack.productId}>
                  <button
                    type="button"
                    onClick={() => void startPackPurchase(pack)}
                    disabled={startingPackId !== null}
                    aria-busy={startingPackId === pack.productId}
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-violet-200/80 disabled:opacity-60 bg-violet-50/40 px-3 py-3 text-left transition hover:bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/12 text-violet-700 dark:text-violet-300">
                      <Coins size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold text-foreground">
                        {pack.label || `${pack.ghcAmount} GHC`}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Pay {pack.piAmount} π · server credits {pack.ghcAmount} GHC after verification
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] font-bold text-violet-700 dark:text-violet-300">
                      {startingPackId === pack.productId ? <Loader2 size={16} className="animate-spin" aria-label="Starting purchase" /> : `${pack.piAmount} π`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {purchaseError ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
            {purchaseError}
          </p>
        ) : null}

        <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          {ASSET_POLICY.packPurchaseCopy} {ASSET_POLICY.walletCopy}
        </p>
      </div>
    </div>
  )
}
