# Upgrade worklog — 0.338.164 / RUN452

1. Extracted and used the exact RUN451 `0.338.163` source archive as the baseline.
2. Inspected the uploaded 541513.mp4 screen recording and traced the existing Create hub, unified composer, Creator Studio, saved-feed filter, story creator and app scroll roots.
3. Added the private Create → Others submenu without creating duplicate composer or story systems.
4. Wired Drafts and Creator activity to the existing Creator Studio; Saved posts to the existing account-scoped saved filter; Stories to the existing story creator.
5. Added an owner-identity check before switching to the saved-posts view.
6. Bounded the Create sheet using dynamic viewport sizing, independent scrolling and a sticky header.
7. Applied native mobile momentum and predictable vertical scrolling defaults to app scroll surfaces, avoiding scripted smooth-scroll animations on long lists.
8. Added RUN452 regression checks to static verification and prebuild checks; updated release metadata and worklog.

## Acceptance boundary

RUN452 focused contract passed 7/7. This does not certify every app module as production-ready, nor does it establish end-to-end provider, database, browser, accessibility or performance acceptance. Full static/prebuild, TypeScript and Next.js production build remain to be run in the project’s Node 24 Vercel environment. No remote systems or financial providers were changed.
