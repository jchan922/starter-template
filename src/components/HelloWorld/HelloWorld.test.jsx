import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import HelloWorld from './HelloWorld'

afterEach(() => vi.unstubAllEnvs())

/**
 * Unit test template.
 * Copy this file for every new component.
 * Pattern:
 *   - One describe block per component
 *   - Test default render
 *   - Test each prop variant
 *   - Test user interactions if any
 *   - No implementation details — test what the user sees
 */
describe('HelloWorld', () => {
  it('renders the default message', () => {
    render(<HelloWorld />)
    expect(screen.getByText('Hello World')).toBeDefined()
  })

  it('renders the default subtitle', () => {
    render(<HelloWorld />)
    expect(screen.getByText('Your starter is deployed. Start building.')).toBeDefined()
  })

  it('renders a custom message', () => {
    render(<HelloWorld message="Custom Message" />)
    expect(screen.getByText('Custom Message')).toBeDefined()
  })

  it('renders a custom subtitle', () => {
    render(<HelloWorld subtitle="Custom subtitle" />)
    expect(screen.getByText('Custom subtitle')).toBeDefined()
  })

  it('renders the version when VITE_APP_VERSION is set', () => {
    vi.stubEnv('VITE_APP_VERSION', '1.2.3')
    render(<HelloWorld />)
    expect(screen.getByText('v1.2.3')).toBeDefined()
  })

  it('omits the version badge when VITE_APP_VERSION is not set', () => {
    render(<HelloWorld />)
    expect(screen.queryByText(/^v\d/)).toBeNull()
  })
})
