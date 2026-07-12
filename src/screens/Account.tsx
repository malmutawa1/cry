import { useStore } from '../store'
import { useI18n } from '../i18n'
import { planName } from '../data/plans'
import { Cards, Chevron, Clock, Globe, Leaf, Pin, Receipt, User } from '../components/Icons'

export default function Account({ email, onSeePlans }: { email: string; onSeePlans: () => void }) {
  const { activePlan } = useStore()
  const { t, lang, toggle } = useI18n()
  const usedKg = activePlan ? Math.round(activePlan.capKg * 0.42) : 0
  const pct = activePlan ? Math.min(100, (usedKg / activePlan.capKg) * 100) : 0

  return (
    <>
      <div className="topbar">
        <h1>{t('account.title')}</h1>
      </div>
      <div className="screen">
        <div className="acct-head">
          <div className="acct-avatar">A</div>
          <div>
            <div className="acct-name">{t('account.name')}</div>
            <div className="acct-mail">{email}</div>
          </div>
        </div>

        {activePlan ? (
          <div className="usage-card">
            <div className="u-top">
              <div>
                <div className="u-plan">{t('home.plan.active', { name: planName(activePlan, lang) })}</div>
                <div className="u-sub">{t('account.renews', { price: activePlan.priceKwd })}</div>
              </div>
            </div>
            <div className="bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="u-legend">
              <span>{t('account.used', { kg: usedKg })}</span>
              <span>{t('account.allow', { kg: activePlan.capKg })}</span>
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

        <div className="card-group">
          <AcctRow icon={<Globe />} label={t('account.language')} value={t('account.lang.value')} onClick={toggle} />
          <AcctRow icon={<Receipt />} label={t('account.orders')} />
          <AcctRow icon={<Pin />} label={t('account.addresses')} />
          <AcctRow icon={<Cards />} label={t('account.payment')} />
          <AcctRow icon={<Clock />} label={t('account.freeze')} />
        </div>

        <div className="card-group">
          <AcctRow icon={<User />} label={t('account.personal')} />
          <AcctRow icon={<Leaf />} label={t('account.refer')} />
        </div>
        <div style={{ height: 12 }} />
      </div>
    </>
  )
}

function AcctRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
}) {
  return (
    <button className="row" onClick={onClick}>
      <span className="row-ic">{icon}</span>
      <span className="row-body">
        <span className="value" style={{ fontWeight: 600 }}>{label}</span>
      </span>
      {value && <span className="row-value">{value}</span>}
      <Chevron className="chev" />
    </button>
  )
}
