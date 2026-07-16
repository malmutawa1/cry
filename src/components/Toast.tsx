import { useEffect, useRef, useState } from 'react'

/**
 * Toast host with enter *and* exit animation. The store nulls its toast text
 * after a timeout; this keeps the element mounted long enough to play the
 * `.toast.closing` fade-out instead of hard-unmounting. Always rendered.
 */
export function Toast({ text }: { text: string | null }) {
  const [shown, setShown] = useState<string | null>(text)
  const [closing, setClosing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (text) {
      setClosing(false)
      setShown(text)
    } else if (shown) {
      setClosing(true)
      timer.current = setTimeout(() => setShown(null), 200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  if (!shown) return null
  return (
    <div className={`toast${closing ? ' closing' : ''}`} key={shown}>
      {shown}
    </div>
  )
}
