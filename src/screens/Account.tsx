import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { planName, planPrice } from '../data/plans'
import { extras } from '../data/extras'
import { PaymentSheet } from '../components/Payment'
import { Cards, Chevron, Clock, Globe, Leaf, Logout, Pin, Plus, Receipt, User } from '../components/Icons'
import History from './History'

export default function Account({ onSeePlans, onTrack }: { onSeePlans: () => void; onTrack: () => void }) {
  const { activePlan, billing, extraKg, addExtraKg, user, logout } = useStore()
  const { t, lang, toggle } = useI18n()
  const [payOpen, setPayOpen] = useState(false)
  const [view, setView] = useState<'main' | 'history'>('main')

  if (view === 'history') return <History onBack={() => setView('main')} onTrack={onTrack} />
  // Demo: the current month's usage sits at the plan's base cap, so the
  // allowance is spent until extra kg are bought (which grow the allowance).
  const baseCap = activePlan?.capKg ?? 0
  const allowance = baseCap + extraKg
  const usedKg = baseCap
  const remaining = allowance - usedKg
  const atLimit = activePlan != null && remaining <= 0
  const pct = allowance ? Math.min(100, (usedKg / allowance) * 100) : 0
  const initial = (user?.name || 'A').trim().charAt(0).toUpperCase()

  return (
    <>
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

        {atLimit && (
          <div className="extra-block">
            <div className="extra-head">
              <div className="extra-title">{t('extra.title')}</div>
              <div className="extra-sub">{t('extra.limit')} · {t('extra.sub')}</div>
            </div>
            <div className="extra-grid">
              {extras.map((e) => (
                <div key={e.kg} className="extra-card">
                  <div className="ex-kg">+{e.kg} kg</div>
                  <div className="ex-price">{e.priceKwd}.000 KWD</div>
                  <button className="ex-add" onClick={() => addExtraKg(e.kg)}>
                    <Plus size={16} />
                    {t('extra.add')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-group">
          <AcctRow icon={<Globe />} label={t('account.language')} value={t('account.lang.value')} onClick={toggle} />
          <AcctRow icon={<Cards />} label={t('account.payment')} onClick={() => setPayOpen(true)} />
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
    </>
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
