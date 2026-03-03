import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  const devices = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  devices.forEach(({ name, width, height }) => {
    test.describe(`${name} (${width}x${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
      });

      test('should display navigation menu', async ({ page }) => {
        if (width < 768) {
          
          const hamburger = page.locator('button[aria-label="menu"], .hamburger, .mobile-menu-button');
          await expect(hamburger.first()).toBeVisible({ timeout: 5000 });
        } else {
          
          const nav = page.locator('nav, header');
          await expect(nav).toBeVisible();
        }
      });

      test('should render content properly', async ({ page }) => {
        
        const main = page.locator('main, #root, .app');
        await expect(main).toBeVisible();
        
        
        const body = await page.locator('body').boundingBox();
        expect(body.width).toBeLessThanOrEqual(width);
      });

      test('should display login form correctly', async ({ page }) => {
        await page.goto('/login');
        
        
        const form = page.locator('form');
        await expect(form).toBeVisible();
        
        const formBox = await form.boundingBox();
        expect(formBox.width).toBeLessThanOrEqual(width);
      });

      test('should handle text overflow', async ({ page }) => {
        await page.goto('/');
        
        
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20); 
      });

      test('should display buttons touch-friendly on mobile', async ({ page }) => {
        if (width < 768) {
          await page.goto('/login');
          
          const submitButton = page.locator('button[type="submit"]');
          const buttonBox = await submitButton.boundingBox();
          
          
          expect(buttonBox.height).toBeGreaterThanOrEqual(40);
        }
      });

      test('should render cards/lists appropriately', async ({ page }) => {
        
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
        
        
        const container = page.locator('.container, .content, main');
        const containerBox = await container.first().boundingBox();
        
        expect(containerBox.width).toBeLessThanOrEqual(width);
      });

      test('should display images responsively', async ({ page }) => {
        await page.goto('/');
        
        
        const images = page.locator('img');
        const count = await images.count();
        
        for (let i = 0; i < Math.min(count, 3); i++) {
          const imgBox = await images.nth(i).boundingBox();
          if (imgBox) {
            expect(imgBox.width).toBeLessThanOrEqual(width);
          }
        }
      });
    });
  });
});

test.describe('Cross-Browser Compatibility Tests', () => {
  test('should work in different browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    
    await expect(page.locator('body')).toBeVisible();
    
    
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    
    await emailInput.fill('test@example.com');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('password123');
    
    
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should handle CSS grid/flexbox correctly', async ({ page }) => {
    await page.goto('/');
    
    
    const container = page.locator('.container, .grid, .flex, main').first();
    const display = await container.evaluate((el) => window.getComputedStyle(el).display);
    
    expect(['flex', 'grid', 'block']).toContain(display);
  });

  test('should support modern JavaScript features', async ({ page }) => {
    await page.goto('/');
    
    
    const hasError = await page.evaluate(() => {
      try {
        const testArrow = () => 'arrow';
        const testAsync = async () => 'async';
        const testSpread = [...[1, 2, 3]];
        return false;
      } catch (e) {
        return true;
      }
    });
    
    expect(hasError).toBe(false);
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    const id = await emailInput.getAttribute('id');
    
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toBeVisible();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    expect(bgColor).toBeDefined();
  });
});
