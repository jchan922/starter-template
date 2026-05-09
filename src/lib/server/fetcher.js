const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_RETRIES = 2
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504]

export class ServiceError extends Error {
  constructor(error, status) {
    super(error.message ?? 'Unknown error')
    this.name = 'ServiceError'
    this.status = status
    this.raw = error
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new ServiceError({ message: 'Request timed out' }, 408)), ms)
  )
  return Promise.race([promise, timeout])
}

export const fetcher = async (url, options = {}, retries = DEFAULT_RETRIES) => {
  try {
    const res = await withTimeout(fetch(url, options), DEFAULT_TIMEOUT_MS)

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      const serviceError = new ServiceError(error, res.status)

      if (retries > 0 && RETRYABLE_STATUSES.includes(res.status)) {
        console.warn(`[server:fetcher] Retrying ${url} — ${res.status} (${retries} left)`)
        await sleep(500)
        return fetcher(url, options, retries - 1)
      }

      // Server side: log full error detail, never surfaces to client
      console.error(`[server:fetcher] Failed ${url} — ${res.status}`, JSON.stringify(error))
      throw serviceError
    }

    return res.json()
  } catch (err) {
    if (err instanceof ServiceError) throw err
    throw new ServiceError({ message: err.message ?? 'Network error' }, 0)
  }
}
