/** Authenticated, secret-safe preflight for the Pi earnings payout rail. */
import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { pinProofConfigured } from "@/lib/server/identity/withdrawal-pin-proof"
import { resolvePiSandbox } from "@/lib/pi-env"
import { a2uTestnetGate } from "@/lib/server/economy/testnet-unlock"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache" },
  })
}

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return reply({ ok: false, ready: false, error: "AUTH_REQUIRED" }, 401)

  const env = readGhcServerEnv()
  const gate = a2uTestnetGate(resolvePiSandbox())
  if (!gate.open) {
    return reply({ ok: true, ready: false, error: "PI_EARNINGS_PAYOUT_EXECUTION_DISABLED", missing: gate.missing })
  }
  if (Buffer.byteLength(String(process.env.PI_EARNINGS_EXECUTOR_KEY || "").trim(), "utf8") < 32) {
    return reply({ ok: true, ready: false, error: "PI_EARNINGS_EXECUTOR_NOT_CONFIGURED" })
  }
  const apiKey = String(process.env.PI_API_KEY || process.env.PI_SERVER_API_KEY || "").trim()
  const walletSeed = String(process.env.PI_WALLET_PRIVATE_SEED || "").trim()
  if (!apiKey || !/^S[A-Z2-7]{55}$/.test(walletSeed)) {
    return reply({ ok: true, ready: false, error: "PI_SERVER_CREDENTIALS_MISSING" })
  }
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return reply({ ok: true, ready: false, error: "PAYOUT_SERVICE_UNAVAILABLE" })
  }
  if (!pinProofConfigured()) {
    return reply({ ok: true, ready: false, error: "PIN_PROOF_SECRET_MISSING" })
  }
  return reply({ ok: true, ready: true, network: "Pi Testnet" })
}
