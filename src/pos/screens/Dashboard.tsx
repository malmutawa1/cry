import { useMemo, useState } from 'react'
import { money, paymentMethods, type PaymentMethod, type Sale } from '../data'
import { round3, usePos } from '../store'

type Range = 'today' | '7d' | '30d'

const RANGE_DAYS: Record<Range, number> = { today: 1, '7d': 7, '30d': 30 }
const METHOD_COLOR: Record<PaymentMethod, string> = {
  cash: '#34c759',
  knet: '#4cc4ff',
  card: '#c9a24a',
}

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function Dashboard() {
  const { sales } = usePos()
  const [range, setRange] = useState<Range>('7d')

  const inRange = useMemo(() => {
    const days = RANGE_DAYS[range]
    const cutoff = startOfDay(Date.now()) - (days - 1) * 86400000
    return sales.filter((s) => s.ts >= cutoff)
  }, [sales, range])

  const revenue = round3(inRange.reduce((s, x) => s + x.total, 0))
  const txns = inRange.length
  const avgTicket = txns ? round3(revenue / txns) : 0
  const items = inRange.reduce((s, x) => s + x.lines.reduce((a, l) => a + l.qty, 0), 0)

  // Per-day revenue for the bar chart.
  const days = RANGE_DAYS[range] === 1 ? 1 : 7
  const perDay = useMemo(() => {
    const today = startOfDay(Date.now())
    const buckets: { label: string; amount: number; isToday: boolean }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const day = today - i * 86400000
      const label = new Date(day).toLocaleDateString('en-US', { weekday: 'short' })
      const amount = round3(
        sales.filter((s) => startOfDay(s.ts) === day).reduce((a, s) => a + s.total, 0),
      )
      buckets.push({ label, amount, isToday: i === 0 })
    }
    return buckets
  }, [sales, days])
  const maxDay = Math.max(1, ...perDay.map((d) => d.amount))

  // Top services by revenue.
  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; amount: number }>()
    for (const s of inRange) {
      for (const l of s.lines) {
        const cur = map.get(l.productId) ?? { name: l.name, qty: 0, amount: 0 }
        cur.qty += l.qty
        cur.amount += l.price * l.qty
        map.set(l.productId, cur)
      }
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 6)
  }, [inRange])
  const maxItem = Math.max(1, ...topItems.map((t) => t.amount))

  // Payment split.
  const split = useMemo(() => {
    const totals: Record<PaymentMethod, number> = { cash: 0, knet: 0, card: 0 }
    for (const s of inRange) totals[s.method] += s.total
    const sum = totals.cash + totals.knet + totals.card || 1
    return paymentMethods.map((m) => ({
      ...m,
      amount: round3(totals[m.id]),
      pct: Math.round((totals[m.id] / sum) * 100),
    }))
  }, [inRange])
  const donutGradient = useMemo(() => {
    let acc = 0
    const stops = split
      .filter((s) => s.pct > 0)
      .map((s) => {
        const from = acc
        acc += s.pct
        return `${METHOD_COLOR[s.id]} ${from}% ${acc}%`
      })
    if (stops.length === 0) return 'var(--surface-3) 0% 100%'
    return stops.join(', ')
  }, [split])

  const recent = [...inRange].sort((a, b) => b.ts - a.ts).slice(0, 8)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Sales dashboard</h1>
          <p>Live figures from this terminal — {txns} transaction{txns === 1 ? '' : 's'} in view</p>
        </div>
        <div className="range">
          {(['today', '7d', '30d'] as Range[]).map((r) => (
            <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>
              {r === 'today' ? 'Today' : r === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="kpis">
        <Kpi glyph="💰" label="Revenue" value={money(revenue)} sub="Collected, after discounts" />
        <Kpi glyph="🧾" label="Transactions" value={String(txns)} sub="Completed sales" />
        <Kpi glyph="🎫" label="Avg ticket" value={money(avgTicket)} sub="Revenue per sale" />
        <Kpi glyph="👕" label="Items handled" value={String(items)} sub="Pieces & kg lines" />
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Revenue by day</h3>
          <div className="csub">Total collected per day</div>
          <div className="bars">
            {perDay.map((d, i) => (
              <div className="bar-col" key={i}>
                <div className="amt">{d.amount > 0 ? d.amount.toFixed(0) : ''}</div>
                <div
                  className={`bar${d.isToday ? '' : ' dim'}`}
                  style={{ height: `${Math.max(2, (d.amount / maxDay) * 100)}%` }}
                />
                <div className="lbl">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Payment mix</h3>
          <div className="csub">Share of revenue by tender</div>
          <div className="split">
            <div className="donut" style={{ background: `conic-gradient(${donutGradient})` }}>
              <div className="mid">
                <b>{txns}</b>
                <span>sales</span>
              </div>
            </div>
            <div className="legend">
              {split.map((s) => (
                <div className="l" key={s.id}>
                  <span className="sw" style={{ background: METHOD_COLOR[s.id] }} />
                  {s.label}
                  <span className="lv">{money(s.amount)}</span>
                  <span className="lp">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mt">
        <div className="card">
          <h3>Top services</h3>
          <div className="csub">Ranked by revenue in range</div>
          <div className="top-list">
            {topItems.length === 0 && <div className="muted">No sales in this range.</div>}
            {topItems.map((t, i) => (
              <div className="top-row" key={t.name}>
                <div className="rk">{i + 1}</div>
                <div>
                  <div className="nm">{t.name}</div>
                  <div className="meter">
                    <i style={{ width: `${(t.amount / maxItem) * 100}%` }} />
                  </div>
                </div>
                <div className="amt">
                  {money(round3(t.amount))}
                  <small>{t.qty} sold</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent transactions</h3>
          <div className="csub">Latest sales at this counter</div>
          <div className="recent">
            {recent.length === 0 && <div className="muted">No transactions yet.</div>}
            {recent.map((s) => (
              <RecentRow key={s.id} sale={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ glyph, label, value, sub }: { glyph: string; label: string; value: string; sub: string }) {
  return (
    <div className="kpi">
      <div className="k">
        <span className="g">{glyph}</span>
        {label}
      </div>
      <div className="v">{value}</div>
      <div className="d">{sub}</div>
    </div>
  )
}

function RecentRow({ sale }: { sale: Sale }) {
  const time = new Date(sale.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(sale.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const method = paymentMethods.find((m) => m.id === sale.method)
  // Short, counter-friendly order code from the sale timestamp.
  const code = `#${String(Math.floor(sale.ts / 1000) % 10000).padStart(4, '0')}`
  return (
    <div className="rrow">
      <span className="rid">{code}</span>
      <span className="rmeta">
        {date} · {time} · {sale.staffName}
      </span>
      <span className="rm-pill">{method?.label}</span>
      <span className="rtotal">{money(sale.total)}</span>
    </div>
  )
}
