# GreenHaven Phase 7–8 Harmonized Programme Register

**Baseline:** `GREENHAVEN-0.338.116-PHASE5-6-PROFILE-STORAGE-2026-11-24.zip`  
**Working release:** `0.338.117`  
**Disposition:** source-only harmonization; no push, deployment, migration application, wallet mutation or financial execution.

## 1. Why this register exists

The repository has several independently developed roadmaps that reused the labels “Phase 7” and “Phase 8” at different dates. Those labels are historical workstream identifiers, not globally unique sequence numbers. A later phase number does not automatically supersede an earlier feature, and a legacy roadmap is not permission to resurrect retired behavior.

This register harmonizes those streams by product domain, authoritative owner, dependencies and release evidence. Canonical Pi identity mapping remains the prerequisite for session-bound user actions; the Pi UID must never be substituted for a GreenHaven user ID. The financial ledger remains the authority for balances and settlement. Existing feature implementations remain in place; this work does not rewrite them or merge their data authorities.

**Phase numbers are historical labels.** This document is the one programme register for current Phase 7/8 coordination. Focused historical documents and checks remain preserved as evidence.

## 2. Harmonized programme map

### Phase 7 — Identity, Community and Commerce Foundations

| Workstream | Existing implementation / evidence | Authority and integration boundary | Current disposition |
|---|---|---|---|
| Community identity isolation | RUN331 account-scoped cache, identity-change fencing, bounded cache parsing; source + runtime checks | Local cache is a non-authoritative hint only. Membership, roles, moderation and access remain server/domain-owned. | Source contracts and runtime checks present; device/account-switch acceptance remains external. |
| Community governance | Durable moderation/report RPCs and operator history; Phase 7 governance gate | Authenticated actor and moderator role are resolved/rechecked server-side. Held migration state is not inferred from source. | Source gate present; exact target migration reconciliation and live role tests remain separate. |
| Premium profile identity | 0.318 identity progress, accessibility, latest-request-wins refresh | Profile presentation consumes account-scoped server-confirmed data; it does not create identity or reputation authority. | Existing source gate; visual and assistive-technology acceptance remains open. |
| Creator/business identity and portfolio | 0.319 professional/business showcase, HTTPS portfolio links, server sanitizers, public-profile privacy | Client cannot self-assert verification; public projections obey profile visibility; no wallet/financial data in public showcase. | Sanitizer/privacy runtime tests and identity showcase gate retained. |
| Marketplace commerce | 0.334 buyer/seller/order/payment contracts | Server derives price, seller, stock and totals; durable reservation/idempotency and payment-claim fencing remain mandatory. | Focused source gate retained; real Testnet checkout/reconciliation not implied. |
| Social experience | Feed/story visibility, bounded writes, mute/privacy fail-closed behavior | Session identity and canonical visibility remain server-side; local UI cannot widen access. | Existing source gate retained. |
| Pi identity and withdrawal boundaries | Canonical Pi UID→GH identity mapping, explicit wallet consent, payout recipient checks | Pi identity, GH account ID, wallet address and session are distinct namespaces; only verified server mapping binds them. | Source gate retained; live Pi Testnet and environment verification remain open. |
| A2U orchestration | Shared recovery/review queue and provider-binding contracts | A request sent is not payment completion. Paid state requires provider completion, binding and verified transaction evidence. | Historical stream retained as a current regression contract; provider receipts remain unverified. |
| Treasury reporting and operations | Separate PI/GHC reporting, seller proceeds, cashback, revenue journal and operator case history | Read/reporting surfaces do not authorize ledger mutation or payout. Operator access remains protected. | Source gates retained; no live financial reconciliation is claimed. |

### Phase 8 — Relationships, Rewards and Financial Readiness

| Workstream | Existing implementation / evidence | Authority and integration boundary | Current disposition |
|---|---|---|---|
| Profile and matching | 0.335 relationship integrity, follow/connect/match signal contracts | Actor is the authenticated session user; client actor IDs are ignored; self/demo/block targets are rejected. Interest is not a connection. | Source gate retained; multi-account/device acceptance remains open. |
| Rewards and verified missions | 0.321–0.323 reward integrity, server-verified mission proofs and idempotent achievements | Reward amount, owner and eligibility are server-derived. Mission completion does not mint GHC or Pi. | Entry/history/release/mission gates retained; held migration classification is unchanged. |
| Unified earnings dashboard | Historical 0.165 earnings presentation and current wallet/economy APIs | Dashboard is a read model. Available, pending, reserved and paid are not interchangeable; ledger remains authoritative. | Source gate retained; provider/Testnet receipt is not claimed. |
| Wallet history foundation | User-scoped PI intent history, separate GHC ledger rail, no-store reads and stale-snapshot handling | Wallet history is read-only; no client balance authority and no merging PI payment history into GHC ledger. | Existing 20-assertion source gate now included in both release pipelines. |
| Cross-domain settlement | Eight-decimal application commission calculation aligned to immutable proceeds SQL formula | Marketplace order payment, seller net, platform fee, membership spend and entitlement are separate durable events; no inferred success across domains. | Source + runtime precision tests retained. Commission configuration parity remains a release blocker if overrides differ from SQL policy. |
| Notification and session trust | Shared priority classifier and active-session security summary | Priority is derived by shared policy and includes unread critical/high items only; notifications never become financial truth. | Corrected a stale source assertion to test the actual shared policy; session summary gate retained. |

