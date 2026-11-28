/**
 * Phase D6 — server-side GHC notification events (authoritative when DB configured).
 * Dedupe by (userId, dedupeKey). Never accept client-created "received" as proof of payment.
 */

import { hasPrivilegedDatabase, readGhcServerEnv, type GhcServerEnv } from "./env"
import { getProcessGhcStore } from "./store"
import { buildCorrelationEnvelope } from "./correlation"
import { supabaseRpc, supabaseRest } from "@/lib/server/supabase/rest-client"

export type GhcNotifEventType =
  | "GHC_SENT"
  | "GHC_RECEIVED"
  | "GHC_REQUEST_CREATED"
  | "GHC_REQUEST_ACCEPTED"
  | "GHC_REQUEST_DECLINED"
  | "GHC_REQUEST_CANCELLED"
  | "GHC_REQUEST_EXPIRED"
  | "GHC_TRANSFER_FAILED"
  | "GHC_TRANSFER_REVERSED"

export type GhcNotificationRecord = {
  id: string
  userId: string
  eventType: GhcNotifEventType | string
  title: string
  body: string
  referenceId?: string
  requestId?: string
  metadata?: Record<string, unknown>
  createdAt: number
  readAt?: number | null
  expiresAt?: number | null
  dedupeKey?: string
}

type MemoryNotif = GhcNotificationRecord

const memoryNotifs: MemoryNotif[] = []

function isDb(): boolean {
  return hasPrivilegedDatabase(readGhcServerEnv())
}

function allowMemory(): boolean {
  if (isDb()) return false
  // Align with economy http.allowMemoryServer — never on Vercel/production
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) return false
  if (process.env.NODE_ENV === "production" || process.env.GHC_ENV === "production") {
    return false
  }
  return process.env.GHC_SERVER_MEMORY === "1" || process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
}

function buildDedupe(
  userId: string,
  eventType: string,
  referenceId?: string | null,
  explicit?: string | null
): string {
  if (explicit && explicit.trim()) return explicit.trim()
  if (referenceId) return `${userId}:${eventType}:${referenceId}`
  return `${userId}:${eventType}:${Date.now()}`
}

export async function recordGhcNotification(input: {
  userId: string
  eventType: GhcNotifEventType | string
  title: string
  body: string
  referenceId?: string
  requestId?: string
  metadata?: Record<string, unknown>
  dedupeKey?: string
  expiresAt?: number
}): Promise<{ ok: boolean; idempotent?: boolean; id?: string }> {
  const userId = String(input.userId || "").trim()
  if (!userId) return { ok: false }
  const dedupeKey = buildDedupe(userId, input.eventType, input.referenceId, input.dedupeKey)

  if (isDb()) {
    try {
      const res = await supabaseRpc<Record<string, unknown>>("ghc_record_notification_event", {
        p_user_id: userId,
        p_event_type: input.eventType,
        p_title: input.title,
        p_body: input.body,
        p_reference_id: input.referenceId ?? null,
        p_request_id: input.requestId ?? null,
        p_payload: { ...(input.metadata || {}), correlation: buildCorrelationEnvelope({ kind: "transfer", event: input.eventType, counterpartyId: input.metadata?.counterpartyId ? String(input.metadata.counterpartyId) : undefined, requestId: input.requestId }) },
        p_dedupe_key: dedupeKey,
        p_expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
      }, { timeoutMs: 8_000 })
      if (!res.ok || !res.data || typeof res.data !== "object") return { ok: false }
      const data = res.data as Record<string, unknown>
      return {
        ok: data.ok === true,
        idempotent: Boolean(data.idempotent),
        id: data.id ? String(data.id) : undefined,
      }
    } catch {
      return { ok: false }
    }
  }

  if (!allowMemory()) return { ok: false }

  const existing = memoryNotifs.find((n) => n.userId === userId && n.dedupeKey === dedupeKey)
  if (existing) return { ok: true, idempotent: true, id: existing.id }

  const row: MemoryNotif = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    eventType: input.eventType,
    title: input.title,
    body: input.body,
    referenceId: input.referenceId,
    requestId: input.requestId,
    metadata: { ...(input.metadata || {}), correlation: buildCorrelationEnvelope({ kind: "transfer", event: input.eventType, counterpartyId: input.metadata?.counterpartyId ? String(input.metadata.counterpartyId) : undefined, requestId: input.requestId }) },
    createdAt: Date.now(),
    readAt: null,
    expiresAt: input.expiresAt ?? null,
    dedupeKey,
  }
  memoryNotifs.push(row)
  try {
    getProcessGhcStore().pushEvent(userId, input.eventType, input.metadata || {}, input.referenceId)
  } catch {
    /* */
  }
  return { ok: true, idempotent: false, id: row.id }
}

