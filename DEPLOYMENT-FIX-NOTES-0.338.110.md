# GreenHaven 0.338.110 — deployment fix notes

## Scope
This archive contains a narrowly scoped source correction for the Vercel Testnet/Preview build failure reported on 2026-11-21. No database migrations, Supabase schema/data, environment variables, payment settings, Pi authentication logic, or production configuration were changed.

## Fix applied
- `lib/app-release.ts`: changed `APP_RELEASE_VERSION` from `0.338.109` to `0.338.110` so it matches `package.json` (`0.338.110`).

## Verification
- Ran `node scripts/check-phase5-runtime-acceptance.mjs` after the correction: **PASS — 15/15 checks**.
- The complete 411-check prebuild suite and Next.js production build were not run in this workspace. The archive requires Node `^24.15.0` (see `package.json` / `.nvmrc`); the available local runtime was Node `22.16.0`, and dependency installation did not complete within the available execution window.

## GitHub Desktop instructions
1. Extract this ZIP.
2. In GitHub Desktop, open the existing `GREENHAVEN` repository.
3. Switch to the `testnet` branch.
4. Copy the contents of the extracted project root into the repository working directory, replacing files when prompted. Do not copy any local `node_modules` or `.next` folders.
5. Review the diff. The intended source-code change is only the one-line release version correction in `lib/app-release.ts`; this archive also adds this note file.
6. Commit and push to `testnet` only. Do not merge into `main` as part of this repair.
7. Let Vercel create the Preview deployment and inspect the next build log for the next check, if any.
