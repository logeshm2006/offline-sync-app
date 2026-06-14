import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker properly
registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('App ready to work offline.')
  }
})

// Fallback explicit registration to ensure a runtime registration
// at the root path '/sw.js' for PWABuilder/Puppeteer detection.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service worker registered (fallback):', reg.scope)
      })
      .catch(err => {
        console.error('Fallback service worker registration failed:', err)
      })
  })
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)