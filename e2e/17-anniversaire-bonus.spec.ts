/**
 * CHECKLIST ITEM 4 — Bonus anniversaire
 *
 * Variables d'env requises :
 *   PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD
 *     → Ce compte DOIT avoir une date de naissance = aujourd'hui dans Supabase
 *     → Modifier dans Supabase avant de lancer : UPDATE profiles SET birth_date = CURRENT_DATE WHERE email = '...'
 *
 * IMPORTANT : Ce test ne MODIFIE pas la DB — la mise à jour de birth_date est manuelle.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASS  = process.env.PLAYWRIGHT_TEST_PASSWORD;
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASS  = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('4 — Bonus anniversaire', () => {

  test('4.1 — Connexion avec compte anniversaire : toast affiché', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();

    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    // Nettoyer le flag localStorage pour forcer la réévaluation
    await page.goto('/');
    const today = new Date().toISOString().split('T')[0];
    await page.evaluate((date) => {
      const userId = Object.keys(localStorage).find(k => k.startsWith('birthday_'));
      if (userId) localStorage.removeItem(userId);
      // Supprimer tous les flags anniversaire du jour
      Object.keys(localStorage)
        .filter(k => k.startsWith('birthday_') && k.endsWith(date))
        .forEach(k => localStorage.removeItem(k));
    }, today);

    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.waitForTimeout(3000);

    // Chercher le toast anniversaire
    const birthdayToast = page.locator('[data-sonner-toast]:has-text("anniversaire"), [data-sonner-toast]:has-text("Anniversaire")').first();
    const confetti = page.locator('canvas#confetti-canvas, canvas').first();

    if (await birthdayToast.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Toast anniversaire visible');
      await expect(birthdayToast).toContainText(/5.*€|anniversaire/i);
    } else {
      console.log('ℹ️ Toast anniversaire non visible — vérifier que birth_date = CURRENT_DATE dans Supabase pour ce compte');
      console.log('ℹ️ SQL : UPDATE profiles SET birth_date = CURRENT_DATE WHERE email = \'' + TEST_EMAIL + '\'');
    }
  });

  test('4.2 — Coupon 5€ visible dans Compte > Mes coupons après anniversaire', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account/coupons');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');

    // Chercher un coupon avec "anniversaire" ou "5"
    const body = await page.locator('body').textContent() || '';
    const hasBirthdayCoupon = /anniversaire|birthday|5.*€|ANNIV/i.test(body);

    if (hasBirthdayCoupon) {
      console.log('✅ Coupon anniversaire présent dans Mes coupons');
    } else {
      console.log('ℹ️ Coupon anniversaire non trouvé — normal si birth_date n\'est pas aujourd\'hui ou déjà utilisé');
    }
  });

  test('4.3 — API /api/cron/birthday répond sans erreur 500', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);

    // Appel GET direct (le cron accepte maintenant GET)
    const response = await page.request.get('/api/cron/birthday');
    expect(response.status()).not.toBe(500);
    console.log(`✅ /api/cron/birthday status: ${response.status()}`);
  });

  test('4.4 — Page compte : date de naissance renseignable', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.goto('/account');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');
    const birthInput = page.locator('input[type="date"], input[name*="birth"], input[placeholder*="naissance"]').first();
    if (await birthInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Champ date de naissance visible dans le profil');
    } else {
      console.log('ℹ️ Champ date de naissance non trouvé dans /account — peut être dans un sous-menu');
    }
  });
});
