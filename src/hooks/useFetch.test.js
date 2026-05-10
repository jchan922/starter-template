import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@/lib/fetcher', () => ({
  fetcher: vi.fn(),
}))

import { fetcher } from '@/lib/fetcher'
import { useFetch } from './useFetch'

afterEach(() => {
  vi.clearAllMocks()
})

describe('useFetch', () => {
  it('starts with loading true and no data or error', () => {
    fetcher.mockResolvedValue({ items: [] })
    const { result } = renderHook(() => useFetch('https://api.example.com/test'))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('sets data and stops loading on success', async () => {
    fetcher.mockResolvedValue({ items: [1, 2] })
    const { result } = renderHook(() => useFetch('https://api.example.com/test'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ items: [1, 2] })
    expect(result.current.error).toBeNull()
  })

  it('sets error and stops loading on failure', async () => {
    const error = new Error('fetch failed')
    fetcher.mockRejectedValue(error)
    const { result } = renderHook(() => useFetch('https://api.example.com/test'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(error)
    expect(result.current.data).toBeNull()
  })

  it('does not call fetcher when url is empty', () => {
    const { result } = renderHook(() => useFetch(''))
    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.data).toBeNull()
  })

  it('exposes a refetch function that re-calls fetcher', async () => {
    fetcher.mockResolvedValue({ items: [] })
    const { result } = renderHook(() => useFetch('https://api.example.com/test'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(typeof result.current.refetch).toBe('function')
    await result.current.refetch()
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