/** Compatibility wrapper: an unavailable store reads as an empty list. Routes that must tell an outage from "no notifications" use listGhcNotificationsChecked. */
export async function listGhcNotifications(
  userId: string,
  opts?: { limit?: number; unreadOnly?: boolean }
): Promise<GhcNotificationRecord[]> {
  return (await listGhcNotificationsChecked(userId, opts)) ?? []
}

/** Lists economy notifications, or null when the store could not be read (so callers can answer 503 instead of an empty 200). */
export async function listGhcNotificationsChecked(
  userId: string,
  opts?: { limit?: number; unreadOnly?: boolean }
): Promise<GhcNotificationRecord[] | null> {
  const safeLimit = Number.isFinite(opts?.limit) ? Math.floor(opts!.limit as number) : 50
  const limit = Math.max(1, Math.min(safeLimit, 100))
  if (isDb()) {
    const base = "ghc_economy_events"
    const params = new URLSearchParams()
    params.set("user_id", `eq.${userId}`)
    params.set("order", "created_at.desc")
    params.set("limit", String(limit))
    if (opts?.unreadOnly) params.set("read_at", "is.null")
    try {
      const res = await supabaseRest<Array<Record<string, unknown>>>(`${base}?${params}`, { method: "GET", timeoutMs: 8_000 })
      if (!res.ok || !Array.isArray(res.data)) return null
      const rows = res.data
      return rows.map((r) => ({
        id: String(r.id),
        userId: String(r.user_id),
        eventType: String(r.event_type),
        title: String(r.title || r.event_type),
        body: String(r.body || ""),
        referenceId: r.reference_id ? String(r.reference_id) : undefined,
        requestId: r.request_id ? String(r.request_id) : undefined,
        metadata: (r.payload as Record<string, unknown>) || {},
        createdAt: r.created_at ? new Date(String(r.created_at)).getTime() : Date.now(),
        readAt: r.read_at ? new Date(String(r.read_at)).getTime() : null,
        expiresAt: r.expires_at ? new Date(String(r.expires_at)).getTime() : null,
        dedupeKey: r.dedupe_key ? String(r.dedupe_key) : undefined,
      }))
    } catch {
      return null
    }
  }

  if (!allowMemory()) return null
  let list = memoryNotifs.filter((n) => n.userId === userId)
  if (opts?.unreadOnly) list = list.filter((n) => !n.readAt)
  return list.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit)
}

export type MarkNotificationReadResult = "marked" | "not_found" | "unavailable"

/**
 * Mark one economy notification read. Only the owner's row is touched. An already-read row is a success
 * (idempotent) so a retry or a second device never reports a false failure, and a missing row is distinguished
 * from a store outage so callers can answer 404 versus 503.
 */
export async function markGhcNotificationRead(
  userId: string,
  notificationId: string
): Promise<MarkNotificationReadResult> {
  if (isDb()) {
    try {
      const owner = `id=eq.${encodeURIComponent(notificationId)}&user_id=eq.${encodeURIComponent(userId)}`
      const patched = await supabaseRest<Array<{ id: string }>>(`ghc_economy_events?${owner}&read_at=is.null&select=id`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ read_at: new Date().toISOString() }),
        timeoutMs: 8_000,
      })
      if (!patched.ok) return "unavailable"
      if (Array.isArray(patched.data) && patched.data.length > 0) return "marked"
      const existing = await supabaseRest<Array<{ id: string }>>(`ghc_economy_events?${owner}&select=id&limit=1`, { method: "GET", timeoutMs: 8_000 })
      if (!existing.ok) return "unavailable"
      return Array.isArray(existing.data) && existing.data.length > 0 ? "marked" : "not_found"
    } catch {
      return "unavailable"
    }
  }
  if (!allowMemory()) return "unavailable"
  const row = memoryNotifs.find((n) => n.id === notificationId && n.userId === userId)
  if (!row) return "not_found"
  if (!row.readAt) row.readAt = Date.now()
  return "marked"
}

