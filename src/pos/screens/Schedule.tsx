import { useMemo, useState } from 'react'
import { DAY_SLOTS, dateKey, formatHour, slotKey, type SlotType } from '../data'
import { usePos } from '../store'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function longDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Pickup & delivery configurator. Staff pick a date and toggle the hours the
 * driver is occupied so those slots are withheld from members. Only the slot's
 * availability is stored — never a reason.
 */
export function Schedule() {
  const { occupied, toggleOccupied, setOccupied } = usePos()
  const today = useMemo(() => new Date(), [])
  const todayKey = dateKey(today)

  const [type, setType] = useState<SlotType>('pickup')
  const [viewY, setViewY] = useState(today.getFullYear())
  const [viewM, setViewM] = useState(today.getMonth())
  const [selKey, setSelKey] = useState(todayKey)

  const occSet = useMemo(() => new Set(occupied), [occupied])

  // Calendar cells for the visible month (leading blanks + day numbers).
  const cells = useMemo(() => {
    const startWeekday = new Date(viewY, viewM, 1).getDay()
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate()
    return [
      ...Array.from({ length: startWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
  }, [viewY, viewM])

  const monthLabel = new Date(viewY, viewM, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const canPrev = viewY > today.getFullYear() || (viewY === today.getFullYear() && viewM > today.getMonth())

  function shiftMonth(delta: number) {
    const d = new Date(viewY, viewM + delta, 1)
    setViewY(d.getFullYear())
    setViewM(d.getMonth())
  }

  const dayKeys = DAY_SLOTS.map((h) => slotKey(type, selKey, h))
  const occCount = dayKeys.filter((k) => occSet.has(k)).length
  const availCount = DAY_SLOTS.length - occCount

  return (
    <div className="page">
      <div className="toolbar">
        <div className="seg sched-seg">
          <button className={type === 'pickup' ? 'on' : ''} onClick={() => setType('pickup')}>
            Pickup
          </button>
          <button className={type === 'delivery' ? 'on' : ''} onClick={() => setType('delivery')}>
            Delivery
          </button>
        </div>
        <p className="toolbar-note">
          <b className="accent-strong">{availCount}</b> of {DAY_SLOTS.length} slots available · {occCount} occupied
        </p>
      </div>

      <div className="grid-2">
        <div className="card cal-card">
          <div className="cal-head">
            <button className="cal-nav" onClick={() => canPrev && shiftMonth(-1)} disabled={!canPrev} aria-label="Previous month">
              ‹
            </button>
            <div className="cal-month">{monthLabel}</div>
            <button className="cal-nav" onClick={() => shiftMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>
          <div className="cal-grid cal-weekdays">
            {WEEKDAYS.map((w) => (
              <div key={w} className="cal-weekday">
                {w}
              </div>
            ))}
          </div>
          <div className="cal-grid">
            {cells.map((day, i) => {
              if (day === null) return <div key={`b${i}`} />
              const k = dateKey(new Date(viewY, viewM, day))
              const past = k < todayKey
              const selected = k === selKey
              const isToday = k === todayKey
              // Count occupied slots on this day (either type) for a subtle dot.
              const hasBlocks = DAY_SLOTS.some(
                (h) => occSet.has(slotKey('pickup', k, h)) || occSet.has(slotKey('delivery', k, h)),
              )
              return (
                <button
                  key={k}
                  className={`cal-day${selected ? ' sel' : ''}${isToday ? ' today' : ''}`}
                  disabled={past}
                  onClick={() => setSelKey(k)}
                >
                  {day}
                  {hasBlocks && !selected && <span className="cal-dot" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="card slots-card">
          <div className="slots-top">
            <div>
              <h3>Driver availability</h3>
              <div className="csub">
                {longDate(selKey)} · {type === 'pickup' ? 'Pickup' : 'Delivery'}
              </div>
            </div>
            <div className="slot-actions">
              <button className="btn ghost sm" onClick={() => setOccupied(dayKeys, true)}>
                Occupy all
              </button>
              <button className="btn ghost sm" onClick={() => setOccupied(dayKeys, false)}>
                Clear day
              </button>
            </div>
          </div>

          <div className="slot-legend">
            <span>
              <i className="lg avail" /> Available
            </span>
            <span>
              <i className="lg occ" /> Driver occupied
            </span>
          </div>

          <div className="slot-grid">
            {DAY_SLOTS.map((h) => {
              const key = slotKey(type, selKey, h)
              const isOcc = occSet.has(key)
              return (
                <button
                  key={h}
                  className={`slot-chip${isOcc ? ' occupied' : ''}`}
                  onClick={() => toggleOccupied(key)}
                  aria-pressed={isOcc}
                >
                  {formatHour(h)}
                </button>
              )
            })}
          </div>

          <p className="slot-hint">
            Tap a slot to mark the driver occupied — occupied slots aren’t offered to members for{' '}
            {type === 'pickup' ? 'pickup' : 'delivery'}.
          </p>
        </div>
      </div>
    </div>
  )
}
