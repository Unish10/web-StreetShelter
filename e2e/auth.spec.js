import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/StreetShelter/i);
    await expect(page.locator('h1')).toContainText(/StreetShelter/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText(/Sign In/i);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Register');
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('h2')).toContainText(/Sign Up/i);
  });

  test('should show validation errors on empty login form submission', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
    await expect(page.locator('text=/password.*required/i')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid.*email/i')).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    const randomEmail = `test${Date.now()}@example.com`;
    const randomUsername = `user${Date.now()}`;
    
    await page.fill('input[name="username"]', randomUsername);
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    await page.click('button[type="submit"]');
    
    
    await expect(page).toHaveURL(/\/(home|dashboard)/);
  });

  test('should login with valid credentials', async ({ page }) => {
    
    await page.goto('/register');
    
    const email = `test${Date.now()}@example.com`;
    const username = `user${Date.now()}`;
    const password = 'Password123!';
    
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    
    
    await page.waitForURL(/\/(home|dashboard)/);
    
    
    await page.click('text=/logout/i');
    
    
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    
    await expect(page).toHaveURL(/\/(home|dashboard)/);
  });

  test('should show error for incorrect password', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button:has-text("Show")');
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=/forgot password/i');
    
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('should logout successfully', async ({ page, context }) => {
    
    await page.goto('/register');
    
    const email = `test${Date.now()}@example.com`;
    const username = `user${Date.now()}`;
    const password = 'Password123!';
    
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(home|dashboard)/);
    
    
    await page.click('text=/logout/i');
    
    
    await expect(page).toHaveURL(/\/(|login)/);
    
    
    const isAuthenticated = await page.evaluate(() => localStorage.getItem('isAuthenticated'));
    expect(isAuthenticated).toBeNull();
  });
});
