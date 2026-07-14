import { useState } from 'react'
import { useStore, orderStage } from '../store'
import { useI18n } from '../i18n'
import { useNow } from '../useNow'
import { planName } from '../data/plans'
import { Bag, CalendarIn, Chevron, Gift, Globe, Hanger, Route } from '../components/Icons'
import Reveal from '../components/Reveal'
import { ExtraKgSheet, useAllowance } from '../components/ExtraKg'
import { tierInfo } from '../data/rewards'

export default function Home({
  onSchedule,
  onSeePlans,
  onTrack,
  onRewards,
}: {
  onSchedule: () => void
  onSeePlans: () => void
  onTrack: () => void
  onRewards: () => void
}) {
  const { activePlan, user, activeOrder, points } = useStore()
  const { t, lang, toggle } = useI18n()
  const now = useNow(1000)
  const { usedKg: used, allowance, atLimit } = useAllowance()
  const tier = tierInfo(points).current
  const [extraOpen, setExtraOpen] = useState(false)
  const firstName = user?.name?.trim().split(/\s+/)[0]
  const orderStageIdx = activeOrder ? orderStage(activeOrder, now) : -1

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
          <Reveal
            as="div"
            className="greeting"
            text={firstName ? `${lang === 'ar' ? 'مرحباً، ' : 'Hello, '}${firstName}` : t('home.greeting')}
          />
          <div className="greeting-sub reveal-sub">{t('home.subtitle')}</div>
        </div>

        {activeOrder && (
          <button className="track-card" onClick={onTrack}>
            <span className="tc-ic"><Route size={22} /></span>
            <span className="tc-body">
              <span className="tc-title">{t('home.track.title')}</span>
              <span className="tc-status">{t(`st.${orderStageIdx}.t`)}</span>
            </span>
            <span className="tc-live">{t('track.live')}</span>
            <Chevron className="chev" />
          </button>
        )}

        {activePlan ? (
          <div className="hero-card">
            <div className="hc-top">
              <div>
                <div className="hc-plan">{t('home.plan.active', { name: planName(activePlan, lang) })}</div>
                <div className="hc-allow">
                  {t('home.plan.allowance', { used, cap: allowance })}
                </div>
              </div>
              <div className="hc-price">{activePlan.priceKwd}</div>
            </div>
            <div className={`bar ${atLimit ? 'full' : ''}`}>
              <span style={{ width: `${allowance ? (used / allowance) * 100 : 0}%` }} />
            </div>
            {atLimit && (
              <button className="hc-limit" onClick={() => setExtraOpen(true)}>
                <span>{t('extra.limit')}</span>
                <span className="hc-limit-cta">{t('extra.manage')} ›</span>
              </button>
            )}
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

        <button className={`loy-card tier-${tier.key}`} style={{ marginTop: 14 }} onClick={onRewards}>
          <span className="loy-card-ic"><Gift size={22} /></span>
          <span className="loy-card-body">
            <span className="loy-card-title">{t('home.rewards.title')}</span>
            <span className="loy-card-sub">{t(`loyalty.tier.${tier.key}`)}</span>
          </span>
          <span className="loy-card-pts">{points} {t('loyalty.pts')}</span>
          <Chevron className="chev" />
        </button>

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

      {extraOpen && <ExtraKgSheet onClose={() => setExtraOpen(false)} />}
    </>
  )
}
