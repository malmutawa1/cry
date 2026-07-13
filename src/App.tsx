import { useState } from 'react'
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

type Tab = 'home' | 'plans' | 'pickup' | 'track' | 'account'

function Shell() {
  const [tab, setTab] = useState<Tab>('home')
  const [order, setOrder] = useState<string | null>(null)
  const { t, dir } = useI18n()
  const { user, createOrder } = useStore()

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
    <div className="app-shell">
      <div className="phone" dir={dir}>
        <StatusBar />

        {!user ? (
          <Auth />
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
            {tab === 'home' && (
              <Home
                onSchedule={() => setTab('pickup')}
                onSeePlans={() => setTab('plans')}
                onTrack={() => setTab('track')}
                onManage={() => setTab('account')}
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
