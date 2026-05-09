import { useState } from 'react'
// import { login, logout, getUser } from '@/services/client/auth'

/**
 * useAuth — stubbed until project needs auth.
 * Uncomment service imports and implement when ready.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (_credentials) => {
    throw new Error('useAuth.login not implemented — wire to services/client/auth.js')
  }

  const handleLogout = async () => {
    throw new Error('useAuth.logout not implemented — wire to services/client/auth.js')
  }

  return {
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!user,
  }
}
