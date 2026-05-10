# Patterns

> Living document — add new patterns as they emerge. Remove patterns
> that get superseded. Reference this before writing new services,
> hooks, or utilities.
>
> Copy-paste stubs for all patterns live in [`templates/`](templates/).

---

## Adding a New Route

Every new route touches both the server and (optionally) the frontend. Complete steps in order.

### Server side

1. Create `server/handlers/<resource>/` folder
2. Write `handler.js` — pure functions returning `{ status, body }`, no runtime imports
3. Write `fetch.js` — all data access via `server/db` or `server/services/`
4. Write `model.js` — pure transforms, no db or service imports
5. **CF Pages:** add `functions/<resource>/[param].js` (see [`templates/adapter.cf.js`](templates/adapter.cf.js))
6. **AWS ECS/Node:** register the route in `server/index.js` (see [`templates/adapter.node.js`](templates/adapter.node.js))
7. Write unit tests for `model.js` — pure functions, no mocks needed

### Frontend side (if the UI needs this route)

8. Add a named function to `src/services/api.js` that calls the new endpoint
9. Add a hook in `src/hooks/` that calls the service function
10. Add a page in `src/pages/` and register it in `app.jsx`
11. Build the component

### Templates

| What                 | Template                                                 |
| -------------------- | -------------------------------------------------------- |
| Handler              | [`templates/handler.js`](templates/handler.js)           |
| Fetch layer          | [`templates/fetch.js`](templates/fetch.js)               |
| Model layer          | [`templates/model.js`](templates/model.js)               |
| CF Pages adapter     | [`templates/adapter.cf.js`](templates/adapter.cf.js)     |
| AWS ECS/Node adapter | [`templates/adapter.node.js`](templates/adapter.node.js) |

---

## Adding a New Service

1. Create the file in [`src/services/`](../src/services/) for browser calls, or [`server/services/`](../server/services/) for server-only calls
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

1. Create in [`src/hooks/`](../src/hooks/)
2. Name with `use` prefix
3. Wire to services or context — never call fetch or external libs directly
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

## Adding Shared State (Context)

Use Context for state that multiple components need (auth, theme, cart).
One context per domain. Always expose via a hook — never import the context object directly.

1. Create in [`/context/`](../src/context/)
2. Export a `Provider` component and a `use*Context` hook
3. Mount the Provider in [`main.jsx`](../src/main.jsx)
4. Consume via the hook, never via `useContext` directly

See [`AuthContext.jsx`](../src/context/AuthContext.jsx) as the reference implementation.

---

## Adding a New Component

Copy the `HelloWorld` pattern: one folder with `.jsx`, `.css`, `.stories.jsx`, and `.test.jsx`.

- One root CSS class matching component name in kebab-case
- Child classes follow `component-name-child` pattern (e.g. `.card-title`) — single hyphen, no BEM `__` or `--`
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
{error && <p className="component-error">{error.message}</p>}
```
