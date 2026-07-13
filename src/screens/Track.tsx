import { useStore, orderStage, STAGE_SECONDS, STAGE_COUNT } from '../store'
import { useI18n } from '../i18n'
import { useNow } from '../useNow'
import { slotLabel } from '../data/slots'
import RouteMap from '../components/RouteMap'
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
        <RouteMap stage={stage} frac={frac} />

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

        {/* timeline */}
        <div className="timeline">
          {Array.from({ length: STAGE_COUNT }).map((_, i) => {
            const state = i < stage ? 'done' : i === stage ? 'active' : 'todo'
            const ts = activeOrder.createdAt + i * STAGE_SECONDS * 1000
            return (
              <div key={i} className={`tl-step ${state}`}>
                <div className="tl-marker">
                  {state === 'done' ? <Check size={14} /> : <span className="tl-dot" />}
                  {i < STAGE_COUNT - 1 && <span className="tl-line" />}
                </div>
                <div className="tl-body">
                  <div className="tl-title">{t(`st.${i}.t`)}</div>
                  {state !== 'todo' && <div className="tl-desc">{t(`st.${i}.d`, { driver })}</div>}
                </div>
                {state !== 'todo' && <div className="tl-time">{formatClock(ts, lang)}</div>}
              </div>
            )
          })}
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

        <div className="track-order-id">{t('track.order', { id: activeOrder.id })}</div>
        <div style={{ height: 12 }} />
      </div>
    </>
  )
}
