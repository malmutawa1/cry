import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import {
  garmentEmoji,
  garmentGroups,
  garmentName,
  groupEmoji,
  groupName,
  selectionPieces,
  selectionUnits,
  type GarmentSelection,
} from '../data/garments'
import { Chevron, Close, Minus, Plus, Search } from './Icons'

interface Props {
  initial?: GarmentSelection
  onClose: () => void
  onDone: (sel: GarmentSelection) => void
}

/** Full-screen sheet where the customer declares the garments they're sending.
 *  Step 1 picks garments (live piece count); step 2 reviews the order and
 *  proceeds to checkout. */
export default function GarmentPicker({ initial, onClose, onDone }: Props) {
  const { t, lang } = useI18n()
  const [sel, setSel] = useState<GarmentSelection>(initial ?? {})
  const [q, setQ] = useState('')
  const [view, setView] = useState<'pick' | 'review'>('pick')

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

  // ---------------- Review step ----------------
  if (view === 'review') {
    const chosenGroups = garmentGroups
      .map((g) => ({ ...g, items: g.items.filter((it) => (sel[it.id] || 0) > 0) }))
      .filter((g) => g.items.length > 0)

    return (
      <div className="gsheet">
        <div className="gsheet-top">
          <button className="round-btn" onClick={() => setView('pick')} aria-label={t('common.back')}><Chevron className="chev-back" /></button>
          <h1>{t('garment.review.title')}</h1>
          <span style={{ width: 42 }} />
        </div>

        <div className="gsheet-scroll anim-in" key="review">
          <div className="gr-hero">
            <span className="gr-hero-emoji">🧺</span>
            <b className="gr-hero-num">{pieces}</b>
            <span className="gr-hero-lbl">{t('garment.totalPieces')}</span>
            <span className="gr-hero-sub">{t('garment.units', { n: units })}</span>
          </div>

          {chosenGroups.map((g) => (
            <div key={g.id} className="gr-group">
              <div className="gr-group-h"><span className="gs-gh-emoji">{groupEmoji(g)}</span>{groupName(g, lang)}</div>
              {g.items.map((it) => {
                const qty = sel[it.id] || 0
                const sub = it.pieces * qty
                return (
                  <div key={it.id} className="gr-line">
                    <span className={`gs-thumb g-${g.id}`}>{garmentEmoji(it)}</span>
                    <span className="gr-qty">{qty}×</span>
                    <span className="gr-name">{garmentName(it, lang)}</span>
                    <span className="gr-sub">
                      {it.addon ? t('garment.addon') : sub === 1 ? t('garment.piece1') : t('garment.pieces', { n: sub })}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}

          <button className="gr-edit" onClick={() => setView('pick')}>{t('garment.review.edit')}</button>
          <div style={{ height: 8 }} />
        </div>

        <div className="gsheet-foot review-foot">
          <button className="btn-primary" onClick={() => onDone(sel)}>
            {t('garment.review.checkout')}
          </button>
        </div>
      </div>
    )
  }

  // ---------------- Pick step ----------------
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
            <div className="gs-group-h"><span className="gs-gh-emoji">{groupEmoji(g)}</span>{groupName(g, lang)}</div>
            {g.items.map((it) => {
              const qty = sel[it.id] || 0
              return (
                <div key={it.id} className={`gs-row${qty > 0 ? ' on' : ''}`}>
                  <span className={`gs-thumb g-${g.id}${qty > 0 ? ' on' : ''}`}>{garmentEmoji(it)}</span>
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
          <b key={pieces} className="gs-total-num gs-bounce">{pieces}</b>
          <span className="gs-total-lbl">{t('garment.totalPieces')} · {t('garment.units', { n: units })}</span>
        </div>
        <button className="btn-primary" disabled={units === 0} onClick={() => setView('review')}>
          {t('garment.done')}
        </button>
      </div>
    </div>
  )
}
