import { useState } from 'react'
import { useStore, POINTS_PER_PICKUP } from '../store'
import { useI18n } from '../i18n'
import { rewards, tierInfo } from '../data/rewards'
import { Bag, Check, Close, Gift, Leaf, Star } from '../components/Icons'

export default function Loyalty({ onBack }: { onBack: () => void }) {
  const { points, redeem } = useStore()
  const { t } = useI18n()
  const { current, next, progress } = tierInfo(points)
  const [done, setDone] = useState<string[]>([])

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
        {/* balance card */}
        <div className="loy-hero">
          <div className="loy-top">
            <span className="loy-tier">
              <Star size={14} /> {t(`loyalty.tier.${current.key}`)}
            </span>
            <span className="loy-bal-label">{t('loyalty.balance')}</span>
          </div>
          <div className="loy-points">
            {points} <span>{t('loyalty.pts')}</span>
          </div>
          <div className="loy-bar">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="loy-next">
            {next ? t('loyalty.toNext', { n: next.min - points, tier: t(`loyalty.tier.${next.key}`) }) : t('loyalty.maxTier')}
          </div>
        </div>

        {/* ways to earn */}
        <div className="section-title" style={{ fontSize: 20 }}>{t('loyalty.earn')}</div>
        <div className="card-group">
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
        <div style={{ paddingBottom: 8 }}>
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
                      if (redeem(r.pts)) setDone((d) => [...d, r.id])
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
