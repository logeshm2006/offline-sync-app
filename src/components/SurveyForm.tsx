import React, { useState } from 'react'
import type { Grievance, Category, Priority, StoredGrievance } from '../types'
import { addGrievance as dbAdd } from '../services/db'

type Props = {
  onSubmit: (g: StoredGrievance) => void
}

const categories: Category[] = ['Water', 'Electricity', 'Road', 'Sanitation']
const priorities: Priority[] = ['Low', 'Medium', 'High']

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
    setDescriptionError(err && err.includes('Description') ? err : null)
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
        // reset after successful save
        setName('')
        setVillage('')
        setDescription('')
        setPriority('Medium')
        setCategory('Water')
        setErrors(null)
      })
      .catch((err) => {
        console.error('Failed to save grievance', err)
        setErrors('Failed to save grievance locally')
      })
  }

  // real-time validation while typing
  function handleDescriptionChange(value: string) {
    setDescription(value)
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      setDescriptionError('Description is required.')
    } else if (trimmed.length < 5) {
      setDescriptionError('Description must be at least 5 characters')
    } else {
      setDescriptionError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-medium">Survey Form</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Name (optional)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g., Ramesh" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Village Name *</span>
          <input value={village} onChange={(e) => setVillage(e.target.value)} className="input" placeholder="Village name" required />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Issue Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="input">
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="input">
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col">
        <span className="text-sm text-slate-300">Description *</span>
        <textarea value={description} onChange={(e) => handleDescriptionChange(e.target.value)} className="input h-28 resize-y" placeholder="Describe the issue in detail" required />
      </label>

      {descriptionError && <div className="text-sm text-rose-400 mt-1">{descriptionError}</div>}
      {errors && !descriptionError && <div className="text-sm text-rose-400">{errors}</div>}

      <div className="flex items-center justify-end">
        <button type="submit" className="btn-gradient" disabled={!!descriptionError || !village.trim()} aria-disabled={!!descriptionError || !village.trim()}>
          Submit Grievance
        </button>
      </div>
    </form>
  )
}
