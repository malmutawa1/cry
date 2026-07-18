import { useState } from 'react'
import { useI18n } from '../i18n'
import Privacy from '../screens/Privacy'

/** Document-with-pen mark, echoing the consent prompt. */
function ConsentMark() {
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
 * Privacy consent shown once, right after a new customer signs up. The
 * "Privacy Policy" link opens the full policy; "Agree & Continue" dismisses it.
 */
export default function PrivacyGate({ onAccept }: { onAccept: () => void }) {
  const { t } = useI18n()
  const [showPolicy, setShowPolicy] = useState(false)

  if (showPolicy) {
    return (
      <div className="terms-page-overlay">
        <Privacy onBack={() => setShowPolicy(false)} />
      </div>
    )
  }

  return (
    <div className="terms-scrim">
      <div className="terms-card" role="dialog" aria-modal="true" aria-label={t('privacy.gate.title')}>
        <div className="terms-mark">
          <ConsentMark />
        </div>
        <h2 className="terms-gate-title">{t('privacy.gate.title')}</h2>
        <p className="terms-gate-body">
          {t('privacy.gate.body1')}{' '}
          <button className="terms-inline-link" onClick={() => setShowPolicy(true)}>
            {t('privacy.link')}
          </button>{' '}
          {t('privacy.gate.body2')}
        </p>
        <button className="terms-accept" onClick={onAccept}>
          {t('privacy.gate.accept')}
        </button>
      </div>
    </div>
  )
}
