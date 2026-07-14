import { useMemo, useState } from 'react'
import { categories, money, type Product, type Unit } from '../data'
import { usePos } from '../store'

const EMPTY: Omit<Product, 'id'> = {
  name: '',
  categoryId: 'wash',
  price: 1,
  unit: 'item',
  available: true,
}

export function Menu() {
  const { products, addProduct, updateProduct, deleteProduct, toggleAvailable } = usePos()
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)

  const rows = useMemo(
    () => products.filter((p) => filter === 'all' || p.categoryId === filter),
    [products, filter],
  )

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Menu &amp; pricing</h1>
          <p>{products.length} services · edits save to this terminal instantly</p>
        </div>
        <button className="btn primary" onClick={() => setEditing('new')}>
          + New service
        </button>
      </div>

      <div className="mgmt-filters">
        <button className={`chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
          <span className="g">🧾</span> All
        </button>
        {categories.map((c) => (
          <button key={c.id} className={`chip${filter === c.id ? ' on' : ''}`} onClick={() => setFilter(c.id)}>
            <span className="g">{c.glyph}</span> {c.name}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th className="right">Price</th>
              <th>Availability</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId)
              return (
                <tr key={p.id}>
                  <td>
                    <div className="cell-name">
                      <span className="g">{cat?.glyph}</span>
                      {p.name}
                    </div>
                  </td>
                  <td>
                    <span className="pill cat">{cat?.name}</span>
                  </td>
                  <td className="right">
                    <span className="tprice">
                      {money(p.price)} <small>/{p.unit}</small>
                    </span>
                  </td>
                  <td>
                    <button
                      className={`switch${p.available ? ' on' : ''}`}
                      onClick={() => toggleAvailable(p.id)}
                      aria-label="Toggle availability"
                    />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => setEditing(p)} aria-label="Edit">
                        ✎
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id)
                        }}
                        aria-label="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 40 }}>
                  No services in this category yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditor
          initial={editing === 'new' ? { ...EMPTY } : editing}
          onCancel={() => setEditing(null)}
          onSave={(data) => {
            if (editing === 'new') addProduct(data)
            else updateProduct({ ...(editing as Product), ...data })
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function ProductEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<Product, 'id'>
  onSave: (p: Omit<Product, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [categoryId, setCategoryId] = useState(initial.categoryId)
  const [price, setPrice] = useState(String(initial.price))
  const [unit, setUnit] = useState<Unit>(initial.unit)
  const [available, setAvailable] = useState(initial.available)

  const valid = name.trim().length > 0 && Number(price) > 0

  return (
    <div className="scrim" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial.name ? 'Edit service' : 'New service'}</h2>
          <button className="x" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Service name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shirt Press" autoFocus />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.glyph} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field row2">
            <div>
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
            <div>
              <label>Charged per</label>
              <div className="seg">
                <button className={unit === 'item' ? 'on' : ''} onClick={() => setUnit('item')}>
                  Item
                </button>
                <button className={unit === 'kg' ? 'on' : ''} onClick={() => setUnit('kg')}>
                  Kg
                </button>
              </div>
            </div>
          </div>
          <div className="field row2" style={{ alignItems: 'center' }}>
            <label style={{ margin: 0 }}>Available at the counter</label>
            <button
              className={`switch${available ? ' on' : ''}`}
              style={{ marginLeft: 'auto' }}
              onClick={() => setAvailable((v) => !v)}
              aria-label="Toggle availability"
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
                onSave({ name: name.trim(), categoryId, price: Number(price), unit, available })
              }
            >
              Save service
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
