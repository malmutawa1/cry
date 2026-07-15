import { useState } from 'react'
import { usePos } from '../store'

/** Staff PIN gate. Independent of the customer app's Auth screen. */
export function Login() {
  const { login } = usePos()
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)

  function press(d: string) {
    if (err) setErr(false)
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      // Small delay so the 4th dot fills before we validate.
      setTimeout(() => {
        if (!login(next)) {
          setErr(true)
          setPin('')
        }
      }, 120)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand">
          Pressd<span className="dot">.</span>
        </div>
        <p className="lead">Operations terminal — enter your passcode</p>

        <div className={`pin-dots${err ? ' err' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < pin.length ? 'full' : ''} />
          ))}
        </div>

        <div className="keypad">
          {keys.map((k) => (
            <button key={k} onClick={() => press(k)}>
              {k}
            </button>
          ))}
          <button className="ghost" onClick={() => setPin('')}>
            Clear
          </button>
          <button onClick={() => press('0')}>0</button>
          <button className="ghost" onClick={() => setPin((p) => p.slice(0, -1))}>
            ⌫
          </button>
        </div>

        <p className="login-hint">
          Demo passcodes — <b>2468</b> Fatima · <b>1357</b> Yousef · <b>1111</b> Ahmad
        </p>
      </div>
    </div>
  )
}
