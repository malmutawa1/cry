import { useState } from 'react'
import { catalog, categories, itemStartingPrice, type CatalogItem } from '../data/catalog'
import Garment from '../components/Garment'
import { Plus, Receipt, Sliders, Check } from '../components/Icons'
import { useStore } from '../store'
import ItemDetail from './ItemDetail'

export default function Catalog() {
  const [cat, setCat] = useState<(typeof categories)[number]>("Men's")
  const [detail, setDetail] = useState<CatalogItem | null>(null)
  const { lines } = useStore()

  const items = catalog.filter((i) => i.category === cat)
  const inBasket = (id: string) => lines.some((l) => l.itemId === id)

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">N</span>
          Nadeef
        </div>
        <button className="round-btn" aria-label="Orders">
          <Receipt />
        </button>
      </div>

      <div className="screen">
        <div className="hero">
          <h2>Your Laundry, Your Way</h2>
          <p>Pick items and choose a service for each</p>
        </div>

        <div className="chips">
          <button className="chip icon-chip" aria-label="Filters">
            <Sliders />
          </button>
          {categories.map((c) => (
            <button key={c} className={`chip ${c === cat ? 'active' : ''}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid">
          {items.map((item) => (
            <button key={item.id} className="item-card" onClick={() => setDetail(item)}>
              <div className="item-art">
                <Garment art={item.art} />
                <span className={`item-add ${inBasket(item.id) ? 'added' : ''}`}>
                  {inBasket(item.id) ? <Check size={18} /> : <Plus size={18} />}
                </span>
              </div>
              <div className="item-meta">
                <div className="name">{item.name}</div>
                <div className="from">from {itemStartingPrice(item).toFixed(3)} KWD</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ height: 8 }} />
      </div>

      {detail && <ItemDetail item={detail} onClose={() => setDetail(null)} />}
    </>
  )
}
