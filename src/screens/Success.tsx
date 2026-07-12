import { useStore, kwd } from '../store'
import { Check } from '../components/Icons'

export default function Success({ orderId, total, onDone }: { orderId: string; total: number; onDone: () => void }) {
  const { pickup, delivery } = useStore()
  return (
    <>
      <div className="topbar" style={{ justifyContent: 'center' }}>
        <h1>Order confirmed</h1>
      </div>
      <div className="success">
        <div className="check-ring">
          <Check size={44} />
        </div>
        <h2>You're all set!</h2>
        <p>Your driver will collect your laundry during the pick-up window. We'll notify you at each step.</p>
        <div className="order-pill">Order {orderId}</div>
        <div style={{ width: '100%', maxWidth: 320, marginTop: 12 }}>
          <div className="summary-row">
            <span style={{ color: 'var(--muted)' }}>Pick-up</span>
            <span style={{ fontWeight: 700 }}>{pickup}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--muted)' }}>Delivery</span>
            <span style={{ fontWeight: 700 }}>{delivery}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--muted)' }}>Paid</span>
            <span style={{ fontWeight: 700 }}>{kwd(total)}</span>
          </div>
        </div>
      </div>
      <div className="bottom-cta">
        <button className="btn-primary" onClick={onDone}>
          Back to home
        </button>
      </div>
    </>
  )
}
