/**
 * Canonical transport for the durable GHC spend RPC.
 *
 * This module does not authenticate callers or decide the amount/reference.
 * Routes must derive userId from their verified server auth context and bind
 * amount/reference to their server-owned catalog/order before calling it.
 */
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { parseGhcSpendRpcResult } from "@/lib/server/economy/spend-rpc-contract"

export type AuthoritativeSpendRpcInput = {
  userId: string
  amount: number
  referenceId: string
  reason: string
  sourceEvent: string
}

export type AuthoritativeSpendRpcResult = {
  ok: boolean
  idempotent?: boolean
  tx?: unknown
  error?: string
}

export async function executeGhcSpendRpc(
  input: AuthoritativeSpendRpcInput,
  options: { transportError?: string } = {},
): Promise<AuthoritativeSpendRpcResult> {
  const transportError = options.transportError || "SPEND_RPC_FAILED"
  const userId = String(input.userId || "").trim()
  const referenceId = String(input.referenceId || "").trim()
  if (!userId || !referenceId || !Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "INVALID_SPEND_BINDING" }
  }

  const env = readGhcServerEnv()
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return { ok: false, error: "SERVER_UNAVAILABLE" }
  }

  try {
    const response = await fetch(`${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/ghc_execute_spend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        apikey: env.supabaseServiceRoleKey,
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        p_user_id: userId,
        p_amount: input.amount,
        p_reference_id: referenceId,
        p_reason: input.reason,
        p_source_event: input.sourceEvent,
      }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) return { ok: false, error: transportError }
    const result = parseGhcSpendRpcResult(data, input)
    if (!result.ok) return { ok: false, error: result.error }
    return { ok: true, idempotent: result.idempotent, tx: result.tx }
  } catch {
    return { ok: false, error: transportError }
  }
}
