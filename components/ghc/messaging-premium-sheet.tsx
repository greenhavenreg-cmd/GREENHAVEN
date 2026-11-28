"use client"

/**
 * Optional messaging utilities — never required to send a normal message.
 */
import { useRef, useState } from "react"
import { secureUUID } from "@/lib/secure-id"
import { X, Sparkles, Loader2 } from "lucide-react"
import {
  listMessagingPremiumProducts,
  MESSAGING_FREE_GUARANTEE,
  type MessagingPremiumProductId,
} from "@/lib/domains/messaging-premium"
import { IdentityService } from "@/lib/identity/identity-service"
import { GhcCoinIcon } from "./ghc-coin-icon"
import { useDialogA11y } from "@/hooks/use-dialog-a11y"

export function MessagingPremiumSheet({
  open,
  onClose,
  onToast,
}: {
  open: boolean
  onClose: () => void
  onToast?: (msg: string, type: "success" | "error" | "info") => void
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<MessagingPremiumProductId | null>(null)
  // Synchronous single-flight guard: `busy` only updates after a render, so two taps in the same
  // frame could otherwise both start a GHC spend.
  const buyInFlightRef = useRef(false)
  // One stable reference per product until the purchase is confirmed. The server derives the spend
  // idempotency from this value, so a retry after a timeout or dropped connection cannot debit twice.
  const referenceRef = useRef<Map<string, string>>(new Map())
  // A purchase in flight must not be dismissed: the outcome would be invisible to the person.
  const dialogRef = useDialogA11y<HTMLDivElement>(open, busy ? undefined : onClose)
  if (!open) return null

  const products = listMessagingPremiumProducts()

  const buy = async (productId: MessagingPremiumProductId) => {
    if (busy || buyInFlightRef.current) return
    let referenceId = referenceRef.current.get(productId)
    if (!referenceId) {
      const nonce =
        secureUUID()
      referenceId = `msg_premium_${productId}_${nonce}`
      referenceRef.current.set(productId, referenceId)
    }
    buyInFlightRef.current = true
    setBusy(productId)
    try {
      const res = await fetch("/api/messaging/premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...IdentityService.getAuthHeaders(),
        },
        body: JSON.stringify({ productId, referenceId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        onToast?.(data?.error || data?.message || "Purchase failed", "error")
        return
      }
      referenceRef.current.delete(productId)
      setConfirmId(null)
      onToast?.(`${data.productId} unlocked`, "success")
      onClose()
    } catch (e) {
      // The outcome is unknown: keep the same reference so a retry is recognised by the ledger.
      onToast?.(
        e instanceof Error && e.message ? `${e.message}. If GHC was deducted it will not be charged twice; check Wallet → History.` : "Purchase could not be confirmed. Retrying is safe and will not charge twice.",
        "error",
      )
    } finally {
      buyInFlightRef.current = false
      setBusy(null)
    }
  }

  return (
    <div ref={dialogRef} tabIndex={-1} className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="messaging-tools-title">
      <button type="button" data-dialog-dismiss className="absolute inset-0 bg-black/45" aria-label="Close" disabled={!!busy} onClick={busy ? undefined : onClose} />
      <div className="relative z-[81] max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-card p-4 shadow-2xl sm:rounded-3xl">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="text-emerald-600" size={18} />
          <div className="min-w-0 flex-1">
            <h2 id="messaging-tools-title" className="text-sm font-bold text-foreground">Message tools</h2>
            <p className="text-[11px] text-muted-foreground">{MESSAGING_FREE_GUARANTEE}</p>
          </div>
          <button type="button" onClick={onClose} disabled={!!busy} className="gh-hit-44 rounded-full p-2 hover:bg-muted disabled:opacity-50" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                disabled={!!busy}
                aria-pressed={confirmId === p.id}
                aria-expanded={confirmId === p.id}
                onClick={() => setConfirmId((cur) => (cur === p.id ? null : p.id))}
                className={`flex w-full items-start gap-3 rounded-2xl border bg-background px-3 py-3 text-left transition hover:bg-muted/40 disabled:opacity-60 ${confirmId === p.id ? "border-emerald-600" : "border-border"}`}
              >
                <GhcCoinIcon size={22} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-foreground">{p.title}</span>
                  <span className="block text-[11px] text-muted-foreground">{p.description}</span>
                </span>
                <span className="shrink-0 text-[12px] font-bold tabular-nums text-emerald-700">
                  {busy === p.id ? <Loader2 size={14} className="animate-spin" /> : `${p.priceGhc} GHC`}
                </span>
              </button>
              {confirmId === p.id ? (
                <div className="mt-1.5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30" role="group" aria-label={`Confirm ${p.title}`}>
                  <p className="min-w-0 flex-1 text-[11px] text-foreground">
                    Spend <strong className="tabular-nums">{p.priceGhc} GHC</strong> from your wallet to unlock this?
                  </p>
                  <button type="button" disabled={!!busy} onClick={() => setConfirmId(null)} className="min-h-10 rounded-full border border-border px-3 text-[11px] font-semibold disabled:opacity-50">Cancel</button>
                  <button type="button" disabled={!!busy} aria-busy={busy === p.id} onClick={() => void buy(p.id)} className="min-h-10 rounded-full bg-emerald-700 px-3 text-[11px] font-bold text-white disabled:opacity-60" data-testid="messaging-premium-confirm">
                    {busy === p.id ? "Unlocking…" : "Confirm"}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
