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

test('website mobile navigation opens, closes and follows anchor links', async ({ page }) => {
  await page.goto('http://localhost:3001')
  const toggle = page.getByRole('button', { name: 'Open navigation' })
  await toggle.click()
  const nav = page.getByRole('navigation', { name: 'Site navigation' })
  await expect(nav).toBeVisible()
  await nav.getByRole('link', { name: 'FAQ' }).click()
  await expect(nav).toBeHidden()
  await expect(page).toHaveURL(/#faq$/)
})

test('invalid demo preferences do not crash the profile page', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cs2-demo', 'true')
    localStorage.setItem('cs2-preferences', '{invalid')
  })
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Sound' })).toBeChecked()
})

test('offline demo boots without any API request after a phone reload', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cs2-demo', 'true'))
  let requests = 0
  await page.route('**/v1/**', async (route) => {
    requests++
    await route.abort()
  })
  await page.goto('/')
  await expect(page.getByText('DEMO MODE · SAMPLE DATA')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Player/ })).toBeVisible()
  await page.reload()
  await expect(page.getByText('DEMO MODE · SAMPLE DATA')).toBeVisible()
  expect(requests).toBe(0)
})

test('offline first launch offers demo instead of a stuck dashboard', async ({ page }) => {
  await page.route('**/v1/me', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Explore demo' })).toBeVisible()
  await page.getByRole('button', { name: 'Explore demo' }).click()
  await expect(page.getByText('DEMO MODE · SAMPLE DATA')).toBeVisible()
})

test('inventory preview modal stays fixed to the phone viewport', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cs2-demo', 'true'))
  await page.goto('/inventory')
  await page.getByRole('button', { name: 'View illustration' }).click()
  const rect = await page.locator('.modal-backdrop').evaluate((el) => {
    const box = el.getBoundingClientRect()
    return { width: box.width, x: box.x, position: getComputedStyle(el).position }
  })
  expect(rect.position).toBe('fixed')
  expect(rect.x).toBe(0)
  expect(rect.width).toBeGreaterThan(320)
})
