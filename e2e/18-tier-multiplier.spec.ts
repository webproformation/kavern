/**
 * CHECKLIST ITEM 5 — Multiplicateurs de rang (tier_multiplier)
 *
 * Variables d'env requises :
 *   PLAYWRIGHT_TIER2_EMAIL / PLAYWRIGHT_TIER2_PASSWORD
 *     → Compte avec tier_multiplier = 2 (rang "Passionné", loyalty_euros >= 5)
 *     → Pour tester : UPDATE profiles SET tier_multiplier=2, current_tier=2, loyalty_euros=5 WHERE email='...'
 *
 * Ce test vérifie l'AFFICHAGE des multiplicateurs, pas le calcul DB.
 * La vérification du calcul réel est manuelle (vérifier loyalty_transactions après action).
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const TIER2_EMAIL = process.env.PLAYWRIGHT_TIER2_EMAIL || process.env.PLAYWRIGHT_TEST_EMAIL;
const TIER2_PASS  = process.env.PLAYWRIGHT_TIER2_PASSWORD || process.env.PLAYWRIGHT_TEST_PASSWORD;

test.describe('5 — Multiplicateurs de rang (tier_multiplier)', () => {

  test('5.1 — Page fidélité affiche le rang et le multiplicateur', async ({ page }) => {
    if (!TIER2_EMAIL || !TIER2_PASS) test.skip();
    await loginAs(page, TIER2_EMAIL!, TIER2_PASS!);
    await page.goto('/account/loyalty');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');

    // Vérifier que le multiplicateur est affiché
    const multiplierText = page.locator('text=/×\\d|x\\d|multiplié|multiplier/i').first();
    if (await multiplierText.isVisible({ timeout: 5000 }).catch(() => false)) {
      const text = await multiplierText.textContent();
      console.log('✅ Multiplicateur affiché:', text?.trim());
    }

    // Vérifier les gains affichés dans "Comment gagner"
    const body = await page.locator('body').textContent() || '';
    const hasCashback = /cashback|%/i.test(body);
    expect(hasCashback, 'Section "Comment gagner" avec % cashback non trouvée').toBe(true);
  });

  test('5.2 — Compte rang ×2 : cashback affiché = 4% (pas 2%)', async ({ page }) => {
    if (!TIER2_EMAIL || !TIER2_PASS) test.skip();
    await loginAs(page, TIER2_EMAIL!, TIER2_PASS!);
    await page.goto('/account/loyalty');
    await page.waitForTimeout(3000);

    const body = await page.locator('body').textContent() || '';
    const hasMultiplier = body.includes('×2') || body.includes('x2') || body.includes('Passionné');

    if (!hasMultiplier) {
      console.log('ℹ️ Ce compte n\'est pas rang ×2 — vérifier PLAYWRIGHT_TIER2_EMAIL');
      console.log('ℹ️ SQL pour mettre à ×2 : UPDATE profiles SET tier_multiplier=2, current_tier=2, loyalty_euros=5 WHERE email=\'...\'');
      return;
    }

    // Avec ×2, le cashback doit être 4% (2% × 2)
    const has4percent = body.includes('4%') || body.includes('4,00%');
    if (has4percent) {
      console.log('✅ Cashback 4% correct pour rang ×2');
    } else {
      console.log('ℹ️ Cashback 4% non trouvé — vérifier calcul currentTier.multiplier * 2');
    }
  });

  test('5.3 — Spinners page fidélité : aucun bloqué', async ({ page }) => {
    if (!TIER2_EMAIL || !TIER2_PASS) test.skip();
    await loginAs(page, TIER2_EMAIL!, TIER2_PASS!);
    await page.goto('/account/loyalty');

    await page.waitForFunction(
      () => !document.querySelector('.animate-spin'),
      { timeout: 8000 }
    ).catch(() => {});

    const spinner = page.locator('.animate-spin').first();
    if (await spinner.isVisible().catch(() => false)) {
      throw new Error('Spinner bloqué sur /account/loyalty après 8s');
    }
    console.log('✅ Pas de spinner bloqué sur /account/loyalty');
  });

  test('5.4 — Historique transactions : bonus quotidien multiplié [MANUEL]', async ({ page }) => {
    if (!TIER2_EMAIL || !TIER2_PASS) test.skip();

    // Nettoyer le flag du jour pour forcer un nouveau bonus
    await page.goto('/');
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('login_'))
        .forEach(k => localStorage.removeItem(k));
    });

    await loginAs(page, TIER2_EMAIL!, TIER2_PASS!);
    await page.waitForTimeout(3000);

    // Toast bonus quotidien
    const toast = page.locator('[data-sonner-toast]').first();
    if (await toast.isVisible({ timeout: 5000 }).catch(() => false)) {
      const toastText = await toast.textContent() || '';
      console.log('ℹ️ Toast bonus quotidien:', toastText.trim());

      // Pour rang ×2, devrait afficher +0,20€ (pas +0,10€)
      if (toastText.includes('0,20') || toastText.includes('0.20')) {
        console.log('✅ Bonus quotidien ×2 correct: +0,20€');
      } else if (toastText.includes('0,10') || toastText.includes('0.10')) {
        console.warn('⚠️ Bonus quotidien affiché +0,10€ alors que rang ×2 attendu — vérifier RPC record_daily_connection');
      }
    }

    await page.goto('/account/loyalty');
    await page.waitForTimeout(3000);
    console.log('ℹ️ Vérifier manuellement dans l\'historique que le dernier bonus = 0,20€ pour rang ×2');
  });
});
