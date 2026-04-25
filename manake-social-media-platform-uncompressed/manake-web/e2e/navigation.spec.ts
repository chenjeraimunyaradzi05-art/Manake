import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Manake|Home/i);
  });

  test("navigation menu is visible", async ({ page }) => {
    await page.goto("/");
    
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("can navigate to stories page", async ({ page }) => {
    await page.goto("/");
    
    const storiesLink = page.locator('a[href="/stories"]');
    if (await storiesLink.count() > 0) {
      await storiesLink.first().click();
      await expect(page).toHaveURL(/stories/);
    }
  });

  test("can navigate to donate page", async ({ page }) => {
    await page.goto("/");
    
    const donateLink = page.locator('a[href="/donate"]');
    if (await donateLink.count() > 0) {
      await donateLink.first().click();
      await expect(page).toHaveURL(/donate/);
    }
  });

  test("can navigate to about page", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveURL(/about/);
  });

  test("can navigate to contact page", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveURL(/contact/);
  });

  test("can navigate to programs page", async ({ page }) => {
    await page.goto("/programs");
    await expect(page).toHaveURL(/programs/);
  });

  test("can navigate to get help page", async ({ page }) => {
    await page.goto("/get-help");
    await expect(page).toHaveURL(/get-help/);
  });

  test("shows 404 for unknown routes", async ({ page }) => {
    await page.goto("/unknown-page-that-does-not-exist");
    
    // Should show not found content
    const notFound = page.locator('text=404, text=Not Found, text=Page not found');
    await expect(notFound.first()).toBeVisible();
  });
});

test.describe("Responsive Design", () => {
  test("mobile navigation works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger');
    
    if (await menuButton.count() > 0) {
      await menuButton.first().click();
      await page.waitForTimeout(300);
      
      // Menu should be visible
      const mobileNav = page.locator('[role="menu"], .mobile-nav, nav.open');
      await expect(mobileNav.first()).toBeVisible();
    }
  });

  test("content is readable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Main content should be visible and not overflow
    const main = page.locator("main");
    await expect(main).toBeVisible();
    
    const box = await main.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test("desktop sidebar is visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    
    // Desktop should have sidebars visible
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside, .sidebar");
    
    // At least one sidebar should be visible on desktop
    const visibleSidebars = await sidebar.count();
    expect(visibleSidebars).toBeGreaterThan(0);
  });
});

test.describe("Accessibility", () => {
  test("page has main landmark", async ({ page }) => {
    await page.goto("/");
    
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("page has navigation landmark", async ({ page }) => {
    await page.goto("/");
    
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    const imagesWithoutAlt = await page.locator("img:not([alt])").count();
    
    // All images should have alt text (empty string is acceptable for decorative)
    expect(imagesWithoutAlt).toBe(0);
  });

  test("buttons are keyboard accessible", async ({ page }) => {
    await page.goto("/");
    
    const buttons = page.locator("button");
    const count = await buttons.count();
    
    if (count > 0) {
      // First button should be focusable
      await buttons.first().focus();
      await expect(buttons.first()).toBeFocused();
    }
  });

  test("links have visible focus state", async ({ page }) => {
    await page.goto("/");
    
    const links = page.locator("a[href]");
    if (await links.count() > 0) {
      await links.first().focus();
      
      // Link should be focused
      await expect(links.first()).toBeFocused();
    }
  });
});
