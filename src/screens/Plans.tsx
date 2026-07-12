import { plans } from '../data/plans'
import { Check, Leaf } from '../components/Icons'
import { useStore } from '../store'

export default function Plans({ onSubscribed }: { onSubscribed: () => void }) {
  const { activePlan, setActivePlan } = useStore()

  return (
    <>
      <div className="topbar">
        <h1>Membership</h1>
      </div>

      <div className="screen">
        <div className="hero" style={{ paddingTop: 0 }}>
          <h2>One flat price. Every load.</h2>
          <p>No per-item math — a monthly allowance, picked up and delivered free.</p>
        </div>

        <div className="info-banner" style={{ background: '#173a2a', color: '#bfe9cf' }}>
          <Leaf />
          Free pickup &amp; delivery on every plan. Freeze anytime while you travel.
        </div>

        {plans.map((p) => {
          const selected = activePlan?.id === p.id
          return (
            <button
              key={p.id}
              className={`plan-card ${selected ? 'selected' : ''}`}
              onClick={() => setActivePlan(p)}
            >
              {p.popular && <span className="badge-pop">MOST POPULAR</span>}
              <div className="plan-top">
                <div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-tag">{p.tagline}</div>
                </div>
                <div className="plan-price">
                  <div className="amt">{p.priceKwd}</div>
                  <div className="per">KWD / month</div>
                </div>
              </div>
              <span className="plan-cap">Up to {p.capKg} kg / month</span>
              <ul className="perks">
                {p.perks.map((perk) => (
                  <li key={perk}>
                    <span className="tick">
                      <Check size={16} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
        <div style={{ height: 8 }} />
      </div>

      <div className="bottom-cta">
        <button className="btn-primary" disabled={!activePlan} onClick={onSubscribed}>
          {activePlan ? `Subscribe to ${activePlan.name}` : 'Select a plan'}
          {activePlan && <span className="sub">{activePlan.priceKwd}.000 KWD / month · cancel anytime</span>}
        </button>
      </div>
    </>
  )
}
