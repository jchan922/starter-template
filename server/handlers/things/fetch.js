// All data access lives here — DB queries, external API calls.
// Side effects are isolated to this file.
import * as db from '../../db/index.js'

export const fetchThings = () => db.find('things', {})

export const fetchThingById = (id) => db.findOne('things', { id })

export const persistThing = (input) => db.save('things', { ...input, createdAt: new Date() })
