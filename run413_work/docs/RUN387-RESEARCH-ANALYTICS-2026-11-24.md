# RUN387 — Research descriptive analytics

**Package:** `gh-connect@0.338.108`  
**Baseline:** RUN386  
**Status:** Source-only candidate; no deployment or database changes.

## Delivered

- Authenticated, project-owner-scoped analytics endpoint.
- Frozen request-time inclusion boundary and deterministic server-side pagination.
- Bounded analysis of up to 20,000 responses; reports exact/unknown population count and whether coverage is complete or a bounded sample.
- Review-status summaries; numeric count, min, max, mean, median and population standard deviation; choice distributions; valid date ranges.
- Small categorical groups under five observations are suppressed.
- Free-text answer content is never returned in analytics payloads.
- Research Studio analytics panel with explicit coverage and descriptive-statistics caveats.

## Important limitations

- These are descriptive summaries, not inferential statistics, causal claims, survey weighting or claims of population representativeness.
- Geographic analysis is not enabled because the current general response schema does not provide a canonical, normalized, consent-governed geography field for every study. Election-observation geography remains a separate typed dataset and should not be conflated with free-text location answers.
- The 20,000-response cap is a deliberate synchronous endpoint bound. Larger studies require an asynchronous export/analytics job with durable job state and private artifact storage.
- Concurrent changes to review status during the read may be reflected at page-read time; this is not a transactionally consistent database snapshot.

## Verification

`node scripts/check-run387-research-analytics.mjs` verifies the source contracts. Full Node 24.15.x typecheck/lint/build and live Pi Browser/PostgreSQL acceptance remain release gates. No migration was added or applied.
