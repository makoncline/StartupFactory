import { expect, test } from '@playwright/test'

test('todos empty visual baseline', async ({ page }) => {
  await page.goto('/todos?scenario=empty')
  await page.getByText('No todos yet.').waitFor()
  const region = page.getByRole('region', { name: 'Todo results' })
  await expect(region).toHaveScreenshot('todos-empty.png')
})
