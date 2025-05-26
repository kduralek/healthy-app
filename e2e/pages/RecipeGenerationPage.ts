import { BasePage } from './BasePage';

/**
 * Page Object Model for the Recipe Generation page
 */
export class RecipeGenerationPage extends BasePage {
  // Selectors
  private readonly contentSelector = '[data-test-id="recipe-generation-content"]';
  private readonly promptFormSelector = '[data-test-id="recipe-prompt-form"]';
  private readonly promptInputSelector = '[data-test-id="recipe-prompt-input"]';
  private readonly generateButtonSelector = '[data-test-id="generate-recipe-button"]';

  // Recipe preview selectors
  private readonly recipePreviewSelector = '[data-test-id="recipe-preview-card"]';
  private readonly recipeContentSelector = '[data-test-id="recipe-preview-content"]';
  private readonly saveButtonSelector = '[data-test-id="save-recipe-button"]';
  private readonly discardButtonSelector = '[data-test-id="discard-recipe-button"]';

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
    await this.page.fill(this.promptInputSelector, prompt);
  }

  /**
   * Click on the generate recipe button
   */
  async clickGenerateButton() {
    await this.page.click(this.generateButtonSelector);
    // Wait for the recipe to be generated
    await this.page.waitForSelector(this.recipePreviewSelector, { state: 'visible', timeout: 10000 });
  }

  /**
   * Generate a recipe with the provided prompt
   */
  async generateRecipe(prompt: string) {
    await this.fillPromptForm(prompt);
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
    await this.page.waitForSelector(this.promptFormSelector, { state: 'visible' });
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
}
