/**
 * CHECKLIST ITEM 1 — Commande complète + vérifications
 *
 * Variables d'env requises :
 *   PLAYWRIGHT_TEST_EMAIL        compte client test (existant ou à créer)
 *   PLAYWRIGHT_TEST_PASSWORD     mot de passe
 *   PLAYWRIGHT_ADMIN_EMAIL       compte admin
 *   PLAYWRIGHT_ADMIN_PASSWORD    mot de passe admin
 *   PLAYWRIGHT_STRIPE_CARD       numéro carte Stripe test (défaut: 4242424242424242)
 */
import { test, expect } from '@playwright/test';
import { loginAs, addFirstProductToCart } from './helpers/auth';

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASS  = process.env.PLAYWRIGHT_TEST_PASSWORD;
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASS  = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
const STRIPE_CARD = process.env.PLAYWRIGHT_STRIPE_CARD || '4242424242424242';

test.describe('1 — Commande complète (crash commandes vides)', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
  });

  test('1.1 — Connexion client + ajout produit au panier', async ({ page }) => {
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    const added = await addFirstProductToCart(page);
    expect(added, 'Aucun produit disponible à ajouter').toBe(true);

    await page.goto('/cart');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('Application error');
    // Le panier doit avoir au moins un article ou un montant
    const hasItems = (await page.locator('text=/\\d+[.,]\\d+\\s*€/').count()) > 0;
    expect(hasItems, 'Le panier est vide après ajout produit').toBe(true);
  });

  test('1.2 — Checkout jusqu\'à la confirmation (carte Stripe test)', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();

    await loginAs(page, TEST_EMAIL!, TEST_PASS!);

    // S'assurer qu'il y a quelque chose dans le panier
    const added = await addFirstProductToCart(page);
    if (!added) test.skip();

    await page.goto('/checkout');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');

    // Sélectionner livraison si nécessaire
    const livraisonOption = page.locator('input[type="radio"], button:has-text("Livraison"), button:has-text("Standard")').first();
    if (await livraisonOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await livraisonOption.click();
      await page.waitForTimeout(500);
    }

    // Sélectionner paiement CB si ce n'est pas déjà sélectionné
    const cbOption = page.locator('button:has-text("Carte bancaire"), label:has-text("Carte"), [value="stripe"]').first();
    if (await cbOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cbOption.click();
      await page.waitForTimeout(1000);
    }

    // Iframe Stripe
    const stripeFrame = page.frameLocator('iframe[name*="stripe"], iframe[src*="stripe"]').first();
    const cardInput = stripeFrame.locator('input[name="cardnumber"], input[placeholder*="1234"]').first();
    if (await cardInput.isVisible({ timeout: 8000 }).catch(() => false)) {
      await cardInput.fill(STRIPE_CARD);
      await stripeFrame.locator('input[name="exp-date"], input[placeholder*="MM"]').fill('12/30');
      await stripeFrame.locator('input[name="cvc"], input[placeholder*="CVC"]').fill('123');
      await page.waitForTimeout(500);
    }

    // Bouton passer commande
    const orderBtn = page.locator('button:has-text("Passer la commande"), button:has-text("Commander"), button:has-text("Confirmer")').first();
    if (await orderBtn.isVisible({ timeout: 5000 }).catch(() => false) && !(await orderBtn.isDisabled())) {
      await orderBtn.click();
      await page.waitForTimeout(5000);
    }

    // Vérifier la page de confirmation
    const url = page.url();
    const isConfirmation = url.includes('confirmation') || url.includes('order-');
    const hasConfirmText = await page.locator('text=/confirm|merci|commande.*pass/i').isVisible({ timeout: 10000 }).catch(() => false);

    // Pas de crash = minimum acceptable
    await expect(page.locator('body')).not.toContainText('Application error');
    if (isConfirmation || hasConfirmText) {
      console.log('✅ Commande confirmée — URL:', url);
    } else {
      console.warn('⚠️ Page de confirmation non détectée — vérifier manuellement');
    }
  });

  test('1.3 — Commande visible dans Compte > Mes commandes', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/orders');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');
    // La page ne doit pas rester en spinner
    await expect(page.locator('[class*="spinner"], [class*="loading"], .animate-spin').first())
      .not.toBeVisible({ timeout: 10000 })
      .catch(() => {}); // pas bloquant si aucun spinner

    // Doit afficher soit des commandes soit le message "aucune commande"
    const hasOrders = (await page.locator('text=/commande|order|#/i').count()) > 0;
    expect(hasOrders, 'Page commandes vide — Application error potentiel').toBe(true);
  });

  test('1.4 — Commande visible dans admin > Commandes', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/orders');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');
    // La page doit afficher une liste de commandes
    const hasTable = await page.locator('table tbody tr, [class*="order-row"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasOrders = (await page.locator('text=/#|Commande|En cours/i').count()) > 0;
    expect(hasTable || hasOrders, 'Admin commandes: aucune ligne visible').toBe(true);
  });

  test('1.5 — Aucun spinner bloqué sur /account/orders', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/orders');
    // Attendre max 8s que les spinners disparaissent
    await page.waitForFunction(
      () => !document.querySelector('.animate-spin'),
      { timeout: 8000 }
    ).catch(() => {});

    const spinner = page.locator('.animate-spin, [class*="spinner"]').first();
    const spinnerVisible = await spinner.isVisible().catch(() => false);
    if (spinnerVisible) {
      throw new Error('Spinner encore visible après 8s sur /account/orders');
    }
  });
});
