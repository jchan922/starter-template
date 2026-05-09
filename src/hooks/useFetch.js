import { useState, useEffect, useCallback } from 'react'
import { fetcher } from '@/lib/fetcher'

/**
 * useFetch — thin React wrapper around the client fetcher.
 * For service calls, prefer calling services directly in event handlers.
 * Use this hook for data that needs to load on mount.
 *
 * @param {string} url - Full URL to fetch
 * @param {Object} [options] - Fetch options
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher(url, options)
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (url) execute()
  }, [url, execute])

  return { data, loading, error, refetch: execute }
}
