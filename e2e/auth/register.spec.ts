import { test, expect } from "@playwright/test";
import { urls, selectors } from "../fixtures/test-data";

test.describe("Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.register);
  });

  test("should display registration form", async ({ page }) => {
    // Verify registration form elements
    await expect(page.locator('[data-testid="org-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="first-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
  });

  test("should show error for existing email", async ({ page }) => {
    // Fill in form with existing email
    await page.fill('[data-testid="org-name-input"]', "New Company");
    await page.fill('[data-testid="first-name-input"]', "Test");
    await page.fill('[data-testid="last-name-input"]', "User");
    await page.fill('[data-testid="email-input"]', "existing@email.com");
    await page.fill('[data-testid="password-input"]', "Password123!");
    await page.click('[data-testid="register-button"]');

    // Verify error message for duplicate email
    await expect(page.locator(selectors.errorMessage)).toBeVisible();
  });

  test("should validate password requirements", async ({ page }) => {
    // Fill in weak password
    await page.fill('[data-testid="password-input"]', "weak");

    // Blur to trigger validation
    await page.locator('[data-testid="password-input"]').blur();

    // Check for password validation message
    const passwordError = page.locator('[data-testid="password-error"]');
    await expect(passwordError).toBeVisible();
  });

  test("should have link to login page", async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await page.waitForURL(urls.login);
    expect(page.url()).toContain(urls.login);
  });

  test("should register successfully with valid data", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    // Fill in registration form
    await page.fill('[data-testid="org-name-input"]', "Test Company");
    await page.fill('[data-testid="first-name-input"]', "Test");
    await page.fill('[data-testid="last-name-input"]', "User");
    await page.fill('[data-testid="email-input"]', uniqueEmail);
    await page.fill('[data-testid="password-input"]', "SecurePassword123!");

    await page.click('[data-testid="register-button"]');

    // Should show success message or redirect
    await expect(
      page.locator('[data-testid="registration-success"]').or(
        page.locator(selectors.successToast)
      )
    ).toBeVisible({ timeout: 10000 });
  });
});
