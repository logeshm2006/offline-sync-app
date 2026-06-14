import { getAllGrievances, updateGrievance } from './db'
import { API_URL } from './config'

let isSyncing = false

export async function syncPending() {
  if (isSyncing) return
  isSyncing = true
  window.dispatchEvent(new CustomEvent('sync:start'))

  try {
    const all = await getAllGrievances()
    const pending = all.filter((g) => (g.status !== 'synced') && !g.syncing)

    if (pending.length === 0) {
      isSyncing = false
      return
    }

    for (const g of pending) {
      const id = g.id as number
      try {
        await updateGrievance(id, { syncing: true, status: 'pending' })

        const { syncing, synced, ...sendable } = g as any
        const body = JSON.stringify(sendable)

        console.log('Sending:', body)
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

            console.log('Response:', resp)
            window.dispatchEvent(new CustomEvent('sync:response', { detail: { id, status: resp.status } }))

            if (resp.ok) {
              const data = await resp.json()
              await updateGrievance(id, { synced: true, syncing: false, status: 'synced' })
              console.log(`[sync] Success id=${id}`, data)
              window.dispatchEvent(new CustomEvent('sync:success', { detail: { id, data } }))
              success = true
            } else {
              const status = resp.status
              const text = await resp.text()
              console.warn(`[sync] Failed id=${id} status=${status} body=${text}`)
              // Do not retry for validation errors (400)
              if (status === 400) {
                await updateGrievance(id, { synced: false, syncing: false, failed: true, status: 'failed', error: 'Validation failed' })
                window.dispatchEvent(new CustomEvent('sync:failure', { detail: { id, status, body: text } }))
                break
              }

              // Retry only for server errors >= 500
              if (status >= 500) {
                if (attempt < maxAttempts) {
                  console.log(`[sync] Retrying id=${id} attempt=${attempt + 1}`)
                  window.dispatchEvent(new CustomEvent('sync:retry', { detail: { id, attempt: attempt + 1 } }))
                  await new Promise((r) => setTimeout(r, 500 * attempt))
                  continue
                }

                // max attempts reached for server error
                await updateGrievance(id, { synced: false, syncing: false, failed: true, status: 'failed', error: `Server error ${status}` })
                window.dispatchEvent(new CustomEvent('sync:failure', { detail: { id, status, body: text } }))
                break
              }

              // Other client errors (4xx besides 400) - do not retry
              await updateGrievance(id, { synced: false, syncing: false, failed: true, status: 'failed', error: `Request failed ${status}` })
              window.dispatchEvent(new CustomEvent('sync:failure', { detail: { id, status, body: text } }))
              break
            }

          } catch (err: any) {
            // Network or fetch error - retry
            console.error(`[sync] Network/Error id=${id} attempt=${attempt}`, err)
            window.dispatchEvent(new CustomEvent('sync:error', { detail: { id, message: String(err?.message ?? err), attempt } }))

            if (attempt < maxAttempts) {
              console.log(`[sync] Retrying id=${id} attempt=${attempt + 1}`)
              window.dispatchEvent(new CustomEvent('sync:retry', { detail: { id, attempt: attempt + 1 } }))
              await new Promise((r) => setTimeout(r, 500 * attempt))
              continue
            }
            // Max attempts exhausted for network errors
            await updateGrievance(id, { synced: false, syncing: false, failed: true, status: 'failed', error: String(err?.message ?? err) })
            window.dispatchEvent(new CustomEvent('sync:failure', { detail: { id, error: String(err?.message ?? err) } }))
            break
          }
        }

      } catch (err) {
        await updateGrievance(g.id as number, { syncing: false })
        console.error(`[sync] Error id=${g.id}`, err)
        window.dispatchEvent(new CustomEvent('sync:error', { detail: { id: g.id, message: String((err as any)?.message ?? err) } }))
      }
    }

  } catch (err) {
    console.error('[sync] Failed to sync pending', err)
  } finally {
    isSyncing = false
    window.dispatchEvent(new CustomEvent('sync:end'))
  }
}

let intervalId: any = null

export function startAutoSync(intervalMs = 30000) {
  // run once on startup
  syncPending().catch(() => {})

  // run when network becomes online (attach handler directly)
  window.addEventListener('online', syncPending)

  if (intervalId) clearInterval(intervalId)

  // periodic retry every `intervalMs` while online
  intervalId = setInterval(() => {
    if (navigator.onLine) syncPending().catch(() => {})
  }, intervalMs)
}

export function stopAutoSync() {
  if (intervalId) clearInterval(intervalId)
  intervalId = null
  window.removeEventListener('online', syncPending)
}