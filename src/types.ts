export type Priority = 'Low' | 'Medium' | 'High'

export type Category = 'Water' | 'Electricity' | 'Road' | 'Sanitation'

export interface Grievance {
  id: string | number
  name?: string
  village: string
  category: Category
  description: string
  priority: Priority
  createdAt: string
}

export interface StoredGrievance extends Grievance {
  id: number
  timestamp: number
  synced: boolean
  syncing?: boolean
  status?: 'pending' | 'synced' | 'failed'
  failed?: boolean
  error?: string
}
