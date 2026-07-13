import { useEffect, useMemo, useState } from 'react'

interface Bubble {
  size: number
  left: number
  delay: number
  dur: number
  sway: number
  hue: number
  tilt: number
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min)

function makeBubbles(): Bubble[] {
  // Random count too, so every app entry looks different.
  const count = Math.round(rnd(26, 42))
  return Array.from({ length: count }, () => ({
    size: Math.round(rnd(20, 96)),
    left: Math.round(rnd(-4, 100)),
    delay: +rnd(0, 2.2).toFixed(2),
    dur: +rnd(5, 10).toFixed(2),
    sway: Math.round(rnd(-46, 46)),
    hue: Math.round(rnd(-14, 14)),
    tilt: Math.round(rnd(-45, 45)),
  }))
}

export default function Welcome({ onStart }: { onStart: () => void }) {
  // Stable random bubbles for the lifetime of the splash.
  const bubbles = useMemo(() => makeBubbles(), [])
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
                '--hue': `${b.hue}deg`,
                '--tilt': `${b.tilt}deg`,
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
