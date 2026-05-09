# Full-Stack Monorepo Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the starter template into an explicit full-stack monorepo with `server/` at root, flattened `src/services/` and `src/lib/`, a CF Pages adapter layer in `functions/`, and updated docs — making the code match the approved design spec.

**Architecture:** `src/` is the Vite bundle boundary (browser only). `server/` lives at root and is never imported by `src/`. Handlers are pure functions returning `{ status, body }`. Thin adapter files in `functions/` (CF Pages) or `server/index.js` (ECS/Node) are the only runtime-specific code.

**Tech Stack:** React 18, Vite, React Router v7, Vitest, Playwright, Prettier, ESLint, Husky

---

## File Map

### Created

- `src/lib/fetcher.js` — browser fetcher (replaces `src/lib/client/fetcher.js`)
- `src/lib/createClient.js` — shared factory, fetcher injected as param (replaces `src/lib/client/createClient.js`)
- `src/services/api.js` — (replaces `src/services/client/api.js`)
- `src/services/auth.js` — (replaces `src/services/client/auth.js`)
- `src/services/payments.js` — (replaces `src/services/client/payments.js`)
- `server/lib/fetcher.js` — server fetcher (was `src/lib/server/fetcher.js`)
- `server/lib/createClient.js` — same factory as `src/lib/createClient.js`, intentional duplication
- `server/services/payments.js` — (was `src/services/server/payments.js`)
- `server/services/email.js` — (was `src/services/server/email.js`)
- `server/db/index.js` — (was `src/services/server/db.js`)
- `server/handlers/things/handler.js` — example resource handler stub
- `server/handlers/things/fetch.js` — example resource fetch stub
- `server/handlers/things/model.js` — example resource model stub
- `server/index.js` — ECS/Node adapter entry point stub
- `functions/things/[id].js` — CF Pages adapter stub
- `docs/templates/adapter.cf.js` — CF Pages adapter template
- `docs/templates/adapter.node.js` — ECS/Node adapter registration template

### Modified

- `src/hooks/useFetch.js` — update import path
- `src/hooks/useAuth.js` — verify no stale imports
- `docs/templates/service.js` — inject fetcher
- `docs/templates/fetch.js` — update db import path
- `docs/templates/handler.js` — clean up adapter note
- `README.md` — full-stack monorepo description
- `docs/architecture.md` — new mermaid diagram
- `docs/patterns.md` — add "Adding a New Route" checklist
- `docs/infra.md` — reference functions/ and server/index.js
- `docs/decisions.md` — ADR-008
- `docs/AI_CONTEXT.md` — update living docs table

### Deleted

- `src/lib/client/` — entire directory
- `src/lib/server/` — entire directory
- `src/services/client/` — entire directory
- `src/services/server/` — entire directory

---

## Task 1: Flatten src/lib/ and de-dupe createClient

**Files:**

- Create: `src/lib/fetcher.js`
- Create: `src/lib/createClient.js`
- Delete: `src/lib/client/` (entire directory)
- Delete: `src/lib/server/` (entire directory)

- [ ] **Step 1: Create `src/lib/fetcher.js`** — copy browser fetcher content, flat location

```js
const DEFAULT_TIMEOUT_MS = 10000
const DEFAULT_RETRIES = 2
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504]

export class ServiceError extends Error {
  constructor(error, status) {
    super(error.message ?? 'Unknown error')
    this.name = 'ServiceError'
    this.status = status
    this.raw = error
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new ServiceError({ message: 'Request timed out' }, 408)), ms)
  )
  return Promise.race([promise, timeout])
}

export const fetcher = async (url, options = {}, retries = DEFAULT_RETRIES) => {
  try {
    const res = await withTimeout(fetch(url, options), DEFAULT_TIMEOUT_MS)

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      const serviceError = new ServiceError(error, res.status)

      if (retries > 0 && RETRYABLE_STATUSES.includes(res.status)) {
        console.warn(`[fetcher] Retrying ${url} — ${res.status} (${retries} left)`)
        await sleep(500)
        return fetcher(url, options, retries - 1)
      }

      console.error(`[fetcher] Failed ${url} — ${res.status}`, error)
      throw serviceError
    }

    return res.json()
  } catch (err) {
    if (err instanceof ServiceError) throw err
    throw new ServiceError({ message: err.message ?? 'Network error' }, 0)
  }
}
```

