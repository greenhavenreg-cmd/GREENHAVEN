# GH-CONNECT Wallet, Membership & Rewards Deep Audit — 0.338.123

**Audit baseline:** `GREENHAVEN-0.338.119-PHASE9-COORDINATED-ONBOARDING-IDENTITY-STORAGE-2026-11-24-3.zip` (the user-designated source of truth). This release is a source-derived, additive upgrade; it does not claim that a remote database or deployment was changed.

## Material fixes

1. **Pi withdrawal history is now a first-class section in Wallet → History → PI.** It loads the current authenticated account's latest 50 durable payout requests, separately from Pi purchase/payment intents and separately from the GHC ledger. The rows display status, request time, gross, fee, net, network, and provider transaction ID when available.
2. **History API uses a service-role-only, owner-scoped SECURITY DEFINER RPC.** The route authenticates the session, rate-limits per user, uses a fixed limit, returns a strict safe projection, validates identifiers/status/atomic-unit strings, and never returns the recipient Pi UID, idempotency key, or raw provider receipt. Client table access is not granted.
3. **Atomic amount display avoids floating-point rounding.** Withdrawal history formats PI atomic values with `BigInt`, preserving the 1e-7 PI unit scale.
4. **Ambiguous withdrawal outcomes no longer claim that no transfer started.** A network failure now tells the user the result may be unresolved, warns against creating another withdrawal, and directs them to history/status refresh. The sheet remains open for non-terminal accepted requests so the user can read the outcome instead of having the UI close over it.
5. **Release integrity and migration inventory updated.** Package, lockfile, app release metadata, and verified manifest are synchronized to `0.338.123`. The additive history RPC migration is registered as `REVIEW_REQUIRED` in the canonical migration inventory.

## Membership & rewards audit result

- Membership purchase controls still require authoritative server status before charging; purchase activation, renewal, expiry, entitlement checks, lifecycle history, and recovery remain server-owned. Lifecycle history stays read-only and does not grant access. Prepaid terms do not silently enable auto-renew.
- Rewards remain server-authoritative: claim/verification routes issue credits; mission completion alone does not mint GHC or Pi; rewards history remains account-scoped; pending/locked/under-review values are not represented as spendable; Pi cashback remains separate from GHC.
- The existing focused membership/rewards release and account-isolation gates passed. No membership pricing, entitlement, reward-issuance, payout, or balance policy was changed because the audited source contracts explicitly protect those boundaries.

## Validation performed

Source-level gates passed, including:
- New Run 396 Wallet/Payout/Membership/Rewards contract: **15/15**.
- Wallet security hardening **12/12**; Wallet Phase 1 **9/9**; Wallet Phase 2 history **11/11**; Wallet rewards transparency **9/9**; withdrawal journey **11/11**; Wallet Phase 5 release gate **19/19**.
- Pi A2U production-readiness contract **16/16**; wallet authorization **27/27**; wallet hardening follow-up **23/23**; wallet history foundation **20/20**; dual-asset wallet **11/11**; wallet completion **12/12**; transfer integrity **8/8**; Run 249 recovery/build guards **24/24**.
- Wallet ledger resilience **17/17**; cross-feature reconciliation **32/32**; membership release gate **16/16**; membership session safety **15/15**; membership consumer audit **8/8**.
- Rewards release gate **15/15**; rewards history **20/20**; wallet/rewards/membership closeout **43/43**; request guards **10/10**; achievement account isolation **6/6**; reward/payment contract **10/10**; reward adapters **13/13**; wallet transaction integration **41/41**.
- Migration source manifest **240/240** synchronized; migration inventory generator `--check` passed with **240** canonical migration files.

## Explicit limitations / release gates

- `20261125120000_run396_pi_payout_history_rpc.sql` is **source-only and REVIEW_REQUIRED**. It has not been applied to Supabase. Reconcile target migration history and validate clean replay, RPC grants, row ownership isolation, and returned fields on disposable PostgreSQL before an explicitly approved Testnet application.
- No live Pi Testnet withdrawal, provider receipt, authenticated two-account privacy test, Supabase mutation, GitHub push, or Vercel deployment was performed.
- Dependencies are not installed in this extracted workspace; the environment is Node `22.16.0` while the project requires Node 24. Dependency-backed TypeScript, lint, Next production build, and browser/device acceptance remain outstanding. Static source checks are not a substitute for those gates.
- Keep payout flags fail-closed until the official Testnet A2U end-to-end, wallet funding, provider reconciliation, and recovery checks pass. This release does not enable Mainnet payouts or change any financial records.
