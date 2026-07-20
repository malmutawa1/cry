import { useStore } from '../store'
import { useI18n } from '../i18n'
import { useItemsConfig, addOnName, type AddOn } from '../data/items'
import { Sheet } from './Sheet'
import { Plus } from './Icons'

/** Shared allowance math, now in *items* (weighted). Overage is auto-billed
 *  per item at the admin-configured rate; bedding is a separate add-on. */
export function useAllowance() {
  const { activePlan, itemsUsed } = useStore()
  const cfg = useItemsConfig()
  const allowance = activePlan?.items ?? 0
  const usedItems = itemsUsed
  const remaining = allowance - usedItems
  const over = Math.max(0, usedItems - allowance)
  const atLimit = activePlan != null && remaining <= 0
  const overagePerItem = cfg.overagePerItem
  const overageFee = over * overagePerItem
  const pct = allowance ? Math.min(100, (usedItems / allowance) * 100) : 0
  return { allowance, usedItems, remaining, over, atLimit, overagePerItem, overageFee, pct }
}

/** Tappable banner shown at the allowance limit; opens the add-ons popup. */
export function ExtraKgBanner({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  const { over, overagePerItem } = useAllowance()
  return (
    <button className="extra-banner" onClick={onClick}>
      <span className="eb-ic"><Plus size={20} /></span>
      <span className="eb-body">
        <span className="eb-title">{over > 0 ? t('extra.overCount', { n: over }) : t('extra.limit')}</span>
        <span className="eb-sub">{t('extra.overRule', { fee: overagePerItem.toFixed(3) })}</span>
      </span>
      <span className="eb-cta">{t('extra.manage')} ›</span>
    </button>
  )
}

/** Bottom-sheet: shows the overage rule and lets the customer add bedding
 *  add-ons (billed on top of the subscription, never against the item count). */
export function ExtraKgSheet({ onClose }: { onClose: () => void }) {
  const { addBedding, showToast } = useStore()
  const { t, lang } = useI18n()
  const cfg = useItemsConfig()
  const { over, overageFee, overagePerItem } = useAllowance()

  function add(a: AddOn, close: () => void) {
    addBedding(a.id)
    showToast(t('toast.beddingAdded', { name: addOnName(a, lang) }))
    close()
  }

  return (
    <Sheet onClose={onClose}>
      {(close) => (
        <>
          <div className="grabber" />
          <h3>{t('extra.title')}</h3>
          <div className="sheet-scroll anim-in">
            {over > 0 && (
              <div className="overage-card">
                <div className="ov-row">
                  <span>{t('extra.overCount', { n: over })}</span>
                  <strong>{overageFee.toFixed(3)} KWD</strong>
                </div>
                <p className="ov-note">{t('extra.overRule', { fee: overagePerItem.toFixed(3) })}</p>
              </div>
            )}

            <div className="section-title" style={{ fontSize: 18 }}>{t('extra.beddingTitle')}</div>
            <p className="extra-sheet-sub">{t('extra.beddingSub')}</p>
            <div className="card-group">
              {cfg.addOns.map((a) => (
                <div key={a.id} className="row addon-row">
                  <span className="addon-name">{addOnName(a, lang)}</span>
                  <span className="addon-price">{a.priceKwd.toFixed(3)} KWD</span>
                  <button className="ex-add" onClick={() => add(a, close)}>
                    <Plus size={16} />
                    {t('extra.add')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Sheet>
  )
}
