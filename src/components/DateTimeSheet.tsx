import { useMemo, useState, type CSSProperties } from 'react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import type { Slot } from '../data/slots'
import { useRush } from '../useRush'
import { RUSH_TIER_ORDER, TIERS, tierFee, type RushTier } from '../data/rush'
import { Sheet } from './Sheet'
import { PaymentSheet, PaymentValue } from './Payment'
import { Chevron } from './Icons'

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

function feeLabel(fee: number): string {
  return `+${fee}.000 KWD`
}

/**
 * Calendar date + time picker. On the pick-up sheet it also shows the three
 * service-speed tiers (Standard / Express / Urgent) with their fee and promised
 * ready-by time. Standard confirms directly (covered by the subscription);
 * Express/Urgent hand off to the rush payment page. When the daily rush cap is
 * reached, Express + Urgent are disabled for the rest of the day.
 */
export function DateTimeSheet({
  title,
  showRush = false,
  onPick,
  onRush,
  onClose,
}: {
  title: string
  showRush?: boolean
  onPick: (s: Slot) => void
  onRush: (tier: 'express' | 'urgent', s: Slot) => void
  onClose: () => void
}) {
  const { t, lang } = useI18n()
  const { settings, capReached } = useRush()
  const locale = lang === 'ar' ? 'ar' : 'en-US'
  const today = startOfDay(new Date())

  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selDate, setSelDate] = useState<Date>(today)
  const [selTime, setSelTime] = useState<string>(() => {
    const nowH = new Date().getHours()
    return (TIMES.find((tm) => tm.h > nowH) ?? TIMES[0]).id
  })
  const [selTier, setSelTier] = useState<RushTier>('standard')

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
  // If the cap is reached, a rush tier can't be the effective choice.
  const tier: RushTier = capReached && selTier !== 'standard' ? 'standard' : selTier

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

            {showRush && (
              <>
                <div className="dt-times-label">{t('dt.speed')}</div>
                <div className="tier-list">
                  {RUSH_TIER_ORDER.map((tid) => {
                    const meta = TIERS[tid]
                    const fee = tierFee(tid, settings)
                    const disabled = tid !== 'standard' && capReached
                    return (
                      <button
                        key={tid}
                        className={`tier-opt${tier === tid ? ' sel' : ''}${disabled ? ' disabled' : ''}`}
                        style={{ '--tier': meta.color } as CSSProperties}
                        disabled={disabled}
                        onClick={() => setSelTier(tid)}
                      >
                        <span className="tier-dot" />
                        <span className="tier-main">
                          <span className="tier-name">{lang === 'ar' ? meta.label.ar : meta.label.en}</span>
                          <span className="tier-ready">{lang === 'ar' ? meta.ready.ar : meta.ready.en}</span>
                        </span>
                        <span className="tier-fee">{fee > 0 ? feeLabel(fee) : t('dt.included')}</span>
                      </button>
                    )
                  })}
                </div>
                {capReached && <div className="tier-capnote">{t('dt.capReached')}</div>}
              </>
            )}

            <button
              className="btn-primary dt-continue"
              disabled={!selValid}
              onClick={() => {
                const slot = synth()
                if (tier === 'standard') close(() => onPick(slot))
                else close(() => onRush(tier, slot))
              }}
            >
              {tier === 'standard' ? t('dt.continue') : `${t('dt.continue')} · ${feeLabel(tierFee(tier, settings))}`}
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}

/** Rush payment page: shows the tier + surcharge, then completes the order. */
export function RushCheckoutSheet({
  tier,
  fee,
  onPaid,
  onClose,
}: {
  tier: 'express' | 'urgent'
  fee: number
  onPaid: () => void
  onClose: () => void
}) {
  const { t, lang } = useI18n()
  const { showToast } = useStore()
  const [payOpen, setPayOpen] = useState(false)
  const meta = TIERS[tier]

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
                    <div className="co-plan">{lang === 'ar' ? meta.label.ar : meta.label.en}</div>
                    <div className="co-period">{lang === 'ar' ? meta.ready.ar : meta.ready.en}</div>
                  </div>
                  <span
                    className="plan-cap"
                    style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}66` }}
                  >
                    {t('dt.rush')}
                  </span>
                </div>
                <div className="co-total">
                  <span>{t('checkout.total')}</span>
                  <strong>{fee}.000 KWD</strong>
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
                {t('checkout.pay', { price: fee })}
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
