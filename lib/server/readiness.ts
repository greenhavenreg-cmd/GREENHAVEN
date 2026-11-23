/**
 * GH CONNECT production readiness (foundation gate).
 *
 * Informed by:
 * - Vercel production / deployment checks (real dependency probes, release gates)
 * - Health-check best practice: node runtime, no-store, 503 on not-ready (not only body flags)
 * - Meta/Facebook: explicit Development vs Live separation
 * - X/Twitter: separate env credentials; never mix prod keys into test traffic
 * - Pi Network: sandbox flag must match Testnet vs Mainnet API keys and portal app
 *
 * This module is the single source of truth for /api/health and release checklists.
 * It never returns secrets — only booleans, labels, and remediation text.
 */

import { resolvePiSandbox, getPiClientId } from "@/lib/pi-env"
import { APP_RELEASE_VERSION } from "@/lib/app-release"
import { isPiIdentityDurable } from "@/lib/server/identity/pi-identity-store"
import { isSessionStoreDurable } from "@/lib/server/identity/session-store"
import { isMessagingStoreDurable } from "@/lib/server/messaging/message-store"
import { socialDbConfigured } from "@/lib/server/social/rpc"
import { readGhcServerEnv } from "@/lib/server/economy/env"
import { supabaseRest } from "@/lib/server/supabase/rest-client"

export type CheckStatus = "pass" | "fail" | "warn" | "info"
export type CheckSeverity = "critical" | "high" | "medium" | "low" | "info"

export type ReadinessCheck = {
  id: string
  label: string
  status: CheckStatus
  severity: CheckSeverity
  detail?: string
  remediation?: string
}

export type ReadinessLevel = "ready" | "degraded" | "not_ready"

export type ReadinessReport = {
  /** Process is up */
  ok: true
  /** Aggregated readiness for release / load decisions */
  ready: boolean
  status: ReadinessLevel
  service: "gh-connect"
  version: string
  /** Programme release line (source gates 4–10). */
  programmePhase: string
  environment: {
    nodeEnv: string
    vercelEnv: string
    isProduction: boolean
    piSandbox: boolean
    /** Human label for operators */
    networkLabel: "sandbox-testnet" | "mainnet" | "unknown"
  }
  checks: ReadinessCheck[]
  blockers: string[]
  warnings: string[]
  /** Documented env matrix for Pi (no secrets) */
  networkMatrix: {
    current: string
    sandbox: {
      piInitSandbox: true
      expectedPortalNetwork: "Testnet"
      expectedKeyType: "Testnet / Develop API key"
      localDevUrl: "http://localhost:3000"
    }
    mainnet: {
      piInitSandbox: false
      expectedPortalNetwork: "Mainnet"
      expectedKeyType: "Mainnet production API key"
      note: "Real π — irreversible payments"
    }
  }
  endpoints: {
    health: "/api/health"
    live: "/api/health/live"
    paymentsHealth: "/api/payments/health"
    staking: "/api/pi/staking"
    signInCallback: "/signin/callback"
  }
  /**
   * The synchronous evaluator reports configuration-only evidence. The /api/health
   * wrapper upgrades identity/session to live PostgREST read probes; write grants
   * still require catalog/postflight verification. Other stores remain config-only.
   */
  schemaReadiness: {
    probe: "configuration_only" | "live_read_probe"
    identity: "ready" | "configured_unverified" | "missing" | "failed"
    sessions: "ready" | "configured_unverified" | "missing" | "failed"
    messaging: "ready" | "configured_unverified" | "missing"
    payments: "configured_unverified" | "missing"
    economyLedger: "configured_unverified" | "missing"
    membership: "configured_unverified" | "missing"
    marketplace: "configured_unverified" | "missing"
    socialCommunity: "configured_unverified" | "missing"
    multiUser: "configured_unverified" | "missing"
  }
  ts: string
}

function envFlag(name: string): boolean {
  return Boolean((process.env[name] || "").trim())
}

/**
 * Evaluate foundation readiness. Safe to call from Node API routes only.
 */
