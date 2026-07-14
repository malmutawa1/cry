import { useState } from 'react'
import { usePos } from './store'
import { Login } from './screens/Login'
import { Register } from './screens/Register'
import { Menu } from './screens/Menu'
import { Dashboard } from './screens/Dashboard'

type View = 'register' | 'menu' | 'dashboard'

const NAV: { id: View; label: string; glyph: string }[] = [
  { id: 'register', label: 'Register', glyph: '🧾' },
  { id: 'menu', label: 'Menu', glyph: '🧺' },
  { id: 'dashboard', label: 'Dashboard', glyph: '📊' },
]

export function PosApp() {
  const { currentStaff, logout } = usePos()
  const [view, setView] = useState<View>('register')

  if (!currentStaff) return <Login />

  return (
    <div className="pos">
      <header className="pos-top">
        <div className="brand">
          Pressd<span className="dot">.</span>
          <span className="tag">POS</span>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'on' : ''} onClick={() => setView(n.id)}>
              <span className="g">{n.glyph}</span>
              <span className="txt">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="spacer" />
        <div className="who">
          <div style={{ textAlign: 'right' }}>
            <div className="name">{currentStaff.name}</div>
            <div className="role">{currentStaff.role}</div>
          </div>
          <div className="avatar">{currentStaff.name[0]}</div>
          <button className="logout" onClick={logout} aria-label="Sign out" title="Sign out">
            ⏻
          </button>
        </div>
      </header>

      <main className="pos-body">
        {view === 'register' && <Register />}
        {view === 'menu' && <Menu />}
        {view === 'dashboard' && <Dashboard />}
      </main>
    </div>
  )
}
