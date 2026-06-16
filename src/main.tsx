import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with lifecycle handlers
const updateSW = registerSW({
  immediate: true,
  onRegistered(registration) {
    console.log('[SW] registered:', registration)
  },
  onRegisterError(error) {
    console.error('[SW] registration error:', error)
  },
  onNeedRefresh() {
    console.log('[SW] new content available')
    ;(window as any).__SW_NEED_REFRESH__ = true
    window.dispatchEvent(new Event('sw:needRefresh'))
  },
  onOfflineReady() {
    console.log('[SW] offline ready')
    ;(window as any).__SW_OFFLINE_READY__ = true
    window.dispatchEvent(new Event('sw:offlineReady'))
  }
})

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
