import { useState, useEffect } from 'react';
import type { CreateRecipeCommand, RecipeDraftDTO } from '@/types';
import { useUserPreferences } from './useUserPreferences';

interface RecipeGenerationState {
  isLoading: boolean;
  error: string | null;
  recipeDraft: RecipeDraftDTO | null;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  savedRecipeId: string | null;
}

// Response interfaces for API endpoints
interface RecipeGenerationErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

interface RecipeSaveSuccessResponse {
  id: string;
}

interface RecipeSaveErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export function useRecipeGeneration() {
  const [state, setState] = useState<RecipeGenerationState>({
    isLoading: false,
    error: null,
    recipeDraft: null,
    isSaving: false,
    saveError: null,
    saveSuccess: false,
    savedRecipeId: null,
  });

  const { preferences, error: preferencesError } = useUserPreferences();

  // Handle navigation after successful save
  useEffect(() => {
    if (state.saveSuccess && state.savedRecipeId) {
      // Use setTimeout to ensure the success state is visible before navigation
      const timer = setTimeout(() => {
        window.location.href = `/recipes/${state.savedRecipeId}`;
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.saveSuccess, state.savedRecipeId]);

  const generateRecipe = async (prompt: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/users/me/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as RecipeGenerationErrorResponse;
        throw new Error(errorData.error || 'Wystąpił błąd podczas generowania przepisu');
      }

      const recipeDraft = (await response.json()) as RecipeDraftDTO;
      setState((prev) => ({ ...prev, isLoading: false, recipeDraft }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Wystąpił nieznany błąd',
      }));
    }
  };

  const saveRecipe = async () => {
    if (!state.recipeDraft) return;

    if (preferencesError) {
      setState((prev) => ({
        ...prev,
        saveError: 'Nie udało się pobrać preferencji użytkownika. Spróbuj ponownie później.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true, saveError: null }));
    try {
      const createRecipeCommand: CreateRecipeCommand = {
        title: state.recipeDraft.title,
        content: state.recipeDraft.content,
        diets: preferences?.diets ?? [],
        allergens: preferences?.allergens ?? [],
      };

      const response = await fetch('/api/users/me/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createRecipeCommand),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as RecipeSaveErrorResponse;
        throw new Error(errorData.error || 'Wystąpił błąd podczas zapisywania przepisu');
      }

      const { id } = (await response.json()) as RecipeSaveSuccessResponse;
      setState((prev) => ({
        ...prev,
        isSaving: false,
        saveSuccess: true,
        savedRecipeId: id,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Wystąpił nieznany błąd',
      }));
    }
  };

  const discardRecipe = () => {
    setState((prev) => ({
      ...prev,
      recipeDraft: null,
      saveSuccess: false,
      saveError: null,
      savedRecipeId: null,
    }));
  };

  return { state, generateRecipe, saveRecipe, discardRecipe };
}
