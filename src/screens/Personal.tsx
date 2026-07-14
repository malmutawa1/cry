import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { Close, Mail, Phone, User as UserIcon } from '../components/Icons'

export default function Personal({ onBack }: { onBack: () => void }) {
  const { user, phone, updateProfile, showToast } = useStore()
  const { t } = useI18n()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [ph, setPh] = useState(phone)

  const emailOk = /.+@.+\..+/.test(email)
  const changed =
    name.trim() !== (user?.name ?? '') || email.trim() !== (user?.email ?? '') || ph !== phone

  function save() {
    updateProfile({ name, email, phone: ph })
    showToast(t('toast.profileSaved'))
    onBack()
  }

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label="Back">
          <Close />
        </button>
        <h1>{t('personal.title')}</h1>
        <span style={{ width: 42 }} />
      </div>
      <div className="screen">
        <span className="field-label">{t('personal.name')}</span>
        <label className="input">
          <UserIcon className="in-ic" size={20} />
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <span className="field-label">{t('personal.email')}</span>
        <label className="input">
          <Mail className="in-ic" size={20} />
          <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <span className="field-label">{t('personal.phone')}</span>
        <label className="input">
          <Phone className="in-ic" size={20} />
          <input type="tel" inputMode="tel" dir="ltr" value={ph} onChange={(e) => setPh(e.target.value)} />
        </label>

        <button
          className="btn-primary"
          disabled={!name.trim() || !emailOk || !changed}
          onClick={save}
          style={{ marginTop: 12 }}
        >
          {t('personal.save')}
        </button>
      </div>
    </>
  )
}