- [ ] **Step 2: Create `src/lib/createClient.js`** — fetcher is now injected as a dependency

```js
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
```

- [ ] **Step 3: Delete `src/lib/client/` and `src/lib/server/` directories**

```bash
rm -rf /path/to/project/src/lib/client
rm -rf /path/to/project/src/lib/server
```

- [ ] **Step 4: Run tests — expect FAIL on import errors**

```bash
npm run test
```

Expected: failures in `useFetch.js` and any service file that imports from old paths. This is expected — confirms the old paths are gone.

- [ ] **Step 5: Commit stub state**

```bash
git add src/lib/
git commit -m "refactor: flatten src/lib/, createClient now accepts fetcher as dependency"
```

---

## Task 2: Flatten src/services/

**Files:**

- Create: `src/services/api.js`
- Create: `src/services/auth.js`
- Create: `src/services/payments.js`
- Delete: `src/services/client/` (entire directory)
- Delete: `src/services/server/` (entire directory)

- [ ] **Step 1: Create `src/services/api.js`**

```js
import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const client = createClient({
  baseUrl: import.meta.env.VITE_API_URL,
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}`,
  }),
  normalizeError: (err) => ({
    message: err.message,
    status: err.status,
  }),
})

export const get = client.get
export const post = client.post
export const put = client.put
export const patch = client.patch
export const remove = client.delete
```

- [ ] **Step 2: Create `src/services/auth.js`**

```js
import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const client = createClient({
  baseUrl: import.meta.env.VITE_AUTH_URL ?? '',
  fetcher,
  normalizeError: (err) => ({
    message: err.raw?.error_description ?? err.message,
    code: err.raw?.error ?? 'auth_error',
  }),
})

export const login = (_credentials) => {
  throw new Error('auth.login not implemented')
}

export const logout = () => {
  throw new Error('auth.logout not implemented')
}

export const getUser = () => {
  throw new Error('auth.getUser not implemented')
}
```

- [ ] **Step 3: Create `src/services/payments.js`**

```js
import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const client = createClient({
  baseUrl: 'https://api.stripe.com',
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${import.meta.env.VITE_STRIPE_PUBLIC_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.error?.message ?? err.message,
    code: err.raw?.error?.code,
    declineCode: err.raw?.error?.decline_code,
  }),
})

export const createCheckoutSession = (_items) => {
  throw new Error('payments.createCheckoutSession not implemented')
}

export const getPaymentIntent = (_intentId) => {
  throw new Error('payments.getPaymentIntent not implemented')
}
```

- [ ] **Step 4: Delete `src/services/client/` and `src/services/server/`**

```bash
rm -rf /path/to/project/src/services/client
rm -rf /path/to/project/src/services/server
```

- [ ] **Step 5: Commit**

```bash
git add src/services/
git commit -m "refactor: flatten src/services/, browser-only, no client/server subfolders"
```

---

## Task 3: Fix remaining import paths in src/

**Files:**

- Modify: `src/hooks/useFetch.js`

- [ ] **Step 1: Update `src/hooks/useFetch.js`** — change import path from old flat to new flat location

Replace line 2:

```js
import { fetcher } from '@/lib/client/fetcher'
```

With:

```js
import { fetcher } from '@/lib/fetcher'
```

- [ ] **Step 2: Run tests — expect all passing**

```bash
npm run test
```

Expected: 4 tests pass, no import errors.

- [ ] **Step 3: Run build — confirm no broken imports**

```bash
npm run build
```

Expected: build succeeds, no missing module errors.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: same warnings as before (unused vars in stub services), no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFetch.js
git commit -m "fix: update useFetch import to flattened lib path"
```

---

## Task 4: Create server/ at root

**Files:**

- Create: `server/lib/fetcher.js`
- Create: `server/lib/createClient.js`
- Create: `server/services/payments.js`
- Create: `server/services/email.js`
- Create: `server/db/index.js`
- Create: `server/handlers/things/handler.js`
- Create: `server/handlers/things/fetch.js`
- Create: `server/handlers/things/model.js`
- Create: `server/index.js`

- [ ] **Step 1: Create `server/lib/fetcher.js`** — server fetcher, longer timeout, full error logging

