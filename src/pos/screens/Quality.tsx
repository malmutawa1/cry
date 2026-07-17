import { useMemo, useState } from 'react'
import { usePos } from '../store'
import {
  bi,
  qc,
  defects,
  inspectors,
  qcChecklist,
  qcSeed,
  type QcResult,
} from '../../data/staff'

/** Circular pass-rate gauge (value also rendered as text for accessibility). */
function Ring({ pct, label, sub }: { pct: number; label: string; sub: string }) {
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
          stroke="var(--green)"
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

const RESULT_LABEL: Record<QcResult, string> = { pass: 'Pass', rework: 'Rework', pending: 'Pending' }

export function Quality() {
  const { intakes } = usePos()
  const maxDefect = Math.max(1, ...defects.map((d) => d.count))

  // Per-order checklist tied to the most recent intake awaiting dispatch.
  const nextOrder = intakes[0]
  const [checks, setChecks] = useState<boolean[]>(() => qcChecklist.map(() => false))
  const [logged, setLogged] = useState(false)
  const allChecked = checks.every(Boolean)

  // Recent inspections: latest intakes taken in, then seeded history.
  const rows = useMemo(() => {
    const live = intakes.slice(0, 4).map((i, idx) => ({
      id: i.id,
      kg: i.kg,
      inspector: bi(inspectors[idx % inspectors.length].name, 'en'),
      result: 'pass' as QcResult,
      note: 'Cleared for delivery',
    }))
    const seen = new Set(live.map((r) => r.id))
    const extra = qcSeed
      .filter((r) => !seen.has(r.id))
      .map((r) => ({ id: r.id, kg: r.kg, inspector: bi(r.inspector, 'en'), result: r.result, note: bi(r.note, 'en') }))
    return [...live, ...extra].slice(0, 7)
  }, [intakes])

  return (
    <div className="page">
      <div className="toolbar">
        <p className="toolbar-note">{qc.inspected} items inspected this week</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>QC pass rate</h3>
          <div className="csub">Rolling quality inspection</div>
          <div className="quality" style={{ justifyContent: 'center' }}>
            <Ring pct={qc.passRate} label="pass rate" sub={`${qc.inspected} items`} />
          </div>
        </div>

        <div className="card">
          <h3>Top defect types</h3>
          <div className="csub">Most common issues caught this week</div>
          <div className="qc-defects">
            {defects.map((d, i) => (
              <div className="qc-defect" key={i}>
                <span className="qc-defect-label">{bi(d.label, 'en')}</span>
                <span className="qc-defect-bar">
                  <i style={{ width: `${(d.count / maxDefect) * 100}%` }} />
                </span>
                <span className="qc-defect-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt">
        <div className="qc-order-head">
          <h3>Order QC checklist</h3>
          <div className="qc-order-tag">
            {nextOrder ? nextOrder.id : '—'} · {nextOrder ? nextOrder.kg : 0} kg
          </div>
        </div>
        <div className="qc-checks">
          {qcChecklist.map((item, i) => (
            <button
              key={i}
              className={`qc-check${checks[i] ? ' on' : ''}`}
              onClick={() => setChecks((prev) => prev.map((v, j) => (j === i ? !v : v)))}
            >
              <span className="qc-box">{checks[i] && <Tick />}</span>
              {bi(item, 'en')}
            </button>
          ))}
        </div>
        <button className="btn primary wide" disabled={!allChecked || logged} onClick={() => setLogged(true)}>
          {logged ? 'Inspection logged ✓' : 'Log inspection'}
        </button>
      </div>

      <div className="grid-2 mt">
        <div className="card">
          <h3>Recent inspections</h3>
          <div className="csub">Latest orders through quality control</div>
          <div className="qc-list">
            {rows.map((r, i) => (
              <div className="qc-row" key={r.id + i}>
                <div className="qc-row-main">
                  <span className="qc-row-id">{r.id}</span>
                  <span className="qc-row-meta">{r.kg} kg · {r.inspector} · {r.note}</span>
                </div>
                <span className={`pill qc-res ${r.result}`}>{RESULT_LABEL[r.result]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Inspector performance</h3>
          <div className="csub">Checks and pass rate this week</div>
          <div className="qc-list">
            {inspectors.map((ins, i) => (
              <div className="qc-row" key={i}>
                <div className="qc-row-main">
                  <span className="qc-avatar">{bi(ins.name, 'en').charAt(0)}</span>
                  <div>
                    <div className="qc-row-id">{bi(ins.name, 'en')}</div>
                    <div className="qc-row-meta">{ins.checks} checks this week</div>
                  </div>
                </div>
                <span className="qc-insp-pass">{ins.passPct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Tick() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
