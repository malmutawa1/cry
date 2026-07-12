import { useState } from 'react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { Apple, Globe, Lock, Mail, User as UserIcon } from '../components/Icons'

export default function Auth() {
  const { login, signup, loginWithApple } = useStore()
  const { t, toggle } = useI18n()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const emailOk = /.+@.+\..+/.test(email)
  const canSubmit = emailOk && password.length >= 4 && (mode === 'login' || name.trim().length > 0)

  function submit() {
    if (!canSubmit) return
    if (mode === 'login') login(email)
    else signup(name, email)
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          {t('brand')}
        </div>
        <button className="round-btn" onClick={toggle} aria-label="Language">
          <Globe />
        </button>
      </div>

      <div className="screen">
        <div className="auth">
          <h2 className="auth-title">{t(mode === 'login' ? 'auth.login.title' : 'auth.signup.title')}</h2>
          <p className="auth-sub">{t(mode === 'login' ? 'auth.login.sub' : 'auth.signup.sub')}</p>

          {mode === 'signup' && (
            <label className="input">
              <UserIcon className="in-ic" size={20} />
              <input
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}

          <label className="input">
            <Mail className="in-ic" size={20} />
            <input
              type="email"
              inputMode="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="input">
            <Lock className="in-ic" size={20} />
            <input
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          <button className="btn-primary" disabled={!canSubmit} onClick={submit} style={{ marginTop: 6 }}>
            {t(mode === 'login' ? 'auth.login.cta' : 'auth.signup.cta')}
          </button>

          <div className="divider">
            <span>{t('auth.or')}</span>
          </div>

          <button className="btn-apple" onClick={loginWithApple}>
            <Apple size={18} />
            {t('auth.apple')}
          </button>

          <button className="link-btn" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {t(mode === 'login' ? 'auth.toSignup' : 'auth.toLogin')}
          </button>

          <p className="auth-terms">{t('auth.terms')}</p>
        </div>
      </div>
    </>
  )
}
