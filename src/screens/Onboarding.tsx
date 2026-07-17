import { useI18n } from '../i18n'

/**
 * First-run intro screen (modelled on the supplied reference). An animated
 * clock + location hero, then a card that pitches the auto-scheduling: the
 * system picks the perfect *time* for you. "Get Started" continues to sign-in.
 */
export default function Onboarding({ onStart }: { onStart: () => void }) {
  const { t } = useI18n()
  return (
    <div className="onboard">
      <div className="ob-hero">
        <span className="ob-dot d1" />
        <span className="ob-dot d2" />
        <span className="ob-dot d3" />
        <span className="ob-dot d4" />
        <span className="ob-dot d5" />
        <span className="ob-dot d6" />
        <svg className="ob-art" viewBox="0 0 260 240" fill="none" aria-hidden="true">
          <ellipse cx="128" cy="116" rx="112" ry="104" className="ob-blob" />
          <circle cx="116" cy="106" r="64" className="ob-clock-face" />
          <circle cx="116" cy="106" r="64" className="ob-clock-ring" />
          <g className="ob-tick">
            <line x1="116" y1="48" x2="116" y2="60" />
            <line x1="116" y1="152" x2="116" y2="164" />
            <line x1="58" y1="106" x2="70" y2="106" />
            <line x1="162" y1="106" x2="174" y2="106" />
          </g>
          <g className="ob-hands">
            <line x1="116" y1="106" x2="116" y2="60" className="ob-hand min" />
            <line x1="116" y1="106" x2="150" y2="120" className="ob-hand hour" />
          </g>
          <circle cx="116" cy="106" r="5.5" className="ob-hub" />
          <g className="ob-pin" transform="translate(190 150)">
            <path d="M0 46 C -21 19 -21 0 0 0 C 21 0 21 19 0 46 Z" className="ob-pin-body" />
            <circle cx="0" cy="16" r="8.5" className="ob-pin-dot" />
          </g>
        </svg>
      </div>

      <div className="ob-card">
        <h1>{t('onboard.title')}</h1>
        <p>{t('onboard.sub')}</p>
        <button className="btn-primary ob-cta" onClick={onStart}>
          {t('onboard.cta')}
        </button>
      </div>
    </div>
  )
}
