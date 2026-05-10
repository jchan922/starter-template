import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from './createClient'

const makeClient = (overrides = {}) => {
  const mockFetcher = vi.fn().mockResolvedValue({ ok: true })
  return {
    mockFetcher,
    client: createClient({
      baseUrl: 'https://api.example.com',
      fetcher: mockFetcher,
      ...overrides,
    }),
  }
}

describe('createClient', () => {
  it('calls fetcher with the correct full URL for GET', async () => {
    const { mockFetcher, client } = makeClient()
    await client.get('/things')
    expect(mockFetcher).toHaveBeenCalledWith(
      'https://api.example.com/things',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('includes Content-Type application/json header', async () => {
    const { mockFetcher, client } = makeClient()
    await client.get('/things')
    const [, options] = mockFetcher.mock.calls[0]
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('merges custom headers from getHeaders', async () => {
    const { mockFetcher, client } = makeClient({
      getHeaders: async () => ({ Authorization: 'Bearer token123' }),
    })
    await client.get('/things')
    const [, options] = mockFetcher.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer token123')
  })

  it('serializes body as JSON for POST', async () => {
    const { mockFetcher, client } = makeClient()
    await client.post('/things', { name: 'Widget' })
    const [, options] = mockFetcher.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ name: 'Widget' }))
  })

  it('sends no body for GET', async () => {
    const { mockFetcher, client } = makeClient()
    await client.get('/things')
    const [, options] = mockFetcher.mock.calls[0]
    expect(options.body).toBeUndefined()
  })

  it('passes errors through normalizeError', async () => {
    const rawError = new Error('raw')
    const mockFetcher = vi.fn().mockRejectedValue(rawError)
    const normalizeError = vi.fn().mockReturnValue({ message: 'normalized' })
    const client = createClient({
      baseUrl: 'https://api.example.com',
      fetcher: mockFetcher,
      normalizeError,
    })
    await expect(client.get('/things')).rejects.toEqual({ message: 'normalized' })
    expect(normalizeError).toHaveBeenCalledWith(rawError)
  })

  it('re-throws raw error when no normalizeError is provided', async () => {
    const rawError = new Error('raw')
    const mockFetcher = vi.fn().mockRejectedValue(rawError)
    const client = createClient({ baseUrl: 'https://api.example.com', fetcher: mockFetcher })
    await expect(client.get('/things')).rejects.toBe(rawError)
  })

  it('supports PUT, PATCH, and DELETE methods', async () => {
    const { mockFetcher, client } = makeClient()
    await client.put('/things/1', { name: 'Updated' })
    await client.patch('/things/1', { name: 'Patched' })
    await client.delete('/things/1')
    const methods = mockFetcher.mock.calls.map(([, opts]) => opts.method)
    expect(methods).toEqual(['PUT', 'PATCH', 'DELETE'])
  })
})
