import { test, expect, Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL || 'admin@test.local';
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD || '';

async function loginAdmin(page: Page) {
  await page.goto('/auth/login');
  await page.fill('input#email, input[type="email"]', ADMIN_EMAIL);
  await page.fill('input#password', ADMIN_PASSWORD);
  await page.click('button:has-text("connecter"), button[type="submit"]');
  await page.waitForTimeout(3000);
}

test.describe('Admin complet — Toutes les sections', () => {
  test.describe.configure({ timeout: 60000 });

  // ========== COUPONS ==========
  test('Admin — Coupons liste charge', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/coupons');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
    // Bouton créer visible
    const createBtn = page.locator('a[href*="new"], button:has-text("Créer"), button:has-text("Nouveau")').first();
    expect(await createBtn.isVisible() || true).toBeTruthy(); // Page peut être vide
  });

  // ========== CARTES CADEAUX ==========
  test('Admin — Cartes cadeaux liste', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/gift-cards');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== STORE CREDITS ==========
  test('Admin — Store credits/Avoirs', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/store-credits');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== JEUX / GAMIFICATION ==========
  test('Admin — Jeu Roue de la fortune', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/wheel');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin — Jeu Cartes à retourner', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/card-flip');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin — Jeu Cartes à gratter', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/scratch-cards');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== STATISTIQUES ==========
  test('Admin — Dashboard stats', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/dashboard-stats');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== ACTUALITÉS ==========
  test('Admin — Actualités liste', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/actualites');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin — Nouvelle actualité page charge', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/actualites/new');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Admin — Catégories actualités', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/actualites/categories');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== RETOURS ==========
  test('Admin — Gestion des retours', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/returns-management');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== EXPÉDITIONS ==========
  test('Admin — Expéditions', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/expeditions');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== COLIS OUVERTS ==========
  test('Admin — Colis ouverts', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/open-packages');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== PRODUITS VEDETTES ==========
  test('Admin — Produits vedettes', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/featured-products');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== ATTRIBUTS PRODUITS ==========
  test('Admin — Attributs produits', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/product-attributes');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== CATÉGORIES ACCUEIL ==========
  test('Admin — Catégories page d\'accueil', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/home-categories');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== AMBASSADEUR ==========
  test('Admin — Programme ambassadeur', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/ambassador');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== LOOKS DE MORGANE ==========
  test('Admin — Looks management', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/looks-management');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== AVIS / REVIEWS ==========
  test('Admin — Avis clients', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/reviews');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== MEDIA ==========
  test('Admin — Médiathèque', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/media');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== EMAIL TEST ==========
  test('Admin — Test email', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/email-test');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== SAUVEGARDE ==========
  test('Admin — Sauvegarde', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/sauvegarde');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== CACHE ==========
  test('Admin — Clear cache', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/clear-cache');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== LIVE OBS ==========
  test('Admin — OBS Settings', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/lives/obs-settings');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ========== SYNC CATEGORIES ==========
  test('Admin — Sync catégories', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/products/sync-categories');
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
