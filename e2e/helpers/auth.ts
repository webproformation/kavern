import { Page, expect } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Attendre que le redirect post-login soit terminé
  await page.waitForURL(url => !url.pathname.includes('/auth/login'), { timeout: 15000 });
  await page.waitForTimeout(1500);
}

export async function logout(page: Page) {
  // Utiliser localStorage + navigation pour déconnecter proprement
  await page.evaluate(() => {
    localStorage.removeItem('kavern_cart');
    localStorage.removeItem('cart');
  });
  await page.goto('/');
  const userBtn = page.locator('header button:has(svg)').nth(1);
  if (await userBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await userBtn.click();
    const logoutBtn = page.locator('button:has-text("Déconnexion"), button:has-text("déconnecter")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
    }
  }
}

export async function addFirstProductToCart(page: Page): Promise<boolean> {
  await page.goto('/shop');
  await page.waitForTimeout(3000);
  const productLink = page.locator('a[href*="/product/"]').first();
  if (!(await productLink.isVisible({ timeout: 10000 }).catch(() => false))) return false;

  await productLink.click();
  await page.waitForLoadState('networkidle');

  // Sélectionner une variante si nécessaire
  const variationBtn = page.locator('[class*="variation"] button:not([disabled]), button[class*="swatch"]:not([disabled])').first();
  if (await variationBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await variationBtn.click();
    await page.waitForTimeout(500);
  }

  const addBtn = page.locator('button:has-text("panier"), button:has-text("craque"), button:has-text("Ajouter")').first();
  if (!(await addBtn.isVisible({ timeout: 5000 }).catch(() => false))) return false;
  if (await addBtn.isDisabled()) return false;

  await addBtn.click();
  await page.waitForTimeout(2000);
  return true;
}

export function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Variable d'environnement manquante: ${name}`);
  return val;
}

export function skipIfMissing(name: string): string | null {
  return process.env[name] || null;
}