```js
const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_RETRIES = 2
const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504]

export class ServiceError extends Error {
  constructor(error, status) {
    super(error.message ?? 'Unknown error')
    this.name = 'ServiceError'
    this.status = status
    this.raw = error
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new ServiceError({ message: 'Request timed out' }, 408)), ms)
  )
  return Promise.race([promise, timeout])
}

export const fetcher = async (url, options = {}, retries = DEFAULT_RETRIES) => {
  try {
    const res = await withTimeout(fetch(url, options), DEFAULT_TIMEOUT_MS)

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      const serviceError = new ServiceError(error, res.status)

      if (retries > 0 && RETRYABLE_STATUSES.includes(res.status)) {
        console.warn(`[server:fetcher] Retrying ${url} — ${res.status} (${retries} left)`)
        await sleep(500)
        return fetcher(url, options, retries - 1)
      }

      console.error(`[server:fetcher] Failed ${url} — ${res.status}`, JSON.stringify(error))
      throw serviceError
    }

    return res.json()
  } catch (err) {
    if (err instanceof ServiceError) throw err
    throw new ServiceError({ message: err.message ?? 'Network error' }, 0)
  }
}
```

- [ ] **Step 2: Create `server/lib/createClient.js`** — same implementation as `src/lib/createClient.js`, intentional duplication

```js
// Same implementation as src/lib/createClient.js — intentional duplication.
// Avoids cross-boundary import between src/ and server/.
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
```

- [ ] **Step 3: Create `server/services/payments.js`**

```js
import { createClient } from '../lib/createClient.js'
import { fetcher } from '../lib/fetcher.js'

// Server-side payment calls — secret key safe here.
// Node/ECS: use Stripe Node SDK instead of this HTTP client.
// CF Pages: call Stripe REST API via fetch — no SDK needed.
const client = createClient({
  baseUrl: 'https://api.stripe.com',
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.error?.message ?? err.message,
    code: err.raw?.error?.code,
    declineCode: err.raw?.error?.decline_code,
    type: err.raw?.error?.type,
  }),
})

export const createCheckoutSession = (_items) => {
  throw new Error('server/payments.createCheckoutSession not implemented')
}

export const createPaymentIntent = (_amount, _currency) => {
  throw new Error('server/payments.createPaymentIntent not implemented')
}

export const getSubscription = (_subscriptionId) => {
  throw new Error('server/payments.getSubscription not implemented')
}
```

- [ ] **Step 4: Create `server/services/email.js`**

```js
import { createClient } from '../lib/createClient.js'
import { fetcher } from '../lib/fetcher.js'

// Email service — secret key safe here.
// Node/ECS: use Resend/Postmark/SendGrid SDK or Nodemailer.
// CF Pages: call provider REST API directly via fetch.
const client = createClient({
  baseUrl: 'https://api.resend.com',
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.message ?? err.message,
    code: err.raw?.name ?? 'email_error',
  }),
})

export const sendEmail = (_to, _subject, _body) => {
  throw new Error('email.sendEmail not implemented')
}

export const sendTransactional = (_template, _recipient, _data) => {
  throw new Error('email.sendTransactional not implemented')
}
```

- [ ] **Step 5: Create `server/db/index.js`**

```js
// DB interface — implement for your runtime when needed.
// Node/ECS: Mongoose, Prisma, pg, etc.
// CF Pages: D1 binding via env, or Hyperdrive for Postgres.
// The interface below stays the same either way.

export const find = (_collection, _query) => {
  throw new Error('db.find not implemented')
}

export const findOne = (_collection, _query) => {
  throw new Error('db.findOne not implemented')
}

export const save = (_collection, _document) => {
  throw new Error('db.save not implemented')
}

export const update = (_collection, _query, _data) => {
  throw new Error('db.update not implemented')
}

export const remove = (_collection, _query) => {
  throw new Error('db.remove not implemented')
}
```

- [ ] **Step 6: Create `server/handlers/things/handler.js`** — example resource, shows the full pattern

