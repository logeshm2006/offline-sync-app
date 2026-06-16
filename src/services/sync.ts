import { getAllGrievances, updateGrievance } from './db'
import { API_URL } from './config'

let isSyncing = false

export async function syncPending() {
  // Prevent overlapping sync cycles
  if (isSyncing || !navigator.onLine) return

  isSyncing = true
  window.dispatchEvent(new CustomEvent('sync:start'))

  try {
    const all = await getAllGrievances()
    // Find items that are not synced and not currently being synced
    const pending = all.filter((g) => (g.status !== 'synced') && !g.syncing)

    if (pending.length === 0) {
      isSyncing = false
      return
    }

    console.log(`[Sync] Found ${pending.length} pending items. Starting sync...`)

    // Processing in small batches of 3 to improve throughput without overloading
    const BATCH_SIZE = 3
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE)

      // Sync batch in parallel
      await Promise.all(batch.map(async (g) => {
        const id = g.id as number
        try {
          await updateGrievance(id, { syncing: true, status: 'pending' })

          const { syncing, synced, ...sendable } = g as any
          const body = JSON.stringify(sendable)

          window.dispatchEvent(new CustomEvent('sync:request', { detail: { id, body } }))

          const maxAttempts = 3
          let attempt = 0
          let success = false

          while (attempt < maxAttempts && !success) {
            attempt += 1
            try {
              const resp = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
              })

              if (resp.ok) {
                const data = await resp.json()
                await updateGrievance(id, { synced: true, syncing: false, status: 'synced' })
                window.dispatchEvent(new CustomEvent('sync:success', { detail: { id, data } }))
                success = true
              } else {
                const status = resp.status
                if (status === 400 || (status >= 401 && status < 500)) {
                  // Client errors - mark as failed and don't retry
                  await updateGrievance(id, { synced: false, syncing: false, failed: true, status: 'failed', error: `Request failed (${status})` })
                  window.dispatchEvent(new CustomEvent('sync:failure', { detail: { id, status } }))
                  break
                }

                // Server errors - retry with backoff
                if (attempt < maxAttempts) {
                  await new Promise((r) => setTimeout(r, 1000 * attempt)) // 1s, 2s retry
                  continue
                }

                await updateGrievance(id, { synced: false, syncing: false, failed: true, status: 'failed', error: `Server error ${status}` })
                window.dispatchEvent(new CustomEvent('sync:failure', { detail: { id, status } }))
              }
            } catch (err) {
              // Network error
              if (attempt < maxAttempts) {
                await new Promise((r) => setTimeout(r, 1000 * attempt))
                continue
              }
              await updateGrievance(id, { synced: false, syncing: false, failed: true, status: 'failed', error: 'Network Error' })
              window.dispatchEvent(new CustomEvent('sync:failure', { detail: { id, error: 'Network Error' } }))
            }
          }
        } catch (err) {
          console.error(`[Sync] Critical error for ID ${id}`, err)
          await updateGrievance(id, { syncing: false })
        }
      }))
    }

  } catch (err) {
    console.error('[Sync] Global sync failure', err)
  } finally {
    isSyncing = false
    window.dispatchEvent(new CustomEvent('sync:end'))
  }
}

let intervalId: any = null

export function startAutoSync(intervalMs = 15000) { // Default polling interval: 15s (safe, conservative)
  // Initial run
  syncPending().catch(() => {})

  // Re-sync on network restoration
  window.addEventListener('online', () => syncPending())

  if (intervalId) clearInterval(intervalId)

  // Polling sync every 3 seconds
  intervalId = setInterval(() => {
    syncPending().catch(() => {})
  }, intervalMs)
}

export function stopAutoSync() {
  if (intervalId) clearInterval(intervalId)
  intervalId = null
}
