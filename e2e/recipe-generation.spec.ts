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

    // Verify final state
    expect(await authenticatedPage.isRecipePreviewVisible()).toBeTruthy();

    // Get recipe content for verification
    const recipeContent = await authenticatedPage.getRecipeContent();
    expect(recipeContent).toBeTruthy();

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

    // Verify we're back to the prompt form
    expect(await authenticatedPage.isRecipePreviewVisible()).toBeFalsy();
  });
});
