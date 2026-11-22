# GH-CONNECT 0.338.112 recovery package

This package is based on the authoritative `GREENHAVEN-0_338_112-P1B-REGISTER-AND-PREBUILD-FIX-2026-11-22.zip` archive and carries forward the Pi authentication surgical changes prepared for the `testnet` branch.

## What this package corrects

- Restores the RUN382 Pi-auth regression-check script referenced by `package.json` but omitted from the previous recovery ZIP.
- Keeps the RUN382 check registered as prebuild check 413; it is not disabled or removed.
- Includes the Pi authentication changes and the full project source from the authoritative archive, including `lib/app-release.ts`.
- Retains the existing Testnet and financial safety gates.

The earlier recovery note incorrectly attributed the missing `lib/app-release.ts` report to a deletion of the entire `lib/` tree in the authoritative archive. Inspection of the uploaded baseline confirms that the file and the `lib/` source tree are present there. The deployed commit and local archive should still be compared if Vercel reports another missing source file.

## Validation performed for this correction

- All 413 prebuild manifest commands resolve to existing local scripts.
- Project script integrity check passes: 1,213 command entries, no duplicate commands or missing local script references.
- RUN382 Pi authentication regression: 9/9 passed.
- RUN353 Pi authentication root-cause regression: 16/16 passed.
- RUN371 Pi CDN/Sandbox gesture contract: 11/11 passed.
- RUN343 Pi authentication timeout regression: 8/8 passed.
- RUN344 Pi authentication diagnostics UX: 10/10 passed.
- RUN370 Pi authentication rejection metadata: 7/7 passed.
- JSX safety: 1,177 files scanned, passed.
- Testnet profile safety: 13/13 passed.

The complete 413-check prebuild suite, TypeScript check, lint and Next.js production build have not been executed in this packaging environment. The project requires Node `^24.15.0`; run the full checks with Node 24.15 or later before pushing.

## Apply safely

1. Back up the current local repository.
2. Extract this archive.
3. Copy the **contents** of the extracted project folder into the root of the existing local Git repository, allowing files to be restored/overwritten.
4. Preserve the existing `.git/` directory. Do not nest the project folder inside the repository.
5. In GitHub Desktop, confirm that the RUN382 script exists at `scripts/check-run382-pi-auth-explicit-gesture-and-receiver.mjs` and that the deleted/missing project files are restored as appropriate.
6. Run `npm ci --legacy-peer-deps`, then `npm run prebuild`, `npm run typecheck`, `npm run lint`, and `npm run build` using Node 24.15+.
7. Only commit and push to `testnet` after checks pass.

This package does not push to GitHub, deploy to Vercel, modify Supabase, or touch Production/Mainnet credentials.
