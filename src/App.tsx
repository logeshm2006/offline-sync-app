import React, { useEffect, useState } from 'react'
import SurveyForm from './components/SurveyForm'
import StatusCard from './components/StatusCard'
import LiveLogs from './components/LiveLogs'
import OfflineQueue from './components/OfflineQueue'
import CloudDashboard from './components/CloudDashboard'
import HomePage from './components/HomePage'
import type { StoredGrievance } from './types'
import { startAutoSync } from './services/sync'
import { useOnlineStatus } from './services/connectivity'

export default function App() {
  const [logs, setLogs] = useState<string[]>([])
  const [route, setRoute] = useState<string>(window.location.hash || '#/')
  const isOnline = useOnlineStatus()

  useEffect(() => {
    function onHash() { setRoute(window.location.hash || '#/') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const addGrievance = (g: StoredGrievance) => {
    const msg = `Saved grievance #${g.id} (${g.village} - ${g.category})`
    setLogs((l) => [...l.slice(-200), msg])
    window.dispatchEvent(new CustomEvent('grievance:added'))
  }

  useEffect(() => {
    function onSyncSuccess(e: any) { setLogs((l) => [...l.slice(-200), `Sync success: id=${e?.detail?.id}`]) }
    function onSyncFail(e: any) { setLogs((l) => [...l.slice(-200), `Sync failed: id=${e?.detail?.id}`]) }
    function onSyncRequest(e: any) { setLogs((l) => [...l.slice(-200), `Syncing id=${e?.detail?.id}...`]) }

    window.addEventListener('sync:success', onSyncSuccess)
    window.addEventListener('sync:failure', onSyncFail)
    window.addEventListener('sync:request', onSyncRequest)

    startAutoSync()

    return () => {
      window.removeEventListener('sync:success', onSyncSuccess)
      window.removeEventListener('sync:failure', onSyncFail)
      window.removeEventListener('sync:request', onSyncRequest)
    }
  }, [])

  // Routing Logic
  if (route === '#/' || !route) {
    return <HomePage onGetStarted={() => window.location.hash = '#/grievance'} />
  }

  if (route === '#/cloud') {
    return (
      <div className="animate-fade-in">
        <nav className="p-4 flex items-center justify-between glass mx-4 mt-4">
          <button onClick={() => window.history.back()} className="text-emerald-400 font-bold">← Back</button>
          <span className="font-bold">Cloud Dashboard</span>
        </nav>
        <CloudDashboard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 font-sans pb-20">
      {/* Online Status Bar */}
      <div className={`fixed top-0 left-0 right-0 h-1 z-50 transition-colors duration-500 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />

      <div className="max-w-5xl mx-auto px-4 pt-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest">Edge Sync</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                <span className={`text-xs font-bold ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isOnline ? 'ONLINE ✅' : 'OFFLINE ⚠️'}
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white leading-tight">Grievance Redressal System</h1>
            <p className="text-slate-400 mt-2 max-w-xl text-lg">Reliable data collection in any environment. Stored locally, synced automatically.</p>
          </div>
          <button
             onClick={() => window.location.hash = '#/'}
             className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all border border-white/5"
          >
            🏠 Home
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <SurveyForm onSubmit={addGrievance} />
            </div>

            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p className="text-emerald-100/60 text-sm">
                <strong>Sync Notice:</strong> All grievances are secured locally. They will appear in the Cloud Dashboard once a stable connection is detected.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 shadow-xl border-t border-white/10">
              <StatusCard />
            </div>

            <OfflineQueue />

            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Live Sync Activity</h3>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                </div>
              </div>
              <LiveLogs logs={logs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
