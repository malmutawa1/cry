import { useMemo } from 'react'
import { useI18n } from '../i18n'
import { Globe } from '../components/Icons'

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
    size: Math.round(rnd(16, 84)),
    left: Math.round(rnd(-4, 100)),
    delay: +rnd(0, 9).toFixed(2),
    dur: +rnd(7, 15).toFixed(2),
    sway: Math.round(rnd(-40, 40)),
  }))
}

export default function Welcome({ onStart }: { onStart: () => void }) {
  const { t, toggle } = useI18n()
  // Stable random bubbles for the lifetime of the splash.
  const bubbles = useMemo(() => makeBubbles(18), [])

  return (
    <div className="welcome">
      <button className="welcome-lang round-btn" onClick={toggle} aria-label="Language">
        <Globe />
      </button>

      <div className="bubbles" aria-hidden="true">
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
        <div className="welcome-mark" aria-hidden="true">
          <span>P</span>
        </div>
        <p className="welcome-hi">{t('welcome.hi')}</p>
        <h1 className="welcome-brand">Pressd</h1>
        <p className="welcome-tagline">{t('welcome.tagline')}</p>
        <button className="welcome-cta" onClick={onStart}>
          {t('welcome.cta')}
        </button>
      </div>
    </div>
  )
}
