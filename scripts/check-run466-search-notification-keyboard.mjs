import { readFileSync } from "node:fs"
const read = (p) => readFileSync(p, "utf8")
let failures = 0
const assert = (ok, msg) => { if (!ok) { failures += 1; console.error(`FAIL: ${msg}`) } }

const keys = read("lib/ui/tablist-keys.ts")
for (const k of ["ArrowLeft", "ArrowRight", "Home", "End"]) assert(keys.includes(`"${k}"`), `tablist helper handles ${k}`)
assert(/tab\.focus\(\)/.test(keys) && /tab\.click\(\)/.test(keys), "tablist helper moves focus and activates the tab")

const bell = read("components/ghc/notification-bell.tsx")
assert((bell.match(/onKeyDown=\{onTablistKeyDown\}/g) || []).length === 2, "both bell tablists use the shared keyboard model")
assert(!/setBucket\(ids\[\(idx \+ 1\) % ids\.length\]\)/.test(bell), "bell no longer changes selection without moving focus")
assert(/tabIndex=\{active \? 0 : -1\}/.test(bell), "bell focus tabs use roving tabindex")

const search = read("components/ghc/global-search.tsx")
assert(/role="tablist" aria-label="Search categories" onKeyDown=\{onTablistKeyDown\}/.test(search), "global search categories are a keyboard tablist")
assert(/role="tab"/.test(search) && /aria-selected=\{tab === t\}/.test(search), "global search category buttons are tabs")
assert(/aria-label="Search outcome" aria-live="polite"/.test(search), "global search outcome is announced")

const bar = read("components/ghc/search-bar.tsx")
for (const [re, msg] of [
  [/role="combobox"/, "role=combobox"], [/aria-expanded=\{listOpen\}/, "aria-expanded"], [/aria-controls=\{listId\}/, "aria-controls"],
  [/aria-activedescendant=/, "aria-activedescendant"], [/event\.key === "ArrowDown" \|\| event\.key === "ArrowUp"/, "arrow navigation"],
  [/aria-selected=\{index === activeIndex\}/, "option selection state"],
]) assert(re.test(bar), `search bar ${msg}`)
assert(!/aria-selected="false"/.test(bar), "search bar options no longer hard-code aria-selected=false")

assert(/-webkit-search-cancel-button/.test(read("app/globals.css")), "native search clear button hidden (custom clear buttons exist)")
const plural = read("lib/ui/plural.ts")
assert(/n === 1 \? singular : pluralForm/.test(plural), "plural helper")
assert(/resultCount === 1 \? "result" : "results"/.test(read("components/ghc/filtering/filter-panel.tsx")), "filter result count is pluralised")

if (failures) { console.error(`RUN466 check failed: ${failures} assertion(s)`); process.exit(1) }
console.log("RUN466 search, notification keyboard and count-label contract passed")
