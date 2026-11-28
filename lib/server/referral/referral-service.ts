/**
 * Referral programme server helpers.
 * Settlement requires the explicit referral flag or the guarded Testnet unlock, plus the issuance guard migration.
 */
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { referralSettlementEnabled } from "@/lib/server/economy/testnet-unlock"
import { supabaseRpc, supabaseRest } from "@/lib/server/supabase/rest-client"

function env() {
  return readGhcServerEnv()
}

function settlementEnabled(): boolean {
  // Respect an explicit operator 0/1. When unset, inherit the guarded Testnet
  // product unlock rather than silently treating every Preview as disabled.
  return referralSettlementEnabled()
}

async function rpc(name: string, body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const e = env()
  if (!e.supabaseUrl || !e.supabaseServiceRoleKey) return null
  const result = await supabaseRpc<unknown>(name, body, { timeoutMs: 15_000 })
  if (!result.ok) return { ok: false, error: result.error || String(result.status) }
  return result.data && typeof result.data === "object" && !Array.isArray(result.data)
    ? result.data as Record<string, unknown>
    : null
}

export async function ensureReferralCode(userId: string) {
  const data = await rpc("ghc_referral_ensure_code", { p_user_id: userId })
  if (!data || data.ok !== true) return { ok: false as const, error: String(data?.error || "RPC_FAILED") }
  const code = typeof data.code === "string" ? data.code.trim().toUpperCase() : ""
  // The current database contract issues GH + eight uppercase alphanumerics.
  // Validate the RPC boundary so malformed/missing data never becomes "undefined".
  if (!/^GH[A-Z0-9]{8}$/.test(code)) {
    return { ok: false as const, error: "INVALID_REFERRAL_CODE_RESPONSE" }
  }
  return { ok: true as const, code, createdAt: data.createdAt }
}

export async function attributeReferral(referredUserId: string, code: string) {
  const data = await rpc("ghc_referral_attribute", {
    p_referred_user_id: referredUserId,
    p_code: code,
  })
  if (!data || data.ok !== true) return { ok: false as const, error: String(data?.error || "RPC_FAILED") }
  return {
    ok: true as const,
    referrerUserId: data.referrerUserId ? String(data.referrerUserId) : undefined,
    idempotent: Boolean(data.idempotent),
  }
}

/** Queue 5% reward after verified VIP GHC membership charge. */
export async function queueReferralReward(input: {
  referredUserId: string
  membershipReferenceId: string
  chargedGhc: number
}) {
  const data = await rpc("ghc_referral_queue_reward", {
    p_referred_user_id: input.referredUserId,
    p_membership_reference_id: input.membershipReferenceId,
    p_charged_ghc: input.chargedGhc,
  })
  if (!data || data.ok !== true) return { ok: false as const, error: String(data?.error || "RPC_FAILED") }
  return {
    ok: true as const,
    queued: Boolean(data.queued),
    rewardId: data.rewardId ? String(data.rewardId) : undefined,
    rewardGhc: data.rewardGhc != null ? Number(data.rewardGhc) : undefined,
    reason: data.reason ? String(data.reason) : undefined,
  }
}

/** Post pending reward to ledger — only when settlement flag enabled. */
export async function settleReferralReward(rewardId: string) {
  if (!settlementEnabled()) {
    return { ok: false as const, error: "REFERRAL_SETTLEMENT_DISABLED" }
  }
  const data = await rpc("ghc_settle_referral_reward", { p_reward_id: rewardId })
  if (!data || data.ok !== true) return { ok: false as const, error: String(data?.error || "RPC_FAILED") }
  return {
    ok: true as const,
    idempotent: Boolean(data.idempotent),
    ledgerReferenceId: data.ledgerReferenceId ? String(data.ledgerReferenceId) : undefined,
    rewardGhc: data.rewardGhc != null ? Number(data.rewardGhc) : undefined,
  }
}

export function isReferralSettlementEnabled() {
  return settlementEnabled()
}

function nonNegativeFinite(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function nonNegativeCount(value: unknown): number {
  const parsed = nonNegativeFinite(value)
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(parsed))
}

/** Service-role read of referral programme status for a user (never invents rewards). */
export async function getReferralStatus(userId: string): Promise<{
  ok: boolean
  code?: string
  attributed?: boolean
  invitedCount?: number
  pendingRewardCount?: number
  postedRewardCount?: number
  pendingRewardGhc?: number
  postedRewardGhc?: number
  settlementEnabled?: boolean
  error?: string
}> {
  const e = env()
  if (!e.supabaseUrl || !e.supabaseServiceRoleKey) {
    return { ok: false, error: "DB_UNAVAILABLE" }
  }
  try {
    const codeRes = await ensureReferralCode(userId)
    const code = codeRes.ok ? codeRes.code : undefined

    // Prefer the database aggregate so invite/reward totals remain accurate beyond
    // the old 200-attribution / 100-reward REST preview limits.
    const summary = await rpc("ghc_referral_summary", { p_user_id: userId })
    if (!summary || summary.ok !== true) {
      return { ok: false, error: String(summary?.error || "REFERRAL_SUMMARY_UNAVAILABLE"), code, settlementEnabled: settlementEnabled() }
    }
    return {
      ok: true,
      code,
      attributed: summary.attributed === true,
      invitedCount: nonNegativeCount(summary.invitedCount),
      pendingRewardCount: nonNegativeCount(summary.pendingRewardCount),
      postedRewardCount: nonNegativeCount(summary.postedRewardCount),
      pendingRewardGhc: nonNegativeFinite(summary.pendingRewardGhc),
      postedRewardGhc: nonNegativeFinite(summary.postedRewardGhc),
      settlementEnabled: settlementEnabled(),
    }


  } catch {
    return { ok: false, error: "STATUS_FAILED" }
  }
}
