import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { planName, planPrice } from '../data/plans'
import { PaymentSheet } from '../components/Payment'
import { ExtraKgBanner, ExtraKgSheet, useAllowance } from '../components/ExtraKg'
import { Cards, Chevron, Clock, Gift, Globe, Leaf, Logout, Pin, Receipt, Sun, User } from '../components/Icons'
import History from './History'
import Display from './Display'
import Loyalty from './Loyalty'

export default function Account({ onSeePlans, onTrack }: { onSeePlans: () => void; onTrack: () => void }) {
  const { activePlan, billing, user, logout, mode, points } = useStore()
  const { t, lang, toggle } = useI18n()
  const [payOpen, setPayOpen] = useState(false)
  const [extraOpen, setExtraOpen] = useState(false)
  const [view, setView] = useState<'main' | 'history' | 'display' | 'loyalty'>('main')
  const { usedKg, allowance, atLimit, pct } = useAllowance()

  if (view === 'history')
    return (
      <div className="anim-in" key="history">
        <History onBack={() => setView('main')} onTrack={onTrack} />
      </div>
    )
  if (view === 'display')
    return (
      <div className="anim-in" key="display">
        <Display onBack={() => setView('main')} />
      </div>
    )
  if (view === 'loyalty')
    return (
      <div className="anim-in" key="loyalty">
        <Loyalty onBack={() => setView('main')} />
      </div>
    )
  const initial = (user?.name || 'A').trim().charAt(0).toUpperCase()

  return (
    <div className="anim-in" key="account-main">
      <div className="topbar">
        <h1>{t('account.title')}</h1>
      </div>
      <div className="screen">
        <div className="acct-head">
          <div className="acct-avatar">{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div className="acct-name">{user?.name || t('account.name')}</div>
            <div className="acct-mail">{user?.email}</div>
          </div>
        </div>

        {activePlan ? (
          <div className="usage-card">
            <div className="u-top">
              <div>
                <div className="u-plan">{t('home.plan.active', { name: planName(activePlan, lang) })}</div>
                <div className="u-sub">
                  {t(billing === 'annual' ? 'account.renewsYear' : 'account.renews', {
                    price: planPrice(activePlan, billing),
                  })}
                </div>
              </div>
            </div>
            <div className={`bar ${atLimit ? 'full' : ''}`}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="u-legend">
              <span>
                {t('account.used', { kg: usedKg })}
                {atLimit && <span className="limit-tag">{t('usage.limit')}</span>}
              </span>
              <span>{t('account.allow', { kg: allowance })}</span>
            </div>
          </div>
        ) : (
          <div className="usage-card">
            <div className="u-plan">{t('account.none.title')}</div>
            <div className="u-sub" style={{ margin: '4px 0 14px' }}>{t('account.none.sub')}</div>
            <button className="btn-primary" onClick={onSeePlans}>
              {t('account.none.cta')}
            </button>
          </div>
        )}

        {atLimit && <ExtraKgBanner onClick={() => setExtraOpen(true)} />}

        <div className="card-group">
          <AcctRow icon={<Globe />} label={t('account.language')} value={t('account.lang.value')} onClick={toggle} />
          <AcctRow icon={<Sun />} label={t('account.display')} value={t(`display.${mode}`)} onClick={() => setView('display')} />
          <AcctRow icon={<Cards />} label={t('account.payment')} onClick={() => setPayOpen(true)} />
          <AcctRow icon={<Gift />} label={t('account.rewards')} value={`${points} ${t('loyalty.pts')}`} onClick={() => setView('loyalty')} />
          <AcctRow icon={<Receipt />} label={t('account.orders')} onClick={() => setView('history')} />
          <AcctRow icon={<Pin />} label={t('account.addresses')} />
          <AcctRow icon={<Clock />} label={t('account.freeze')} />
        </div>

        <div className="card-group">
          <AcctRow icon={<User />} label={t('account.personal')} />
          <AcctRow icon={<Leaf />} label={t('account.refer')} />
        </div>

        <div className="card-group">
          <AcctRow icon={<Logout />} label={t('account.logout')} danger onClick={logout} />
        </div>
        <div style={{ height: 12 }} />
      </div>

      {payOpen && <PaymentSheet onClose={() => setPayOpen(false)} />}
      {extraOpen && <ExtraKgSheet onClose={() => setExtraOpen(false)} />}
    </div>
  )
}

function AcctRow({
  icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button className="row" onClick={onClick}>
      <span className={`row-ic ${danger ? 'danger' : ''}`}>{icon}</span>
      <span className="row-body">
        <span className="value" style={{ fontWeight: 600, color: danger ? '#f0595d' : undefined }}>
          {label}
        </span>
      </span>
      {value && <span className="row-value">{value}</span>}
      {!danger && <Chevron className="chev" />}
    </button>
  )
}
