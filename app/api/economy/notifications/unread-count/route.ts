import { resolveAuthenticatedUser } from "@/lib/server/economy/auth"
import { jsonErr, jsonOk } from "@/lib/server/economy/http"
import { unreadGhcNotificationCountChecked } from "@/lib/server/economy/notifications"

export async function GET(request: Request) {
  const auth = await resolveAuthenticatedUser(request.headers)
  if (!auth) return jsonErr("AUTH_REQUIRED", "Authentication required", 401)
  const count = await unreadGhcNotificationCountChecked(auth.userId)
  // An unreadable store is an outage, not "zero unread": clients keep their last known count.
  if (count === null) return jsonErr("NOTIFICATIONS_UNAVAILABLE", "Notifications are temporarily unavailable", 503)
  return jsonOk({ count, userId: auth.userId })
}
