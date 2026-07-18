import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { planName, planPrice } from '../data/plans'
import { PaymentSheet, PaymentValue } from '../components/Payment'
import { ExtraKgBanner, ExtraKgSheet, useAllowance } from '../components/ExtraKg'
import { Cards, Chevron, Clock, Gift, Globe, Leaf, Lock, Logout, Pin, Receipt, Star, Sun, User } from '../components/Icons'
import { ReferSheet, FreezeSheet } from '../components/AccountSheets'
import History from './History'
import Display from './Display'
import Personal from './Personal'
import Addresses from './Addresses'
import Privacy from './Privacy'
import Terms from './Terms'

export default function Account({
  onSeePlans,
  onTrack,
  onRewards,
}: {
  onSeePlans: () => void
  onTrack: () => void
  onRewards: () => void
}) {
  const { activePlan, billing, user, logout, mode, points, credit, freeMonths, frozen } = useStore()
  const { t, lang, toggle } = useI18n()
  const [payOpen, setPayOpen] = useState(false)
  const [extraOpen, setExtraOpen] = useState(false)
  const [referOpen, setReferOpen] = useState(false)
  const [freezeOpen, setFreezeOpen] = useState(false)
  const [view, setView] = useState<'main' | 'history' | 'display' | 'personal' | 'addresses' | 'privacy' | 'terms'>('main')
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
  if (view === 'personal')
    return (
      <div className="anim-in" key="personal">
        <Personal onBack={() => setView('main')} />
      </div>
    )
  if (view === 'addresses')
    return (
      <div className="anim-in" key="addresses">
        <Addresses onBack={() => setView('main')} />
      </div>
    )
  if (view === 'privacy')
    return (
      <div className="anim-in" key="privacy">
        <Privacy onBack={() => setView('main')} />
      </div>
    )
  if (view === 'terms')
    return (
      <div className="anim-in" key="terms">
        <Terms onBack={() => setView('main')} />
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

        {frozen && (
          <button className="frozen-banner" onClick={() => setFreezeOpen(true)}>
            <span className="fb-ic"><Clock size={18} /></span>
            <span className="fb-body">{t('freeze.banner')}</span>
            <span className="fb-cta">{t('freeze.banner.cta')} ›</span>
          </button>
        )}

        {atLimit && <ExtraKgBanner onClick={() => setExtraOpen(true)} />}

        {(credit > 0 || freeMonths > 0) && (
          <div className="card-group">
            {credit > 0 && (
              <div className="row">
                <span className="row-ic"><Gift size={20} /></span>
                <span className="row-body"><span className="value" style={{ fontWeight: 600 }}>{t('account.credit')}</span></span>
                <span className="row-value">{t('account.credit.value', { n: credit })}</span>
              </div>
            )}
            {freeMonths > 0 && (
              <div className="row">
                <span className="row-ic"><Star size={20} /></span>
                <span className="row-body"><span className="value" style={{ fontWeight: 600 }}>{t('account.freeMonths')}</span></span>
                <span className="row-value">{t('account.freeMonths.value', { n: freeMonths })}</span>
              </div>
            )}
          </div>
        )}

        <div className="card-group stagger">
          <AcctRow icon={<Globe />} label={t('account.language')} value={t('account.lang.value')} onClick={toggle} />
          <AcctRow icon={<Sun />} label={t('account.display')} value={t(`display.${mode}`)} onClick={() => setView('display')} />
          <AcctRow icon={<Cards />} label={t('account.payment')} value={<PaymentValue />} onClick={() => setPayOpen(true)} />
          <AcctRow icon={<Gift />} label={t('account.rewards')} value={`${points} ${t('loyalty.pts')}`} onClick={onRewards} />
          <AcctRow icon={<Receipt />} label={t('account.orders')} onClick={() => setView('history')} />
          <AcctRow icon={<Pin />} label={t('account.addresses')} onClick={() => setView('addresses')} />
          <AcctRow
            icon={<Clock />}
            label={t('account.freeze')}
            value={frozen ? t('freeze.status') : undefined}
            onClick={() => setFreezeOpen(true)}
          />
        </div>

        <div className="card-group">
          <AcctRow icon={<User />} label={t('account.personal')} onClick={() => setView('personal')} />
          <AcctRow icon={<Leaf />} label={t('account.refer')} onClick={() => setReferOpen(true)} />
          <AcctRow icon={<Receipt />} label={t('account.terms')} onClick={() => setView('terms')} />
          <AcctRow icon={<Lock />} label={t('account.privacy')} onClick={() => setView('privacy')} />
        </div>

        <div className="card-group">
          <AcctRow icon={<Logout />} label={t('account.logout')} danger onClick={logout} />
        </div>
        <div style={{ height: 12 }} />
      </div>

      {payOpen && <PaymentSheet onClose={() => setPayOpen(false)} />}
      {extraOpen && <ExtraKgSheet onClose={() => setExtraOpen(false)} />}
      {referOpen && <ReferSheet onClose={() => setReferOpen(false)} />}
      {freezeOpen && <FreezeSheet onClose={() => setFreezeOpen(false)} />}
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
  value?: React.ReactNode
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
