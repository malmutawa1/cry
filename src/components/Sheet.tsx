import { useCallback, useState, type ReactNode } from 'react'

/** Matches the `.sheet.closing` / `.overlay.closing` exit in styles.css. */
const EXIT_MS = 220

/**
 * Bottom-sheet scaffold with an exit animation.
 *
 * Sheets are mounted by their parent via `{open && <Sheet…/>}`, so a normal
 * `onClose` would unmount instantly with no exit. This wrapper instead marks
 * itself `.closing` (playing the slide-down + scrim fade), and only calls the
 * real `onClose` — or an optional per-action `after` callback — once the exit
 * has finished. The parent keeps it mounted until then, so nothing pops out.
 *
 * Children may be a node, or a render function receiving `close(after?)`:
 *   - scrim tap / cancel  → `close()`
 *   - an action that also dismisses → run the action, then `close()`
 *   - an action whose callback unmounts us (onPick/onSave) → `close(() => onPick(x))`
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
  return (
    <div className={`overlay${closing ? ' closing' : ''}`} onClick={() => close()}>
      <div
        className={`sheet${className ? ' ' + className : ''}${closing ? ' closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>
  )
}
