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

    function onChanged() { if (!mounted) return; load() }

    window.addEventListener('grievance:added', onChanged)
    window.addEventListener('grievance:updated', onChanged)
    window.addEventListener('sync:end', onChanged)

    return () => {
      mounted = false
      window.removeEventListener('grievance:added', onChanged)
      window.removeEventListener('grievance:updated', onChanged)
      window.removeEventListener('sync:end', onChanged)
    }
  }, [])

  async function handleDelete(id?: number) {
    if (!id) return
    if (!confirm('Delete this unsynced grievance? This cannot be undone.')) return
    await deleteGrievance(id)
    setItems((s) => s.filter((x) => x.id !== id))
    window.dispatchEvent(new CustomEvent('grievance:updated'))
  }

  async function handleClear() {
    if (!confirm('Clear all unsynced grievances? This cannot be undone.')) return
    await clearUnsyncedGrievances()
    setItems([])
    window.dispatchEvent(new CustomEvent('grievance:updated'))
  }

  if (items.length === 0) {
    return (
      <div className="glass p-4">
        <div className="text-sm font-medium mb-2">Offline Queue</div>
        <div className="text-slate-400">No unsynced grievances.</div>
      </div>
    )
  }

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Offline Queue</div>
        <button className="btn-sm btn-ghost" onClick={handleClear}>Clear Queue</button>
      </div>

      <div className="space-y-2 max-h-56 overflow-auto">
        {items.map((g) => (
          <div key={g.id} className="p-2 bg-white/3 rounded flex items-start justify-between">
            <div>
              <div className="font-semibold text-sm">{g.village} — {g.category}</div>
              <div className="text-xs text-slate-400">{g.description}</div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button className="btn-sm btn-danger" onClick={() => handleDelete(g.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
