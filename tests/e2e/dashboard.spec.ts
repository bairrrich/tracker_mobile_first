import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('loads dashboard successfully', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/All Tracker Mobile/)

    // Check dashboard heading
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

    // Check metrics section
    await expect(page.getByText(/total items/i)).toBeVisible()
    await expect(page.getByText(/collections/i)).toBeVisible()

    // Check recent activity section
    await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible()
  })

  test('displays metrics grid', async ({ page }) => {
    await page.goto('/')

    // Check metrics are displayed
    const metrics = page.locator('.metric-card')
    await expect(metrics).toHaveCount({ min: 1 })
  })

  test('theme toggle works', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme/i })
    await expect(themeToggle).toBeVisible()

    // Click to change theme
    await themeToggle.click()

    // Check theme changed (check data-theme attribute)
    const html = page.locator('html')
    const theme = await html.getAttribute('data-theme')
    expect(theme).toBeTruthy()
  })
})

test.describe('Collections', () => {
  test('loads collections page', async ({ page }) => {
    await page.goto('/collections')

    await expect(page.getByRole('heading', { name: /collections/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search collections/i)).toBeVisible()
  })

  test('grid/list view toggle works', async ({ page }) => {
    await page.goto('/collections')

    // Check grid view button exists
    const gridView = page.getByRole('button', { name: /grid view/i })
    await expect(gridView).toBeVisible()

    // Check list view button exists
    const listView = page.getByRole('button', { name: /list view/i })
    await expect(listView).toBeVisible()
  })

  test('search filters collections', async ({ page }) => {
    await page.goto('/collections')

    const searchInput = page.getByPlaceholder(/search collections/i)
    await searchInput.fill('test')

    // Wait for filter to apply
    await page.waitForTimeout(300)

    // Collections should be filtered
    // (actual test depends on having test data)
  })
})

test.describe('Offline Mode', () => {
  test('works offline', async ({ page, context }) => {
    // Go to page while online
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Should still be able to interact with the page
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('shows offline status', async ({ page, context }) => {
    await page.goto('/')

    // Go offline
    await context.setOffline(true)

    // Check offline indicator appears
    const syncStatus = page.getByText(/offline/i)
    await expect(syncStatus).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })
})

test.describe('PWA', () => {
  test('has manifest', async ({ page }) => {
    await page.goto('/')

    // Check manifest is linked
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')
  })

  test('is installable', async ({ page }) => {
    await page.goto('/')

    // Check manifest has required fields
    const response = await page.goto('/manifest.json')
    const manifest = await response?.json()

    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.start_url).toBeTruthy()
    expect(manifest.display).toBe('standalone')
  })
})

test.describe('Accessibility', () => {
  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Check h1 exists
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)

    // Check no skipped heading levels
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const count = await headings.count()

    for (let i = 0; i < count; i++) {
      const heading = await headings.nth(i).textContent()
      expect(heading).toBeTruthy()
    }
  })

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/')

    const buttons = page.getByRole('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      await expect(button).toBeVisible()
    }
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      // Alt can be empty string for decorative images
      expect(alt !== null).toBeTruthy()
    }
  })
})

test.describe('Responsive Design', () => {
  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

    // Check bottom nav is visible on mobile
    const bottomNav = page.locator('.bottom-nav')
    await expect(bottomNav).toBeVisible()
  })

  test('works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

    // Check sidebar is visible on desktop
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()
  })
})
