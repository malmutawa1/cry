import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { garmentGroups, garmentName, groupEmoji, groupName } from '../data/garments'
import GarmentIcon from './GarmentIcons'
import { Close, Search } from './Icons'

/** Read-only reference: every garment and how many pieces it counts as. */
export default function GarmentGuide({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n()
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

  return (
    <div className="gsheet">
      <div className="gsheet-top">
        <button className="round-btn" onClick={onClose} aria-label={t('common.back')}><Close /></button>
        <h1>{t('garment.guide.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="gsheet-search">
        <span className="g"><Search size={16} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('garment.search')} />
      </div>

      <div className="gsheet-scroll">
        <p className="gsheet-hint">{t('garment.guide.hint')}</p>
        <div className="gs-rule">{t('garment.guide.rule')}</div>
        {groups.map((g) => (
          <div key={g.id} className="gs-group">
            <div className="gs-group-h"><span className="gs-gh-emoji">{groupEmoji(g)}</span>{groupName(g, lang)}</div>
            {g.items.map((it) => (
              <div key={it.id} className="gs-guide-row">
                <span className={`gs-thumb g-${g.id}`}><GarmentIcon g={it} size={22} /></span>
                <span className="gs-name">{garmentName(it, lang)}</span>
                <span className={`gs-badge${it.addon ? ' addon' : ''}`}>
                  {it.addon ? t('garment.addon') : it.pieces === 1 ? t('garment.piece1') : t('garment.pieces', { n: it.pieces })}
                </span>
              </div>
            ))}
          </div>
        ))}
        {groups.length === 0 && <div className="gs-empty">{t('garment.none', { q })}</div>}
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
