"use client"

/**
 * GHC → Pi withdrawal request UI (platform settlement — not instant Pi send).
 * Rate: server REFERENCE_GHC_PER_PI (100 GHC per 1 π by default). 100 GHC ≠ 100 π.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { IdentityService } from "@/lib/identity/identity-service"
import { fetchWithTimeout } from "@/lib/client/fetch-timeout"
import { sanitizeAmountInput } from "@/lib/wallet/amount-input"
import {
  GHC_INPUT_DECIMALS,
  floorGhc,
  ghcInputMessage,
  ghcToPiPreview,
  looksLikePiWalletAddress,
  parseGhcInput,
  withdrawalStatusLabel,
} from "@/lib/wallet/ghc-amount"
import { SettlementPanelSkeleton } from "@/components/ghc/skeleton-loaders"
import { secureUUID } from "@/lib/secure-id"

function newWithdrawalIdempotencyKey(): string {
  // Fails closed if no secure random source exists; never weaken a money idempotency key.
  return `wd_${secureUUID()}`
}

type Quote = {
  ghcPerPi: number
  minPi: number
  minGhc: number
  ledgerBalance: number
  lockedGhc: number
  withdrawableGhc: number
  piEquivalent: number
  eligible: boolean
  note?: string
}

type WdRequest = {
  id: string
  ghcAmount: number
  ghcPerPi: number
  piAmount: number
  piWalletAddress: string
  status: string
  createdAt: string
  settlementRef?: string | null
}

function maskWallet(addr: string): string {
  const a = String(addr || "")
  if (a.length <= 10) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export function WithdrawGhcPanel() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [items, setItems] = useState<WdRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [ghcAmount, setGhcAmount] = useState("")
  const [wallet, setWallet] = useState("")
  const [confirmWallet, setConfirmWallet] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  /** Stable across retries of the same submit; rotated only after success */
  const idempotencyKeyRef = useRef(newWithdrawalIdempotencyKey())
  /** Payload the current key was issued for; a changed amount/wallet must never reuse the key. */
  const idempotencyPayloadRef = useRef<string>("")
  const submittingRef = useRef(false)

  const lastQuoteRef = useRef<Quote | null>(null)
  const lastItemsRef = useRef<WdRequest[]>([])
  const [stale, setStale] = useState(false)
  const [gateReason, setGateReason] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout("/api/economy/withdrawals", {
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...IdentityService.getAuthHeaders(),
        },
        cache: "no-store",
        timeoutMs: 15_000,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.ok === false) {
        const code = String(data.error || "")
        const msg = String(data.message || data.error || "Could not load withdrawal info")
        // Soft-degrade: keep last successful quote so the panel does not go blank.
        if (lastQuoteRef.current) {
          setQuote(lastQuoteRef.current)
          setItems(lastItemsRef.current)
          setStale(true)
          setError(msg)
        } else {
          setQuote(null)
          setItems([])
          setStale(false)
          setError(msg)
        }
        // Operator / testnet gates — surface clearly, not as a generic network failure.
        if (
          code.includes("DISABLED") ||
          code.includes("NOT_ENABLED") ||
          /disabled|not enabled|not available|feature flag/i.test(msg)
        ) {
          setGateReason(msg)
        }
        return
      }
      const nextQuote = (data.quote || null) as Quote | null
      const nextItems = Array.isArray(data.withdrawals) ? (data.withdrawals as WdRequest[]) : []
      lastQuoteRef.current = nextQuote
      lastItemsRef.current = nextItems
      setQuote(nextQuote)
      setItems(nextItems)
      setStale(false)
      setGateReason(null)
    } catch {
      if (lastQuoteRef.current) {
        setQuote(lastQuoteRef.current)
        setItems(lastItemsRef.current)
        setStale(true)
        setError("Could not refresh settlement info. Showing last loaded quote.")
      } else {
        setError("Network error — check your connection and retry.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const rate = quote?.ghcPerPi ?? 100
  const parsed = parseGhcInput(ghcAmount)
  const amountNum = parsed.ok ? parsed.amount : 0
  const piPreview = ghcToPiPreview(amountNum, rate)
  const maxGhc = quote ? floorGhc(quote.withdrawableGhc) : 0
  const amountError = ghcAmount.trim() && !parsed.ok ? ghcInputMessage(parsed.code) : null
  const overWithdrawable = parsed.ok && quote ? amountNum > maxGhc : false
  const minPi = quote?.minPi ?? 100
  const walletLooksInvalid = wallet.trim().length > 0 && !looksLikePiWalletAddress(wallet)

  const submit = async () => {
    if (submittingRef.current) return
    if (!quote?.eligible) return
    if (!parsed.ok) {
      setError(ghcInputMessage(parsed.code))
      return
    }
    if (amountNum < quote.minGhc) {
      setError(`Minimum is ${quote.minGhc} GHC (${minPi} π equivalent at ${rate} GHC/π)`)
      return
    }
    if (amountNum > maxGhc) {
      setError(`You can withdraw up to ${maxGhc.toFixed(2)} GHC. Locked GHC is not withdrawable.`)
      return
    }
    if (!looksLikePiWalletAddress(wallet)) {
      setError("That does not look like a Pi wallet address (56 characters starting with G). Check it before continuing.")
      return
    }
    if (!confirmWallet) {
      setError("Confirm the Pi wallet address")
      return
    }
    const payloadSignature = `${amountNum}|${wallet.trim()}`
    if (idempotencyPayloadRef.current && idempotencyPayloadRef.current !== payloadSignature) {
      // Different amount or destination: this is a new request, not a retry.
      idempotencyKeyRef.current = newWithdrawalIdempotencyKey()
    }
    idempotencyPayloadRef.current = payloadSignature
    submittingRef.current = true
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetchWithTimeout("/api/economy/withdrawals", {
        method: "POST",
        timeoutMs: 25_000,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...IdentityService.getAuthHeaders(),
        },
        body: JSON.stringify({
          ghcAmount: amountNum,
          piWalletAddress: wallet.trim(),
          idempotencyKey: idempotencyKeyRef.current,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.ok === false) {
        setError(data.message || data.error || "Request failed")
        return
      }
      // New key only after accepted request so double-click / retry stays idempotent
      idempotencyKeyRef.current = newWithdrawalIdempotencyKey()
      idempotencyPayloadRef.current = ""
      setSuccess(
        data.message ||
          "Withdrawal request created. Pi is not sent instantly — GreenHaven will process settlement."
      )
      setGhcAmount("")
      setConfirmWallet(false)
      await load()
    } catch (cause) {
      // A timed-out request may have been accepted. The idempotency key is
      // intentionally kept, so retrying cannot create a second withdrawal.
      setError(
        cause instanceof DOMException && cause.name === "AbortError"
          ? "This is taking longer than expected. Your request may already be recorded — check your withdrawal history before trying again."
          : "Network error. Check your connection and retry; your request will not be duplicated."
      )
    } finally {
      submittingRef.current = false
      setBusy(false)
    }
  }

  const hasPendingRequest = items.some((w) => /pending|review|queued|processing|requested/i.test(String(w.status)))

  return (
    <section
      className="space-y-3 rounded-[1.25rem] border border-border/50 bg-card p-3.5 shadow-[var(--gh-card-shadow)]"
      aria-label="Withdraw GHC"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-black tracking-tight text-foreground">GHC → Pi settlement</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
            Request operator-reviewed settlement of eligible GHC. Not an instant Pi send. Reference rate{" "}
            <strong className="text-foreground">{rate} GHC = 1 π</strong> (never 1:1).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="min-h-9 text-[11px] font-medium text-emerald-700 disabled:opacity-50 dark:text-emerald-300"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

            {gateReason ? (
        <div className="rounded-xl border border-slate-300/80 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/40" role="status">
          <p className="text-[12px] font-bold text-foreground">GHC → Pi settlement is not open on this deployment</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Testnet / operator policy currently blocks settlement requests. Your GHC balance is unchanged. This is not a wallet error.
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">{gateReason}</p>
        </div>
      ) : null}

      {stale && quote ? (
        <div className="rounded-xl border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-[11px] text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="status">
          Showing last confirmed settlement quote — live refresh is temporarily limited.
        </div>
      ) : null}

      {loading && !quote ? (
        <SettlementPanelSkeleton />
      ) : quote ? (
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="rounded-xl bg-emerald-50/80 px-2.5 py-2 dark:bg-emerald-950/30">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Withdrawable</p>
            <p className="mt-0.5 font-black tabular-nums text-foreground">{quote.withdrawableGhc.toFixed(2)} GHC</p>
          </div>
          <div className="rounded-xl bg-violet-50/80 px-2.5 py-2 dark:bg-violet-950/30">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-300">≈ Pi value</p>
            <p className="mt-0.5 font-black tabular-nums text-foreground">{quote.piEquivalent.toFixed(4)} π</p>
          </div>
          <div className="rounded-xl bg-muted/40 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Locked</p>
            <p className="font-semibold tabular-nums">{quote.lockedGhc.toFixed(2)} GHC</p>
          </div>
          <div className="rounded-xl bg-muted/40 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Min ({minPi} π)</p>
            <p className="font-semibold tabular-nums">{quote.minGhc.toFixed(0)} GHC</p>
          </div>
        </div>
      ) : !loading && !gateReason ? (
        <div className="rounded-xl border border-dashed border-border px-3 py-3 text-center">
          <p className="text-[12px] font-semibold text-foreground">Settlement quote unavailable</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Tap Refresh to load the server-confirmed rate and limits. No request was submitted.</p>
        </div>
      ) : null}

      {quote && !quote.eligible ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5" role="status">
          <p className="text-[12px] font-bold text-amber-900 dark:text-amber-100">Not eligible yet</p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-100/90">
            Withdrawal unlocks at <strong>{quote.minGhc} GHC</strong> minimum ({minPi} π equivalent at {rate} GHC/π). Earn or receive more available GHC, then refresh.
          </p>
        </div>
      ) : null}

      {quote?.eligible ? (
        <div className="space-y-2 border-t border-border/40 pt-2">
          <label className="block text-[11px] font-medium text-muted-foreground">
            <span className="flex items-center justify-between">
              GHC amount
              <button
                type="button"
                onClick={() => setGhcAmount(maxGhc > 0 ? String(maxGhc) : "")}
                className="min-h-9 font-semibold text-emerald-700 dark:text-emerald-300"
                aria-label={`Use maximum withdrawable ${maxGhc.toFixed(2)} GHC`}
              >
                Max · {maxGhc.toFixed(2)}
              </button>
            </span>
            <input aria-label="0.00"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={ghcAmount}
              onChange={(e) => setGhcAmount(sanitizeAmountInput(e.target.value, GHC_INPUT_DECIMALS))}
              aria-invalid={amountError || overWithdrawable ? true : undefined}
              aria-describedby={amountError || overWithdrawable ? "wd-amount-error" : undefined}
              disabled={busy}
              enterKeyHint="next"
              className="mt-1 min-h-11 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-base text-foreground disabled:opacity-60"
              placeholder="0.00"
            />
          </label>
          {amountError || overWithdrawable ? (
            <p id="wd-amount-error" className="text-[11px] text-red-600 dark:text-red-400" role="alert">
              {amountError ?? `Only ${maxGhc.toFixed(2)} GHC is withdrawable. Locked GHC stays in your wallet.`}
            </p>
          ) : null}
          <p className="text-[11px] text-muted-foreground">
            You would receive ≈ <span className="font-semibold text-foreground">{piPreview.toFixed(7).replace(/0+$/, "").replace(/\.$/, "")} π</span>{" "}
            at frozen rate {rate} GHC/π
          </p>
          <label className="block text-[11px] font-medium text-muted-foreground">
            Pi Network wallet address
            <input
              type="text"
              value={wallet}
              onChange={(e) => {
                setWallet(e.target.value)
                setConfirmWallet(false)
              }}
              aria-invalid={walletLooksInvalid ? true : undefined}
              aria-describedby={walletLooksInvalid ? "wd-wallet-error" : undefined}
              disabled={busy}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="mt-1 min-h-11 w-full rounded-xl border border-border/60 bg-background px-3 py-2 font-mono text-base text-foreground disabled:opacity-60"
              placeholder="Paste Pi wallet address"
              autoComplete="off"
            />
          </label>
          {walletLooksInvalid ? (
            <p id="wd-wallet-error" className="text-[11px] text-red-600 dark:text-red-400" role="alert">
              Pi wallet addresses are 56 characters and start with G. Check for missing or extra characters.
            </p>
          ) : null}
          {hasPendingRequest ? (
            <p className="rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11px] text-muted-foreground" role="status">
              You already have a request in review. A new request is separate and will be reviewed on its own.
            </p>
          ) : null}
          <label className="flex items-start gap-2 text-[12px] text-foreground">
            <input
              type="checkbox"
              checked={confirmWallet}
              onChange={(e) => setConfirmWallet(e.target.checked)}
              disabled={busy}
              className="mt-0.5 h-5 w-5 shrink-0"
            />
            I confirm this Pi address is correct. Pi is not sent instantly.
          </label>
          <button
            type="button"
            disabled={busy || !parsed.ok || overWithdrawable || walletLooksInvalid || !confirmWallet}
            aria-busy={busy}
            onClick={() => void submit()}
            className="w-full min-h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit withdrawal request"}
          </button>
        </div>
      ) : null}

      {error && !gateReason ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/40" role="alert">
          <p className="text-[12px] font-semibold text-red-800 dark:text-red-200">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-1 text-[11px] font-bold text-red-900 underline dark:text-red-100">
            Retry
          </button>
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/40" role="status">
          <p className="text-[12px] font-semibold text-emerald-800 dark:text-emerald-200">{success}</p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-1.5 border-t border-border/40 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Withdrawal history
          </p>
          <ul className="space-y-1.5">
            {items.slice(0, 8).map((w) => (
              <li
                key={w.id}
                className="rounded-xl border border-border/40 px-2.5 py-2 text-[12px]"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium tabular-nums">
                    {Number(w.ghcAmount).toFixed(2)} GHC → {Number(w.piAmount).toFixed(4)} π
                  </span>
                  <span className="text-[10px] uppercase text-muted-foreground">{withdrawalStatusLabel(w.status)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  @{maskWallet(w.piWalletAddress)} · rate {Number(w.ghcPerPi)} GHC/π
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
