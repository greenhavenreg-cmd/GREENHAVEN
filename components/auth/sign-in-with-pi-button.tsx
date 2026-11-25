"use client"

import { useState } from "react"
import { getPiClientId } from "@/lib/pi-env"
import { startPiSignIn } from "@/lib/pi-oauth-client"
import { isPiBrowserRuntime, markPiBrowserRuntime } from "@/lib/pi-native"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { isPiSandboxFrame } from "@/lib/pi-runtime"

type Props = {
  className?: string
  label?: string
}

/**
 * Official Pi Sign-in entry.
 * Inside Pi Browser: trigger SDK re-auth (OAuth-in-webview is often blocked by Pi).
 * In ordinary browsers: OAuth implicit flow.
 */
export function SignInWithPiButton({
  className,
  label = "Sign in",
}: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)
  const configured = Boolean(getPiClientId())
  const inPiRuntime = isPiBrowserRuntime() || isPiSandboxFrame()
  const { reinitialize } = usePiAuth()

  const onClick = async () => {
    if (busy) return
    setError(null)
    setAttempted(true)
    setBusy(true)
    try {
      // Pi Browser: OAuth redirect pages often reject in-app WebViews.
      // Prefer the official SDK authenticate path already used by the provider.
      if (typeof window !== "undefined" && (isPiBrowserRuntime() || isPiSandboxFrame())) {
        markPiBrowserRuntime()
        await reinitialize()
        setBusy(false)
        return
      }
      const result = startPiSignIn()
      if (!result.ok) {
        setError(result.error)
        setBusy(false)
      }
      // On OAuth success the page navigates away
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed. Try again.")
      setBusy(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={busy || (!configured && !inPiRuntime)}
        onClick={() => void onClick()}
        aria-busy={busy}
        aria-label={busy ? "Connecting securely to Pi" : attempted ? "Try again to sign in" : label}
        className={
          className ||
          "group relative flex min-h-[76px] w-full items-center justify-center gap-3 overflow-hidden rounded-[26px] border border-amber-200/30 bg-gradient-to-r from-[#F8C944] via-[#FFE17A] to-[#F4B92F] px-6 py-4 text-base font-extrabold text-[#14251b] shadow-[0_12px_36px_rgba(245,194,66,0.22)] transition duration-300 hover:brightness-105 active:scale-[0.985] disabled:cursor-wait disabled:opacity-80"
        }
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-70" />
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-950/10 bg-emerald-950/10 shadow-inner" aria-hidden="true">
          {busy ? (
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="2.5"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5c-4.2 0-7.5 3.3-7.5 7.5v2.5M12 3.5c4.2 0 7.5 3.3 7.5 7.5v2.5M8.2 8.2a5.4 5.4 0 0 0-1.1 3.3v3.2M15.8 8.2a5.4 5.4 0 0 1 1.1 3.3v3.2M9 12.2v2.1c0 2.1-.5 3.8-1.5 5.1M12 9.2v5.1c0 2.5-.4 4.5-1.2 6.2M15 12.2v2.1c0 2.1.5 3.8 1.5 5.1"/></svg>
          )}
        </span>
        <span className="relative flex flex-col items-start leading-tight">
          <span>{busy ? "Connecting securely…" : attempted ? "Try again" : label}</span>
          <span className="mt-1 text-[11px] font-semibold opacity-65">{busy ? "Waiting for Pi Browser" : "Fingerprint-secured Pi sign-in"}</span>
        </span>
      </button>
      {!configured && !inPiRuntime ? (
        <p className="max-w-xs text-center text-[11px] text-white/40">
          Pi Sign-in Client ID is not configured (NEXT_PUBLIC_PI_CLIENT_ID).
        </p>
      ) : null}
      {error ? (
        <p className="max-w-xs text-center text-[12px] text-rose-300/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
