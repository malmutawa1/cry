import { useState } from 'react'
import {
  plans,
  planName,
  planTagline,
  planPerks,
  planPrice,
  ANNUAL_SAVING_PCT,
} from '../data/plans'
import { Check, Chevron, Close, Leaf } from '../components/Icons'
import { PaymentSheet, PaymentValue } from '../components/Payment'
import { useStore } from '../store'
import { useI18n } from '../i18n'

export default function Plans({ onSubscribed }: { onSubscribed: () => void }) {
  const { activePlan, setActivePlan, billing, setBilling, showToast } = useStore()
  const { t, lang } = useI18n()
  const [payOpen, setPayOpen] = useState(false)
  const [view, setView] = useState<'select' | 'checkout'>('select')

  const annual = billing === 'annual'

  // ---------- Checkout (payment) step ----------
  if (view === 'checkout' && activePlan) {
    const price = planPrice(activePlan, billing)
    return (
      <div className="anim-in" key="checkout">
        <div className="topbar">
          <button className="round-btn" onClick={() => setView('select')} aria-label="Back">
            <Close />
          </button>
          <h1>{t('checkout.title')}</h1>
          <span style={{ width: 42 }} />
        </div>

        <div className="screen">
          <div className="checkout-card">
            <div className="co-top">
              <div>
                <div className="co-plan">{planName(activePlan, lang)}</div>
                <div className="co-period">{t(annual ? 'checkout.period.annual' : 'checkout.period.monthly')}</div>
              </div>
              <span className="plan-cap">{t('plans.cap', { kg: activePlan.capKg })}</span>
            </div>
            <div className="co-total">
              <span>{t('checkout.total')}</span>
              <strong>{price}.000 KWD</strong>
            </div>
          </div>

          <div className="section-title" style={{ fontSize: 20 }}>{t('checkout.method')}</div>
          <div className="card-group">
            <button className="row" onClick={() => setPayOpen(true)}>
              <span className="pay-current"><PaymentValue /></span>
              <Chevron className="chev" />
            </button>
          </div>
          <div style={{ height: 8 }} />
        </div>

        <div className="bottom-cta">
          <button
            className="btn-primary"
            onClick={() => {
              showToast(t('toast.subscribed', { name: planName(activePlan, lang) }))
              onSubscribed()
            }}
          >
            {t('checkout.pay', { price })}
            <span className="sub">{t('checkout.secure')}</span>
          </button>
        </div>

        {payOpen && <PaymentSheet onClose={() => setPayOpen(false)} />}
      </div>
    )
  }

  // ---------- Plan selection ----------
  return (
    <div className="anim-in" key="select">
      <div className="topbar">
        <h1>{t('plans.title')}</h1>
      </div>

      <div className="screen">
        <div className="hero" style={{ paddingTop: 0 }}>
          <h2>{t('plans.heroTitle')}</h2>
          <p>{t('plans.heroSub')}</p>
        </div>

        <div className="segmented">
          <button className={`seg ${!annual ? 'on' : ''}`} onClick={() => setBilling('monthly')}>
            {t('billing.monthly')}
          </button>
          <button className={`seg ${annual ? 'on' : ''}`} onClick={() => setBilling('annual')}>
            {t('billing.annual')}
            <span className="seg-save">{t('billing.save', { pct: ANNUAL_SAVING_PCT })}</span>
          </button>
        </div>

        <div className="info-banner leaf">
          <Leaf />
          {t('plans.free')}
        </div>

        {plans.map((p) => {
          const selected = activePlan?.id === p.id
          return (
            <button key={p.id} className={`plan-card ${selected ? 'selected' : ''}`} onClick={() => setActivePlan(p)}>
              {p.popular && <span className="badge-pop">{t('plans.popular')}</span>}
              <div className="plan-top">
                <div>
                  <div className="plan-name">{planName(p, lang)}</div>
                  <div className="plan-tag">{planTagline(p, lang)}</div>
                </div>
                <div className="plan-price">
                  <div className="amt">{planPrice(p, billing)}</div>
                  <div className="per">{t(annual ? 'plans.perYear' : 'plans.per')}</div>
                </div>
              </div>
              <span className="plan-cap">{t('plans.cap', { kg: p.capKg })}</span>
              <ul className="perks">
                {planPerks(p, lang).map((perk) => (
                  <li key={perk}>
                    <span className="tick"><Check size={16} /></span>
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
        <button className="btn-primary" disabled={!activePlan} onClick={() => setView('checkout')}>
          {activePlan ? t('plans.subscribe', { name: planName(activePlan, lang) }) : t('plans.select')}
          {activePlan && (
            <span className="sub">
              {t(annual ? 'plans.cancelYear' : 'plans.cancel', { price: planPrice(activePlan, billing) })}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
