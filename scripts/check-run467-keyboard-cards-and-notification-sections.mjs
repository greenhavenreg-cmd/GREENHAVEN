import { readFileSync } from "node:fs"
const read = (p) => readFileSync(p, "utf8")
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } }

const keys = read("lib/ui/activate-keys.ts")
assert(/role: "button" as const/.test(keys) && /tabIndex: 0/.test(keys), "activatable helper gives role=button and one Tab stop")
assert(/event\.key === "Enter" \|\| event\.key === " "/.test(keys), "activatable helper handles Enter and Space")
assert(/event\.target !== event\.currentTarget/.test(keys), "activatable helper ignores keys from nested controls")

const discovery = read("components/ghc/discovery-components.tsx")
assert((discovery.match(/activatableProps\(/g) || []).length >= 3, "discovery cards are keyboard activatable")
assert(/aria-label=\{`Message \$\{c\.name\}`\}/.test(discovery), "nearby message button has an accessible name")
assert(!/<div key=\{c\.id\} onClick=\{\(\) => onViewProfile\(c\)\}/.test(discovery), "no mouse-only discovery rows remain")

assert(/activatableProps\(onClick, safeAlt\)/.test(read("components/ghc/lazy-image.tsx")), "clickable image fallback is keyboard activatable")
const pager = read("components/ghc/pagination.tsx")
assert(/aria-label="Previous page"/.test(pager) && /aria-label="Next page"/.test(pager), "pagination arrows are named")
assert(/aria-pressed=\{Boolean\(isBookmarked\)\}/.test(read("components/ghc/feed-components.tsx")), "bookmark toggle exposes pressed state")
assert(/aria-label="Open photo library"/.test(read("components/ghc/profile-screen.tsx")), "profile photo tiles are named")

const bell = read("components/ghc/notification-bell.tsx")
assert(/dateBucketOf\(n\.timestamp, liveNow\)/.test(bell) && /DATE_BUCKET_LABEL\[threadBucket\]/.test(bell), "bell list has Today/Yesterday/Earlier section headers")
assert(/readFilter === "priority" \? null/.test(bell), "date headers are skipped for the ranked Priority view")
assert(/THREAD_PAGE_SIZE/.test(bell) && /visibleThreads\.map/.test(bell) && /hiddenThreadCount > 0/.test(bell), "bell renders threads progressively with a Show more control")
assert(/setVisibleThreadCount\(THREAD_PAGE_SIZE\)/.test(bell), "bell resets the page size when the filter changes")

const settings = read("components/ghc/settings.tsx")
assert(/function AgeBoundInput/.test(settings) && /onBlur=\{commit\}/.test(settings), "age range uses a committed draft input")
assert((settings.match(/<AgeBoundInput /g) || []).length === 2, "min and max age both use the draft input")
assert(!/handleSelect\("ageMin", parseInt\(e\.target\.value/.test(settings), "age range no longer clamps on every keystroke")

if (failures) { console.error(`RUN467 check failed: ${failures} assertion(s)`); process.exit(1) }
console.log("RUN467 keyboard cards and notification sections contract passed")
