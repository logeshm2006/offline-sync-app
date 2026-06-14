import React from 'react'
import type { StoredGrievance } from '../types'

type Props = {
  grievances: StoredGrievance[]
}

export default function GrievanceList({ grievances }: Props) {
  if (grievances.length === 0) {
    return <div className="text-slate-400">No grievances submitted yet.</div>
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Submitted Grievances</h3>
      <div className="divide-y divide-white/5">
        {grievances.map((g) => (
          <div key={g.id} className="py-3 flex flex-col sm:flex-row sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-500 rounded-full w-9 h-9 flex items-center justify-center text-white font-semibold">{g.priority[0]}</div>
                <div>
                  <div className="font-semibold">{g.village} — {g.category}</div>
                  <div className="text-sm text-slate-400">{g.name ?? 'Anonymous'} • {new Date(g.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="sm:max-w-lg text-slate-200 mt-2 sm:mt-0">{g.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
