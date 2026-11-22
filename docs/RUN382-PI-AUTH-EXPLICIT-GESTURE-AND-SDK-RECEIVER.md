# RUN382 — Pi authentication gesture and SDK receiver repair

## Scope

This patch is based on the authoritative `0.338.112` project archive and is limited to the Pi authentication bootstrap and its regression gates.

## Changes

- Page mount no longer calls the general authentication initializer. It only prepares the Pi SDK when a Pi Browser / Sandbox runtime is detected and displays an explicit sign-in action.
- Pi SDK `init` and `authenticate` are invoked with the SDK object as their JavaScript receiver (`.call(Pi, ...)`) to preserve host-bridge context.
- The sign-in-ready state is presented as “Ready to sign in” rather than a failed-login state.
- Added RUN382 regression coverage and registered it in the prebuild checks.
- Updated RUN353 expectations for the stricter mount-only bootstrap.

## Preserved safeguards

- Normal Pi sign-in requests the `username` scope only.
- Server-side access-token verification through `/api/auth/pi` remains mandatory.
- The existing single-flight guard, finite 25-second authentication timeout, token-free diagnostics, Sandbox/Testnet restrictions, and disabled local identity fallback on Vercel remain intact.
- No Pi credentials, Supabase data, migrations, payout controls, Mainnet settings, GitHub branches, or Vercel deployments were changed.

## Validation

The following targeted checks passed in the working tree:

- RUN382 explicit gesture / SDK receiver: 9/9
- RUN353 Pi auth root-cause: 16/16
- RUN371 Pi CDN Sandbox gesture: 11/11
- RUN343 Pi auth timeout: 8/8
- RUN344 Pi auth diagnostics UX: 10/10
- RUN342 Pi auth scope isolation: 6/6
- RUN318 Pi auth reliability: 11/11
- RUN370 Pi auth rejection metadata: 7/7
- RUN373 actionable auth rejection: 8/8
- JSX safety: 1,177 files scanned
- Project script integrity: 1,213 command entries
- Testnet profile safety: 13/13

The complete 413-check prebuild suite was enumerated in dry-run mode; it was not executed as a full suite in this environment.
