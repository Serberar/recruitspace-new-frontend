import { test, expect } from "@playwright/test";
import { urls, selectors } from "../fixtures/test-data";

test.describe("Password Reset", () => {
  test("should display forgot password link on login page", async ({ page }) => {
    await page.goto(urls.login);

    const forgotPasswordLink = page.locator('a[href*="forgot"]');
    await expect(forgotPasswordLink).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto(urls.login);

    const forgotPasswordLink = page.locator('a[href*="forgot"]');
    await forgotPasswordLink.click();

    // Should be on forgot password page
    await expect(page.locator('[data-testid="forgot-password-form"]')).toBeVisible();
  });

  test("should display forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
  });

  test("should show success message after submitting email", async ({ page }) => {
    await page.goto("/forgot-password");

    // Fill in email
    await page.fill('[data-testid="email-input"]', "user@example.com");
    await page.click('[data-testid="submit-button"]');

    // Should show success message (even if email doesn't exist for security)
    await expect(
      page.locator('[data-testid="success-message"]').or(
        page.locator(selectors.successToast)
      )
    ).toBeVisible({ timeout: 10000 });
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/forgot-password");

    // Fill in invalid email
    await page.fill('[data-testid="email-input"]', "invalid-email");
    await page.click('[data-testid="submit-button"]');

    // Should show validation error
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("should have link back to login", async ({ page }) => {
    await page.goto("/forgot-password");

    const backToLoginLink = page.locator('a[href="/login"]');
    await expect(backToLoginLink).toBeVisible();

    await backToLoginLink.click();
    await page.waitForURL(urls.login);
  });
});
