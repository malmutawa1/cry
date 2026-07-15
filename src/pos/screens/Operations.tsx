import { useMemo, useState, type ReactNode } from 'react'
import { money, ops, PLAN_COLOR, planById, throughputSeed, type Intake } from '../data'
import { round3, usePos } from '../store'
import { Cards, Users, Basket, Plus } from '../../components/Icons'

type Range = 'today' | '7d' | '30d'
const RANGE_DAYS: Record<Range, number> = { today: 1, '7d': 7, '30d': 30 }

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function Operations() {
  const { intakes, members, plans } = usePos()
  const [range, setRange] = useState<Range>('7d')

  const inRange = useMemo(() => {
    const cutoff = startOfDay(Date.now()) - (RANGE_DAYS[range] - 1) * 86400000
    return intakes.filter((i) => i.ts >= cutoff)
  }, [intakes, range])

  // Recurring revenue and membership are "current state", not range-derived.
  const mrr = useMemo(
    () => round3(members.reduce((s, m) => s + (planById(plans, m.planId)?.priceKwd ?? 0), 0)),
    [members, plans],
  )
  const activeMembers = members.length
  const ordersProcessed = inRange.length
  const extraRevenue = round3(inRange.reduce((s, i) => s + i.extraCharge, 0))
  const kgProcessed = round3(inRange.reduce((s, i) => s + i.kg, 0))

  // Plan mix (members per plan) for the donut.
  const mix = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of members) counts.set(m.planId, (counts.get(m.planId) ?? 0) + 1)
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      count: counts.get(p.id) ?? 0,
      pct: members.length ? Math.round(((counts.get(p.id) ?? 0) / members.length) * 100) : 0,
    }))
  }, [members, plans])
  const donutGradient = useMemo(() => {
    let acc = 0
    const stops = mix
      .filter((m) => m.pct > 0)
      .map((m) => {
        const from = acc
        acc += m.pct
        return `${PLAN_COLOR[m.id] ?? '#4cc4ff'} ${from}% ${acc}%`
      })
    return stops.length ? stops.join(', ') : 'var(--surface-3) 0% 100%'
  }, [mix])

  const maxKg = Math.max(1, ...throughputSeed.map((d) => d.kg))
  const peakIdx = throughputSeed.reduce((best, d, i, arr) => (d.kg > arr[best].kg ? i : best), 0)
  const recent = [...inRange].sort((a, b) => b.ts - a.ts).slice(0, 8)

  return (
    <div className="page">
      <div className="toolbar">
        <p className="toolbar-note">
          {ordersProcessed} order{ordersProcessed === 1 ? '' : 's'} and {kgProcessed} kg in view
        </p>
        <div className="range">
          {(['today', '7d', '30d'] as Range[]).map((r) => (
            <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>
              {r === 'today' ? 'Today' : r === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="kpis">
        <Kpi icon={<Cards size={18} />} label="Recurring revenue" value={money(mrr)} sub="Active subscriptions / mo" tone="grad" />
        <Kpi icon={<Users size={18} />} label="Active members" value={String(activeMembers)} sub="On a subscription" tone="dark" />
        <Kpi icon={<Basket size={18} />} label="Orders processed" value={String(ordersProcessed)} sub="Taken in this range" />
        <Kpi icon={<Plus size={18} />} label="Extra-kg revenue" value={money(extraRevenue)} sub="Overflow blocks billed" />
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Facility throughput</h3>
          <div className="csub">Kilograms processed per day</div>
          <div className="bars">
            {throughputSeed.map((d, i) => (
              <div className="bar-col" key={i}>
                {i === peakIdx ? <div className="bar-tip">{d.kg} kg</div> : <div className="amt">{d.kg}</div>}
                <div
                  className={`bar${i === peakIdx ? ' hi' : ''}`}
                  style={{ height: `${Math.max(2, (d.kg / maxKg) * 100)}%` }}
                />
                <div className="lbl">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Membership mix</h3>
          <div className="csub">Members by subscription tier</div>
          <div className="split">
            <div className="donut" style={{ background: `conic-gradient(${donutGradient})` }}>
              <div className="mid">
                <b>{activeMembers}</b>
                <span>members</span>
              </div>
            </div>
            <div className="legend">
              {mix.map((m) => (
                <div className="l" key={m.id}>
                  <span className="sw" style={{ background: PLAN_COLOR[m.id] ?? '#4cc4ff' }} />
                  {m.name}
                  <span className="lv">{m.count}</span>
                  <span className="lp">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mt">
        <div className="card">
          <h3>Service quality</h3>
          <div className="csub">Rolling operational health</div>
          <div className="quality">
            <Ring pct={ops.onTimePct} label="On-time delivery" sub={`SLA ${ops.slaTargetPct}%`} tone="var(--green)" />
            <div className="quality-stats">
              <QStat label="Avg turnaround" value={`${ops.avgTurnaroundH} h`} sub="Pickup → delivery" />
              <QStat label="Rewash rate" value={`${ops.rewashPct}%`} sub="Target < 3%" />
              <QStat label="Facility load" value={`${ops.capacityPct}%`} sub="Capacity in use" />
              <QStat label="QC pass rate" value={`${ops.qcPassPct}%`} sub="Items inspected" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Recent intakes</h3>
          <div className="csub">Latest orders taken in at the facility</div>
          <div className="recent">
            {recent.length === 0 && <div className="muted">No intakes in this range.</div>}
            {recent.map((i) => (
              <IntakeRow key={i.id} rec={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon, label, value, sub, tone }: { icon: ReactNode; label: string; value: string; sub: string; tone?: 'grad' | 'dark' }) {
  return (
    <div className={`kpi${tone ? ' ' + tone : ''}`}>
      <div className="k">
        <span className="g">{icon}</span>
        {label}
      </div>
      <div className="v">{value}</div>
      <div className="d">{sub}</div>
    </div>
  )
}

function Ring({ pct, label, sub, tone }: { pct: number; label: string; sub: string; tone: string }) {
  const r = 46
  const c = 2 * Math.PI * r
  const dash = (Math.min(100, pct) / 100) * c
  return (
    <div className="ring">
      <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="ring-track" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="ring-fill"
          stroke={tone}
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="ring-center">
        <strong>{pct}%</strong>
        <span>{label}</span>
        <em>{sub}</em>
      </div>
    </div>
  )
}

function QStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="qstat">
      <div className="qs-label">{label}</div>
      <div className="qs-value">{value}</div>
      <div className="qs-sub">{sub}</div>
    </div>
  )
}

function IntakeRow({ rec }: { rec: Intake }) {
  const time = new Date(rec.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(rec.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div className="rrow">
      <span className="rid">{rec.id}</span>
      <span className="rmeta">
        {rec.memberName} · {rec.kg} kg · {date} {time}
      </span>
      <span className={`rm-pill plan ${rec.planId}`}>{rec.planName}</span>
      <span className="rtotal">{rec.overflowKg > 0 ? money(rec.extraCharge) : '—'}</span>
    </div>
  )
}
