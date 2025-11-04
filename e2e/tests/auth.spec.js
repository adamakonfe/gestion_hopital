const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('should login successfully with admin credentials', async ({ page }) => {
    // Aller à la page de connexion
    await page.goto('/login');
    
    // Vérifier que la page de connexion est chargée
    await expect(page).toHaveTitle(/Hospital Management/);
    await expect(page.locator('h1, h2')).toContainText(/connexion|login/i);
    
    // Remplir le formulaire de connexion
    await page.fill('input[type="email"], input[name="email"]', 'admin@hospital.com');
    await page.fill('input[type="password"], input[name="password"]', 'password');
    
    // Cliquer sur le bouton de connexion
    await page.click('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")');
    
    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL(/dashboard|accueil/);
    
    // Vérifier la présence d'éléments du dashboard
    await expect(page.locator('nav, header')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Essayer avec des identifiants incorrects
    await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")');
    
    // Vérifier l'affichage d'un message d'erreur
    await expect(page.locator('text=/erreur|error|échec|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@hospital.com');
    await page.fill('input[type="password"], input[name="password"]', 'password');
    await page.click('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")');
    
    // Attendre la redirection
    await page.waitForURL(/dashboard|accueil/);
    
    // Chercher et cliquer sur le bouton de déconnexion
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout"), a:has-text("Déconnexion")');
    await logoutButton.click();
    
    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL(/login|connexion/);
  });
});
