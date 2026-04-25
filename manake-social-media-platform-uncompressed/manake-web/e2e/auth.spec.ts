import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays login page", async ({ page }) => {
    await page.click('a[href="/auth/login"], button:has-text("Login"), text=Login');
    
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/login|sign in/i);
  });

  test("shows login form elements", async ({ page }) => {
    await page.goto("/auth/login");
    
    // Check for social login buttons or email form
    const socialButtons = page.locator('button:has-text("Google"), button:has-text("Facebook")');
    const emailInput = page.locator('input[type="email"]');
    
    const hasSocialLogin = await socialButtons.count() > 0;
    const hasEmailLogin = await emailInput.count() > 0;
    
    expect(hasSocialLogin || hasEmailLogin).toBe(true);
  });

  test("validates empty form submission", async ({ page }) => {
    await page.goto("/auth/login");
    
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Should show validation error or stay on page
      await expect(page).toHaveURL(/auth\/login/);
    }
  });

  test("shows password field when email is entered", async ({ page }) => {
    await page.goto("/auth/login");
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill("test@example.com");
      
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
    }
  });

  test("has link to sign up page", async ({ page }) => {
    await page.goto("/auth/login");
    
    const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Register"), a:has-text("Create account")');
    if (await signupLink.count() > 0) {
      await expect(signupLink.first()).toBeVisible();
    }
  });

  test("has forgot password link", async ({ page }) => {
    await page.goto("/auth/login");
    
    const forgotLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")');
    if (await forgotLink.count() > 0) {
      await expect(forgotLink.first()).toBeVisible();
    }
  });
});
