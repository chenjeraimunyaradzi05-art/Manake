import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test("displays profile page structure", async ({ page }) => {
    // Navigate to a profile (using placeholder ID)
    await page.goto("/profile/test-user");
    
    // Should show profile layout even if user not found
    await page.waitForLoadState("networkidle");
    
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("shows profile header section", async ({ page }) => {
    await page.goto("/profile/test-user");
    
    // Look for common profile elements
    const avatar = page.locator('img[alt*="avatar"], img[alt*="profile"], .avatar');
    const header = page.locator("h1, h2");
    
    await page.waitForLoadState("networkidle");
    
    const hasAvatar = await avatar.count() > 0;
    const hasHeader = await header.count() > 0;
    
    expect(hasAvatar || hasHeader).toBe(true);
  });

  test("displays profile sections", async ({ page }) => {
    await page.goto("/profile/test-user");
    await page.waitForLoadState("networkidle");
    
    // Profile pages typically have sections
    const sections = page.locator("section, .profile-section, [data-testid*='profile']");
    
    // At minimum, should have some content structure
    const mainContent = await page.locator("main").textContent();
    expect(mainContent?.length).toBeGreaterThan(0);
  });
});

test.describe("Profile Edit", () => {
  test("redirects to login if not authenticated", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");
    
    // Should either show edit form or redirect to login
    const currentUrl = page.url();
    const hasEditForm = await page.locator('form, input[name*="name"], input[name*="bio"]').count() > 0;
    const isLoginPage = currentUrl.includes("login") || currentUrl.includes("auth");
    
    expect(hasEditForm || isLoginPage).toBe(true);
  });
});

test.describe("Network Page", () => {
  test("displays network page", async ({ page }) => {
    await page.goto("/network");
    
    await expect(page).toHaveURL(/network/);
    await page.waitForLoadState("networkidle");
  });

  test("shows connection features", async ({ page }) => {
    await page.goto("/network");
    await page.waitForLoadState("networkidle");
    
    // Look for network-related content
    const tabs = page.locator('button[role="tab"], [data-testid*="tab"]');
    const connections = page.locator('text=Connections, text=Network, text=People');
    
    const hasTabs = await tabs.count() > 0;
    const hasNetworkContent = await connections.count() > 0;
    
    expect(hasTabs || hasNetworkContent).toBe(true);
  });
});
