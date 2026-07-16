import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { extras, type Extra } from '../data/extras'
import { PaymentSheet, PaymentValue } from './Payment'
import { Sheet } from './Sheet'
import { Chevron, Plus } from './Icons'

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

/** Bottom-sheet: pick a +5 kg / +8 kg top-up, then confirm on a payment step. */
export function ExtraKgSheet({ onClose }: { onClose: () => void }) {
  const { addExtraKg, showToast } = useStore()
  const { t } = useI18n()
  const [sel, setSel] = useState<Extra | null>(null)
  const [payOpen, setPayOpen] = useState(false)

  return (
    <>
      <Sheet onClose={onClose}>
        {(close) => (
          <>
            <div className="grabber" />

            {sel ? (
              /* ---------- Payment step ---------- */
              <>
                <h3>{t('checkout.title')}</h3>
                <div className="sheet-scroll anim-in" key="pay">
                  <div className="checkout-card">
                    <div className="co-top">
                      <div>
                        <div className="co-plan">+{sel.kg} kg</div>
                        <div className="co-period">{t('extra.oneTime')}</div>
                      </div>
                      <span className="plan-cap">{t('extra.thisMonth')}</span>
                    </div>
                    <div className="co-total">
                      <span>{t('checkout.total')}</span>
                      <strong>{sel.priceKwd}.000 KWD</strong>
                    </div>
                  </div>

                  <div className="section-title" style={{ fontSize: 18 }}>{t('checkout.method')}</div>
                  <div className="card-group">
                    <button className="row" onClick={() => setPayOpen(true)}>
                      <span className="pay-current"><PaymentValue /></span>
                      <Chevron className="chev" />
                    </button>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ marginTop: 6 }}
                    onClick={() => {
                      addExtraKg(sel.kg)
                      showToast(t('toast.extraAdded', { kg: sel.kg }))
                      close()
                    }}
                  >
                    {t('checkout.pay', { price: sel.priceKwd })}
                  </button>
                  <button className="link-btn" onClick={() => setSel(null)}>{t('extra.back')}</button>
                </div>
              </>
            ) : (
              /* ---------- Pick a top-up ---------- */
              <>
                <h3>{t('extra.title')}</h3>
                <div className="sheet-scroll anim-in" key="pick">
                  <p className="extra-sheet-sub">{t('extra.limit')} · {t('extra.sub')}</p>
                  <div className="extra-grid">
                    {extras.map((e) => (
                      <div key={e.kg} className="extra-card">
                        <div className="ex-kg">+{e.kg} kg</div>
                        <div className="ex-price">{e.priceKwd}.000 KWD</div>
                        <button className="ex-add" onClick={() => setSel(e)}>
                          <Plus size={16} />
                          {t('extra.add')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Sheet>

      {payOpen && <PaymentSheet onClose={() => setPayOpen(false)} />}
    </>
  )
}
