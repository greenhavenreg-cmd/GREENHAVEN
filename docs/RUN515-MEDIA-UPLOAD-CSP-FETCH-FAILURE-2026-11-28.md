# RUN515 — Media upload "Failed to fetch" (2026-11-28)

## Root cause
Every image path compresses the photo to a `data:` URL and then turned it into a file with `fetch(dataUrl).blob()` (composer, story composer, profile photo/cover, onboarding photo, group cover, media pipeline fallback). `fetch()` of `data:` and `blob:` URLs is governed by the page's CSP `connect-src`, and `vercel.json` listed only `'self'` plus named hosts. The browser rejected the request with `TypeError: Failed to fetch` before any upload began, so uploads failed on every surface.

## Fix
* `lib/media/data-url.ts` — `urlToBlob()` decodes `data:` URLs locally (no network, no CSP dependency); `blob:` URLs still use `fetch`.
* All seven call sites now use `urlToBlob`.
* `vercel.json` CSP: `connect-src` adds `data:` and `blob:` (neither can send data off-device); `media-src` adds `data:` and `https://*.supabase.co`. No other origin was widened.
* A rejected fetch to the signed storage URL now reports `STORAGE_UNREACHABLE` with a specific message (instead of a generic connection error), and the POST fallback no longer throws.

## Audited, unchanged
Server routes (`/api/media`, direct-upload intent/complete, bucket ensure, path policy, size limits, signed URL origin pinning, rate limits) are intact; the checks that cover them still pass.

## Operator note
If the Supabase project uses a custom domain (not `*.supabase.co`), add that origin to `connect-src` and `media-src` in `vercel.json`.

## Not verified
No browser or device run here (Node 22, no installs): confirm a photo, a story and an avatar upload after redeploying.
