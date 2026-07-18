import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

/** A fresh 4-digit verification code. */
export function gen4(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function GmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2.5" fill="#fff" stroke="#EA4335" strokeWidth="2" />
      <path d="M3.5 7 12 13l8.5-6" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function MessagesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#34C759" aria-hidden="true">
      <path d="M4 3.5h16A2.5 2.5 0 0 1 22.5 6v8A2.5 2.5 0 0 1 20 16.5H10l-5 4v-4H4A2.5 2.5 0 0 1 1.5 14V6A2.5 2.5 0 0 1 4 3.5Z" />
    </svg>
  )
}

/**
 * Simulated email delivery. After a short "sending" beat, a Gmail-style row
 * appears with the code; tapping it (or "Use this code") fills the OTP boxes,
 * and "Open Gmail" deep-links to the Gmail app / web.
 */
export function GmailCard({ email, code, onFill }: { email: string; code: string; onFill: () => void }) {
  const { t } = useI18n()
  const [arrived, setArrived] = useState(false)
  useEffect(() => {
    setArrived(false)
    const id = setTimeout(() => setArrived(true), 900)
    return () => clearTimeout(id)
  }, [code])

  if (!arrived) return <div className="otp-loading">{t('auth.otp.sending', { to: email })}</div>

  return (
    <div className="otp-inbox in">
      <div className="inbox-head">
        <GmailIcon /> Gmail
      </div>
      <button className="inbox-mail" onClick={onFill}>
        <span className="im-avatar">P</span>
        <span className="im-body">
          <span className="im-row">
            <span className="im-from">Pressd</span>
            <span className="im-time">{t('auth.otp.now')}</span>
          </span>
          <span className="im-subj">{t('auth.otp.mail.subject')}</span>
          <span className="im-snip">{t('auth.otp.mail.snippet', { code })}</span>
        </span>
      </button>
      <div className="otp-actions">
        <a className="otp-openapp" href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noreferrer">
          {t('auth.otp.openGmail')}
        </a>
        <button className="otp-fill" onClick={onFill}>{t('auth.otp.autofill')}</button>
      </div>
    </div>
  )
}

/**
 * Simulated SMS delivery. After a short beat, a Messages-style bubble slides in
 * with the code; tapping it (or "Use this code") fills the OTP boxes, and
 * "Open Messages" deep-links to the phone's Messages app.
 */
export function SmsDelivery({ phone, code, onFill }: { phone: string; code: string; onFill: () => void }) {
  const { t } = useI18n()
  const [arrived, setArrived] = useState(false)
  useEffect(() => {
    setArrived(false)
    const id = setTimeout(() => setArrived(true), 1200)
    return () => clearTimeout(id)
  }, [code])

  if (!arrived) return <div className="otp-loading">{t('auth.otp.sending', { to: phone })}</div>

  return (
    <div className="otp-sms in">
      <div className="sms-app">
        <MessagesIcon />
        <span className="sms-name">{t('auth.otp.messages')}</span>
        <span className="sms-time">{t('auth.otp.now')}</span>
      </div>
      <button className="sms-bubble" onClick={onFill} dir="auto">
        {t('auth.otp.sms.text', { code })}
      </button>
      <div className="otp-actions">
        <a className="otp-openapp" href="sms:">{t('auth.otp.openMessages')}</a>
        <button className="otp-fill" onClick={onFill}>{t('auth.otp.autofill')}</button>
      </div>
    </div>
  )
}
