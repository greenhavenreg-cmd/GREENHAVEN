"use client"

import { useEffect, useRef } from "react"

// Buttons marked data-dialog-dismiss (full-screen backdrop click targets) stay clickable but are
// not tab stops; data-dialog-initial-focus marks the control that should receive first focus.
const FOCUSABLE =
  'a[href],button:not([disabled]):not([data-dialog-dismiss]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

// Open dialogs, oldest first. Only the topmost one reacts to keys so a sheet opened above
// another dialog closes alone and Tab never escapes into the one beneath it.
const dialogStack: symbol[] = []

let scrollLockCount = 0
let previousOverflow = ""

function lockScroll() {
  if (typeof document === "undefined") return
  if (scrollLockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
  }
  scrollLockCount += 1
}

function unlockScroll() {
  if (typeof document === "undefined") return
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) document.body.style.overflow = previousOverflow
}

/**
 * Shared modal/sheet behaviour: Escape closes, Tab stays inside the dialog, the
 * first focusable control receives focus, focus returns to the opener on close,
 * and background scrolling is locked (reference-counted so stacked sheets are safe).
 * Attach the returned ref to the dialog panel (role="dialog" aria-modal="true").
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose?: () => void) {
  const panelRef = useRef<T | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open || typeof document === "undefined") return
    const token = Symbol("dialog")
    dialogStack.push(token)
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    lockScroll()

    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current
      if (!panel || panel.contains(document.activeElement)) return
      const first = panel.querySelector<HTMLElement>("[data-dialog-initial-focus]") ?? panel.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panel).focus({ preventScroll: true })
    }, 30)

    const onKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current
      if (!panel || dialogStack[dialogStack.length - 1] !== token) return
      if (event.key === "Escape") {
        if (closeRef.current) {
          event.stopPropagation()
          closeRef.current()
        }
        return
      }
      if (event.key !== "Tab") return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      window.clearTimeout(focusTimer)
      const at = dialogStack.indexOf(token)
      if (at >= 0) dialogStack.splice(at, 1)
      document.removeEventListener("keydown", onKeyDown, true)
      unlockScroll()
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true })
    }
  }, [open])

  return panelRef
}
