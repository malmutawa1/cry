import { plans, planName, planTagline, planPerks } from '../data/plans'
import { Check, Leaf } from '../components/Icons'
import { useStore } from '../store'
import { useI18n } from '../i18n'

export default function Plans({ onSubscribed }: { onSubscribed: () => void }) {
  const { activePlan, setActivePlan } = useStore()
  const { t, lang } = useI18n()

  return (
    <>
      <div className="topbar">
        <h1>{t('plans.title')}</h1>
      </div>

      <div className="screen">
        <div className="hero" style={{ paddingTop: 0 }}>
          <h2>{t('plans.heroTitle')}</h2>
          <p>{t('plans.heroSub')}</p>
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
                  <div className="amt">{p.priceKwd}</div>
                  <div className="per">{t('plans.per')}</div>
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
        <button className="btn-primary" disabled={!activePlan} onClick={onSubscribed}>
          {activePlan ? t('plans.subscribe', { name: planName(activePlan, lang) }) : t('plans.select')}
          {activePlan && <span className="sub">{t('plans.cancel', { price: activePlan.priceKwd })}</span>}
        </button>
      </div>
    </>
  )
}
