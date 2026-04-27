import { test, expect } from '@playwright/test';

test.describe('GitHub Trending Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with title and repos', async ({ page }) => {
    await expect(page).toHaveTitle(/GitHub Trending/);
    await expect(page.locator('h1')).toContainText('GitHub Trending');

    // Wait for repos to render (either from SSR or client fetch)
    const cards = page.locator('a[href*="github.com"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('time range tabs are visible and clickable', async ({ page }) => {
    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();

    await expect(page.getByRole('tab', { name: '7 Days' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '2 Weeks' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '3 Weeks' })).toBeVisible();

    // Default selection is 7 Days
    await expect(page.getByRole('tab', { name: '7 Days' })).toHaveAttribute('aria-selected', 'true');
  });

  test('switching time range loads new repos', async ({ page }) => {
    // Wait for initial load
    const cards = page.locator('a[href*="github.com"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Click 2 Weeks tab
    await page.getByRole('tab', { name: '2 Weeks' }).click();

    // Tab should become selected
    await expect(page.getByRole('tab', { name: '2 Weeks' })).toHaveAttribute('aria-selected', 'true');

    // Repos should still be visible after load
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('search filters repos', async ({ page }) => {
    // Wait for repos
    const cards = page.locator('a[href*="github.com"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const initialCount = await cards.count();

    // Type a search that likely won't match all repos
    const searchInput = page.getByLabel('Search repositories');
    await searchInput.fill('zzzznonexistent');

    // Should show "No repositories found" or fewer results
    await expect(page.getByText('No repositories found')).toBeVisible({ timeout: 5000 });

    // Clear search
    await searchInput.clear();

    // Repos should reappear
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
  });

  test('sort dropdown changes order', async ({ page }) => {
    // Wait for repos
    await expect(page.locator('a[href*="github.com"]').first()).toBeVisible({ timeout: 10000 });

    const sortSelect = page.getByLabel('Sort by');
    await expect(sortSelect).toBeVisible();

    // Change to forks
    await sortSelect.selectOption('forks');
    await expect(sortSelect).toHaveValue('forks');

    // Change to created
    await sortSelect.selectOption('created');
    await expect(sortSelect).toHaveValue('created');
  });

  test('language filter works', async ({ page }) => {
    // Wait for repos
    await expect(page.locator('a[href*="github.com"]').first()).toBeVisible({ timeout: 10000 });

    const langSelect = page.getByLabel('Filter by language');
    await expect(langSelect).toBeVisible();

    // "All Languages" should be selected by default
    await expect(langSelect).toHaveValue('all');

    // Get available options
    const options = langSelect.locator('option');
    const optionCount = await options.count();

    // Should have at least "All Languages" + 1 language
    expect(optionCount).toBeGreaterThan(1);
  });

  test('theme toggle switches between dark and light', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.getByLabel(/Switch to .* mode/);
    await expect(themeToggle).toBeVisible();

    // Get initial theme class on html
    const initialClass = await page.locator('html').getAttribute('class');

    // Click toggle
    await themeToggle.click();

    // Class should change
    const newClass = await page.locator('html').getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('refresh button fetches new data', async ({ page }) => {
    // Wait for repos
    await expect(page.locator('a[href*="github.com"]').first()).toBeVisible({ timeout: 10000 });

    const refreshBtn = page.getByLabel('Refresh data');
    await expect(refreshBtn).toBeVisible();

    // Click refresh
    await refreshBtn.click();

    // Should still show repos after refresh
    await expect(page.locator('a[href*="github.com"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('repo cards have correct structure', async ({ page }) => {
    // Wait for repos
    const firstCard = page.locator('a[href*="github.com"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Card should open in new tab
    await expect(firstCard).toHaveAttribute('target', '_blank');
    await expect(firstCard).toHaveAttribute('rel', 'noopener noreferrer');

    // Should contain a heading (repo name)
    await expect(firstCard.locator('h3')).toBeVisible();

    // Should contain star count
    await expect(firstCard.locator('[title="Stars"]')).toBeVisible();

    // Should contain fork count
    await expect(firstCard.locator('[title="Forks"]')).toBeVisible();
  });
});
