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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)