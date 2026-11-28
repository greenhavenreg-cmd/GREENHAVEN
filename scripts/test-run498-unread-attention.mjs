import assert from "node:assert/strict"
import { conversationAttentionCount as c, messagesAttentionCount as m, groupsAttentionCount as g, isConversationMutedNow as muted } from "../lib/messaging/unread-attention.ts"
let n = 0
const t = (name, fn) => { fn(); n += 1; console.log(`ok - ${name}`) }
const NOW = 1_000_000
t("flag-only unread counts as 1", () => assert.equal(c({ unread: true }, NOW), 1))
t("numeric count wins over flag", () => { assert.equal(c({ unread: true, unreadCount: 4 }, NOW), 4); assert.equal(c({ unread: true, unreadCount: 0 }, NOW), 0) })
t("negative / fractional / NaN counts are bounded", () => { assert.equal(c({ unreadCount: -3 }, NOW), 0); assert.equal(c({ unreadCount: 2.9 }, NOW), 2); assert.equal(c({ unread: true, unreadCount: NaN }, NOW), 1) })
t("archived conversations raise no attention", () => assert.equal(c({ unreadCount: 5, isArchived: true }, NOW), 0))
t("muted conversations raise no attention", () => assert.equal(c({ unreadCount: 5, isMuted: true }, NOW), 0))
t("timed mute applies until it ends", () => { assert.equal(muted({ isMuted: true, muteUntil: NOW + 10 }, NOW), true); assert.equal(c({ unreadCount: 2, isMuted: true, muteUntil: NOW + 10 }, NOW), 0) })
t("expired timed mute no longer hides unread", () => { assert.equal(muted({ isMuted: true, muteUntil: NOW - 1 }, NOW), false); assert.equal(c({ unreadCount: 2, isMuted: true, muteUntil: NOW - 1 }, NOW), 2) })
t("non-positive muteUntil means until unmuted", () => assert.equal(muted({ isMuted: true, muteUntil: 0 }, NOW), true))
t("null / missing rows are ignored", () => { assert.equal(c(null, NOW), 0); assert.equal(m(null, NOW), 0); assert.equal(m(undefined, NOW), 0); assert.equal(m([null, undefined, { unread: true }], NOW), 1) })
t("messages total sums only visible, unmuted conversations", () => assert.equal(m([{ unreadCount: 2 }, { unreadCount: 7, isArchived: true }, { unreadCount: 3, isMuted: true }, { unread: true }], NOW), 3))
t("group badge counts groups, not messages, and skips archived/muted", () => assert.equal(g([{ conversationType: "group", unreadCount: 9 }, { conversationType: "group", unread: true }, { conversationType: "group", unreadCount: 4, isMuted: true }, { conversationType: "group", unread: true, isArchived: true }, { conversationType: "private", unreadCount: 3 }], NOW), 2))
console.log(`RUN498 unread attention: ${n}/${n} passed`)
