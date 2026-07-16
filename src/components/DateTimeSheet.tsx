import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import type { Slot } from '../data/slots'
import { Sheet } from './Sheet'
import { PaymentSheet, PaymentValue } from './Payment'
import { Bolt, Chevron } from './Icons'

/** Express (urgent) pickup surcharge, in KWD. */
export const URGENT_PRICE_KWD = 2

interface TimeOpt {
  id: string
  h: number
  en: string
  ar: string
}
const TIMES: TimeOpt[] = [
  { id: 't08', h: 8, en: '08:00 AM', ar: '٠٨:٠٠ ص' },
  { id: 't09', h: 9, en: '09:00 AM', ar: '٠٩:٠٠ ص' },
  { id: 't10', h: 10, en: '10:00 AM', ar: '١٠:٠٠ ص' },
  { id: 't11', h: 11, en: '11:00 AM', ar: '١١:٠٠ ص' },
  { id: 't12', h: 12, en: '12:00 PM', ar: '١٢:٠٠ م' },
  { id: 't14', h: 14, en: '02:00 PM', ar: '٠٢:٠٠ م' },
  { id: 't15', h: 15, en: '03:00 PM', ar: '٠٣:٠٠ م' },
  { id: 't16', h: 16, en: '04:00 PM', ar: '٠٤:٠٠ م' },
]

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Calendar cells for a month, padded with nulls before the 1st. */
function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null)
  const days = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d))
  return cells
}

/**
 * Calendar date + time picker used for both pick-up and delivery. Confirming
 * schedules the slot; the red Urgent button reveals the express price and, once
 * confirmed, hands off to the express payment page.
 */
export function DateTimeSheet({
  title,
  onPick,
  onUrgent,
  onClose,
}: {
  title: string
  onPick: (s: Slot) => void
  onUrgent: (s: Slot) => void
  onClose: () => void
}) {
  const { t, lang } = useI18n()
  const locale = lang === 'ar' ? 'ar' : 'en-US'
  const today = startOfDay(new Date())

  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selDate, setSelDate] = useState<Date>(today)
  const [selTime, setSelTime] = useState<string>(() => {
    const nowH = new Date().getHours()
    return (TIMES.find((tm) => tm.h > nowH) ?? TIMES[0]).id
  })
  const [armed, setArmed] = useState(false)

  const cells = useMemo(() => monthCells(view.y, view.m), [view])
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(view.y, view.m, 1))
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i))) // 2023-01-01 is a Sunday
  }, [locale])

  const atCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth()
  const isPast = (d: Date) => startOfDay(d).getTime() < today.getTime()
  const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()
  const timeDisabled = (h: number) => sameDay(selDate, today) && h <= new Date().getHours()
  const selValid = (() => {
    const tm = TIMES.find((x) => x.id === selTime)
    return !!tm && !timeDisabled(tm.h)
  })()

  function stepMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  function synth(): Slot {
    const enFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    const arFmt = new Intl.DateTimeFormat('ar', { weekday: 'short', day: 'numeric', month: 'short' })
    const tm = TIMES.find((x) => x.id === selTime)!
    return {
      id: `${startOfDay(selDate).toISOString().slice(0, 10)}_${tm.id}`,
      day: { en: enFmt.format(selDate), ar: arFmt.format(selDate) },
      time: { en: tm.en, ar: tm.ar },
    }
  }

  return (
    <Sheet onClose={onClose}>
      {(close) => (
        <>
          <div className="grabber" />
          <h3>{title}</h3>
          <div className="sheet-scroll">
            <div className="cal-head">
              <button className="cal-nav" disabled={atCurrentMonth} onClick={() => stepMonth(-1)} aria-label="Previous month">
                <Chevron className="cal-prev" size={18} />
              </button>
              <span className="cal-month">{monthLabel}</span>
              <button className="cal-nav" onClick={() => stepMonth(1)} aria-label="Next month">
                <Chevron size={18} />
              </button>
            </div>

            <div className="cal-grid cal-dow">
              {weekdays.map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
            <div className="cal-grid">
              {cells.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    className={`cal-day${sameDay(d, selDate) ? ' sel' : ''}${sameDay(d, today) ? ' today' : ''}`}
                    disabled={isPast(d)}
                    onClick={() => setSelDate(d)}
                  >
                    {d.getDate()}
                  </button>
                ) : (
                  <span key={i} />
                ),
              )}
            </div>

            <div className="dt-times-label">{t('dt.times')}</div>
            <div className="time-grid">
              {TIMES.map((tm) => (
                <button
                  key={tm.id}
                  className={`time-chip${selTime === tm.id ? ' sel' : ''}`}
                  disabled={timeDisabled(tm.h)}
                  onClick={() => setSelTime(tm.id)}
                >
                  {lang === 'ar' ? tm.ar : tm.en}
                </button>
              ))}
            </div>

            <button
              className={`btn-urgent${armed ? ' armed' : ''}`}
              disabled={!selValid}
              onClick={() => (armed ? close(() => onUrgent(synth())) : setArmed(true))}
            >
              <span className="urg-row">
                <span className="urg-ic"><Bolt size={18} /></span>
                {armed ? t('dt.urgent.confirm', { price: URGENT_PRICE_KWD }) : t('dt.urgent')}
              </span>
              {armed && <span className="urg-sub">{t('dt.urgent.sub')}</span>}
            </button>

            <button className="btn-primary dt-continue" disabled={!selValid} onClick={() => close(() => onPick(synth()))}>
              {t('dt.continue')}
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}

/** Express-pickup payment page: shows the surcharge, then completes the order. */
export function ExpressCheckoutSheet({ onPaid, onClose }: { onPaid: () => void; onClose: () => void }) {
  const { t } = useI18n()
  const { showToast } = useStore()
  const [payOpen, setPayOpen] = useState(false)

  return (
    <>
      <Sheet onClose={onClose}>
        {(close) => (
          <>
            <div className="grabber" />
            <h3>{t('express.title')}</h3>
            <div className="sheet-scroll">
              <div className="checkout-card">
                <div className="co-top">
                  <div>
                    <div className="co-plan">{t('express.name')}</div>
                    <div className="co-period">{t('express.desc')}</div>
                  </div>
                  <span className="plan-cap urgent-tag">{t('dt.urgent')}</span>
                </div>
                <div className="co-total">
                  <span>{t('checkout.total')}</span>
                  <strong>{URGENT_PRICE_KWD}.000 KWD</strong>
                </div>
              </div>

              <div className="section-title" style={{ fontSize: 18 }}>{t('checkout.method')}</div>
              <div className="card-group">
                <button className="row" onClick={() => setPayOpen(true)}>
                  <span className="pay-current"><PaymentValue /></span>
                  <Chevron className="chev" />
                </button>
              </div>

              <button
                className="btn-primary"
                style={{ marginTop: 6 }}
                onClick={() => close(() => { showToast(t('toast.express')); onPaid() })}
              >
                {t('checkout.pay', { price: URGENT_PRICE_KWD })}
              </button>
              <p className="extra-sheet-sub" style={{ textAlign: 'center', marginTop: 10 }}>{t('checkout.secure')}</p>
            </div>
          </>
        )}
      </Sheet>
      {payOpen && <PaymentSheet onClose={() => setPayOpen(false)} />}
    </>
  )
}
