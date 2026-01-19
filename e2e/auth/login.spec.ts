import { test, expect } from "@playwright/test";
import { testUsers, urls, selectors } from "../fixtures/test-data";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.login);
  });

  test("should display login form", async ({ page }) => {
    // Verify login form elements are visible
    await expect(page.locator(selectors.usernameInput)).toBeVisible();
    await expect(page.locator(selectors.passwordInput)).toBeVisible();
    await expect(page.locator(selectors.loginButton)).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    // Fill in invalid credentials
    await page.fill(selectors.usernameInput, "invalid@email.com");
    await page.fill(selectors.passwordInput, "wrongpassword");
    await page.click(selectors.loginButton);

    // Verify error message
    await expect(page.locator(selectors.errorMessage)).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    const { username, password } = testUsers.admin;

    // Fill in valid credentials
    await page.fill(selectors.usernameInput, username);
    await page.fill(selectors.passwordInput, password);
    await page.click(selectors.loginButton);

    // Wait for navigation to dashboard
    await page.waitForURL(urls.dashboard);

    // Verify we're on the dashboard
    expect(page.url()).toContain(urls.dashboard);
  });

  test("should redirect to dashboard if already logged in", async ({ page }) => {
    // First login
    const { username, password } = testUsers.admin;
    await page.fill(selectors.usernameInput, username);
    await page.fill(selectors.passwordInput, password);
    await page.click(selectors.loginButton);
    await page.waitForURL(urls.dashboard);

    // Try to access login page again
    await page.goto(urls.login);

    // Should redirect back to dashboard
    await page.waitForURL(urls.dashboard);
    expect(page.url()).toContain(urls.dashboard);
  });

  test("should validate required fields", async ({ page }) => {
    // Try to submit empty form
    await page.click(selectors.loginButton);

    // Check for validation messages
    const usernameInput = page.locator(selectors.usernameInput);
    const passwordInput = page.locator(selectors.passwordInput);

    // HTML5 validation or custom validation should show
    await expect(usernameInput).toHaveAttribute("required", "");
    await expect(passwordInput).toHaveAttribute("required", "");
  });
});
