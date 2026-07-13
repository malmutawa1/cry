import { useEffect, useState } from 'react'
import { StatusBar } from './components/Common'
import { Bag, Cards, Home as HomeIcon, Route, User } from './components/Icons'
import { StoreProvider, useStore } from './store'
import { I18nProvider, useI18n } from './i18n'
import Auth from './screens/Auth'
import Home from './screens/Home'
import Plans from './screens/Plans'
import Pickup from './screens/Pickup'
import Track from './screens/Track'
import Account from './screens/Account'
import Success from './screens/Success'
import Staff from './screens/Staff'
import Loyalty from './screens/Loyalty'
import Welcome from './screens/Welcome'

type Tab = 'home' | 'plans' | 'pickup' | 'track' | 'account'

function useSystemDark() {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => setDark(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return dark
}

function Shell() {
  const [tab, setTab] = useState<Tab>('home')
  const [welcomed, setWelcomed] = useState(false)
  const [order, setOrder] = useState<string | null>(null)
  const [staff, setStaff] = useState(false)
  const [rewards, setRewards] = useState(false)
  const { t, dir } = useI18n()
  const { user, createOrder, needsPlan, clearNeedsPlan, accent, mode, toast } = useStore()
  const systemDark = useSystemDark()
  const effMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode

  // After a fresh sign-up, open the subscriptions screen automatically.
  useEffect(() => {
    if (needsPlan) {
      setTab('plans')
      clearNeedsPlan()
    }
  }, [needsPlan, clearNeedsPlan])

  function confirmPickup() {
    setOrder(createOrder())
  }

  const nav = [
    { id: 'home' as const, label: t('nav.home'), icon: <HomeIcon /> },
    { id: 'plans' as const, label: t('nav.plans'), icon: <Cards /> },
    { id: 'pickup' as const, label: t('nav.pickup'), icon: <Bag /> },
    { id: 'track' as const, label: t('nav.track'), icon: <Route /> },
    { id: 'account' as const, label: t('nav.account'), icon: <User /> },
  ]

  return (
    <div className="app-shell" data-mode={effMode} data-accent={accent}>
      <div className="phone" dir={dir}>
        <StatusBar />
        {toast && <div className="toast" key={toast}>{toast}</div>}

        {!welcomed ? (
          <Welcome onStart={() => setWelcomed(true)} />
        ) : staff ? (
          <Staff onExit={() => setStaff(false)} />
        ) : !user ? (
          <Auth onStaff={() => setStaff(true)} />
        ) : order ? (
          <Success
            orderId={order}
            onDone={() => {
              setOrder(null)
              setTab('home')
            }}
            onTrack={() => {
              setOrder(null)
              setTab('track')
            }}
          />
        ) : rewards ? (
          <Loyalty onBack={() => setRewards(false)} />
        ) : (
          <>
            <div className="anim-in" key={tab}>
              {tab === 'home' && (
                <Home
                  onSchedule={() => setTab('pickup')}
                  onSeePlans={() => setTab('plans')}
                  onTrack={() => setTab('track')}
                  onRewards={() => setRewards(true)}
                />
              )}
              {tab === 'plans' && <Plans onSubscribed={() => setTab('home')} />}
              {tab === 'pickup' && (
                <Pickup
                  onClose={() => setTab('home')}
                  onConfirm={confirmPickup}
                  onSeePlans={() => setTab('plans')}
                />
              )}
              {tab === 'track' && <Track onSchedule={() => setTab('pickup')} />}
              {tab === 'account' && (
                <Account onSeePlans={() => setTab('plans')} onTrack={() => setTab('track')} onRewards={() => setRewards(true)} />
              )}
            </div>

            <nav className="nav">
              {nav.map((n) => (
                <button key={n.id} className={tab === n.id ? 'active' : ''} onClick={() => setTab(n.id)}>
                  {n.icon}
                  {n.label}
                </button>
              ))}
            </nav>
          </>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </I18nProvider>
  )
}
