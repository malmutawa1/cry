import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import LocationPicker from '../components/LocationPicker'
import { Close, Pin } from '../components/Icons'

export default function Addresses({ onBack }: { onBack: () => void }) {
  const { address, setAddress, showToast } = useStore()
  const { t } = useI18n()
  const [draft, setDraft] = useState(address)
  const [showMap, setShowMap] = useState(false)

  if (showMap)
    return (
      <LocationPicker
        onSelect={(addr) => {
          setDraft(addr)
          setShowMap(false)
        }}
        onClose={() => setShowMap(false)}
      />
    )

  function save() {
    setAddress(draft)
    showToast(t('toast.addressSaved'))
    onBack()
  }

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label="Back">
          <Close />
        </button>
        <h1>{t('addresses.title')}</h1>
        <span style={{ width: 42 }} />
      </div>
      <div className="screen">
        <span className="field-label">{t('addresses.label')}</span>
        <div className="addr-card">
          <span className="addr-tag">
            <Pin size={15} /> {t('addresses.home')}
          </span>
          <p className="addr-text">{draft}</p>
        </div>

        <button className="loc-choose" onClick={() => setShowMap(true)}>
          <span className="lc-ic">
            <Pin size={20} />
          </span>
          <span className="lc-body">
            <span className="lc-title">{t('addresses.change')}</span>
          </span>
        </button>

        <button className="btn-primary" disabled={draft === address} onClick={save} style={{ marginTop: 12 }}>
          {t('addresses.save')}
        </button>
      </div>
    </>
  )
}
