import { useState } from 'react'
import { StatusBar } from './components/Common'
import { Bag, Cards, Home as HomeIcon, User } from './components/Icons'
import { StoreProvider } from './store'
import { I18nProvider, useI18n } from './i18n'
import Home from './screens/Home'
import Plans from './screens/Plans'
import Pickup from './screens/Pickup'
import Account from './screens/Account'
import Success from './screens/Success'

type Tab = 'home' | 'plans' | 'pickup' | 'account'

const USER_EMAIL = 'r8s2pw7hj4@privaterelay.appleid.com'

function Shell() {
  const [tab, setTab] = useState<Tab>('home')
  const [order, setOrder] = useState<string | null>(null)
  const { t, dir } = useI18n()

  function confirmPickup() {
    setOrder('PRS-' + Math.floor(1000 + Math.random() * 9000))
  }

  const nav = [
    { id: 'home' as const, label: t('nav.home'), icon: <HomeIcon /> },
    { id: 'plans' as const, label: t('nav.plans'), icon: <Cards /> },
    { id: 'pickup' as const, label: t('nav.pickup'), icon: <Bag /> },
    { id: 'account' as const, label: t('nav.account'), icon: <User /> },
  ]

  return (
    <div className="app-shell">
      <div className="phone" dir={dir}>
        <StatusBar />

        {order ? (
          <Success
            orderId={order}
            onDone={() => {
              setOrder(null)
              setTab('home')
            }}
          />
        ) : (
          <>
            {tab === 'home' && <Home onSchedule={() => setTab('pickup')} onSeePlans={() => setTab('plans')} />}
            {tab === 'plans' && <Plans onSubscribed={() => setTab('home')} />}
            {tab === 'pickup' && (
              <Pickup
                onClose={() => setTab('home')}
                onConfirm={confirmPickup}
                onSeePlans={() => setTab('plans')}
              />
            )}
            {tab === 'account' && <Account email={USER_EMAIL} onSeePlans={() => setTab('plans')} />}

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
