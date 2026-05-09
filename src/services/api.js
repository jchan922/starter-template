import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const client = createClient({
  baseUrl: import.meta.env.VITE_API_URL,
  fetcher,
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
