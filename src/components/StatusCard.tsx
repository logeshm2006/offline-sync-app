import React, { useEffect, useState } from 'react'
import { getMeta, getAllGrievances } from '../services/db'
import { syncPending } from '../services/sync'

export default function StatusCard() {
  const [online, setOnline] = useState<boolean>(navigator.onLine)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [unsynced, setUnsynced] = useState<number>(0)
  const [syncing, setSyncing] = useState<boolean>(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  async function refreshUnsynced() {
    try {
      const all = await getAllGrievances()
      const count = all.filter((x) => !x.synced).length
      setUnsynced(count)
    } catch (e) {
      setUnsynced(0)
    }
  }

  useEffect(() => {
    let mounted = true
    getMeta('lastSync').then((v) => {
      if (!mounted) return
      setLastSync(v)
    })

    refreshUnsynced()

    function onOnline() {
      setOnline(true)
      const now = new Date().toISOString()
      setLastSync(now)
      // persist meta; caller may attempt sync
      // setMeta is optional here; omit to keep code small
      refreshUnsynced()
    }
    function onSyncStart() { setSyncing(true) }
    function onSyncEnd() { setSyncing(false); refreshUnsynced() }
    function onOffline() {
      setOnline(false)
    }

    function onAdded() {
      refreshUnsynced()
    }

    function onBeforeInstall(e: any) {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    function onUpdated() {
      refreshUnsynced()
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('grievance:added', onAdded)
    window.addEventListener('beforeinstallprompt', onBeforeInstall as any)
    window.addEventListener('grievance:updated', onUpdated)
    window.addEventListener('sync:start', onSyncStart)
    window.addEventListener('sync:end', onSyncEnd)

    return () => {
      mounted = false
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('grievance:added', onAdded)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as any)
      window.removeEventListener('grievance:updated', onUpdated)
      window.removeEventListener('sync:start', onSyncStart)
      window.removeEventListener('sync:end', onSyncEnd)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">System Status</h3>
        <div className="unsynced-pill">Queue: <span className="font-semibold ml-2">{unsynced}</span></div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-white/3 to-white/2 rounded-lg card-hover">
        <div>
          <div className="text-sm text-slate-300">Network</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${online ? 'badge--online' : 'badge--offline'}`}>{online ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-300">Sync</div>
          <div className="flex items-center gap-2 justify-end">
            <span className={`badge ${unsynced > 0 ? 'badge--pending' : 'badge--online'}`}>{unsynced > 0 ? 'Pending' : 'Synced'}</span>
            <div className="text-sm text-slate-300">{lastSync ? new Date(lastSync).toLocaleString() : 'Not synced'}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Auto-syncs when connection is restored. Offline-first using IndexedDB.</div>
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => syncPending().catch(() => {})}
              disabled={syncing}
              className={`btn-gradient ${syncing ? 'opacity-60 cursor-not-allowed' : ''}`}
              aria-disabled={syncing}
            >
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>

            <button
              onClick={() => { window.location.hash = '#/cloud' }}
              className="btn-gradient"
            >
              Cloud Database
            </button>

            {deferredPrompt && (
              <button
                className="btn-gradient"
                onClick={async () => {
                  try {
                    deferredPrompt.prompt()
                    const choice = await deferredPrompt.userChoice
                    console.log('PWA install choice', choice)
                    setDeferredPrompt(null)
                  } catch (err) {
                    console.error('Install prompt failed', err)
                  }
                }}
              >
                Install App
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
