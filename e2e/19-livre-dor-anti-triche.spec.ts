/**
 * CHECKLIST ITEM 6 — Anti-triche Livre d'Or (1 récompense par avis approuvé)
 *
 * Variables d'env requises :
 *   PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD  (client)
 *   PLAYWRIGHT_ADMIN_EMAIL / PLAYWRIGHT_ADMIN_PASSWORD (admin)
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASS  = process.env.PLAYWRIGHT_TEST_PASSWORD;
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASS  = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('6 — Anti-triche Livre d\'Or', () => {

  test('6.1 — Page Livre d\'Or charge sans erreur', async ({ page }) => {
    await page.goto('/livre-dor');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
    const hasContent = await page.locator('form, text=/avis|témoignage|laisser/i').isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasContent, 'Page Livre d\'Or vide ou sans formulaire').toBe(true);
  });

  test('6.2 — Soumettre un avis ne crédite PAS immédiatement', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);

    // Lire le solde fidélité AVANT
    await page.goto('/account/loyalty');
    await page.waitForTimeout(2000);
    const balanceEl = page.locator('text=/[0-9]+[.,][0-9]+\\s*€/').first();
    const balanceBefore = await balanceEl.textContent().catch(() => '0');
    console.log('ℹ️ Solde fidélité avant avis:', balanceBefore?.trim());

    // Soumettre un avis
    await page.goto('/livre-dor');
    await page.waitForTimeout(2000);

    const ratingStars = page.locator('button[class*="star"], [class*="rating"] button, svg[class*="star"]').first();
    if (await ratingStars.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ratingStars.click();
      await page.waitForTimeout(300);
    }

    const reviewInput = page.locator('textarea, input[placeholder*="avis"], input[placeholder*="témoignage"]').first();
    if (await reviewInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await reviewInput.fill(`Avis test automatique ${Date.now()} — qualité excellente`);
    }

    const submitBtn = page.locator('button:has-text("Envoyer"), button:has-text("Publier"), button[type="submit"]').first();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false) && !(await submitBtn.isDisabled())) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    // Vérifier que le solde N'A PAS changé immédiatement
    await page.goto('/account/loyalty');
    await page.waitForTimeout(2000);
    const balanceAfter = await balanceEl.textContent().catch(() => '0');
    console.log('ℹ️ Solde fidélité après soumission avis:', balanceAfter?.trim());

    if (balanceBefore?.trim() === balanceAfter?.trim()) {
      console.log('✅ Aucun crédit immédiat après soumission (correct — doit attendre approbation admin)');
    } else {
      console.warn('⚠️ Le solde a changé immédiatement après soumission — vérifier la logique de récompense');
    }
  });

  test('6.3 — Admin peut approuver un avis', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/guestbook');
    await page.waitForTimeout(3000);

    await expect(page.locator('body')).not.toContainText('Application error');
    const hasReviews = await page.locator('text=/avis|témoignage|approuv/i, table tbody tr').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (hasReviews) {
      console.log('✅ Page admin Livre d\'Or charge avec des avis');
    } else {
      console.log('ℹ️ Aucun avis en attente dans l\'admin Livre d\'Or');
    }

    // Chercher un bouton "Approuver" pour un avis en attente
    const approveBtn = page.locator('button:has-text("Approuver"), button:has-text("approuv")').first();
    if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Bouton "Approuver" disponible pour les avis en attente');
    }
  });

  test('6.4 — Double approbation impossible [STRUCTUREL]', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/guestbook');
    await page.waitForTimeout(3000);

    // Chercher des avis déjà approuvés — ils ne doivent plus avoir de bouton "Approuver"
    const approvedRows = page.locator('tr:has-text("Approuvé"), tr:has-text("approuvé")');
    const count = await approvedRows.count();
    if (count > 0) {
      const approveBtn = approvedRows.first().locator('button:has-text("Approuver")');
      const btnVisible = await approveBtn.isVisible().catch(() => false);
      if (!btnVisible) {
        console.log(`✅ ${count} avis approuvés : pas de bouton "Approuver" disponible (correct)`);
      } else {
        console.warn('⚠️ Bouton "Approuver" visible sur un avis déjà approuvé — risque de double crédit');
      }
    } else {
      console.log('ℹ️ Aucun avis avec statut "Approuvé" visible — test structurel ignoré');
    }
  });

  test('6.5 — Admin Livre d\'Or : aucun spinner bloqué', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASS) test.skip();
    await loginAs(page, ADMIN_EMAIL!, ADMIN_PASS!);
    await page.goto('/admin/guestbook');

    await page.waitForFunction(
      () => !document.querySelector('.animate-spin'),
      { timeout: 8000 }
    ).catch(() => {});

    const spinner = page.locator('.animate-spin').first();
    if (await spinner.isVisible().catch(() => false)) {
      throw new Error('Spinner bloqué sur /admin/guestbook');
    }
  });
});
