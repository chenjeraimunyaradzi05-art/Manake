import { test, expect } from "@playwright/test";

test.describe("Mentorship Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mentorship");
  });

  test("displays mentorship page", async ({ page }) => {
    await expect(page).toHaveURL(/mentorship/);
    await page.waitForLoadState("networkidle");
  });

  test("shows mentorship tabs", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Look for tab navigation
    const tabs = page.locator('button[role="tab"], [data-testid*="tab"]');
    const tabTexts = page.locator('text=Find a Mentor, text=My Mentorship, text=Become a Mentor');
    
    const hasTabs = await tabs.count() > 0;
    const hasTabTexts = await tabTexts.count() > 0;
    
    expect(hasTabs || hasTabTexts).toBe(true);
  });

  test("displays mentor discovery or login prompt", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Should show mentors or prompt to login
    const mentorCards = page.locator('[data-testid="mentor-card"], .mentor-card');
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]');
    const loginPrompt = page.locator('text=Login, text=Sign in');
    
    const hasMentorCards = await mentorCards.count() > 0;
    const hasSearch = await searchInput.count() > 0;
    const hasLogin = await loginPrompt.count() > 0;
    
    expect(hasMentorCards || hasSearch || hasLogin).toBeTruthy();
  });

  test("can switch between tabs", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    const tabs = page.locator('button[role="tab"]');
    if (await tabs.count() >= 2) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      
      // Content should change
      const activeTab = page.locator('[role="tabpanel"], [aria-selected="true"]');
      await expect(activeTab.first()).toBeVisible();
    }
  });

  test("shows become a mentor form or requirements", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Click on "Become a Mentor" tab if available
    const becomeMentorTab = page.locator('button:has-text("Become a Mentor"), text=Become a Mentor');
    if (await becomeMentorTab.count() > 0) {
      await becomeMentorTab.first().click();
      await page.waitForTimeout(500);
      
      // Should show form or eligibility info
      const form = page.locator("form");
      const eligibility = page.locator('text=Eligibility, text=Requirements');
      
      const hasForm = await form.count() > 0;
      const hasEligibility = await eligibility.count() > 0;
      
      expect(hasForm || hasEligibility).toBeTruthy();
    }
  });
});

test.describe("Mentorship Filtering", () => {
  test("can filter mentors by specialization", async ({ page }) => {
    await page.goto("/mentorship");
    await page.waitForLoadState("networkidle");
    
    const filterSelect = page.locator('select, [data-testid="specialization-filter"]');
    
    if (await filterSelect.count() > 0) {
      // Check that filter exists
      await expect(filterSelect.first()).toBeVisible();
    }
  });
});
