import { useState } from 'react'
import { StatusBar } from './components/Common'
import { Basket as BasketIcon, Home, Cards, User } from './components/Icons'
import { StoreProvider, useStore } from './store'
import Catalog from './screens/Catalog'
import Plans from './screens/Plans'
import Basket from './screens/Basket'
import Account from './screens/Account'
import Success from './screens/Success'

type Tab = 'home' | 'plans' | 'basket' | 'account'

const USER_EMAIL = 'r8s2pw7hj4@privaterelay.appleid.com'

function Shell() {
  const [tab, setTab] = useState<Tab>('home')
  const [order, setOrder] = useState<{ id: string; total: number } | null>(null)
  const { itemCount, subtotal, clearBasket } = useStore()

  function checkout() {
    const id = 'NDF-' + Math.floor(1000 + Math.random() * 9000)
    setOrder({ id, total: subtotal })
    clearBasket()
  }

  const nav = [
    { id: 'home' as const, label: 'Home', icon: <Home /> },
    { id: 'plans' as const, label: 'Plans', icon: <Cards /> },
    { id: 'basket' as const, label: 'Basket', icon: <BasketIcon /> },
    { id: 'account' as const, label: 'Account', icon: <User /> },
  ]

  return (
    <div className="app-shell">
      <div className="phone">
        <StatusBar />

        {order ? (
          <Success
            orderId={order.id}
            total={order.total}
            onDone={() => {
              setOrder(null)
              setTab('home')
            }}
          />
        ) : (
          <>
            {tab === 'home' && <Catalog />}
            {tab === 'plans' && (
              <Plans
                onSubscribed={() => {
                  setTab('account')
                }}
              />
            )}
            {tab === 'basket' && (
              <Basket onEmpty={() => setTab('home')} onCheckout={checkout} />
            )}
            {tab === 'account' && (
              <Account
                email={USER_EMAIL}
                onSeePlans={() => setTab('plans')}
              />
            )}

            <nav className="nav">
              {nav.map((n) => (
                <button
                  key={n.id}
                  className={tab === n.id ? 'active' : ''}
                  onClick={() => setTab(n.id)}
                >
                  {n.id === 'basket' && itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
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
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