```js
// Entry and exit point. Thin — validates input, calls fetch + model, returns { status, body }.
// No business logic, no runtime-specific imports.
import { fetchThings, fetchThingById, persistThing } from './fetch.js'
import { toThing, toThingList, fromBody } from './model.js'

export async function listThings(_req) {
  const raw = await fetchThings()
  return { status: 200, body: { data: toThingList(raw) } }
}

export async function getThing(_req, { id }) {
  const raw = await fetchThingById(id)
  if (!raw) return { status: 404, body: { error: 'Not found' } }
  return { status: 200, body: { data: toThing(raw) } }
}

export async function createThing(req) {
  const input = fromBody(await req.json())
  const raw = await persistThing(input)
  return { status: 201, body: { data: toThing(raw) } }
}
```

- [ ] **Step 7: Create `server/handlers/things/fetch.js`**

```js
// All data access lives here — DB queries, external API calls.
// Side effects are isolated to this file.
import * as db from '../../db/index.js'

export const fetchThings = () => db.find('things', {})

export const fetchThingById = (id) => db.findOne('things', { id })

export const persistThing = (input) => db.save('things', { ...input, createdAt: new Date() })
```

- [ ] **Step 8: Create `server/handlers/things/model.js`**

```js
// Pure functions — no imports, no side effects. Easy to unit test in isolation.

export const toThing = (raw) => ({
  id: raw._id?.toString() ?? raw.id,
  name: raw.name,
  createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
})

export const toThingList = (raws) => raws.map(toThing)

export const fromBody = (body) => ({
  name: body.name?.trim(),
})
```

- [ ] **Step 9: Create `server/index.js`** — ECS/Node adapter entry point stub

```js
// ECS/Node adapter entry point.
// Wire handler functions to your HTTP framework here.
// Handlers return { status, body } — map them to HTTP responses below.
//
// Hono (recommended for CF Workers compatibility):
//
// import { Hono } from 'hono'
// import { serve } from '@hono/node-server'
// import { listThings, getThing, createThing } from './handlers/things/handler.js'
//
// const app = new Hono()
// app.get('/things', async (c) => {
//   const { status, body } = await listThings(c.req.raw)
//   return c.json(body, status)
// })
// app.get('/things/:id', async (c) => {
//   const { status, body } = await getThing(c.req.raw, c.req.param())
//   return c.json(body, status)
// })
// app.post('/things', async (c) => {
//   const { status, body } = await createThing(c.req.raw)
//   return c.json(body, status)
// })
//
// serve({ fetch: app.fetch, port: process.env.PORT ?? 3000 })

export {}
```

- [ ] **Step 10: Run tests and build to confirm src/ is unaffected**

```bash
npm run test && npm run build
```

Expected: 4 tests pass, build succeeds.

- [ ] **Step 11: Commit**

```bash
git add server/
git commit -m "feat: add server/ — handlers, services, db, lib, ECS adapter stub"
```

---

## Task 5: Add functions/ CF Pages adapter stubs

**Files:**

- Create: `functions/things/[id].js`

- [ ] **Step 1: Create `functions/things/[id].js`**

```js
// CF Pages adapter — thin wire only, no business logic.
// Maps CF Pages onRequest* format to handler { status, body } shape.
import { getThing } from '../../server/handlers/things/handler.js'

export async function onRequestGet(context) {
  const { status, body } = await getThing(context.request, context.params)
  return Response.json(body, { status })
}
```

- [ ] **Step 2: Commit**

```bash
git add functions/
git commit -m "feat: add functions/ CF Pages adapter stubs"
```

---

## Task 6: Update docs/templates/

**Files:**

- Modify: `docs/templates/service.js`
- Modify: `docs/templates/fetch.js`
- Modify: `docs/templates/handler.js`
- Create: `docs/templates/adapter.cf.js`
- Create: `docs/templates/adapter.node.js`

- [ ] **Step 1: Update `docs/templates/service.js`** — inject fetcher

```js
import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'

const client = createClient({
  baseUrl: import.meta.env.VITE_SERVICE_URL,
  fetcher,
  getHeaders: async () => ({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  }),
  normalizeError: (err) => ({
    message: err.raw?.message ?? err.message,
    code: err.raw?.code ?? 'unknown',
  }),
})

export const getThings = () => client.get('/things')
export const getThingById = (id) => client.get(`/things/${id}`)
export const createThing = (data) => client.post('/things', data)
export const updateThing = (id, data) => client.put(`/things/${id}`, data)
export const deleteThing = (id) => client.delete(`/things/${id}`)
```

