import { useState } from 'react'
import type { CatalogItem } from '../data/catalog'
import Garment from '../components/Garment'
import { Close, Info } from '../components/Icons'
import { Stepper } from '../components/Common'
import { useStore } from '../store'

export default function ItemDetail({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const { addLine } = useStore()
  const [qty, setQty] = useState<Record<string, number>>({})

  const total = item.services.reduce((n, s) => n + (qty[s.id] || 0), 0)

  function confirm() {
    item.services.forEach((s) => {
      const q = qty[s.id] || 0
      if (q > 0) addLine(item, s, q)
    })
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" style={{ maxHeight: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="detail-hero">
          <button className="round-btn" onClick={onClose} aria-label="Close">
            <Close />
          </button>
          <Garment art={item.art} />
        </div>

        <div className="sheet-scroll" style={{ paddingTop: 18 }}>
          <div className="section-title" style={{ padding: '0 0 16px' }}>
            {item.name}
          </div>

          {item.services.map((s) => (
            <div key={s.id} className="svc-card">
              <span className="svc-name">{s.name}</span>
              <span className="svc-price">{s.priceKwd.toFixed(3)} KWD</span>
              <Stepper value={qty[s.id] || 0} onChange={(v) => setQty((p) => ({ ...p, [s.id]: v }))} />
            </div>
          ))}

          <div className="info-banner" style={{ margin: '6px 0 4px' }}>
            <Info />
            Not sure which service is right for you?
          </div>
        </div>

        <div style={{ padding: '14px 18px 0' }}>
          <button className="btn-primary" onClick={confirm} disabled={total === 0}>
            {total === 0 ? 'Select a service' : `Add ${total} item${total > 1 ? 's' : ''} to basket`}
          </button>
        </div>
      </div>
    </div>
  )
}
