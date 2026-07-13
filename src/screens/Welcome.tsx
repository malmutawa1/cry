import { useEffect, useMemo, useState } from 'react'

interface Bubble {
  size: number
  left: number
  delay: number
  dur: number
  sway: number
}

function makeBubbles(count: number): Bubble[] {
  const rnd = (min: number, max: number) => min + Math.random() * (max - min)
  return Array.from({ length: count }, () => ({
    size: Math.round(rnd(20, 96)),
    left: Math.round(rnd(-4, 100)),
    delay: +rnd(0, 2.2).toFixed(2),
    dur: +rnd(5, 10).toFixed(2),
    sway: Math.round(rnd(-46, 46)),
  }))
}

export default function Welcome({ onStart }: { onStart: () => void }) {
  // Stable random bubbles for the lifetime of the splash.
  const bubbles = useMemo(() => makeBubbles(36), [])
  const [leaving, setLeaving] = useState(false)

  // Auto-advance: play the splash, fade out, then continue.
  useEffect(() => {
    const fadeOut = setTimeout(() => setLeaving(true), 2600)
    const done = setTimeout(onStart, 3300)
    return () => {
      clearTimeout(fadeOut)
      clearTimeout(done)
    }
  }, [onStart])

  return (
    <div className={`welcome${leaving ? ' leaving' : ''}`} aria-hidden="true">
      <div className="bubbles">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={
              {
                '--size': `${b.size}px`,
                '--left': `${b.left}%`,
                '--delay': `${b.delay}s`,
                '--dur': `${b.dur}s`,
                '--sway': `${b.sway}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="welcome-content">
        <div className="welcome-mark">
          <span>P</span>
        </div>
      </div>
    </div>
  )
}
