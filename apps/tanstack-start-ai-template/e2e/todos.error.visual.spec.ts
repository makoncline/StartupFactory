import { expect, test } from '@playwright/test'

test('todos error visual baseline', async ({ page }) => {
  await page.goto('/todos?scenario=error')
  await page.getByText('Failed to load todos.').waitFor()
  const region = page.getByRole('region', { name: 'Todo results' })
  await expect(region).toHaveScreenshot('todos-error.png')
})
