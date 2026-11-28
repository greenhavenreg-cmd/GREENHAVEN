# GreenHaven upgrade worklog — 0.338.175 / RUN504

**Date:** 28 November 2026
**Parent:** v0.338.174 / RUN503
**Scope:** notification store outage semantics and messaging presence durability.
**Disposition:** source-only verification scope; production remains **NOT APPROVED**.

## Coordinated release implementation steps

1. Audited the unified notification API count-only and list response contracts.
2. Changed failed unified notification reads to return HTTP 503 with no synthetic zero count or empty-list success.
3. Audited the legacy social notification count and list response contracts.
4. Changed failed or malformed social notification reads to return HTTP 503 and explicitly disabled caching.
5. Preserved the app shell's last confirmed attention counts through transient server errors while retaining authentication-denial handling.
6. Audited the messaging presence writer's database and process-memory fallback paths.
7. Changed presence durability reporting to reflect the actual database write result; production remains fail-closed.
8. Updated the notification bell to retain last-confirmed durable rows only for failed stores, preserve their unread contribution, and clear them on account switch.
9. Added a fifteen-assertion regression contract and registered it in `verify:static` and `prebuild:checks`.
10. Synchronized package, lockfile, in-app release identity, README, project truth, source-of-truth and verified manifest to `0.338.175`.
11. Added RUN504 implementation, verification and operator-review documentation.

## Source files changed

- `app/api/notifications/route.ts`
- `app/api/social/notifications/route.ts`
- `lib/server/messaging/message-store.ts`
- `components/ghc/notification-bell.tsx`
- `scripts/check-run504-notification-outage-presence-durability.mjs`
- `package.json`, `package-lock.json`, `lib/app-release.ts`
- Current release and project-truth documentation.

## Scope deliberately not changed

No SQL migration, database schema, ledger/RPC semantics, Pi authentication/payment, withdrawal, membership, rewards, referral, curation settlement, GHC issuance or vote-to-mint logic changed. No database or provider action was performed.

## Verification and limitations

The focused RUN504 contract passes **15/15**. The complete static suite passes **63/63 suites**; release hygiene **17/17**, project truth **11/11**, documentation hygiene **PASS**, and migration inventory **246/246** synchronized. This is source-only verification scope; no live database or provider state is inferred.

The project requires **Node.js 24.15.0** or later (`^24.15.0`), while this workspace has Node.js 22.16.0. Dependencies are not installed. Supported-runtime clean install, TypeScript, ESLint, Next.js production build, browser/device testing and live Testnet acceptance are not claimed.
