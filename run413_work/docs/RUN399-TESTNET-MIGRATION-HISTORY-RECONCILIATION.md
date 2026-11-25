# Read-only Testnet migration-history reconciliation — Run 399

**Observed:** 2026-11-25 against the connected GH Connect Testnet project.
**Scope:** read-only comparison of the database's 47 recorded `supabase_migrations.schema_migrations` rows against the current 242-file source migration directory. No migration was applied, edited, or marked as applied by this report.

## Result

- **47** migration-history rows are recorded in the connected database.
- **242** SQL migration files are present in the current source archive.
- **16** database rows have a source filename with the exact same 14-digit version prefix. This is filename-level correspondence only; it does not prove deployed SQL content is identical.
- **11** rows have a normalized filename-name candidate but a different version prefix. These are candidates for manual SQL diff, not confirmed equivalents.
- **20** rows have no exact version or normalized filename match in the source migration directory. They require comparison against canonical install SQL, actual database function/table definitions, and any historical source archives.

Two source-name groups appear more than once in database history (`remove_verified_duplicate_indexes` and `rls_policy_dedup_and_initplan_optimization`) but each has only one current filename candidate. Do not collapse or re-mark these rows without verifying exact SQL and the intended migration ledger semantics.

## Safety decision

The mismatch is **not safely resolved** by comparing counts alone or by blindly replaying all 242 source files. Do not apply the Run 397 100 PI registration reward or referral migrations, and do not run the backfill, until each unresolved record is mapped to exact SQL provenance and the live database schema/function contracts are checked. Never use a source migration manifest to assert that a migration was applied remotely.

The full row-by-row candidate mapping is in `RUN397-TESTNET-MIGRATION-HISTORY-RECONCILIATION.csv`. A source filename match is explicitly not a cryptographic/content equivalence claim.
