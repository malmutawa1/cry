import { useStore } from '../store'
import { useI18n } from '../i18n'
import { slotLabel } from '../data/slots'
import { planName } from '../data/plans'
import { Check } from '../components/Icons'

export default function Success({
  orderId,
  onDone,
  onTrack,
}: {
  orderId: string
  onDone: () => void
  onTrack: () => void
}) {
  const { pickup, delivery, activePlan } = useStore()
  const { t, lang } = useI18n()
  return (
    <>
      <div className="topbar" style={{ justifyContent: 'center' }}>
        <h1>{t('success.title')}</h1>
      </div>
      <div className="success">
        <div className="check-ring">
          <Check size={44} />
        </div>
        <h2>{t('success.head')}</h2>
        <p>{t('success.body')}</p>
        <div className="order-pill">{t('success.order', { id: orderId })}</div>
        <div style={{ width: '100%', maxWidth: 320, marginTop: 12 }}>
          <div className="summary-row">
            <span style={{ color: 'var(--muted)' }}>{t('success.pickup')}</span>
            <span style={{ fontWeight: 700 }}>{slotLabel(pickup, lang)}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--muted)' }}>{t('success.delivery')}</span>
            <span style={{ fontWeight: 700 }}>{slotLabel(delivery, lang)}</span>
          </div>
          {activePlan && (
            <div className="summary-row">
              <span style={{ color: 'var(--muted)' }}>{t('success.plan')}</span>
              <span style={{ fontWeight: 700 }}>{planName(activePlan, lang)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="bottom-cta">
        <button className="btn-primary" onClick={onTrack}>
          {t('success.track')}
        </button>
        <button className="btn-ghost" style={{ marginTop: 10 }} onClick={onDone}>
          {t('success.home')}
        </button>
      </div>
    </>
  )
}
