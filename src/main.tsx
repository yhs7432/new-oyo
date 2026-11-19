import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installAuthRecovery } from './services/authRecovery'

// Clears stale/expired backend sessions instead of surfacing an unhandled auth error.
installAuthRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
