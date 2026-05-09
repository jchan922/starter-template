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
