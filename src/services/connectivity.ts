import { useEffect, useState } from 'react'
import { API_URL } from './config'

/**
 * Robust Online Detection for Capacitor/Android WebView
 * Uses navigator.onLine, window events, and active HTTP polling
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    console.log('[Connectivity] Initializing robust network detection...')

    const updateStatus = (status: boolean) => {
      if (status !== isOnline) {
        console.log(`[Connectivity] Network changed: ${status ? 'ONLINE' : 'OFFLINE'}`)
        setIsOnline(status)
      }
    }

    const handleOnline = () => updateStatus(true)
    const handleOffline = () => updateStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // FALLBACK: Active Polling every 3 seconds
    const interval = setInterval(async () => {
      // 1. Check navigator.onLine first
      const navStatus = navigator.onLine

      // 2. Perform lightweight fetch to verify real connectivity
      try {
        // We use a HEAD request or a small GET to the backend to check actual path to internet
        // Even if it returns 404 or 405, it means we ARE online.
        // Fetching the API base URL is a safe bet.
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2500)

        const healthUrl = API_URL.replace('/grievances', '') // Try base API

        await fetch(healthUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        updateStatus(true)
      } catch (err) {
        // If fetch fails, we check if navigator still thinks we are online
        // Usually TypeError means offline in this context
        if (navStatus === false) {
          updateStatus(false)
        } else {
          // If navigator says online but fetch failed, we might be in a captive portal or really offline
          console.warn('[Connectivity] Fetch check failed, but navigator.onLine is true. Marking as offline.')
          updateStatus(false)
        }
      }
    }, 3000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [isOnline])

  return isOnline
}
