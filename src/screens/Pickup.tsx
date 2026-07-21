import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { slotLabel } from '../data/slots'
import { Toggle } from '../components/Common'
import { Sheet } from '../components/Sheet'
import { DateTimeSheet, RushCheckoutSheet } from '../components/DateTimeSheet'
import { tierFee, type RushTier } from '../data/rush'
import { useRush } from '../useRush'
import LocationPicker from '../components/LocationPicker'
import GarmentPicker from '../components/GarmentPicker'
import { ExtraKgBanner, ExtraKgSheet, useAllowance } from '../components/ExtraKg'
import { selectionPieces, selectionUnits, type GarmentSelection } from '../data/garments'
import {
  Basket,
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
  onConfirm: (opts?: { tier?: RushTier; rushFee?: number }) => void
  onSeePlans: () => void
}) {
  const s = useStore()
  const { t, lang } = useI18n()
  const { atLimit } = useAllowance()
  const { settings } = useRush()
  const [sheet, setSheet] = useState<Sheet>(null)
  const [extraOpen, setExtraOpen] = useState(false)
  const [garmentsOpen, setGarmentsOpen] = useState(false)
  const [garments, setGarments] = useState<GarmentSelection>({})
  const [rush, setRush] = useState<{ tier: 'express' | 'urgent'; fee: number } | null>(null)
  const gUnits = selectionUnits(garments)
  const gPieces = selectionPieces(garments)

  function confirm(opts?: { tier?: RushTier; rushFee?: number }) {
    if (gPieces > 0) s.addItemsUsed(gPieces)
    onConfirm(opts)
  }

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

        <button className="items-card" onClick={() => setGarmentsOpen(true)}>
          <span className="ic-ic"><Basket /></span>
          <span className="ic-body">
            <span className="ic-title">{t('garment.card.title')}</span>
            <span className="ic-sub">
              {gUnits > 0 ? t('garment.card.summary', { units: gUnits, pieces: gPieces }) : t('garment.card.empty')}
            </span>
          </span>
          <span className="ic-cta">{gUnits > 0 ? t('garment.card.edit') : t('garment.card.add')} ›</span>
        </button>

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

        {atLimit && <ExtraKgBanner onClick={() => setExtraOpen(true)} />}

        <div className="info-banner">
          <Info />
          {t('pickup.info')}
        </div>
        <div style={{ height: 4 }} />
      </div>

      <div className="bottom-cta">
        {gUnits === 0 && <div className="cta-note">{t('garment.card.required')}</div>}
        <button className="btn-primary" disabled={gUnits === 0} onClick={() => confirm()}>
          {t('pickup.confirm')}
        </button>
      </div>

      {sheet === 'pickup' && (
        <DateTimeSheet
          title={t('sheet.pickup')}
          onPick={(slot) => { s.setPickup(slot); setSheet(null) }}
          onRush={() => {}}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'delivery' && (
        <DateTimeSheet
          title={t('sheet.delivery')}
          showRush
          onPick={(slot) => { s.setDelivery(slot); setSheet(null) }}
          onRush={(tier, slot) => { s.setDelivery(slot); setSheet(null); setRush({ tier, fee: tierFee(tier, settings) }) }}
          onClose={() => setSheet(null)}
        />
      )}
      {rush && (
        <RushCheckoutSheet
          tier={rush.tier}
          fee={rush.fee}
          onPaid={() => { confirm({ tier: rush.tier, rushFee: rush.fee }); setRush(null) }}
          onClose={() => setRush(null)}
        />
      )}
      {sheet === 'address' && (
        <LocationPicker
          initialAddress={s.address}
          onSelect={(addr) => { s.setAddress(addr); setSheet(null) }}
          onClose={() => setSheet(null)}
        />
      )}
      {extraOpen && <ExtraKgSheet onClose={() => setExtraOpen(false)} />}
      {garmentsOpen && (
        <GarmentPicker
          initial={garments}
          onClose={() => setGarmentsOpen(false)}
          onDone={(sel) => { setGarments(sel); setGarmentsOpen(false) }}
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
    <Sheet onClose={onClose}>
      {(close) => (
        <>
          <div className="grabber" />
          <h3>{title}</h3>
          <div className="sheet-scroll">
            {multiline ? (
              <textarea className="field" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} autoFocus />
            ) : (
              <input className="field" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} autoFocus />
            )}
            <button className="btn-primary" onClick={() => close(() => onSave(v))}>
              {t('common.save')}
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}
