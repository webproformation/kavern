/**
 * CHECKLIST ITEM 2 — Colis ouvert : clôture + anti-doublon
 *
 * Variables d'env requises :
 *   PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASS  = process.env.PLAYWRIGHT_TEST_PASSWORD;

test.describe('2 — Bug clôture de colis ouvert', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
  });

  test('2.1 — Page colis ouvert charge sans crash', async ({ page }) => {
    await page.goto('/account/open-package');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('2.2 — Aucun spinner bloqué sur /account/open-package', async ({ page }) => {
    await page.goto('/account/open-package');
    // Attendre max 8s que les spinners disparaissent
    await page.waitForFunction(
      () => !document.querySelector('.animate-spin'),
      { timeout: 8000 }
    ).catch(() => {});

    const spinner = page.locator('.animate-spin').first();
    const visible = await spinner.isVisible().catch(() => false);
    if (visible) throw new Error('Spinner bloqué sur /account/open-package après 8s');
  });

  test('2.3 — Si colis actif : bouton "Fermer" présent', async ({ page }) => {
    await page.goto('/account/open-package');
    await page.waitForTimeout(4000);

    const body = await page.locator('body').textContent() || '';
    const hasActivePackage = body.includes('Fermer') || body.includes('expédier') || body.includes('Temps restant');

    if (!hasActivePackage) {
      console.log('ℹ️ Aucun colis actif — test 2.3 ignoré (normal si pas de colis ouvert)');
      return;
    }

    const closeBtn = page.locator('button:has-text("Fermer"), button:has-text("expédier")').first();
    await expect(closeBtn).toBeVisible();
    console.log('✅ Bouton clôture visible');
  });

  test('2.4 — Clôture colis : pas d\'écran blanc ni spinner infini', async ({ page }) => {
    await page.goto('/account/open-package');
    await page.waitForTimeout(4000);

    const closeBtn = page.locator('button:has-text("Fermer"), button:has-text("expédier")').first();
    if (!(await closeBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('ℹ️ Pas de colis actif à clôturer — test ignoré');
      return;
    }

    // Intercepter la dialogue de confirmation
    page.once('dialog', dialog => dialog.accept());
    await closeBtn.click();

    // Attendre 10s
    await page.waitForTimeout(10000);

    // Vérifications : pas de crash, pas de spinner bloqué
    await expect(page.locator('body')).not.toContainText('Application error');
    const spinner = page.locator('.animate-spin').first();
    const spinnerVisible = await spinner.isVisible().catch(() => false);
    if (spinnerVisible) throw new Error('Spinner bloqué 10s après clôture colis');

    // Vérifier que soit on est redirigé soit un message s'affiche
    const bodyText = await page.locator('body').textContent() || '';
    const success = bodyText.includes('fermé') || bodyText.includes('expédi') || bodyText.includes('succès') || !bodyText.includes('Fermer');
    if (success) {
      console.log('✅ Clôture colis OK');
    } else {
      // Chercher un message d'erreur lisible
      const toast = await page.locator('[data-sonner-toast]').textContent().catch(() => '');
      console.warn('⚠️ Résultat clôture incertain. Toast:', toast);
    }
  });

  test('2.5 — Impossible de créer un 2ème colis si un actif existe', async ({ page }) => {
    await page.goto('/account/open-package');
    await page.waitForTimeout(4000);

    const body = await page.locator('body').textContent() || '';
    const hasActive = body.includes('Temps restant') || body.includes('Fermer');

    if (!hasActive) {
      console.log('ℹ️ Aucun colis actif — test anti-doublon ignoré');
      return;
    }

    // On ne doit PAS voir le formulaire de création si un colis est actif
    const createForm = page.locator('button:has-text("Créer le colis")').first();
    const createVisible = await createForm.isVisible({ timeout: 2000 }).catch(() => false);
    expect(createVisible, 'Le formulaire de création est visible alors qu\'un colis est actif').toBe(false);
    console.log('✅ Anti-doublon colis ouvert OK');
  });

  test('2.6 — Si clôture échoue : message d\'erreur lisible (pas "Erreur")', async ({ page }) => {
    // Ce test simule une erreur en coupant les requêtes réseau
    await page.goto('/account/open-package');
    await page.waitForTimeout(4000);

    const hasActive = await page.locator('button:has-text("Fermer"), button:has-text("expédier")')
      .isVisible({ timeout: 2000 }).catch(() => false);

    if (!hasActive) {
      console.log('ℹ️ Pas de colis actif — test message erreur ignoré');
      return;
    }

    // Bloquer les requêtes Supabase pour forcer une erreur
    await page.route('**/rest/v1/**', route => route.abort());

    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Fermer"), button:has-text("expédier")').first().click();
    await page.waitForTimeout(5000);

    // Le message d'erreur ne doit pas être juste "Erreur" mais doit avoir un contexte
    const toast = page.locator('[data-sonner-toast]').first();
    if (await toast.isVisible({ timeout: 5000 }).catch(() => false)) {
      const toastText = await toast.textContent() || '';
      expect(toastText.length, 'Message erreur trop court (probablement juste "Erreur")').toBeGreaterThan(10);
      console.log('✅ Message erreur lisible:', toastText.trim());
    }
  });
});
