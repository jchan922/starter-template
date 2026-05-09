export const createClient = ({ baseUrl, fetcher, getHeaders, normalizeError }) => {
  const buildHeaders = async () => {
    const custom = (await getHeaders?.()) ?? {}
    return { 'Content-Type': 'application/json', ...custom }
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
