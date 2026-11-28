import { NextResponse } from "next/server"
import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { checkDurableRateLimit } from "@/lib/server/security/control-plane"
import { nonDurableWriteResponse } from "@/lib/server/production-guard"
import { supabaseRest, supabaseRpc } from "@/lib/server/supabase/rest-client"
import { emitSocialNotification } from "@/lib/server/social/notifications"
import { readBoundedJson } from "@/lib/server/http/read-bounded-json"
import { humanizeRelationshipError, sanitizeTargetUserId } from "@/lib/server/social/relationship-integrity"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/matching/signal
 * Body: { targetUserId: string, signal: "like" | "pass" | "superlike" }
 * Actor is always the session user. Never trusts client fromUserId.
 */
export async function POST(req: Request) {
  try {
    const auth = await resolveAuthenticatedUser(req.headers)
    if (!auth?.userId) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
    }

    const rl = await checkDurableRateLimit(`match-signal:${auth.userId}`, 60, 60_000, { onUnavailable: "deny" })
    if (!rl.ok) return NextResponse.json({ ok: false, error: rl.unavailable ? "RATE_LIMIT_UNAVAILABLE" : "RATE_LIMITED", retryAfterSec: rl.retryAfterSec }, { status: rl.unavailable ? 503 : 429, headers: { "Cache-Control": "no-store", "Retry-After": String(rl.retryAfterSec) } })

    const parsedBody = await readBoundedJson(req, 4 * 1024)
    if (!parsedBody.ok) {
      return NextResponse.json(
        { ok: false, error: parsedBody.error },
        { status: parsedBody.error === "REQUEST_TOO_LARGE" ? 413 : 400 },
      )
    }
    const body = parsedBody.value
    if (typeof body.targetUserId !== "string" || typeof body.signal !== "string") {
      return NextResponse.json({ ok: false, error: "INVALID_SIGNAL" }, { status: 400 })
    }
    const targetUserId = body.targetUserId.trim()
    const signal = body.signal.trim().toLowerCase()
    const targetCheck = sanitizeTargetUserId(targetUserId, auth.userId)
    if (!targetCheck.ok) {
      return NextResponse.json(
        { ok: false, error: targetCheck.error, message: humanizeRelationshipError(targetCheck.error) },
        { status: 400, headers: { "Cache-Control": "no-store, private" } }
      )
    }
    const safeTarget = targetCheck.targetUserId

    if (!["like", "pass", "superlike"].includes(signal)) {
      return NextResponse.json({ ok: false, error: "INVALID_SIGNAL" }, { status: 400 })
    }

    const env = readGhcServerEnv()
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      const nd = nonDurableWriteResponse("Match signal")
      return NextResponse.json(nd.body, { status: nd.status })
    }

    const upsert = await supabaseRpc("ghc_match_signal_upsert", {
      p_from_user_id: auth.userId,
      p_to_user_id: safeTarget,
      p_signal: signal,
    }, { timeoutMs: 10_000 })

    if (!upsert.ok) {
      const nd = nonDurableWriteResponse("Match signal", {
        extra: { message: "RPC_UNAVAILABLE", detail: upsert.error },
      })
      return NextResponse.json(nd.body, { status: nd.status })
    }

    const row = upsert.data

    // Detect mutual interest (they liked us + we like them). A failed lookup degrades to
    // "not mutual" rather than failing a signal that was already stored.
    let mutual = false
    if (signal === "like" || signal === "superlike") {
      const peer = await supabaseRest<unknown[]>(
        `ghc_match_signals?from_user_id=eq.${encodeURIComponent(safeTarget)}` +
          `&to_user_id=eq.${encodeURIComponent(auth.userId)}` +
          `&signal=in.(like,superlike)&select=id&limit=1`,
        { timeoutMs: 8_000 },
      )
      mutual = peer.ok && Array.isArray(peer.data) && peer.data.length > 0
    }

    // Phase 8: notify peer of interest / mutual match
    if (signal === "like" || signal === "superlike") {
      if (mutual) {
        void emitSocialNotification({
          recipientUserId: safeTarget,
          actorUserId: auth.userId,
          type: "follow",
          entityType: "user",
          entityId: auth.userId,
          title: "It's a Match",
          body: "You both expressed interest on GreenHaven",
          dedupeKey: `match_mutual:${[auth.userId, safeTarget].sort().join(":")}`,
          metadata: { kind: "match_mutual" },
        })
      } else {
        void emitSocialNotification({
          recipientUserId: safeTarget,
          actorUserId: auth.userId,
          type: "follow",
          entityType: "user",
          entityId: auth.userId,
          title: "New interest",
          body: "Someone liked your profile",
          dedupeKey: `match_like:${auth.userId}:${safeTarget}`,
          metadata: { kind: "match_like", signal },
        })
      }
    }
    return NextResponse.json({
      ok: true,
      durable: true,
      signal,
      targetUserId,
      mutual,
      row,
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "signal_failed" },
      { status: 500 }
    )
  }
}
