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
