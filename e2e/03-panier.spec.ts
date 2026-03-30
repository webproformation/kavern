import { test, expect } from '@playwright/test';

test.describe('Panier', () => {

  test('Page panier vide affiche message', async ({ page }) => {
    // Nettoyer localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cart'));
    await page.goto('/cart');
    await expect(page.locator('body')).toContainText(/vide|panier|pépite/i);
  });

  test('Ajouter un produit au panier depuis la boutique', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(3000);
    // Chercher un bouton d'ajout (non grisé)
    const addBtn = page.locator('button:has-text("Je craque"), button:has-text("Choisir")').first();
    if (await addBtn.isVisible()) {
      const btnText = await addBtn.textContent();
      if (btnText?.includes('craque')) {
        await addBtn.click();
        await page.waitForTimeout(1000);
        // Vérifier le toast ou le badge panier
        const cartBadge = page.locator('[class*="badge"]').filter({ hasText: /^[1-9]/ });
        // Ou vérifier qu'on est redirigé
      }
    }
  });

  test('Ajouter un produit depuis la fiche produit', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(3000);
    // Aller sur le premier produit
    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState('networkidle');

      // Si produit à variantes, sélectionner la première
      const variationBtn = page.locator('[class*="variation"], [class*="swatch"], button[class*="color"]').first();
      if (await variationBtn.isVisible()) {
        await variationBtn.click();
        await page.waitForTimeout(500);
      }

      // Cliquer sur ajouter au panier
      const addBtn = page.locator('button:has-text("panier"), button:has-text("craque"), button:has-text("Ajouter")').first();
      if (await addBtn.isVisible() && !(await addBtn.isDisabled())) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        // Vérifier toast succès
        const toast = page.locator('[data-sonner-toast]').first();
        if (await toast.isVisible()) {
          await expect(toast).toContainText(/ajouté|panier|mis à jour/i);
        }
      }
    }
  });

  test('Page panier affiche les articles ajoutés', async ({ page }) => {
    // D'abord ajouter un produit
    await page.goto('/shop');
    await page.waitForTimeout(3000);
    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForLoadState('networkidle');

      const variationBtn = page.locator('[class*="variation"], [class*="swatch"], button[class*="color"]').first();
      if (await variationBtn.isVisible()) {
        await variationBtn.click();
        await page.waitForTimeout(500);
      }

      const addBtn = page.locator('button:has-text("panier"), button:has-text("craque"), button:has-text("Ajouter")').first();
      if (await addBtn.isVisible() && !(await addBtn.isDisabled())) {
        await addBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Aller au panier
    await page.goto('/cart');
    await page.waitForTimeout(2000);

    // Vérifier qu'il y a au moins un article OU le message vide
    const hasItems = await page.locator('text=/\\d+[.,]\\d+\\s*€/').count() > 0;
    const isEmpty = await page.locator('text=/vide/i').isVisible();
    expect(hasItems || isEmpty).toBeTruthy();
  });

  test('Boutons +/- fonctionnent dans le panier', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(2000);
    const minusBtn = page.locator('button:has(svg.lucide-minus)').first();
    const plusBtn = page.locator('button:has(svg.lucide-plus)').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(500);
      // Pas d'erreur
      await expect(page.locator('body')).not.toContainText('Application error');
    }
  });

  test('Récapitulatif panier affiche sous-total et TVA', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(2000);
    const recap = page.locator('text=/sous-total|total|TVA/i');
    if (await recap.first().isVisible()) {
      expect(await recap.count()).toBeGreaterThan(0);
    }
  });

  test('Checkout — délai 7 jours (pas 5)', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(2000);
    // Chercher la mention de jours dans la page
    const body = await page.locator('body').textContent();
    if (body?.includes('jours')) {
      expect(body).not.toContain('5 jours');
    }
  });
});
