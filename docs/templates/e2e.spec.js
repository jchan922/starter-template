import { test, expect } from '@playwright/test'

test('user can do the thing', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="action-button"]')
  await expect(page.locator('[data-testid="result"]')).toBeVisible()
})
