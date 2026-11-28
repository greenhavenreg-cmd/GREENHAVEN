/**
 * Navigation attention counts for conversations.
 *
 * The bottom-navigation badges must agree with what the inbox shows: archived
 * conversations are out of the inbox, and a muted conversation must not pull
 * attention (a mute with an expired `muteUntil` no longer applies). Kept free
 * of app-path imports so it can be unit-tested directly.
 */
export interface ConversationAttentionInput {
  unread?: boolean
  unreadCount?: number
  isArchived?: boolean
  isMuted?: boolean
  /** Epoch ms when a timed mute ends; absent or non-positive means until unmuted. */
  muteUntil?: number
  conversationType?: "private" | "group" | string
}

export function isConversationMutedNow(c: ConversationAttentionInput, now: number = Date.now()): boolean {
  if (!c.isMuted) return false
  const until = typeof c.muteUntil === "number" && Number.isFinite(c.muteUntil) ? c.muteUntil : 0
  return !(until > 0 && until <= now)
}

/** Unread messages in one conversation that should raise navigation attention. */
export function conversationAttentionCount(c: ConversationAttentionInput | null | undefined, now: number = Date.now()): number {
  if (!c || c.isArchived || isConversationMutedNow(c, now)) return 0
  if (typeof c.unreadCount === "number" && Number.isFinite(c.unreadCount)) return Math.max(0, Math.floor(c.unreadCount))
  return c.unread ? 1 : 0
}

export function messagesAttentionCount(list: readonly (ConversationAttentionInput | null | undefined)[] | null | undefined, now: number = Date.now()): number {
  if (!Array.isArray(list)) return 0
  return list.reduce((n, c) => n + conversationAttentionCount(c, now), 0)
}

/** Number of group conversations with unread activity (community badge). */
export function groupsAttentionCount(list: readonly (ConversationAttentionInput | null | undefined)[] | null | undefined, now: number = Date.now()): number {
  if (!Array.isArray(list)) return 0
  return list.reduce((n, c) => n + (c && c.conversationType === "group" && (conversationAttentionCount(c, now) > 0 || (!c.isArchived && !isConversationMutedNow(c, now) && c.unread)) ? 1 : 0), 0)
}
