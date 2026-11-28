import type { KeyboardEvent } from "react"

/**
 * Keyboard activation for a non-<button> element that must stay a container (for example a card that
 * holds a nested real button). Spread the result onto the element:
 *   <div {...activatableProps(() => open(item), `Open ${item.name}`)}>
 * It adds role="button", a single Tab stop, Enter/Space activation and an accessible name, and it
 * ignores key presses that originate from a nested control so the inner button keeps its own behaviour.
 * Prefer a real <button> whenever the element has no interactive children.
 */
export function activatableProps(onActivate: () => void, label?: string) {
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick: onActivate,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget) return
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onActivate()
      }
    },
  }
}
