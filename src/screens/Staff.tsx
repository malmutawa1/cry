import { useEffect, useMemo, useState } from 'react'
import { useStore, orderStage, STAGE_COUNT, STAGE_SECONDS } from '../store'
import { api, apiEnabled, type ApiStaffOrder } from '../api'
import { useI18n } from '../i18n'
import { useNow } from '../useNow'
import { TIERS, setRushSettings, readyBy, type RushTier } from '../data/rush'
import { useRush } from '../useRush'
import { useAppConfig } from '../useAppConfig'
import { useDiscounts } from '../useDiscounts'
import { setPlanOverride, setAnnouncement, type AnnouncementTone } from '../data/config'
import { addDiscount, toggleDiscount, removeDiscount, type Discount, type DiscountKind, type DiscountScope } from '../data/discounts'
import { getCustomers, toggleFreeze, grantCustomerCredit, subscribeCustomers, type Customer } from '../data/customers'
import {
  useItemsConfig,
  setCategory,
  setAddOn,
  setOveragePerItem,
  categoryName,
  addOnName,
  type ItemCategory,
  type AddOn,
} from '../data/items'
import type { Intake } from '../pos/data'
import { getShiftNotes, addShiftNote, removeShiftNote, subscribeShiftNotes } from '../data/shiftnotes'
import { sendNotification, removeNotification, markSeen as markNotifSeen, type NotifAudience } from '../data/notifications'
import { useNotifications, useAllNotifications } from '../useNotifications'
import NotificationsBell from '../components/NotificationsBell'
import { planName, planPrice, type Plan } from '../data/plans'
import { Toggle } from '../components/Common'
import {
  bi,
  capacityPct,
  kpis,
  liveFleet,
  throughput,
  STAFF_PASSCODE,
} from '../data/staff'
import { AlertTriangle, BarChart, Bell, Car, Check, Chevron, Clock, Close, Info, Lock, Mail, Phone, Pin, Plus, Route, Sliders, Trash } from '../components/Icons'
import RouteMap from '../components/RouteMap'

const CYCLE_MS = STAGE_COUNT * STAGE_SECONDS * 1000

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatClock(ts: number, lang: string): string {
  const d = new Date(ts)
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const am = h < 12
  h = h % 12 || 12
  const suffix = lang === 'ar' ? (am ? 'ص' : 'م') : am ? 'AM' : 'PM'
  return `${h}:${m} ${suffix}`
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

/* ---------- Passcode gate ---------- */

function StaffGate({ onEnter, onExit }: { onEnter: (key: string) => void; onExit: () => void }) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (apiEnabled) {
      // validate the passcode against the backend (it is also the staff API key)
      setBusy(true)
      try {
        await api.staffStats(code)
        onEnter(code)
      } catch {
        setErr(true)
      } finally {
        setBusy(false)
      }
    } else if (code === STAFF_PASSCODE) {
      onEnter(code)
    } else {
      setErr(true)
    }
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
          <button className="btn-primary" disabled={code.length === 0 || busy} onClick={submit} style={{ marginTop: 6 }}>
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
  tier?: RushTier
}

/** Per-order tracking view — the staff-side counterpart to the customer Track
 *  screen: live map, current stage, driver, and the full stage timeline. */