- [ ] **Step 2: Update `docs/templates/fetch.js`** — use server db path

```js
// All data access lives here — DB queries, external API calls.
// Side effects are isolated to this file, making handler and model pure and testable.
import * as db from '../../db/index.js'

export const fetchThings = () => db.find('things', {})

export const fetchThingById = (id) => db.findOne('things', { id })

export const persistThing = (input) => db.save('things', { ...input, createdAt: new Date() })
```

- [ ] **Step 3: Update `docs/templates/handler.js`** — clean up adapter note, use correct import paths

```js
// Entry and exit point. Thin — validates input, calls fetch + model, returns { status, body }.
// No business logic lives here.
//
// CF Pages adapter: wire in functions/<resource>/[param].js using onRequest*
// ECS/Node adapter: wire in server/index.js using your HTTP framework
import { fetchThings, fetchThingById, persistThing } from './fetch.js'
import { toThing, toThingList, fromBody } from './model.js'

export async function listThings(_req) {
  const raw = await fetchThings()
  return { status: 200, body: { data: toThingList(raw) } }
}

export async function getThing(_req, { id }) {
  const raw = await fetchThingById(id)
  if (!raw) return { status: 404, body: { error: 'Not found' } }
  return { status: 200, body: { data: toThing(raw) } }
}

export async function createThing(req) {
  const input = fromBody(await req.json())
  const raw = await persistThing(input)
  return { status: 201, body: { data: toThing(raw) } }
}
```

- [ ] **Step 4: Create `docs/templates/adapter.cf.js`**

```js
// CF Pages adapter — thin wire only, no business logic.
// File location: functions/<resource>/[param].js
// Maps CF Pages onRequest* format to handler { status, body } shape.
import { getThing } from '../../server/handlers/things/handler.js'

export async function onRequestGet(context) {
  const { status, body } = await getThing(context.request, context.params)
  return Response.json(body, { status })
}

export async function onRequestPost(context) {
  const { status, body } = await createThing(context.request)
  return Response.json(body, { status })
}
```

- [ ] **Step 5: Create `docs/templates/adapter.node.js`**

```js
// ECS/Node adapter — register handlers in server/index.js.
// Copy the relevant app.get/post/put/delete lines into server/index.js.
// Handlers return { status, body } — map them to HTTP responses here.
import { listThings, getThing, createThing } from './handlers/things/handler.js'

// Hono
app.get('/things', async (c) => {
  const { status, body } = await listThings(c.req.raw)
  return c.json(body, status)
})
app.get('/things/:id', async (c) => {
  const { status, body } = await getThing(c.req.raw, c.req.param())
  return c.json(body, status)
})
app.post('/things', async (c) => {
  const { status, body } = await createThing(c.req.raw)
  return c.json(body, status)
})
```

- [ ] **Step 6: Commit**

```bash
git add docs/templates/
git commit -m "docs: update templates for new monorepo structure, add CF and Node adapter templates"
```

---

## Task 7: Update all docs

**Files:**

- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/patterns.md`
- Modify: `docs/infra.md`
- Modify: `docs/decisions.md`
- Modify: `docs/AI_CONTEXT.md`

- [ ] **Step 1: Rewrite `README.md`**

````markdown
# Starter

A full-stack React + Node monorepo. Deploy to Cloudflare Pages or AWS ECS — no code changes between targets.

---

## Getting Started

```bash
git clone <this-repo> my-app
cd my-app
npm install
cp .env.example .env
npm run dev
```
````

Open [http://localhost:5173](http://localhost:5173).

Before your first deploy, add the required secrets and update [`infra/wrangler.toml`](infra/wrangler.toml) — see [`docs/infra.md`](docs/infra.md).

---

## Structure

| Folder       | What it is                                                  |
| ------------ | ----------------------------------------------------------- |
| `src/`       | React app — Vite bundle boundary, browser only              |
| `server/`    | Server-side handlers, services, db — never bundled          |
| `functions/` | Cloudflare Pages adapter (thin wires to `server/handlers/`) |
| `infra/`     | Deployment config — wrangler.toml, Dockerfile, Terraform    |
| `docs/`      | Architecture, patterns, decisions, and templates            |

---

## Docs

Architecture, patterns, design system, testing, and infrastructure docs live in [`docs/`](docs/).

````

- [ ] **Step 2: Rewrite `docs/architecture.md`**

```markdown
# Architecture

