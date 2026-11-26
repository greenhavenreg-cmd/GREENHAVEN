/**
 * Phase 26 — service-role RPC client for operational financial workflows.
 * Never trusts client amounts as authority for balances; only records evidence-backed operations.
 */
import { hasPrivilegedDatabase, readGhcServerEnv } from "@/lib/server/economy/env"
import { supabaseRpc, supabaseRest } from "@/lib/server/supabase/rest-client"
import { operatorKeyValueAuthorized } from "@/lib/server/security/operator-key"

export function evidenceFingerprint(parts: Record<string, unknown>): string {
  const payload = JSON.stringify(parts, Object.keys(parts).sort())
  return createHash("sha256").update(payload).digest("hex")
}

export function assertOperatorKey(headerValue: string | null): boolean {
  // Operational financial workflows have one dedicated key. The A2U worker key
  // must never grant authority to disputes, refunds, payout corrections or renewals.
  return operatorKeyValueAuthorized(headerValue, "GHC_OPERATOR_RECONCILE_KEY")
}

export async function callOperationalRpc<T extends Record<string, unknown>>(
  name: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  if (!hasPrivilegedDatabase()) return null
  const env = readGhcServerEnv()
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null
  try {
    const response = await (async () => { const r = await supabaseRpc(name, body, { timeoutMs: 15000 }); return { ok: r.ok, status: r.status, json: async () => r.ok ? r.data : r.body, text: async () => JSON.stringify(r.ok ? r.data : r.body) }; })()
    const result = (await response.json().catch(() => null)) as T | null
    if (!response.ok || result === null) return null
    return result
  } catch {
    return null
  }
}