function StaffTrack({ row, lang, onBack }: { row: BoardRow; lang: 'en' | 'ar'; onBack: () => void }) {
  const { t } = useI18n()
  const now = useNow(250)

  const elapsed = (now - row.createdAt) / 1000
  const stage = Math.min(STAGE_COUNT - 1, Math.floor(elapsed / STAGE_SECONDS))
  const frac = Math.max(0, Math.min(1, elapsed / STAGE_SECONDS - stage))
  const delivered = stage >= STAGE_COUNT - 1
  const etaTs = row.createdAt + CYCLE_MS
  const driver = t('track.driver.name')

  return (
    <>
      <button className="staff-track-back" onClick={onBack}>
        <Close size={17} /> {t('staff.orders.back')}
      </button>

      <RouteMap stage={stage} frac={frac} />

      <div className="track-head">
        <div className="th-status">
          <span className={`th-pulse ${delivered ? 'done' : ''}`} />
          {row.id} · {t(`st.${stage}.t`)}
        </div>
        <div className="th-desc">{t(`st.${stage}.d`, { driver })}</div>
        <div className="th-eta">
          <span>{delivered ? t('track.done') : t('track.arriving')}</span>
          <strong>{delivered ? formatClock(etaTs, lang) : formatCountdown(etaTs - now)}</strong>
        </div>
      </div>

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

      <div className="timeline">
        {Array.from({ length: STAGE_COUNT }).map((_, i) => {
          const state = i < stage ? 'done' : i === stage ? 'active' : 'todo'
          const ts = row.createdAt + i * STAGE_SECONDS * 1000
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

      <div className="card-group">
        <div className="row">
          <span className="row-ic"><Pin /></span>
          <span className="row-body">
            <span className="label">{t('track.address')}</span>
            <span className="value" style={{ whiteSpace: 'normal' }}>{row.address}</span>
          </span>
        </div>
        <div className="row">
          <span className="row-ic"><Route /></span>
          <span className="row-body">
            <span className="label">{t('staff.orders.weight')}</span>
            <span className="value">{row.kg} kg</span>
          </span>
        </div>
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

/** Live order board backed by the staff API — lists every customer's order and
 *  lets staff advance an order through the pipeline (auto-refreshes every 5s). */
function ApiOrdersView({ staffKey }: { lang: 'en' | 'ar'; staffKey: string }) {
  const { t } = useI18n()
  const [orders, setOrders] = useState<ApiStaffOrder[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    try {
      const r = await api.staffOrders(staffKey)
      setOrders(r.orders)
    } catch {
      setOrders([])
    }
  }
  useEffect(() => {
    load()
    const iv = setInterval(load, 5000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffKey])

  async function advance(id: string) {
    setBusyId(id)
    try {
      await api.staffAdvance(staffKey, id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  if (orders === null) return <div className="staff-card center" style={{ padding: 28 }}>{t('staff.orders.loading')}</div>

  const active = orders.filter((o) => !o.delivered).length
  const delivered = orders.length - active
  const counts = Array.from({ length: STAGE_COUNT }, (_, i) => orders.filter((o) => o.stage === i).length)

  return (
    <>
      <div className="staff-live"><span className="staff-live-dot" /> {t('staff.orders.live')}</div>
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
      {orders.length === 0 && <div className="staff-card center" style={{ padding: 22 }}>{t('staff.orders.empty')}</div>}
      <div className="ops-list">
        {orders.map((o) => (
          <div key={o.id} className="ops-card static">
            <div className="ops-top">
              <span className="ops-id">{o.id}</span>
              <span className={`ops-eta ${o.delivered ? 'done' : ''}`}>
                {o.delivered ? (
                  <>
                    <Check size={13} /> {t('track.done')}
                  </>
                ) : (
                  t(`st.${o.stage}.t`)
                )}
              </span>
            </div>
            <div className="ops-addr">
              <Pin size={13} /> {o.customer.name} · {o.customer.email}
            </div>
            <div className="ops-pips">
              {Array.from({ length: STAGE_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className={`ops-pip ${i <= o.stage ? (o.delivered ? 'done' : 'fill') : ''} ${
                    i === o.stage && !o.delivered ? 'active' : ''
                  }`}
                />
              ))}
            </div>
            {!o.delivered && (
              <button className="ops-advance" disabled={busyId === o.id} onClick={() => advance(o.id)}>
                {t('staff.orders.advance')} →
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

/** Picks the live server board (staff API) when available, else the local demo board. */
function OrdersView({ lang, staffKey }: { lang: 'en' | 'ar'; staffKey: string | null }) {
  return (
    <>
      <RushCounterBanner />
      {apiEnabled && staffKey ? <ApiOrdersView lang={lang} staffKey={staffKey} /> : <LocalOrdersView lang={lang} />}
    </>
  )
}

/** Live count of accepted Express + Urgent orders today vs. the daily cap. */
function RushCounterBanner() {
  const { t } = useI18n()
  const { settings, countToday } = useRush()
  const full = countToday >= settings.dailyCap
  return (
    <div className={`rush-bar${full ? ' full' : ''}`}>
      <span className="rush-bar-l">{t('staff.rush')}</span>
      <span className="rush-bar-c">
        <b>{countToday}</b> / {settings.dailyCap}
      </span>
    </div>
  )
}

function LocalOrdersView({ lang }: { lang: 'en' | 'ar' }) {
  const { t } = useI18n()
  const { orders } = useStore()
  const now = useNow(500)
  const [selected, setSelected] = useState<BoardRow | null>(null)

  const stageAt = (createdAt: number) =>
    Math.min(STAGE_COUNT - 1, Math.floor((now - createdAt) / 1000 / STAGE_SECONDS))

  const rows: BoardRow[] = useMemo(() => {
    // Real orders coming from the customer app.
    const fromApp: BoardRow[] = orders.map((o) => {
      const stage = orderStage(o, now)
      return { id: o.id, kg: orderKg(o.id), address: o.address, createdAt: o.createdAt, stage, delivered: stage >= STAGE_COUNT - 1, tier: o.tier }
    })
    // Synthetic fleet that keeps cycling through the pipeline.
    const fleet: BoardRow[] = liveFleet.map((lo) => {
      const frac = ((now / CYCLE_MS) + lo.phase) % 1
      const createdAt = now - frac * CYCLE_MS
      const stage = stageAt(createdAt)
      return { id: lo.id, kg: lo.kg, address: bi(lo.address, lang), createdAt, stage, delivered: stage >= STAGE_COUNT - 1 }
    })
    // Active first, then rush (Urgent above Express), then closest to delivery.
    const rank = (r: BoardRow) => (r.tier === 'urgent' ? 2 : r.tier === 'express' ? 1 : 0)
    return [...fleet, ...fromApp].sort(
      (a, b) => Number(a.delivered) - Number(b.delivered) || rank(b) - rank(a) || b.stage - a.stage,
    )
  }, [orders, now, lang])

  const active = rows.filter((r) => !r.delivered).length
  const delivered = rows.length - active
  const counts = Array.from({ length: STAGE_COUNT }, (_, i) => rows.filter((r) => r.stage === i).length)

  if (selected) return <StaffTrack row={selected} lang={lang} onBack={() => setSelected(null)} />

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
          <button key={r.id} className="ops-card" onClick={() => setSelected(r)}>
            <div className="ops-top">
              <span className="ops-idwrap">
                <span className="ops-id">{r.id}</span>
                {(r.tier === 'express' || r.tier === 'urgent') && (
                  <span className="rush-chip" style={{ background: TIERS[r.tier].color }}>
                    {r.tier === 'urgent' ? 'URGENT' : 'EXPRESS'}
                  </span>
                )}
              </span>
              <span className="ops-right">
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
                <Chevron className="ops-chev" size={18} />
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
          </button>
        ))}
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

/* ---------- Admin console ---------- */

/** Live view of the staff-managed customer roster. */
function useCustomers() {
  const [, force] = useState(0)
  useEffect(() => subscribeCustomers(() => force((n) => n + 1)), [])
  return getCustomers()
}

/** Configure customer-app plan pricing / allowance. */
function PlanConfigCard({ plan }: { plan: Plan }) {
  const { t, lang } = useI18n()
  const [price, setPrice] = useState(String(plan.priceKwd))
  const [cap, setCap] = useState(String(plan.items))
  // keep inputs in sync if the resolved plan changes elsewhere
  useEffect(() => {
    setPrice(String(plan.priceKwd))
    setCap(String(plan.items))
  }, [plan.priceKwd, plan.items])
  const dirty = Number(price) !== plan.priceKwd || Math.round(Number(cap)) !== plan.items

  return (
    <div className="adm-plan">
      <div className="adm-plan-name">
        <span className={`dot-plan ${plan.id}`} />
        {planName(plan, lang)}
      </div>
      <div className="adm-two">
        <label className="adm-field">
          <span>{t('admin.config.price')}</span>
          <input type="number" inputMode="decimal" min={0} step={1} value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>{t('admin.config.cap')}</span>
          <input type="number" inputMode="numeric" min={0} step={5} value={cap} onChange={(e) => setCap(e.target.value)} />
        </label>
      </div>
      <button
        className="btn-ghost adm-save"
        disabled={!dirty}
        onClick={() => setPlanOverride(plan.id, { priceKwd: Number(price), items: Math.round(Number(cap)) })}
      >
        {dirty ? t('admin.save') : t('admin.saved')}
      </button>
    </div>
  )
}

function RushConfigCard() {
  const { t } = useI18n()
  const { settings, countToday } = useRush()
  const [express, setExpress] = useState(String(settings.expressFee))
  const [urgent, setUrgent] = useState(String(settings.urgentFee))
  const [cap, setCap] = useState(String(settings.dailyCap))
  useEffect(() => {
    setExpress(String(settings.expressFee))
    setUrgent(String(settings.urgentFee))
    setCap(String(settings.dailyCap))
  }, [settings.expressFee, settings.urgentFee, settings.dailyCap])
  const dirty =
    Number(express) !== settings.expressFee ||
    Number(urgent) !== settings.urgentFee ||
    Math.round(Number(cap)) !== settings.dailyCap

  return (
    <div className="staff-card">
      <div className="adm-two">
        <label className="adm-field">
          <span><span className="rs-dot" style={{ background: TIERS.express.color }} /> {t('admin.config.expressFee')}</span>
          <input type="number" inputMode="decimal" min={0} step={0.5} value={express} onChange={(e) => setExpress(e.target.value)} />
        </label>
        <label className="adm-field">
          <span><span className="rs-dot" style={{ background: TIERS.urgent.color }} /> {t('admin.config.urgentFee')}</span>
          <input type="number" inputMode="decimal" min={0} step={0.5} value={urgent} onChange={(e) => setUrgent(e.target.value)} />
        </label>
      </div>
      <label className="adm-field">
        <span>{t('admin.config.rushCap')} · {t('admin.config.usedToday', { n: countToday })}</span>
        <input type="number" inputMode="numeric" min={0} step={1} value={cap} onChange={(e) => setCap(e.target.value)} />
      </label>
      <button
        className="btn-ghost adm-save"
        disabled={!dirty}
        onClick={() => setRushSettings({ expressFee: Number(express), urgentFee: Number(urgent), dailyCap: Math.round(Number(cap)) })}
      >
        {dirty ? t('admin.save') : t('admin.saved')}
      </button>
    </div>
  )
}

function AnnouncementCard() {
  const { t } = useI18n()
  const { announcement } = useAppConfig()
  const [en, setEn] = useState(announcement.en)
  const [ar, setAr] = useState(announcement.ar)
  const [tone, setTone] = useState<AnnouncementTone>(announcement.tone)
  const dirty = en !== announcement.en || ar !== announcement.ar || tone !== announcement.tone

  return (
    <div className="staff-card">
      <div className="adm-toggle-row">
        <span>{t('admin.config.announceOn')}</span>
        <Toggle on={announcement.on} onChange={(v) => setAnnouncement({ on: v })} />
      </div>
      <label className="adm-field">
        <span>{t('admin.config.announceEn')}</span>
        <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="20% off Premium this week" />
      </label>
      <label className="adm-field">
        <span>{t('admin.config.announceAr')}</span>
        <input value={ar} dir="rtl" onChange={(e) => setAr(e.target.value)} placeholder="خصم ٢٠٪ على بريميوم هذا الأسبوع" />
      </label>
      <div className="adm-seg">
        {(['promo', 'info'] as AnnouncementTone[]).map((tn) => (
          <button key={tn} className={`adm-seg-btn ${tone === tn ? 'on' : ''}`} onClick={() => setTone(tn)}>
            {t(`admin.tone.${tn}`)}
          </button>
        ))}
      </div>
      <button
        className="btn-ghost adm-save"
        disabled={!dirty}
        onClick={() => setAnnouncement({ en: en.trim(), ar: ar.trim(), tone })}
      >
        {dirty ? t('admin.save') : t('admin.saved')}
      </button>
    </div>
  )
}

function DiscountsSection() {
  const { t } = useI18n()
  const { discounts } = useDiscounts()
  const [code, setCode] = useState('')
  const [kind, setKind] = useState<DiscountKind>('percent')
  const [value, setValue] = useState('10')
  const [scope, setScope] = useState<DiscountScope>('plans')
  const [err, setErr] = useState(false)

  function create() {
    const res = addDiscount({ code, kind, value: Number(value), scope })
    if (res) {
      setCode('')
      setValue(kind === 'percent' ? '10' : '5')
      setErr(false)
    } else {
      setErr(true)
    }
  }

  function offLabel(d: Discount): string {
    return d.kind === 'percent' ? `${d.value}%` : `${d.value.toFixed(3)} KWD`
  }

  return (
    <>
      <div className="staff-card">
        <div className="adm-two">
          <label className="adm-field">
            <span>{t('admin.disc.code')}</span>
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(false) }}
              placeholder="SUMMER25"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
          <label className="adm-field">
            <span>{t('admin.disc.value')}</span>
            <input type="number" inputMode="decimal" min={0} step={kind === 'percent' ? 1 : 0.5} value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
        </div>
        <div className="adm-seg">
          {(['percent', 'fixed'] as DiscountKind[]).map((k) => (
            <button key={k} className={`adm-seg-btn ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>
              {t(`admin.disc.${k}`)}
            </button>
          ))}
        </div>
        <div className="adm-seg">
          {(['plans', 'rush', 'all'] as DiscountScope[]).map((sc) => (
            <button key={sc} className={`adm-seg-btn ${scope === sc ? 'on' : ''}`} onClick={() => setScope(sc)}>
              {t(`admin.disc.scope.${sc}`)}
            </button>
          ))}
        </div>
        {err && <p className="field-err">{t('admin.disc.dup')}</p>}
        <button className="btn-primary adm-save" disabled={!code.trim() || !(Number(value) > 0)} onClick={create}>
          {t('admin.disc.add')}
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="staff-card center" style={{ padding: 20 }}>{t('admin.disc.empty')}</div>
      ) : (
        <div className="card-group">
          {discounts.map((d) => (
            <div key={d.code} className={`adm-disc-row ${d.active ? '' : 'off'}`}>
              <div className="adm-disc-main">
                <span className="promo-tag">{d.code}</span>
                <span className="adm-disc-meta">
                  {offLabel(d)} · {t(`admin.disc.scope.${d.scope}`)} · {t('admin.disc.uses', { n: d.uses })}
                </span>
              </div>
              <button
                className={`adm-disc-toggle ${d.active ? 'on' : ''}`}
                onClick={() => toggleDiscount(d.code)}
              >
                {d.active ? t('admin.disc.active') : t('admin.disc.paused')}
              </button>
              <button className="adm-disc-del" onClick={() => removeDiscount(d.code)} aria-label={t('admin.disc.delete')}>
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/** One manageable customer in the roster. */
function CustomerCard({ cust, plans, onToast }: { cust: Customer; plans: Plan[]; onToast: (m: string) => void }) {
  const { t, lang } = useI18n()
  const plan = plans.find((p) => p.id === cust.planId)
  return (
    <div className="staff-card adm-cust">
      <div className="adm-cust-head">
        <span className="adm-cust-avatar">{cust.name.charAt(0)}</span>
        <div>
          <div className="adm-cust-name">
            {cust.name}
            {cust.frozen && <span className="adm-frozen">{t('admin.cust.frozen')}</span>}
          </div>
          <div className="adm-cust-email">{cust.area}</div>
        </div>
      </div>
      <div className="adm-cust-stats">
        <div><b>{plan ? planName(plan, lang) : cust.planId}</b><span>{t('admin.cust.plan')}</span></div>
        <div><b>{cust.itemsUsed}</b><span>{t('admin.cust.items')}</span></div>
        <div><b>{cust.credit.toFixed(3)}</b><span>{t('admin.cust.credit')}</span></div>
      </div>
      <div className="adm-cust-actions">
        <button className="btn-ghost" onClick={() => { grantCustomerCredit(cust.id, 5); onToast(t('admin.cust.grantedCredit')) }}>
          {t('admin.cust.addCredit')}
        </button>
        <button className="btn-ghost" onClick={() => toggleFreeze(cust.id)}>
          {cust.frozen ? t('admin.cust.unfreeze') : t('admin.cust.freeze')}
        </button>
      </div>
    </div>
  )
}

function CustomersSection({ plans }: { plans: Plan[] }) {
  const { t, lang } = useI18n()
  const { user, activePlan, points, credit, freeMonths, frozen, grantCredit, grantFreeMonths, freeze, showToast } = useStore()
  const customers = useCustomers()

  return (
    <>
      {user && (
        <>
          <div className="section-title staff-sec">{t('admin.cust.live')}</div>
          <div className="staff-card adm-cust">
            <div className="adm-cust-head">
              <span className="adm-cust-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <div>
                <div className="adm-cust-name">
                  {user.name}
                  {frozen && <span className="adm-frozen">{t('admin.cust.frozen')}</span>}
                </div>
                <div className="adm-cust-email">{user.email}</div>
              </div>
            </div>
            <div className="adm-cust-stats">
              <div><b>{activePlan ? planName(activePlan, lang) : t('admin.cust.noPlan')}</b><span>{t('admin.cust.plan')}</span></div>
              <div><b>{points}</b><span>{t('admin.cust.points')}</span></div>
              <div><b>{credit.toFixed(3)}</b><span>{t('admin.cust.credit')}</span></div>
              <div><b>{freeMonths}</b><span>{t('admin.cust.freeMonths')}</span></div>
            </div>
            <div className="adm-cust-actions">
              <button className="btn-ghost" onClick={() => { grantCredit(5); showToast(t('admin.cust.grantedCredit')) }}>
                {t('admin.cust.addCredit')}
              </button>
              <button className="btn-ghost" onClick={() => { grantFreeMonths(1); showToast(t('admin.cust.grantedMonth')) }}>
                {t('admin.cust.freeMonth')}
              </button>
              <button className="btn-ghost" onClick={() => freeze(!frozen)}>
                {frozen ? t('admin.cust.unfreeze') : t('admin.cust.freeze')}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="section-title staff-sec">{t('admin.cust.roster')}</div>
      <div className="adm-plan-list">
        {customers.map((c) => (
          <CustomerCard key={c.id} cust={c} plans={plans} onToast={showToast} />
        ))}
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

/* ---------- Item pricing config (categories, add-ons, overage) ---------- */

function ItemCategoryCard({ cat }: { cat: ItemCategory }) {
  const { t, lang } = useI18n()
  const [mult, setMult] = useState(String(cat.multiplier))
  const [kg, setKg] = useState(String(cat.kgEst))
  const [cost, setCost] = useState(String(cat.costKwd))
  useEffect(() => {
    setMult(String(cat.multiplier))
    setKg(String(cat.kgEst))
    setCost(String(cat.costKwd))
  }, [cat.multiplier, cat.kgEst, cat.costKwd])
  const dirty = Number(mult) !== cat.multiplier || Number(kg) !== cat.kgEst || Number(cost) !== cat.costKwd

  return (
    <div className="adm-plan">
      <div className="adm-plan-name">{categoryName(cat, lang)}</div>
      <div className="adm-three">
        <label className="adm-field">
          <span>{t('admin.items.mult')}</span>
          <input type="number" inputMode="numeric" min={1} step={1} value={mult} onChange={(e) => setMult(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>{t('admin.items.kg')}</span>
          <input type="number" inputMode="decimal" min={0} step={0.1} value={kg} onChange={(e) => setKg(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>{t('admin.items.cost')}</span>
          <input type="number" inputMode="decimal" min={0} step={0.05} value={cost} onChange={(e) => setCost(e.target.value)} />
        </label>
      </div>
      <button
        className="btn-ghost adm-save"
        disabled={!dirty}
        onClick={() => setCategory(cat.id, { multiplier: Number(mult), kgEst: Number(kg), costKwd: Number(cost) })}
      >
        {dirty ? t('admin.save') : t('admin.saved')}
      </button>
    </div>
  )
}

function AddOnCard({ addon }: { addon: AddOn }) {
  const { t, lang } = useI18n()
  const [price, setPrice] = useState(String(addon.priceKwd))
  const [kg, setKg] = useState(String(addon.kgEst))
  const [cost, setCost] = useState(String(addon.costKwd))
  useEffect(() => {
    setPrice(String(addon.priceKwd))
    setKg(String(addon.kgEst))
    setCost(String(addon.costKwd))
  }, [addon.priceKwd, addon.kgEst, addon.costKwd])
  const dirty = Number(price) !== addon.priceKwd || Number(kg) !== addon.kgEst || Number(cost) !== addon.costKwd

  return (
    <div className="adm-plan">
      <div className="adm-plan-name">{addOnName(addon, lang)}</div>
      <div className="adm-three">
        <label className="adm-field">
          <span>{t('admin.items.price')}</span>
          <input type="number" inputMode="decimal" min={0} step={0.5} value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>{t('admin.items.kg')}</span>
          <input type="number" inputMode="decimal" min={0} step={0.1} value={kg} onChange={(e) => setKg(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>{t('admin.items.cost')}</span>
          <input type="number" inputMode="decimal" min={0} step={0.05} value={cost} onChange={(e) => setCost(e.target.value)} />
        </label>
      </div>
      <button
        className="btn-ghost adm-save"
        disabled={!dirty}
        onClick={() => setAddOn(addon.id, { priceKwd: Number(price), kgEst: Number(kg), costKwd: Number(cost) })}
      >
        {dirty ? t('admin.save') : t('admin.saved')}
      </button>
    </div>
  )
}

function OverageCard() {
  const { t } = useI18n()
  const cfg = useItemsConfig()
  const [fee, setFee] = useState(String(cfg.overagePerItem))
  useEffect(() => setFee(String(cfg.overagePerItem)), [cfg.overagePerItem])
  const dirty = Number(fee) !== cfg.overagePerItem
  return (
    <div className="staff-card">
      <label className="adm-field">
        <span>{t('admin.items.overage')}</span>
        <input type="number" inputMode="decimal" min={0} step={0.05} value={fee} onChange={(e) => setFee(e.target.value)} />
      </label>
      <button className="btn-ghost adm-save" disabled={!dirty} onClick={() => setOveragePerItem(Number(fee))}>
        {dirty ? t('admin.save') : t('admin.saved')}
      </button>
    </div>
  )
}

function ItemsConfigSection() {
  const { t } = useI18n()
  const cfg = useItemsConfig()
  return (
    <>
      <div className="section-title staff-sec">{t('admin.items.categories')}</div>
      <div className="adm-plan-list">
        {cfg.categories.map((c) => <ItemCategoryCard key={c.id} cat={c} />)}
      </div>
      <div className="section-title staff-sec">{t('admin.items.overageTitle')}</div>
      <OverageCard />
      <div className="section-title staff-sec">{t('admin.items.addons')}</div>
      <div className="adm-plan-list">
        {cfg.addOns.map((a) => <AddOnCard key={a.id} addon={a} />)}
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

/* ---------- Margin report (internal costing) ---------- */

const INTAKES_KEY = 'pressd-pos:intakes:v4'

function readIntakes(): Intake[] {
  try {
    const raw = localStorage.getItem(INTAKES_KEY)
    const a = raw ? JSON.parse(raw) : []
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

interface Agg {
  items: number
  kg: number
  cost: number
  addOnRev: number
  overageRev: number
  rushRev: number
  members: Set<string>
}

function emptyAgg(): Agg {
  return { items: 0, kg: 0, cost: 0, addOnRev: 0, overageRev: 0, rushRev: 0, members: new Set() }
}

function MarginReport({ plans }: { plans: Plan[] }) {
  const { t, lang } = useI18n()
  useItemsConfig() // re-render if costing config changes
  useNow(4000) // refresh so newly logged POS intakes show up
  const intakes = readIntakes()

  const byPlan = new Map<string, Agg>()
  const byMember = new Map<string, { name: string; planId: string; agg: Agg }>()
  for (const i of intakes) {
    const pa = byPlan.get(i.planId) ?? emptyAgg()
    pa.items += i.items || 0
    pa.kg += i.estKg || 0
    pa.cost += i.estCost || 0
    pa.addOnRev += i.addOnCharge || 0
    pa.overageRev += i.overageCharge || 0
    pa.rushRev += i.rushFee || 0
    pa.members.add(i.memberId)
    byPlan.set(i.planId, pa)

    const me = byMember.get(i.memberId) ?? { name: i.memberName, planId: i.planId, agg: emptyAgg() }
    me.agg.items += i.items || 0
    me.agg.kg += i.estKg || 0
    me.agg.cost += i.estCost || 0
    me.agg.addOnRev += i.addOnCharge || 0
    me.agg.overageRev += i.overageCharge || 0
    me.agg.rushRev += i.rushFee || 0
    byMember.set(i.memberId, me)
  }

  const priceOf = (id: string) => {
    const p = plans.find((x) => x.id === id)
    return p ? planPrice(p, 'monthly') : 0
  }
  // Revenue for a plan row = one month's subscription per active member + extras.
  const planRevenue = (id: string, a: Agg) => a.members.size * priceOf(id) + a.addOnRev + a.overageRev + a.rushRev
  const memberRevenue = (planId: string, a: Agg) => priceOf(planId) + a.addOnRev + a.overageRev + a.rushRev

  const planRows = plans
    .map((p) => ({ p, a: byPlan.get(p.id) }))
    .filter((r) => r.a && r.a.members.size > 0) as { p: Plan; a: Agg }[]

  if (intakes.length === 0) {
    return <div className="staff-card center" style={{ padding: 20 }}>{t('admin.report.empty')}</div>
  }

  return (
    <>
      <div className="section-title staff-sec">{t('admin.report.byPlan')}</div>
      <div className="adm-plan-list">
        {planRows.map(({ p, a }) => {
          const rev = planRevenue(p.id, a)
          const margin = rev - a.cost
          const marginPct = rev > 0 ? Math.round((margin / rev) * 100) : 0
          return (
            <div key={p.id} className="staff-card rep-card">
              <div className="rep-head">
                <span className="rep-name"><span className={`dot-plan ${p.id}`} /> {planName(p, lang)}</span>
                <span className={`rep-margin ${margin >= 0 ? 'pos' : 'neg'}`}>{margin.toFixed(3)} KWD · {marginPct}%</span>
              </div>
              <div className="rep-grid">
                <div><b>{a.members.size}</b><span>{t('admin.report.members')}</span></div>
                <div><b>{a.items}</b><span>{t('admin.report.items')}</span></div>
                <div><b>{a.kg.toFixed(1)}</b><span>{t('admin.report.kg')}</span></div>
                <div><b>{rev.toFixed(1)}</b><span>{t('admin.report.rev')}</span></div>
                <div><b>{a.cost.toFixed(1)}</b><span>{t('admin.report.cost')}</span></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-title staff-sec">{t('admin.report.byCustomer')}</div>
      <div className="adm-plan-list">
        {[...byMember.entries()].map(([id, m]) => {
          const rev = memberRevenue(m.planId, m.agg)
          const margin = rev - m.agg.cost
          return (
            <div key={id} className="staff-card rep-card">
              <div className="rep-head">
                <span className="rep-name">{m.name}</span>
                <span className={`rep-margin ${margin >= 0 ? 'pos' : 'neg'}`}>{margin.toFixed(3)} KWD</span>
              </div>
              <div className="rep-grid">
                <div><b>{m.agg.items}</b><span>{t('admin.report.items')}</span></div>
                <div><b>{m.agg.kg.toFixed(1)}</b><span>{t('admin.report.kg')}</span></div>
                <div><b>{m.agg.cost.toFixed(1)}</b><span>{t('admin.report.cost')}</span></div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

function AdminView() {
  const { t } = useI18n()
  const { plans } = useAppConfig()
  const [sub, setSub] = useState<'config' | 'items' | 'report' | 'discounts' | 'customers'>('config')

  return (
    <>
      <div className="adm-subnav">
        <button className={sub === 'config' ? 'on' : ''} onClick={() => setSub('config')}>{t('admin.sub.config')}</button>
        <button className={sub === 'items' ? 'on' : ''} onClick={() => setSub('items')}>{t('admin.sub.items')}</button>
        <button className={sub === 'report' ? 'on' : ''} onClick={() => setSub('report')}>{t('admin.sub.report')}</button>
        <button className={sub === 'discounts' ? 'on' : ''} onClick={() => setSub('discounts')}>{t('admin.sub.discounts')}</button>
        <button className={sub === 'customers' ? 'on' : ''} onClick={() => setSub('customers')}>{t('admin.sub.customers')}</button>
      </div>

      <div className="anim-in" key={sub}>
        {sub === 'config' && (
          <>
            <div className="section-title staff-sec">{t('admin.config.plans')}</div>
            <div className="adm-plan-list">
              {plans.map((p) => <PlanConfigCard key={p.id} plan={p} />)}
            </div>
            <div className="section-title staff-sec">{t('admin.config.rush')}</div>
            <RushConfigCard />
            <div className="section-title staff-sec">{t('admin.config.announce')}</div>
            <AnnouncementCard />
            <div style={{ height: 12 }} />
          </>
        )}
        {sub === 'items' && <ItemsConfigSection />}
        {sub === 'report' && <MarginReport plans={plans} />}
        {sub === 'discounts' && <DiscountsSection />}
        {sub === 'customers' && <CustomersSection plans={plans} />}
      </div>
    </>
  )
}

/* ---------- Action center (alerts + shift notes) ---------- */

type Severity = 'critical' | 'warning' | 'info'
/** Where an alert is routed. 'both' shows under Customers *and* POS. */
type Audience = 'customer' | 'pos' | 'both'
interface Alert {
  id: string
  sev: Severity
  title: string
  detail: string
  audience: Audience
}
const SEV_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 }

/** Does an alert belong to the given branch (customers vs pos)? */
function inBranch(a: Alert, branch: 'customer' | 'pos'): boolean {
  return a.audience === 'both' || a.audience === branch
}

function startOfTodayMs(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Live list of operational alerts derived from current state. Shared so the
 *  portal can badge the Alerts tab with the open (critical + warning) count. */
function useAlerts(): Alert[] {
  const { t } = useI18n()
  const now = useNow(2000)
  const { settings, ledger, countToday, capReached } = useRush()
  const customers = useCustomers()
  const { plans } = useAppConfig()
  const { discounts } = useDiscounts()

  return useMemo(() => {
    const capOf = (id: string) => plans.find((p) => p.id === id)?.items ?? Infinity
    const over = customers.filter((c) => c.itemsUsed > capOf(c.planId))
    const frozen = customers.filter((c) => c.frozen)
    const todayStart = startOfTodayMs()
    const late = ledger.filter((e) => e.ts >= todayStart && readyBy(e.tier, e.ts) < now)
    const activeDisc = discounts.filter((d) => d.active).length
    const nearCap = settings.dailyCap > 0 && !capReached && countToday / settings.dailyCap >= 0.8

    const list: Alert[] = []
    if (capReached) {
      // Customers can't book rush; the facility (POS) also needs to know.
      list.push({ id: 'cap', sev: 'critical', audience: 'both', title: t('alerts.cap.title'), detail: t('alerts.cap.detail', { used: countToday, cap: settings.dailyCap }) })
    } else if (nearCap) {
      list.push({ id: 'capNear', sev: 'warning', audience: 'pos', title: t('alerts.capNear.title'), detail: t('alerts.capNear.detail', { used: countToday, cap: settings.dailyCap }) })
    }
    if (late.length) {
      // Facility must prioritise these — a POS/ops concern.
      list.push({ id: 'late', sev: 'critical', audience: 'pos', title: t('alerts.late.title', { n: late.length }), detail: t('alerts.late.detail') })
    }
    if (over.length) {
      // Nudge the customer about extra items; POS bills the overage.
      list.push({ id: 'over', sev: 'warning', audience: 'both', title: t('alerts.over.title', { n: over.length }), detail: over.map((c) => c.name).slice(0, 3).join(', ') })
    }
    if (frozen.length) {
      list.push({ id: 'frozen', sev: 'info', audience: 'pos', title: t('alerts.frozen.title', { n: frozen.length }), detail: frozen.map((c) => c.name).slice(0, 3).join(', ') })
    }
    if (activeDisc) {
      // A promo customers can redeem.
      list.push({ id: 'disc', sev: 'info', audience: 'customer', title: t('alerts.disc.title', { n: activeDisc }), detail: t('alerts.disc.detail') })
    }
    return list.sort((a, b) => SEV_RANK[a.sev] - SEV_RANK[b.sev])
  }, [t, now, settings.dailyCap, ledger, countToday, capReached, customers, plans, discounts])
}

function useShiftNotes() {
  const [, force] = useState(0)
  useEffect(() => subscribeShiftNotes(() => force((n) => n + 1)), [])
  return getShiftNotes()
}

function relTime(ts: number, now: number, t: (k: string, v?: Record<string, string | number>) => string): string {
  const mins = Math.round((now - ts) / 60000)
  if (mins < 1) return t('alerts.note.now')
  if (mins < 60) return t('alerts.note.min', { n: mins })
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return t('alerts.note.hr', { n: hrs })
  return t('alerts.note.day', { n: Math.round(hrs / 24) })
}

function AlertsView() {
  const { t } = useI18n()
  const now = useNow(30000)
  const alerts = useAlerts()
  const { countToday } = useRush()
  const { orders } = useStore()
  const notes = useShiftNotes()
  const [draft, setDraft] = useState('')
  // The "branch": which channel's alerts + messages we're viewing.
  const [branch, setBranch] = useState<'customer' | 'pos'>('customer')
  const { list: channelMsgs } = useNotifications(branch)
  const [msg, setMsg] = useState('')

  function sendMsg() {
    if (!msg.trim()) return
    sendNotification({ text: msg, audience: branch })
    setMsg('')
  }

  const todayStart = startOfTodayMs()
  const ordersToday = orders.filter((o) => o.createdAt >= todayStart).length
  const openCount = alerts.filter((a) => a.sev !== 'info').length

  const customerAlerts = alerts.filter((a) => inBranch(a, 'customer'))
  const posAlerts = alerts.filter((a) => inBranch(a, 'pos'))
  const shown = branch === 'customer' ? customerAlerts : posAlerts

  const sevIcon = (sev: Severity) => (sev === 'info' ? <Info size={18} /> : <AlertTriangle size={18} />)

  return (
    <>
      <div className="ops-summary alerts-glance">
        <div className="ops-stat">
          <strong className={openCount > 0 ? 'accent' : 'green'}>{openCount}</strong>
          <span>{t('alerts.open')}</span>
        </div>
        <div className="ops-stat">
          <strong>{ordersToday}</strong>
          <span>{t('alerts.ordersToday')}</span>
        </div>
        <div className="ops-stat">
          <strong>{countToday}</strong>
          <span>{t('alerts.rushToday')}</span>
        </div>
      </div>

      <div className="section-title staff-sec">{t('alerts.section')}</div>

      {/* Branch: separate the alerts routed to customers vs. to the POS. */}
      <div className="adm-subnav alerts-branch">
        <button className={branch === 'customer' ? 'on' : ''} onClick={() => setBranch('customer')}>
          {t('alerts.branch.customers')}
          <span className="branch-count">{customerAlerts.length}</span>
        </button>
        <button className={branch === 'pos' ? 'on' : ''} onClick={() => setBranch('pos')}>
          {t('alerts.branch.pos')}
          <span className="branch-count">{posAlerts.length}</span>
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="alerts-clear">
          <span className="alerts-clear-ic"><Check size={22} /></span>
          <div>
            <div className="alerts-clear-t">{t('alerts.clear.title')}</div>
            <div className="alerts-clear-s">
              {branch === 'customer' ? t('alerts.clear.customers') : t('alerts.clear.pos')}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert-list">
          {shown.map((a) => (
            <div key={a.id} className={`alert-row ${a.sev}`}>
              <span className="alert-ic">{sevIcon(a.sev)}</span>
              <div className="alert-body">
                <div className="alert-title-row">
                  <span className="alert-title">{a.title}</span>
                  <span className={`alert-route ${a.audience}`}>{t(`alerts.route.${a.audience}`)}</span>
                </div>
                {a.detail && <div className="alert-detail">{a.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-title staff-sec">
        {branch === 'customer' ? t('alerts.msg.toCustomers') : t('alerts.msg.toPos')}
      </div>
      <div className="note-add">
        <input
          className="field"
          value={msg}
          placeholder={branch === 'customer' ? t('alerts.msg.phCustomer') : t('alerts.msg.phPos')}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMsg() }}
        />
        <button className="note-add-btn" disabled={!msg.trim()} onClick={sendMsg} aria-label={t('alerts.msg.send')}>
          <Bell size={18} />
        </button>
      </div>
      {channelMsgs.length === 0 ? (
        <div className="staff-card center" style={{ padding: 16 }}>{t('alerts.msg.empty')}</div>
      ) : (
        <div className="card-group">
          {channelMsgs.map((m) => (
            <div key={m.id} className="note-row">
              <div className="note-body">
                <div className="note-text">{m.text}</div>
                <div className="note-time">
                  {relTime(m.ts, now, t)}
                  {m.audience === 'both' && <span className="msg-both"> · {t('alerts.route.both')}</span>}
                </div>
              </div>
              <button className="note-del" onClick={() => removeNotification(m.id)} aria-label={t('alerts.msg.remove')}>
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="section-title staff-sec">{t('alerts.notes')}</div>
      <div className="note-add">
        <input
          className="field"
          value={draft}
          placeholder={t('alerts.note.ph')}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              addShiftNote(draft)
              setDraft('')
            }
          }}
        />
        <button
          className="note-add-btn"
          disabled={!draft.trim()}
          onClick={() => { addShiftNote(draft); setDraft('') }}
          aria-label={t('alerts.note.add')}
        >
          <Plus size={20} />
        </button>
      </div>
      {notes.length === 0 ? (
        <div className="staff-card center" style={{ padding: 18 }}>{t('alerts.note.empty')}</div>
      ) : (
        <div className="card-group">
          {notes.map((n) => (
            <div key={n.id} className="note-row">
              <div className="note-body">
                <div className="note-text">{n.text}</div>
                <div className="note-time">{relTime(n.ts, now, t)}</div>
              </div>
              <button className="note-del" onClick={() => removeShiftNote(n.id)} aria-label={t('alerts.note.remove')}>
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 12 }} />
    </>
  )
}

/* ---------- Message inbox ---------- */

function InboxView() {
  const { t } = useI18n()
  const now = useNow(30000)
  const all = useAllNotifications()
  // Opening the inbox (and new arrivals while open) clear the staff unread badge.
  useEffect(() => { markNotifSeen('staff') }, [all.length])

  const received = all.filter((n) => n.audience === 'staff').sort((a, b) => b.ts - a.ts)
  const sent = all.filter((n) => n.audience !== 'staff').sort((a, b) => b.ts - a.ts)

  const [view, setView] = useState<'received' | 'sent'>('received')
  const [draft, setDraft] = useState('')
  const [target, setTarget] = useState<NotifAudience>('customer')
  const rows = view === 'received' ? received : sent

  function send() {
    if (!draft.trim()) return
    sendNotification({ text: draft, audience: target })
    setDraft('')
    setView('sent')
  }

  return (
    <>
      <div className="adm-subnav alerts-branch">
        <button className={view === 'received' ? 'on' : ''} onClick={() => setView('received')}>
          {t('inbox.received')}<span className="branch-count">{received.length}</span>
        </button>
        <button className={view === 'sent' ? 'on' : ''} onClick={() => setView('sent')}>
          {t('inbox.sent')}<span className="branch-count">{sent.length}</span>
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="staff-card center" style={{ padding: 20 }}>
          {view === 'received' ? t('inbox.empty.received') : t('inbox.empty.sent')}
        </div>
      ) : (
        <div className="card-group">
          {rows.map((n) => (
            <div key={n.id} className="note-row">
              <div className="note-body">
                <div className="msg-head">
                  <span className={`alert-route ${n.audience === 'staff' ? 'pos' : n.audience}`}>
                    {n.audience === 'staff' ? t('inbox.fromPos') : `${t('inbox.to')} ${t('alerts.route.' + n.audience)}`}
                  </span>
                  <span className="note-time">{relTime(n.ts, now, t)}</span>
                </div>
                <div className="note-text">{n.text}</div>
              </div>
              <button className="note-del" onClick={() => removeNotification(n.id)} aria-label={t('alerts.msg.remove')}>
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="section-title staff-sec">{t('inbox.compose')}</div>
      <div className="adm-seg">
        {(['customer', 'pos', 'both'] as NotifAudience[]).map((a) => (
          <button key={a} className={`adm-seg-btn ${target === a ? 'on' : ''}`} onClick={() => setTarget(a)}>
            {t('alerts.route.' + a)}
          </button>
        ))}
      </div>
      <div className="note-add">
        <input
          className="field"
          value={draft}
          placeholder={t('inbox.compose.ph')}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
        />
        <button className="note-add-btn" disabled={!draft.trim()} onClick={send} aria-label={t('inbox.send')}>
          <Bell size={18} />
        </button>
      </div>
      <div style={{ height: 12 }} />
    </>
  )
}

/* ---------- Dashboard shell ---------- */

function StaffDashboard({ onExit, staffKey }: { onExit: () => void; staffKey: string | null }) {
  const { t, lang } = useI18n()
  const [tab, setTab] = useState<'kpi' | 'orders' | 'alerts' | 'inbox' | 'admin'>('kpi')
  const openAlerts = useAlerts().filter((a) => a.sev !== 'info').length
  const inboxUnread = useNotifications('staff').unread

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
        <div className="staff-top-actions">
          <NotificationsBell surface="staff" />
          <button className="round-btn" onClick={onExit} aria-label={t('staff.exit')}>
            <Close />
          </button>
        </div>
      </div>

      <div className="segmented staff-seg">
        <button className={`seg ${tab === 'kpi' ? 'on' : ''}`} onClick={() => setTab('kpi')}>
          <BarChart size={17} />
          {t('staff.tab.kpi')}
        </button>
        <button className={`seg ${tab === 'orders' ? 'on' : ''}`} onClick={() => setTab('orders')}>
          <Route size={17} />
          {t('staff.tab.orders')}
        </button>
        <button className={`seg ${tab === 'alerts' ? 'on' : ''}`} onClick={() => setTab('alerts')}>
          <span className="seg-ic-wrap">
            <Bell size={17} />
            {openAlerts > 0 && <span className="seg-badge">{openAlerts}</span>}
          </span>
          {t('staff.tab.alerts')}
        </button>
        <button className={`seg ${tab === 'inbox' ? 'on' : ''}`} onClick={() => setTab('inbox')}>
          <span className="seg-ic-wrap">
            <Mail size={17} />
            {inboxUnread > 0 && <span className="seg-badge">{inboxUnread}</span>}
          </span>
          {t('staff.tab.inbox')}
        </button>
        <button className={`seg ${tab === 'admin' ? 'on' : ''}`} onClick={() => setTab('admin')}>
          <Sliders size={17} />
          {t('staff.tab.admin')}
        </button>
      </div>

      <div className="screen">
        <div className="anim-in" key={tab}>
          {tab === 'kpi' ? (
            <KpiView lang={lang} />
          ) : tab === 'orders' ? (
            <OrdersView lang={lang} staffKey={staffKey} />
          ) : tab === 'alerts' ? (
            <AlertsView />
          ) : tab === 'inbox' ? (
            <InboxView />
          ) : (
            <AdminView />
          )}
        </div>
      </div>
    </>
  )
}

/* ---------- Entry point ---------- */

export default function Staff({ onExit }: { onExit: () => void }) {
  const [staffKey, setStaffKey] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)
  return authed ? (
    <StaffDashboard onExit={onExit} staffKey={staffKey} />
  ) : (
    <StaffGate
      onEnter={(key) => {
        setStaffKey(key)
        setAuthed(true)
      }}
      onExit={onExit}
    />
  )
}
