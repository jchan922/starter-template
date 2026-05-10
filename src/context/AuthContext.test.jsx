import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider, useAuthContext } from './AuthContext'

const TestConsumer = () => {
  const { user, login, logout } = useAuthContext()
  return (
    <div>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <button onClick={() => login({ name: 'Alice' })}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides null user by default', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('sets user after login', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await act(async () => screen.getByText('login').click())
    expect(screen.getByTestId('user').textContent).toBe('Alice')
  })

  it('clears user after logout', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await act(async () => screen.getByText('login').click())
    await act(async () => screen.getByText('logout').click())
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('throws when useAuthContext is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useAuthContext must be used inside AuthProvider'
    )
    spy.mockRestore()
  })
})
