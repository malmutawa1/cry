import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

/** Matches the `.sheet.closing` / `.overlay.closing` exit in styles.css. */
const EXIT_MS = 220
/** Dismiss if dragged past this fraction of the sheet height… */
const DISMISS_FRACTION = 0.35
/** …or flicked faster than this (px/ms), regardless of distance (Emil: momentum). */
const DISMISS_VELOCITY = 0.5

/**
 * Bottom-sheet scaffold with an exit animation and drag-to-dismiss.
 *
 * Sheets are mounted by their parent via `{open && <Sheet…/>}`, so a normal
 * `onClose` would unmount instantly with no exit. This wrapper marks itself
 * `.closing` (slide-down + scrim fade) and only calls the real `onClose` — or a
 * per-action `after` callback — once the exit has finished, so nothing pops out.
 *
 * Dragging the sheet down past a threshold (or flicking it) dismisses it;
 * a short drag springs back. Drags starting inside the scroll area or on a
 * control are ignored so scrolling and taps still work.
 *
 * Children may be a node, or a render function receiving `close(after?)`.
 */
export function Sheet({
  onClose,
  className,
  children,
}: {
  onClose: () => void
  className?: string
  children: ReactNode | ((close: (after?: () => void) => void) => ReactNode)
}) {
  const [closing, setClosing] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; startY: number; startT: number; dy: number } | null>(null)

  const close = useCallback(
    (after?: () => void) => {
      setClosing((already) => {
        if (!already)
          setTimeout(() => {
            after?.()
            onClose()
          }, EXIT_MS)
        return true
      })
    },
    [onClose],
  )

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (closing || !e.isPrimary) return
    // Let scrolling, taps and text entry work — only the handle/header drags.
    const el = e.target as HTMLElement
    if (el.closest('.sheet-scroll, button, input, textarea, a, select')) return
    drag.current = { id: e.pointerId, startY: e.clientY, startT: performance.now(), dy: 0 }
    sheetRef.current?.setPointerCapture(e.pointerId)
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || e.pointerId !== d.id || !sheetRef.current) return
    let dy = e.clientY - d.startY
    if (dy < 0) dy = dy * 0.2 // damped over-drag upward (friction, not a hard wall)
    d.dy = dy
    sheetRef.current.style.transform = `translateY(${dy}px)`
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    drag.current = null
    const el = sheetRef.current
    if (!el) return
    const height = el.offsetHeight || 1
    const velocity = d.dy / Math.max(1, performance.now() - d.startT)
    const shouldDismiss = d.dy > height * DISMISS_FRACTION || velocity > DISMISS_VELOCITY
    if (shouldDismiss) {
      // Leave the inline transform in place; `.closing` animates it out from here.
      close()
    } else {
      // Spring back to rest.
      el.style.transition = `transform 0.3s var(--ease-drawer)`
      el.style.transform = ''
    }
  }

  return (
    <div className={`overlay${closing ? ' closing' : ''}`} onClick={() => close()}>
      <div
        ref={sheetRef}
        className={`sheet${className ? ' ' + className : ''}${closing ? ' closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>
  )
}
