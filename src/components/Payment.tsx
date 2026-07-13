import { useState } from 'react'
import { useStore, type PayMethod } from '../store'
import { useI18n } from '../i18n'
import { ApplePayMark, CardIcon, KnetMark, Plus } from './Icons'

/** Renders the icon + label for the currently selected payment method. */
export function PaymentValue() {
  const { payment, cards } = useStore()
  const { t } = useI18n()
  if (payment === 'applepay') return <><ApplePayMark /> <span className="pay-label">{t('pay.applepay')}</span></>
  if (payment === 'knet') return <><KnetMark /> <span className="pay-label">{t('pay.knet')}</span></>
  const card = cards.find((c) => `card:${c.id}` === payment)
  return (
    <>
      <span className="pay-mark card-mark"><CardIcon size={18} /></span>
      <span className="pay-label">{card ? t('pay.card', { brand: card.brand, last4: card.last4 }) : t('pay.add')}</span>
    </>
  )
}

function Radio({ on }: { on: boolean }) {
  return <span className={`radio ${on ? 'on' : ''}`} />
}

export function PaymentSheet({ onClose }: { onClose: () => void }) {
  const { payment, setPayment, cards, showToast } = useStore()
  const { t } = useI18n()
  const [adding, setAdding] = useState(false)

  if (adding) return <AddCardSheet onClose={onClose} onBack={() => setAdding(false)} />

  function pick(m: PayMethod) {
    setPayment(m)
    showToast(t('toast.paySaved'))
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{t('pay.sheet')}</h3>
        <div className="sheet-scroll">
          <button className="pay-row" onClick={() => pick('applepay')}>
            <ApplePayMark />
            <span className="pay-name">{t('pay.applepay')}</span>
            <Radio on={payment === 'applepay'} />
          </button>

          <button className="pay-row" onClick={() => pick('knet')}>
            <KnetMark />
            <span className="pay-name">{t('pay.knet')}</span>
            <Radio on={payment === 'knet'} />
          </button>

          {cards.map((c) => (
            <button key={c.id} className="pay-row" onClick={() => pick(`card:${c.id}`)}>
              <span className="pay-mark card-mark"><CardIcon size={18} /></span>
              <span className="pay-name">{t('pay.card', { brand: c.brand, last4: c.last4 })}</span>
              <Radio on={payment === `card:${c.id}`} />
            </button>
          ))}

          <button className="btn-ghost add-card" onClick={() => setAdding(true)} style={{ marginTop: 6 }}>
            <Plus size={18} />
            <span>
              <span className="ac-title">{t('pay.add')}</span>
              <span className="ac-sub">{t('pay.add.sub')}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function AddCardSheet({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const { addCard } = useStore()
  const { t } = useI18n()
  const [number, setNumber] = useState('')
  const [exp, setExp] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const digits = number.replace(/\D/g, '')
  const canSave = digits.length >= 12 && exp.length >= 4 && cvv.length >= 3

  function formatNumber(v: string) {
    return v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h3>{t('pay.add')}</h3>
        <div className="sheet-scroll">
          <input
            className="field"
            inputMode="numeric"
            placeholder={t('pay.card.number')}
            value={number}
            onChange={(e) => setNumber(formatNumber(e.target.value))}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="field"
              inputMode="numeric"
              placeholder={t('pay.card.exp')}
              value={exp}
              onChange={(e) => setExp(e.target.value.replace(/[^\d/]/g, '').slice(0, 5))}
              style={{ flex: 1 }}
            />
            <input
              className="field"
              inputMode="numeric"
              placeholder={t('pay.card.cvv')}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              style={{ flex: 1 }}
            />
          </div>
          <input
            className="field"
            placeholder={t('pay.card.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="btn-primary"
            disabled={!canSave}
            onClick={() => {
              addCard(number)
              onBack()
              onClose()
            }}
          >
            {t('pay.card.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
