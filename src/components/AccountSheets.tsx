import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { Check, Gift } from './Icons'

/** Referral bottom-sheet: shows a personal code that can be copied. */
export function ReferSheet({ onClose }: { onClose: () => void }) {
  const { user, referralCode, showToast } = useStore()
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const initials = (user?.name || 'Friend').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'FRND'
  // prefer the real code from the backend; fall back to a derived one when offline
  const code = referralCode ?? `PRESSD-${initials}25`

  function copy() {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    showToast(t('toast.referCopied'))
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{t('refer.title')}</h3>
        <div className="sheet-scroll">
          <div className="refer-hero">
            <span className="refer-ic"><Gift size={26} /></span>
            <p className="extra-sheet-sub" style={{ margin: 0 }}>{t('refer.sub')}</p>
          </div>
          <span className="field-label">{t('refer.code')}</span>
          <div className="refer-code">{code}</div>
          <button className="btn-primary" onClick={copy}>
            {copied ? (
              <>
                <Check size={16} /> {t('refer.copied')}
              </>
            ) : (
              t('refer.copy')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Freeze / resume subscription bottom-sheet. */
export function FreezeSheet({ onClose }: { onClose: () => void }) {
  const { frozen, freeze, showToast } = useStore()
  const { t } = useI18n()

  function toggle() {
    const next = !frozen
    freeze(next)
    showToast(t(next ? 'toast.frozen' : 'toast.unfrozen'))
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{t('freeze.title')}</h3>
        <div className="sheet-scroll">
          <p className="extra-sheet-sub">{t('freeze.sub')}</p>
          <button className={frozen ? 'btn-primary' : 'btn-warn'} onClick={toggle}>
            {frozen ? t('freeze.resume') : t('freeze.cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
