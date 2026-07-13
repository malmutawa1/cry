import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { pickupSlots, deliverySlots, slotLabel, type Slot } from '../data/slots'
import { Toggle } from '../components/Common'
import LocationPicker from '../components/LocationPicker'
import { ExtraKgSlots, useAllowance } from '../components/ExtraKg'
import {
  CalendarIn,
  CalendarOut,
  Chevron,
  Close,
  Hanger,
  Info,
  Note,
  Phone,
  Pin,
} from '../components/Icons'

type Sheet = null | 'pickup' | 'delivery' | 'address' | 'phone' | 'note'

export default function Pickup({
  onClose,
  onConfirm,
  onSeePlans,
}: {
  onClose: () => void
  onConfirm: () => void
  onSeePlans: () => void
}) {
  const s = useStore()
  const { t, lang } = useI18n()
  const { atLimit } = useAllowance()
  const [sheet, setSheet] = useState<Sheet>(null)

  if (!s.activePlan) {
    return (
      <>
        <div className="topbar" style={{ justifyContent: 'center' }}>
          <h1>{t('pickup.title')}</h1>
        </div>
        <div className="screen">
          <div className="empty">
            <div className="em-ic">
              <CalendarIn size={30} />
            </div>
            <h3>{t('pickup.none.title')}</h3>
            <p>{t('pickup.none.sub')}</p>
            <div style={{ height: 20 }} />
            <button className="btn-primary" style={{ maxWidth: 240, margin: '0 auto' }} onClick={onSeePlans}>
              {t('pickup.none.cta')}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onClose} aria-label="Close">
          <Close />
        </button>
        <h1>{t('pickup.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="screen">
        <div className="card-group">
          <button className="row" onClick={() => setSheet('address')}>
            <span className="row-ic"><Pin /></span>
            <span className="row-body">
              <span className="label">{t('pickup.address')}</span>
              <span className="value" style={{ whiteSpace: 'normal' }}>{s.address}</span>
            </span>
            <Chevron className="chev" />
          </button>
          <button className="row" onClick={() => setSheet('pickup')}>
            <span className="row-ic"><CalendarIn /></span>
            <span className="row-body">
              <span className="label">{t('pickup.pickup')}</span>
              <span className="value">{slotLabel(s.pickup, lang)}</span>
            </span>
            <Chevron className="chev" />
          </button>
          <button className="row" onClick={() => setSheet('delivery')}>
            <span className="row-ic"><CalendarOut /></span>
            <span className="row-body">
              <span className="label">{t('pickup.delivery')}</span>
              <span className="value">{slotLabel(s.delivery, lang)}</span>
            </span>
            <Chevron className="chev" />
          </button>
          <button className="row" onClick={() => setSheet('phone')}>
            <span className="row-ic"><Phone /></span>
            <span className="row-body">
              <span className="label">{t('pickup.phone')}</span>
              <span className="value" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{s.phone}</span>
            </span>
            <Chevron className="chev" />
          </button>
        </div>

        <div className="card-group">
          <div className="feature">
            <span className="row-ic">
              <span className="free-badge">{t('pickup.free')}</span>
              <Hanger />
            </span>
            <div style={{ flex: 1 }}>
              <div className="ft-title">{t('pickup.hangers')}</div>
              <div className="ft-sub">{t('pickup.hangers.sub')}</div>
            </div>
            <Toggle on={s.hangers} onChange={s.setHangers} />
          </div>
        </div>

        <div className="card-group">
          <button className="row" onClick={() => setSheet('note')}>
            <span className="row-ic"><Note /></span>
            <span className="row-body">
              <span className="ft-title" style={{ fontSize: 17 }}>{t('pickup.note')}</span>
              <span className="ft-sub">{s.note ? s.note : t('pickup.note.sub')}</span>
            </span>
            <Chevron className="chev" />
          </button>
        </div>

        {atLimit && <ExtraKgSlots />}

        <div className="info-banner">
          <Info />
          {t('pickup.info')}
        </div>
        <div style={{ height: 4 }} />
      </div>

      <div className="bottom-cta">
        <button className="btn-primary" onClick={onConfirm}>
          {t('pickup.confirm')}
        </button>
      </div>

      {sheet === 'pickup' && (
        <SlotSheet
          title={t('sheet.pickup')}
          options={pickupSlots}
          current={s.pickup.id}
          onPick={(slot) => { s.setPickup(slot); setSheet(null) }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'delivery' && (
        <SlotSheet
          title={t('sheet.delivery')}
          options={deliverySlots}
          current={s.delivery.id}
          onPick={(slot) => { s.setDelivery(slot); setSheet(null) }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'address' && (
        <LocationPicker
          initialAddress={s.address}
          onSelect={(addr) => { s.setAddress(addr); setSheet(null) }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'phone' && (
        <EditSheet title={t('sheet.phone')} value={s.phone} onSave={(v) => { s.setPhone(v); setSheet(null) }} onClose={() => setSheet(null)} />
      )}
      {sheet === 'note' && (
        <EditSheet title={t('sheet.note')} value={s.note} multiline placeholder={t('sheet.note.ph')} onSave={(v) => { s.setNote(v); setSheet(null) }} onClose={() => setSheet(null)} />
      )}
    </>
  )
}

function SlotSheet({
  title,
  options,
  current,
  onPick,
  onClose,
}: {
  title: string
  options: Slot[]
  current: string
  onPick: (s: Slot) => void
  onClose: () => void
}) {
  const { lang } = useI18n()
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{title}</h3>
        <div className="sheet-scroll">
          {options.map((o) => (
            <button key={o.id} className={`opt-row ${o.id === current ? 'active' : ''}`} onClick={() => onPick(o)}>
              <span className="o-day">{o.day[lang]}</span>
              <span className="o-time">{o.time[lang]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditSheet({
  title,
  value,
  onSave,
  onClose,
  multiline,
  placeholder,
}: {
  title: string
  value: string
  onSave: (v: string) => void
  onClose: () => void
  multiline?: boolean
  placeholder?: string
}) {
  const { t } = useI18n()
  const [v, setV] = useState(value)
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{title}</h3>
        <div className="sheet-scroll">
          {multiline ? (
            <textarea className="field" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} autoFocus />
          ) : (
            <input className="field" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} autoFocus />
          )}
          <button className="btn-primary" onClick={() => onSave(v)}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
