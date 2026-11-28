# RUN479 — community role change truth

**Baseline:** RUN478. Source candidate only — NOT APPROVED for production. No migration, economics or layout change.

## Findings and fixes
1. **Role changes looked saved when the server rejected them.** `setGroupRole` changed the role in the local community domain first, then sent the durable `POST /api/communities/[id]/roles` inside a try/catch that never read the response. A 403 (not an owner/admin, self-role, owner target), a 400 or a 503 still produced the local role change and a "Role updated" toast, and the role reverted on reload or on another device. The handler is now server-first, matching member removal: the request is bounded to 10 seconds and sends the session; nothing changes locally unless the server answers ok and durable. A 403 shows a permission message, other rejections and network failures show an error, and the local mirror uses the role the server confirmed. If the server saved the role but the local domain mirror refuses it, the user is told the role was saved instead of seeing a failure.
2. **Owner promotion stays impossible from the client.** An owner request is still sent as admin; the previous code applied "owner" locally while the server stored admin, so the two could disagree. The local mirror now takes the confirmed server role.

## Behaviour change to review
Role changes now require the durable community store. In a Studio or offline session with no durable store the change is refused with an error instead of being applied locally, the same as member removal today.

## Verification
`check-run479-community-role-truth.mjs` (10 checks) passes and the full `verify:static` suite is run on this bundle. Not run: typecheck, lint, build, browser, live Testnet (no installed dependencies or network in this environment).

## Not done
Challenge cancel after a failed publish is still best-effort (the user already sees "Could not publish challenge"). UI, layout and design work remains open and needs a build environment to verify visually.
