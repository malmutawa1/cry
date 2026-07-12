import { useStore } from '../store'
import { useI18n } from '../i18n'
import { planName } from '../data/plans'
import { Bag, CalendarIn, Globe, Hanger } from '../components/Icons'

export default function Home({
  onSchedule,
  onSeePlans,
}: {
  onSchedule: () => void
  onSeePlans: () => void
}) {
  const { activePlan, user } = useStore()
  const { t, lang, toggle } = useI18n()
  const used = activePlan ? Math.round(activePlan.capKg * 0.42) : 0
  const firstName = user?.name?.trim().split(/\s+/)[0]

  const steps = [
    { icon: <CalendarIn />, t: t('home.step1.t'), s: t('home.step1.s') },
    { icon: <Bag />, t: t('home.step2.t'), s: t('home.step2.s') },
    { icon: <Hanger />, t: t('home.step3.t'), s: t('home.step3.s') },
  ]

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          {t('brand')}
        </div>
        <button className="round-btn" onClick={toggle} aria-label="Language">
          <Globe />
        </button>
      </div>

      <div className="screen">
        <div className="pad" style={{ paddingTop: 6, paddingBottom: 18 }}>
          <div className="greeting">
            {firstName ? `${lang === 'ar' ? 'مرحباً، ' : 'Hello, '}${firstName}` : t('home.greeting')}
          </div>
          <div className="greeting-sub">{t('home.subtitle')}</div>
        </div>

        {activePlan ? (
          <div className="hero-card">
            <div className="hc-top">
              <div>
                <div className="hc-plan">{t('home.plan.active', { name: planName(activePlan, lang) })}</div>
                <div className="hc-allow">
                  {t('home.plan.allowance', { used, cap: activePlan.capKg })}
                </div>
              </div>
              <div className="hc-price">{activePlan.priceKwd}</div>
            </div>
            <div className="bar">
              <span style={{ width: `${(used / activePlan.capKg) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="hero-card">
            <div className="hc-plan">{t('home.plan.none.title')}</div>
            <div className="hc-allow" style={{ margin: '4px 0 14px' }}>{t('home.plan.none.sub')}</div>
            <button className="btn-ghost" onClick={onSeePlans}>
              {t('home.plan.none.cta')}
            </button>
          </div>
        )}

        <div className="pad">
          <button className="btn-primary" onClick={onSchedule} disabled={!activePlan}>
            {t('home.schedule')}
          </button>
        </div>

        <div className="section-title">{t('home.how')}</div>
        <div className="pad">
          {steps.map((st, i) => (
            <div key={i} className="step">
              <div className="step-num">
                <span className="step-ic">{st.icon}</span>
                <span className="step-idx">{i + 1}</span>
              </div>
              <div>
                <div className="step-t">{st.t}</div>
                <div className="step-s">{st.s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>
    </>
  )
}
