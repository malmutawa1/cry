import { useMemo, useState } from 'react'
import { useStore, orderStage, STAGE_COUNT, STAGE_SECONDS } from '../store'
import { useI18n } from '../i18n'
import { useNow } from '../useNow'
import {
  bi,
  capacityPct,
  defects,
  inspectors,
  kpis,
  liveFleet,
  qc,
  qcChecklist,
  qcSeed,
  throughput,
  STAFF_PASSCODE,
  type QcResult,
  type QcRecord,
} from '../data/staff'
import { Check, Clock, Close, Lock, Pin, Route, Sliders } from '../components/Icons'

const CYCLE_MS = STAGE_COUNT * STAGE_SECONDS * 1000

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ---------- Small building blocks ---------- */

function Trend({ pct, goodWhenUp }: { pct: number; goodWhenUp: boolean }) {
  if (pct === 0) return null
  const up = pct > 0
  const good = up === goodWhenUp
  return (
    <span className={`kpi-trend ${good ? 'good' : 'bad'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  )
}

/** Circular percentage gauge (accessible: value is also rendered as text). */
function Ring({ pct, tone = 'accent', label }: { pct: number; tone?: string; label: string }) {
  const r = 46
  const c = 2 * Math.PI * r
  const dash = (Math.min(100, pct) / 100) * c
  return (
    <div className="ring">
      <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
        <circle cx="60" cy="60" r={r} className="ring-track" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className={`ring-fill ${tone}`}
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="ring-center">
        <strong>{pct}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function ResultBadge({ result }: { result: QcResult }) {
  const { t } = useI18n()
  return <span className={`qc-badge ${result}`}>{t(`staff.qc.result.${result}`)}</span>
}

/* ---------- Passcode gate ---------- */

function StaffGate({ onEnter, onExit }: { onEnter: () => void; onExit: () => void }) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  const [err, setErr] = useState(false)

  function submit() {
    if (code === STAFF_PASSCODE) onEnter()
    else setErr(true)
  }

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onExit} aria-label={t('staff.back')}>
          <Close />
        </button>
        <div className="staff-badge">{t('staff.tag')}</div>
        <span style={{ width: 42 }} />
      </div>
      <div className="screen">
        <div className="auth">
          <div className="staff-lock">
            <Lock size={26} />
          </div>
          <h2 className="auth-title">{t('staff.gate.title')}</h2>
          <p className="auth-sub">{t('staff.gate.sub')}</p>
          <label className="input">
            <Lock className="in-ic" size={20} />
            <input
              type="password"
              inputMode="numeric"
              dir="ltr"
              placeholder={t('staff.gate.ph')}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setErr(false)
              }}
              autoFocus
            />
          </label>
          {err && <p className="field-err">{t('staff.gate.err')}</p>}
          <button className="btn-primary" disabled={code.length === 0} onClick={submit} style={{ marginTop: 6 }}>
            {t('staff.gate.cta')}
          </button>
          <p className="otp-demo">{t('staff.gate.hint')}</p>
        </div>
      </div>
    </>
  )
}

/* ---------- KPI view ---------- */

function KpiView({ lang }: { lang: 'en' | 'ar' }) {
  const { t } = useI18n()
  const maxKg = Math.max(...throughput.map((d) => d.kg))

  return (
    <>
      <div className="section-title staff-sec">{t('staff.kpi.section')}</div>
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div key={k.id} className="kpi-tile">
            <div className="kpi-label">{bi(k.label, lang)}</div>
            <div className={`kpi-value ${k.tone}`}>
              {k.value}
              {k.unit && <span className="kpi-unit">{bi(k.unit, lang)}</span>}
            </div>
            <div className="kpi-foot">
              <Trend pct={k.trend} goodWhenUp={k.goodWhenUp} />
              <span className="kpi-sub">{bi(k.sub, lang)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title staff-sec">{t('staff.throughput.title')}</div>
      <div className="staff-card">
        <div className="bars">
          {throughput.map((d, i) => (
            <div key={i} className="bar-col">
              <div className="bar-val">{d.kg}</div>
              <div className="bar-track">
                <span style={{ height: `${(d.kg / maxKg) * 100}%` }} />
              </div>
              <div className="bar-label">{bi(d.d, lang)}</div>
            </div>
          ))}
        </div>
        <div className="staff-card-note">{t('staff.throughput.note')}</div>
      </div>

      <div className="staff-two">
        <div className="staff-card center">
          <Ring pct={96} tone="green" label={t('staff.ontime.label')} />
          <div className="staff-card-title">{t('staff.ontime.title')}</div>
        </div>
        <div className="staff-card">
          <div className="staff-card-title">{t('staff.capacity.title')}</div>
          <div className="cap-value">{capacityPct}%</div>
          <div className="bar" style={{ marginTop: 4 }}>
            <span style={{ width: `${capacityPct}%` }} />
          </div>
          <div className="staff-card-note">{t('staff.capacity.note')}</div>
        </div>
      </div>
    </>
  )
}

/* ---------- Quality-control view ---------- */

function orderKg(id: string): number {
  const n = parseInt(id.replace(/\D/g, '').slice(-3) || '50', 10)
  return Math.round((4 + (n % 70) / 10) * 10) / 10
}

/* ---------- Live order board ---------- */

interface BoardRow {
  id: string
  kg: number
  address: string
  createdAt: number
  stage: number
  delivered: boolean
}

function OrdersView({ lang }: { lang: 'en' | 'ar' }) {
  const { t } = useI18n()
  const { orders } = useStore()
  const now = useNow(500)

  const stageAt = (createdAt: number) =>
    Math.min(STAGE_COUNT - 1, Math.floor((now - createdAt) / 1000 / STAGE_SECONDS))

  const rows: BoardRow[] = useMemo(() => {
    // Real orders coming from the customer app.
    const fromApp: BoardRow[] = orders.map((o) => {
      const stage = orderStage(o, now)
      return { id: o.id, kg: orderKg(o.id), address: o.address, createdAt: o.createdAt, stage, delivered: stage >= STAGE_COUNT - 1 }
    })
    // Synthetic fleet that keeps cycling through the pipeline.
    const fleet: BoardRow[] = liveFleet.map((lo) => {
      const frac = ((now / CYCLE_MS) + lo.phase) % 1
      const createdAt = now - frac * CYCLE_MS
      const stage = stageAt(createdAt)
      return { id: lo.id, kg: lo.kg, address: bi(lo.address, lang), createdAt, stage, delivered: stage >= STAGE_COUNT - 1 }
    })
    // Active orders first (closest to delivery on top), delivered last.
    return [...fleet, ...fromApp].sort(
      (a, b) => Number(a.delivered) - Number(b.delivered) || b.stage - a.stage,
    )
  }, [orders, now, lang])

  const active = rows.filter((r) => !r.delivered).length
  const delivered = rows.length - active
  const counts = Array.from({ length: STAGE_COUNT }, (_, i) => rows.filter((r) => r.stage === i).length)

  return (
    <>
      <div className="ops-summary">
        <div className="ops-stat">
          <strong className="accent">{active}</strong>
          <span>{t('staff.orders.active')}</span>
        </div>
        <div className="ops-stat">
          <strong className="green">{delivered}</strong>
          <span>{t('staff.orders.delivered')}</span>
        </div>
      </div>

      <div className="section-title staff-sec">{t('staff.orders.pipeline')}</div>
      <div className="ops-funnel">
        {counts.map((c, i) => (
          <div key={i} className={`ops-stage ${c > 0 ? 'on' : ''} ${i === STAGE_COUNT - 1 ? 'done' : ''}`}>
            <div className="ops-stage-n">{c}</div>
            <div className="ops-stage-l">{t(`st.${i}.t`)}</div>
          </div>
        ))}
      </div>

      <div className="section-title staff-sec">{t('staff.orders.section')}</div>
      <div className="ops-list">
        {rows.map((r) => (
          <div key={r.id} className="ops-card">
            <div className="ops-top">
              <span className="ops-id">{r.id}</span>
              <span className={`ops-eta ${r.delivered ? 'done' : ''}`}>
                {r.delivered ? (
                  <>
                    <Check size={13} /> {t('track.done')}
                  </>
                ) : (
                  <>
                    <Clock size={13} /> {formatCountdown(r.createdAt + CYCLE_MS - now)}
                  </>
                )}
              </span>
            </div>
            <div className="ops-addr">
              <Pin size={13} /> {r.address} · {r.kg} kg
            </div>
            <div className={`ops-stagename ${r.delivered ? 'done' : ''}`}>{t(`st.${r.stage}.t`)}</div>
            <div className="ops-pips">
              {Array.from({ length: STAGE_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className={`ops-pip ${i <= r.stage ? (r.delivered ? 'done' : 'fill') : ''} ${
                    i === r.stage && !r.delivered ? 'active' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

function QcView({ lang }: { lang: 'en' | 'ar' }) {
  const { t } = useI18n()
  const { orders } = useStore()
  const now = useNow(1000)
  const maxDefect = Math.max(...defects.map((d) => d.count))

  // Interactive per-order checklist for the next order awaiting dispatch.
  const [checks, setChecks] = useState<boolean[]>(() => qcChecklist.map(() => false))
  const [logged, setLogged] = useState(false)
  const allChecked = checks.every(Boolean)

  // Recent inspections: live orders from the customer app first, then history.
  const rows: QcRecord[] = useMemo(() => {
    const live: QcRecord[] = orders.map((o, i) => {
      const done = orderStage(o, now) >= STAGE_COUNT - 1
      return {
        id: o.id,
        kg: orderKg(o.id),
        inspector: inspectors[i % inspectors.length].name,
        result: done ? 'pass' : 'pending',
        note: done
          ? { en: 'Cleared for delivery', ar: 'جاهز للتوصيل' }
          : { en: 'Awaiting inspection', ar: 'بانتظار الفحص' },
      }
    })
    const seen = new Set(live.map((r) => r.id))
    const extra = qcSeed.filter((r) => !seen.has(r.id))
    return [...live, ...extra].slice(0, 7)
  }, [orders, now])

  const nextOrder = orders[0]

  return (
    <>
      <div className="staff-two">
        <div className="staff-card center">
          <Ring pct={qc.passRate} tone="green" label={t('staff.qc.pass')} />
          <div className="staff-card-note">{t('staff.qc.checks', { n: qc.inspected })}</div>
        </div>
        <div className="staff-card">
          <div className="staff-card-title">{t('staff.qc.defects')}</div>
          <div className="defect-list">
            {defects.map((d, i) => (
              <div key={i} className="defect-row">
                <span className="defect-label">{bi(d.label, lang)}</span>
                <span className="defect-bar">
                  <span style={{ width: `${(d.count / maxDefect) * 100}%` }} />
                </span>
                <span className="defect-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-order QC checklist tied to the next order in the pipeline */}
      <div className="section-title staff-sec">{t('staff.qc.checklist')}</div>
      <div className="staff-card">
        <div className="qc-order-head">
          <span>{t('staff.qc.order', { id: nextOrder ? nextOrder.id : '—' })}</span>
          <span className="qc-order-kg">{nextOrder ? orderKg(nextOrder.id) : 0} kg</span>
        </div>
        <div className="qc-check-list">
          {qcChecklist.map((item, i) => (
            <button
              key={i}
              className={`qc-check ${checks[i] ? 'on' : ''}`}
              onClick={() =>
                setChecks((prev) => prev.map((v, j) => (j === i ? !v : v)))
              }
            >
              <span className="qc-box">{checks[i] && <Check size={14} />}</span>
              {bi(item, lang)}
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          disabled={!allChecked || logged}
          onClick={() => setLogged(true)}
          style={{ marginTop: 8 }}
        >
          {logged ? t('staff.qc.logged') : t('staff.qc.log')}
        </button>
      </div>

      {/* Recent inspections */}
      <div className="section-title staff-sec">{t('staff.qc.recent')}</div>
      <div className="card-group">
        {rows.map((r, i) => (
          <div key={r.id + i} className="row">
            <span className="row-body">
              <span className="value">{r.id}</span>
              <span className="label">
                {r.kg} kg · {bi(r.inspector, lang)} · {bi(r.note, lang)}
              </span>
            </span>
            <ResultBadge result={r.result} />
          </div>
        ))}
      </div>

      {/* Inspector performance */}
      <div className="section-title staff-sec">{t('staff.qc.inspectors')}</div>
      <div className="card-group">
        {inspectors.map((ins, i) => (
          <div key={i} className="row">
            <span className="row-ic">{bi(ins.name, lang).charAt(0)}</span>
            <span className="row-body">
              <span className="value">{bi(ins.name, lang)}</span>
              <span className="label">{t('staff.qc.inspChecks', { n: ins.checks })}</span>
            </span>
            <span className="insp-pass">{ins.passPct}%</span>
          </div>
        ))}
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

/* ---------- Dashboard shell ---------- */

function StaffDashboard({ onExit }: { onExit: () => void }) {
  const { t, lang } = useI18n()
  const [tab, setTab] = useState<'kpi' | 'orders' | 'qc'>('kpi')

  return (
    <>
      <div className="topbar staff-top">
        <div>
          <div className="staff-title-row">
            <span className="staff-badge">{t('staff.tag')}</span>
          </div>
          <h1 style={{ marginTop: 6 }}>{t('staff.title')}</h1>
          <div className="staff-subtitle">{t('staff.updated')}</div>
        </div>
        <button className="round-btn" onClick={onExit} aria-label={t('staff.exit')}>
          <Close />
        </button>
      </div>

      <div className="segmented staff-seg">
        <button className={`seg ${tab === 'kpi' ? 'on' : ''}`} onClick={() => setTab('kpi')}>
          <Sliders size={17} />
          {t('staff.tab.kpi')}
        </button>
        <button className={`seg ${tab === 'orders' ? 'on' : ''}`} onClick={() => setTab('orders')}>
          <Route size={17} />
          {t('staff.tab.orders')}
        </button>
        <button className={`seg ${tab === 'qc' ? 'on' : ''}`} onClick={() => setTab('qc')}>
          <Check size={17} />
          {t('staff.tab.qc')}
        </button>
      </div>

      <div className="screen">
        <div className="anim-in" key={tab}>
          {tab === 'kpi' ? <KpiView lang={lang} /> : tab === 'orders' ? <OrdersView lang={lang} /> : <QcView lang={lang} />}
        </div>
      </div>
    </>
  )
}

/* ---------- Entry point ---------- */

export default function Staff({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(false)
  return authed ? (
    <StaffDashboard onExit={onExit} />
  ) : (
    <StaffGate onEnter={() => setAuthed(true)} onExit={onExit} />
  )
}
