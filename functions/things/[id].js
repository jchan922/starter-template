// CF Pages adapter — thin wire only, no business logic.
// Maps CF Pages onRequest* format to handler { status, body } shape.
import { getThing } from '../../server/handlers/things/handler.js'

export async function onRequestGet(context) {
  const { status, body } = await getThing(context.request, context.params)
  return Response.json(body, { status })
}
