import { useRecipeGeneration } from './hooks/useRecipeGeneration';
import { useUserPreferences } from './hooks/useUserPreferences';
import { RecipePromptForm } from './RecipePromptForm';
import { RecipePreview } from './RecipePreview';
import { RecipePreviewSkeleton } from './RecipePreviewSkeleton';
import { ErrorBoundary } from './ErrorBoundary';

export function RecipeGenerationView() {
  const { state, generateRecipe, saveRecipe, discardRecipe } = useRecipeGeneration();
  const { isLoading: isLoadingPreferences } = useUserPreferences();

  const content = (
    <div className="space-y-8" data-testid="recipe-generation-content">
      {!state.recipeDraft ? (
        <RecipePromptForm onSubmit={generateRecipe} isLoading={state.isLoading} error={state.error} />
      ) : state.isLoading ? (
        <RecipePreviewSkeleton />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RecipePreview
            recipeDraft={state.recipeDraft}
            onSave={saveRecipe}
            onDiscard={discardRecipe}
            isSaving={state.isSaving}
            saveError={state.saveError}
            saveSuccess={state.saveSuccess}
            isLoadingPreferences={isLoadingPreferences}
          />
        </div>
      )}
    </div>
  );

  return <ErrorBoundary>{content}</ErrorBoundary>;
}
