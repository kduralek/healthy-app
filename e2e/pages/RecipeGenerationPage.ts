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

  // Loading and error selectors
  private readonly loadingSpinnerSelector = '.animate-spin';
  private readonly errorAlertSelector = '.text-destructive';

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
    // Wait for the input to be available
    await this.page.waitForSelector(this.promptInputSelector, { state: 'visible' });

    // Focus the input first
    await this.page.locator(this.promptInputSelector).focus();

    // Clear any existing content
    await this.page.locator(this.promptInputSelector).clear();

    // Use pressSequentially to properly trigger React onChange events
    await this.page.locator(this.promptInputSelector).pressSequentially(prompt);

    // Verify the text was filled correctly
    await expect(this.page.locator(this.promptInputSelector)).toHaveValue(prompt);

    // Add a small delay to ensure React state updates have time to process
    await this.page.waitForTimeout(200);
  }

  /**
   * Get the current disabled state of the generate button
   */
  async isGenerateButtonDisabled(): Promise<boolean> {
    const button = this.page.locator(this.generateButtonSelector);
    return await button.isDisabled();
  }

  /**
   * Wait for the generate button to become enabled
   */
  async waitForGenerateButtonEnabled(timeout = 10000) {
    await expect(this.page.locator(this.generateButtonSelector)).toBeEnabled({ timeout });
  }

  /**
   * Click the generate button to start recipe generation
   */
  async clickGenerateButton() {
    // First wait for the button to become enabled
    await this.waitForGenerateButtonEnabled();

    // Click the button
    await this.page.click(this.generateButtonSelector);
  }

  /**
   * Generate a recipe with the provided prompt
   */
  async generateRecipe(prompt: string) {
    await this.fillPromptForm(prompt);
    await this.clickGenerateButton();
    await this.waitForRecipeGeneration();
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
    // Ensure the content is visible before trying to get it
    await this.page.waitForSelector(this.recipeContentSelector, { state: 'visible' });
    return await this.page.textContent(this.recipeContentSelector);
  }

  /**
   * Click on the save recipe button
   */
  async clickSaveButton() {
    // Ensure button is enabled and visible
    await expect(this.page.locator(this.saveButtonSelector)).toBeVisible();
    await expect(this.page.locator(this.saveButtonSelector)).toBeEnabled();

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
    // Ensure button is enabled before clicking
    await expect(this.page.locator(this.discardButtonSelector)).toBeEnabled();

    await this.page.click(this.discardButtonSelector);

    // Wait for the form to reappear
    await this.page.waitForSelector(this.promptFormSelector, {
      state: 'visible',
    });

    // Ensure the preview is no longer visible
    await expect(this.page.locator(this.recipePreviewSelector)).not.toBeVisible();
  }

  /**
   * Check if save was successful
   */
  async isSaveSuccessful() {
    return await this.page.isVisible(`${this.saveButtonSelector} >> text=Zapisano`);
  }

  /**
   * Check if there's a loading state
   */
  async isRecipeLoading() {
    return await this.page.isVisible(this.loadingSpinnerSelector);
  }

  /**
   * Check if there's an error state
   */
  async hasError() {
    return await this.page.isVisible(this.errorAlertSelector);
  }

  /**
   * Get error message if present
   */
  async getErrorMessage() {
    const errorElement = this.page.locator(this.errorAlertSelector);
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  /**
   * Wait for recipe generation to complete (success or error)
   */
  async waitForRecipeGeneration() {
    // First, wait for loading to start
    await this.page.waitForSelector(this.loadingSpinnerSelector, {
      state: 'visible',
      timeout: 5000,
    });

    // Then wait for loading to finish
    await this.page.waitForSelector(this.loadingSpinnerSelector, {
      state: 'hidden',
      timeout: 30000,
    });

    // Now check the final state - either success or error
    const isPreviewVisible = await this.isRecipePreviewVisible();
    const hasError = await this.hasError();

    if (!isPreviewVisible && !hasError) {
      throw new Error('Recipe generation completed but neither success nor error state is visible');
    }

    if (hasError) {
      const errorMessage = await this.getErrorMessage();
      throw new Error(`Recipe generation failed: ${errorMessage}`);
    }
  }
}
