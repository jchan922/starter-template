# Design: Full-Stack Monorepo Restructure

**Date:** 2026-05-09
**Status:** Approved — pending implementation plan

---

## Goal

Restructure the starter template into an explicit full-stack monorepo that supports one-click deploy to either Cloudflare Pages or AWS ECS without reshaping application code between targets.

The React app (src/) and server-side code (server/) are cleanly separated. Handler logic is pure and runtime-agnostic. Only thin adapter files differ between deploy targets.

---

## Folder Structure

```
my-app/
  src/                          ← Vite bundle boundary — browser only
    components/
    pages/
    hooks/
    context/
    services/                   ← browser HTTP calls only (flattened, no subfolders)
      api.js
      auth.js
      payments.js
    lib/                        ← browser HTTP infrastructure
      fetcher.js
      createClient.js           ← shared factory, fetcher injected as dependency
    styles/
    utils/

  server/                       ← never imported by src/, never bundled
    handlers/                   ← per-resource folders
      things/                   ← example resource
        handler.js              ← entry/exit, pure functions, returns { status, body }
        fetch.js                ← data access (db + server services)
        model.js                ← pure transforms, no side effects
    services/                   ← server-only HTTP calls (secret keys safe here)
      payments.js
      email.js
    db/
      index.js                  ← DB interface — stubs only, implementation swapped per runtime
    lib/
      fetcher.js                ← server fetcher (longer timeout, full error logging)
      createClient.js           ← same implementation as src/lib/createClient.js (intentional duplication — avoids cross-boundary import)
    index.js                    ← ECS/Node adapter entry point (Express or Hono app wiring)

  functions/                    ← CF Pages adapter layer (thin wires only, not business logic)
    things/
      [id].js                   ← imports handler, wires to onRequest* format

  infra/
    wrangler.toml
    Dockerfile
    docker-compose.yml

  docs/
```

---

## The Adapter Pattern

Handlers are pure functions that return `{ status, body }`. They have no knowledge of the HTTP runtime. Adapters are the only runtime-specific code — they are thin wires, contain no logic, and are the only files that change between CF Pages and ECS.

**Handler (runtime-agnostic):**

```js
// server/handlers/things/handler.js
import { fetchThingById } from './fetch.js'
import { toThing } from './model.js'

export async function getThing(_req, { id }) {
  const raw = await fetchThingById(id)
  if (!raw) return { status: 404, body: { error: 'Not found' } }
  return { status: 200, body: { data: toThing(raw) } }
}
```

**CF Pages adapter:**

```js
// functions/things/[id].js
import { getThing } from '../../server/handlers/things/handler.js'

export async function onRequestGet(context) {
  const { status, body } = await getThing(context.request, context.params)
  return Response.json(body, { status })
}
```

**ECS/Node adapter:**

```js
// server/index.js
import { getThing } from './handlers/things/handler.js'

app.get('/things/:id', async (req, res) => {
  const { status, body } = await getThing(req, req.params)
  res.status(status).json(body)
})
```

### Adding a New Route — Full Checklist

Every new route requires these steps in order:

1. Create `server/handlers/<resource>/` folder
2. Write `handler.js` — pure functions returning `{ status, body }`, no runtime imports
3. Write `fetch.js` — all data access via `server/db` or `server/services/`
4. Write `model.js` — pure transforms, no imports from db or services
5. **CF Pages:** add `functions/<resource>/[param].js` adapter (import handler, wire to `onRequest*`)
6. **ECS/Node:** register route in `server/index.js` (import handler, wire to framework)
7. Add corresponding client service call in `src/services/api.js` if the frontend needs to call this route
8. Add hook in `src/hooks/` if the frontend needs to consume the data
9. Write tests for `model.js` (pure functions, no mocks needed)

---

## DB Layer

`server/db/index.js` is a pure interface. It exports named functions with consistent signatures. The implementation is swapped once per project when the runtime and DB are chosen. App code (fetch.js files) always imports from `server/db` — never from a driver directly.

**Interface (always the same):**

```js
export const find = (collection, query) => {
  throw new Error('db.find not implemented')
}
export const findOne = (collection, query) => {
  throw new Error('db.findOne not implemented')
}
export const save = (collection, doc) => {
  throw new Error('db.save not implemented')
}
export const update = (collection, query, data) => {
  throw new Error('db.update not implemented')
}
export const remove = (collection, query) => {
  throw new Error('db.remove not implemented')
}
```

**Implementation examples (replace stubs when runtime is chosen):**

| Runtime  | DB          | Implementation                                 |
| -------- | ----------- | ---------------------------------------------- |
| CF Pages | D1 (SQLite) | `env.DB.prepare('SELECT...').bind(id).first()` |
| CF Pages | Hyperdrive  | Postgres driver via Hyperdrive proxy           |
| ECS/Node | Postgres    | `pool.query('SELECT...', [id])`                |
| ECS/Node | MongoDB     | `db.collection('things').findOne({ _id: id })` |

---

## lib/ Consolidation

`createClient` is identical in both `src/lib/` and `server/lib/`. The fetchers differ legitimately (timeout, logging prefix). Fix: one `createClient` that takes `fetcher` as a dependency. Each side passes its own fetcher.

Both `src/lib/createClient.js` and `server/lib/createClient.js` contain the same implementation — intentional duplication. Avoids a cross-boundary import between `src/` and `server/`, each file is small, and a comment in each notes the duplication is deliberate. Each service passes its own fetcher as a dependency:

```js
// src/services/payments.js — browser side
import { createClient } from '@/lib/createClient'
import { fetcher } from '@/lib/fetcher'
const client = createClient({ baseUrl, fetcher, getHeaders, normalizeError })

// server/services/payments.js — server side
import { createClient } from '../lib/createClient'
import { fetcher } from '../lib/fetcher'
const client = createClient({ baseUrl, fetcher, getHeaders, normalizeError })
```

---

## src/services/ Cleanup

Remove the `client/server` subfolder split. `src/services/` is browser-only by definition — anything server-side lives in `server/services/`. No subfolder needed.

```
src/services/
  api.js        ← calls your own backend API
  auth.js       ← auth provider (public key / session token)
  payments.js   ← Stripe public key only
```

---

## Docs Changes

| File                   | Change                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `README.md`            | Rewrite to describe full-stack monorepo, agnostic deploy target                          |
| `docs/architecture.md` | New layer diagram covering src/ and server/ separately, adapter pattern                  |
| `docs/patterns.md`     | "Adding a new route" as first-class pattern with full checklist                          |
| `docs/infra.md`        | CF adapter path vs ECS adapter path, side by side                                        |
| `docs/decisions.md`    | ADR-008: full-stack monorepo; update ADR-003 (strangler fig now covers runtime swap too) |
| `docs/templates/`      | Add CF adapter stub, ECS adapter stub; update handler/fetch/model to use new paths       |
| `docs/AI_CONTEXT.md`   | Update living docs table, update philosophy to mention adapter pattern                   |

---

## What Does Not Change

- React component, hook, context, and page patterns — untouched
- CSS conventions, design tokens — untouched
- CI/CD pipelines (ci.yml) — untouched
- The strangler fig principle — extended, not replaced
- Test conventions — untouched
- `src/lib/fetcher.js` and `server/lib/fetcher.js` — stay separate (legitimately different)

---

## Out of Scope

- Implementing a real DB driver (stubs only)
- Building a real CF Pages Functions route (adapter stub only)
- Choosing a Node HTTP framework for ECS (stub shows both Express and Hono; project decides)
- TypeScript migration
