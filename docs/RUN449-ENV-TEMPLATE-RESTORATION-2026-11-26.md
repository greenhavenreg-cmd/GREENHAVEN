# RUN449 — Root environment template restoration

**Package:** `gh-connect@0.338.161`  
**Parent candidate:** RUN448 / `0.338.160`  
**Date:** 26 November 2026

## Vercel-reported failure

The supplied RUN448 Preview log executed the first four prebuild checks successfully, then RUN444 failed at check 5/469 with `ENOENT: no such file or directory, open '.env.example'`. The archive therefore omitted a required root template even though `.gitignore`, `.vercelignore`, the environment-variable documentation, and existing release gates explicitly retain and require it.

## Repair

- Restored the credential-free root `.env.example` from the RUN444 source archive.
- Preserved blank values for privileged credentials, including Supabase service-role, Pi server API, Pi wallet seed, payout executor and cron secrets.
- Preserved fail-closed generic defaults: Pi A2U and earnings payout request/execution switches remain disabled (`0`).
- Kept `config/testnet-payments.env.example` separate as the explicit Testnet Preview activation profile; it is not copied into the generic template.
- Added `check-run449-env-template-restoration.mjs` and registered it in both static verification and prebuild checks.
- Bumped the package/release identity to `0.338.161`.

## Verification boundary

The focused RUN449 contract, RUN444 9/9 contract, RUN337 7/7 environment/audit contract, RUN332 16/16 contract, RUN448 regression, release hygiene 17/17 and project-truth 11/11 passed in the local source workspace. A full supported-runtime prebuild, TypeScript check and Next.js build still require a fresh Vercel Preview run.

The same supplied logs report 22 npm audit findings (1 critical, 13 high, 6 moderate, 2 low) and a separate dependency-security gate failure. The advisory JSON/report was not supplied, and this workspace cannot reach the npm registry to retrieve it. No dependency versions were guessed or force-upgraded, and the security gate remains fail-closed. Attach the `npm-audit.json` artifact from the failed GitHub Actions run for advisory-specific remediation.

No remote Git push, Vercel deployment, database mutation, provider transaction or Mainnet operation occurred. Production remains NOT APPROVED.
