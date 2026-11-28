# RUN514 — One-line post actions and compact story rail (2026-11-28)

## Post card
The action area used a vote pill, a Quality chip, an info button and a three-column Comment/Save/Share grid on a second row, plus a permanent approval meter. It took roughly a third of the card.

New contract (`components/ghc/post-action-bar.tsx`, wired in `enhanced-post-card.tsx`):
* **One line:** Vote · Quality · Comment · Save · Share, non-wrapping (`gh-post-action-line`), 44px touch targets, icons only for Save/Share.
* **Vote button:** tap = social like (and opens the reaction tray, which closes itself after 6 s). Tap never submits a curation vote.
* **Hold (450 ms), right-click, or the Quality chip (keyboard route)** opens **Community curation**: upvote/downvote (server-confirmed, unchanged `handleCuration`), quality weight 0–100%, approval meter and the voter roster (hold or right-click a vote button there).
* Curation still never issues GHC by itself; reward and redistribution handling is unchanged.

## Story rail
Story cards shrank from 104×158 to 88×128 px so the feed content starts higher. Viewer, creator and audience logic are unchanged.

## Verification
`verify:static` (513 commands) passes. Checks that encoded the old layout or the old per-route env strings were updated to the new contract; `check-run514-one-line-post-actions.mjs` pins the new behaviour. Not covered: typecheck, lint, production build and device testing (Node 22 here, packages not installable).
