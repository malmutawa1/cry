import { useMemo, useState } from 'react'
import { categories, money, paymentMethods, type PaymentMethod, type Product, type Sale } from '../data'
import { round3, usePos } from '../store'

interface CartLine {
  product: Product
  qty: number
}

const DISCOUNTS = [0, 10, 15, 20]

export function Register() {
  const { products, recordSale } = usePos()
  const [activeCat, setActiveCat] = useState('all')
  const [cart, setCart] = useState<CartLine[]>([])
  const [discountPct, setDiscountPct] = useState(0)
  const [paying, setPaying] = useState(false)
  const [receipt, setReceipt] = useState<Sale | null>(null)

  const visible = useMemo(
    () => products.filter((p) => activeCat === 'all' || p.categoryId === activeCat),
    [products, activeCat],
  )

  const subtotal = useMemo(() => round3(cart.reduce((s, l) => s + l.product.price * l.qty, 0)), [cart])
  const discountVal = round3(subtotal * (discountPct / 100))
  const total = round3(subtotal - discountVal)

  function add(product: Product) {
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === product.id)
      if (found) return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
      return [...prev, { product, qty: 1 }]
    })
  }
  function setQty(id: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.product.id !== id))
      return
    }
    setCart((prev) => prev.map((l) => (l.product.id === id ? { ...l, qty } : l)))
  }
  function clear() {
    setCart([])
    setDiscountPct(0)
  }

  function pay(method: PaymentMethod) {
    const sale = recordSale({
      method,
      lines: cart.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        unit: l.product.unit,
        price: l.product.price,
        qty: l.qty,
      })),
      subtotal,
      discountPct,
      total,
    })
    setPaying(false)
    if (sale) {
      setReceipt(sale)
      clear()
    }
  }

  return (
    <div className="register">
      <div className="reg-catalog">
        <div className="cat-rail">
          <button className={`chip${activeCat === 'all' ? ' on' : ''}`} onClick={() => setActiveCat('all')}>
            <span className="g">🧾</span> All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip${activeCat === c.id ? ' on' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              <span className="g">{c.glyph}</span> {c.name}
            </button>
          ))}
        </div>

        <div className="grid">
          {visible.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId)
            return (
              <button
                key={p.id}
                className={`tile${p.available ? '' : ' out'}`}
                onClick={() => add(p)}
                disabled={!p.available}
              >
                <span className="g">{cat?.glyph}</span>
                <div>
                  <div className="nm">{p.name}</div>
                  <div className="pr">
                    {money(p.price)} <small>/{p.unit}</small>
                  </div>
                </div>
              </button>
            )
          })}
          {visible.length === 0 && <div className="grid-empty">No items in this category.</div>}
        </div>
      </div>

      <aside className="cart">
        <div className="cart-head">
          <div>
            <h2>Current order</h2>
            <div className="count">{cart.length} line{cart.length === 1 ? '' : 's'}</div>
          </div>
          {cart.length > 0 && (
            <button className="clear" onClick={clear}>
              Clear
            </button>
          )}
        </div>

        <div className="cart-lines">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="big">🧺</div>
              <div>Tap items to start an order</div>
            </div>
          ) : (
            cart.map((l) => (
              <div className="line" key={l.product.id}>
                <div>
                  <div className="l-nm">{l.product.name}</div>
                  <div className="l-unit">
                    {money(l.product.price)} / {l.product.unit}
                  </div>
                  <div className="qty">
                    <button onClick={() => setQty(l.product.id, l.qty - 1)}>−</button>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={l.product.unit === 'kg' ? 0.5 : 1}
                      value={l.qty}
                      onChange={(e) => setQty(l.product.id, Number(e.target.value) || 0)}
                    />
                    <button onClick={() => setQty(l.product.id, l.qty + 1)}>+</button>
                    {l.product.unit === 'kg' && <span className="kg">kg</span>}
                  </div>
                </div>
                <div className="l-total">{money(round3(l.product.price * l.qty))}</div>
                <button className="rm" onClick={() => setQty(l.product.id, 0)} aria-label="Remove">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-foot">
          <div className="disc">
            {DISCOUNTS.map((d) => (
              <button key={d} className={discountPct === d ? 'on' : ''} onClick={() => setDiscountPct(d)}>
                {d === 0 ? 'No disc.' : `${d}%`}
              </button>
            ))}
          </div>
          <div className="sums">
            <div className="row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            {discountPct > 0 && (
              <div className="row">
                <span>Discount ({discountPct}%)</span>
                <span>−{money(discountVal)}</span>
              </div>
            )}
            <div className="row total">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
          <button className="pay-btn" disabled={cart.length === 0} onClick={() => setPaying(true)}>
            Charge {money(total)}
          </button>
        </div>
      </aside>

      {paying && (
        <div className="scrim" onClick={() => setPaying(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Take payment</h2>
              <button className="x" onClick={() => setPaying(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="pay-total">
                <div className="k">Amount due</div>
                <div className="v">{money(total)}</div>
              </div>
              <div className="methods">
                {paymentMethods.map((m) => (
                  <button key={m.id} onClick={() => pay(m.id)}>
                    <span className="g">{m.glyph}</span>
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
                Select a tender to complete the sale.
              </p>
            </div>
          </div>
        </div>
      )}

      {receipt && <Receipt sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}

function Receipt({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const method = paymentMethods.find((m) => m.id === sale.method)
  const discountVal = round3(sale.subtotal - sale.total)
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body receipt">
          <div className="ok">✓</div>
          <h3>Payment received</h3>
          <div className="sub">
            {method?.label} · {sale.id}
          </div>
          <div className="rcpt-box">
            {sale.lines.map((l) => (
              <div className="r" key={l.productId}>
                <span>
                  {l.name} × {l.qty}
                  {l.unit === 'kg' ? 'kg' : ''}
                </span>
                <span>{money(round3(l.price * l.qty))}</span>
              </div>
            ))}
            <div className="r" style={{ marginTop: 8 }}>
              <span>Subtotal</span>
              <span>{money(sale.subtotal)}</span>
            </div>
            {sale.discountPct > 0 && (
              <div className="r">
                <span>Discount ({sale.discountPct}%)</span>
                <span>−{money(discountVal)}</span>
              </div>
            )}
            <div className="r grand">
              <span>Total paid</span>
              <span>{money(sale.total)}</span>
            </div>
          </div>
          <button className="btn primary wide" onClick={onClose}>
            New order
          </button>
        </div>
      </div>
    </div>
  )
}
