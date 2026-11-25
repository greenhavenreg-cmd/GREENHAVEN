/**
 * Pi Developer Sandbox frame trust policy.
 *
 * The app-cdn.minepi.com origin is a Pi SDK/bridge host, not proof of Developer
 * Sandbox framing. Keep this pure so the trust boundary can be regression-tested.
 */
export function isTrustedPiSandboxReferrerHost(referrerHost: string): boolean {
  return typeof referrerHost === "string" &&
    referrerHost.trim().toLowerCase() === "sandbox.minepi.com"
}

/**
 * RUN374: app-cdn.minepi.com is a distinct Pi-hosted frame. It is NOT the
 * Developer Sandbox (see above), and in field diagnostics it never answered the
 * App Studio parent-credentials probe. It is therefore classified separately so
 * the app can start Pi.authenticate directly instead of waiting on a probe that
 * has no responder. Server-side token verification is still mandatory.
 */
export function isPiAppCdnReferrerHost(referrerHost: string): boolean {
  return typeof referrerHost === "string" &&
    referrerHost.trim().toLowerCase() === "app-cdn.minepi.com"
}
