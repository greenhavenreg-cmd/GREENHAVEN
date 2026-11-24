/**
 * Testnet / pre-mainnet unlock spine.
 * When sandbox or explicit unlock is on, economy surfaces that are safe on testnet
 * run end-to-end so the full product can be exercised before mainnet.
 *
 * Mainnet remains locked unless the same flags are set deliberately in production.
 * Never mints on client; all credits still go through server RPCs / store.
 */

function envTrue(name: string): boolean {
  try {
    const v = String(process.env[name] || "").trim().toLowerCase()
    return v === "1" || v === "true" || v === "yes" || v === "on"
  } catch {
    return false
  }
}

function configuredFlag(...names: string[]): boolean | undefined {
  for (const name of names) {
    const raw = String(process.env[name] ?? "").trim()
    if (raw) return envTrue(name)
  }
  return undefined
}

function isTestnetRuntime(): boolean {
  const network = String(process.env.PI_NETWORK || "").trim().toLowerCase()
  const vercelEnvironment = String(process.env.VERCEL_ENV || "").trim().toLowerCase()
  // A sandbox flag is not proof of Testnet when the configured blockchain
  // network is Mainnet or unknown. Production deployments never inherit the
  // Testnet exercise unlock, even if a stale Preview flag was copied across.
  return network === "testnet" && vercelEnvironment !== "production"
}

/** Explicit operator unlock (only when PI_NETWORK=testnet outside Production). */
export function isExplicitTestnetUnlock(): boolean {
  if (!isTestnetRuntime()) return false
  return envTrue("GHC_TESTNET_UNLOCK") || envTrue("NEXT_PUBLIC_GHC_TESTNET_UNLOCK")
}

/** Pi sandbox / Testnet network. */
export function isPiSandboxEnv(): boolean {
  if (!isTestnetRuntime()) return false
  if (envTrue("NEXT_PUBLIC_PI_SANDBOX")) return true
  if (String(process.env.PI_ENV || "").trim().toLowerCase() === "sandbox") return true
  // Preview is a sandbox only when the blockchain network is explicitly Testnet.
  return String(process.env.VERCEL_ENV || "").trim().toLowerCase() === "preview"
}

/** Full Testnet product exercise mode; Mainnet and unknown networks fail closed. */
export function isTestnetProductUnlocked(): boolean {
  return isTestnetRuntime() && (isExplicitTestnetUnlock() || isPiSandboxEnv())
}

export function activityRewardsEnabled(): boolean {
  const configured = configuredFlag("GHC_ACTIVITY_REWARDS_ENABLED")
  return configured ?? isTestnetProductUnlocked()
}

export function curationRedistributeEnabled(): boolean {
  const configured = configuredFlag("GHC_CURATION_REDISTRIBUTE_ENABLED", "NEXT_PUBLIC_GHC_CURATION_REDISTRIBUTE_ENABLED")
  return configured ?? isTestnetProductUnlocked()
}

export function referralSettlementEnabled(): boolean {
  const configured = configuredFlag("GHC_REFERRAL_SETTLEMENT_ENABLED", "NEXT_PUBLIC_GHC_REFERRAL_SETTLEMENT_ENABLED")
  return configured ?? isTestnetProductUnlocked()
}

export function buyGhcWithPiEnabled(): boolean {
  const configured = configuredFlag("GHC_BUY_WITH_PI_ENABLED")
  return configured ?? isTestnetProductUnlocked()
}

export function testnetUnlockSnapshot() {
  return {
    explicitUnlock: isExplicitTestnetUnlock(),
    piSandbox: isPiSandboxEnv(),
    productUnlocked: isTestnetProductUnlocked(),
    activityRewards: activityRewardsEnabled(),
    curationRedistribute: curationRedistributeEnabled(),
    referralSettlement: referralSettlementEnabled(),
    buyGhcWithPi: buyGhcWithPiEnabled(),
  }
}
