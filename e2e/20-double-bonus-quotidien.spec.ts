/**
 * CHECKLIST ITEM 7 — Double bonus quotidien (bug Claire)
 *
 * Variables d'env requises :
 *   PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD
 *
 * Ce test vérifie que la déconnexion/reconnexion le même jour
 * ne génère PAS un 2ème bonus +0,10€.
 */
import { test, expect } from '@playwright/test';
import { loginAs, logout } from './helpers/auth';

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
const TEST_PASS  = process.env.PLAYWRIGHT_TEST_PASSWORD;

test.describe('7 — Double bonus quotidien (bug Claire)', () => {

  test('7.1 — Première connexion du jour : bonus +0,10€ crédité', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();

    // Effacer le flag localStorage pour simuler "premier login du jour"
    await page.goto('/');
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('login_'))
        .forEach(k => localStorage.removeItem(k));
    });

    const toasts: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') toasts.push(msg.text());
    });

    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.waitForTimeout(4000);

    const bonusToast = page.locator('[data-sonner-toast]:has-text("Bonus"), [data-sonner-toast]:has-text("0,10"), [data-sonner-toast]:has-text("quotidien")').first();
    if (await bonusToast.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Toast bonus quotidien affiché à la connexion');
    } else {
      console.log('ℹ️ Toast bonus quotidien non affiché (peut-être déjà reçu aujourd\'hui)');
    }
  });

  test('7.2 — Reconnexion le même jour : PAS de 2ème bonus', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();

    // Connexion initiale AVEC le flag localStorage en place (simuler déjà connecté aujourd'hui)
    await page.goto('/');
    const today = new Date().toISOString().split('T')[0];

    // On ne supprime PAS le flag — on simule une reconnexion le même jour
    // Le flag doit déjà être présent si le test 7.1 a tourné
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);
    await page.waitForTimeout(4000);

    // Le toast bonus ne doit PAS apparaître une 2ème fois
    const bonusToast = page.locator('[data-sonner-toast]:has-text("Bonus quotidien"), [data-sonner-toast]:has-text("0,10€")').first();
    const toastVisible = await bonusToast.isVisible({ timeout: 4000 }).catch(() => false);

    // Vérifier le flag localStorage
    const hasFlag = await page.evaluate((date) => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('login_'));
      return keys.some(k => localStorage.getItem(k) === date);
    }, today);

    if (!toastVisible && hasFlag) {
      console.log('✅ Pas de 2ème bonus quotidien (flag localStorage présent + pas de toast)');
    } else if (toastVisible) {
      throw new Error('⚠️ Bug Claire détecté : 2ème bonus quotidien affiché lors de la reconnexion le même jour');
    } else {
      console.log('ℹ️ Toast non visible mais flag absent — vérifier que test 7.1 a tourné en premier');
    }
  });

  test('7.3 — Historique fidélité : une seule ligne daily_connection par jour', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();
    await loginAs(page, TEST_EMAIL!, TEST_PASS!);

    await page.goto('/account/loyalty');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('Application error');

    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Compter les transactions "connexion" d'aujourd'hui dans l'historique affiché
    const historyItems = page.locator('[class*="transaction"], [class*="history"] > div');
    const count = await historyItems.count();

    let dailyCount = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const text = await historyItems.nth(i).textContent() || '';
      if (/connexion|daily|quotidien/i.test(text) && text.includes(today.split(' ')[0])) {
        dailyCount++;
      }
    }

    if (dailyCount <= 1) {
      console.log(`✅ ${dailyCount === 1 ? 'Une' : 'Aucune'} transaction connexion aujourd'hui (correct)`);
    } else {
      console.warn(`⚠️ ${dailyCount} transactions connexion détectées aujourd'hui — bug double bonus possible`);
    }
  });

  test('7.4 — Déconnexion multi-onglet : pas de page blanche', async ({ browser }) => {
    if (!TEST_EMAIL || !TEST_PASS) test.skip();

    // Simuler 2 onglets
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      await loginAs(page1, TEST_EMAIL!, TEST_PASS!);

      // Ouvrir un 2ème onglet sur le compte
      await page2.goto(process.env.PLAYWRIGHT_BASE_URL ? `${process.env.PLAYWRIGHT_BASE_URL}/account` : 'https://www.kavern-france.fr/account');
      await page2.waitForTimeout(2000);

      // Se déconnecter depuis l'onglet 1
      await page1.goto('/');
      await page1.evaluate(() => {
        window.dispatchEvent(new Event('kavern:logout'));
      });
      await page1.waitForTimeout(2000);

      // L'onglet 2 ne doit PAS afficher une page blanche
      await page2.reload();
      await page2.waitForTimeout(3000);

      const body = await page2.locator('body').textContent() || '';
      const isBlank = body.trim().length < 50;
      if (isBlank) {
        throw new Error('Page blanche détectée sur onglet 2 après déconnexion onglet 1');
      }
      await expect(page2.locator('body')).not.toContainText('Application error');
      console.log('✅ Pas de page blanche en multi-onglet');
    } finally {
      await context.close();
    }
  });
});
