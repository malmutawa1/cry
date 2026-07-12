import { useState } from 'react'
import { useStore, kwd } from '../store'
import { pickupSlots, deliverySlots } from '../data/slots'
import Garment from '../components/Garment'
import { Stepper, Toggle } from '../components/Common'
import {
  Basket as BasketIcon,
  CalendarIn,
  CalendarOut,
  Chevron,
  Close,
  Hanger,
  Info,
  Note,
  Phone,
  Pin,
  Trash,
} from '../components/Icons'

type Sheet = null | 'pickup' | 'delivery' | 'address' | 'phone' | 'note'

export default function Basket({ onEmpty, onCheckout }: { onEmpty: () => void; onCheckout: () => void }) {
  const s = useStore()
  const [sheet, setSheet] = useState<Sheet>(null)

  // group lines by item for display
  const groups = s.lines.reduce<Record<string, typeof s.lines>>((acc, l) => {
    ;(acc[l.itemId] ||= []).push(l)
    return acc
  }, {})

  const deliveryFee = 0
  const total = s.subtotal + deliveryFee

  if (s.lines.length === 0) {
    return (
      <>
        <div className="topbar" style={{ justifyContent: 'center' }}>
          <h1>Basket</h1>
        </div>
        <div className="screen">
          <div className="empty">
            <div className="em-ic">
              <BasketIcon size={30} />
            </div>
            <h3>Your basket is empty</h3>
            <p>Add items from the catalog to schedule a pickup.</p>
            <div style={{ height: 20 }} />
            <button className="btn-primary" style={{ maxWidth: 240, margin: '0 auto' }} onClick={onEmpty}>
              Browse items
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onEmpty} aria-label="Close">
          <Close />
        </button>
        <h1>Basket</h1>
        <button className="round-btn" onClick={() => s.clearBasket()} aria-label="Empty basket">
          <Trash />
        </button>
      </div>

      <div className="screen">
        {/* meta rows */}
        <div className="card-group">
          <button className="row" onClick={() => setSheet('address')}>
            <span className="row-ic">
              <Pin />
            </span>
            <span className="row-body">
              <span className="label">Address</span>
              <span className="value" style={{ whiteSpace: 'normal' }}>
                {s.address}
              </span>
            </span>
            <Chevron className="chev" />
          </button>
          <button className="row" onClick={() => setSheet('pickup')}>
            <span className="row-ic">
              <CalendarIn />
            </span>
            <span className="row-body">
              <span className="label">Pick-up</span>
              <span className="value">{s.pickup}</span>
            </span>
            <Chevron className="chev" />
          </button>
          <button className="row" onClick={() => setSheet('delivery')}>
            <span className="row-ic">
              <CalendarOut />
            </span>
            <span className="row-body">
              <span className="label">Delivery</span>
              <span className="value">{s.delivery}</span>
            </span>
            <Chevron className="chev" />
          </button>
          <button className="row" onClick={() => setSheet('phone')}>
            <span className="row-ic">
              <Phone />
            </span>
            <span className="row-body">
              <span className="label">Contact phone number</span>
              <span className="value">{s.phone}</span>
            </span>
            <Chevron className="chev" />
          </button>
        </div>

        {/* basket items */}
        {Object.entries(groups).map(([itemId, lines]) => (
          <div key={itemId} className="basket-item">
            <div className="bi-head">
              <span className="bi-thumb">
                <Garment art={lines[0].art} />
              </span>
              <span className="bi-name">{lines[0].name}</span>
              <button className="round-btn" onClick={() => s.removeItem(itemId)} aria-label="Remove">
                <Trash size={18} />
              </button>
            </div>
            {lines.map((l) => (
              <div key={l.key} className="bi-line">
                <span className="svc">{l.serviceName}</span>
                <span className="price">{kwd(l.priceKwd * l.qty)}</span>
                <Stepper value={l.qty} min={0} onChange={(v) => s.setQty(l.key, v)} />
              </div>
            ))}
          </div>
        ))}

        {/* hangers */}
        <div className="card-group">
          <div className="feature">
            <span className="row-ic">
              <span className="free-badge">Free</span>
              <Hanger />
            </span>
            <div style={{ flex: 1 }}>
              <div className="ft-title">Hangers</div>
              <div className="ft-sub">Deliver on hangers, disable for folded items</div>
            </div>
            <Toggle on={s.hangers} onChange={s.setHangers} />
          </div>
        </div>

        {/* note */}
        <div className="card-group">
          <button className="row" onClick={() => setSheet('note')}>
            <span className="row-ic">
              <Note />
            </span>
            <span className="row-body">
              <span className="ft-title" style={{ fontSize: 17 }}>
                Add Note
              </span>
              <span className="ft-sub">{s.note ? s.note : 'The laundry may contact you for details'}</span>
            </span>
            <Chevron className="chev" />
          </button>
        </div>

        {/* total */}
        <div className="total-block">
          <div className="t-label">Total</div>
          <div className="t-amt">{kwd(total)}</div>
        </div>

        <div className="info-banner">
          <Info />
          The final price may be adjusted after checking at our facility
          <Chevron className="chev" size={18} />
        </div>

        <div className="summary">
          {Object.entries(groups).map(([itemId, lines]) => {
            const itemTotal = lines.reduce((n, l) => n + l.priceKwd * l.qty, 0)
            const qtyTotal = lines.reduce((n, l) => n + l.qty, 0)
            return (
              <div key={itemId}>
                <div className="summary-row">
                  <span style={{ fontWeight: 700 }}>{lines[0].name}</span>
                  <span style={{ fontWeight: 700 }}>{kwd(itemTotal)}</span>
                </div>
                <div className="summary-row sub">
                  <span>
                    {lines.map((l) => `${l.serviceName} (${l.qty})`).join(', ')} · {qtyTotal} pcs
                  </span>
                </div>
              </div>
            )
          })}
          <div className="summary-row">
            <span>Delivery</span>
            <span className="free">Free</span>
          </div>
        </div>
        <div style={{ height: 4 }} />
      </div>

      <div className="bottom-cta">
        <button className="btn-primary" onClick={onCheckout}>
          Go to Checkout
          <span className="sub">{kwd(total)}</span>
        </button>
      </div>

      {sheet === 'pickup' && (
        <SlotSheet
          title="Select pick-up time"
          options={pickupSlots.map((p) => ({ day: p.split(',')[0], time: p.split(',').slice(1).join(',').trim() }))}
          current={s.pickup}
          onPick={(v) => {
            s.setPickup(v)
            setSheet(null)
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'delivery' && (
        <SlotSheet
          title="Select delivery time"
          options={deliverySlots}
          current={s.delivery}
          onPick={(v) => {
            s.setDelivery(v)
            setSheet(null)
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'address' && (
        <EditSheet
          title="Delivery address"
          value={s.address}
          onSave={(v) => {
            s.setAddress(v)
            setSheet(null)
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'phone' && (
        <EditSheet
          title="Contact phone number"
          value={s.phone}
          onSave={(v) => {
            s.setPhone(v)
            setSheet(null)
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'note' && (
        <EditSheet
          title="Add a note"
          value={s.note}
          multiline
          placeholder="e.g. Ring the bell twice, leave with the guard…"
          onSave={(v) => {
            s.setNote(v)
            setSheet(null)
          }}
          onClose={() => setSheet(null)}
        />
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
  options: { day: string; time: string }[]
  current: string
  onPick: (v: string) => void
  onClose: () => void
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{title}</h3>
        <div className="sheet-scroll">
          {options.map((o, i) => {
            const label = `${o.day}, ${o.time}`
            const active = current.replace(/\s+/g, ' ') === label || current === o.day
            return (
              <button key={i} className={`opt-row ${active ? 'active' : ''}`} onClick={() => onPick(label)}>
                <span className="o-day">{o.day}</span>
                <span className="o-time">{o.time}</span>
              </button>
            )
          })}
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
  const [v, setV] = useState(value)
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{title}</h3>
        <div className="sheet-scroll">
          {multiline ? (
            <textarea
              className="field"
              value={v}
              placeholder={placeholder}
              onChange={(e) => setV(e.target.value)}
              autoFocus
            />
          ) : (
            <input className="field" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} autoFocus />
          )}
          <button className="btn-primary" onClick={() => onSave(v)}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
