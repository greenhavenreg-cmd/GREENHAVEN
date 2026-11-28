"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * X-style profile section tabs under the hero.
 * Posts · Media · Listings · Communities · About
 */

export type ProfileSectionTab =
  | "posts"
  | "media"
  | "listings"
  | "communities"
  | "about"

const TABS: { id: ProfileSectionTab; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "media", label: "Media" },
  { id: "listings", label: "Listings" },
  { id: "communities", label: "Communities" },
  { id: "about", label: "About" },
]

export function ProfileSectionTabs({
  active,
  onChange,
  counts,
}: {
  active: ProfileSectionTab
  onChange: (tab: ProfileSectionTab) => void
  counts?: Partial<Record<ProfileSectionTab, number>>
}) {
  const navRef = useRef<HTMLElement>(null)
  const mountedRef = useRef(false)
  // Fade the strip edges only where more tabs are hidden, so overflow is visible instead of silently clipped.
  const [edges, setEdges] = useState({ start: false, end: false })
  // Stable key: the parent passes a fresh counts object on every render.
  const countsKey = TABS.map((item) => counts?.[item.id] ?? 0).join(",")
  const measureEdges = useCallback(() => {
    const el = navRef.current
    if (!el) return
    const start = el.scrollLeft > 4
    const end = el.scrollWidth - el.clientWidth - Math.abs(el.scrollLeft) > 4
    setEdges((previous) => (previous.start === start && previous.end === end ? previous : { start, end }))
  }, [])
  useEffect(() => {
    measureEdges()
    const el = navRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measureEdges)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measureEdges, countsKey])
  const edgeMask =
    edges.start || edges.end
      ? `linear-gradient(to right, ${edges.start ? "transparent 0, #000 28px" : "#000 0"}, ${edges.end ? "#000 calc(100% - 28px), transparent 100%" : "#000 100%"})`
      : undefined

  // Keep the selected tab visible when the strip overflows (small phones, large text).
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const el = navRef.current?.querySelector<HTMLElement>(`[data-profile-tab="${active}"]`)
    if (!el || typeof el.scrollIntoView !== "function") return
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" })
  }, [active])

  return (
    <nav
      ref={navRef}
      onScroll={measureEdges}
      style={edgeMask ? { WebkitMaskImage: edgeMask, maskImage: edgeMask } : undefined}
      className="gh-profile-nav sticky top-0 z-[2] mt-3 flex w-full snap-x snap-proximity gap-1 overflow-x-auto border-y border-border/40 bg-background/95 px-2 py-2 backdrop-blur-md scrollbar-hide"
      aria-label="Profile sections"
      role="tablist"
    >
      {TABS.map((tab) => {
        const selected = active === tab.id
        const count = counts?.[tab.id]
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`gh-profile-panel-${tab.id}`}
            id={`gh-profile-tab-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            data-profile-tab={tab.id}
            onKeyDown={(event) => {
              const current = TABS.findIndex((item) => item.id === tab.id)
              let next = current
              if (event.key === "ArrowRight") next = (current + 1) % TABS.length
              else if (event.key === "ArrowLeft") next = (current - 1 + TABS.length) % TABS.length
              else if (event.key === "Home") next = 0
              else if (event.key === "End") next = TABS.length - 1
              else return
              event.preventDefault()
              const nextTab = TABS[next]
              onChange(nextTab.id)
              const target = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-profile-tab="${nextTab.id}"]`)
              target?.focus()
            }}
            onClick={() => onChange(tab.id)}
            className={
              selected
                ? "shrink-0 snap-center min-h-11 rounded-full bg-emerald-600 px-3.5 py-2 text-[12px] font-bold text-white shadow-sm shadow-emerald-600/25 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                : "shrink-0 snap-center min-h-11 rounded-full px-3.5 py-2 text-[12px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            }
          >
            {tab.label}
            {typeof count === "number" && count > 0 ? (
              <span className={selected ? "ml-1.5 rounded-full bg-white/25 px-1.5 text-[10px] tabular-nums" : "ml-1.5 rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground"}>
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}
