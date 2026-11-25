# Upgrade worklog — 0.338.111 / RUN390

RUN390 addresses the three failures reported from the Testnet Preview screenshots by repairing the exact live database privilege gaps rather than hiding the errors or weakening client privacy.

1. Inspected the supplied Membership, Feed and Marketplace screenshots.
2. Traced Membership status to the authoritative `ghc_membership_entitlements` read path.
3. Traced `FEED_PRIVACY_FILTER_UNAVAILABLE` to the mandatory server-side `gh_user_mutes` read.
4. Traced Marketplace server catalog failure to server-side PostgREST reads of `gh_marketplace_listings` and `gh_marketplace_variants`.
5. Queried the connected Testnet PostgreSQL privilege catalog. All four tables lacked `service_role` SELECT while client SELECT was denied and RLS remained enabled.
6. Confirmed the relevant Membership and Marketplace SECURITY DEFINER RPCs already grant EXECUTE to `service_role` and deny `anon`/`authenticated`.
7. Added a versioned, guarded migration that preserves RLS, explicitly denies all client table privileges, and grants only SELECT to `service_role`.
8. Added an 11-case static contract and registered it in `verify:static` and `prebuild:checks`.
9. Regenerated the migration source inventory, verified manifest, checklist and Testnet apply order.
10. Synchronized package, lockfile, in-app release metadata and current source documentation to `0.338.111`.

## Verification

- RUN390 least-privilege read repair: 14/14.
- Migration source manifest: 239/239.
- Migration checklist, verified manifest, CSV manifest and Testnet apply order: synchronized.
- Full static verification: PASS 63/63. A malformed in-app release summary and stale historical release assertions were repaired as part of synchronizing the current release metadata.
- No database migration applied; no records or balances changed.
- No GitHub push or Vercel deployment; Node 24.15.x dependency-backed build/lint/typecheck and authenticated Pi Browser acceptance remain outstanding.
- Production, Mainnet and financial records untouched.

Verification is source-only: the static contracts and migration inventory do not prove that a deployment or database migration is live. A dependency-backed typecheck, lint and Next.js production build on **Node.js 24.15.0** remain required before release.

The current results are a **source-only verification scope** and must not be represented as live deployment acceptance.
