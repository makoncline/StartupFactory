import { expect, test } from '@playwright/test'

test('home page visual baseline', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { name: 'Fast autonomous app delivery.' }).waitFor()
  await expect(page).toHaveScreenshot('home.png')
})
