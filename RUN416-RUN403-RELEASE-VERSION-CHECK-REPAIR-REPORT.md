# Run 416 — Run 403 Release-Version Check Repair

Date: 2026-11-25
Project version: 0.338.137

## Failure

Vercel stopped at prebuild check 438/445 in `scripts/check-run403-reward-card-visible.mjs`. Five reward-visibility checks passed, but the version agreement check failed because the checker still hard-coded `0.338.132` while the package, lockfile, and app release had already advanced to `0.338.137`.

## Change

Updated the check to validate that `package.json` has a string version and that `package-lock.json`'s top-level version, lockfile root package version, and `lib/app-release.ts` version all match it. This preserves the consistency gate without pinning it to an obsolete historical release.

No product behavior, reward logic, financial state, migrations, dependency versions, or environment settings were changed.

## Verification

The targeted Run 403 check was executed against this source after the change. Full 445-check prebuild and Next.js build still need to be confirmed by Vercel; this repair does not claim that the entire build passes.