> Living document — update when layers change or responsibilities shift.

---

## Layer Diagram

```mermaid
flowchart TD
    subgraph browser["Browser — src/ (Vite bundle)"]
        R[router] --> P[pages/]
        P --> C[components/]
        P --> H[hooks/]
        C --> H
        H --> CTX[context/]
        H --> SVC[services/]
        SVC --> LIB[lib/]
    end

    subgraph backend["Server — server/ (never bundled)"]
        ADP[adapter\nfunctions/ or server/index.js] --> HAND[handlers/]
        HAND --> FETCH[fetch.js]
        HAND --> MODEL[model.js]
        FETCH --> SSVC[services/]
        FETCH --> DB[db/]
        SSVC --> SLIB[server/lib/]
    end

    SVC -. "HTTP — your API" .-> ADP
    SSVC -. strangler fig seam .-> EXT([Stripe · Email · etc])
    DB -. strangler fig seam .-> DBEXT([D1 · Postgres · Mongo])
````

---

## Layer Rules

Hard boundaries. Violating these creates debt that requires rewrites.

**src/ — browser only.** Nothing in `src/` may import from `server/`. Vite bundles `src/` — server code must never reach the browser.

**router** — defined in `app.jsx`. One route per page. Add nested routes for layouts.

**pages/** — routing and composition only. No fetch calls, no business logic. Extract logic to a hook.

**components/** — rendering only. Accept props, emit events via callbacks. Never call services directly.

**hooks/** — stateful logic that bridges components and services. One hook per concern.

**context/** — shared state that multiple components need. One context per domain. Consumed via a hook, never imported directly.

**services/** — browser-safe HTTP calls only. All go through `createClient`. Public env vars only (`VITE_` prefix).

**lib/** — browser HTTP infrastructure. `fetcher.js` and `createClient.js`. Zero domain knowledge.

---

**server/ — never imported by src/.** All server-side code lives here.

**handlers/** — one folder per resource. Each contains `handler.js`, `fetch.js`, `model.js`.

**handler.js** — entry and exit point. Pure functions returning `{ status, body }`. No runtime imports. Thin — calls fetch and model only.

**fetch.js** — all data access. Imports from `server/db` or `server/services`. Side effects live here and nowhere else.

**model.js** — pure transforms. No imports from db or services. Easily unit-tested with no mocks.

**server/services/** — server-only HTTP calls. Secret keys safe here. Same `createClient` pattern as `src/services/` but using `server/lib/fetcher`.

**server/db/** — DB interface. Implementation swapped per runtime. Never imported directly by handlers — always via `fetch.js`.

**server/lib/** — server HTTP infrastructure. Mirrors `src/lib/` but with server-appropriate timeout and logging.

---

## Adapter Layer

Adapters are the only runtime-specific code. They contain no logic — only wiring.

**CF Pages** — `functions/<resource>/[param].js`. Uses `onRequest*` exports and `Response.json()`.

**ECS/Node** — `server/index.js`. Uses your chosen HTTP framework (Hono recommended). Registers all routes.

When you add a new route: write the handler once, wire it in both adapters. See [`docs/patterns.md`](patterns.md) for the full checklist.

---

## Strangler Fig Seam

The seam works at two levels:

1. **Provider swap** — replace Stripe with another payment provider: only `server/services/payments.js` changes.
2. **Runtime swap** — migrate from CF Pages to ECS: only `functions/` adapters and `server/db/` implementation change. Handlers, hooks, and components are untouched.

````

- [ ] **Step 3: Add "Adding a New Route" to `docs/patterns.md`** — insert after the opening blockquote, before "Adding a Route"

Replace the existing "Adding a Route" section with:

```markdown
## Adding a New Route

Every new route touches both the server and (optionally) the frontend. Complete steps in order.

### Server side

1. Create `server/handlers/<resource>/` folder
2. Write `handler.js` — pure functions returning `{ status, body }`, no runtime imports
3. Write `fetch.js` — all data access via `server/db` or `server/services/`
4. Write `model.js` — pure transforms, no db or service imports
5. **CF Pages:** add `functions/<resource>/[param].js` (see [`templates/adapter.cf.js`](templates/adapter.cf.js))
6. **ECS/Node:** register the route in `server/index.js` (see [`templates/adapter.node.js`](templates/adapter.node.js))
7. Write unit tests for `model.js` — pure functions, no mocks needed

