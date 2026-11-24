/** Release identity; session integrity and release gates are versioned with this source. */
export const APP_RELEASE_VERSION = "0.338.119"

/** Concise, privacy-safe release note shown in the authenticated in-app update notice. */
export const APP_RELEASE_SUMMARY =
  "Completes Phase 9 coordinated acceptance for progressive onboarding, canonical Pi identity, explicit withdrawal-wallet consent and private Supabase media storage. Adds a consolidated release gate across returning-user classification, verified username synchronization, optional profile completion, wallet proof boundaries, owner-scoped media and reproducible Storage provisioning. Source-only candidate; Node 24.15+ typecheck/build, live Testnet/Mainnet and device acceptance remain outstanding. No live database, Storage, financial, Git push or deployment action was performed."
