import React, { useState } from 'react'
import type { Category, Priority, StoredGrievance } from '../types'
import { addGrievance as dbAdd } from '../services/db'

type Props = {
  onSubmit: (g: StoredGrievance) => void
}

const categories: Category[] = ['Water', 'Electricity', 'Road', 'Sanitation']
const priorities: { label: Priority, color: string }[] = [
  { label: 'Low', color: 'bg-emerald-500/20 text-emerald-400' },
  { label: 'Medium', color: 'bg-amber-500/20 text-amber-400' },
  { label: 'High', color: 'bg-rose-500/20 text-rose-400' }
]

export default function SurveyForm({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [village, setVillage] = useState('')
  const [category, setCategory] = useState<Category>('Water')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [errors, setErrors] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)

  function validate() {
    if (!village.trim()) return 'Village Name is required.'
    if (!description.trim()) return 'Description is required.'
    if (description.trim().length < 5) return 'Description must be at least 5 characters'
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    setErrors(err)
    if (err) return

    const newRecord = {
      name: name.trim() || undefined,
      village: village.trim(),
      category,
      description: description.trim(),
      priority,
      createdAt: new Date().toISOString(),
    }

    dbAdd(newRecord)
      .then((stored) => {
        onSubmit(stored)
        setName('')
        setVillage('')
        setDescription('')
        setPriority('Medium')
        setCategory('Water')
        setErrors(null)
        setDescriptionError(null)
      })
      .catch((err) => {
        console.error('Failed to save grievance', err)
        setErrors('Failed to save grievance locally')
      })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-white">Input Details</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Reporter Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
              placeholder="e.g. John Doe (Optional)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Village / Locality *</label>
            <input
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
              placeholder="Enter village name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none appearance-none transition-all"
              >
                {categories.map((c) => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Priority Level</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPriority(p.label)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border ${
                    priority === p.label ? `${p.color} border-current` : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Problem Description *</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim().length > 0 && e.target.value.trim().length < 5) {
                setDescriptionError('Minimum 5 characters required');
              } else {
                setDescriptionError(null);
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all h-32 resize-none placeholder:text-slate-600"
            placeholder="Please explain the issue in detail..."
            required
          />
          {descriptionError && <p className="text-rose-500 text-xs font-bold">{descriptionError}</p>}
        </div>
      </div>

      {errors && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold">{errors}</div>}

      {/* Floating-style Submit Button (Optimized for thumb reach on mobile) */}
      <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center lg:relative lg:bottom-0 lg:px-0 lg:justify-end z-40">
        <button
          type="submit"
          disabled={!!descriptionError || !village.trim()}
          className="w-full md:w-auto min-w-[240px] px-8 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl font-black text-white text-lg shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none uppercase tracking-widest"
        >
          Submit Grievance
        </button>
      </div>
    </form>
  )
}
