/** Explicit public-route policy. Only legal/help documents, referral landing
 * redirects, and the Pi Developer Portal domain-validation file are anonymous.
 * Every GreenHaven service surface, including research and field reporting,
 * mounts the Pi authentication shell. API handlers independently verify the
 * durable server session.
 */
export const PUBLIC_PREFIX_ROUTES = [
  "/privacy",
  "/terms",
  "/support",
  "/join",
  "/validation-key.txt",
] as const

export function isPublicRoutePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const path = pathname.split("?")[0]?.split("#")[0] || ""
  if (!path) return false
  return PUBLIC_PREFIX_ROUTES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}
