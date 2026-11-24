# Field Research — Pi-authenticated access policy

**RUN380 supersedes the former public/access-code Field Desk design.** The old instructions for all-browser participation, shared access codes, `gh_field_session`, and `Authorization: Field` tokens are historical and must not be used.

## Current access requirement

Field Research is available only inside the Pi-authenticated GreenHaven application. A Pioneer must:

1. Open GreenHaven in Pi Browser.
2. Complete official Pi SDK authentication.
3. Have the Pi access token verified server-side by Pi Platform.
4. Establish a durable GreenHaven session mapped to the canonical Pioneer identity.

A field URL, report link, client-provided label, user-agent, shared code or local-storage value does not grant access.

## Current routes

| Method | Path | Authorization |
|---|---|---|
| GET | `/api/field/session` | Durable GreenHaven Pioneer session |
| DELETE | `/api/field/session` | Retired; sign out through `/api/auth/logout` |
| POST | `/api/field/unlock` | Retired; returns HTTP 410 |
| POST | `/api/field/report` | Durable GreenHaven Pioneer session |
| GET | `/api/field/surveys` | Durable GreenHaven Pioneer session |
| POST | `/api/field/reports/:id/evidence/intent` | Durable session and exact report scope |
| POST | `/api/field/reports/:id/evidence/complete` | Durable session and exact report scope |
| GET/PATCH | `/api/field/admin/evidence` | Durable session plus configured administrator identity |
| GET | `/api/field/admin/reports` | Durable session plus operator diagnostic authorization |

## Evidence and persistence

Field evidence scope IDs are derived server-side from the canonical Pioneer ID and verified GreenHaven session ID. Durable field reports require the scoped `gh_field_report_append_scoped` RPC. The implementation fails closed if that scoped persistence contract is unavailable; it does not fall back to an unscoped legacy report write. The scoped evidence migration remains subject to the repository's migration review and target-history reconciliation process.

Evidence remains quarantined until the configured trusted scanner attests that the stored SHA-256 digest is clean. File-signature checks alone are not malware scanning.

## Retired configuration

Do not configure or restore `GHC_FIELD_ACCESS_CODES`, `GHC_FIELD_ACCESS_CODE_HASHES`, or `GHC_FIELD_SESSION_SECRET`. The former shared-code unlock route and field-token cookie are no longer an authorization path.
