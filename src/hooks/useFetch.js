import { useState, useEffect, useCallback, useRef } from 'react'
import { fetcher } from '@/lib/fetcher'

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Ref keeps options current without triggering re-renders when caller
  // passes a new object literal on every render.
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher(url, optionsRef.current)
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
