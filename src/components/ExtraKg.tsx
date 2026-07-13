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

/** The "Extra kilograms" top-up slots, shown when the allowance is used up. */
export function ExtraKgSlots() {
  const { addExtraKg } = useStore()
  const { t } = useI18n()
  return (
    <div className="extra-block">
      <div className="extra-head">
        <div className="extra-title">{t('extra.title')}</div>
        <div className="extra-sub">
          {t('extra.limit')} · {t('extra.sub')}
        </div>
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
  )
}
