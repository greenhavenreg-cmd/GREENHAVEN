# Upgrade worklog — 0.338.110 / RUN389

RUN389 adds a server-enforced Research collaboration model on top of RUN386 response pagination, RUN387 descriptive analytics and RUN388 scheduled studies/atomic quotas.

## Coordinated implementation steps

1. Centralize Research role-to-capability mapping in a server-only access helper.
2. Require active membership for collaborator access; invitations and suspended/revoked rows never authorize.
3. Grant editors response/analytics read and own-evidence attachment only.
4. Grant reviewers response/analytics read and review of scanner-cleared evidence only.
5. Keep field agents outside Research Studio data capabilities; field assignment remains separate.
6. Include active and invited collaborations in the project workspace.
7. Strip answer keys and scoring points from collaborator project metadata.
8. Add owner-controlled member invitations, role changes, suspension, reactivation and cancellation.
9. Allow invitees to accept only their own pending invitation.
10. Enforce evidence-content authorization before returning quarantine-state errors; preserve owner-only exam/election administration.

## Verification

- RUN385: 19/19.
- RUN386: 17/17.
- RUN387: 14/14.
- RUN388: 16/16.
- RUN389: 21/21.
- Full static verification: 63/63.
- Production-safety scan: 21/21.
- Secret-pattern scan: zero potential values across 2,804 text files.

**Source-only verification scope:** the focused checks validate source contracts and do not certify live PostgreSQL behavior, runtime type safety or deployment acceptance.

## Release limits

The RUN388 atomic quota migration remains REVIEW_REQUIRED and unapplied; its calling code must not be deployed before Testnet migration validation/application. Current runtime is Node 22.16.0; project requires Node 24.15.0 (`^24.15.0`) and dependencies are not installed. Full Node 24 typecheck/lint/build, live Testnet/PostgreSQL/Pi Browser acceptance, two-account and IDOR testing, scanner-provider acceptance, accessibility, performance, load and recovery testing remain outstanding. No GitHub push, Vercel deployment, Supabase migration, database write, Production or Mainnet action occurred. Production remains NOT APPROVED.


## RUN390 follow-up

RUN390 (`0.338.111`) repairs the missing live Testnet service-role SELECT grants behind Membership, feed mute privacy and Marketplace listing/variant catalog reads. See `docs/RUN390-MEMBERSHIP-FEED-MARKETPLACE-READ-REPAIR-2026-11-24.md`. The migration remains REVIEW_REQUIRED and unapplied.
