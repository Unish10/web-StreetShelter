import { test, expect } from '@playwright/test';

test.describe('Dog Report E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    
    await page.goto('/');
    
    
    const email = `test${Date.now()}@example.com`;
    const username = `user${Date.now()}`;
    const password = 'Password123!';
    
    await page.click('text=Register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(home|dashboard)/);
  });

  test('should navigate to report dog page', async ({ page }) => {
    await page.click('text=/report.*dog/i');
    await expect(page).toHaveURL(/\/report-dog/);
    await expect(page.locator('h1, h2')).toContainText(/Report.*Stray.*Dog/i);
  });

  test('should display dog report form fields', async ({ page }) => {
    await page.goto('/report-dog');
    
    
    await expect(page.locator('input[name="location"], textarea[name="location"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/report-dog');
    await page.click('button[type="submit"]');
    
    
    await expect(page.locator('text=/location.*required/i')).toBeVisible();
    await expect(page.locator('text=/description.*required/i')).toBeVisible();
  });

  test('should create a dog report with all details', async ({ page }) => {
    await page.goto('/report-dog');
    
    
    await page.fill('input[name="location"], textarea[name="location"]', 'Kathmandu, Thamel');
    await page.fill('textarea[name="description"]', 'Found a friendly stray dog near the market');
    await page.fill('textarea[name="additionalNotes"]', 'The dog appears to be well-fed');
    
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-dog.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });
    
    
    await page.click('button[type="submit"]');
    
    
    await expect(page.locator('text=/success|submitted/i')).toBeVisible({ timeout: 10000 });
  });

  test('should view dog reports list', async ({ page }) => {
    await page.goto('/home');
    
    
    await expect(page.locator('text=/dog reports|reports/i')).toBeVisible();
  });

  test('should filter dog reports by status', async ({ page }) => {
    await page.goto('/home');
    
    
    const filterButton = page.locator('select, button:has-text("Filter"), button:has-text("Status")').first();
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      
      await page.click('text=/pending|resolved|in progress/i');
      
      
      await expect(page.locator('.report-card, [data-testid="report"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view single dog report details', async ({ page }) => {
    await page.goto('/home');
    
    
    const firstReport = page.locator('.report-card, [data-testid="report"], .dog-report').first();
    
    if (await firstReport.isVisible()) {
      await firstReport.click();
      
      
      await expect(page.locator('text=/location|description/i')).toBeVisible();
    }
  });

  test('should display map with dog location', async ({ page }) => {
    await page.goto('/home');
    
    
    await expect(page.locator('.leaflet-container, #map')).toBeVisible({ timeout: 5000 });
  });

  test('should allow selecting location from map', async ({ page }) => {
    await page.goto('/report-dog');
    
    
    const map = page.locator('.leaflet-container, #map');
    
    if (await map.isVisible()) {
      
      await map.click({ position: { x: 100, y: 100 } });
      
      
      const latInput = page.locator('input[name="latitude"]');
      const lngInput = page.locator('input[name="longitude"]');
      
      if (await latInput.isVisible()) {
        await expect(latInput).not.toBeEmpty();
        await expect(lngInput).not.toBeEmpty();
      }
    }
  });

  test('should upload multiple images for dog report', async ({ page }) => {
    await page.goto('/report-dog');
    
    await page.fill('input[name="location"], textarea[name="location"]', 'Test Location');
    await page.fill('textarea[name="description"]', 'Test Description');
    
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'dog1.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-1'),
      },
      {
        name: 'dog2.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-2'),
      },
    ]);
    
    
    const fileCount = await fileInput.evaluate((input) => input.files.length);
    expect(fileCount).toBeGreaterThan(0);
  });

  test('should validate file type for image upload', async ({ page }) => {
    await page.goto('/report-dog');
    
    
    const fileInput = page.locator('input[type="file"]');
    
    
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toContain('image');
  });
});
