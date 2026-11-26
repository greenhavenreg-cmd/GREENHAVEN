# GreenHaven engineering upgrade and regression report

**Date:** 26 November 2026  
**Baseline:** `0.338.137` Phase 1–6 integrated archive  
**Candidate:** Reconciled R2 working copy  
**Disposition:** Source checks pass; deployment and production release remain blocked.

## Work completed

1. Recovered `.gitignore`, Dependabot, GitHub CI and dependency-security workflows, and the dependency-lock integrity checker from historical evidence. All five files were checked against the connected GitHub `testnet` branch; their Git blob hashes match exactly.
2. Restored the missing migration source manifest from the verified manifest and validated all 245 source migration filenames and byte sizes.
3. Recovered historical worklogs and release records without merging the old nested application snapshot. Historical records are isolated/marked and excluded from active project authority.
4. Updated documentation hygiene so explicitly sidecar-marked historical records are recognized as historical rather than being mistaken for current operating documentation.
5. Removed the browser-local membership fallback from the Premium Membership status display. During a temporary server outage, only a previously server-confirmed status may be shown as stale; local cache data can no longer appear as a paid membership entitlement. Purchase success continues to require the authoritative server status.
6. Shortened Rewards mission copy and Membership explanatory copy. Removed a redundant unsupported-mission implementation explanation; unsupported milestones now use the existing concise “Coming soon” state.
7. Updated regression contracts to assert the current concise UI copy and current server-authority behavior rather than obsolete wording from earlier screens.
8. Preserved server-authoritative GHC/Pi separation, Testnet-only cashback payout controls, server-confirmed mission achievements, account-scoped data, no-store reads and existing financial mutation boundaries.
9. Reconciled Supabase source migration filenames against live Testnet migration history by both version and name. Identified six source migrations not recorded remotely, five version-drifted names and a duplicate Run 406 history name.
10. Performed read-only Supabase security and performance catalog checks. No policies, grants, indexes, migrations or financial records were changed.
11. Confirmed the connected GitHub branch and latest Vercel Preview deployment still point to the earlier `bc42129` commit; the integrated R2 source has not been pushed or deployed.
12. Kept the Pi environment Testnet/Sandbox only. No Mainnet activation, payout, migration application or production deployment was attempted.

## Verification results

| Check | Result |
|---|---:|
| `npm run verify:static` | **PASS — 63/63** |
| Release hygiene | **PASS — 17/17** |
| Project truth | **PASS — 11/11** |
| Dependency-lock integrity | **PASS** |
| Repository consistency / source import scan | **PASS — 1,848 files, 0 unresolved imports** |
| Marketplace Run 411 reliability contract | **PASS — 12/12** |
| Membership experience contract | **PASS — 23/23** |
| Rewards mission verification contract | **PASS — 31/31** |
| Wallet/Rewards transparency contract | **PASS — 9/9** |
| Documentation hygiene | **PASS** |
| Node runtime gate | **BLOCKED — local Node 22.16.0; required Node 24.15.0** |
| Typecheck, lint, `npm ci`, full Next build | **NOT RUN** |
| Fresh npm audit | **NOT RUN** |
| Live Pi Browser / full Testnet E2E | **NOT YET VERIFIED** |

The static suite ran successfully under the available Node 22 runtime. The separate runtime gate correctly rejects Node 22, so this is not a supported-runtime build certification.

## Supabase Testnet findings — read-only

- Source SQL files: 245.
- Remote migration history rows: 240.
- Exact version/name matches: 234.
- Six source migration names absent from remote history, all held for operator review.
- Five source names are present remotely under different versions.
- Run 406 server-read reconciliation appears twice in remote history under two different versions.
- 37 RLS-enabled tables have no policies; direct `anon`/`authenticated` SELECT and write privileges were zero for those tables.
- 322 public `SECURITY DEFINER` functions were found; none were executable by `anon` or `authenticated`.
- Performance advisor: 17 unindexed foreign keys and 183 unused-index candidates. No automatic index action is recommended.

No migration or SQL change was applied. The six missing migrations and five version drifts require content/catalog reconciliation before any Testnet action.

## Remaining blockers

1. Synchronize the R2 candidate to a new GitHub `testnet` branch or reviewed pull request; do not overwrite the current branch directly.
2. Run CI with Node 24.15.0, install dependencies, refresh npm audit and resolve the previously reported 22 dependency findings.
3. Run typecheck, lint and a fresh Vercel Preview build from the integrated R2 commit.
4. Reconcile migration history, exact SQL hashes and live catalog state; keep all six held migrations unapplied until reviewed.
5. Complete Pi Browser authentication and account-isolation acceptance.
6. Complete Marketplace buyer/seller/order/inventory/settlement acceptance and Wallet/Rewards/Membership Testnet journeys.

**Release decision:** NOT APPROVED for production or Mainnet. GreenHaven remains Testnet-only.
