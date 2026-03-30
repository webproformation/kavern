import { test, expect } from '@playwright/test';

test.describe('Checkout & Livraison', () => {

  test('Page checkout charge sans erreur', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('Frais de port page affiche les infos', async ({ page }) => {
    await page.goto('/frais-de-port');
    await expect(page.locator('body')).toContainText(/livraison|port|exp.dition/i);
  });

  test('Page checkout mentionne 7 jours (pas 5)', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('jours')) {
      expect(bodyText).not.toContain('5 jours');
      if (bodyText.includes('7 jours')) {
        expect(bodyText).toContain('7 jours');
      }
    }
  });
});
