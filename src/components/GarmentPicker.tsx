import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import {
  garmentGroups,
  garmentName,
  groupName,
  selectionPieces,
  selectionUnits,
  type GarmentSelection,
} from '../data/garments'
import { Close, Minus, Plus, Search } from './Icons'

interface Props {
  initial?: GarmentSelection
  onClose: () => void
  onDone: (sel: GarmentSelection) => void
}

/** Full-screen sheet where the customer declares the garments they're sending.
 *  Each item counts as a set number of pieces; the total updates live. */
export default function GarmentPicker({ initial, onClose, onDone }: Props) {
  const { t, lang } = useI18n()
  const [sel, setSel] = useState<GarmentSelection>(initial ?? {})
  const [q, setQ] = useState('')

  const query = q.trim().toLowerCase()
  const groups = useMemo(
    () =>
      garmentGroups
        .map((g) => ({
          ...g,
          items: query
            ? g.items.filter((it) => it.name.toLowerCase().includes(query) || it.nameAr.includes(q.trim()))
            : g.items,
        }))
        .filter((g) => g.items.length > 0),
    [q, query],
  )

  const pieces = selectionPieces(sel)
  const units = selectionUnits(sel)

  function bump(id: string, d: number) {
    setSel((prev) => {
      const next = { ...prev }
      const v = Math.max(0, (prev[id] || 0) + d)
      if (v === 0) delete next[id]
      else next[id] = v
      return next
    })
  }

  return (
    <div className="gsheet">
      <div className="gsheet-top">
        <button className="round-btn" onClick={onClose} aria-label={t('common.back')}><Close /></button>
        <h1>{t('garment.pick.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="gsheet-search">
        <span className="g"><Search size={16} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('garment.search')} />
      </div>

      <div className="gsheet-scroll">
        <p className="gsheet-hint">{t('garment.pick.hint')}</p>
        {groups.map((g) => (
          <div key={g.id} className="gs-group">
            <div className="gs-group-h">{groupName(g, lang)}</div>
            {g.items.map((it) => {
              const qty = sel[it.id] || 0
              return (
                <div key={it.id} className={`gs-row${qty > 0 ? ' on' : ''}`}>
                  <div className="gs-info">
                    <span className="gs-name">{garmentName(it, lang)}</span>
                    <span className="gs-count">
                      {it.addon ? t('garment.addon') : it.pieces === 1 ? t('garment.piece1') : t('garment.pieces', { n: it.pieces })}
                    </span>
                  </div>
                  <div className="gs-stepper">
                    <button onClick={() => bump(it.id, -1)} disabled={qty === 0} aria-label="−"><Minus size={16} /></button>
                    <span key={qty} className="gs-qty gs-bounce">{qty}</span>
                    <button onClick={() => bump(it.id, 1)} aria-label="+"><Plus size={16} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        {groups.length === 0 && <div className="gs-empty">{t('garment.none', { q })}</div>}
      </div>

      <div className="gsheet-foot">
        <div className="gs-total">
          <span className="gs-total-row">
            <b key={pieces} className="gs-total-num gs-bounce">{pieces}</b>
            <span className="gs-total-lbl">{t('garment.totalPieces')}</span>
          </span>
          <span className="gs-total-sub">{t('garment.units', { n: units })}</span>
        </div>
        <button className="btn-primary" disabled={units === 0} onClick={() => onDone(sel)}>
          {t('garment.done')}
        </button>
      </div>
    </div>
  )
}
