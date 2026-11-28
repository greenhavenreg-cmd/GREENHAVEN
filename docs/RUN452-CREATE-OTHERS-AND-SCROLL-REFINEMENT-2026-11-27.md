# RUN452 — Create Others menu and scroll refinement

Release: `gh-connect@0.338.164`  
Baseline: exact RUN451 archive (`0.338.163`)

## Changes

- Added a private account-shell `Create → Others` submenu.
- Drafts and creator activity open the existing account-scoped Creator Studio overlay.
- Saved posts routes to the existing saved-feed filter, with a current-account identity check before switching the feed.
- Stories reuses the existing story creator event; no second story implementation was introduced.
- Bounded the Create sheet to the dynamic viewport and made its content independently scrollable with a sticky header.
- Standardized app scroll surfaces for native touch momentum, vertical pan plus pinch zoom, non-scripted scrolling, scroll anchoring and scroll padding.
- Added a focused regression gate registered once in both static and prebuild pipelines.

## Scope and limitations

This is a targeted navigation and interaction refinement, not a claim that every Community, Marketplace, Discover, Messaging, Cart, Profile, Wallet, Rewards, Curation or Membership workflow has been exhaustively audited or made production-ready. Existing feature implementations are preserved. Archived-post management, scheduled publishing and additional story-library management were not invented where no complete durable owner-scoped workflow was found.

## Verification

- RUN452 focused contract: 7/7 passed.
- RUN451 activation contract: run separately during release verification.
- ZIP integrity and release metadata: verified at packaging.
- Full static suite, full prebuild suite, TypeScript and Next.js production build are not certified by this targeted run.

No database migrations, provider transactions, GitHub pushes or Vercel deployments were performed.
