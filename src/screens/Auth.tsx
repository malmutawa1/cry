import { useRef, useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import LocationPicker from '../components/LocationPicker'
import { Apple, Check, Close, Globe, Lock, Mail, Phone, Pin, User as UserIcon } from '../components/Icons'

type Step = 'name' | 'email' | 'phone' | 'password' | 'emailOtp' | 'phoneOtp' | 'location'
const STEPS: Step[] = ['name', 'email', 'phone', 'password', 'emailOtp', 'phoneOtp', 'location']

function Otp({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  function set(i: number, ch: string) {
    const digit = ch.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(4, ' ').split('')
    arr[i] = digit || ' '
    onChange(arr.join('').replace(/\s+$/, ''))
    if (digit && i < 3) refs.current[i + 1]?.focus()
  }
  return (
    <div className="otp">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="otp-box"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
          }}
        />
      ))}
    </div>
  )
}

export default function Auth() {
  const { signup, login, loginWithApple, setPhone, setAddress } = useStore()
  const { t, toggle } = useI18n()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [phone, setPhoneVal] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [locAddress, setLocAddress] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const emailOk = /.+@.+\..+/.test(email)
  const phoneOk = phone.replace(/\D/g, '').length >= 8
  const passwordOk = password.length >= 4 && password === confirm

  function switchMode(m: 'login' | 'signup') {
    setMode(m)
    setStep('name')
  }
  function goNext() {
    const i = STEPS.indexOf(step)
    if (i < STEPS.length - 1) setStep(STEPS[i + 1])
  }
  function back() {
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1])
    else switchMode('login')
  }
  function completeSignup() {
    setPhone(phone)
    if (locAddress) setAddress(locAddress)
    signup(name, email) // sets user + flags needsPlan → plans screen opens
  }

  const firstName = name.trim().split(/\s+/)[0] || name.trim()

  if (celebrate) {
    return (
      <>
        <div className="topbar" style={{ justifyContent: 'center' }}>
          <div className="brand">
            <span className="brand-mark">P</span>
            {t('brand')}
          </div>
        </div>
        <div className="success">
          <div className="check-ring">
            <Check size={44} />
          </div>
          <h2>{t('done.title')}</h2>
          <p>{t('done.sub', { name: firstName })}</p>
        </div>
        <div className="bottom-cta">
          <button className="btn-primary" onClick={completeSignup}>
            {t('done.cta')}
          </button>
        </div>
      </>
    )
  }

  if (showMap) {
    return (
      <LocationPicker
        onSelect={(addr) => {
          setLocAddress(addr)
          setShowMap(false)
        }}
        onClose={() => setShowMap(false)}
      />
    )
  }

  const isSignup = mode === 'signup'
  const stepIdx = STEPS.indexOf(step)

  return (
    <>
      <div className="topbar">
        {isSignup ? (
          <button className="round-btn" onClick={back} aria-label="Back">
            <Close />
          </button>
        ) : (
          <div className="brand">
            <span className="brand-mark">P</span>
            {t('brand')}
          </div>
        )}
        {isSignup ? (
          <div className="step-dots">
            {STEPS.map((s, i) => (
              <span key={s} className={`step-dot ${i <= stepIdx ? 'on' : ''}`} />
            ))}
          </div>
        ) : (
          <span />
        )}
        <button className="round-btn" onClick={toggle} aria-label="Language">
          <Globe />
        </button>
      </div>

      <div className="screen">
        {/* ---------- LOGIN ---------- */}
        {!isSignup && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.login.title')}</h2>
            <p className="auth-sub">{t('auth.login.sub')}</p>

            <label className="input">
              <Mail className="in-ic" size={20} />
              <input type="email" inputMode="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="input">
              <Lock className="in-ic" size={20} />
              <input type="password" placeholder={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>

            <button className="btn-primary" disabled={!(emailOk && password.length >= 4)} onClick={() => login(email)} style={{ marginTop: 6 }}>
              {t('auth.login.cta')}
            </button>

            <div className="divider"><span>{t('auth.or')}</span></div>
            <button className="btn-apple" onClick={loginWithApple}>
              <Apple size={18} />
              {t('auth.apple')}
            </button>
            <button className="link-btn" onClick={() => switchMode('signup')}>{t('auth.toSignup')}</button>
            <p className="auth-terms">{t('auth.terms')}</p>
          </div>
        )}

        {/* ---------- SIGNUP: name ---------- */}
        {isSignup && step === 'name' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.q.name')}</h2>
            <p className="auth-sub">{t('auth.q.name.sub')}</p>
            <label className="input">
              <UserIcon className="in-ic" size={20} />
              <input placeholder={t('auth.name')} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </label>
            <button className="btn-primary" disabled={name.trim().length === 0} onClick={goNext} style={{ marginTop: 6 }}>
              {t('auth.continue')}
            </button>
            <button className="link-btn" onClick={() => switchMode('login')}>{t('auth.toLogin')}</button>
          </div>
        )}

        {/* ---------- SIGNUP: email ---------- */}
        {isSignup && step === 'email' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.q.email')}</h2>
            <p className="auth-sub">{t('auth.q.email.sub')}</p>
            <label className="input">
              <Mail className="in-ic" size={20} />
              <input type="email" inputMode="email" placeholder={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </label>
            <button className="btn-primary" disabled={!emailOk} onClick={goNext} style={{ marginTop: 6 }}>
              {t('auth.continue')}
            </button>
          </div>
        )}

        {/* ---------- SIGNUP: phone ---------- */}
        {isSignup && step === 'phone' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.q.phone')}</h2>
            <p className="auth-sub">{t('auth.q.phone.sub')}</p>
            <label className="input">
              <Phone className="in-ic" size={20} />
              <input type="tel" inputMode="tel" dir="ltr" placeholder={t('auth.phone')} value={phone} onChange={(e) => setPhoneVal(e.target.value)} autoFocus />
            </label>
            <button className="btn-primary" disabled={!phoneOk} onClick={goNext} style={{ marginTop: 6 }}>
              {t('auth.continue')}
            </button>
          </div>
        )}

        {/* ---------- SIGNUP: password ---------- */}
        {isSignup && step === 'password' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.q.password')}</h2>
            <p className="auth-sub">{t('auth.q.password.sub')}</p>
            <label className="input">
              <Lock className="in-ic" size={20} />
              <input type="password" placeholder={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            </label>
            <label className="input">
              <Lock className="in-ic" size={20} />
              <input type="password" placeholder={t('auth.confirm')} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {confirm.length > 0 && password !== confirm && <p className="field-err">{t('auth.mismatch')}</p>}
            <button className="btn-primary" disabled={!passwordOk} onClick={goNext} style={{ marginTop: 6 }}>
              {t('auth.continue')}
            </button>
          </div>
        )}

        {/* ---------- SIGNUP: email OTP ---------- */}
        {isSignup && step === 'emailOtp' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.email.otp.title')}</h2>
            <p className="auth-sub">{t('auth.email.otp.sub', { email })}</p>
            <Otp value={emailCode} onChange={setEmailCode} />
            <p className="otp-demo">{t('auth.otp.demo')}</p>
            <button className="btn-primary" disabled={!/^\d{4}$/.test(emailCode)} onClick={goNext}>
              {t('auth.verify')}
            </button>
            <button className="link-btn" onClick={() => setEmailCode('')}>{t('auth.otp.resend')}</button>
          </div>
        )}

        {/* ---------- SIGNUP: phone OTP ---------- */}
        {isSignup && step === 'phoneOtp' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.phone.otp.title')}</h2>
            <p className="auth-sub" dir="auto">{t('auth.phone.otp.sub', { phone })}</p>
            <Otp value={phoneCode} onChange={setPhoneCode} />
            <p className="otp-demo">{t('auth.otp.demo')}</p>
            <button className="btn-primary" disabled={!/^\d{4}$/.test(phoneCode)} onClick={goNext}>
              {t('auth.verify')}
            </button>
            <button className="link-btn" onClick={() => setPhoneCode('')}>{t('auth.otp.resend')}</button>
          </div>
        )}

        {/* ---------- SIGNUP: location ---------- */}
        {isSignup && step === 'location' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.loc.title')}</h2>
            <p className="auth-sub">{t('auth.loc.sub')}</p>
            <button className="loc-choose" onClick={() => setShowMap(true)}>
              <span className={`lc-ic ${locAddress ? 'done' : ''}`}>{locAddress ? <Check size={20} /> : <Pin size={20} />}</span>
              <span className="lc-body">
                <span className="lc-title">{locAddress ? locAddress : t('auth.loc.choose')}</span>
                {locAddress && <span className="lc-sub">{t('auth.loc.change')}</span>}
              </span>
            </button>
            <button className="btn-primary" disabled={!locAddress} onClick={() => setCelebrate(true)} style={{ marginTop: 6 }}>
              {t('auth.finish')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
