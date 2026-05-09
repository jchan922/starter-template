import { createClient } from '@/lib/client/createClient'

/**
 * Auth service — stubbed until project needs auth.
 * Wire to Auth.js, Clerk, or any provider here.
 * App code calls these functions, never the provider directly.
 */
const client = createClient({
  baseUrl: import.meta.env.VITE_AUTH_URL ?? '',
  normalizeError: (err) => ({
    message: err.raw?.error_description ?? err.message,
    code: err.raw?.error ?? 'auth_error',
  }),
})

// Stub — implement when project needs auth
export const login = (_credentials) => {
  throw new Error('auth.login not implemented')
}

export const logout = () => {
  throw new Error('auth.logout not implemented')
}

export const getUser = () => {
  throw new Error('auth.getUser not implemented')
}
