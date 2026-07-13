import { useStore } from '../store'
import { useI18n } from '../i18n'
import { extras } from '../data/extras'
import { Plus } from './Icons'

/** Shared allowance math: usage sits at the plan cap until extra kg are bought. */
export function useAllowance() {
  const { activePlan, extraKg } = useStore()
  const baseCap = activePlan?.capKg ?? 0
  const allowance = baseCap + extraKg
  const usedKg = baseCap
  const remaining = allowance - usedKg
  const atLimit = activePlan != null && remaining <= 0
  const pct = allowance ? Math.min(100, (usedKg / allowance) * 100) : 0
  return { baseCap, allowance, usedKg, remaining, atLimit, pct }
}

/** Tappable banner shown at the allowance limit; opens the top-up popup. */
export function ExtraKgBanner({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  return (
    <button className="extra-banner" onClick={onClick}>
      <span className="eb-ic"><Plus size={20} /></span>
      <span className="eb-body">
        <span className="eb-title">{t('extra.limit')}</span>
        <span className="eb-sub">{t('extra.sub')}</span>
      </span>
      <span className="eb-cta">{t('extra.manage')} ›</span>
    </button>
  )
}

/** Bottom-sheet popup with the +5 kg / +8 kg top-up slots. */
export function ExtraKgSheet({ onClose }: { onClose: () => void }) {
  const { addExtraKg, showToast } = useStore()
  const { t } = useI18n()

  function buy(kg: number) {
    addExtraKg(kg)
    showToast(t('toast.extraAdded', { kg }))
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{t('extra.title')}</h3>
        <div className="sheet-scroll">
          <p className="extra-sheet-sub">{t('extra.limit')} · {t('extra.sub')}</p>
          <div className="extra-grid">
            {extras.map((e) => (
              <div key={e.kg} className="extra-card">
                <div className="ex-kg">+{e.kg} kg</div>
                <div className="ex-price">{e.priceKwd}.000 KWD</div>
                <button className="ex-add" onClick={() => buy(e.kg)}>
                  <Plus size={16} />
                  {t('extra.add')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
