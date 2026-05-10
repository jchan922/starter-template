import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from './useAuth'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('useAuth', () => {
  it('returns null user and isAuthenticated false initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true after login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => result.current.login({ name: 'Alice' }))
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual({ name: 'Alice' })
  })

  it('clears user and isAuthenticated after logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => result.current.login({ name: 'Alice' }))
    await act(async () => result.current.logout())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('exposes login and logout functions', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })
})
