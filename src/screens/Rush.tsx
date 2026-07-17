import { useState } from 'react'
import { useI18n } from '../i18n'
import { useRush } from '../useRush'
import { TIERS, tierFee, type RushTier } from '../data/rush'
import { RushCheckoutSheet } from '../components/DateTimeSheet'
import { Bolt } from '../components/Icons'

const RUSH_ONLY: ('express' | 'urgent')[] = ['express', 'urgent']

/**
 * Dedicated rush booking page (Express + Urgent). The whole page is a dramatic
 * red, animated, textured surface with white writing — it announces itself the
 * moment the customer opens the tab.
 */
export default function Rush({ onConfirm }: { onConfirm: (opts?: { tier?: RushTier; rushFee?: number }) => void }) {
  const { t, lang } = useI18n()
  const { settings, capReached } = useRush()
  const [rush, setRush] = useState<{ tier: 'express' | 'urgent'; fee: number } | null>(null)

  return (
    <div className="rush-page">
      <div className="rush-tex" aria-hidden="true" />
      <div className="rush-glow" aria-hidden="true" />
      <div className="rush-inner">
        <div className="rush-hero">
          <span className="rush-pill"><Bolt size={18} /> {t('nav.rush')}</span>
          <h1>{t('rush.page.title')}</h1>
          <p>{t('rush.page.sub')}</p>
        </div>

        <div className="rush-cards">
          {RUSH_ONLY.map((tid) => {
            const meta = TIERS[tid]
            const fee = tierFee(tid, settings)
            return (
              <button
                key={tid}
                className={`rush-choice ${tid}`}
                disabled={capReached}
                onClick={() => setRush({ tier: tid, fee })}
              >
                <div className="rc-top">
                  <span className="rc-name">{lang === 'ar' ? meta.label.ar : meta.label.en}</span>
                  <span className="rc-fee">+{fee}.000 KWD</span>
                </div>
                <div className="rc-ready">{lang === 'ar' ? meta.ready.ar : meta.ready.en}</div>
                <div className="rc-benefit">{t(`rush.benefit.${tid}`)}</div>
                <span className="rc-cta">{capReached ? t('rush.unavailable') : t('rush.book')}</span>
              </button>
            )
          })}
        </div>

        {capReached && <div className="rush-cap-line">{t('dt.capReached')}</div>}
        <p className="rush-note">{t('rush.page.note')}</p>
      </div>

      {rush && (
        <RushCheckoutSheet
          tier={rush.tier}
          fee={rush.fee}
          onPaid={() => { onConfirm({ tier: rush.tier, rushFee: rush.fee }); setRush(null) }}
          onClose={() => setRush(null)}
        />
      )}
    </div>
  )
}
