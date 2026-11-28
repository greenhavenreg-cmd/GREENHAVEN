"use client"

import { useId, useState } from "react"
import { Search, X, Sliders } from "lucide-react"

export function SearchBar({
  onSearch,
  onSearchCommit,
  onFiltersClick,
  recentSearches = [],
  suggestionTerms = [],
}: {
  onSearch: (query: string) => void
  onSearchCommit?: (query: string) => void
  onFiltersClick: () => void
  recentSearches?: string[]
  suggestionTerms?: string[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = useId()

  const suggestions = (suggestionTerms.length
    ? suggestionTerms
    : ["Travel", "Photography", "Tech", "Gaming", "Music"]
  ).filter(
    (suggestion) =>
      !searchQuery ||
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const normalizedRecent = recentSearches.filter(
    (search, index, items) =>
      items.findIndex((item) => item.toLowerCase() === search.toLowerCase()) ===
      index
  )

  const visibleSearches = [
    ...normalizedRecent,
    ...suggestions.filter(
      (item) =>
        !normalizedRecent.some(
          (recent) => recent.toLowerCase() === item.toLowerCase()
        )
    ),
  ].slice(0, 6)

  const listOpen = isFocused && visibleSearches.length > 0
  const optionId = (index: number) => `${listId}-opt-${index}`

  const submitSearch = (value: string) => {
    setActiveIndex(-1)
    const nextValue = value.trim()
    setSearchQuery(nextValue)
    onSearch(nextValue)
    onSearchCommit?.(nextValue)
  }

  return (
    <div className="relative z-20 space-y-1.5 px-3 py-2 sm:space-y-2 sm:px-4 sm:py-2.5">
      <div className="flex items-center gap-2">
        <div
          className={`relative min-w-0 flex-1 rounded-[1.25rem] border bg-muted/40 transition-colors ${
            isFocused
              ? "border-primary/40 bg-card ring-2 ring-primary/20"
              : "border-border/70"
          }`}
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Try: Lagos · Tech · Mentorship"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setActiveIndex(-1)
              onSearch(event.target.value)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229) return
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                if (visibleSearches.length === 0) return
                event.preventDefault()
                setIsFocused(true)
                const step = event.key === "ArrowDown" ? 1 : -1
                setActiveIndex((index) => index < 0 ? (step > 0 ? 0 : visibleSearches.length - 1) : (index + step + visibleSearches.length) % visibleSearches.length)
                return
              }
              if (event.key === "Escape") {
                if (listOpen) event.stopPropagation()
                setIsFocused(false)
                setActiveIndex(-1)
                return
              }
              if (event.key === "Enter") {
                submitSearch(listOpen && activeIndex >= 0 ? visibleSearches[activeIndex] ?? searchQuery : searchQuery)
              }
            }}
            role="combobox"
            aria-expanded={listOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={listOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            enterKeyHint="search"
            className="h-10 w-full bg-transparent pl-10 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:h-11"
            aria-label="Search people, interests, or cities"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => submitSearch("")}
              className="gh-hit-44 absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onFiltersClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl bg-[var(--gh-green)] text-white shadow-sm transition hover:brightness-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open filters"
        >
          <Sliders className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {!searchQuery && !isFocused && (
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto whitespace-nowrap px-0.5 scrollbar-hide">
          <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">Try:</span>
          {["Lagos", "Tech", "Mentorship"].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => submitSearch(term)}
              className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground transition hover:bg-primary/10 hover:text-primary"
            >
              {term}
            </button>
          ))}
        </div>
      )}
      {listOpen && (
        <div
          id={listId}
          className="absolute left-3 right-3 top-full z-50 mt-1 rounded-2xl border border-border/60 bg-popover p-2 text-popover-foreground shadow-xl sm:left-4 sm:right-4"
          role="listbox"
          aria-label="Search suggestions"
        >
          <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {normalizedRecent.length
              ? "Recent searches & suggestions"
              : "Suggested searches"}
          </p>
          <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto overscroll-contain">
            {visibleSearches.map((search, index) => (
              <button
                key={search}
                id={optionId(index)}
                type="button"
                tabIndex={-1}
                onPointerDown={(event) => event.preventDefault()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submitSearch(search)}
                role="option"
                aria-selected={index === activeIndex}
                className={`min-h-9 rounded-full px-3 py-1.5 text-[11px] font-semibold transition hover:bg-emerald-50 hover:text-emerald-700 ${
                  index === activeIndex ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/60" : "bg-muted/40 text-foreground/90"
                }`}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
