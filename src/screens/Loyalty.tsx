import { useState } from 'react'
import { useStore, POINTS_PER_PICKUP } from '../store'
import { useCountUp } from '../useCountUp'
import { useI18n } from '../i18n'
import { rewards, tierInfo, TIERS, TIER_PERKS } from '../data/rewards'
import { Bag, Check, Chevron, Close, Gift, Leaf, Star } from '../components/Icons'

function Tiers({ onBack, currentKey }: { onBack: () => void; currentKey: string }) {
  const { t } = useI18n()
  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label="Back">
          <Close />
        </button>
        <h1>{t('tiers.title')}</h1>
        <span style={{ width: 42 }} />
      </div>
      <div className="screen">
        {TIERS.map((tier) => {
          const isCurrent = tier.key === currentKey
          return (
            <div key={tier.key} className={`tier-card ${tier.key} ${isCurrent ? 'current' : ''}`}>
              <div className="tier-head">
                <span className="tier-badge">
                  <Star size={14} /> {t(`loyalty.tier.${tier.key}`)}
                </span>
                {isCurrent && <span className="tier-cur">{t('tiers.current')}</span>}
                <span className="tier-from">{t('tiers.from', { n: tier.min })}</span>
              </div>
              <ul className="perks">
                {TIER_PERKS[tier.key].map((p) => (
                  <li key={p}>
                    <span className="tick"><Check size={16} /></span>
                    {t(p)}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        <div style={{ height: 12 }} />
      </div>
    </>
  )
}

export default function Loyalty({ onBack }: { onBack: () => void }) {
  const { points, redeemReward, showToast } = useStore()
  const shownPoints = useCountUp(points)
  const { t } = useI18n()
  const { current, next, progress } = tierInfo(points)
  const [done, setDone] = useState<string[]>([])
  const [view, setView] = useState<'main' | 'tiers'>('main')

  if (view === 'tiers')
    return (
      <div className="anim-in" key="tiers">
        <Tiers onBack={() => setView('main')} currentKey={current.key} />
      </div>
    )

  const earn = [
    { icon: <Bag size={20} />, label: t('loyalty.earn.pickup'), pts: POINTS_PER_PICKUP },
    { icon: <Leaf size={20} />, label: t('loyalty.earn.refer'), pts: 200 },
    { icon: <Star size={20} />, label: t('loyalty.earn.annual'), pts: 500 },
  ]

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label="Back">
          <Close />
        </button>
        <h1>{t('loyalty.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="screen">
        {/* balance card — tap to view all tiers */}
        <button className={`loy-hero tier-${current.key}`} onClick={() => setView('tiers')}>
          <div className="loy-top">
            <span className="loy-tier">
              <Star size={14} /> {t(`loyalty.tier.${current.key}`)}
            </span>
            <span className="loy-bal-label">{t('loyalty.balance')}</span>
          </div>
          <div className="loy-points">
            {shownPoints} <span>{t('loyalty.pts')}</span>
          </div>
          <div className="loy-bar">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="loy-next">
            <span>
              {next
                ? t('loyalty.toNext', { n: next.min - points, tier: t(`loyalty.tier.${next.key}`) })
                : t('loyalty.maxTier')}
            </span>
            <span className="loy-view">
              {t('loyalty.viewTiers')} <Chevron size={16} />
            </span>
          </div>
        </button>

        {/* ways to earn */}
        <div className="section-title" style={{ fontSize: 20 }}>{t('loyalty.earn')}</div>
        <div className="card-group stagger">
          {earn.map((e, i) => (
            <div className="row" key={i}>
              <span className="row-ic">{e.icon}</span>
              <span className="row-body">
                <span className="value" style={{ fontWeight: 600 }}>{e.label}</span>
              </span>
              <span className="loy-earn-pts">+{e.pts}</span>
            </div>
          ))}
        </div>

        {/* redeem */}
        <div className="section-title" style={{ fontSize: 20 }}>{t('loyalty.redeemTitle')}</div>
        <div className="stagger" style={{ paddingBottom: 8 }}>
          {rewards.map((r) => {
            const redeemed = done.includes(r.id)
            const enough = points >= r.pts
            return (
              <div className="reward-row" key={r.id}>
                <span className="rw-ic"><Gift size={22} /></span>
                <span className="rw-body">
                  <span className="rw-title">{t(r.titleKey)}</span>
                  <span className="rw-pts">{r.pts} {t('loyalty.pts')}</span>
                </span>
                {redeemed ? (
                  <span className="rw-done"><Check size={16} /> {t('loyalty.redeemed')}</span>
                ) : (
                  <button
                    className="rw-btn"
                    disabled={!enough}
                    onClick={() => {
                      if (redeemReward(r.id, r.pts)) {
                        setDone((d) => [...d, r.id])
                        showToast(t(`toast.redeemed.${r.id}`))
                      }
                    }}
                  >
                    {enough ? t('loyalty.redeem') : t('loyalty.need', { n: r.pts - points })}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ height: 12 }} />
      </div>
    </>
  )
}
