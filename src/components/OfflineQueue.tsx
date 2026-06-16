import React, { useEffect, useState } from 'react'
import type { StoredGrievance } from '../types'
import { getAllGrievances, deleteGrievance, clearUnsyncedGrievances } from '../services/db'

export default function OfflineQueue() {
  const [items, setItems] = useState<StoredGrievance[]>([])

  async function load() {
    const all = await getAllGrievances()
    setItems(all.filter((g) => !g.synced))
  }

  useEffect(() => {
    let mounted = true
    load()

    const handleRefresh = () => { if (mounted) load() }

    window.addEventListener('grievance:added', handleRefresh)
    window.addEventListener('grievance:updated', handleRefresh)
    window.addEventListener('sync:end', handleRefresh)

    return () => {
      mounted = false
      window.removeEventListener('grievance:added', handleRefresh)
      window.removeEventListener('grievance:updated', handleRefresh)
      window.removeEventListener('sync:end', handleRefresh)
    }
  }, [])

  async function handleDelete(id?: number) {
    if (!id || !confirm('Discard this local record?')) return
    await deleteGrievance(id)
    load()
    window.dispatchEvent(new CustomEvent('grievance:updated'))
  }

  async function handleClear() {
    if (!confirm('Clear all unsynced data? This cannot be undone.')) return
    await clearUnsyncedGrievances()
    setItems([])
    window.dispatchEvent(new CustomEvent('grievance:updated'))
  }

  return (
    <div className="glass overflow-hidden shadow-xl border-t border-white/10">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/2">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Local Queue</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Pending Sync: {items.length}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[10px] font-bold text-rose-500/70 hover:text-rose-500 uppercase tracking-widest transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-white/5 max-h-64 overflow-auto scrollbar-hide">
        {items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Queue Empty</p>
          </div>
        ) : (
          items.map((g) => (
            <div key={g.id} className="p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {g.category}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{g.village}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{g.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
