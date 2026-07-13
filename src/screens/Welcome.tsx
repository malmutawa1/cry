import { useEffect, useMemo, useState } from 'react'

interface Drop {
  dx: number
  dy: number
  size: number
}

interface Bubble {
  size: number
  left: number
  delay: number
  dur: number
  sway: number
  hue: number
  tilt: number
  rise: number
  pop: boolean
  drops: Drop[]
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min)

function makeDrops(bubbleSize: number): Drop[] {
  const n = Math.round(rnd(6, 9))
  const reach = bubbleSize * 0.7 + 18
  return Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * Math.PI * 2 + rnd(-0.3, 0.3)
    const dist = reach * rnd(0.7, 1.1)
    return {
      dx: Math.round(Math.cos(ang) * dist),
      dy: Math.round(Math.sin(ang) * dist),
      size: Math.round(rnd(6, 12)),
    }
  })
}

function makeBubbles(): Bubble[] {
  // Random count too, so every app entry looks different.
  const count = Math.round(rnd(26, 42))
  const bubbles: Bubble[] = Array.from({ length: count }, () => {
    const size = Math.round(rnd(20, 96))
    return {
      size,
      left: Math.round(rnd(-4, 100)),
      delay: +rnd(0, 1.4).toFixed(2),
      dur: +rnd(3, 5.5).toFixed(2),
      sway: Math.round(rnd(-46, 46)),
      hue: Math.round(rnd(-14, 14)),
      tilt: Math.round(rnd(-45, 45)),
      // how high it floats before it pops
      rise: Math.round(rnd(35, 88)),
      pop: false,
      drops: [],
    }
  })
  // Only a few (3–4) bubbles actually pop; the rest just float away.
  const popCount = Math.round(rnd(3, 4))
  const idx = new Set<number>()
  while (idx.size < Math.min(popCount, bubbles.length)) idx.add(Math.floor(Math.random() * bubbles.length))
  idx.forEach((i) => {
    bubbles[i].pop = true
    bubbles[i].drops = makeDrops(bubbles[i].size)
  })
  return bubbles
}

function bubbleVars(b: Bubble): React.CSSProperties {
  return {
    '--size': `${b.size}px`,
    '--left': `${b.left}%`,
    '--delay': `${b.delay}s`,
    '--dur': `${b.dur}s`,
    '--sway': `${b.sway}px`,
    '--hue': `${b.hue}deg`,
    '--tilt': `${b.tilt}deg`,
    '--rise': `-${b.rise}vh`,
  } as React.CSSProperties
}

export default function Welcome({ onStart }: { onStart: () => void }) {
  // Stable random bubbles for the lifetime of the splash.
  const bubbles = useMemo(() => makeBubbles(), [])
  const [leaving, setLeaving] = useState(false)

  // Auto-advance: play the splash, fade out, then continue.
  useEffect(() => {
    const fadeOut = setTimeout(() => setLeaving(true), 3600)
    const done = setTimeout(onStart, 4300)
    return () => {
      clearTimeout(fadeOut)
      clearTimeout(done)
    }
  }, [onStart])

  return (
    <div className={`welcome${leaving ? ' leaving' : ''}`} aria-hidden="true">
      <div className="bubbles">
        {bubbles.map((b, i) =>
          b.pop ? (
            <span key={i} className="popper" style={bubbleVars(b)}>
              <span className="bubble burst" />
              <span className="splash">
                {b.drops.map((d, j) => (
                  <span
                    key={j}
                    className="drop"
                    style={
                      {
                        '--dx': `${d.dx}px`,
                        '--dy': `${d.dy}px`,
                        '--dsize': `${d.size}px`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
            </span>
          ) : (
            <span key={i} className="bubble" style={bubbleVars(b)} />
          ),
        )}
      </div>

      <div className="welcome-content">
        <div className="welcome-mark">
          <span>P</span>
        </div>
      </div>
    </div>
  )
}
