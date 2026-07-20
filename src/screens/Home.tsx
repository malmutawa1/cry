import { useState } from 'react'
import { useStore, orderStage } from '../store'
import { useI18n } from '../i18n'
import { useNow } from '../useNow'
import { planName } from '../data/plans'
import { Bag, CalendarIn, Chevron, Gift, Globe, Hanger, Route } from '../components/Icons'
import Reveal from '../components/Reveal'
import { useCountUp } from '../useCountUp'
import { ExtraKgSheet, useAllowance } from '../components/ExtraKg'
import { useItemsConfig, categoryName, categoryExamples } from '../data/items'
import { tierInfo } from '../data/rewards'
import { useAppConfig } from '../useAppConfig'
import { Info } from '../components/Icons'
import NotificationsBell from '../components/NotificationsBell'

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
  const { activePlan, user, activeOrder, points, lifetimePoints } = useStore()
  const shownPoints = useCountUp(points)
  const { t, lang, toggle } = useI18n()
  const { announcement } = useAppConfig()
  const annText = lang === 'ar' ? announcement.ar : announcement.en
  const now = useNow(1000)
  const { usedItems: used, allowance, atLimit } = useAllowance()
  const itemsCfg = useItemsConfig()
  const tier = tierInfo(lifetimePoints).current
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
        <div className="topbar-actions">
          <NotificationsBell />
          <button className="round-btn" onClick={toggle} aria-label="Language">
            <Globe />
          </button>
        </div>
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

        {announcement.on && annText.trim() && (
          <div className={`announce announce-${announcement.tone}`}>
            <Info size={18} />
            <span>{annText}</span>
          </div>
        )}

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
            <div className="hc-remain">{t('home.plan.remain', { n: Math.max(0, allowance - used) })}</div>
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

        {activePlan && (
          <div className="count-rule">
            <div className="cr-title">{t('count.title')}</div>
            <div className="cr-rows">
              {itemsCfg.categories.map((c) => (
                <div key={c.id} className="cr-row">
                  <span className="cr-info">
                    <span className="cr-name">{categoryName(c, lang)}</span>
                    <span className="cr-eg">{categoryExamples(c, lang).split(',').slice(0, 3).map((s) => s.trim()).join(', ')}</span>
                  </span>
                  <span className="cr-mult">{t('count.eq', { n: c.multiplier })}</span>
                </div>
              ))}
              <div className="cr-row">
                <span className="cr-info">
                  <span className="cr-name">{t('count.bedding')}</span>
                  <span className="cr-eg">{t('count.beddingEg')}</span>
                </span>
                <span className="cr-mult cr-addon">{t('count.addon')}</span>
              </div>
            </div>
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
          <span className="loy-card-pts">{shownPoints} {t('loyalty.pts')}</span>
          <Chevron className="chev" />
        </button>

        <div className="section-title">{t('home.how')}</div>
        <div className="pad stagger">
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
