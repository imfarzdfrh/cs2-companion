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


test('saved demo starts instantly without requesting the backend', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cs2-demo', 'true'))
  let apiRequests = 0
  await page.route('**/v1/**', async (route) => {
    apiRequests += 1
    await route.abort()
  })
  await page.goto('/')
  await expect(page.getByText('DEMO MODE · SAMPLE DATA')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Player/ })).toBeVisible()
  expect(apiRequests).toBe(0)
})

test('an unreachable API sends a fresh visitor to welcome and demo still works', async ({ page }) => {
  await page.route('**/v1/me', (route) => route.abort())
  await page.goto('/stats')
  await expect(page.getByRole('heading', { name: /Your stats/ })).toBeVisible()
  await expect(page.getByText(/API server could not be reached/)).toBeVisible()
  await page.getByRole('button', { name: 'Explore demo' }).click()
  await expect(page.getByText('DEMO MODE · SAMPLE DATA')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Player/ })).toBeVisible()
})

test('phone layout stays within 320–430px and bottom navigation is viewport-fixed', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cs2-demo', 'true'))
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await expect(page.locator('.bottom-nav')).toBeVisible()
    const metrics = await page.evaluate(() => {
      const nav = document.querySelector('.bottom-nav')
      const rect = nav?.getBoundingClientRect()
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        position: nav ? getComputedStyle(nav).position : '',
        left: rect?.left ?? -1,
        right: rect?.right ?? Number.POSITIVE_INFINITY,
        width: rect?.width ?? 0,
      }
    })
    expect(metrics.document).toBeLessThanOrEqual(metrics.viewport)
    expect(metrics.position).toBe('fixed')
    expect(metrics.left).toBeGreaterThanOrEqual(0)
    expect(metrics.right).toBeLessThanOrEqual(metrics.viewport + 1)
    expect(metrics.width).toBeLessThanOrEqual(metrics.viewport + 1)
  }
})

test('welcome content remains reachable on short phone screens', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cs2-demo', 'true'))
  for (const size of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size)
    await page.goto('/welcome')
    await expect(page.getByRole('link', { name: /Continue with Steam/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Explore demo' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
})

test('inventory preview modal remains fixed to the viewport while the page animates', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cs2-demo', 'true'))
  await page.goto('/inventory')
  await page.getByRole('button', { name: 'View illustration' }).click()
  const bounds = await page.locator('.modal-backdrop').evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { position: getComputedStyle(element).position, left: rect.left, width: rect.width }
  })
  expect(bounds.position).toBe('fixed')
  expect(bounds.left).toBe(0)
  expect(bounds.width).toBeGreaterThanOrEqual(320)
})

test('corrupt local preferences do not break the profile screen', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cs2-demo', 'true')
    localStorage.setItem('cs2-preferences', '{invalid')
  })
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Sound' })).toBeChecked()
})
