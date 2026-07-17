import { useMemo, useState } from 'react'
import { money, type ExtraBlock, type Plan } from '../data'
import { usePos } from '../store'
import { setRushSettings, TIERS } from '../../data/rush'
import { useRush } from '../../useRush'
import { Pencil, Trash, Close } from '../../components/Icons'

const EMPTY: Omit<Plan, 'id'> = { name: '', priceKwd: 15, capKg: 20, tagline: '' }

export function Plans() {
  const { plans, extras, members, addPlan, updatePlan, deletePlan, updateExtra } = usePos()
  const [editing, setEditing] = useState<Plan | 'new' | null>(null)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const mem of members) m.set(mem.planId, (m.get(mem.planId) ?? 0) + 1)
    return m
  }, [members])

  return (
    <div className="page">
      <div className="toolbar">
        <p className="toolbar-note">Edits save to this terminal instantly</p>
        <button className="btn primary" onClick={() => setEditing('new')}>
          + New plan
        </button>
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Plan</th>
              <th className="right">Monthly price</th>
              <th className="right">Allowance</th>
              <th className="right">Members</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="cell-name">
                    <span className={`dot-plan ${p.id}`} />
                    <div>
                      <div>{p.name} {p.popular && <span className="pill on">Popular</span>}</div>
                      <div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>{p.tagline}</div>
                    </div>
                  </div>
                </td>
                <td className="right">
                  <span className="tprice">{money(p.priceKwd)} <small>/mo</small></span>
                </td>
                <td className="right tprice">{p.capKg} kg</td>
                <td className="right tprice">{counts.get(p.id) ?? 0}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => setEditing(p)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => {
                        if ((counts.get(p.id) ?? 0) > 0) {
                          alert(`${counts.get(p.id)} member(s) are on ${p.name}. Move them before deleting.`)
                          return
                        }
                        if (confirm(`Delete the ${p.name} plan?`)) deletePlan(p.id)
                      }}
                      aria-label="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-head">
        <h2>Extra-capacity blocks</h2>
        <p>Sold at intake when a batch runs past the monthly allowance</p>
      </div>
      <div className="extra-grid">
        {extras.map((e) => (
          <ExtraCard key={e.id} extra={e} onSave={updateExtra} />
        ))}
      </div>

      <div className="section-head">
        <h2>Rush service pricing</h2>
        <p>Express &amp; Urgent fees and the daily cap. Shared with the customer app instantly.</p>
      </div>
      <RushSettingsCard />

      {editing && (
        <PlanEditor
          initial={editing === 'new' ? { ...EMPTY } : editing}
          onCancel={() => setEditing(null)}
          onSave={(data) => {
            if (editing === 'new') addPlan(data)
            else updatePlan({ ...(editing as Plan), ...data })
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function RushSettingsCard() {
  const { settings, countToday } = useRush()
  const [express, setExpress] = useState(String(settings.expressFee))
  const [urgent, setUrgent] = useState(String(settings.urgentFee))
  const [cap, setCap] = useState(String(settings.dailyCap))
  const dirty =
    Number(express) !== settings.expressFee ||
    Number(urgent) !== settings.urgentFee ||
    Math.round(Number(cap)) !== settings.dailyCap

  return (
    <div className="card rush-settings">
      <div className="rs-grid">
        <div className="field">
          <label><span className="rs-dot" style={{ background: TIERS.express.color }} /> Express fee (KWD)</label>
          <input type="number" inputMode="decimal" min={0} step={0.5} value={express} onChange={(e) => setExpress(e.target.value)} />
          <span className="rs-hint">≤ 24-hour turnaround</span>
        </div>
        <div className="field">
          <label><span className="rs-dot" style={{ background: TIERS.urgent.color }} /> Urgent fee (KWD)</label>
          <input type="number" inputMode="decimal" min={0} step={0.5} value={urgent} onChange={(e) => setUrgent(e.target.value)} />
          <span className="rs-hint">Same-day · a few hours</span>
        </div>
        <div className="field">
          <label>Daily rush cap</label>
          <input type="number" inputMode="numeric" min={0} step={1} value={cap} onChange={(e) => setCap(e.target.value)} />
          <span className="rs-hint">Max Express + Urgent / day · {countToday} used today</span>
        </div>
      </div>
      <button
        className="btn primary wide"
        disabled={!dirty}
        onClick={() => setRushSettings({ expressFee: Number(express), urgentFee: Number(urgent), dailyCap: Math.round(Number(cap)) })}
      >
        {dirty ? 'Save rush settings' : 'Saved'}
      </button>
    </div>
  )
}

function ExtraCard({ extra, onSave }: { extra: ExtraBlock; onSave: (e: ExtraBlock) => void }) {
  const [price, setPrice] = useState(String(extra.priceKwd))
  const changed = Number(price) !== extra.priceKwd && Number(price) > 0
  return (
    <div className="card extra-card">
      <div className="extra-kg">+{extra.kg} kg</div>
      <div className="field" style={{ marginBottom: 8 }}>
        <label>Price (KWD)</label>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.25}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
        {(Number(price) / extra.kg || 0).toFixed(3)} KD / kg
      </div>
      <button className="btn ghost wide" disabled={!changed} onClick={() => onSave({ ...extra, priceKwd: Number(price) })}>
        {changed ? 'Save price' : 'Saved'}
      </button>
    </div>
  )
}

function PlanEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<Plan, 'id'>
  onSave: (p: Omit<Plan, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [tagline, setTagline] = useState(initial.tagline)
  const [priceKwd, setPriceKwd] = useState(String(initial.priceKwd))
  const [capKg, setCapKg] = useState(String(initial.capKg))
  const [popular, setPopular] = useState(!!initial.popular)

  const valid = name.trim().length > 0 && Number(priceKwd) > 0 && Number(capKg) > 0

  return (
    <div className="scrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial.name ? 'Edit plan' : 'New plan'}</h2>
          <button className="x" onClick={onCancel} aria-label="Close">
            <Close size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Plan name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard" autoFocus />
          </div>
          <div className="field">
            <label>Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Small families" />
          </div>
          <div className="field row2">
            <div>
              <label>Monthly price (KWD)</label>
              <input type="number" inputMode="decimal" min={0} step={1} value={priceKwd} onChange={(e) => setPriceKwd(e.target.value)} />
            </div>
            <div>
              <label>Allowance (kg / month)</label>
              <input type="number" inputMode="numeric" min={0} step={5} value={capKg} onChange={(e) => setCapKg(e.target.value)} />
            </div>
          </div>
          <div className="field row2" style={{ alignItems: 'center' }}>
            <label style={{ margin: 0 }}>Mark as “Popular”</label>
            <button
              className={`switch${popular ? ' on' : ''}`}
              style={{ marginLeft: 'auto' }}
              onClick={() => setPopular((v) => !v)}
              aria-label="Toggle popular"
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn primary"
              style={{ flex: 1 }}
              disabled={!valid}
              onClick={() =>
                onSave({ name: name.trim(), tagline: tagline.trim(), priceKwd: Number(priceKwd), capKg: Number(capKg), popular })
              }
            >
              Save plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
