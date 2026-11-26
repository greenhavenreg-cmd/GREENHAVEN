/** Read Pi earnings payout history and create a durable payout request. POST never sends a Pi transfer. */
import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { checkDurableRateLimit, durableRateLimitStatus, durableRateLimitCode } from "@/lib/server/security/control-plane"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { quoteWithdrawal, createPiEarningsPayoutRequest, grossForRequestedNetAtomic } from "@/lib/server/earnings/unified-ledger"
import { checkPinProof, pinProofConfigured } from "@/lib/server/identity/withdrawal-pin-proof"
import { assertPayoutWalletAuthorization } from "@/lib/server/identity/wallet-authorization"
import { resolvePiSandbox } from "@/lib/pi-env"
import { supabaseRpc } from "@/lib/server/supabase/rest-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache" }
function reply(body: unknown, status = 200) { return NextResponse.json(body, { status, headers }) }


/** Read-only, session-scoped payout history. Never expose recipient UID, idempotency key, or provider receipt. */
export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return reply({ ok: false, error: "AUTH_REQUIRED" }, 401)
  const rate = await checkDurableRateLimit(`pi-earnings-payout-history:${auth.userId}`, 30, 60_000, { onUnavailable: "deny" })
  if (!rate.ok) return reply({ ok: false, error: durableRateLimitCode(rate), retryAfterSec: rate.retryAfterSec }, durableRateLimitStatus(rate))

  const result = await supabaseRpc<Record<string, unknown>>("gh_pi_earnings_payout_list_owned", {
    p_user_id: auth.userId,
    p_limit: 50,
  }, { timeoutMs: 8_000 })
  const data = result.ok && result.data && typeof result.data === "object"
    ? result.data as Record<string, unknown>
    : null
  if (!data || data.ok !== true || !Array.isArray(data.items)) {
    return reply({ ok: false, error: "PAYOUT_HISTORY_UNAVAILABLE", message: "Pi withdrawal history is temporarily unavailable. Your balance and requests have not been changed." }, 503)
  }
  const allowedStatuses = new Set(["reserved", "processing", "uncertain", "paid", "failed", "released"])
  const items = data.items.flatMap((raw: unknown) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return []
    const row = raw as Record<string, unknown>
    const id = typeof row.id === "string" ? row.id : ""
    const status = typeof row.status === "string" ? row.status : ""
    const gross = String(row.grossAtomic ?? "")
    const fee = String(row.feeAtomic ?? "")
    const net = String(row.netAtomic ?? "")
    const validAtomic = (v: string) => /^\d{1,38}$/.test(v)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !allowedStatuses.has(status) || !validAtomic(gross) || !validAtomic(fee) || !validAtomic(net)) return []
    return [{
      id, status, grossAtomic: gross, feeAtomic: fee, netAtomic: net,
      network: row.network === "Pi Testnet" ? "Pi Testnet" : "Unknown network",
      providerTxid: typeof row.providerTxid === "string" ? row.providerTxid.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200) || null : null,
      createdAt: typeof row.createdAt === "string" ? row.createdAt : null,
      updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : null,
      settledAt: typeof row.settledAt === "string" ? row.settledAt : null,
    }]
  })
  return reply({ ok: true, asset: "PI", items, limit: 50, source: "gh_pi_earnings_payout_list_owned" })
}

