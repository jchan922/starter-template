// CF Pages adapter — thin wire only, no business logic.
// File location: functions/<resource>/[param].js
// Maps CF Pages onRequest* format to handler { status, body } shape.
import { getThing, createThing } from '../../server/handlers/things/handler.js'

export async function onRequestGet(context) {
  const { status, body } = await getThing(context.request, context.params)
  return Response.json(body, { status })
}

export async function onRequestPost(context) {
  const { status, body } = await createThing(context.request)
  return Response.json(body, { status })
}
