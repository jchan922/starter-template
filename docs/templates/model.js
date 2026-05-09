// Pure functions — no imports, no side effects. Easy to unit test in isolation.

export const toThing = (raw) => ({
  id: raw._id?.toString() ?? raw.id,
  name: raw.name,
  createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
})

export const toThingList = (raws) => raws.map(toThing)

// Shapes and validates inbound request body before it reaches the DB
export const fromBody = (body) => ({
  name: body.name?.trim(),
})
