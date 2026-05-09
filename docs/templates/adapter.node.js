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
