"use client"

/**
 * Unified Notification Center
 * Buckets: All · Social · Messages · GHC · Rewards · Requests · System — deep-links never dump to Settings by default
 * Taps deep-link to the right surface — never dumps users into Settings by default.
 */

import { communityNotificationLabel, isCommunityNotification } from "@/lib/domains/adapters/community-notification"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useGHC } from "@/contexts/ghc-context"
import { IdentityService } from "@/lib/identity/identity-service"
import { useSectionRefresh } from "@/hooks/use-section-refresh"
import { onCloseTransientUI, dispatchCloseTransientUI } from "@/lib/transient-ui"
import { useDialogA11y } from "@/hooks/use-dialog-a11y"
import {
  Bell,
  X,
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  Coins,
  Shield,
  Gift,
  Share2,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Store,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react"
import {
  notificationSystem,
  type Notification,
  type NotificationType,
  NOTIFICATIONS_CHANGED_EVENT,
} from "@/lib/notifications"
import {
  NOTIFICATION_CENTER_BUCKETS,
  filterByBucket,
  resolveNotificationDeepLink,
  navigateNotificationDeepLink,
  type NotificationCenterBucket,
} from "@/lib/notification-center"
import { isSafeInternalNotificationPath } from "@/lib/notification-targets"
import { useRegionalContext } from "@/contexts/regional-context"
import { getSocialMessage as socialText } from "@/lib/i18n/social"
import { useLiveNow } from "@/hooks/use-live-now"
import {
  groupNotificationsIntoThreads,
  notificationChannelKey,
  type NotificationThread,
} from "@/lib/notification-channels"
import { buildAttentionSignals, resolvePrimaryAttention, type AttentionSignal } from "@/lib/unified-attention"
import { AttentionCommandCard } from "@/components/ghc/attention-command-card"
import { FilterSummary } from "@/components/ghc/filtering/filter-summary"
import { onTablistKeyDown } from "@/lib/ui/tablist-keys"
import { DATE_BUCKET_LABEL, dateBucketOf } from "@/lib/ui/date-buckets"
import { plural } from "@/lib/ui/plural"

import { isPriorityNotification, sortNotificationsByPriority, assessNotificationPriority } from "@/lib/notification-priority"
import { resolveNotificationActions } from "@/lib/notification-actions"

/** Notification threads mounted per page in the bell list. */
const THREAD_PAGE_SIZE = 30

const ICON: Partial<Record<NotificationType, React.ReactNode>> = {
  like: <Heart size={15} className="text-rose-500" />,
  comment: <MessageCircle size={15} className="text-sky-600" />,
  message: <MessageCircle size={15} className="text-violet-600" />,
  match: <Heart size={15} className="text-pink-500" />,
  friend_request: <UserPlus size={15} className="text-emerald-600" />,
  follow: <Users size={15} className="text-indigo-600" />,
  system: <Shield size={15} className="text-muted-foreground" />,
  story_reply: <MessageCircle size={15} className="text-fuchsia-600" />,
  share: <Share2 size={15} className="text-emerald-600" />,
  group: <Users size={15} className="text-teal-600" />,
  ghc_received: <Coins size={15} className="text-emerald-600" />,
  ghc_sent: <Coins size={15} className="text-emerald-700" />,
  reward: <Gift size={15} className="text-amber-600" />,
  payment: <Coins size={15} className="text-teal-600" />,
  post_like: <Heart size={15} className="text-rose-500" />,
  post_comment: <MessageCircle size={15} className="text-sky-600" />,
  comment_reply: <MessageCircle size={15} className="text-sky-700" />,
  upvote: <ArrowUp size={15} className="text-emerald-600" />,
  downvote: <ArrowDown size={15} className="text-orange-600" />,
  curation: <ArrowUp size={15} className="text-emerald-700" />,
  marketplace_listing: <Store size={15} className="text-amber-700" />,
  marketplace_order: <Store size={15} className="text-amber-600" />,
  marketplace_comment: <MessageCircle size={15} className="text-amber-600" />,
  marketplace_reaction: <Heart size={15} className="text-amber-600" />,
  mention: <MessageCircle size={15} className="text-sky-600" />,
}


const EMPTY_COPY: Record<NotificationCenterBucket, { title: string; body: string }> = {
  all: {
    title: "You're all caught up",
    body: "Likes, messages, GHC, rewards, and system updates appear here.",
  },
  social: {
    title: "No social activity yet",
    body: "Likes, comments, follows, and matches show up in this tab.",
  },
  messages: {
    title: "No message alerts",
    body: "New chats and group mentions will land here.",
  },
  ghc: {
    title: "No GHC activity",
    body: "Transfers, payments, and wallet events appear here.",
  },
  rewards: {
    title: "No reward alerts",
    body: "Daily claims, streaks, missions, and XP updates appear here.",
  },
  requests: {
    title: "No pending requests",
    body: "Friend and connection requests will show here.",
  },
  community: {
    title: "No community alerts",
    body: "Invites, join requests, and community announcements appear here.",
  },
  marketplace: {
    title: "No marketplace alerts",
    body: "Listing updates, orders, and product reactions will show here.",
  },
  system: {
    title: "No system notices",
    body: "Security and account notices appear here when needed.",
  },
}

export function NotificationBell({
  onOpenTarget,
}: {
  onOpenTarget?: (n: Notification) => void
}) {
  const regional = useRegionalContext()
  const t = (key: Parameters<typeof socialText>[0], values?: Record<string, string | number>) => socialText(key, regional.preferredLocale, values)
  const liveNow = useLiveNow(30_000)
  const [open, setOpen] = useState(false)
  const [identityUserId, setIdentityUserId] = useState(() => IdentityService.getCurrentUserId())
  const [items, setItems] = useState<Notification[]>([])
  const itemsRef = useRef<Notification[]>([])
  useEffect(() => {
    itemsRef.current = items
  }, [items])
  const [unread, setUnread] = useState<number>(0)
  const [markingAll, setMarkingAll] = useState(false)
  const markAllInFlightRef = useRef(false)
  const [bucket, setBucket] = useState<NotificationCenterBucket>("all")
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "priority">(() => {
    if (typeof window === "undefined") return "priority"
    try {
      const saved = window.sessionStorage.getItem(`ghc.notif.focus:${encodeURIComponent(identityUserId)}`)
      if (saved === "priority" || saved === "unread" || saved === "all") return saved
    } catch { /* */ }
    return "priority"
  })
  const [isOffline, setIsOffline] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [failedActionId, setFailedActionId] = useState<string | null>(null)
  const [durableOk, setDurableOk] = useState<boolean | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [threadKey, setThreadKey] = useState<string | null>(null)
  const refreshInFlightRef = useRef(false)
  const refreshQueuedRef = useRef(false)
  const refreshGenerationRef = useRef(0)
  const activeRefreshControllerRef = useRef<AbortController | null>(null)
  const dialogRef = useDialogA11y<HTMLDivElement>(open, () => {
    setOpen(false)
    try { dispatchCloseTransientUI({ reason: "notification-escape" }) } catch { /* */ }
  })
  const ghc = useGHC() as { blockedUsers?: string[]; mutedUsers?: string[] }
  const blockedKey = Array.isArray(ghc.blockedUsers) ? ghc.blockedUsers.join("|") : ""
  const mutedKey = Array.isArray(ghc.mutedUsers) ? ghc.mutedUsers.join("|") : ""
  const blockedUsers = useMemo(
    () => (blockedKey ? blockedKey.split("|").filter(Boolean) : []),
    [blockedKey]
  )
  const mutedUsers = useMemo(
    () => (mutedKey ? mutedKey.split("|").filter(Boolean) : []),
    [mutedKey]
  )

  const refresh = useCallback(() => {
    // Durable rows known before this refresh; also consulted by the async store
    // merge below, so it must live outside the synchronous try block.
    const priorDurableItems = itemsRef.current.filter((item) => {
      const data = item.data as { durable?: boolean; durableEconomy?: boolean; durableAnnouncement?: boolean } | undefined
      return Boolean(data?.durable || data?.durableEconomy || data?.durableAnnouncement)
    })
    try {
      const visible =
        typeof notificationSystem.getVisibleNotifications === "function"
          ? notificationSystem.getVisibleNotifications(blockedUsers, mutedUsers)
          : notificationSystem.getNotifications()
      const all = (visible || []).slice().reverse()
      const seen = new Set<string>()
      const unique = all.filter((n) => {
        const k = n.id || `${n.type}-${n.title}-${n.timestamp}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      const initialRows = new Map<string, Notification>()
      for (const item of [...priorDurableItems, ...unique]) {
        if (item.id && !initialRows.has(item.id)) initialRows.set(item.id, item)
      }
      const initialItems = Array.from(initialRows.values())
      setItems(initialItems)
      setUnread(initialItems.filter((n) => !n.read).length)
    } catch {
      setItems([])
      setUnread(0)
    }
    // Merge both durable notification stores (social activity + GHC economy).
    // The old implementation replaced the unread count with the social count,
    // hiding local rewards and durable GHC events from the bell.
    if (refreshInFlightRef.current) {
      refreshQueuedRef.current = true
      return
    }
    refreshInFlightRef.current = true
    const requestIdentity = identityUserId
    const generation = ++refreshGenerationRef.current
    const controller = new AbortController()
    activeRefreshControllerRef.current = controller
    void (async () => {
      setListLoading(true)
      try {
        const [unifiedRes, economyRes, socialRes, announcementsRes] = await Promise.all([
          fetch("/api/notifications?limit=80", {
            credentials: "include", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal,
          }).catch(() => null),
          fetch("/api/economy/notifications?limit=60", {
            credentials: "include", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal,
          }).catch(() => null),
          fetch("/api/social/notifications?limit=80", {
            credentials: "include", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal,
          }).catch(() => null),
          fetch("/api/system/announcements?limit=25", {
            credentials: "include", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal,
          }).catch(() => null),
        ])
        const [unifiedData, economyData, socialData, announcementsData] = await Promise.all([
          unifiedRes?.json().catch(() => ({})) || {},
          economyRes?.json().catch(() => ({})) || {},
          socialRes?.json().catch(() => ({})) || {},
          announcementsRes?.json().catch(() => ({})) || {},
        ]) as [
          { ok?: boolean; durable?: boolean; notifications?: Array<{ id?: string; type?: string; title?: string; body?: string; createdAt?: string; readAt?: string | null; actorUserId?: string; sourceId?: string; sourceType?: string; metadata?: Record<string, unknown>; correlationId?: string | null; requestId?: string | null }> },
          { ok?: boolean; items?: Array<{ id?: string; eventType?: string; title?: string; body?: string; createdAt?: number; readAt?: number | string | null; referenceId?: string; requestId?: string; metadata?: Record<string, unknown> }> },
          { ok?: boolean; durable?: boolean; notifications?: Array<{ id?: string; type?: string; title?: string; body?: string; createdAt?: string | number; readAt?: string | null; actorUserId?: string; sourceId?: string; sourceType?: string; metadata?: Record<string, unknown>; correlationId?: string | null; entityType?: string; entityId?: string; requestId?: string }> },
          { ok?: boolean; announcements?: Array<{ id?: string; title?: string; body?: string; severity?: string; actionPath?: string | null; publishedAt?: number; read?: boolean }>; unreadCount?: number },
        ]

        // A response belongs only to the identity that initiated it. Account switches
        // abort the request and invalidate this generation before any state is written.
        if (generation !== refreshGenerationRef.current || requestIdentity !== IdentityService.getCurrentUserId()) return

        const unifiedRows = unifiedRes?.ok && unifiedData.ok && Array.isArray(unifiedData.notifications)
          ? unifiedData.notifications : []
        const socialRows = socialRes?.ok && socialData.ok && Array.isArray(socialData.notifications)
          ? socialData.notifications : []
        const economyRows = economyRes?.ok && economyData.ok && Array.isArray(economyData.items)
          ? economyData.items : []
        // Declared before first use: reading these ahead of declaration is a TDZ crash.
        const unifiedAvailable = Boolean(unifiedRes?.ok && unifiedData.ok && Array.isArray(unifiedData.notifications))
        const socialAvailable = Boolean(socialRes?.ok && socialData.ok && Array.isArray(socialData.notifications))
        const economyAvailable = Boolean(economyRes?.ok && economyData.ok && Array.isArray(economyData.items))
        const announcementsAvailable = Boolean(announcementsRes?.ok && announcementsData.ok && Array.isArray(announcementsData.announcements))
        setDurableOk(unifiedAvailable || (socialAvailable && economyAvailable))

        const mappedUnified: Notification[] = unifiedRows.map((n) => {
          const eventType = String(n.type || "system")
          const meta = (n.metadata || {}) as Record<string, unknown>
          const postId = typeof meta.postId === "string" ? meta.postId : undefined
          const commentId = typeof meta.commentId === "string" ? meta.commentId : undefined
          const conversationId = typeof meta.conversationId === "string" ? meta.conversationId : undefined
          const open = typeof meta.open === "string" ? meta.open : undefined
          const type: NotificationType =
            /message|chat/i.test(eventType) || open === "messages" ? "message" :
            /marketplace.*comment|listing.*response/i.test(eventType) ? "marketplace_comment" :
            /marketplace.*listing|listing.*published|listing_created/i.test(eventType) ? "marketplace_listing" :
            /marketplace.*order|order.*marketplace|marketplace.*payment|payment.*marketplace|order_updated|order_paid|order_response|fulfil|purchase/i.test(eventType) ? "marketplace_order" :
            /ghc_sent|transfer_out/i.test(eventType) ? "ghc_sent" :
            /ghc_received|transfer_in/i.test(eventType) ? "ghc_received" :
            /payment|^pi_/i.test(eventType) ? "payment" :
            /reward|claim|streak/i.test(eventType) ? "reward" :
            /follow|connection|friend/i.test(eventType) ? "friend_request" :
            /like|curation|upvote|downvote/i.test(eventType) ? "like" :
            /comment|reply|mention/i.test(eventType) ? "comment" : "system"
          return {
            id: String(n.id || ""), type,
            title: String(n.title || "Activity"), message: String(n.body || ""),
            icon: type === "message" ? "✉️" : type === "like" ? "❤️" : type === "comment" ? "💬" : type === "reward" ? "🎁" : "🔔",
            timestamp: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
            read: Boolean(n.readAt),
            data: {
              ...meta, durable: true, sourceStore: "unified", source: n.sourceType,
              actorUserId: n.actorUserId, sourceId: n.sourceId, sourceType: n.sourceType,
              entityType: meta.entityType || n.sourceType, entityId: meta.entityId || n.sourceId,
              postId, commentId, conversationId,
              transactionId: meta.transactionId || meta.txId,
              paymentIntentId: meta.paymentIntentId || meta.intentId || meta.paymentId,
              requestId: (typeof meta.requestId === 'string' ? meta.requestId : n.requestId),
              referenceId: meta.referenceId || (n.sourceType === "economy" ? n.sourceId : undefined),
              fromUserId: n.actorUserId, userId: meta.userId || n.actorUserId,
              open: open || (type === "message" ? "messages" : undefined),
              eventType, socialType: eventType, correlationId: n.correlationId,
            },
          }
        })

        const mappedSocial: Notification[] = socialRows.map((n) => {
          const socialType = String(n.type || "")
          const type = (
            socialType === "follow" ? "follow"
            : socialType === "friend_request" || socialType === "connection_request" || socialType === "connection" || socialType === "connection_accept" ? "friend_request"
            : socialType === "post_created" ? "system"
            : socialType === "post_like" || socialType === "like" || socialType === "upvote" || socialType === "post_upvote" || socialType === "downvote" || socialType === "post_downvote" || socialType === "curation" || socialType === "post_curation" ? "like"
            : socialType === "post_comment" || socialType === "comment_reply" || socialType === "reply" || socialType === "comment" || socialType === "mention" ? "comment"
            : socialType === "share" ? "share"
            : socialType === "match" ? "match"
            : socialType === "message" || socialType === "new_message" || socialType === "dm" || socialType === "chat" ? "message"
            : "system"
          ) as NotificationType
          const meta = (n.metadata || {}) as Record<string, unknown>
          const row = n as {
            entityType?: string
            entityId?: string
            sourceType?: string
            sourceId?: string
            requestId?: string
            actorUserId?: string
          }
          const entityType = String(row.entityType || row.sourceType || meta.entityType || "")
          const entityId = String(row.entityId || row.sourceId || meta.entityId || meta.sourceId || "")
          const postId =
            (typeof meta.postId === "string" && meta.postId) ||
            (entityType === "post" && entityId ? entityId : undefined) ||
            (socialType === "post_created" && entityId ? entityId : undefined) ||
            undefined
          const conversationId =
            (typeof meta.conversationId === "string" && meta.conversationId) ||
            (entityType === "conversation" || entityType === "message"
              ? (entityId || undefined)
              : undefined) ||
            (typeof meta.threadId === "string" ? meta.threadId : undefined)
          return {
            id: String(n.id || ""),
            type,
            title: String(n.title || "Activity"),
            message: String(n.body || ""),
            icon:
              type === "message" ? "✉️"
              : socialType.includes("like") ? "❤️"
              : socialType.includes("upvote") || socialType.includes("downvote") ? "▲"
              : socialType.includes("comment") ? "💬"
              : socialType.includes("connection") || socialType.includes("friend") ? "🤝"
              : "🔔",
            timestamp: typeof n.createdAt === "number"
              ? (Number.isFinite(n.createdAt) ? n.createdAt : Date.now())
              : (Number.isFinite(new Date(n.createdAt || "").getTime()) ? new Date(n.createdAt || "").getTime() : Date.now()),
            read: Boolean(n.readAt),
            data: {
              ...meta,
              durable: true,
              sourceStore: "social",
              actorUserId: row.actorUserId || n.actorUserId,
              entityId: entityId || undefined,
              entityType: entityType || undefined,
              postId,
              conversationId,
              fromUserId: n.actorUserId,
              userId: meta.userId || n.actorUserId,
              open: type === "message" ? "messages"
                : socialType === "connection_accept" ? "matches"
                : socialType === "connection" || socialType === "connection_request" || socialType === "friend_request" ? "matches"
                : socialType.includes("curation") || socialType.includes("like") || socialType.includes("comment") || socialType === "post_created" || socialType === "share"
                  ? "feed"
                : socialType.includes("marketplace") ? "marketplace"
                : meta.open || "feed",
              section: socialType === "connection" || socialType === "connection_request" || socialType === "friend_request"
                ? "connection_requests"
                : socialType === "connection_accept"
                  ? "matches"
                  : meta.section,
              socialType,
            },
          }
        })

        const mappedEconomy: Notification[] = economyRows.map((n) => {
          const eventType = String(n.eventType || "")
          const type: NotificationType = eventType === "GHC_RECEIVED" ? "ghc_received"
            : eventType === "GHC_SENT" ? "ghc_sent"
            : eventType.includes("REQUEST") ? "group"
            : eventType.includes("REWARD") ? "reward"
            : eventType.includes("MEMBERSHIP") || eventType.includes("PREMIUM") ? "system"
            : "system"
          return {
            id: String(n.id || ""), type,
            title: String(n.title || "GreenHaven update"), message: String(n.body || ""),
            icon: eventType.includes("REWARD") ? "🎁" : eventType.startsWith("GHC_") ? "🪙" : "🔔",
            timestamp: Number(n.createdAt) || Date.now(),
            read: Boolean(n.readAt),
            data: {
              durableEconomy: true,
              sourceStore: "economy",
              eventType,
              referenceId: n.referenceId,
              transactionId: (n.metadata?.transactionId as string | undefined) || n.referenceId,
              paymentIntentId: n.metadata?.paymentIntentId as string | undefined,
              rewardId: n.metadata?.rewardId as string | undefined,
              claimId: n.metadata?.claimId as string | undefined,
              requestId: n.requestId,
              ...(n.metadata || {}),
            },
          }
        })

        const suppress = new Set([...blockedUsers, ...mutedUsers].map(String))
        // gh_notification_inbox is the canonical projection of social + economy rows.
        // Fetch legacy feeds only as recovery lanes; merging all three duplicates every
        // social/economy event because database projection triggers already mirror them.
        const unifiedIds = new Set(mappedUnified.map((item) => item.id))
        const durableSocialVisible = mappedSocial.filter((n) => {
          const actor = String((n.data as { actorUserId?: string } | undefined)?.actorUserId || "")
          const projectedId = `social_${n.id}`
          return (!unifiedAvailable || !unifiedIds.has(projectedId)) && (!actor || !suppress.has(actor))
        })
        const mappedAnnouncements: Notification[] = announcementsRes?.ok && announcementsData.ok && Array.isArray(announcementsData.announcements)
          ? announcementsData.announcements.map((n) => ({
              id: `announcement:${String(n.id || "")}`,
              type: "system" as NotificationType,
              title: String(n.title || "GreenHaven update"),
              message: String(n.body || ""),
              icon: n.severity === "critical" || n.severity === "warning" ? "⚠️" : "📢",
              timestamp: Number(n.publishedAt) || Date.now(),
              read: Boolean(n.read),
              data: { durableAnnouncement: true, announcementId: String(n.id || ""), actionPath: n.actionPath || undefined },
            })).filter((n) => Boolean((n.data as { announcementId?: string }).announcementId))
          : []
        const durableEconomyVisible = mappedEconomy.filter((n) => !unifiedAvailable || !unifiedIds.has(`economy_${n.id}`))
        const staleStoreRows = priorDurableItems.filter((item) => {
          const data = item.data as { sourceStore?: string; sourceType?: string; durable?: boolean; durableEconomy?: boolean; durableAnnouncement?: boolean } | undefined
          if (data?.durableAnnouncement) return !announcementsAvailable
          if (data?.sourceStore === "social") return !unifiedAvailable && !socialAvailable
          if (data?.sourceStore === "economy" || data?.durableEconomy) return !unifiedAvailable && !economyAvailable
          if (data?.sourceStore === "unified" || data?.durable) {
            if (data.sourceType === "social") return !unifiedAvailable && !socialAvailable
            if (data.sourceType === "economy") return !unifiedAvailable && !economyAvailable
            return !unifiedAvailable && !socialAvailable && !economyAvailable
          }
          return false
        })
        setItems((prev) => {
          const localOnly = prev.filter((x) => {
            const d = x.data as { durable?: boolean; durableEconomy?: boolean; durableAnnouncement?: boolean } | undefined
            return !d?.durable && !d?.durableEconomy && !d?.durableAnnouncement
          })
          const byId = new Map<string, Notification>()
          for (const x of [...mappedUnified, ...durableSocialVisible, ...durableEconomyVisible, ...mappedAnnouncements, ...staleStoreRows, ...localOnly]) {
            if (x.id && !byId.has(x.id)) byId.set(x.id, x)
          }
          return Array.from(byId.values())
            .filter((x) => {
              try {
                return !notificationSystem.isDeleted?.(x.id)
              } catch {
                return true
              }
            })
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        })

        // The count-only endpoints overlap the unified/social inboxes and can lag
        // behind a just-completed mark-read operation. Count the same deduplicated
        // rows the user can actually see instead of summing independent counters.
        const durableById = new Map<string, Notification>()
        for (const item of [...mappedUnified, ...durableSocialVisible, ...durableEconomyVisible, ...mappedAnnouncements, ...staleStoreRows]) {
          if (!item.id || durableById.has(item.id)) continue
          let deleted = false
          try { deleted = Boolean(notificationSystem.isDeleted?.(item.id)) } catch { /* */ }
          if (!deleted) durableById.set(item.id, item)
        }
        const durableUnread = Array.from(durableById.values()).filter((item) => !item.read).length
        const durableIds = new Set(durableById.keys())
        const localUnreadOnly = notificationSystem.getVisibleNotifications(blockedUsers, mutedUsers)
          .filter((item) => !item.read && !durableIds.has(item.id)).length
        setUnread(durableUnread + localUnreadOnly)
      } catch {
        setDurableOk(false)
        /* Local-only notifications remain visible if a server store is unavailable. */
      } finally {
        // A superseded request must not unlock or clear the loading state of a
        // newer account's refresh.
        if (generation === refreshGenerationRef.current) {
          refreshInFlightRef.current = false
          activeRefreshControllerRef.current = null
          setListLoading(false)
          if (refreshQueuedRef.current) {
            refreshQueuedRef.current = false
            window.setTimeout(() => refresh(), 0)
          }
        }
      }
    })()
  }, [blockedUsers, mutedUsers, identityUserId])

  useEffect(() => {
    return IdentityService.subscribe((identity) => {
      setIdentityUserId(identity.userId)
    })
  }, [])

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(`ghc.notif.focus:${encodeURIComponent(identityUserId)}`)
      setReadFilter(saved === "all" || saved === "unread" || saved === "priority" ? saved : "priority")
    } catch { setReadFilter("priority") }
  }, [identityUserId])

  useEffect(() => {
    refreshGenerationRef.current += 1
    activeRefreshControllerRef.current?.abort()
    activeRefreshControllerRef.current = null
    refreshInFlightRef.current = false
    refreshQueuedRef.current = false
    itemsRef.current = []
    setItems([])
    setUnread(0)
    setDurableOk(null)
    setListLoading(false)
    setFailedActionId(null)
    setStatusMsg(null)
    setExpandedId(null)
    setThreadKey(null)
    return () => {
      refreshGenerationRef.current += 1
      activeRefreshControllerRef.current?.abort()
      activeRefreshControllerRef.current = null
    }
  }, [identityUserId])

  // One refresh policy for the notification surface: focus, foreground, online and
  // product mutation events are coalesced by the shared section coordinator.
  useSectionRefresh("notifications", refresh, {
    minIntervalMs: open ? 4_000 : 12_000,
    events: [
      NOTIFICATIONS_CHANGED_EVENT,
      "ghc:daily-reward-claimed",
      "ghc:post-engagement",
      "ghc:new-message",
      "ghc:connection-updated",
      "ghc:notifications-read",
      "ghc:community-updated",
      "ghc:marketplace-updated",
      "ghc:wallet-updated",
      "ghc:payment-updated",
      "ghc:notification",
    ],
  })

  // Keep an unobtrusive foreground poll as a recovery lane for missed push/events.
  useEffect(() => {
    refresh()
    const interval = open ? 20_000 : 60_000
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh()
    }, interval)
    return () => window.clearInterval(id)
  }, [open, refresh])

  useEffect(() => {
    return onCloseTransientUI(() => setOpen(false))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const sync = () => setIsOffline(!navigator.onLine)
    sync()
    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)
    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
    }
  }, [])

  const attentionSignals = useMemo(() => buildAttentionSignals(items), [items])
  const primaryAttention = useMemo(() => resolvePrimaryAttention(attentionSignals), [attentionSignals])
  const openAttention = useCallback((signal: AttentionSignal) => {
    setOpen(false)
    if (signal.open === "wallet") window.dispatchEvent(new CustomEvent("ghc:open-wallet"))
    else if (signal.open === "rewards") window.dispatchEvent(new CustomEvent("ghc:open-rewards"))
    else if (signal.open === "messages") window.dispatchEvent(new CustomEvent("ghc:open-messages"))
    else if (signal.open === "communities") window.dispatchEvent(new CustomEvent("ghc:open-communities"))
    else if (signal.open === "marketplace") window.dispatchEvent(new CustomEvent("ghc:open-marketplace"))
    else if (signal.open === "matches") window.dispatchEvent(new CustomEvent("ghc:open-matches"))
    else window.dispatchEvent(new CustomEvent("ghc:open-settings"))
  }, [])

  const filtered = useMemo(() => {
    const bucketed = filterByBucket(items, bucket)
    if (readFilter === "unread") return bucketed.filter((n) => !n.read)
    if (readFilter === "priority") {
      // Phase 4: priority = high-signal unread (money, messages, social requests, orders).
      return sortNotificationsByPriority(bucketed.filter(isPriorityNotification))
    }
    return bucketed
  }, [items, bucket, readFilter])
  const bucketUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const b of NOTIFICATION_CENTER_BUCKETS) {
      counts[b.id] = filterByBucket(items, b.id as NotificationCenterBucket).filter((n) => !n.read).length
    }
    return counts
  }, [items])
  const threads = useMemo(() => groupNotificationsIntoThreads(filtered), [filtered])
  // Render the list progressively so a long history does not mount hundreds of rows at once.
  const [visibleThreadCount, setVisibleThreadCount] = useState(THREAD_PAGE_SIZE)
  useEffect(() => {
    setVisibleThreadCount(THREAD_PAGE_SIZE)
  }, [bucket, readFilter])
  const visibleThreads = useMemo(() => threads.slice(0, visibleThreadCount), [threads, visibleThreadCount])
  const hiddenThreadCount = Math.max(0, threads.length - visibleThreads.length)
  const expanded = useMemo(
    () => (expandedId ? filtered.find((x) => x.id === expandedId) || null : null),
    [expandedId, filtered],
  )
  const activeThread = useMemo(() => {
    if (!threadKey) return null
    return threads.find((th) => th.channelKey === threadKey) || null
  }, [threadKey, threads])

  const openPanel = () => {
    setOpen(true)
    refresh()
    try {
      window.dispatchEvent(new CustomEvent("ghc:message-typing", { detail: { active: true } }))
    } catch { /* hide bottom chrome while panel open */ }
  }

  const closePanel = () => {
    setOpen(false)
    setExpandedId(null)
    setThreadKey(null)
    try {
      window.dispatchEvent(new CustomEvent("ghc:message-typing", { detail: { active: false } }))
    } catch { /* */ }
    dispatchCloseTransientUI({ reason: "notification-close" })
  }

  const markOneRead = (n: Notification) => {
    setFailedActionId(null)
    try {
      notificationSystem.markAsRead?.(n.id)
    } catch {
      /* */
    }
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    setUnread((u) => Math.max(0, u - (n.read ? 0 : 1)))
    const notificationData = (n.data || {}) as {
      durable?: boolean
      durableEconomy?: boolean
      durableAnnouncement?: boolean
      announcementId?: string
      sourceStore?: "unified" | "social" | "economy"
      sourceType?: string
    }
    if (notificationData.durableAnnouncement && notificationData.announcementId) {
      void fetch("/api/system/announcements", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationData.announcementId }),
      }).then((response) => {
        if (!response?.ok) throw new Error("READ_STATE_FAILED")
        window.dispatchEvent(new CustomEvent("ghc:notifications-read"))
      }).catch(() => {
        setItems((prev) => prev.map((item) => item.id === n.id ? { ...item, read: false } : item))
        if (!n.read) setUnread((count) => count + 1)
        setFailedActionId(n.id)
        setStatusMsg(t("readStateSaveFailed"))
      })
      return
    }

    const sourceStore = notificationData.sourceStore
    const sourceType = String(notificationData.sourceType || "")
    const unifiedId = n.id
    const socialId = sourceStore === "unified" && unifiedId.startsWith("social_") ? unifiedId.slice(7) : unifiedId
    const economyId = sourceStore === "unified" && unifiedId.startsWith("economy_") ? unifiedId.slice(8) : unifiedId
    const requests: Promise<Response | null>[] = []
    if (sourceStore === "unified") {
      requests.push(fetch("/api/notifications", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", ids: [unifiedId] }),
      }).catch(() => null))
      // Keep the legacy source read marker coherent as a fallback, but the unified
      // projection remains the canonical state for the visible notification center.
      if (sourceType === "social") requests.push(fetch("/api/social/notifications", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", ids: [socialId] }),
      }).catch(() => null))
      if (sourceType === "economy") requests.push(fetch(`/api/economy/notifications/${encodeURIComponent(economyId)}/read`, {
        method: "POST", credentials: "include", headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      }).catch(() => null))
    } else if (sourceStore === "social") {
      requests.push(fetch("/api/social/notifications", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", ids: [n.id] }),
      }).catch(() => null))
    } else if (sourceStore === "economy") {
      requests.push(fetch(`/api/economy/notifications/${encodeURIComponent(n.id)}/read`, {
        method: "POST", credentials: "include", headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      }).catch(() => null))
    }
    if (requests.length) {
      void Promise.all(requests).then((responses) => {
        const canonicalFailed = !responses[0]?.ok
        if (canonicalFailed) {
          setItems((prev) => prev.map((item) => item.id === n.id ? { ...item, read: false } : item))
          if (!n.read) setUnread((count) => count + 1)
          setFailedActionId(n.id)
          setStatusMsg(t("readStateSaveFailed"))
        } else if (responses.slice(1).some((response) => !response?.ok)) {
          setStatusMsg(t("readStateSavedLegacy"))
        }
        window.dispatchEvent(new CustomEvent("ghc:notifications-read"))
      })
    }

  }

  /** Secondary details action; the primary notification tap opens its exact target. */
  const onTap = (n: Notification) => {
    markOneRead(n)
    setExpandedId(n.id)
    setThreadKey(notificationChannelKey(n))
  }

  const openTarget = (n: Notification) => {
    markOneRead(n)
    const notificationData = (n.data || {}) as { actionPath?: string; durableAnnouncement?: boolean }
    const link = resolveNotificationDeepLink(n)
    if (notificationData.durableAnnouncement && isSafeInternalNotificationPath(notificationData.actionPath)) {
      window.location.assign(notificationData.actionPath)
    } else {
      navigateNotificationDeepLink(link)
    }
    onOpenTarget?.(n)
    closePanel()
    window.setTimeout(() => refresh(), 400)
  }

  const onDelete = (n: Notification) => {
    try {
      notificationSystem.deleteNotification?.(n.id)
    } catch {
      /* */
    }
    // Dismiss is device-local: preserve the server-side read state and use the
    // account-scoped deleted marker to keep this item hidden on this device.
    setItems((prev) => prev.filter((x) => x.id !== n.id))
    setUnread((u) => Math.max(0, u - (n.read ? 0 : 1)))
    if (expandedId === n.id) {
      setExpandedId(null)
      setThreadKey(null)
    }
    setStatusMsg(t("hiddenOnDevice"))
    window.setTimeout(() => setStatusMsg(null), 2000)
    window.setTimeout(() => refresh(), 300)
  }

  const markAll = async () => {
    // Single-flight: a second tap while the four stores are being written must not fire duplicate writes.
    if (markAllInFlightRef.current) return
    markAllInFlightRef.current = true
    setMarkingAll(true)
    try {
    try { notificationSystem.markAllAsRead?.() } catch { /* */ }
    setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    setUnread(0)
    const legacyEconomyIds: string[] = Array.from(new Set<string>(items.flatMap((item): string[] => {
      const data = (item.data || {}) as { sourceStore?: string; sourceType?: string }
      if (data.sourceStore !== "economy" && !(data.sourceStore === "unified" && data.sourceType === "economy")) return []
      return [String(item.id).replace(/^economy_/, "")]
    })))
    const results = await Promise.all([
      fetch("/api/social/notifications", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      }).catch(() => null),
      fetch("/api/notifications", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      }).catch(() => null),
      ...legacyEconomyIds.map((id) => fetch(`/api/economy/notifications/${encodeURIComponent(id)}/read`, {
        method: "POST", credentials: "include", headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      }).catch(() => null)),
      fetch("/api/system/announcements", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      }).catch(() => null),
    ])
    const failed = results.some((response) => !response || !response.ok)
    if (!failed) {
      // Only a confirmed server write clears the app-level attention badge. After a failure the
      // badge must keep counting, so signal a change (re-poll) instead of "read".
      window.dispatchEvent(new CustomEvent("ghc:notifications-read"))
    } else {
      window.dispatchEvent(new CustomEvent("ghc:notifications-changed", { detail: { reason: "mark-all-failed" } }))
    }
    setStatusMsg(failed ? t("markAllReadFailed") : t("markedAllRead"))
    if (!failed) {
      window.dispatchEvent(new CustomEvent("ghc:toast", { detail: { message: t("allNotificationsMarkedRead"), type: "success" } }))
    } else {
      window.dispatchEvent(new CustomEvent("ghc:toast", { detail: { message: t("markAllReadFailed"), type: "error" } }))
    }
    window.setTimeout(() => setStatusMsg(null), 2500)
    // Reconcile optimistic local state with the durable stores (queues behind an active poll).
    refresh()
    } finally {
      markAllInFlightRef.current = false
      setMarkingAll(false)
    }
  }


  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPanel}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-foreground transition hover:border-amber-400/30 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={unread > 0 ? `${unread} ${t("unread").toLowerCase()} ${t("notifications").toLowerCase()}` : t("notifications")}
        title={t("notifications")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={20} strokeWidth={2.1} className="text-amber-500 dark:text-amber-300" />
        {unread > 0 ? (
          <span aria-hidden="true" className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-background">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
        <div ref={dialogRef} tabIndex={-1} className="gh-world-notifications fixed inset-0 z-[200] isolate" data-gh-module="notifications" role="dialog" aria-modal="true" aria-label={t("notifications")}>
          <button type="button" data-dialog-dismiss="true" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" aria-label={t("closeNotifications")} onClick={closePanel} />
          <div className="absolute inset-0 flex flex-col bg-background sm:inset-x-auto sm:left-1/2 sm:top-0 sm:h-full sm:w-full sm:max-w-[28rem] sm:-translate-x-1/2 sm:border-x sm:border-border sm:shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/95 px-4 py-3.5 backdrop-blur-xl">
              <div>
                <p className="text-[18px] font-extrabold tracking-tight text-foreground">{t("notifications")}</p>
                <p className="text-[11px] text-muted-foreground">
                  {unread > 0 ? `${unread} ${t("unread").toLowerCase()}` : t("allCaughtUp")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { setStatusMsg(t("refreshing")); refresh() }}
                  disabled={listLoading}
                  className="inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold text-muted-foreground hover:bg-muted disabled:opacity-50"
                  aria-label={t("refresh")}
                >
                  <RefreshCw size={14} className={listLoading ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">{t("refresh")}</span>
                </button>
                {unread > 0 ? (
                  <button
                    type="button"
                    onClick={markAll}
                    disabled={markingAll}
                    aria-busy={markingAll}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300"
                  >
                    <CheckCheck size={14} /> {t("markAllRead")}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={closePanel}
                  className="gh-hit-44 flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
                  aria-label={t("closeNotifications")}
                  data-dialog-initial-focus="true"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="sr-only" role="status" aria-live="polite">
              {statusMsg || (listLoading ? t("refreshing") : "")}
            </div>
            {isOffline ? (
              <div className="mx-3 mt-2 rounded-[1.25rem] border border-amber-200/80 bg-amber-50/90 px-3.5 py-2 text-[11px] leading-snug text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="status">
                {t("offlineNotifications")}
              </div>
            ) : null}
            {durableOk === false && !isOffline ? (
              <div className="mx-3 mt-2 rounded-[1.25rem] border border-border/60 bg-muted/40 px-3.5 py-2 text-[11px] leading-snug text-muted-foreground" role="status">
                {t("notificationUnavailable")}
              </div>
            ) : null}
            {/* Focus first: All · Unread · Priority (simple segment control) */}
            <div className="border-b border-border/50 px-3 py-2.5">
              <div
                className="flex rounded-2xl bg-muted/70 p-1"
                role="tablist"
                aria-label={t("notificationFocus")}
                onKeyDown={onTablistKeyDown}
              >
                {([
                  { id: "all" as const, label: t("all") },
                  {
                    id: "unread" as const,
                    label:
                      unread > 0 ? t("unreadWithCount", { count: unread > 99 ? "99+" : unread }) : t("unread"),
                  },
                  { id: "priority" as const, label: t("priority") },
                ]).map((mode) => {
                  const active = readFilter === mode.id
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => {
                        setReadFilter(mode.id)
                        try { window.sessionStorage.setItem(`ghc.notif.focus:${encodeURIComponent(identityUserId)}`, mode.id) } catch { /* */ }
                      }}
                      className={`min-h-9 flex-1 rounded-xl px-2 text-[12px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        active
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <FilterSummary
              className="mt-2"
              items={[
                ...(bucket !== "all" ? [{ id: "bucket", label: `Category: ${bucket}`, onRemove: () => setBucket("all") }] : []),
                ...(readFilter !== "priority" ? [{ id: "focus", label: `Focus: ${readFilter}`, onRemove: () => { setReadFilter("priority"); try { window.sessionStorage.setItem(`ghc.notif.focus:${encodeURIComponent(identityUserId)}`, "priority") } catch { /* */ } } }] : []),
              ]}
              onClearAll={() => { setBucket("all"); setReadFilter("priority"); try { window.sessionStorage.setItem(`ghc.notif.focus:${encodeURIComponent(identityUserId)}`, "priority") } catch { /* */ } }}
              ariaLabel="Active notification filters"
            />

            {/* Category chips with per-bucket unread counts */}
            <div
              className="flex gap-1.5 overflow-x-auto border-b border-border/50 px-3 py-2.5 scrollbar-hide"
              role="tablist"
              aria-label={t("notificationCategories")}
              onKeyDown={onTablistKeyDown}
            >
              {NOTIFICATION_CENTER_BUCKETS.map((b) => {
                const active = bucket === b.id
                const count = bucketUnreadCounts[b.id] || 0
                return (
                  <button
                    key={b.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setBucket(b.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      active
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                        : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{t(b.id)}</span>
                    {count > 0 ? (
                      <span
                        className={`min-w-[1.15rem] rounded-full px-1 text-center text-[10px] font-extrabold tabular-nums ${
                          active ? "bg-white/25 text-white" : "bg-emerald-600/15 text-emerald-800 dark:text-emerald-200"
                        }`}
                      >
                        <bdi className="gh-bidi-number">{count > 99 ? "99+" : regional.formatNumber(count)}</bdi>
                      </span>
                    ) : null}
                  </button>
                )
              })}
              <span className="ml-auto shrink-0 self-center pl-2 text-[10px] font-medium text-muted-foreground">
                {listLoading ? "Syncing…" : "Up to date"}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto [content-visibility:auto] overscroll-contain">
              <AttentionCommandCard signal={bucket === "all" && readFilter === "all" ? primaryAttention : null} onOpen={openAttention} />
              {filtered.length > 0 ? (
                <p className="px-4 pt-2 text-[11px] font-medium text-muted-foreground" aria-live="polite">
                  <bdi className="gh-bidi-number">{regional.formatNumber(filtered.length)}</bdi> {t("notifications").toLowerCase()}
                  {bucket !== "all" ? t("inThisCategory") : ""}
                  {listLoading ? ` · ${t("refreshing")}` : ""}
                </p>
              ) : null}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                    <Bell size={26} />
                  </span>
                  <p className="text-[15px] font-bold text-foreground">
                    {readFilter === "unread"
                      ? t("noUnread")
                      : readFilter === "priority"
                        ? t("noPriority")
                        : EMPTY_COPY[bucket]?.title || t("nothingHere")}
                  </p>
                  <p className="mt-1 max-w-[17rem] text-[12px] leading-relaxed text-muted-foreground">
                    {readFilter === "unread"
                      ? "You’re caught up in this category. Switch to All to review history."
                      : readFilter === "priority"
                        ? "Priority covers messages, orders, and money notices that still need attention."
                        : EMPTY_COPY[bucket]?.body}
                  </p>
                  {readFilter !== "all" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReadFilter("all")
                        try { window.sessionStorage.setItem(`ghc.notif.focus:${encodeURIComponent(identityUserId)}`, "all") } catch { /* */ }
                      }}
                      className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm"
                    >
                      {t("showAllNotifications")}
                    </button>
                  ) : bucket !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setBucket("all")}
                      className="mt-4 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-bold text-foreground"
                    >
                      {t("viewAllCategories")}
                    </button>
                  ) : null}
                </div>
              ) : expanded && activeThread ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[12px] font-semibold text-muted-foreground hover:bg-muted"
                        onClick={() => {
                          setExpandedId(null)
                          setThreadKey(null)
                        }}
                      >
                        <ChevronLeft size={16} /> Back
                      </button>
                      <p className="text-[12px] font-bold text-foreground">Conversation history</p>
                    </div>
                    <div className="border-b border-border/40 bg-muted/20 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                          {ICON[expanded.type] || <Bell size={16} className="text-muted-foreground" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold text-foreground">{expanded.title}</p>
                          <p className="mt-1 text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                            {expanded.message}
                          </p>
                          <p className="mt-2 text-[11px] text-muted-foreground">{regional.formatRelativeTime(expanded.timestamp, liveNow)}</p>
                          {(() => {
                            const priority = assessNotificationPriority(expanded)
                            return priority.band === "critical" || priority.band === "high" ? (
                              <p className="mt-2 inline-flex rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-800 dark:text-amber-200" aria-label={`Priority: ${priority.band}`}>
                                {priority.band === "critical" ? "Urgent" : "Needs attention"} · {priority.reason}
                              </p>
                            ) : null
                          })()}
                          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("notificationActions")}>
                            {resolveNotificationActions(expanded, { retryAvailable: failedActionId === expanded.id }).map((action) => (
                              <button
                                key={action.id}
                                type="button"
                                aria-label={action.description}
                                onClick={() => {
                                  if (action.id === "open") openTarget(expanded)
                                  else if (action.id === "mark_read") markOneRead(expanded)
                                  else if (action.id === "retry") markOneRead(expanded)
                                  else onDelete(expanded)
                                }}
                                className={action.emphasis === "primary"
                                  ? "rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white"
                                  : action.emphasis === "danger"
                                    ? "inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                                    : "rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted"}
                              >
                                {action.id === "dismiss" ? <Trash2 size={12} /> : null}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Earlier in this channel ({activeThread.history.length})
                    </p>
                    <ul className="divide-y divide-border" role="list">
                      {activeThread.history.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              markOneRead(n)
                              setExpandedId(n.id)
                            }}
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 ${
                              n.id === expanded.id ? "bg-emerald-50/50 dark:bg-emerald-950/30" : ""
                            } ${!n.read ? "font-semibold" : ""}`}
                          >
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                              {ICON[n.type] || <Bell size={13} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex justify-between gap-2">
                                <span className="text-[12px] font-bold text-foreground">{n.title}</span>
                                <span className="text-[10px] text-muted-foreground">{regional.formatRelativeTime(n.timestamp, liveNow)}</span>
                              </span>
                              <span className="mt-0.5 block text-[11px] text-muted-foreground line-clamp-2">
                                {n.message}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                <ul className="divide-y divide-border" role="list" aria-label={t("notificationList")}>
                  {visibleThreads.map((th, threadIndex) => {
                    const n = th.latest
                    // Date headers only when the list is chronological (Priority mode is ranked by signal).
                    const threadBucket = readFilter === "priority" ? null : dateBucketOf(n.timestamp, liveNow)
                    const previousThread = threadIndex > 0 ? visibleThreads[threadIndex - 1] : null
                    const previousBucket =
                      previousThread && readFilter !== "priority" ? dateBucketOf(previousThread.latest.timestamp, liveNow) : null
                    const showDateHeader = threadBucket !== null && threadBucket !== previousBucket
                    return (
                    <li key={th.channelKey}>
                      {showDateHeader && threadBucket ? (
                        <p className="sticky top-0 z-[1] border-b border-border/60 bg-card/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground backdrop-blur">
                          {DATE_BUCKET_LABEL[threadBucket]}
                        </p>
                      ) : null}
                      <div className="group flex w-full items-stretch gap-1 transition hover:bg-muted/45">
                      <button
                        type="button"
                        onClick={() => openTarget(n)}
                        aria-label={`Open ${n.title}`}
                        className={`flex min-w-0 flex-1 items-start gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                          th.unreadCount > 0 ? "bg-primary/[0.045]" : ""
                        }`}
                      >
                        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card shadow-sm">
                          {ICON[n.type] || <Bell size={15} className="text-muted-foreground" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-[13px] font-bold leading-snug text-foreground">{n.title}</span>
                            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                              {regional.formatRelativeTime(n.timestamp, liveNow)}
                            </span>
                          </span>
                          {th.history.length > 1 ? (
                            <span className="mt-0.5 block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                              {th.history.length} updates in this channel
                            </span>
                          ) : null}
                          {isCommunityNotification(n) ? (
                            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                              {communityNotificationLabel(n)}
                            </span>
                          ) : null}
                          <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground line-clamp-2">
                            {n.message}
                          </span>
                        </span>
                        {th.unreadCount > 0 ? (
                          <span className="mt-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--gh-green)] px-1 text-[10px] font-bold text-white">
                            {th.unreadCount > 9 ? "9+" : regional.formatNumber(th.unreadCount)}
                          </span>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => onTap(n)}
                        aria-label={`Notification details and history for ${n.title}`}
                        title="Details and history"
                        className="gh-hit-44 mr-2 mt-3 flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full text-muted-foreground opacity-70 transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/40 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                      </div>
                    </li>
                    )
                  })}
                  {hiddenThreadCount > 0 ? (
                    <li className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setVisibleThreadCount((count) => count + THREAD_PAGE_SIZE)}
                        className="min-h-11 w-full rounded-2xl border border-border bg-card px-4 text-[13px] font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        Show {Math.min(THREAD_PAGE_SIZE, hiddenThreadCount)} more · {plural(hiddenThreadCount, "conversation")} hidden
                      </button>
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}
    </div>
  )
}

export default NotificationBell
