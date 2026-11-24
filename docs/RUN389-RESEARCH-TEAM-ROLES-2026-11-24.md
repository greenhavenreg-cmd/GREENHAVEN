# RUN389 — Research team collaboration and granular roles

**Package:** `gh-connect@0.338.110`  
**Baseline:** RUN388  
**Status:** Source-only; no deployment or database change.

## Delivered

- Added a centralized server-side capability matrix for owner, editor, reviewer and field-agent roles.
- Active membership is required. Invited, suspended, revoked, unknown and insufficient-capability members fail closed.
- Editors can read responses and analytics and attach their own authenticated evidence.
- Reviewers can read responses and analytics and review evidence only after the trusted scanner has marked it clean.
- Field agents receive no Research Studio response/analytics/evidence capabilities; their field workflow remains separately scoped.
- Project listing now includes the current user's active/invited collaborations while preserving owner-owned projects.
- Collaborator project metadata strips examination answer keys and scoring points.
- Added a team workspace for owner-controlled invitations, role changes, cancellation, suspension and reactivation; invitees can accept their own pending invitations.
- Evidence-content authorization is checked before revealing quarantine status.
- Exam and election management remains owner-only; collaborator UI hides those controls.

## Permission matrix

| Role | Responses | Analytics | Evidence | Team administration | Exam/election administration |
|---|---|---|---|---|---|
| Owner | Read | Read | Read, attach, review | Full | Full |
| Editor | Read | Read | Read, attach own uploads | None | None |
| Reviewer | Read | Read | Read, review clean evidence | None | None |
| Field agent | No Studio access | No | No | None | Field assignment only |

The server capability helper is authoritative. Hiding controls in the interface is supplementary and is never treated as authorization.

## Limits

- Membership is keyed by canonical GreenHaven user ID; invitation by email, Pi username or external identity is not supported.
- Field-agent membership alone does not create a field assignment or grant project data access. A separate assignment and Field Desk authorization remain required.
- Exam/election administration and project editing remain owner-only until their complete API surfaces adopt explicit capabilities.
- No migration was added; this increment uses the existing `gh_research_members` table and owner-scoped membership APIs. Live Testnet table availability/privileges still require acceptance.

## Verification

The RUN389 source contract covers the capability matrix, active membership checks, route enforcement, answer-key stripping, team UI and owner-only boundaries. Full Node 24.15.0 dependency-backed typecheck/lint/build and live two-account/IDOR/Pi Browser acceptance remain required. No database migration, GitHub push, Vercel deployment, payment, Production or Mainnet action occurred.
