import { test as setup, expect } from "@playwright/test";
import { testUsers, urls, selectors } from "./fixtures/test-data";

const authFile = "e2e/.auth/user.json";

/**
 * Setup: Authenticate before running tests
 *
 * This setup project logs in as admin and saves the auth state
 * to be reused by other test projects.
 */
setup("authenticate", async ({ page }) => {
  // Go to login page
  await page.goto(urls.login);

  // Fill in credentials
  await page.fill(selectors.usernameInput, testUsers.admin.username);
  await page.fill(selectors.passwordInput, testUsers.admin.password);

  // Submit login
  await page.click(selectors.loginButton);

  // Wait for navigation to dashboard
  await page.waitForURL(urls.dashboard, { timeout: 30000 });

  // Verify we're logged in
  await expect(page.locator(selectors.sidebar)).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

/**
 * Setup: Authenticate as candidate
 */
setup("authenticate-candidate", async ({ page }) => {
  const candidateAuthFile = "e2e/.auth/candidate.json";

  // Go to candidate login page
  await page.goto("/login-candidate");

  // Fill in credentials
  await page.fill(selectors.usernameInput, testUsers.candidate.username);
  await page.fill(selectors.passwordInput, testUsers.candidate.password);

  // Submit login
  await page.click(selectors.loginButton);

  // Wait for navigation to candidate portal
  await page.waitForURL(urls.candidatePortal, { timeout: 30000 });

  // Save authentication state
  await page.context().storageState({ path: candidateAuthFile });
});
