/**
 * Phase 2 registration-bonus policy and reconciliation.
 * All amounts and legacy detection are server/database-authoritative.
 */
import { hasPrivilegedDatabase } from "@/lib/server/economy/env"
import { isPiSandboxEnv } from "@/lib/server/economy/testnet-unlock"
import {
  PI_ATOMIC_SCALE,
  getRegistrationBonusPolicyStatus,
  claimRegistrationBonusPolicy,
} from "@/lib/server/earnings/unified-ledger"

/** Testnet campaign cumulative target at the 1e-7 atomic scale. */
export const REGISTRATION_BONUS_PI = 100
export const REGISTRATION_BONUS_ATOMIC = Math.round(REGISTRATION_BONUS_PI * PI_ATOMIC_SCALE) // 1_000_000_000
export const REGISTRATION_BONUS_POLICY_VERSION = "testnet_100:v1"
export const REGISTRATION_BONUS_SOURCE_KIND = "system" as const

export function registrationBonusUniqueRef(userId: string): string {
  return `registration_bonus:${REGISTRATION_BONUS_POLICY_VERSION}:${String(userId || "").trim()}`
}

/** Legacy v1 claimants receive a separate, idempotent top-up reference. */
export function registrationBonusTopupUniqueRef(userId: string): string {
  return `registration_bonus:v2_topup:${String(userId || "").trim()}`
}

/**
 * Fail-closed feature gate. Bonus credits are enabled only when the operator
 * explicitly enables them AND the deployed Pi app is explicitly configured for
 * Testnet. An unset/invalid network flag never falls through to Mainnet.
 */
export function isRegistrationBonusEnabled(): boolean {
  const enabled = String(process.env.GHC_REGISTRATION_BONUS_ENABLED ?? "0").trim().toLowerCase()
  const sandbox = String(process.env.NEXT_PUBLIC_PI_SANDBOX ?? "").trim().toLowerCase()
  return ["1", "true", "yes", "on"].includes(enabled) && sandbox === "true" && isPiSandboxEnv()
}

export type RegistrationBonusStatus = {
  ok: boolean
  enabled: boolean
  amountPi: number
  amountAtomic: number
  claimable: boolean
  claimed: boolean
  legacyClaimed?: boolean
  duplicate?: boolean
  uniqueRef: string
  campaign?: string
  priorAmountPi?: number
  totalTargetPi?: number
  error?: string
  reasons: string[]
  message?: string
}

export async function getRegistrationBonusStatus(userId: string): Promise<RegistrationBonusStatus> {
  const uid = String(userId || "").trim()
  const uniqueRef = registrationBonusUniqueRef(uid)
  const base: RegistrationBonusStatus = {
    ok: true, enabled: isRegistrationBonusEnabled(), amountPi: REGISTRATION_BONUS_PI,
    amountAtomic: REGISTRATION_BONUS_ATOMIC, claimable: false, claimed: false,
    uniqueRef, campaign: "testnet_registration_100_v1", totalTargetPi: 100, reasons: [],
  }
  if (!uid) return { ...base, ok: false, error: "AUTH_REQUIRED", reasons: ["Sign in required"] }
  if (!base.enabled) return { ...base, reasons: ["Registration bonus is paused"], message: "This one-time PI bonus is currently disabled by the operator." }
  if (!hasPrivilegedDatabase()) return { ...base, ok: false, error: "EARNINGS_LEDGER_UNAVAILABLE", reasons: ["Earnings ledger unavailable"], message: "Could not load the server earnings ledger. No balances were invented." }

  const status = await getRegistrationBonusPolicyStatus(uid)
  if (!status.ok) return { ...base, ok: false, error: status.error || "EARNINGS_LEDGER_UNAVAILABLE", reasons: ["Earnings ledger unavailable"], message: "Could not load the server earnings ledger. No balances were invented." }

  // Fail closed until the Testnet campaign migration is actually installed. The
  // previous RPC granted 3 PI; never allow new code to mistake that response for
  // the 100 PI campaign and silently execute an old policy.
  if (status.campaign !== "testnet_registration_100_v1") {
    return { ...base, ok: false, enabled: base.enabled, claimable: false, error: "REGISTRATION_BONUS_MIGRATION_REQUIRED", reasons: ["Testnet 100 PI campaign migration is not installed"], message: "The 100 PI Testnet campaign is waiting for its approved database migration. No reward was credited." }
  }
  const legacyClaimed = status.legacyClaimed === true
  const claimed = status.claimed === true
  const amountAtomic = Number(status.amountAtomic ?? REGISTRATION_BONUS_ATOMIC)
  const amountPi = Number(status.amountPi ?? amountAtomic / PI_ATOMIC_SCALE)
  const isClaimable = status.claimable === true
  return {
    ...base, amountPi, amountAtomic, legacyClaimed, claimed, claimable: isClaimable,
    campaign: status.campaign, priorAmountPi: Number(status.priorAmountPi ?? 0), totalTargetPi: Number(status.totalTargetPi ?? 100),
    uniqueRef: status.uniqueRef || uniqueRef,
    reasons: claimed ? ["Registration bonus already reconciled"] : isClaimable ? [] : ["Registration bonus not claimable"],
    message: status.message || (claimed
      ? "Your Testnet registration reward is already reconciled."
      : legacyClaimed
        ? "Your previous 0.05 π bonus is recorded; reconcile the remaining 2.95 π."
        : `Claim your Testnet registration reward to bring your cumulative registration credits to ${REGISTRATION_BONUS_PI} π.`),
  }
}

export async function claimRegistrationBonus(userId: string): Promise<RegistrationBonusStatus & { entryId?: string }> {
  const status = await getRegistrationBonusStatus(userId)
  if (!status.ok || !status.enabled || !status.claimable) {
    return { ...status, claimable: false, duplicate: status.claimed === true }
  }
  const result = await claimRegistrationBonusPolicy(String(userId || "").trim())
  if (!result.ok) return { ...status, ok: false, claimable: false, error: result.error || "CREDIT_FAILED", reasons: [result.error || "Could not credit registration bonus"], message: "Registration bonus could not be reconciled. No balance was invented." }
  const amountAtomic = result.amountAtomic ?? status.amountAtomic
  const amountPi = result.amountPi ?? amountAtomic / PI_ATOMIC_SCALE
  return {
    ...status, ok: true, amountAtomic, amountPi, uniqueRef: result.uniqueRef || status.uniqueRef,
    claimed: result.claimed !== false, claimable: false, duplicate: result.duplicate === true,
    legacyClaimed: result.legacyClaimed ?? status.legacyClaimed, entryId: result.entryId,
    reasons: result.duplicate ? ["Registration bonus already reconciled"] : [],
    message: result.message || (result.duplicate ? "Registration bonus already reconciled." : `${amountPi} π Testnet registration reward credit is available in your PI earnings ledger.`),
  }
}
