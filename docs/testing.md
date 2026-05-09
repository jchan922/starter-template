# Testing

> Living document — update when testing patterns change or new
> testing utilities are introduced.

---

## Stack

- **Vitest** — unit and integration tests
- **React Testing Library** — component rendering and assertions
- **Playwright** — end-to-end tests

---

## What to Test

**Always test:**

- Component renders with default props
- Component renders each meaningful prop variant
- User interactions (clicks, input changes, form submits)
- Error states
- Utility functions (all branches)

**Skip:**

- Implementation details (internal state, private methods)
- Third-party library behavior
- Styling (test behavior, not CSS)

---

## Unit Test Pattern

Follow the HelloWorld test as the template.
One test file per component, co-located in the component folder.

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders default state', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected text')).toBeDefined()
  })

  it('renders error state', () => {
    render(<MyComponent error={{ message: 'Something went wrong' }} />)
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })
})
```

---

## E2E Test Pattern

E2E tests live in [`/tests/e2e/`](../tests/e2e/).
Test full user flows, not individual components.

```js
import { test, expect } from '@playwright/test'

test('user can complete checkout', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="checkout-button"]')
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

Use `data-testid` attributes for E2E selectors — never class names or text.
