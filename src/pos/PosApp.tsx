import { useState } from 'react'
import { usePos } from './store'
import { useNotifications } from '../useNotifications'
import type { Notification } from '../data/notifications'
import { removeNotification } from '../data/notifications'
import { Login } from './screens/Login'
import { Intake } from './screens/Intake'
import { Plans } from './screens/Plans'
import { Schedule } from './screens/Schedule'
import { Operations } from './screens/Operations'
import { Quality } from './screens/Quality'

type View = 'intake' | 'schedule' | 'plans' | 'operations' | 'quality'

const META: Record<View, { title: string; sub: string }> = {
  intake: { title: 'Intake', sub: "Take in a member's laundry" },
  schedule: { title: 'Schedule', sub: 'Set pickup & delivery availability' },
  plans: { title: 'Plans & pricing', sub: 'Subscriptions and extra-capacity blocks' },
  operations: { title: 'Operations', sub: 'Detailed overview of your facility' },
  quality: { title: 'Quality control', sub: 'Inspections, defects & pass rate' },
}

export function PosApp() {
  const { currentStaff, logout } = usePos()
  const [view, setView] = useState<View>('intake')
  const [notifOpen, setNotifOpen] = useState(false)
  const { list: notifs, unread, markSeen } = useNotifications('pos')

  function toggleNotif() {
    const willOpen = !notifOpen
    setNotifOpen(willOpen)
    if (willOpen) markSeen()
  }

  if (!currentStaff) return <Login />

  const meta = META[view]

  return (
    <div className="pos">
      <aside className="rail">
        <div className="rail-brand" aria-hidden="true">
          <Spark />
        </div>
        <nav className="rail-nav">
          <RailBtn label="Intake" active={view === 'intake'} onClick={() => setView('intake')}>
            <IcIntake />
          </RailBtn>
          <RailBtn label="Schedule" active={view === 'schedule'} onClick={() => setView('schedule')}>
            <IcCalendar />
          </RailBtn>
          <RailBtn label="Plans" active={view === 'plans'} onClick={() => setView('plans')}>
            <IcPlans />
          </RailBtn>
          <RailBtn label="Operations" active={view === 'operations'} onClick={() => setView('operations')}>
            <IcChart />
          </RailBtn>
          <RailBtn label="Quality" active={view === 'quality'} onClick={() => setView('quality')}>
            <IcQuality />
          </RailBtn>
        </nav>
        <button className="rail-btn logout" onClick={logout} aria-label="Sign out" title="Sign out">
          <IcLogout />
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="tb-title">
            <h1>{meta.title}</h1>
            <p>{meta.sub}</p>
          </div>
          <div className="tb-right">
            <button className="tb-icon" aria-label="Search">
              <IcSearch />
            </button>
            <div className="tb-notif">
              <button className="tb-icon" aria-label="Notifications" onClick={toggleNotif}>
                <IcBell />
                {unread > 0 && <span className="tb-badge">{unread}</span>}
              </button>
              {notifOpen && <NotifPanel list={notifs} onClose={() => setNotifOpen(false)} />}
            </div>
            <div className="tb-user">
              <div className="avatar">{currentStaff.name[0]}</div>
              <div className="tb-user-meta">
                <div className="name">{currentStaff.name}</div>
                <div className="role">{currentStaff.role}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          {view === 'intake' && <Intake />}
          {view === 'schedule' && <Schedule />}
          {view === 'plans' && <Plans />}
          {view === 'operations' && <Operations />}
          {view === 'quality' && <Quality />}
        </main>
      </div>
    </div>
  )
}

function RailBtn({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button className={`rail-btn${active ? ' on' : ''}`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  )
}

function relTime(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  return `${Math.round(hrs / 24)} d ago`
}

/** Dropdown showing messages the staff portal routed to the POS. */
function NotifPanel({ list, onClose }: { list: Notification[]; onClose: () => void }) {
  return (
    <>
      <div className="notif-scrim" onClick={onClose} />
      <div className="notif-pop" role="dialog" aria-label="Notifications">
        <div className="notif-pop-head">Notifications</div>
        {list.length === 0 ? (
          <div className="notif-pop-empty">No messages yet.</div>
        ) : (
          <div className="notif-pop-list">
            {list.map((n) => (
              <div key={n.id} className="notif-pop-item">
                <div className="notif-pop-text">{n.text}</div>
                <div className="notif-pop-meta">
                  <span>{relTime(n.ts)}</span>
                  <button className="notif-pop-del" onClick={() => removeNotification(n.id)} aria-label="Dismiss">
                    <IcX />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ---------- Inline line-icons (stroke, currentColor) ---------- */
const S = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Spark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.4 3.9 1.2 5.6 3 7.4 1.8 1.8 3.5 2.6 7 3-3.5.4-5.2 1.2-7 3-1.8 1.8-2.6 3.5-3 7.4-.4-3.9-1.2-5.6-3-7.4-1.8-1.8-3.5-2.6-7-3 3.5-.4 5.2-1.2 7-3 1.8-1.8 2.6-3.5 3-7.4Z" />
    </svg>
  )
}
function IcIntake() {
  return (
    <svg {...S} aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 3v3h6V3M8 11h8M8 15h5" />
    </svg>
  )
}
function IcCalendar() {
  return (
    <svg {...S} aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9h17M8 3v3M16 3v3M7.5 13h3M13.5 13h3M7.5 16.5h3" />
    </svg>
  )
}
function IcPlans() {
  return (
    <svg {...S} aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12.5" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </svg>
  )
}
function IcChart() {
  return (
    <svg {...S} aria-hidden="true">
      <path d="M4 20V4M4 20h16M8 20v-6M12 20v-9M16 20v-4" />
    </svg>
  )
}
function IcQuality() {
  return (
    <svg {...S} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function IcLogout() {
  return (
    <svg {...S} aria-hidden="true">
      <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 12H3M6 8l-3 4 3 4" />
    </svg>
  )
}
function IcSearch() {
  return (
    <svg {...S} width="19" height="19" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  )
}
function IcBell() {
  return (
    <svg {...S} width="19" height="19" aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}
function IcX() {
  return (
    <svg {...S} width="15" height="15" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
