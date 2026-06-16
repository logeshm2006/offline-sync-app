import React, { useEffect, useState } from 'react'
import { getMeta, getAllGrievances } from '../services/db'
import { syncPending } from '../services/sync'
import { useOnlineStatus } from '../services/connectivity'

export default function StatusCard() {
  const isOnline = useOnlineStatus()
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [unsynced, setUnsynced] = useState<number>(0)
  const [syncing, setSyncing] = useState<boolean>(false)

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
      if (mounted) setLastSync(v)
    })
    refreshUnsynced()

    const handleSyncStart = () => setSyncing(true)
    const handleSyncEnd = () => {
      setSyncing(false)
      refreshUnsynced()
      getMeta('lastSync').then((v) => {
        if (mounted) setLastSync(v)
      })
    }
    const handleRefresh = () => refreshUnsynced()

    window.addEventListener('grievance:added', handleRefresh)
    window.addEventListener('grievance:updated', handleRefresh)
    window.addEventListener('sync:start', handleSyncStart)
    window.addEventListener('sync:end', handleSyncEnd)

    return () => {
      mounted = false
      window.removeEventListener('grievance:added', handleRefresh)
      window.removeEventListener('grievance:updated', handleRefresh)
      window.removeEventListener('sync:start', handleSyncStart)
      window.removeEventListener('sync:end', handleSyncEnd)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white tracking-tight">System Status</h3>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-mono text-emerald-400">
          Q: {unsynced}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Connectivity</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            <span className={`font-bold text-sm ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Storage</div>
          <div className="font-bold text-sm text-white">
            {unsynced > 0 ? `${unsynced} Pending` : 'All Synced'}
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
        <div className="text-[10px] uppercase tracking-wider text-emerald-500/50 font-bold mb-1">Last Successful Sync</div>
        <div className="text-sm font-medium text-emerald-100/80">
          {lastSync ? new Date(lastSync).toLocaleString() : 'Never Synced'}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => syncPending().catch(() => {})}
          disabled={syncing || !isOnline}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            syncing || !isOnline
              ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]'
          }`}
        >
          {syncing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Syncing Data...
            </>
          ) : 'Force Sync Now'}
        </button>

        <button
          onClick={() => { window.location.hash = '#/cloud' }}
          className="w-full py-3 rounded-2xl font-bold text-xs text-slate-400 border border-white/5 hover:bg-white/5 transition-colors"
        >
          View Cloud Dashboard
        </button>
      </div>
    </div>
  )
}
