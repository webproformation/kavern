import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {

  test('Page connexion charge correctement', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input#email, input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input#password').first()).toBeVisible();
    await expect(page.locator('button:has-text("connecter"), button[type="submit"]').first()).toBeVisible();
  });

  test('Page inscription charge correctement', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('input#firstName').first()).toBeVisible();
    await expect(page.locator('input#lastName').first()).toBeVisible();
    await expect(page.locator('input#email, input[type="email"]').first()).toBeVisible();
    await expect(page.locator('button:has-text("Créer"), button[type="submit"]').first()).toBeVisible();
  });

  test('Connexion avec mauvais identifiants affiche erreur', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'faux@email.com');
    await page.fill('input[id="password"]', 'mauvaisMotDePasse');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    // Erreur affichée
    await expect(page.locator('text=/incorrect|erreur|invalid/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('Header — pas de boutons auth superposés sur page login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForTimeout(1000);
    // Le dropdown du header ne devrait PAS afficher "Se connecter" / "Créer un compte"
    // quand on est déjà sur /auth/login
    const headerAuthBtn = page.locator('header button:has-text("Se connecter"), header a:has-text("Se connecter")');
    // Cliquer sur le user icon dans le header pour ouvrir le dropdown
    const userIcon = page.locator('header button:has(svg.lucide-user)').first();
    if (await userIcon.isVisible()) {
      await userIcon.click();
      await page.waitForTimeout(500);
      // Les boutons auth ne doivent pas apparaître
      expect(await headerAuthBtn.count()).toBe(0);
    }
  });

  test('Inscription — validation formulaire', async ({ page }) => {
    await page.goto('/auth/register');
    // Soumettre sans remplir
    await page.click('button[type="submit"], button:has-text("Créer mon compte")');
    await page.waitForTimeout(1000);
    // Le navigateur ou le code devrait bloquer (champs required)
    // On vérifie qu'on est toujours sur la page register
    expect(page.url()).toContain('/auth/register');
  });

  test('Mot de passe oublié charge', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.locator('input#email, input[type="email"]').first()).toBeVisible();
  });

  test('Lien "Créer un compte" depuis login', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('a[href="/auth/register"]');
    await expect(page).toHaveURL(/register/);
  });

  test('Lien "Se connecter" depuis register', async ({ page }) => {
    await page.goto('/auth/register');
    await page.click('a[href="/auth/login"]');
    await expect(page).toHaveURL(/login/);
  });
});
