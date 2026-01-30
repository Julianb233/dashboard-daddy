import { test, expect } from '@playwright/test'

test.describe('Dashboard Daddy', () => {
  test('homepage loads and displays dashboard', async ({ page }) => {
    await page.goto('/')

    // Check for main dashboard title
    await expect(page.getByText('Welcome back, Julian!')).toBeVisible()
    await expect(page.getByText('AI Agent Command Center')).toBeVisible()

    // Check for stats cards
    await expect(page.getByText('Active Agents')).toBeVisible()
    await expect(page.getByText('Messages Today')).toBeVisible()
    await expect(page.getByText('Tasks Completed')).toBeVisible()
    await expect(page.getByText('Pending Approvals')).toBeVisible()
    await expect(page.getByText('Tokens Used')).toBeVisible()
    await expect(page.getByText('Monthly Cost')).toBeVisible()

    // Check for activity chart
    await expect(page.getByText('Activity Timeline')).toBeVisible()

    // Check for recent activity section
    await expect(page.getByText('Recent Activity')).toBeVisible()
  })

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/')

    // Test sidebar navigation
    await page.getByText('Kanban').click()
    await expect(page.url()).toContain('/kanban')
    await expect(page.getByText('Project Kanban Board')).toBeVisible()

    // Navigate to agents
    await page.getByText('Agents').click()
    await expect(page.url()).toContain('/agents')

    // Navigate to terminal
    await page.getByText('Terminal').click()
    await expect(page.url()).toContain('/terminal')
    await expect(page.getByText('Live Agent Terminal')).toBeVisible()

    // Navigate to messaging
    await page.getByText('Messaging').click()
    await expect(page.url()).toContain('/messaging')
    await expect(page.getByText('Agent Messaging')).toBeVisible()
  })

  test('kanban board functionality', async ({ page }) => {
    await page.goto('/kanban')

    // Check for kanban columns
    await expect(page.getByText('To Do')).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()

    // Check for add new card button
    await expect(page.getByText('Add New Card')).toBeVisible()
  })

  test('terminal displays active sessions', async ({ page }) => {
    await page.goto('/terminal')

    // Check for terminal interface
    await expect(page.getByText('Live Agent Terminal')).toBeVisible()
    await expect(page.getByText('Active Sessions')).toBeVisible()
    
    // Should show connection status
    await expect(page.locator('text=Connected').or(page.locator('text=Disconnected'))).toBeVisible()

    // Should display session stats
    await expect(page.getByText('Connected Sessions')).toBeVisible()
    await expect(page.getByText('Active Commands')).toBeVisible()
    await expect(page.getByText('Lines Processed')).toBeVisible()
    await expect(page.getByText('Uptime')).toBeVisible()
  })

  test('messaging interface works', async ({ page }) => {
    await page.goto('/messaging')

    // Check for agent list
    await expect(page.getByText('Available Agents')).toBeVisible()
    
    // Should show some agents
    await expect(page.getByText('Quinn')).toBeVisible()
    await expect(page.getByText('Sam')).toBeVisible()

    // Check for message input
    await expect(page.locator('input[placeholder*="Message"]')).toBeVisible()
  })

  test('mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
    await page.goto('/')

    // Dashboard should still be accessible on mobile
    await expect(page.getByText('Welcome back, Julian!')).toBeVisible()
    
    // Stats should stack vertically on mobile
    await expect(page.getByText('Active Agents')).toBeVisible()
    
    // Sidebar should be collapsible/responsive
    // Note: Specific mobile menu behavior would depend on implementation
  })

  test('no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known harmless errors (like missing favicon)
    const significantErrors = consoleErrors.filter(
      error => !error.includes('favicon') && 
               !error.includes('robots.txt') &&
               !error.includes('manifest.json')
    )

    expect(significantErrors).toEqual([])
  })

  test('performance - page loads quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})