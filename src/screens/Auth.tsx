import { useRef, useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import LocationPicker from '../components/LocationPicker'
import Reveal from '../components/Reveal'
import { Apple, Check, Close, Female, Globe, Lock, Mail, Male, Phone, Pin, User as UserIcon } from '../components/Icons'
import { GmailCard, SmsDelivery, gen4 } from '../components/OtpDelivery'

type Step = 'gender' | 'name' | 'email' | 'phone' | 'password' | 'emailOtp' | 'phoneOtp' | 'location'
const STEPS: Step[] = ['gender', 'name', 'email', 'phone', 'password', 'emailOtp', 'phoneOtp', 'location']

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

export default function Auth({ onStaff }: { onStaff: () => void }) {
  const { signup, login, loginWithApple, setPhone, setAddress, setAccent, setMode: setAppMode } = useStore()
  const { t, toggle } = useI18n()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<Step>('gender')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [name, setName] = useState('')
  const [remember, setRemember] = useState(() => {
    try {
      return localStorage.getItem('pressd.remember') === '1'
    } catch {
      return false
    }
  })
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('pressd.remember') === '1' ? localStorage.getItem('pressd.email') || '' : ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [phone, setPhoneVal] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  // The codes actually "sent" this session (regenerated on resend).
  const [emailSent, setEmailSent] = useState(gen4)
  const [phoneSent, setPhoneSent] = useState(gen4)
  // Supabase auth feedback
  const [authBusy, setAuthBusy] = useState(false)
  const [authErr, setAuthErr] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)
  const [locAddress, setLocAddress] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const emailOk = /.+@.+\..+/.test(email)
  const phoneOk = phone.replace(/\D/g, '').length >= 8
  // Supabase requires a minimum of 6 characters.
  const passwordOk = password.length >= 6 && password === confirm

  function authErrText(res: { error?: string; code?: string }): string {
    if (!res.code && /fail|fetch|network/i.test(res.error || '')) return t('auth.err.network')
    switch (res.code) {
      case 'invalid_credentials':
        return t('auth.err.credentials')
      case 'email_not_confirmed':
        return t('auth.err.unconfirmed')
      case 'user_already_exists':
      case 'email_exists':
        return t('auth.err.exists')
      case 'weak_password':
        return t('auth.err.weakpw')
      default:
        return res.error || t('auth.err.generic')
    }
  }

  function switchMode(m: 'login' | 'signup') {
    setMode(m)
    setStep('gender')
    setAuthErr('')
    setConfirmSent(false)
    setAuthBusy(false)
    if (m === 'login') {
      setGender(null)
      setAccent('blue')
      setAppMode('light')
    }
  }
  function selectGender(g: 'male' | 'female') {
    setGender(g)
    setAccent(g === 'female' ? 'pink' : 'blue') // pink / light-blue accent
    setAppMode('light') // gender defaults to a light look; changeable in Display settings
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
  async function completeSignup() {
    setPhone(phone)
    if (locAddress) setAddress(locAddress)
    setAuthErr('')
    setAuthBusy(true)
    // Creates the Supabase account; on success either a session opens the app
    // or (if the project requires it) we prompt to confirm the email.
    const res = await signup(name, email, { password, phone, gender: gender ?? undefined, address: locAddress || undefined })
    setAuthBusy(false)
    if (!res.ok) {
      setAuthErr(authErrText(res))
      return
    }
    if (res.needsConfirmation) setConfirmSent(true)
    // else: a session was created → the app switches to the main screens.
  }
  async function doLogin() {
    try {
      if (remember) {
        localStorage.setItem('pressd.remember', '1')
        localStorage.setItem('pressd.email', email)
      } else {
        localStorage.removeItem('pressd.remember')
        localStorage.removeItem('pressd.email')
      }
    } catch {
      /* storage unavailable — ignore */
    }
    setAuthErr('')
    setAuthBusy(true)
    const res = await login(email, password)
    setAuthBusy(false)
    if (!res.ok) setAuthErr(authErrText(res))
  }

  const firstName = name.trim().split(/\s+/)[0] || name.trim()

  if (confirmSent) {
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
            <Mail size={40} />
          </div>
          <h2>{t('auth.confirm.title')}</h2>
          <p>{t('auth.confirm.sub', { email })}</p>
        </div>
        <div className="bottom-cta">
          <button
            className="btn-primary"
            onClick={() => {
              setConfirmSent(false)
              setCelebrate(false)
              switchMode('login')
            }}
          >
            {t('auth.confirm.cta')}
          </button>
        </div>
      </>
    )
  }

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
          {authErr && <p className="field-err" style={{ textAlign: 'center', marginBottom: 8 }}>{authErr}</p>}
          <button className="btn-primary" disabled={authBusy} onClick={completeSignup}>
            {authBusy ? t('auth.busy') : t('done.cta')}
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
            <Reveal as="h2" className="auth-title" text={t('auth.login.title')} />
            <p className="auth-sub reveal-sub">{t('auth.login.sub')}</p>

            <label className="input">
              <Mail className="in-ic" size={20} />
              <input type="email" inputMode="email" placeholder={t('auth.email')} value={email} onChange={(e) => { setEmail(e.target.value); setAuthErr('') }} />
            </label>
            <label className="input">
              <Lock className="in-ic" size={20} />
              <input type="password" placeholder={t('auth.password')} value={password} onChange={(e) => { setPassword(e.target.value); setAuthErr('') }} />
            </label>

            <label className="remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="rem-box">{remember && <Check size={13} />}</span>
              <span>{t('auth.remember')}</span>
            </label>

            {authErr && <p className="field-err">{authErr}</p>}
            <button className="btn-primary" disabled={!(emailOk && password.length >= 4) || authBusy} onClick={doLogin} style={{ marginTop: 6 }}>
              {authBusy ? t('auth.busy') : t('auth.login.cta')}
            </button>

            <div className="divider"><span>{t('auth.or')}</span></div>
            <button className="btn-apple" onClick={loginWithApple}>
              <Apple size={18} />
              {t('auth.apple')}
            </button>
            <button className="link-btn" onClick={() => switchMode('signup')}>{t('auth.toSignup')}</button>
            <p className="auth-terms">{t('auth.terms')}</p>
            <button className="staff-link" onClick={onStaff}>{t('auth.staff')}</button>
          </div>
        )}

        {/* ---------- SIGNUP: gender ---------- */}
        {isSignup && step === 'gender' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.q.gender')}</h2>
            <p className="auth-sub">{t('auth.q.gender.sub')}</p>
            <div className="gender-grid">
              <button className={`gender-card male-card ${gender === 'male' ? 'sel' : ''}`} onClick={() => selectGender('male')}>
                <span className="g-ic"><Male size={28} /></span>
                {t('gender.male')}
              </button>
              <button className={`gender-card female-card ${gender === 'female' ? 'sel' : ''}`} onClick={() => selectGender('female')}>
                <span className="g-ic"><Female size={28} /></span>
                {t('gender.female')}
              </button>
            </div>
            <button className="btn-primary" disabled={!gender} onClick={goNext} style={{ marginTop: 6 }}>
              {t('auth.continue')}
            </button>
            <button className="link-btn" onClick={() => switchMode('login')}>{t('auth.toLogin')}</button>
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
            {emailCode.length === 4 && emailCode !== emailSent && (
              <p className="field-err">{t('auth.otp.wrong')}</p>
            )}
            <GmailCard email={email} code={emailSent} onFill={() => setEmailCode(emailSent)} />
            <button className="btn-primary" disabled={emailCode !== emailSent} onClick={goNext} style={{ marginTop: 4 }}>
              {t('auth.verify')}
            </button>
            <button className="link-btn" onClick={() => { setEmailCode(''); setEmailSent(gen4()) }}>{t('auth.otp.resend')}</button>
          </div>
        )}

        {/* ---------- SIGNUP: phone OTP ---------- */}
        {isSignup && step === 'phoneOtp' && (
          <div className="auth">
            <h2 className="auth-title">{t('auth.phone.otp.title')}</h2>
            <p className="auth-sub" dir="auto">{t('auth.phone.otp.sub', { phone })}</p>
            <Otp value={phoneCode} onChange={setPhoneCode} />
            {phoneCode.length === 4 && phoneCode !== phoneSent && (
              <p className="field-err">{t('auth.otp.wrong')}</p>
            )}
            <SmsDelivery phone={phone} code={phoneSent} onFill={() => setPhoneCode(phoneSent)} />
            <button className="btn-primary" disabled={phoneCode !== phoneSent} onClick={goNext} style={{ marginTop: 4 }}>
              {t('auth.verify')}
            </button>
            <button className="link-btn" onClick={() => { setPhoneCode(''); setPhoneSent(gen4()) }}>{t('auth.otp.resend')}</button>
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
