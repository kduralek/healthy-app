import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RecipeGenerationPage } from '../pages/RecipeGenerationPage';

const E2E_USERNAME = process.env.E2E_USERNAME || '';
const E2E_PASSWORD = process.env.E2E_PASSWORD || '';

// Define test fixtures
interface AuthFixtures {
  loginPage: LoginPage;
  recipeGenerationPage: RecipeGenerationPage;
  authenticatedPage: RecipeGenerationPage;
}

/**
 * Helper functions to avoid React hooks linting errors
 */
async function setupLoginPage(page: Page, callback: (page: LoginPage) => Promise<void>) {
  const loginPage = new LoginPage(page);
  await callback(loginPage);
}

async function setupRecipeGenerationPage(page: Page, callback: (page: RecipeGenerationPage) => Promise<void>) {
  const recipeGenerationPage = new RecipeGenerationPage(page);
  await callback(recipeGenerationPage);
}

async function setupAuthenticatedPage(page: Page, callback: (page: RecipeGenerationPage) => Promise<void>) {
  const loginPage = new LoginPage(page);
  const recipeGenerationPage = new RecipeGenerationPage(page);

  // Check if credentials are provided
  if (!E2E_USERNAME || !E2E_PASSWORD) {
    throw new Error('E2E_USERNAME and E2E_PASSWORD environment variables must be set');
  }

  await loginPage.goto();

  // Perform login
  await loginPage.fillLoginForm(E2E_USERNAME, E2E_PASSWORD);

  // Wait for the login API response and navigation
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/auth/login') && response.status() === 200),
    loginPage.submitLoginForm(),
  ]);

  // Wait for redirection to complete - be more flexible with URL pattern
  await page.waitForURL('**/app/recipes/generate', { timeout: 10000 });

  await page.waitForSelector('[data-testid="recipe-generation-content"]', {
    state: 'visible',
    timeout: 10000,
  });

  // Additional check to ensure the page is fully loaded
  await recipeGenerationPage.isLoaded();

  await callback(recipeGenerationPage);
}

// Extend base test with our fixtures
export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await setupLoginPage(page, use);
  },

  recipeGenerationPage: async ({ page }, use) => {
    await setupRecipeGenerationPage(page, use);
  },

  // Fixture that handles authentication automatically
  authenticatedPage: async ({ page }, use) => {
    await setupAuthenticatedPage(page, use);
  },
});

// Re-export expect
export { expect } from '@playwright/test';
