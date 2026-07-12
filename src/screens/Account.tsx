import { useStore } from '../store'
import { Cards, Chevron, Clock, Leaf, Pin, Receipt, User } from '../components/Icons'

export default function Account({ email, onSeePlans }: { email: string; onSeePlans: () => void }) {
  const { activePlan } = useStore()
  const usedKg = activePlan ? Math.round(activePlan.capKg * 0.42) : 0
  const pct = activePlan ? Math.min(100, (usedKg / activePlan.capKg) * 100) : 0

  return (
    <>
      <div className="topbar">
        <h1>Account</h1>
      </div>
      <div className="screen">
        <div className="acct-head">
          <div className="acct-avatar">A</div>
          <div>
            <div className="acct-name">Abdullah</div>
            <div className="acct-mail">{email}</div>
          </div>
        </div>

        {activePlan ? (
          <div className="usage-card">
            <div className="u-top">
              <div>
                <div className="u-plan">{activePlan.name} membership</div>
                <div className="u-sub">Renews 1 Aug · {activePlan.priceKwd}.000 KWD / month</div>
              </div>
            </div>
            <div className="bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="u-legend">
              <span>{usedKg} kg used</span>
              <span>{activePlan.capKg} kg allowance</span>
            </div>
          </div>
        ) : (
          <div className="usage-card">
            <div className="u-plan">No active plan</div>
            <div className="u-sub" style={{ margin: '4px 0 14px' }}>
              Subscribe to a monthly membership and stop counting items.
            </div>
            <button className="btn-primary" onClick={onSeePlans}>
              See membership plans
            </button>
          </div>
        )}

        <div className="card-group">
          <AcctRow icon={<Receipt />} label="Order history" />
          <AcctRow icon={<Pin />} label="Saved addresses" />
          <AcctRow icon={<Cards />} label="Payment methods" />
          <AcctRow icon={<Clock />} label="Freeze subscription" />
        </div>

        <div className="card-group">
          <AcctRow icon={<User />} label="Personal details" />
          <AcctRow icon={<Leaf />} label="Refer a friend — get 5 KWD" />
        </div>
        <div style={{ height: 12 }} />
      </div>
    </>
  )
}

function AcctRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="row">
      <span className="row-ic">{icon}</span>
      <span className="row-body">
        <span className="value" style={{ fontWeight: 600 }}>
          {label}
        </span>
      </span>
      <Chevron className="chev" />
    </button>
  )
}
