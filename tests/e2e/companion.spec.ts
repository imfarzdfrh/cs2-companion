import { test, expect } from '@playwright/test'
test('demo navigation, theme persistence and favorites', async ({ page }) => {
  await page.goto('/welcome')
  await page.getByRole('button', { name: 'Explore demo' }).click()
  await expect(page.getByText('DEMO MODE · SAMPLE DATA')).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Inventory' }).click()
  await page.getByRole('button', { name: 'Add favorite', exact: true }).click()
  await page.getByRole('button', { name: 'Favorites', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Amber Circuit Rifle · Concept' })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Profile' }).click()
  await page.getByRole('button', { name: 'light', exact: true }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('navigation').getByRole('link', { name: 'Matches' }).click()
  await page.getByLabel('Search matches').fill('Mirage')
  await expect(page.getByRole('link').filter({ hasText: 'Mirage' })).toBeVisible()
  await page.screenshot({
    path: 'artifacts/mobile-light.png',
    fullPage: false,
    animations: 'disabled',
  })
})
test('website renders honest download state', async ({ page }) => {
  await page.goto('http://localhost:3001')
  await expect(page.getByRole('heading', { name: 'YOUR ULTIMATE CS2 COMPANION.' })).toBeVisible()
  await page.getByRole('link', { name: 'Get the app', exact: true }).click()
  await expect(
    page.getByText('No verified public APK is available.', { exact: false })
  ).toBeVisible()
  await page.screenshot({
    path: 'artifacts/website-mobile.png',
    fullPage: false,
    animations: 'disabled',
  })
})

test('major screens fit a phone in both themes', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cs2-demo', 'true'))
  for (const theme of ['dark', 'light']) {
    await page.goto('/profile')
    await page.getByRole('button', { name: theme, exact: true }).click()
    for (const route of ['welcome', '', 'stats', 'inventory', 'profile']) {
      await page.goto('/' + route)
      await expect(page.locator('main h1').first()).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true)
      await page.screenshot({
        path: `artifacts/mobile-${route || 'home'}-${theme}.png`,
        fullPage: false,
        animations: 'disabled',
      })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('http://localhost:3001')
  await expect(page.getByRole('heading', { name: 'YOUR ULTIMATE CS2 COMPANION.' })).toBeVisible()
  await page.screenshot({
    path: 'artifacts/website-desktop.png',
    fullPage: true,
    animations: 'disabled',
  })
})