export async function POST(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return reply({ ok: false, error: "AUTH_REQUIRED" }, 401)
  const rate = await checkDurableRateLimit(`pi-earnings-payout-request:${auth.userId}`, 5, 60_000, { onUnavailable: "deny" })
  if (!rate.ok) return reply({ ok: false, error: durableRateLimitCode(rate), retryAfterSec: rate.retryAfterSec }, durableRateLimitStatus(rate))

  // Request creation is intentionally disabled until the reviewed migration is applied
  // and the operator has explicitly enabled Testnet request intake.
  if (process.env.PI_EARNINGS_PAYOUT_REQUESTS_ENABLED !== "true" || process.env.PI_NETWORK !== "testnet") {
    return reply({ ok: false, error: "PI_EARNINGS_PAYOUT_REQUESTS_DISABLED" }, 503)
  }
  // Never reserve (lock) a user's available PI unless the Testnet executor that can
  // settle or release that reservation is also enabled. Otherwise the requested
  // amount is stranded in "reserved" and the user's genuinely earned balance
  // (registration bonus, rewards, cashback) cannot be used.
  if (
    process.env.PI_EARNINGS_PAYOUT_EXECUTION_ENABLED !== "true" ||
    process.env.PI_A2U_ENABLED !== "true" ||
    process.env.PI_A2U_TESTNET_ONLY !== "true" ||
    process.env.PI_EARNINGS_AUTO_EXECUTE !== "true" ||
    process.env.PI_ENV !== "production" ||
    process.env.VERCEL_ENV === "production" ||
    !resolvePiSandbox()
  ) {
    return reply({
      ok: false,
      error: "PI_EARNINGS_PAYOUT_EXECUTION_DISABLED",
      message: "Testnet payout execution is not fully enabled. Your balance is untouched and stays available.",
    }, 503)
  }
  const executorKey = String(process.env.PI_EARNINGS_EXECUTOR_KEY || "").trim()
  if (Buffer.byteLength(executorKey, "utf8") < 32) {
    return reply({ ok: false, error: "PI_EARNINGS_EXECUTOR_NOT_CONFIGURED", message: "The Testnet payout executor is not configured. No Pi was reserved." }, 503)
  }
  const piApiKey = String(process.env.PI_API_KEY || process.env.PI_SERVER_API_KEY || "").trim()
  const piWalletSeed = String(process.env.PI_WALLET_PRIVATE_SEED || "").trim()
  if (!piApiKey || !/^S[A-Z2-7]{55}$/.test(piWalletSeed)) {
    return reply({ ok: false, error: "PI_SERVER_CREDENTIALS_MISSING", message: "The Testnet Pi payout wallet is not configured. No Pi was reserved." }, 503)
  }
  const parsed = await readBoundedJson(request, 8 * 1024)
  if (!parsed.ok) return reply({ ok: false, error: parsed.error }, parsed.error === "REQUEST_TOO_LARGE" ? 413 : 400)
  const body = parsed.value as { amountAtomic?: unknown; idempotencyKey?: unknown; pinProof?: unknown }
  if (typeof body.amountAtomic !== "number" || !Number.isSafeInteger(body.amountAtomic) || body.amountAtomic <= 0) {
    return reply({ ok: false, error: "INVALID_AMOUNT_ATOMIC" }, 400)
  }
  const key = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : ""
  if (key.length < 16 || key.length > 160 || !/^[A-Za-z0-9._:-]+$/.test(key)) {
    return reply({ ok: false, error: "IDEMPOTENCY_KEY_REQUIRED" }, 400)
  }

  // Server-enforced withdrawal PIN: no valid proof for this user + key, no reservation.
  if (!pinProofConfigured()) return reply({ ok: false, error: "PIN_PROOF_SECRET_MISSING", requiredEnv: "GH_PIN_PROOF_SECRET", compatibilityEnv: "GHC_PIN_PROOF_SECRET", message: "Withdrawal PIN verification is unavailable because the server-side signing key is not configured. Your balance has not been reserved." }, 503)
  if (!checkPinProof(auth.userId, key, body.pinProof)) {
    return reply({ ok: false, error: "PIN_PROOF_REQUIRED", message: "Verify your withdrawal PIN to continue." }, 403)
  }

  // amountAtomic is the user-requested NET payout. Server derives gross debit + 3% fee.
  const grossAtomic = grossForRequestedNetAtomic(body.amountAtomic, 300)
  if (!grossAtomic) return reply({ ok: false, error: "INVALID_AMOUNT_ATOMIC" }, 400)
  const quote = await quoteWithdrawal({ userId: auth.userId, grossAtomic })
  if (!quote.ok || !Number.isSafeInteger(quote.grossAtomic) || !Number.isSafeInteger(quote.feeAtomic) || !Number.isSafeInteger(quote.netAtomic)) {
    return reply({ ok: false, error: quote.error || "WITHDRAWAL_QUOTE_INVALID" }, quote.error === "EARNINGS_LEDGER_UNAVAILABLE" ? 503 : 409)
  }
  const recipientUid = String(quote.recipientPiAppUid || "").trim()
  if (!recipientUid) {
    return reply({ ok: false, error: "VERIFIED_PI_RECIPIENT_REQUIRED" }, 409)
  }
  // Require explicit, active consent before even reserving a payout request.
  // The execution worker independently rechecks consent immediately before A2U.
  const walletAuthorization = await assertPayoutWalletAuthorization({
    ghUserId: auth.userId,
    recipientUid,
  })
  if (!walletAuthorization.ok) {
    const error = walletAuthorization.error || "WALLET_AUTHORIZATION_REQUIRED"
    return reply({
      ok: false,
      error,
      message: error === "WALLET_AUTHORIZATION_REQUIRED"
        ? "Authorize Pi wallet payouts before requesting a withdrawal."
        : undefined,
    }, error === "WALLET_AUTHORIZATION_UNAVAILABLE" ? 503 : 409)
  }

  const fingerprint = createHash("sha256").update([
    auth.userId, "PI", "Pi Testnet", body.amountAtomic, quote.grossAtomic, quote.feeAtomic, quote.netAtomic,
    recipientUid,
  ].join("|")).digest("hex")
  const result = await createPiEarningsPayoutRequest({
    userId: auth.userId, idempotencyKey: key, requestFingerprint: fingerprint,
    grossAtomic: quote.grossAtomic!, feeAtomic: quote.feeAtomic!, netAtomic: quote.netAtomic!, network: "Pi Testnet",
  })
  if (!result.ok) {
    const status = result.error === "EARNINGS_LEDGER_UNAVAILABLE" ? 503 : 409
    return reply({
      ok: false,
      error: result.error,
      ...(result.error === "PAYOUT_ALREADY_IN_PROGRESS" ? {
        activeRequestId: result.requestId,
        activeRequestStatus: result.status,
        message: "You already have a Pi withdrawal awaiting provider confirmation. No new withdrawal was created and no additional balance was reserved. Please check the existing request status.",
      } : {}),
    }, status)
  }
  return reply({
    ok: true, requestId: result.requestId, status: result.status,
    duplicate: result.duplicate === true, grossAtomic: result.grossAtomic,
    feeAtomic: result.feeAtomic, netAtomic: result.netAtomic,
    network: "Pi Testnet", transferSubmitted: false,
    requestedNetAtomic: body.amountAtomic,
    message: "Your requested net Pi amount is targeted for delivery; the 3% fee is added on top and included in the gross reservation. Pi has not been sent yet; the balance returns to Available only after a safe, verified release, or settles after a verified Pi Testnet payment.",
  }, result.duplicate ? 200 : 201)
}
