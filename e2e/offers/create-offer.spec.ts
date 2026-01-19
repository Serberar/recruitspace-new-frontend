import { test, expect } from "@playwright/test";
import { testUsers, testJobOffer, urls, selectors } from "../fixtures/test-data";

test.describe("Create Job Offer", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(urls.login);
    await page.fill(selectors.usernameInput, testUsers.admin.username);
    await page.fill(selectors.passwordInput, testUsers.admin.password);
    await page.click(selectors.loginButton);
    await page.waitForURL(urls.dashboard);

    // Navigate to offers
    await page.goto(urls.offers);
  });

  test("should display create offer button", async ({ page }) => {
    await expect(page.locator(selectors.createOfferButton)).toBeVisible();
  });

  test("should open create offer modal", async ({ page }) => {
    await page.click(selectors.createOfferButton);
    await expect(page.locator(selectors.offerForm)).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.click(selectors.createOfferButton);
    await expect(page.locator(selectors.offerForm)).toBeVisible();

    // Try to submit empty form
    await page.click('[data-testid="submit-offer-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
  });

  test("should create offer successfully", async ({ page }) => {
    await page.click(selectors.createOfferButton);
    await expect(page.locator(selectors.offerForm)).toBeVisible();

    // Fill in offer form
    await page.fill('[data-testid="title-input"]', testJobOffer.title);
    await page.fill('[data-testid="description-input"]', testJobOffer.description);
    await page.selectOption('[data-testid="category-select"]', testJobOffer.category);
    await page.fill('[data-testid="location-input"]', testJobOffer.location);
    await page.selectOption('[data-testid="contract-type-select"]', testJobOffer.contractType);
    await page.selectOption('[data-testid="modality-select"]', testJobOffer.modality);

    // Set public checkbox
    if (testJobOffer.isPublic) {
      await page.check('[data-testid="is-public-checkbox"]');
    }

    // Submit form
    await page.click('[data-testid="submit-offer-button"]');

    // Should show success message
    await expect(page.locator(selectors.successToast)).toBeVisible({ timeout: 10000 });

    // Modal should close
    await expect(page.locator(selectors.offerForm)).not.toBeVisible();

    // New offer should appear in list
    await expect(page.locator(`text=${testJobOffer.title}`)).toBeVisible();
  });

  test("should close modal on cancel", async ({ page }) => {
    await page.click(selectors.createOfferButton);
    await expect(page.locator(selectors.offerForm)).toBeVisible();

    // Click cancel button
    await page.click('[data-testid="cancel-button"]');

    // Modal should close
    await expect(page.locator(selectors.offerForm)).not.toBeVisible();
  });

  test("should close modal on outside click", async ({ page }) => {
    await page.click(selectors.createOfferButton);
    await expect(page.locator(selectors.offerForm)).toBeVisible();

    // Click outside modal (on backdrop)
    await page.click('[data-testid="modal-backdrop"]');

    // Modal should close
    await expect(page.locator(selectors.offerForm)).not.toBeVisible();
  });
});
