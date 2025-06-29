import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Recipe Generation page
 */
export class RecipeGenerationPage extends BasePage {
  // Selectors
  private readonly contentSelector = '[data-testid="recipe-generation-content"]';
  private readonly promptFormSelector = '[data-testid="recipe-prompt-form"]';
  private readonly promptInputSelector = '[data-testid="recipe-prompt-input"]';
  private readonly generateButtonSelector = '[data-testid="generate-recipe-button"]';

  // Recipe preview selectors
  private readonly recipePreviewSelector = '[data-testid="recipe-preview-card"]';
  private readonly recipeContentSelector = '[data-testid="recipe-preview-content"]';
  private readonly saveButtonSelector = '[data-testid="save-recipe-button"]';
  private readonly discardButtonSelector = '[data-testid="discard-recipe-button"]';

  /**
   * Navigate to the recipe generation page
   */
  async goto() {
    await super.goto('/app/recipes/generate');
  }

  /**
   * Check if the recipe generation page is loaded
   */
  async isLoaded() {
    return await this.page.isVisible(this.contentSelector);
  }

  /**
   * Fill in the recipe prompt form
   */
  async fillPromptForm(prompt: string) {
    await this.page.click(this.promptInputSelector);
    await this.page.fill(this.promptInputSelector, prompt);

    // Wait for form validation to enable the button
    await this.page.waitForSelector(this.generateButtonSelector + ':not([disabled])', {
      state: 'attached',
      timeout: 5000,
    });
  }

  /**
   * Click on the generate recipe button
   */
  async clickGenerateButton() {
    await this.page.click(this.generateButtonSelector);
    await this.page.waitForSelector(this.recipePreviewSelector, {
      state: 'visible',
      timeout: 15000, // Increased timeout for API call
    });
  }

  /**
   * Generate a recipe with the provided prompt
   */
  async generateRecipe(prompt: string) {
    await this.fillPromptForm(prompt);
    await expect(this.page.locator(this.generateButtonSelector)).toBeEnabled();
    await this.clickGenerateButton();
  }

  /**
   * Check if the recipe preview is visible
   */
  async isRecipePreviewVisible() {
    return await this.page.isVisible(this.recipePreviewSelector);
  }

  /**
   * Get the recipe content
   */
  async getRecipeContent() {
    return await this.page.textContent(this.recipeContentSelector);
  }

  /**
   * Click on the save recipe button
   */
  async clickSaveButton() {
    await this.page.click(this.saveButtonSelector);
    // Wait for the save process to complete
    await this.page.waitForSelector(`${this.saveButtonSelector} >> text=Zapisano`, {
      state: 'visible',
      timeout: 10000,
    });
  }

  /**
   * Click on the discard button
   */
  async clickDiscardButton() {
    await this.page.click(this.discardButtonSelector);
    // Wait for the form to reappear
    await this.page.waitForSelector(this.promptFormSelector, {
      state: 'visible',
    });
  }

  /**
   * Check if the generate button is disabled
   */
  async isGenerateButtonDisabled() {
    return await this.page.isDisabled(this.generateButtonSelector);
  }

  /**
   * Check if save was successful
   */
  async isSaveSuccessful() {
    return await this.page.isVisible(`${this.saveButtonSelector} >> text=Zapisano`);
  }

  // Add helper method to check loading state
  async isRecipeLoading() {
    return await this.page.isVisible('[data-testid="recipe-preview-skeleton"]');
  }

  async waitForRecipeGeneration() {
    // Wait for either success (preview) or error state
    await Promise.race([
      this.page.waitForSelector(this.recipePreviewSelector, { state: 'visible', timeout: 20000 }),
      this.page.waitForSelector('[data-testid="recipe-generation-error"]', { state: 'visible', timeout: 20000 }),
    ]);
  }
}
