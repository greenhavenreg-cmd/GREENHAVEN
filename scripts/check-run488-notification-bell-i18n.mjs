import fs from "node:fs"
const bell = fs.readFileSync("components/ghc/notification-bell.tsx", "utf8")
const i18n = fs.readFileSync("lib/i18n/social.ts", "utf8")
const keys = ["unreadWithCount", "notificationActions", "notificationList", "readStateSaveFailed", "readStateSavedLegacy", "hiddenOnDevice", "markAllReadFailed", "markedAllRead", "allNotificationsMarkedRead"]
const base = i18n.slice(0, i18n.indexOf("} as const"))
const checks = [
  ["all new keys exist in the English base messages", keys.every((k) => new RegExp(`\\b${k}:`).test(base))],
  ["every new key is used by the bell", keys.every((k) => bell.includes(`t("${k}"`))],
  ["bell no longer hard-codes the replaced English strings", ["Could not save this read state", "Read state saved. Legacy", "Notification hidden on this device", "Some alerts could not be marked read", "Marked all as read", "All notifications marked read", "aria-label=\"Notification list\"", "aria-label=\"Notification actions\""].every((s) => !bell.includes(s))],
  ["notification actions container is a named group", /role="group" aria-label=\{t\("notificationActions"\)\}/.test(bell)],
  ["unread count still caps at 99+ in the tab label", /t\("unreadWithCount", \{ count: unread > 99 \? "99\+" : unread \}\)/.test(bell)],
  ["locale packs still fall back to English per key", /PACKS\[language\]\[key\] \?\? SOCIAL_MESSAGES\[key\]/.test(i18n)],
  ["mark-all failure still reconciles with the server", /failed \? t\("markAllReadFailed"\)/.test(bell) && /Reconcile optimistic local state/.test(bell)],
]
let failed = 0
for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${n}`); if (!ok) failed++ }
console.log(`RUN488 notification bell i18n: ${checks.length - failed}/${checks.length} passed`)
if (failed) process.exit(1)
