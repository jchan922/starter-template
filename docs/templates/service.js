import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const client = createClient({
  baseUrl: import.meta.env.VITE_SERVICE_URL,
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.message ?? err.message,
    code: err.raw?.code ?? 'unknown',
  }),
})

export const getThings = () => client.get('/things')
export const getThingById = (id) => client.get(`/things/${id}`)
export const createThing = (data) => client.post('/things', data)
export const updateThing = (id, data) => client.put(`/things/${id}`, data)
export const deleteThing = (id) => client.delete(`/things/${id}`)
