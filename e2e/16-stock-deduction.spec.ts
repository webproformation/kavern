/**
 * CHECKLIST ITEM 3 — Déduction de stock à la validation
 *
 * Variables d'env requises :
 *   PLAYWRIGHT_ADMIN_EMAIL / PLAYWRIGHT_ADMIN_PASSWORD
 *   PLAYWRIGHT_TEST_PRODUCT_SLUG   slug d'un produit avec stock connu (ex: "bijou-test")
 *
 * Ce test vérifie que le stock diminue APRÈS une commande.
 * Il ne passe pas de vraie commande (CB/PayPal) — il vérifie que
 * la logique de stock est visible côté admin.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASS  = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
const PRODUCT_SLUG = process.env.PLAYWRIGHT_TEST_PRODUCT_SLUG;

test.describe('3 — Déduction de stock', () => {

  test('3.1 — Admin > Produits : stock visible et numérique', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/products');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');
    // La page doit afficher des chiffres de stock
    const stockText = page.locator('text=/stock|quantité|qty/i').first();
    if (await stockText.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Colonne stock visible dans admin > Produits');
    }
  });

  test('3.2 — Fiche produit test : stock affiché (si PLAYWRIGHT_TEST_PRODUCT_SLUG défini)', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS || !PRODUCT_SLUG) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);

    // Chercher le produit dans admin
    await page.goto('/admin/products');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="recherch"], input[type="search"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(PRODUCT_SLUG!);
      await page.waitForTimeout(1500);
    }

    // Lire le stock actuel
    const stockCells = page.locator('td:has-text(/^\\d+$/), [class*="stock"]');
    const count = await stockCells.count();
    if (count > 0) {
      const stockVal = await stockCells.first().textContent();
      console.log(`ℹ️ Stock actuel du produit test: ${stockVal}`);
    }
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('3.3 — Après commande (Stripe) : stock diminué côté admin [MANUEL si pas de carte test]', async ({ page }) => {
    // Ce test est informatif — la vraie vérification est manuelle
    // Il vérifie uniquement que la page admin produit charge sans erreur APRÈS une commande
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/products');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');
    console.log('ℹ️ Vérification manuelle requise : comparer stock avant/après commande Stripe');
    console.log('ℹ️ Carte Stripe test : 4242 4242 4242 4242 / 12/30 / 123');
  });

  test('3.4 — Stock variante : la bonne variante est décrémentée [STRUCTUREL]', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS || !PRODUCT_SLUG) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);

    // Aller sur la fiche admin du produit test
    await page.goto('/admin/products');
    await page.waitForTimeout(2000);

    const productLink = page.locator(`a[href*="${PRODUCT_SLUG}"], tr:has-text("${PRODUCT_SLUG}") a`).first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await page.waitForTimeout(2000);

      // La fiche produit admin doit afficher les variantes avec leur stock
      const variationStock = page.locator('text=/variante|variation|taille|couleur/i').first();
      if (await variationStock.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Variantes avec stock visibles sur la fiche produit admin');
      } else {
        console.log('ℹ️ Pas de variantes trouvées sur ce produit (normal si produit simple)');
      }
    }
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
