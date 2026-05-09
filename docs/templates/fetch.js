// All data access lives here — DB queries, external API calls.
// Side effects are isolated to this file, making handler and model pure and testable.
import { db } from '@/services/server/db'

export const fetchThings = () => db.collection('things').find({}).toArray()

export const fetchThingById = (id) => db.collection('things').findOne({ _id: id })

export const persistThing = (input) =>
  db.collection('things').insertOne({ ...input, createdAt: new Date() })
