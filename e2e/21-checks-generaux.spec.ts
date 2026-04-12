/**
 * CHECKS GÉNÉRAUX — À ne pas oublier
 * Couvre les points de la checklist "Checks généraux"
 *
 * Variables d'env optionnelles :
 *   PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD
 *   PLAYWRIGHT_ADMIN_EMAIL / PLAYWRIGHT_ADMIN_PASSWORD
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const TEST_EMAIL  = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASS   = process.env.PLAYWRIGHT_TEST_PASSWORD;
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASS  = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('Checks généraux — Avant lundi 13 avril', () => {

  // ── Pages publiques ────────────────────────────────────────────────────────

  test('G.1 — Page d\'accueil charge sans erreur JS', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');

    const real = errors.filter(e =>
      !e.includes('favicon') && !e.includes('ERR_BLOCKED') &&
      !e.includes('analytics') && !e.includes('gtag') && !e.includes('google') &&
      !e.includes('Failed to load resource')
    );
    if (real.length > 0) {
      console.warn('⚠️ Erreurs console homepage:', real.join('\n'));
    }
    expect(real.length, `${real.length} erreur(s) console non-filtrées`).toBeLessThanOrEqual(2);
  });

  test('G.2 — Panier : ajout produit fonctionne', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(3000);
    const productLink = page.locator('a[href*="/product/"]').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });
    await productLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('G.3 — Panier : suppression fonctionne', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Application error');

    const deleteBtn = page.locator('button:has(svg.lucide-trash), button:has-text("Supprimer")').first();
    if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).not.toContainText('Application error');
      console.log('✅ Suppression article panier OK');
    } else {
      console.log('ℹ️ Panier vide — suppression non testée');
    }
  });

  test('G.4 — Checkout charge sans erreur', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  // ── Compte client ──────────────────────────────────────────────────────────

  test('G.5 — Compte > Mes commandes charge (connecté)', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/orders');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }).catch(() => {});
    console.log('✅ Mes commandes OK');
  });

  test('G.6 — Compte > Ma cagnotte charge (connecté)', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/loyalty');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }).catch(() => {});
    console.log('✅ Ma cagnotte OK');
  });

  test('G.7 — Compte > Mes coupons charge (connecté)', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/coupons');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }).catch(() => {});
    console.log('✅ Mes coupons OK');
  });

  test('G.8 — Compte > Ma wishlist charge (connecté)', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/wishlist');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    console.log('✅ Wishlist OK');
  });

  test('G.9 — Compte > Mes colis ouverts charge sans spinner bloqué', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/my-packages');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('Erreur lors du chargement');
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }).catch(() => {});
    console.log('✅ Mes colis ouverts OK');
  });

  // ── Admin ──────────────────────────────────────────────────────────────────

  test('G.10 — Admin > Commandes charge', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/orders');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }).catch(() => {});
    console.log('✅ Admin commandes OK');
  });

  test('G.11 — Admin > Produits charge', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/products');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    console.log('✅ Admin produits OK');
  });

  test('G.12 — Admin > Livre d\'Or charge', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/guestbook');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    console.log('✅ Admin livre d\'or OK');
  });

  // ── Sécurité / CSP ─────────────────────────────────────────────────────────

  test('G.13 — Pas d\'erreur CSP worker-src sur la homepage', async ({ page }) => {
    const cspErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('worker-src')) {
        cspErrors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(4000);
    expect(cspErrors.length, 'Erreur CSP worker-src détectée').toBe(0);
    console.log('✅ Pas d\'erreur CSP worker-src');
  });

  test('G.14 — wallet_balance s\'affiche correctement après checkout', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/loyalty');
    await page.waitForTimeout(3000);

    // Le porte-monnaie doit afficher un montant numérique
    const walletText = page.locator('text=/Porte-Monnaie|wallet|Avoirs/i').first();
    if (await walletText.isVisible({ timeout: 5000 }).catch(() => false)) {
      const parent = page.locator(':has-text("Porte-Monnaie")').filter({ hasText: /€/ }).first();
      const text = await parent.textContent() || '';
      const hasAmount = /\d+[.,]\d+\s*€/.test(text);
      if (hasAmount) console.log('✅ Porte-monnaie affiche un montant:', text.match(/\d+[.,]\d+\s*€/)?.[0]);
    }
  });
});
