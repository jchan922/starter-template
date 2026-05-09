# Patterns
> Living document — add new patterns as they emerge. Remove patterns
> that get superseded. Reference this before writing new services,
> hooks, or utilities.

---

## Adding a New Service

1. Create the file in `/services/client/` or `/services/server/`
2. Import `createClient` from the appropriate lib layer
3. Configure baseUrl, getHeaders, normalizeError
4. Export named functions — never export the raw client
5. Stub functions that aren't implemented yet with a clear error

```js
import { createClient } from '@/lib/client/createClient'

const client = createClient({
  baseUrl: import.meta.env.VITE_SERVICE_URL,
  getHeaders: async () => ({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.message ?? err.message,
    code: err.raw?.code ?? 'unknown',
  }),
})

export const getThings = () => client.get('/things')
export const createThing = (data) => client.post('/things', data)
```

---

## Adding a New Hook

1. Create in `/hooks/`
2. Name with `use` prefix
3. Wire to services — never call fetch or external libs directly
4. Return a consistent shape: `{ data, loading, error, ...actions }`

```js
import { useState, useEffect } from 'react'
import { getThings } from '@/services/client/things'

export const useThings = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getThings()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
```

---

## Adding a New Component

Copy the HelloWorld pattern:

```
/components
  /MyComponent
    MyComponent.jsx
    MyComponent.css
    MyComponent.stories.jsx
    MyComponent.test.jsx
```

- One root CSS class matching component name
- All child rules nested inside it
- All values from tokens — no hardcoded colors or spacing
- Props documented with defaults
- No service calls inside the component

---

## Error Handling Pattern

Services normalize errors to a consistent shape.
Hooks catch and expose them. Components display them.

```js
// service — normalize to domain shape
normalizeError: (err) => ({
  message: err.raw?.error?.message ?? err.message,
  code: err.raw?.error?.code ?? 'unknown',
})

// hook — catch and expose
const [error, setError] = useState(null)
try { ... } catch (err) { setError(err) }

// component — display
{error && <p className="error-message">{error.message}</p>}
```
