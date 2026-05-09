/**
 * Database service — stubbed until project needs a database.
 * Swap implementation for Mongo or Postgres per project.
 * App code calls these functions, never the DB driver directly.
 *
 * Mongo:    npm install mongoose
 * Postgres: npm install prisma @prisma/client
 */

// Stub — implement when project needs a database
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
