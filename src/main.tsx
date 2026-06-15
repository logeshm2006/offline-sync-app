import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
// Manual service worker registration (removed virtual:pwa-register)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.error('SW registration failed', err))
  })
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)