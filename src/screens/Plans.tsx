import { useState } from 'react'
import {
  plans,
  planName,
  planTagline,
  planPerks,
  planPrice,
  ANNUAL_SAVING_PCT,
  type Billing,
  type Plan,
} from '../data/plans'
import { CalendarIn, Check, Chevron, Close, Leaf, Star } from '../components/Icons'
import Reveal from '../components/Reveal'
import { PaymentSheet, PaymentValue } from '../components/Payment'
import { useStore } from '../store'
import { useI18n } from '../i18n'

const planIndex = (p: Plan) => plans.findIndex((x) => x.id === p.id)

/** Reusable refund / cancellation policy quote. */
function RefundPolicy() {
  const { t } = useI18n()
  return (
    <div className="policy">
      <span className="policy-mark">“</span>
      <div>
        <div className="policy-title">{t('policy.title')}</div>
        <p className="policy-body">{t('policy.body')}</p>
      </div>
    </div>
  )
}

export default function Plans({ onSubscribed }: { onSubscribed: () => void }) {
  const { activePlan, setActivePlan, billing, setBilling, subscribedAt, setSubscribedAt, showToast } = useStore()
  const { t, lang } = useI18n()
  const [payOpen, setPayOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [selected, setSelected] = useState<Plan | null>(activePlan)
  // what we're paying for right now (plan + billing), decoupled from live state
  const [intent, setIntent] = useState<{ plan: Plan; billing: Billing } | null>(null)
  const [view, setView] = useState<'select' | 'checkout'>('select')

  const annual = billing === 'annual'
  const subscribed = activePlan != null

  /** End of the current billing period, formatted for the active language. */
  function expiryLabel(): string {
    const start = new Date(subscribedAt ?? Date.now())
    const end = new Date(start)
    if (annual) end.setFullYear(end.getFullYear() + 1)
    else end.setMonth(end.getMonth() + 1)
    const date = end.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return t('plans.expires', { date })
  }

  function goCheckout(plan: Plan, b: Billing) {
    setIntent({ plan, billing: b })
    setView('checkout')
  }

  function confirmPayment() {
    if (!intent) return
    const wasSubscribed = activePlan != null
    const sameePlan = activePlan?.id === intent.plan.id
    setActivePlan(intent.plan)
    setBilling(intent.billing)
    setSubscribedAt(Date.now()) // new billing period starts now
    setSelected(intent.plan)
    if (!wasSubscribed) showToast(t('toast.subscribed', { name: planName(intent.plan, lang) }))
    else if (sameePlan && intent.billing === 'annual') showToast(t('toast.annualOn'))
    else showToast(t('toast.planUpdated', { name: planName(intent.plan, lang) }))
    setView('select')
    onSubscribed()
  }

  // ---------- Checkout (payment) step ----------
  if (view === 'checkout' && intent) {
    const price = planPrice(intent.plan, intent.billing)
    const isAnnual = intent.billing === 'annual'
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
                <div className="co-plan">{planName(intent.plan, lang)}</div>
                <div className="co-period">{t(isAnnual ? 'checkout.period.annual' : 'checkout.period.monthly')}</div>
              </div>
              <span className="plan-cap">{t('plans.cap', { kg: intent.plan.capKg })}</span>
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
          <button className="btn-primary" onClick={confirmPayment}>
            {t('checkout.pay', { price })}
            <span className="sub">{t('checkout.secure')}</span>
          </button>
        </div>

        {payOpen && <PaymentSheet onClose={() => setPayOpen(false)} />}
      </div>
    )
  }

  // shared plan cards (priced at the current billing period)
  const curIdx = activePlan ? planIndex(activePlan) : -1
  const selIdx = selected ? planIndex(selected) : -1

  const planCards = plans.map((p) => {
    const isSel = selected?.id === p.id
    const isCurrent = activePlan?.id === p.id
    return (
      <button key={p.id} className={`plan-card plan-${p.id} ${isSel ? 'selected' : ''}`} onClick={() => setSelected(p)}>
        <span className="plan-fx" aria-hidden="true" />
        {isCurrent ? (
          <span className="badge-current">{t('plans.currentPlan')}</span>
        ) : (
          p.popular && <span className="badge-pop">{t('plans.popular')}</span>
        )}
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
  })

  // ---------- Bottom CTA state ----------
  let ctaLabel: string
  let ctaDisabled = false
  let ctaSub: string | null = null
  let onCta: () => void = () => {}
  if (!subscribed) {
    ctaLabel = selected ? t('plans.subscribe', { name: planName(selected, lang) }) : t('plans.select')
    ctaDisabled = !selected
    ctaSub = selected ? t(annual ? 'plans.cancelYear' : 'plans.cancel', { price: planPrice(selected, billing) }) : null
    onCta = () => selected && goCheckout(selected, billing)
  } else if (!selected || selIdx === curIdx) {
    ctaLabel = t('plans.currentCta')
    ctaDisabled = true
  } else if (selIdx > curIdx) {
    ctaLabel = t('plans.upgradeTo', { name: planName(selected, lang) })
    ctaSub = t(annual ? 'plans.cancelYear' : 'plans.cancel', { price: planPrice(selected, billing) })
    onCta = () => goCheckout(selected, billing)
  } else {
    ctaLabel = t('plans.switchTo', { name: planName(selected, lang) })
    ctaSub = t(annual ? 'plans.cancelYear' : 'plans.cancel', { price: planPrice(selected, billing) })
    onCta = () => goCheckout(selected, billing)
  }

  // ---------- Plan selection / management ----------
  return (
    <div className="anim-in" key="select">
      <div className="topbar">
        <h1>{t('plans.title')}</h1>
      </div>

      <div className="screen">
        {subscribed && activePlan ? (
          <>
            {/* Active membership summary — themed to the subscribed tier */}
            <div className={`mem-card mem-${activePlan.id}`}>
              <span className="mem-fx" aria-hidden="true" />
              <div className="mem-top">
                <div>
                  <span className="mem-tag">{t('plans.currentTag')}</span>
                  <div className="mem-name">{planName(activePlan, lang)}</div>
                  <div className="mem-period">{t(annual ? 'checkout.period.annual' : 'checkout.period.monthly')}</div>
                </div>
                <div className="mem-price">
                  <strong>{planPrice(activePlan, billing)}.000</strong>
                  <span>{t(annual ? 'plans.perYear' : 'plans.per')}</span>
                </div>
              </div>
              <span className="plan-cap">{t('plans.cap', { kg: activePlan.capKg })}</span>

              <div className="mem-expiry">
                <CalendarIn size={15} />
                {expiryLabel()}
              </div>

              {annual ? (
                <div className="mem-annual-on">
                  <Star size={15} /> {t('plans.annualActive')}
                </div>
              ) : (
                <button className="mem-annual" onClick={() => goCheckout(activePlan, 'annual')}>
                  <Star size={16} />
                  {t('plans.makeAnnual', { pct: ANNUAL_SAVING_PCT })}
                </button>
              )}

              <button className="mem-cancel" onClick={() => setCancelOpen(true)}>
                {t('plans.cancelLink')}
              </button>
            </div>

            <div className="section-title" style={{ fontSize: 20 }}>{t('plans.changeTitle')}</div>
            <div className="stagger">{planCards}</div>
            <div style={{ height: 8 }} />
          </>
        ) : (
          <>
            <div className="hero" style={{ paddingTop: 0 }}>
              <Reveal as="h2" text={t('plans.heroTitle')} />
              <p className="reveal-sub">{t('plans.heroSub')}</p>
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

            <div className="stagger">{planCards}</div>
            <div style={{ height: 8 }} />
          </>
        )}
      </div>

      <div className="bottom-cta">
        <button className="btn-primary" disabled={ctaDisabled} onClick={onCta}>
          {ctaLabel}
          {ctaSub && <span className="sub">{ctaSub}</span>}
        </button>
      </div>

      {cancelOpen && (
        <div className="overlay" onClick={() => setCancelOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grabber" />
            <h3>{t('cancel.title')}</h3>
            <div className="sheet-scroll">
              <p className="extra-sheet-sub">{t('cancel.sub')}</p>
              <RefundPolicy />
              <button
                className="btn-warn"
                onClick={() => {
                  setActivePlan(null)
                  setSubscribedAt(null)
                  setSelected(null)
                  setCancelOpen(false)
                  showToast(t('toast.cancelled'))
                }}
              >
                {t('cancel.confirm')}
              </button>
              <button className="link-btn" onClick={() => setCancelOpen(false)}>
                {t('cancel.keep')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
