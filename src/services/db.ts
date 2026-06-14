// Lightweight IndexedDB wrapper for grievances
import type { Category, Priority, StoredGrievance } from '../types'

const DB_NAME = 'grievances-db'
const STORE_NAME = 'grievances'
const META_STORE = 'meta'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function setMeta(key: string, value: any): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    const store = tx.objectStore(META_STORE)
    const req = store.put({ key, value })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getMeta(key: string): Promise<any | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly')
    const store = tx.objectStore(META_STORE)
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result ? req.result.value : null)
    req.onerror = () => reject(req.error)
  })
}

export type NewGrievance = {
  name?: string
  village: string
  category: Category
  description: string
  priority: Priority
  createdAt?: string
}

export async function addGrievance(g: NewGrievance): Promise<StoredGrievance> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const record = {
      ...g,
      createdAt: g.createdAt ?? new Date().toISOString(),
      timestamp: Date.now(),
      synced: false,
      syncing: false,
      status: 'pending',
      failed: false,
      error: undefined,
    }
    const req = store.add(record as any)
    req.onsuccess = () => {
      const id = req.result as number
      // return full stored record
      resolve({ ...(record as any), id } as StoredGrievance)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getAllGrievances(): Promise<StoredGrievance[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result as StoredGrievance[])
    req.onerror = () => reject(req.error)
  })
}

export async function clearGrievances(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function deleteGrievance(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function clearUnsyncedGrievances(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.openCursor()
    req.onsuccess = (e: any) => {
      const cursor = e.target.result
      if (!cursor) return
      const record = cursor.value
      if (!record.synced) {
        cursor.delete()
      }
      cursor.continue()
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function updateGrievance(id: number, patch: Partial<StoredGrievance>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      const cur = getReq.result
      if (!cur) return resolve()
      const updated = { ...cur, ...patch }
      const putReq = store.put(updated)
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    }
    getReq.onerror = () => reject(getReq.error)
  })
}
