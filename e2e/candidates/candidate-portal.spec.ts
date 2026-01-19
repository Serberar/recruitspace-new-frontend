import { test, expect } from "@playwright/test";
import { testUsers, urls, selectors } from "../fixtures/test-data";

test.describe("Candidate Portal", () => {
  test.beforeEach(async ({ page }) => {
    // Login as candidate
    await page.goto("/login-candidate");
    await page.fill(selectors.usernameInput, testUsers.candidate.username);
    await page.fill(selectors.passwordInput, testUsers.candidate.password);
    await page.click(selectors.loginButton);
    await page.waitForURL(urls.candidatePortal);
  });

  test("should display candidate dashboard", async ({ page }) => {
    await expect(page.locator('[data-testid="candidate-dashboard"]')).toBeVisible();
  });

  test("should display candidate name", async ({ page }) => {
    const welcomeMessage = page.locator('[data-testid="welcome-message"]');
    await expect(welcomeMessage).toContainText(testUsers.candidate.firstName);
  });

  test("should show active processes", async ({ page }) => {
    await expect(page.locator('[data-testid="processes-section"]')).toBeVisible();
  });

  test("should navigate to profile", async ({ page }) => {
    await page.click('[data-testid="profile-link"]');
    await page.waitForURL(urls.candidateProfile);
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
  });

  test("should update profile", async ({ page }) => {
    await page.goto(urls.candidateProfile);

    // Update phone number
    const phoneInput = page.locator('[data-testid="phone-input"]');
    await phoneInput.fill("+34 600 111 222");

    // Save changes
    await page.click('[data-testid="save-profile-button"]');

    // Should show success message
    await expect(page.locator(selectors.successToast)).toBeVisible();
  });

  test("should upload CV", async ({ page }) => {
    await page.goto(urls.candidateProfile);

    // Find CV upload section
    const cvUpload = page.locator('[data-testid="cv-upload"]');

    if (await cvUpload.isVisible()) {
      // Create a test file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "test-cv.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("PDF content"),
      });

      // Should show upload progress or success
      await expect(
        page.locator('[data-testid="upload-progress"]').or(
          page.locator(selectors.successToast)
        )
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should view process detail", async ({ page }) => {
    const processCard = page.locator('[data-testid="process-card"]').first();

    if (await processCard.isVisible()) {
      await processCard.click();

      // Should show process detail
      await expect(page.locator('[data-testid="process-detail"]')).toBeVisible();
    }
  });

  test("should logout successfully", async ({ page }) => {
    // Open user menu
    await page.click(selectors.userMenu);

    // Click logout
    await page.click(selectors.logoutButton);

    // Should redirect to login
    await page.waitForURL(/login/);
  });
});
