import { useEffect, useState } from 'react'
import { useStore, orderStage, STAGE_SECONDS, STAGE_COUNT } from '../store'
import { useI18n } from '../i18n'
import { useNow } from '../useNow'
import { slotLabel } from '../data/slots'
import { hasSeenRating, markSeenRating } from '../data/ratings'
import TrackMap from '../components/TrackMap'
import RatingSheet from '../components/RatingSheet'
import { CalendarIn, CalendarOut, Car, Check, Phone, Pin, Route } from '../components/Icons'

function formatClock(ts: number, lang: string): string {
  const d = new Date(ts)
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const am = h < 12
  h = h % 12 || 12
  const suffix = lang === 'ar' ? (am ? 'ص' : 'م') : am ? 'AM' : 'PM'
  return `${h}:${m} ${suffix}`
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Track({ onSchedule }: { onSchedule: () => void }) {
  const { activeOrder } = useStore()
  const { t, lang } = useI18n()
  const now = useNow(250)
  const [showRate, setShowRate] = useState(false)

  const orderId = activeOrder?.id
  const isDelivered = !!activeOrder && orderStage(activeOrder, now) >= STAGE_COUNT - 1

  // Prompt for a rating once, the moment an order completes.
  useEffect(() => {
    if (isDelivered && orderId && !hasSeenRating(orderId)) {
      markSeenRating(orderId)
      setShowRate(true)
    }
  }, [isDelivered, orderId])

  if (!activeOrder) {
    return (
      <>
        <div className="topbar" style={{ justifyContent: 'center' }}>
          <h1>{t('track.title')}</h1>
        </div>
        <div className="screen">
          <div className="empty">
            <div className="em-ic"><Route size={30} /></div>
            <h3>{t('track.empty.title')}</h3>
            <p>{t('track.empty.sub')}</p>
            <div style={{ height: 20 }} />
            <button className="btn-primary" style={{ maxWidth: 240, margin: '0 auto' }} onClick={onSchedule}>
              {t('track.empty.cta')}
            </button>
          </div>
        </div>
      </>
    )
  }

  const elapsed = (now - activeOrder.createdAt) / 1000
  const stage = orderStage(activeOrder, now)
  const frac = Math.max(0, Math.min(1, elapsed / STAGE_SECONDS - stage))
  const delivered = stage >= STAGE_COUNT - 1
  const etaTs = activeOrder.createdAt + STAGE_COUNT * STAGE_SECONDS * 1000
  const driver = t('track.driver.name')

  return (
    <>
      <div className="topbar" style={{ justifyContent: 'center' }}>
        <h1>{t('track.title')}</h1>
      </div>

      <div className="screen">
        <TrackMap stage={stage} frac={frac} />

        <div className="track-head">
          <div className="th-status">
            <span className={`th-pulse ${delivered ? 'done' : ''}`} />
            {t(`st.${stage}.t`)}
          </div>
          <div className="th-desc">{t(`st.${stage}.d`, { driver })}</div>
          <div className="th-eta">
            <span>{delivered ? t('track.done') : t('track.arriving')}</span>
            <strong>{delivered ? formatClock(etaTs, lang) : formatCountdown(etaTs - now)}</strong>
          </div>
        </div>

        {/* driver card */}
        {!delivered && (
          <div className="driver-card">
            <div className="dc-avatar"><Car size={24} /></div>
            <div className="dc-body">
              <div className="dc-label">{t('track.driver')}</div>
              <div className="dc-name">{driver}</div>
              <div className="dc-veh">{t('track.driver.vehicle')}</div>
            </div>
            <a className="dc-call" href="tel:+96541035032">
              <Phone size={18} />
              {t('track.call')}
            </a>
          </div>
        )}

        {/* delivery info + pipeline */}
        <div className="delivery-info">
          <div className="di-head">
            <span className="di-label">{t('track.info')}</span>
            <span className="di-more" aria-hidden="true">···</span>
          </div>
          <div className="di-id">{activeOrder.id}</div>
          <div className="di-steps">
            {Array.from({ length: STAGE_COUNT }, (_, i) => STAGE_COUNT - 1 - i).map((i, idx) => {
              const state = i < stage ? 'done' : i === stage ? 'active' : 'todo'
              const ts = activeOrder.createdAt + i * STAGE_SECONDS * 1000
              const isLast = idx === STAGE_COUNT - 1
              return (
                <div key={i} className={`di-step ${state}`}>
                  <div className="di-rail">
                    <span className="di-ic">
                      {state === 'done' ? <Check size={13} /> : state === 'active' ? <span className="di-live-dot" /> : null}
                    </span>
                    {!isLast && <span className="di-line" />}
                  </div>
                  <div className="di-body">
                    <div className="di-title">{t(`st.${i}.t`)}</div>
                    {state !== 'todo' && <div className="di-sub">{t(`st.${i}.d`, { driver })}</div>}
                  </div>
                  {state !== 'todo' && <div className="di-time">{formatClock(ts, lang)}</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* order details */}
        <div className="card-group">
          <div className="row">
            <span className="row-ic"><CalendarIn /></span>
            <span className="row-body">
              <span className="label">{t('track.pickup')}</span>
              <span className="value">{slotLabel(activeOrder.pickup, lang)}</span>
            </span>
          </div>
          <div className="row">
            <span className="row-ic"><CalendarOut /></span>
            <span className="row-body">
              <span className="label">{t('track.delivery')}</span>
              <span className="value">{slotLabel(activeOrder.delivery, lang)}</span>
            </span>
          </div>
          <div className="row">
            <span className="row-ic"><Pin /></span>
            <span className="row-body">
              <span className="label">{t('track.address')}</span>
              <span className="value" style={{ whiteSpace: 'normal' }}>{activeOrder.address}</span>
            </span>
          </div>
        </div>

        <div style={{ height: 12 }} />
      </div>

      {showRate && <RatingSheet orderId={activeOrder.id} onClose={() => setShowRate(false)} />}
    </>
  )
}
