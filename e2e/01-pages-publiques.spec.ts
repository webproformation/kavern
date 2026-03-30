import { test, expect } from '@playwright/test';

test.describe('Pages publiques — Navigation & Contenu', () => {

  test('Page d\'accueil charge correctement', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/kavern/i);
    // Header visible
    await expect(page.locator('header')).toBeVisible();
    // Logo présent
    await expect(page.locator('img[alt*="Kavern"]').first()).toBeVisible();
    // Catégories chargées
    await expect(page.locator('nav a, nav button').first()).toBeVisible();
  });

  test('Footer visible avec les bonnes infos', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('contact@kavern-france.fr');
    await expect(footer).toContainText('Nieppe');
    // Catégories en minuscules (pas tout en majuscules)
    const firstCategory = footer.locator('ul li a').first();
    const text = await firstCategory.textContent();
    if (text && text.length > 1) {
      // Vérifie que ce n'est pas tout en majuscules
      expect(text).not.toBe(text!.toUpperCase());
    }
  });

  test('Bandeau haut ne contient plus "livraison offerte dès 80€"', async ({ page }) => {
    await page.goto('/');
    const topBar = page.locator('.animate-marquee, [class*="marquee"]').first();
    if (await topBar.isVisible()) {
      await expect(topBar).not.toContainText('80€');
    }
  });

  test('Page Qui sommes-nous', async ({ page }) => {
    await page.goto('/qui-sommes-nous');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Page Allô André — bon texte', async ({ page }) => {
    await page.goto('/allo-andre');
    await expect(page.locator('body')).toContainText('100 % humain');
  });

  test('Page Mentions Légales', async ({ page }) => {
    await page.goto('/mentions-legales');
    await expect(page.locator('body')).toContainText('kavern-france.fr');
  });

  test('Page CGV', async ({ page }) => {
    await page.goto('/cgv');
    await expect(page.locator('body')).toContainText(/article|condition/i);
  });

  test('Page Politique de confidentialité', async ({ page }) => {
    await page.goto('/politique-confidentialite');
    await expect(page.locator('body')).toContainText(/donn.es|RGPD|confidentialit/i);
  });

  test('Page Le Droit à l\'Erreur', async ({ page }) => {
    await page.goto('/le-droit-a-lerreur');
    await expect(page.locator('body')).toContainText(/retour|erreur/i);
  });

  test('Page Vite chez vous', async ({ page }) => {
    await page.goto('/vite-chez-vous');
    await expect(page.locator('body')).toContainText(/exp.dition|livraison/i);
  });

  test('Page Transactions protégées', async ({ page }) => {
    await page.goto('/transactions-protegees');
    await expect(page.locator('body')).toContainText(/s.curis|paiement/i);
  });

  test('Page Colis Ouvert', async ({ page }) => {
    await page.goto('/colis-ouvert');
    await expect(page.locator('body')).toContainText(/colis|ouvert/i);
  });

  test('Page Livre d\'Or', async ({ page }) => {
    await page.goto('/livre-dor');
    await expect(page.locator('body')).toContainText(/avis|livre|or/i);
  });

  test('Page Contact', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('body')).toContainText(/contact|message/i);
  });

  test('Page Live Shopping', async ({ page }) => {
    await page.goto('/live');
    await expect(page.locator('body')).toContainText(/live|replay|direct/i);
    // Boutons réseaux sociaux avec bons liens
    const fbLink = page.locator('a[href*="facebook.com"]').first();
    if (await fbLink.isVisible()) {
      const href = await fbLink.getAttribute('href');
      expect(href).toContain('facebook.com');
    }
    const tiktokLink = page.locator('a[href*="tiktok.com"]').first();
    if (await tiktokLink.isVisible()) {
      const href = await tiktokLink.getAttribute('href');
      expect(href).toContain('kavernfrance');
    }
  });

  test('Page Carte Cadeau', async ({ page }) => {
    await page.goto('/carte-cadeau');
    await expect(page.locator('body')).toContainText(/cadeau|carte/i);
  });
});
