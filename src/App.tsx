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

type Tab = 'home' | 'plans' | 'pickup' | 'track' | 'account'

function Shell() {
  const [tab, setTab] = useState<Tab>('home')
  const [order, setOrder] = useState<string | null>(null)
  const [staff, setStaff] = useState(false)
  const { t, dir } = useI18n()
  const { user, createOrder, needsPlan, clearNeedsPlan, theme } = useStore()

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
    <div className={`app-shell ${theme === 'dark' ? '' : 'light'}`} data-theme={theme}>
      <div className="phone" dir={dir}>
        <StatusBar />

        {staff ? (
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
        ) : (
          <>
            <div className="anim-in" key={tab}>
              {tab === 'home' && (
                <Home
                  onSchedule={() => setTab('pickup')}
                  onSeePlans={() => setTab('plans')}
                  onTrack={() => setTab('track')}
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
              {tab === 'account' && <Account onSeePlans={() => setTab('plans')} onTrack={() => setTab('track')} />}
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
