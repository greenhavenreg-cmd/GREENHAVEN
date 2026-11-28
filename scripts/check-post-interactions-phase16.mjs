#!/usr/bin/env node
import fs from "node:fs"
import assert from "node:assert/strict"

const read = (path) => fs.readFileSync(path, "utf8")
const comments = read("components/ghc/comment-sheet.tsx")
const hook = read("hooks/use-dialog-a11y.ts")
const card = read("components/ghc/enhanced-post-card.tsx") + "\n" + read("components/ghc/post-action-bar.tsx")
const pkg = JSON.parse(read("package.json"))
const lock = JSON.parse(read("package-lock.json"))
const checks = [
  ["comment attachments open a full-size image preview", comments.includes('setMediaPreview({ url: m.url, alt: `Photo attached by ${c.authorName}`, kind: "image" })')],
  ["comment video attachments open an accessible player preview", comments.includes('kind: "video" })} className="flex min-h-20') && comments.includes("controls autoPlay playsInline")],
  ["attachment preview exposes a separate download action", comments.includes("downloadMedia(mediaPreview.url, { kind: mediaPreview.kind })")],
  ["attachment preview preserves media aspect ratio", comments.includes("max-h-[82dvh] max-w-full rounded-lg object-contain")],
  ["Escape closes the nested preview before the comments sheet", /useDialogA11y<HTMLDivElement>\(Boolean\(mediaPreview\), \(\) => setMediaPreview\(null\)\)/.test(comments) && /useDialogA11y<HTMLDivElement>\(open, onClose\)/.test(comments)],
  ["preview traps its own keyboard focus and restores focus", /ref=\{mediaPreviewRef\}/.test(comments) && /data-comment-media-preview-close/.test(comments) && /scrollLockCount/.test(hook) && /opener/.test(hook)],
  ["comments sheet traps keyboard focus without stealing nested preview focus", /ref=\{dialogRef\}/.test(comments) && /dialogStack\[dialogStack\.length - 1\] !== token/.test(hook)],
  ["comment loading uses an announced skeleton instead of a false empty state", comments.includes('role="status" aria-live="polite"') && comments.includes("commentsLoading && tree.length === 0")],
  ["comment image previews are explicitly labelled for assistive technology", comments.includes("View photo attached by ${c.authorName}")],
  ["comment text and attachment gallery use valid block structure", comments.includes('<div className="mt-0.5 text-sm text-foreground">') && comments.includes('<p className="whitespace-pre-wrap">{c.text}</p>')],
  ["curation actions use concise product language", card.includes("Community curation") && !card.includes("Vote on contribution quality")],
  ["release, lockfile and verification registrations are synchronized", pkg.version === lock.version && lock.version === pkg.version && lock.packages?.[""]?.version === pkg.version && read("lib/app-release.ts").includes(`APP_RELEASE_VERSION = "${pkg.version}"`) && pkg.scripts['prebuild:checks'].includes("check-post-interactions-phase16") && pkg.scripts["verify:static"].includes("check-post-interactions-phase16")],
]
for (const [name, passed] of checks) {
  assert.equal(passed, true, name)
  console.log(`PASS ${name}`)
}
console.log(`Post interactions Phase 16: ${checks.length}/${checks.length} passed`)
