# RUN486 — public research form and election panel control names

**Baseline:** RUN485. Source candidate only — NOT APPROVED for production. No migration, economics, ledger, authentication or API change.

## Findings and fixes
1. **Public research form (unauthenticated respondents):** each question's text was a `<label>` that closed before the control and was never associated with it, so screen readers announced the text box, date, number, rating and dropdown controls without a name, and choice questions without a question. Each single-control question now has a stable sanitized DOM id (`rq-…`), the label links to it with `htmlFor`, and radio/checkbox groups are exposed as `radiogroup`/`group` labelled by the question. Answers, validation (`required`) and the submit payload are unchanged.
2. **Election panel (research studio):** the contest type select, election date input and member role select had no accessible name; they now have "Contest type", "Election date" and "Member role".

## Reviewed, no change needed
All other field-research controls are wrapped by a visible `<label>` or already carry `aria-label` (candidate vote counts, registered/accredited voters, study settings, exam settings, team and response filters). Evidence file inputs are inside visible "Add file" labels.

## Verification
`check-run486-research-form-labels.mjs` (8 checks) and the full `verify:static` suite pass; edited files parse. Not run: typecheck, lint, build, browser or screen-reader testing, so the new associations have not been exercised in a real assistive technology.

## Not done
Choice questions are still not natively `required` (server validation applies); the rating input has no visible "0–5" hint. Both are behaviour/design changes to review with a build and test environment.
