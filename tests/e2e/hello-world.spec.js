import { test, expect } from '@playwright/test'

/**
 * E2E smoke test — confirms successful deploy.
 * Definition of done: hello world renders at root URL.
 */
test('hello world renders on home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Hello World' })).toBeVisible()
})

test('page has correct title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/starter/i)
})
