import type { Tables } from './db/database.types';

// DTO representing a Recipe from the database, directly linked to the recipes table row.
export type RecipeDTO = Tables<'recipes'>;

// DTO for AI-generated recipe drafts.
// It picks only the fields relevant for drafts.
export type RecipeDraftDTO = Pick<RecipeDTO, 'title' | 'content' | 'generated_at' | 'generation_duration'>;

// DTO for pagination metadata
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Command Models for Recipe Operations

// Command to generate a new recipe draft based on a user-provided prompt.
export interface GenerateRecipeDraftCommand {
  prompt: string;
}

// Command to update an existing recipe's details. Includes associated diets and allergens.
export interface UpdateRecipeCommand {
  title: string;
  content: string;
  diets: string[];
  allergens: string[];
}

// Command to create a new recipe. Includes associated diets and allergens.
export interface CreateRecipeCommand {
  title: string;
  content: string;
  diets: string[];
  allergens: string[];
}

// DTO for Diet, directly reflecting the diets table row.
export type DietDTO = Tables<'diets'>;

// DTO for Allergen, directly reflecting the allergens table row.
export type AllergenDTO = Tables<'allergens'>;

// DTO for User Preferences, containing arrays of diet and allergen IDs.
export interface UserPreferencesDTO {
  diets: string[];
  allergens: string[];
}

// Auth Commands
export interface UpdateUserPreferencesCommand {
  diets: string[];
  allergens: string[];
}

export interface RegisterUserCommand {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface ForgotPasswordCommand {
  email: string;
}

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface UpdatePasswordCommand {
  password: string;
  passwordConfirm: string;
}
