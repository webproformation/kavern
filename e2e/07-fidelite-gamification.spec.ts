import { test, expect } from '@playwright/test';

test.describe('Fidélité & Gamification', () => {

  test('Page fidélité compte client', async ({ page }) => {
    await page.goto('/account/loyalty');
    await page.waitForTimeout(2000);
    // Redirige vers login si pas connecté — c'est OK
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Page cagnotte compte client', async ({ page }) => {
    await page.goto('/account/store-credits');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Page coupons compte client', async ({ page }) => {
    await page.goto('/account/coupons');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Page parrainage compte client', async ({ page }) => {
    await page.goto('/account/referral');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Wishlist page charge', async ({ page }) => {
    await page.goto('/wishlist');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