export function evaluateReadiness(opts?: {
  hostname?: string | null
}): ReadinessReport {
  const ghcEnv = readGhcServerEnv()
  const isProduction = ghcEnv.isProduction
  const vercelEnv = (
    process.env.VERCEL_ENV ||
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    ""
  ).trim()
  const nodeEnv = (process.env.NODE_ENV || "").trim() || "undefined"
  const sandbox = resolvePiSandbox({
    hostname: opts?.hostname,
    vercelEnv,
  })
  const networkLabel = sandbox ? "sandbox-testnet" : "mainnet"

  const clientId = Boolean(getPiClientId())
  const piApiKey = envFlag("PI_API_KEY") || envFlag("PI_SERVER_API_KEY")
  const supabaseUrl =
    envFlag("SUPABASE_URL") || envFlag("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseService = envFlag("SUPABASE_SERVICE_ROLE_KEY")

  let identityDurable = false
  let sessionDurable = false
  try {
    identityDurable = isPiIdentityDurable()
  } catch {
    /* */
  }
  try {
    sessionDurable = isSessionStoreDurable()
  } catch {
    /* */
  }

  // Messaging durability (required for cross-device chat when feature enabled)
  let messagingDurable = false
  try {
    messagingDurable = isMessagingStoreDurable()
  } catch {
    /* */
  }

  // Read the effective policy, not the raw opt-in flag. In Vercel Preview,
  // NODE_ENV is normally "production" even though VERCEL_ENV is "preview".
  // readGhcServerEnv() hard-denies dev auth in that runtime, so readiness must
  // evaluate the same effective value used by the auth implementation.
  const allowDevAuth = ghcEnv.allowDevAuth
  const devAuthFlagConfigured =
    process.env.GHC_ALLOW_DEV_AUTH === "1" ||
    process.env.GHC_ALLOW_DEV_AUTH === "true"
  const memoryFinancial =
    process.env.GHC_SERVER_MEMORY === "1" ||
    process.env.GHC_SERVER_MEMORY === "true"

  const checks: ReadinessCheck[] = []

  // --- Critical: Pi identity bridge credentials ---
  checks.push({
    id: "pi_client_id",
    label: "Pi Sign-In Client ID",
    status: clientId ? "pass" : "fail",
    severity: "critical",
    detail: clientId
      ? "NEXT_PUBLIC_PI_CLIENT_ID is set"
      : "Missing NEXT_PUBLIC_PI_CLIENT_ID — Pi Browser shows Sign-In Client ID not configured",
    remediation:
      "Developer Portal → Pi Sign-in → copy oAuth Client ID → Vercel env NEXT_PUBLIC_PI_CLIENT_ID (Production + Preview as needed)",
  })

  checks.push({
    id: "pi_api_key",
    label: "Pi Server API Key",
    status: piApiKey ? "pass" : "fail",
    severity: "critical",
    detail: piApiKey
      ? "PI_API_KEY configured (value not exposed)"
      : "Missing PI_API_KEY — payment approve returns 503 / wallet Payment Expired",
    remediation:
      "Developer Portal → App → API Key for the SAME network (Testnet vs Mainnet) → Vercel PI_API_KEY (server-only, never NEXT_PUBLIC_)",
  })

  // --- Critical in production: durable identity/session ---
  const supabaseConfigured = supabaseUrl && supabaseService
  checks.push({
    id: "identity_durable",
    label: "Pi identity storage configuration",
    status: identityDurable ? "warn" : isProduction ? "fail" : "warn",
    severity: identityDurable ? "high" : isProduction ? "critical" : "high",
    detail: identityDurable
      ? "Supabase credentials are configured; gh_pi_identities existence, schema and service_role SELECT/INSERT/UPDATE privileges are not verified by this configuration-only health probe"
      : "Privileged Supabase storage is not configured; production Pi identity persistence is unavailable",
    remediation:
      "Verify public.gh_pi_identities columns, RLS deny-client policy, and service_role SELECT/INSERT/UPDATE grants against the target Testnet database",
  })

  checks.push({
    id: "session_durable",
    label: "GH session storage configuration",
    status: sessionDurable ? "warn" : isProduction ? "fail" : "warn",
    severity: sessionDurable ? "high" : isProduction ? "critical" : "high",
    detail: sessionDurable
      ? "Supabase credentials are configured; gh_sessions existence, schema and service_role SELECT/INSERT/UPDATE privileges are not verified by this configuration-only health probe"
      : "Privileged Supabase storage is not configured; production GH session persistence is unavailable",
    remediation:
      "Verify public.gh_sessions columns, RLS deny-client policy, and service_role SELECT/INSERT/UPDATE grants against the target Testnet database",
  })

  checks.push({
    id: "supabase_config",
    label: "Supabase configuration",
    status: supabaseConfigured ? "pass" : isProduction ? "fail" : "warn",
    severity: isProduction ? "critical" : "high",
    detail: supabaseConfigured
      ? "URL + service role present"
      : "Supabase URL or service role missing",
    remediation:
      "Vercel: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY",
  })

  checks.push({
    id: "messaging_durable",
    label: "Durable messaging store",
    status: messagingDurable ? "pass" : isProduction ? "warn" : "info",
    severity: isProduction ? "high" : "medium",
    detail: messagingDurable
      ? "gh_conversations / gh_messages backed by durable store"
      : "Messaging store not durable — enable after applying 20260919_gh_messaging_durable migration",
    remediation:
      "Apply supabase/migrations/20260919_gh_messaging_durable.sql; set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY; optional NEXT_PUBLIC_MESSAGING_DURABLE=1",
  })

  checks.push({
    id: "profile_store_config",
    label: "Profile / progress store config",
    status: supabaseConfigured ? "pass" : isProduction ? "warn" : "info",
    severity: "high",
    detail: supabaseConfigured
      ? "Supabase configured for gh_user_profiles / achievements (apply 20260919_gh_user_profiles_and_progress)"
      : "Profile durability needs Supabase + migration 20260919_gh_user_profiles_and_progress",
    remediation:
      "Apply migration 20260919_gh_user_profiles_and_progress.sql after identity migrations",
  })

  // --- High: explicit network flag schema ---
  // A typo must not silently fall through to an environment-derived network.
  // This is especially important because a false default can select Mainnet.
  const rawSandboxFlag = (process.env.NEXT_PUBLIC_PI_SANDBOX || "").trim()
  const invalidSandboxFlag = rawSandboxFlag !== "" && rawSandboxFlag !== "true" && rawSandboxFlag !== "false"
  const mainnetTarget = vercelEnv === "production" || process.env.GHC_ENV === "production"
  checks.push({
    id: "pi_sandbox_flag_schema",
    label: "Pi sandbox flag schema",
    status: invalidSandboxFlag ? (mainnetTarget ? "fail" : "warn") : "pass",
    severity: mainnetTarget ? "critical" : "medium",
    detail: invalidSandboxFlag
      ? "NEXT_PUBLIC_PI_SANDBOX must be exactly true or false; its current value is ignored by the network resolver"
      : rawSandboxFlag
        ? "NEXT_PUBLIC_PI_SANDBOX uses an accepted boolean string"
        : "No explicit sandbox flag; environment-aware network resolution applies",
    remediation: "Set NEXT_PUBLIC_PI_SANDBOX to exactly true for Testnet or false for Mainnet; align the Pi Portal app and server API key to the same network.",
  })

  // --- High: network consistency ---
  // Mainnet Production + sandbox flag is a critical misconfiguration. Vercel Preview uses NODE_ENV=production too, but should remain on Testnet.
  // NODE_ENV=production is also set for Vercel Preview builds. Vercel Preview is expected to use Pi Testnet, so only the actual Vercel Production target (or
  // an explicit GHC_ENV=production override) must reject sandbox mode.
  const isMainnetDeployment = vercelEnv === "production" || process.env.GHC_ENV === "production"
  const sandboxInProduction = Boolean(isMainnetDeployment && sandbox)
  checks.push({
    id: "pi_network_mode",
    label: "Pi network mode (sandbox vs mainnet)",
    status: sandboxInProduction ? "fail" : "info",
    severity: sandboxInProduction ? "critical" : "info",
    detail: sandboxInProduction
      ? "NEXT_PUBLIC_PI_SANDBOX appears enabled while runtime is production — refuse treating this as Mainnet-ready"
      : sandbox
        ? "sandbox=true → expect Testnet portal app + Testnet API key"
        : "sandbox=false → expect Mainnet portal app + Mainnet API key (real π)",
    remediation: sandboxInProduction
      ? "On Vercel Production set NEXT_PUBLIC_PI_SANDBOX=false and use Mainnet Pi credentials + Mainnet Supabase"
      : "Align NEXT_PUBLIC_PI_SANDBOX, Developer Portal App Network, and PI_API_KEY network. Mixing causes approve failures and auth confusion.",
  })

  // --- Critical security: dev auth must not be on in production ---
  if (isProduction && allowDevAuth) {
    // This branch should be unreachable while readGhcServerEnv remains the
    // authority. Keep the fail-closed guard in case that policy changes.
    checks.push({
      id: "dev_auth_locked",
      label: "Dev authentication disabled in production",
      status: "fail",
      severity: "critical",
      detail: "Effective server policy unexpectedly permits development authentication in a production runtime",
      remediation: "Restore the production hard-deny in readGhcServerEnv(); never enable development auth in production runtimes",
    })
  } else {
    checks.push({
      id: "dev_auth_locked",
      label: "Dev authentication policy",
      status: "pass",
      severity: "high",
      detail: isProduction
        ? devAuthFlagConfigured
          ? "Dev auth is hard-disabled by production runtime policy; GHC_ALLOW_DEV_AUTH has no effect here and should be removed from Preview/Production configuration"
          : "Dev Bearer user:<id> is hard-blocked by production runtime policy"
        : allowDevAuth
          ? "Dev auth allowed (non-production only)"
          : "Dev auth not enabled",
    })
  }

  // --- Critical: memory financial flag must not be set in production ---
  // allowMemoryServer() already returns false on Vercel/production; this flags misconfiguration.
  if (isProduction && memoryFinancial) {
    checks.push({
      id: "memory_finance",
      label: "Financial store durability",
      status: "fail",
      severity: "critical",
      detail:
        "GHC_SERVER_MEMORY is set in a production runtime — process memory must never be financial authority",
      remediation:
        "Unset GHC_SERVER_MEMORY on Production. Require SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for ledger paths",
    })
  } else if (isProduction && !supabaseConfigured) {
    checks.push({
      id: "memory_finance",
      label: "Financial store durability",
      status: "fail",
      severity: "critical",
      detail:
        "Production runtime without privileged Supabase configuration — durable GHC ledger unavailable",
      remediation:
        "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on Production (never rely on process memory)",
    })
  } else {
    checks.push({
      id: "memory_finance",
      label: "Financial store durability",
      status: "pass",
      severity: "high",
      detail: isProduction
        ? "Production memory financial flag not set; durable DB path expected"
        : "Non-production: memory ledger allowed only when allowMemoryServer() permits",
    })
  }

  // Aggregate
  const warnings = checks
    .filter((c) => c.status === "warn")
    .map((c) => `${c.label}: ${c.detail || c.id}`)

  const criticalFails = checks.some(
    (c) => c.status === "fail" && c.severity === "critical"
  )
  const highFails = checks.some(
    (c) => c.status === "fail" && c.severity === "high"
  )

  // Production + critical fail → not_ready (HTTP 503).
  // Non-production critical fail → degraded (still HTTP 200 for local DX).
  let status: ReadinessLevel = "ready"
  if (criticalFails) {
    status = isProduction ? "not_ready" : "degraded"
  } else if (highFails || warnings.length > 0) {
    status = "degraded"
  }

  const strictlyReady = !criticalFails

  return {
    ok: true,
    /** True when no critical blockers (warnings may still exist → status degraded) */
    ready: strictlyReady,
    status,
    service: "gh-connect",
    version: process.env.npm_package_version || APP_RELEASE_VERSION,
    programmePhase: "10-platform-acceptance; phase2-db-integrity-source-complete",
    environment: {
      nodeEnv,
      vercelEnv: vercelEnv || "local",
      isProduction,
      piSandbox: sandbox,
      networkLabel,
    },
    checks,
    blockers: checks
      .filter((c) => c.status === "fail" && c.severity === "critical")
      .map((c) => c.remediation || c.detail || c.id),
    warnings: warnings,
    networkMatrix: {
      current: networkLabel,
      sandbox: {
        piInitSandbox: true,
        expectedPortalNetwork: "Testnet",
        expectedKeyType: "Testnet / Develop API key",
        localDevUrl: "http://localhost:3000",
      },
      mainnet: {
        piInitSandbox: false,
        expectedPortalNetwork: "Mainnet",
        expectedKeyType: "Mainnet production API key",
        note: "Real π — irreversible payments",
      },
    },
    endpoints: {
      health: "/api/health",
      live: "/api/health/live",
      paymentsHealth: "/api/payments/health",
      staking: "/api/pi/staking",
      signInCallback: "/signin/callback",
    },
    schemaReadiness: {
      probe: "configuration_only" as const,
      identity: identityDurable && supabaseConfigured
        ? ("configured_unverified" as const)
        : ("missing" as const),
      sessions: sessionDurable && supabaseConfigured
        ? ("configured_unverified" as const)
        : ("missing" as const),
      messaging: messagingDurable
        ? ("ready" as const)
        : supabaseConfigured
          ? ("configured_unverified" as const)
          : ("missing" as const),
      payments: supabaseConfigured
        ? ("configured_unverified" as const)
        : ("missing" as const),
      economyLedger: supabaseConfigured
        ? ("configured_unverified" as const)
        : ("missing" as const),
      membership: supabaseConfigured
        ? ("configured_unverified" as const)
        : ("missing" as const),
      marketplace: supabaseConfigured
        ? ("configured_unverified" as const)
        : ("missing" as const),
      socialCommunity: supabaseConfigured
        ? ("configured_unverified" as const)
        : ("missing" as const),
      multiUser: socialDbConfigured()
        ? ("configured_unverified" as const)
        : ("missing" as const),
    },
    ts: new Date().toISOString(),
  }
}

/**
 * Live readiness used by /api/health. Unlike evaluateReadiness(), this performs
 * bounded, read-only PostgREST probes against the exact identity/session column
 * contracts using the server-only service_role credential. A 200 response with
 * an empty result proves table/column visibility for the runtime role; it does
 * not claim INSERT/UPDATE ACLs (those are verified by catalog checks and the
 * applied least-privilege migration).
 */
export async function evaluateLiveReadiness(opts?: { hostname?: string | null }): Promise<ReadinessReport> {
  const report = evaluateReadiness(opts)
  const identityPath = "gh_pi_identities?select=pi_app_uid,gh_user_id,pi_username,onboarding_completed,greenhaven_profile_id,created_at,updated_at,last_seen_at,verified_at&limit=0"
  const sessionPath = "gh_sessions?select=id,token_hash,gh_user_id,created_at,last_seen_at,expires_at,absolute_expires_at,revoked_at,user_agent_hash,meta&limit=0"
  const [identityProbe, sessionProbe] = await Promise.all([
    supabaseRest<unknown[]>(identityPath, { method: "GET", timeoutMs: 5000, maxResponseBytes: 16_384 }),
    supabaseRest<unknown[]>(sessionPath, { method: "GET", timeoutMs: 5000, maxResponseBytes: 16_384 }),
  ])
  const identityReady = identityProbe.ok && Array.isArray(identityProbe.data)
  const sessionsReady = sessionProbe.ok && Array.isArray(sessionProbe.data)
  report.schemaReadiness.probe = "live_read_probe"
  report.schemaReadiness.identity = identityReady ? "ready" : report.schemaReadiness.identity === "missing" ? "missing" : "failed"
  report.schemaReadiness.sessions = sessionsReady ? "ready" : report.schemaReadiness.sessions === "missing" ? "missing" : "failed"

  const applyProbe = (id: string, ok: boolean, result: typeof identityProbe, table: string) => {
    const check = report.checks.find((item) => item.id === id)
    if (!check) return
    check.status = ok ? "pass" : report.environment.isProduction ? "fail" : "warn"
    check.severity = report.environment.isProduction ? "critical" : "high"
    check.detail = ok
      ? `${table}: live PostgREST read succeeded; required columns are visible to the service_role runtime.`
      : `${table}: live PostgREST probe failed (${result.ok ? "INVALID_RESPONSE" : result.error}); table shape, API exposure or service_role SELECT access is not ready.`
    check.remediation = `Verify ${table} columns, Data API exposure, service_role SELECT privilege, and the RUN377 ACL migration on the exact Preview Supabase project.`
  }
  applyProbe("identity_durable", identityReady, identityProbe, "public.gh_pi_identities")
  applyProbe("session_durable", sessionsReady, sessionProbe, "public.gh_sessions")

  const warnings = report.checks.filter((item) => item.status === "warn").map((item) => `${item.label}: ${item.detail || item.id}`)
  const criticalFails = report.checks.some((item) => item.status === "fail" && item.severity === "critical")
  const highFails = report.checks.some((item) => item.status === "fail" && item.severity === "high")
  report.warnings = warnings
  report.blockers = report.checks.filter((item) => item.status === "fail" && item.severity === "critical").map((item) => item.remediation || item.detail || item.id)
  report.ready = !criticalFails
  report.status = criticalFails ? (report.environment.isProduction ? "not_ready" : "degraded") : highFails || warnings.length ? "degraded" : "ready"
  return report
}

/** HTTP status for readiness: 503 only when production and not ready */
export function readinessHttpStatus(report: ReadinessReport): 200 | 503 {
  if (report.environment.isProduction && report.status === "not_ready") {
    return 503
  }
  return 200
}
