import React, { useEffect, useState } from 'react'
import SurveyForm from './components/SurveyForm'
import StatusCard from './components/StatusCard'
import LiveLogs from './components/LiveLogs'
import OfflineQueue from './components/OfflineQueue'
import CloudDashboard from './components/CloudDashboard'
import type { Grievance, StoredGrievance } from './types'
import { startAutoSync } from './services/sync'

export default function App() {
  const [logs, setLogs] = useState<string[]>([])
  const [route, setRoute] = useState<string>(window.location.hash || '')

  useEffect(() => {
    function onHash() { setRoute(window.location.hash || '') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const addGrievance = (g: StoredGrievance) => {
    const msg = `Saved grievance #${g.id} (${g.village} - ${g.category})`
    setLogs((l) => [...l.slice(-200), msg])
    // notify other components to refresh counts
    window.dispatchEvent(new CustomEvent('grievance:added'))
  }

  useEffect(() => {
    function onOnline() { setLogs((l) => [...l.slice(-200), `Network: Online (${new Date().toLocaleTimeString()})`]) }
    function onOffline() { setLogs((l) => [...l.slice(-200), `Network: Offline (${new Date().toLocaleTimeString()})`]) }
    function onSyncSuccess(e: any) { setLogs((l) => [...l.slice(-200), `Sync success: id=${e?.detail?.id}`]) }
    function onSyncFail(e: any) { setLogs((l) => [...l.slice(-200), `Sync failed: id=${e?.detail?.id} info=${JSON.stringify(e?.detail)}`]) }
    function onSyncRequest(e: any) { setLogs((l) => [...l.slice(-200), `Sending id=${e?.detail?.id} payload=${e?.detail?.body}`]) }
    function onSyncResponse(e: any) { setLogs((l) => [...l.slice(-200), `Response id=${e?.detail?.id} status=${e?.detail?.status} (${new Date().toLocaleTimeString()})`]) }
    function onSyncError(e: any) { setLogs((l) => [...l.slice(-200), `Error id=${e?.detail?.id} msg=${e?.detail?.message} attempt=${e?.detail?.attempt ?? ''}`]) }
    function onSyncRetry(e: any) { setLogs((l) => [...l.slice(-200), `Retrying id=${e?.detail?.id} attempt=${e?.detail?.attempt}`]) }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('sync:success', onSyncSuccess)
    window.addEventListener('sync:failure', onSyncFail)
    window.addEventListener('sync:request', onSyncRequest)
    window.addEventListener('sync:response', onSyncResponse)
    window.addEventListener('sync:error', onSyncError)
    window.addEventListener('sync:retry', onSyncRetry)

    // start background sync
    startAutoSync()

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('sync:success', onSyncSuccess)
      window.removeEventListener('sync:failure', onSyncFail)
      window.removeEventListener('sync:request', onSyncRequest)
      window.removeEventListener('sync:response', onSyncResponse)
      window.removeEventListener('sync:error', onSyncError)
      window.removeEventListener('sync:retry', onSyncRetry)
    }
  }, [])

  if (route === '#/cloud') {
    return <CloudDashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Grievance Redressal Survey System</h1>
          <p className="text-slate-400 mt-2">Collect and manage community grievances efficiently.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <div className="glass p-6">
              <SurveyForm onSubmit={addGrievance} />
            </div>
            <div className="mt-6 glass p-4">
              <div className="text-slate-400">Submitted grievances are now served from the cloud.</div>
            </div>
          </div>

            <div className="">
            <div className="glass p-6 mb-4">
              <StatusCard />
            </div>
            <div className="mb-4">
              <OfflineQueue />
            </div>
            <div className="mb-4 mt-4">
              <LiveLogs logs={logs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
