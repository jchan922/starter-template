import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const _client = createClient({
  baseUrl: import.meta.env.VITE_AUTH_URL ?? '',
  fetcher,
  normalizeError: (err) => ({
    message: err.raw?.error_description ?? err.message,
    code: err.raw?.error ?? 'auth_error',
  }),
})

export const login = (_credentials) => {
  throw new Error('auth.login not implemented')
}

export const logout = () => {
  throw new Error('auth.logout not implemented')
}

export const getUser = () => {
  throw new Error('auth.getUser not implemented')
}
