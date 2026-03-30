import { test, expect } from '@playwright/test';

// Ces tests nécessitent une session admin. On teste surtout que les pages chargent.
// En production, l'accès admin redirige vers login si pas connecté.

test.describe('Admin — Pages chargent sans erreur', () => {

  test('Admin dashboard redirige si pas connecté', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    // Redirige vers login, account ou reste sur admin
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin produits page', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin nouveau produit page', async ({ page }) => {
    await page.goto('/admin/products/new');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin clients page', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin lives page', async ({ page }) => {
    await page.goto('/admin/lives');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin nouveau live page', async ({ page }) => {
    await page.goto('/admin/lives/new');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin pages SEO', async ({ page }) => {
    await page.goto('/admin/site-pages');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin commandes page', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin catégories page', async ({ page }) => {
    await page.goto('/admin/categories-management');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin fidélité page', async ({ page }) => {
    await page.goto('/admin/loyalty');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin coupons page', async ({ page }) => {
    await page.goto('/admin/coupons');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin cartes cadeaux page', async ({ page }) => {
    await page.goto('/admin/gift-cards');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin méthodes de livraison', async ({ page }) => {
    await page.goto('/admin/shipping-methods');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin méthodes de paiement', async ({ page }) => {
    await page.goto('/admin/payment-methods');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin livre d\'or', async ({ page }) => {
    await page.goto('/admin/guestbook');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin slides', async ({ page }) => {
    await page.goto('/admin/slides');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin diagnostic', async ({ page }) => {
    await page.goto('/admin/diagnostic');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
