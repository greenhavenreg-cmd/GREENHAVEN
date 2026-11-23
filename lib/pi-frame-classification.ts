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
