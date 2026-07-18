import { useState } from 'react'
import { useI18n } from '../i18n'
import Terms from '../screens/Terms'

/** Document-with-pen mark, echoing the "terms updated" prompt. */
function TermsMark() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M16 8h20l12 12v28a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z"
        fill="#fff"
        stroke="#1b1f3b"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M36 8v12h12" stroke="#1b1f3b" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 30h14M20 37h10" stroke="#1b1f3b" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M49 27 33 43l-4 8 8-4 16-16a2.8 2.8 0 0 0 0-4 2.8 2.8 0 0 0-4 0Z"
        fill="#fff"
        stroke="#2fae7a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M29 51c2.5-.7 4-2 4.5-4.5" stroke="#2fae7a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Blocking consent modal shown when the Terms & Conditions have changed. The
 * "Terms and Conditions" link opens the full Terms page; "Accept & Continue"
 * records acceptance so the gate does not show again for this version.
 */
export default function TermsGate({ onAccept }: { onAccept: () => void }) {
  const { t } = useI18n()
  const [showTerms, setShowTerms] = useState(false)

  if (showTerms) {
    return (
      <div className="terms-page-overlay">
        <Terms onBack={() => setShowTerms(false)} />
      </div>
    )
  }

  return (
    <div className="terms-scrim">
      <div className="terms-card" role="dialog" aria-modal="true" aria-label={t('terms.gate.title')}>
        <div className="terms-mark">
          <TermsMark />
        </div>
        <h2 className="terms-gate-title">{t('terms.gate.title')}</h2>
        <p className="terms-gate-body">
          {t('terms.gate.body1')}{' '}
          <button className="terms-inline-link" onClick={() => setShowTerms(true)}>
            {t('terms.link')}
          </button>{' '}
          {t('terms.gate.body2')}
        </p>
        <button className="terms-accept" onClick={onAccept}>
          {t('terms.gate.accept')}
        </button>
      </div>
    </div>
  )
}
