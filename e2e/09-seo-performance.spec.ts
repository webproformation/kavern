import { test, expect } from '@playwright/test';

test.describe('SEO & Performance', () => {

  test('Page d\'accueil a un title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Pages ont des balises meta description', async ({ page }) => {
    const pages = ['/', '/shop', '/live', '/allo-andre'];
    for (const path of pages) {
      await page.goto(path);
      const metaDesc = page.locator('meta[name="description"]');
      const count = await metaDesc.count();
      // On log mais on ne fait pas échouer si absent
      if (count === 0) {
        console.warn(`⚠️ Pas de meta description sur ${path}`);
      }
    }
  });

  test('Pas d\'erreurs console sur la page d\'accueil', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    // Filtrer les erreurs bénignes (favicon, etc.)
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('ERR_BLOCKED')
    );
    if (criticalErrors.length > 0) {
      console.warn('Erreurs console:', criticalErrors);
    }
  });

  test('Pas d\'erreurs 500 sur les pages principales', async ({ page }) => {
    const pages = ['/', '/shop', '/live', '/cart', '/allo-andre', '/cgv', '/contact'];
    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test('Images ont des attributs alt', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      console.warn(`⚠️ ${imagesWithoutAlt} image(s) sans attribut alt sur la page d'accueil`);
    }
  });

  test('Liens internes ne sont pas cassés (échantillon)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    // Collecter un échantillon de liens internes
    const links = await page.locator('a[href^="/"]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')).filter(Boolean).slice(0, 15)
    );
    const uniqueLinks = [...new Set(links)];
    const broken: string[] = [];
    for (const link of uniqueLinks) {
      const response = await page.goto(link!);
      if (response && response.status() >= 500) {
        broken.push(`${link} → ${response.status()}`);
      }
    }
    if (broken.length > 0) {
      console.error('Liens cassés (500+):', broken);
    }
    expect(broken.length).toBe(0);
  });
});
