import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetcher, ServiceError } from './fetcher'

const mockResponse = (status, body, ok = status >= 200 && status < 300) => ({
  ok,
  status,
  statusText: String(status),
  json: () => Promise.resolve(body),
})

describe('ServiceError', () => {
  it('sets name, status, and raw', () => {
    const err = new ServiceError({ message: 'fail' }, 404)
    expect(err.name).toBe('ServiceError')
    expect(err.status).toBe(404)
    expect(err.raw).toEqual({ message: 'fail' })
    expect(err.message).toBe('fail')
  })

  it('uses Unknown error as fallback message', () => {
    const err = new ServiceError({}, 500)
    expect(err.message).toBe('Unknown error')
  })
})

describe('fetcher', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns parsed JSON on a successful response', async () => {
    fetch.mockResolvedValueOnce(mockResponse(200, { data: 'test' }))
    const result = await fetcher('https://api.example.com/test')
    expect(result).toEqual({ data: 'test' })
  })

  it('calls fetch with the provided URL and options', async () => {
    fetch.mockResolvedValueOnce(mockResponse(200, {}))
    await fetcher('https://api.example.com/test', { method: 'POST' })
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', { method: 'POST' })
  })

  it('throws ServiceError on a non-ok response', async () => {
    fetch.mockResolvedValueOnce(mockResponse(400, { message: 'Bad request' }))
    await expect(fetcher('https://api.example.com/test', {}, 0)).rejects.toBeInstanceOf(
      ServiceError
    )
  })

  it('attaches the HTTP status to the ServiceError', async () => {
    fetch.mockResolvedValueOnce(mockResponse(404, { message: 'Not found' }))
    try {
      await fetcher('https://api.example.com/test', {}, 0)
    } catch (err) {
      expect(err.status).toBe(404)
    }
  })

  it('does not retry non-retryable status codes', async () => {
    fetch.mockResolvedValueOnce(mockResponse(400, { message: 'Bad request' }))
    await expect(fetcher('https://api.example.com/test', {}, 2)).rejects.toBeInstanceOf(
      ServiceError
    )
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries on retryable status codes and succeeds', async () => {
    vi.useFakeTimers()
    fetch
      .mockResolvedValueOnce(mockResponse(503, { message: 'Unavailable' }))
      .mockResolvedValueOnce(mockResponse(200, { data: 'ok' }))

    const promise = fetcher('https://api.example.com/test', {}, 1)
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toEqual({ data: 'ok' })
    expect(fetch).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('wraps network errors in ServiceError', async () => {
    fetch.mockRejectedValueOnce(new Error('Network failure'))
    await expect(fetcher('https://api.example.com/test', {}, 0)).rejects.toBeInstanceOf(
      ServiceError
    )
  })

  it('re-throws an existing ServiceError without double-wrapping', async () => {
    const original = new ServiceError({ message: 'already wrapped' }, 503)
    fetch.mockRejectedValueOnce(original)
    const thrown = await fetcher('https://api.example.com/test', {}, 0).catch((e) => e)
    expect(thrown).toBe(original)
  })
})
