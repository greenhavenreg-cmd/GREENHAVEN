# RUN510 — Database RPC source-drift guard

Status: guard and inventory only. No SQL added, no migration applied, production NOT APPROVED.

## Finding
Server code calls 239 `gh_*` / `ghc_*` RPCs. 20 of them have **no `CREATE FUNCTION` in `supabase/migrations`**. They may exist in the live Testnet/production database (earlier runs recovered migrations that were applied live but missing from the archive), but a clean rebuild from this repository would not have them, and the routes would return 503/`*_UNAVAILABLE`.

| Area | RPC |
|---|---|
| Calls | `gh_call_incoming_for_user` (incoming-call ringing) |
| Discovery | `gh_discovery_candidates` (privacy-filtered people discovery) |
| Communities | `gh_community_member_directory` |
| Marketplace addresses | `gh_marketplace_address_list`, `_save`, `_delete`, `_set_default` |
| Messaging | `gh_messaging_group_create_from_dm`, `gh_messaging_group_invite_respond`, `gh_messaging_share_own_contact` |
| Push | `gh_notification_push_subscription_list`, `_upsert`, `_revoke` |
| Research | `gh_research_election_tally_submit` |
| Sessions | `gh_session_issue_with_cap` |
| Outbox (proposal, intentionally unapplied) | `gh_outbox_claim`, `_ack`, `_fail`, `_heartbeat`, `_replay` |

## Why no SQL was written
Discovery, address and group-invite functions enforce privacy, ownership and block rules. Re-creating them without the live definitions risks weakening those rules, so they must be recovered from the live catalog (as RUN384 did for the call tables), reviewed, then added to `supabase/migrations`.

## Operator verification (read-only; run on Testnet, then production)
```sql
select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = any(array[
 'gh_call_incoming_for_user','gh_community_member_directory','gh_discovery_candidates',
 'gh_marketplace_address_list','gh_marketplace_address_save','gh_marketplace_address_delete',
 'gh_marketplace_address_set_default','gh_messaging_group_create_from_dm',
 'gh_messaging_group_invite_respond','gh_messaging_share_own_contact',
 'gh_notification_push_subscription_list','gh_notification_push_subscription_upsert',
 'gh_notification_push_subscription_revoke','gh_research_election_tally_submit',
 'gh_session_issue_with_cap']);
```
Any name missing from the result is a broken live feature. Any name present should have its definition exported with `pg_get_functiondef(oid)`, reviewed (SECURITY DEFINER, `search_path`, grants limited to `service_role`), and committed as a "RECOVERED SOURCE" migration.

## Guard
`scripts/check-run510-rpc-source-drift.mjs` (part of `verify:static`) fails when server code calls a new RPC that has neither a migration nor an entry in `KNOWN_SOURCE_GAPS`, and when a listed gap becomes stale. Remove entries as migrations are recovered.
