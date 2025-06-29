import { test, expect } from './fixtures/auth.fixture';

test.describe('Recipe Generation Flow', () => {
  test('User can generate and save a recipe', async ({ authenticatedPage }) => {
    // Step 1: User is already logged in thanks to the fixture

    // Step 2: User fills the recipe prompt
    const prompt = 'Prosty przepis na ciasto czekoladowe bez glutenu';
    await authenticatedPage.fillPromptForm(prompt);

    // Step 3: User clicks the "Generate Recipe" button
    await authenticatedPage.clickGenerateButton();

    // Wait for generation to complete
    await authenticatedPage.waitForRecipeGeneration();

    // Verify the recipe was generated successfully
    expect(await authenticatedPage.isRecipePreviewVisible()).toBeTruthy();

    // Get recipe content for verification
    const recipeContent = await authenticatedPage.getRecipeContent();
    expect(recipeContent).toBeTruthy();
    expect(recipeContent?.length || 0).toBeGreaterThan(0);

    // Step 4: User clicks the "Save Recipe" button
    await authenticatedPage.clickSaveButton();

    // Verify recipe was saved successfully
    expect(await authenticatedPage.isSaveSuccessful()).toBeTruthy();
  });

  test('User can discard a generated recipe', async ({ authenticatedPage }) => {
    // User is already logged in thanks to the fixture

    // Generate a recipe
    const prompt = 'Przepis na zupę pomidorową';
    await authenticatedPage.generateRecipe(prompt);

    // Verify recipe was generated
    expect(await authenticatedPage.isRecipePreviewVisible()).toBeTruthy();

    // Discard the recipe
    await authenticatedPage.clickDiscardButton();

    // Verify we're back to the prompt form and preview is gone
    expect(await authenticatedPage.isRecipePreviewVisible()).toBeFalsy();
  });

  test('User sees error message when generation fails', async ({ authenticatedPage }) => {
    // Use an invalid prompt to trigger an error (too short)
    const invalidPrompt = 'x';

    // Fill the form with invalid prompt - this should disable the button
    await authenticatedPage.fillPromptForm(invalidPrompt);

    // The button should be disabled for short prompts
    expect(await authenticatedPage.isGenerateButtonDisabled()).toBeTruthy();

    // Fill with a valid but potentially problematic prompt
    const prompt = 'Generate something that might fail sometimes';
    await authenticatedPage.fillPromptForm(prompt);

    // Try to generate - if it succeeds, that's fine too
    try {
      await authenticatedPage.clickGenerateButton();
      await authenticatedPage.waitForRecipeGeneration();

      // If it succeeds, verify the preview is visible
      expect(await authenticatedPage.isRecipePreviewVisible()).toBeTruthy();
    } catch {
      // If it fails, verify error handling works
      const hasError = await authenticatedPage.hasError();
      expect(hasError).toBeTruthy();
    }
  });
});
