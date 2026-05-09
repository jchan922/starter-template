import { createClient } from '@/lib/client/createClient'

/**
 * Client for your own backend API.
 * Uses bearer token from session storage.
 * Update getHeaders to match your auth strategy.
 */
const client = createClient({
  baseUrl: import.meta.env.VITE_API_URL,
  getHeaders: async () => ({
    Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}`,
  }),
  normalizeError: (err) => ({
    message: err.message,
    status: err.status,
  }),
})

export const get = client.get
export const post = client.post
export const put = client.put
export const patch = client.patch
export const remove = client.delete
