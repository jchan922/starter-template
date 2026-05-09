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
