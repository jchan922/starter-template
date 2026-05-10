import { describe, it, expect } from 'vitest'
import { toThing, toThingList, fromBody } from './model'

describe('toThing', () => {
  it('maps _id to a string id', () => {
    const raw = { _id: { toString: () => 'abc123' }, name: 'Widget', createdAt: '2024-01-01' }
    expect(toThing(raw).id).toBe('abc123')
  })

  it('falls back to raw.id when _id is absent', () => {
    const raw = { id: 'xyz', name: 'Widget', createdAt: '2024-01-01' }
    expect(toThing(raw).id).toBe('xyz')
  })

  it('converts a Date object to ISO string', () => {
    const date = new Date('2024-06-15T12:00:00.000Z')
    const raw = { id: '1', name: 'Widget', createdAt: date }
    expect(toThing(raw).createdAt).toBe('2024-06-15T12:00:00.000Z')
  })

  it('preserves a createdAt string as-is', () => {
    const raw = { id: '1', name: 'Widget', createdAt: '2024-01-01T00:00:00Z' }
    expect(toThing(raw).createdAt).toBe('2024-01-01T00:00:00Z')
  })

  it('maps name through unchanged', () => {
    const raw = { id: '1', name: 'My Widget', createdAt: '2024-01-01' }
    expect(toThing(raw).name).toBe('My Widget')
  })
})

describe('toThingList', () => {
  it('maps each item through toThing', () => {
    const raws = [
      { id: '1', name: 'A', createdAt: '2024-01-01' },
      { id: '2', name: 'B', createdAt: '2024-01-02' },
    ]
    const result = toThingList(raws)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
  })

  it('returns an empty array for empty input', () => {
    expect(toThingList([])).toEqual([])
  })
})

describe('fromBody', () => {
  it('trims whitespace from name', () => {
    expect(fromBody({ name: '  Widget  ' })).toEqual({ name: 'Widget' })
  })

  it('leaves a clean name unchanged', () => {
    expect(fromBody({ name: 'Widget' })).toEqual({ name: 'Widget' })
  })
})