## 3. Dependency order and integration rules

1. **Identity first:** authenticated GreenHaven session and verified Pi identity mapping precede profile writes, relationship actions, marketplace mutations and wallet consent. Pi UID must never be substituted for GH user ID.
2. **Privacy before discovery:** public-profile projection, block/mute filtering and account-scoped cache isolation must be enforced before rendering peer or community results. Client cache data never grants access.
3. **Commerce before settlement:** listing/stock validation → durable order reservation → payment claim → provider/ledger confirmation → immutable seller-proceeds and revenue records. Retries use stable idempotency keys; uncertain outcomes remain recoverable, not silently paid.
4. **Rewards remain independent:** verified mission/reward records do not derive authority from profile completion, views, likes, client metadata or a client-supplied amount. PI cashback is not GHC ledger credit.
5. **Read models remain read-only:** profile metrics, notifications, earnings, treasury dashboards and wallet history display server-owned state; they do not mutate identity, balances, entitlements or settlement.
6. **Cross-domain events are evidence-linked:** each event keeps its own domain reference, currency, status, owner and idempotency boundary. No generic “success” flag may settle unrelated domains.
7. **Migrations remain append-only and reviewed:** no automatic migration replay, no historical migration edits, no blanket grant/policy changes. Distinguish source files, `REVIEW_REQUIRED`, applied history and live catalog evidence.

## 4. Harmonization changes in 0.338.117

- Added this programme register to reconcile reused Phase 7/8 labels without deleting or renumbering historical records.
- Added a consolidated Phase 7/8 harmonization contract to ensure the focused source/runtime gates are present exactly once in both `prebuild:checks` and `verify:static`.
- Corrected the notification-priority checker: the component delegates to `isPriorityNotification`; the shared policy itself enforces unread-only critical/high priority. The previous test asserted an obsolete inline implementation and failed despite correct runtime policy.
- Registered the existing wallet-history foundation gate in both release pipelines; its 20 assertions were present but previously omitted from those manifests.
- Preserved all feature implementations and all migration files. No migration was added, edited, replayed or applied in this harmonization.

## 5. Release gates and honest status

Focused source checks are necessary but not sufficient. The registered gates cover community isolation, governance, premium and professional identity, marketplace commerce, social safety, Pi identity/withdrawal, A2U, treasury, profile/matching, rewards, earnings, settlement, wallet history and notification/session trust.

Still required before release acceptance:

- Node `24.15.x` clean dependency install, full TypeScript check, lint, complete prebuild and Next.js production build.
- Browser/device QA at narrow Android widths, tablet and desktop; keyboard, screen reader, reduced motion, dark mode, high contrast and RTL checks.
- Two-account identity-switch, block/mute, follow/connect/match and community membership acceptance.
- Authorized Testnet marketplace order/payment/refund/seller-proceeds and membership-entitlement recovery tests.
- Pi Testnet A2U provider receipt and uncertain-outcome recovery verification; no Mainnet inference.
- Exact Testnet migration-history/catalog reconciliation and PostgreSQL rehearsal for every held migration before any separately authorized application.
- Commission environment verification: keep `GHC_MARKETPLACE_PLATFORM_FEE_BPS` unset or `500` and `GHC_MARKETPLACE_MIN_PLATFORM_FEE_MINOR` unset or `0` until an additive shared database policy is designed, reviewed and rehearsed.
- Verify deployed `/api/media/health` and authenticated private-media upload/download/denial flows for the 0.338.116 media baseline.

**No live financial execution** was performed by this harmonization. No payment, payout, refund, balance, reward, membership entitlement, Pi wallet authorization or Mainnet state was changed. No automatic migration replay occurred. No Git push or Vercel deployment occurred. This source release is **NOT production approved** until the outstanding gates above are evidenced.
