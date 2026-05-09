import { fetcher } from './fetcher'

/**
 * Creates a configured HTTP client for server-side service calls.
 * Safe to use secret keys — this never runs in the browser.
 *
 * @param {Object} config
 * @param {string} config.baseUrl - Base URL for the service
 * @param {Function} [config.getHeaders] - Async fn returning auth headers (secret keys safe here)
 * @param {Function} [config.normalizeError] - Maps raw errors to domain shape
 */
export const createClient = ({ baseUrl, getHeaders, normalizeError }) => {
  const buildHeaders = async () => {
    const custom = (await getHeaders?.()) ?? {}
    return {
      'Content-Type': 'application/json',
      ...custom,
    }
  }

  const request = async (method, path, body) => {
    try {
      return await fetcher(`${baseUrl}${path}`, {
        method,
        headers: await buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch (err) {
      throw normalizeError ? normalizeError(err) : err
    }
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path),
  }
}