/** Mark every unread economy notification read. Returns the number changed, or null when the store failed. */
export async function markAllGhcNotificationsRead(userId: string): Promise<number | null> {
  if (isDb()) {
    try {
      const res = await supabaseRest<Array<{ id: string }>>(`ghc_economy_events?user_id=eq.${encodeURIComponent(userId)}&read_at=is.null&select=id`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ read_at: new Date().toISOString() }),
        timeoutMs: 10_000,
      })
      if (!res.ok) return null
      return Array.isArray(res.data) ? res.data.length : 0
    } catch {
      return null
    }
  }
  if (!allowMemory()) return null
  let n = 0
  for (const row of memoryNotifs) {
    if (row.userId === userId && !row.readAt) {
      row.readAt = Date.now()
      n++
    }
  }
  return n
}

export async function unreadGhcNotificationCount(userId: string): Promise<number> {
  return (await unreadGhcNotificationCountChecked(userId)) ?? 0
}

/**
 * Exact unread count (no 100-row cap) or null when the store failed, so the bell keeps its last known
 * count on an outage instead of being reset to zero.
 */
export async function unreadGhcNotificationCountChecked(userId: string): Promise<number | null> {
  if (isDb()) {
    try {
      const res = await supabaseRest<unknown[]>(
        `ghc_economy_events?user_id=eq.${encodeURIComponent(userId)}&read_at=is.null&select=id&limit=1`,
        { method: "GET", headers: { Prefer: "count=exact" }, timeoutMs: 8_000 },
      )
      if (!res.ok) return null
      const range = res.headers.get("content-range") || ""
      const total = /\/(\d+)$/.exec(range)
      if (total) return Number(total[1])
      return Array.isArray(res.data) ? res.data.length : null
    } catch {
      return null
    }
  }
  const list = await listGhcNotificationsChecked(userId, { unreadOnly: true, limit: 100 })
  return list ? list.length : null
}

/** Call after authoritative transfer success — records both sides with dedupe */
export async function notifyTransferCompleted(input: {
  senderId: string
  recipientId: string
  amount: number
  referenceId: string
  senderName?: string
  recipientName?: string
}) {
  const amt = input.amount
  await recordGhcNotification({
    userId: input.senderId,
    eventType: "GHC_SENT",
    title: "GHC sent",
    body: `${amt} GHC sent to ${input.recipientName || input.recipientId}.`,
    referenceId: input.referenceId,
    metadata: {
      amount: amt,
      currency: "GHC",
      counterpartyId: input.recipientId,
      counterpartyName: input.recipientName,
      role: "sent",
      open: "transaction",
      transactionId: input.referenceId,
      referenceId: input.referenceId,
      deepLink: { open: "wallet", tab: "wallet", section: "transaction", transactionId: input.referenceId, referenceId: input.referenceId },
    },
  })
  await recordGhcNotification({
    userId: input.recipientId,
    eventType: "GHC_RECEIVED",
    title: "GHC received",
    body: `You received ${amt} GHC from ${input.senderName || input.senderId}.`,
    referenceId: input.referenceId,
    metadata: {
      amount: amt,
      currency: "GHC",
      counterpartyId: input.senderId,
      counterpartyName: input.senderName,
      role: "received",
      open: "transaction",
      transactionId: input.referenceId,
      referenceId: input.referenceId,
      deepLink: { open: "wallet", tab: "wallet", section: "transaction", transactionId: input.referenceId, referenceId: input.referenceId },
    },
  })
}