### Frontend side (if the UI needs this route)

8. Add a named function to `src/services/api.js` that calls the new endpoint
9. Add a hook in `src/hooks/` that calls the service function
10. Add a page in `src/pages/` and register it in `app.jsx`
11. Build the component

### Templates

| What | Template |
|---|---|
| Handler | [`templates/handler.js`](templates/handler.js) |
| Fetch layer | [`templates/fetch.js`](templates/fetch.js) |
| Model layer | [`templates/model.js`](templates/model.js) |
| CF Pages adapter | [`templates/adapter.cf.js`](templates/adapter.cf.js) |
| ECS/Node adapter | [`templates/adapter.node.js`](templates/adapter.node.js) |
````

- [ ] **Step 4: Update `docs/infra.md`** — add adapter layer references under each deploy target

Under the Cloudflare Pages section, add after the deploy command line:

```markdown
Server routes live in [`functions/`](../functions/) as CF Pages Functions. Each file maps one route to a handler in `server/handlers/`. See [`docs/templates/adapter.cf.js`](templates/adapter.cf.js).
```

Under the AWS ECS section, add after the Dockerfile line:

```markdown
Server routes are registered in [`server/index.js`](../server/index.js). See [`docs/templates/adapter.node.js`](templates/adapter.node.js).
```

- [ ] **Step 5: Add ADR-008 to `docs/decisions.md`**

Append to the end of the file:

```markdown
---

## ADR-008 — Full-Stack Monorepo with Runtime-Agnostic Handlers

**Date:** 2026-05-09
**Status:** Accepted

**Context:** The template needed a server-side architecture that works for
both CF Pages (Workers runtime) and ECS (Node runtime) without reshaping
code between targets. Original structure mixed server concerns into `src/`
alongside browser code.

**Decision:** `server/` at repo root, never imported by `src/`. Handlers
are pure functions returning `{ status, body }`. Thin adapter files
(`functions/` for CF Pages, `server/index.js` for ECS) are the only
runtime-specific code. `src/services/` is browser-only and flat.
`server/db/` is a pure interface — implementation swapped per runtime.

**Tradeoff:** Projects that only need a frontend SPA carry empty `server/`
and `functions/` stubs. Acceptable — the stubs are small and the
architectural clarity is worth it.
```

- [ ] **Step 6: Update `docs/AI_CONTEXT.md`** — update living docs table description for architecture.md and add server/ note to philosophy

In the philosophy paragraph, append:

```
The codebase has two clear boundaries: `src/` (browser, Vite bundles this) and `server/` (server-side, never bundled). Nothing in `src/` imports from `server/`.
```

Update the architecture.md row description:

```markdown
| [`architecture.md`](architecture.md) | Layer diagram for src/ and server/, adapter pattern, layer boundaries | Starting a new feature, adding a route, unsure where code belongs |
```

- [ ] **Step 7: Commit all docs**

```bash
git add README.md docs/
git commit -m "docs: update all docs for full-stack monorepo structure"
```

---

## Task 8: Final verification and push

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

Expected: 4 tests pass, 0 failures.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: only pre-existing warnings in stub service files (unused vars). No new errors.

- [ ] **Step 4: Run format check**

```bash
npm run format:check
```

Expected: all files pass.

- [ ] **Step 5: Push**

```bash
git push
```

Expected: pre-push hook runs format + lint + test + build, all pass, push succeeds.

---

## Self-Review Notes

- All import paths use exact relative paths (`../../db/index.js`) not aliases — server/ has no `@/` alias
- `createClient` in `server/lib/` is explicitly marked as intentional duplication with a comment
- `server/index.js` uses `export {}` to make it a valid ES module until a framework is chosen
- The `functions/` directory uses CF Pages file-based routing convention (`[id].js` for dynamic segments)
- `docs/templates/adapter.node.js` is illustrative — it won't execute standalone (references `app` which is defined in `server/index.js`)
- Vitest exclude list already covers `docs/**` — `server/` test files (if added later) will be picked up correctly since they'd have `.test.` in the filename
