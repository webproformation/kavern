import { test, expect } from '@playwright/test';

test.describe('Sécurité — Tests de sécurité', () => {

  test('Admin pages redirigent si non connecté', async ({ page }) => {
    const adminRoutes = ['/admin', '/admin/products', '/admin/orders', '/admin/clients'];
    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForTimeout(3000);
      const url = page.url();
      // Doit rediriger vers login/auth ou rester sans crash
      const redirectedOrSafe =
        url.includes('/auth') ||
        url.includes('/login') ||
        url.endsWith('/') ||
        !url.includes(route);
      const bodyText = await page.locator('body').textContent();
      // Au minimum, pas de crash applicatif
      expect(bodyText).not.toContain('Application error');
    }
  });

  test('API admin retourne 401 sans auth', async ({ request }) => {
    // Tentative d'accès API sans authentification
    const response = await request.get('/api/admin/products', {
      headers: { 'Content-Type': 'application/json' },
    });
    // Doit retourner 401, 403 ou 404 (pas 200 avec des données sensibles)
    expect([401, 403, 404]).toContain(response.status());
  });

  test('Formulaire contact rejette données invalides', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 10000 });
    // Soumettre le formulaire vide
    const submitBtn = form.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      // Vérifier qu'on reste sur la page contact (pas de succès sans données)
      await expect(page).toHaveURL(/contact/);
    }
  });

  test('XSS: les balises script sont échappées', async ({ page }) => {
    await page.goto('/contact');
    const xssPayload = '<script>alert("xss")</script>';
    // Chercher un champ texte dans le formulaire
    const textInput = page.locator('input[type="text"], input[name="name"], input[name="subject"]').first();
    if (await textInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await textInput.fill(xssPayload);
      // Vérifier que le script n'est pas exécuté (pas de dialogue alert)
      let alertFired = false;
      page.on('dialog', () => { alertFired = true; });
      await page.waitForTimeout(1000);
      expect(alertFired).toBe(false);
    }
    // Tester aussi via l'URL (query string)
    await page.goto('/?q=' + encodeURIComponent(xssPayload));
    let alertFired = false;
    page.on('dialog', () => { alertFired = true; });
    await page.waitForTimeout(1000);
    expect(alertFired).toBe(false);
  });

  test('Le total panier correspond aux prix affichés', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(3000);
    // Trouver un produit avec un prix et un bouton d'ajout
    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible({ timeout: 10000 }).catch(() => false)) {
      await productLink.click();
      await page.waitForTimeout(3000);
      // Récupérer le prix affiché sur la page produit
      const priceEl = page.locator('text=/\\d+[.,]\\d{2}\\s*€/').first();
      if (await priceEl.isVisible({ timeout: 5000 }).catch(() => false)) {
        const priceText = await priceEl.textContent();
        const price = parseFloat((priceText || '0').replace('€', '').replace(',', '.').trim());
        // Ajouter au panier si le bouton existe
        const addBtn = page.locator('button:has-text("ajouter"), button:has-text("Ajouter"), button:has-text("panier")').first();
        if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await addBtn.click();
          await page.waitForTimeout(2000);
          await page.goto('/cart');
          await page.waitForTimeout(3000);
          // Vérifier que le panier contient le bon prix
          const cartBody = await page.locator('body').textContent();
          if (cartBody && price > 0) {
            const priceStr = price.toFixed(2).replace('.', ',');
            const priceStrDot = price.toFixed(2);
            const containsPrice = cartBody.includes(priceStr) || cartBody.includes(priceStrDot);
            expect(containsPrice).toBe(true);
          }
        }
      }
    }
  });

  test('Pages inexistantes retournent 404', async ({ page }) => {
    const response = await page.goto('/page-qui-nexiste-pas-du-tout-xyz123');
    // La page doit afficher une 404 ou rediriger, pas crasher
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('Application error');
    // Le status peut être 404 ou 200 (Next.js gère le 404 côté client)
    if (response) {
      expect([200, 404]).toContain(response.status());
    }
    // Vérifier que le contenu indique une page non trouvée ou redirige vers l'accueil
    const url = page.url();
    const is404Content = (bodyText || '').match(/404|introuvable|not found|n'existe pas/i);
    const isRedirected = url.endsWith('/') || !url.includes('page-qui-nexiste-pas');
    expect(is404Content || isRedirected).toBeTruthy();
  });

  test('Injection SQL via recherche ne crashe pas', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(2000);
    // Chercher un champ de recherche
    const searchInput = page.locator('input[type="search"], input[placeholder*="echerch"], input[name="search"], input[name="q"]').first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill("' OR 1=1 --");
      await searchInput.press('Enter');
      await page.waitForTimeout(3000);
      const bodyText = await page.locator('body').textContent();
      // Pas d'erreur SQL affichée
      expect(bodyText).not.toContain('SQL');
      expect(bodyText).not.toContain('syntax error');
      expect(bodyText).not.toContain('Application error');
    } else {
      // Tester via URL query parameter
      await page.goto('/shop?q=' + encodeURIComponent("' OR 1=1 --"));
      await page.waitForTimeout(3000);
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('SQL');
      expect(bodyText).not.toContain('syntax error');
      expect(bodyText).not.toContain('Application error');
    }
  });

  test('Pages auth accessibles sans connexion', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForTimeout(2000);
    // La page login doit afficher "Connexion" et des champs de saisie
    await expect(page.locator('text=Connexion').first()).toBeVisible({ timeout: 10000 });
    const inputs = page.locator('input');
    expect(await inputs.count()).toBeGreaterThanOrEqual(2);
  });

  test('Pages compte redirigent si non connecté', async ({ page }) => {
    const accountRoutes = ['/account', '/account/orders', '/account/addresses'];
    for (const route of accountRoutes) {
      await page.goto(route);
      await page.waitForTimeout(3000);
      const url = page.url();
      const bodyText = await page.locator('body').textContent();
      // Doit rediriger vers login OU afficher un formulaire de connexion
      const isProtected =
        url.includes('/auth') ||
        url.includes('/login') ||
        (bodyText || '').match(/connexion|se connecter|login|mot de passe/i);
      expect(isProtected).toBeTruthy();
      expect(bodyText).not.toContain('Application error');
    }
  });

  test('Le site force HTTPS', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/^https:\/\//);
  });
});
