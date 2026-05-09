import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ComponentName from './ComponentName'

describe('ComponentName', () => {
  it('renders value', () => {
    render(<ComponentName value="Hello" />)
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('renders error state', () => {
    render(<ComponentName error={{ message: 'Something went wrong' }} />)
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })
})
