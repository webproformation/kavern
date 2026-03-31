import { test, expect } from '@playwright/test';

test.describe('Smoke Tests — Vérifications rapides', () => {

  test('Homepage charge en < 5s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
    await expect(page).toHaveTitle(/kavern/i);
  });

  test('Page boutique charge avec des produits', async ({ page }) => {
    await page.goto('/shop');
    await expect(
      page.locator('[class*="product"], [data-testid="product"], a[href*="/product/"]').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Page produit charge correctement (pas de crash)', async ({ page }) => {
    await page.goto('/shop');
    const productLink = page.locator('a[href*="/product/"]').first();
    await expect(productLink).toBeVisible({ timeout: 15000 });
    await productLink.click();
    await page.waitForTimeout(3000);
    // La page produit ne doit PAS crasher
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Application error');
  });

  test('Page panier charge', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('Page login charge', async ({ page }) => {
    await page.goto('/auth/login');
    // La page doit contenir "Connexion" et un champ email
    await expect(page.locator('text=Connexion').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('Page contact charge', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('form').first()).toBeVisible({ timeout: 10000 });
  });

  test('Page CGV charge', async ({ page }) => {
    await page.goto('/cgv');
    await expect(page.locator('body')).toContainText(/article|condition/i);
  });

  test('Pas d\'erreurs console sur la homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    // Filtrer les erreurs bénignes (ressources tierces, favicon, etc.)
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('third-party') &&
      !e.includes('Failed to load resource') &&
      !e.includes('ERR_BLOCKED_BY_CLIENT') &&
      !e.includes('analytics') &&
      !e.includes('gtag') &&
      !e.includes('google')
    );
    expect(realErrors.length).toBeLessThanOrEqual(2);
  });

  test('Images chargent sur la homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const images = page.locator('img[src]');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    // Vérifier que les 5 premières images sont bien chargées
    for (let i = 0; i < Math.min(5, count); i++) {
      const img = images.nth(i);
      if (await img.isVisible().catch(() => false)) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('API Supabase est accessible', async ({ page }) => {
    await page.goto('/shop');
    // Si les produits chargent, Supabase fonctionne
    await expect(
      page.locator('a[href*="/product/"]').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('Login admin fonctionne', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_ADMIN_EMAIL;
    const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
    if (!email || !password) {
      test.skip();
      return;
    }
    await page.goto('/auth/login');
    await page.locator('input[type="email"], input[name="email"]').fill(email);
    await page.locator('input[type="password"], input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(admin|account|shop|\?)/, { timeout: 15000 });
  });

  test('Site responsive mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(3000);
    // Vérifier qu'il n'y a pas de dépassement horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('Header et navigation visibles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('Footer visible', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('kavern');
  });
});
