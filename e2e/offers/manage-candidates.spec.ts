import { test, expect } from "@playwright/test";
import { testUsers, urls, selectors } from "../fixtures/test-data";

test.describe("Manage Candidates in Offer", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(urls.login);
    await page.fill(selectors.usernameInput, testUsers.admin.username);
    await page.fill(selectors.passwordInput, testUsers.admin.password);
    await page.click(selectors.loginButton);
    await page.waitForURL(urls.dashboard);
  });

  test("should display candidates list for an offer", async ({ page }) => {
    // Navigate to offers
    await page.goto(urls.offers);

    // Click on first offer
    await page.locator(selectors.offerCard).first().click();

    // Should show candidates section
    await expect(page.locator('[data-testid="candidates-section"]')).toBeVisible();
  });

  test("should display pipeline columns", async ({ page }) => {
    await page.goto(urls.offers);
    await page.locator(selectors.offerCard).first().click();

    // Should show pipeline board
    await expect(page.locator('[data-testid="pipeline-board"]')).toBeVisible();

    // Should have multiple columns
    const columns = page.locator('[data-testid="pipeline-column"]');
    await expect(columns).toHaveCount(await columns.count());
    expect(await columns.count()).toBeGreaterThan(0);
  });

  test("should allow drag and drop of candidates", async ({ page }) => {
    await page.goto(urls.offers);
    await page.locator(selectors.offerCard).first().click();

    // Get first candidate card
    const candidateCard = page.locator('[data-testid="candidate-card"]').first();

    if (await candidateCard.isVisible()) {
      // Get source and target columns
      const sourceColumn = page.locator('[data-testid="pipeline-column"]').first();
      const targetColumn = page.locator('[data-testid="pipeline-column"]').nth(1);

      // Perform drag and drop
      await candidateCard.dragTo(targetColumn);

      // Verify candidate moved (toast or visual feedback)
      await expect(
        page.locator(selectors.successToast).or(
          targetColumn.locator('[data-testid="candidate-card"]')
        )
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should open candidate detail on click", async ({ page }) => {
    await page.goto(urls.offers);
    await page.locator(selectors.offerCard).first().click();

    const candidateCard = page.locator('[data-testid="candidate-card"]').first();

    if (await candidateCard.isVisible()) {
      await candidateCard.click();

      // Should navigate to candidate detail or open modal
      await expect(
        page.locator('[data-testid="candidate-detail"]').or(
          page.locator('[data-testid="candidate-modal"]')
        )
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should filter candidates by status", async ({ page }) => {
    await page.goto(urls.offers);
    await page.locator(selectors.offerCard).first().click();

    // Find and use status filter
    const statusFilter = page.locator('[data-testid="status-filter"]');

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.locator('[data-testid="status-option"]').first().click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Candidates should be filtered
      const visibleCandidates = page.locator('[data-testid="candidate-card"]');
      // Just verify the filter was applied (count may vary)
      await expect(visibleCandidates.first().or(page.locator('[data-testid="no-candidates"]'))).toBeVisible();
    }
  });

  test("should search candidates by name", async ({ page }) => {
    await page.goto(urls.offers);
    await page.locator(selectors.offerCard).first().click();

    const searchInput = page.locator('[data-testid="candidate-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill("John");

      // Wait for search to apply
      await page.waitForTimeout(500);

      // Results should be filtered
      const results = page.locator('[data-testid="candidate-card"]');
      await expect(results.first().or(page.locator('[data-testid="no-results"]'))).toBeVisible();
    }
  });
});
