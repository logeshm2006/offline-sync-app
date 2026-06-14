import React, { useEffect, useState } from 'react'

type CloudGrievance = {
  _id?: string
  name?: string
  village?: string
  category?: string
  description?: string
  priority?: string
  createdAt?: string
  updatedAt?: string
}

const API_URL = 'http://localhost:5000/api/grievances'

export default function CloudDashboard() {
  const [items, setItems] = useState<CloudGrievance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(API_URL)
      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(`Server responded ${resp.status}: ${text}`)
      }
      const data = await resp.json()
      // expect array
      setItems(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(String(err?.message ?? err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Cloud Database</h1>
            <p className="text-slate-400 mt-2">Manage grievances from the cloud database.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-gradient" onClick={() => { window.location.hash = '' }}>Back</button>
            <button className="btn-gradient" onClick={load}>Refresh</button>
          </div>
        </header>

        <div className="glass p-6">
          {loading && <div className="text-slate-300">Loading...</div>}
          {error && <div className="text-rose-400">Error: {error}</div>}

          {!loading && !error && (
            <div className="overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-white/5">
                    <th className="py-2">Name</th>
                    <th>Village</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Created Time</th>
                    <th>Synced Time</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={7} className="py-4 text-slate-400">No records found.</td></tr>
                  )}
                  {items.map((g) => (
                    <tr key={g._id ?? Math.random()} className="border-b border-white/3 align-top">
                      <td className="py-2 align-top">{g.name ?? 'Anonymous'}</td>
                      <td className="align-top">{g.village ?? '-'}</td>
                      <td className="align-top">{g.category ?? '-'}</td>
                      <td className="align-top max-w-xl break-words">{g.description ?? '-'}</td>
                      <td className="align-top">{g.priority ?? '-'}</td>
                      <td className="align-top">{g.createdAt ? new Date(g.createdAt).toLocaleString() : '-'}</td>
                      <td className="align-top">{g.updatedAt ? new Date(g.updatedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

