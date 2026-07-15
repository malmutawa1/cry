import { useState } from 'react'
import { usePos } from './store'
import { Login } from './screens/Login'
import { Intake } from './screens/Intake'
import { Plans } from './screens/Plans'
import { Operations } from './screens/Operations'

type View = 'intake' | 'plans' | 'operations'

const NAV: { id: View; label: string; glyph: string }[] = [
  { id: 'intake', label: 'Intake', glyph: '📋' },
  { id: 'plans', label: 'Plans', glyph: '💳' },
  { id: 'operations', label: 'Operations', glyph: '📊' },
]

export function PosApp() {
  const { currentStaff, logout } = usePos()
  const [view, setView] = useState<View>('intake')

  if (!currentStaff) return <Login />

  return (
    <div className="pos">
      <header className="pos-top">
        <div className="brand">
          Pressd<span className="dot">.</span>
          <span className="tag">Ops</span>
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
        {view === 'intake' && <Intake />}
        {view === 'plans' && <Plans />}
        {view === 'operations' && <Operations />}
      </main>
    </div>
  )
}
