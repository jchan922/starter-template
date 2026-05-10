import { describe, it, expect } from 'vitest'
import { formatDate, truncate, capitalize, uid, clamp } from './index'

describe('formatDate', () => {
  it('formats a date string to a readable label', () => {
    const result = formatDate('2024-06-15T12:00:00Z')
    expect(result).toContain('2024')
    expect(result).toContain('June')
  })

  it('accepts a Date object', () => {
    const result = formatDate(new Date('2024-03-01T12:00:00Z'))
    expect(result).toContain('2024')
  })
})

describe('truncate', () => {
  it('returns the string unchanged when under max', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns the string unchanged when equal to max', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and appends ellipsis when over max', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  it('uses 100 as the default max', () => {
    const long = 'a'.repeat(101)
    expect(truncate(long)).toHaveLength(101) // 100 chars + ellipsis
    expect(truncate(long).endsWith('…')).toBe(true)
  })

  it('returns falsy input as-is', () => {
    expect(truncate('')).toBe('')
    expect(truncate(null)).toBeNull()
  })
})

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles a single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('leaves an already-capitalized string unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })
})

describe('uid', () => {
  it('returns a non-empty string', () => {
    expect(typeof uid()).toBe('string')
    expect(uid().length).toBeGreaterThan(0)
  })

  it('returns different values on each call', () => {
    const ids = new Set(Array.from({ length: 10 }, uid))
    expect(ids.size).toBe(10)
  })
})

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })
})
