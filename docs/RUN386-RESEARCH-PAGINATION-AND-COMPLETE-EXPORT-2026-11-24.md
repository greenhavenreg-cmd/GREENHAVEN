# RUN386 — Research response pagination and complete export

**Package:** `gh-connect@0.338.107`  
**Baseline:** RUN385  
**Status:** Source-only candidate; not deployed; database unchanged.

## Delivered

- Replaced the fixed 200-row research inbox query with deterministic keyset pagination.
- Uses `(submitted_at DESC, id DESC)` ordering and a validated opaque base64url cursor; timestamp ties cannot silently skip or duplicate rows.
- Enforces authenticated project-owner access, review-status allowlisting, 1–100 page sizes, no-store responses, rate limiting and a 2 MiB response ceiling.
- Returns page metadata (`hasMore`, `nextCursor`, total when PostgREST returns exact count metadata).
- Research Inbox loads the first 50 rows and supports explicit continuation without duplicate IDs.
- CSV export walks the complete cursor sequence before creating a file; any page failure aborts the export instead of creating a partial file. It retains spreadsheet formula-injection neutralization and caps browser-side exports at 20,000 responses.

## Deliberate limits

- The inbox remains owner-only. Existing `editor`, `reviewer` and `field_agent` membership labels are not treated as sufficient authorization until a server-side permission matrix is implemented consistently across every research route.
- The export cap is a browser safety bound, not a claim of unlimited export capability. Large-study asynchronous export jobs and object-storage delivery remain a separate stage.
- Search remains client-side over pages already loaded; this increment does not claim database-wide full-text search.
- Analytics and geographic aggregation are not included in RUN386.

## Verification

`node scripts/check-run386-research-pagination-export.mjs` verifies the source contracts. Full static/prebuild and dependency-backed Node 24.15.x typecheck/lint/build remain release gates. No migration was added or applied, no live database was changed, and no deployment or browser acceptance is claimed.
