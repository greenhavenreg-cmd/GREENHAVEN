import type { KeyboardEvent } from "react"

/**
 * WAI-ARIA tabs keyboard model for any container with role="tablist" whose children are role="tab".
 * ArrowLeft/ArrowRight (wrapping), Home and End move focus to the neighbouring tab and activate it
 * (automatic activation). Disabled tabs are skipped. Attach to the tablist's onKeyDown and give the
 * active tab tabIndex 0 and the others -1 so Tab leaves the list in one stop.
 */
export function onTablistKeyDown(event: KeyboardEvent<HTMLElement>) {
  const key = event.key
  if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return
  const target = event.target as HTMLElement | null
  const current = target?.closest<HTMLElement>('[role="tab"]')
  if (!current || !event.currentTarget.contains(current)) return
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
    (tab) => !tab.hasAttribute("disabled") && tab.getAttribute("aria-disabled") !== "true",
  )
  const index = tabs.indexOf(current)
  if (index < 0 || tabs.length < 2) return
  let next = index
  if (key === "ArrowRight") next = (index + 1) % tabs.length
  else if (key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length
  else if (key === "Home") next = 0
  else next = tabs.length - 1
  event.preventDefault()
  const tab = tabs[next]
  tab.focus()
  tab.scrollIntoView?.({ block: "nearest", inline: "nearest" })
  tab.click()
}
