/** Release identity; session integrity and release gates are versioned with this source. */
export const APP_RELEASE_VERSION = "0.338.111"

/** Concise, privacy-safe release note shown in the authenticated in-app update notice. */
export const APP_RELEASE_SUMMARY =
  "RUN390 repairs the Testnet server-side read permissions behind Membership status, feed mute privacy filtering and Marketplace listing/variant catalogs. The migration grants service_role SELECT only on four server-only tables, preserves RLS and denies client table access; it is REVIEW_REQUIRED and unapplied. Existing Pi and GHC membership purchase flows remain server-authoritative and require confirmed membership status, completed/catalog-bound payment and atomic idempotent fulfillment. RUN386–RUN389 Research improvements remain in place. No payment, balance, entitlement, listing or mute records were changed. No GitHub push or Vercel deployment has occurred. Node 24.15.x dependency-backed build and live Pi Browser acceptance remain outstanding. Production and Mainnet remain untouched."
