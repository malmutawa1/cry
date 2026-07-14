import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PosApp } from './PosApp'
import { PosProvider } from './store'
import './pos.css'

createRoot(document.getElementById('pos-root')!).render(
  <StrictMode>
    <PosProvider>
      <PosApp />
    </PosProvider>
  </StrictMode>,
)
