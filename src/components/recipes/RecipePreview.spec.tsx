import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Setup component mocks BEFORE importing the component being tested - only for complex components
vi.mock('./GenerationStats', () => ({
  GenerationStats: ({ generatedAt, generationDuration }: { generatedAt: string; generationDuration: number }) => (
    <div data-testid="generation-stats">
      {generatedAt}-{generationDuration}
    </div>
  ),
}));

import { RecipePreview } from './RecipePreview';
import type { RecipeDraftDTO } from '@/types';

describe('RecipePreview', () => {
  // Test data
  const mockRecipeDraft: RecipeDraftDTO = {
    title: 'Test Recipe',
    content: 'This is a test recipe content.',
    generated_at: '2023-06-15T14:30:00Z',
    generation_duration: 5000,
  };

  const defaultProps = {
    recipeDraft: mockRecipeDraft,
    onSave: vi.fn().mockResolvedValue(undefined),
    onDiscard: vi.fn(),
    isSaving: false,
    saveError: null as string | null,
    saveSuccess: false,
    isLoadingPreferences: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (overrides = {}) => {
    const props = { ...defaultProps, ...overrides };
    return render(<RecipePreview {...props} />);
  };

  describe('Content Rendering', () => {
    it('renders recipe title and content correctly', () => {
      renderComponent();

      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText('This is a test recipe content.')).toBeInTheDocument();
    });

    it('passes correct props to GenerationStats component', () => {
      renderComponent();

      const statsElement = screen.getByTestId('generation-stats');
      expect(statsElement).toHaveTextContent('2023-06-15T14:30:00Z-5000');
    });

    it('handles empty recipe content correctly', () => {
      const emptyRecipe = { ...mockRecipeDraft, content: '' };
      renderComponent({ recipeDraft: emptyRecipe });

      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      // Now we can use the real data-testid from component
      const contentElement = screen.getByTestId('recipe-preview-content');
      expect(contentElement).toBeInTheDocument();
      expect(contentElement).toHaveTextContent('');
    });

    it('handles very long recipe titles correctly', () => {
      const longTitleRecipe = { ...mockRecipeDraft, title: 'A'.repeat(100) };
      renderComponent({ recipeDraft: longTitleRecipe });

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading preferences message when isLoadingPreferences is true', () => {
      renderComponent({ isLoadingPreferences: true });

      // Real component shows "Ładowanie preferencji użytkownika..."
      expect(screen.getByText('Ładowanie preferencji użytkownika...')).toBeInTheDocument();
      // Check for spinner by class
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('does not show loading preferences message when isLoadingPreferences is false', () => {
      renderComponent();

      expect(screen.queryByText('Ładowanie preferencji użytkownika...')).not.toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('displays error alert when saveError is provided', () => {
      const errorMessage = 'Failed to save recipe';
      renderComponent({ saveError: errorMessage });

      // Alert has role="alert" in real component
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('does not display error alert when saveError is null', () => {
      renderComponent();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('handles all possible error states correctly', () => {
      // Test null error (no error)
      renderComponent();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Test empty string error (falsy value)
      renderComponent({ saveError: '' });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onDiscard when discard button is clicked', () => {
      const onDiscard = vi.fn();
      renderComponent({ onDiscard });

      // Use role and name from real component
      fireEvent.click(screen.getByRole('button', { name: /odrzuć/i }));
      expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('calls onSave when save button is clicked', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      renderComponent({ onSave });

      // Real SaveButton renders "Zapisz przepis" text
      fireEvent.click(screen.getByRole('button', { name: /zapisz przepis/i }));
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('disables discard button when isSaving is true', () => {
      renderComponent({ isSaving: true });

      expect(screen.getByRole('button', { name: /odrzuć/i })).toBeDisabled();
    });

    it('disables SaveButton when isLoadingPreferences is true', () => {
      renderComponent({ isLoadingPreferences: true });

      expect(screen.getByRole('button', { name: /zapisz przepis/i })).toBeDisabled();
    });

    it('disables SaveButton when saveSuccess is true', () => {
      renderComponent({ saveSuccess: true });

      // When saveSuccess is true, button shows "Zapisano"
      expect(screen.getByRole('button', { name: /zapisano/i })).toBeDisabled();
    });

    it('shows saving state correctly', () => {
      renderComponent({ isSaving: true });

      // When isSaving is true, button shows "Zapisuję..."
      const savingButton = screen.getByRole('button', { name: /zapisuję/i });
      expect(savingButton).toBeDisabled();
      expect(savingButton).toHaveTextContent('Zapisuję...');
    });

    it('shows success state correctly', () => {
      renderComponent({ saveSuccess: true });

      // When saveSuccess is true, button shows "Zapisano"
      const successButton = screen.getByRole('button', { name: /zapisano/i });
      expect(successButton).toBeDisabled();
      expect(successButton).toHaveTextContent('Zapisano');
    });
  });

  describe('Business Logic', () => {
    it('should disable save button when preferences are loading', () => {
      renderComponent({ isLoadingPreferences: true });

      expect(screen.getByRole('button', { name: /zapisz przepis/i })).toBeDisabled();
      // Business rule: prevent saving when user preferences are still loading
    });

    it('should show success state in save button after successful save', () => {
      renderComponent({ saveSuccess: true });

      const saveButton = screen.getByRole('button', { name: /zapisano/i });
      expect(saveButton).toHaveTextContent('Zapisano');
      // Business rule: indicate successful save operation to the user
    });

    it('should show saving state when save operation is in progress', () => {
      renderComponent({ isSaving: true });

      expect(screen.getByRole('button', { name: /zapisuję/i })).toHaveTextContent('Zapisuję...');
      expect(screen.getByRole('button', { name: /odrzuć/i })).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles different generation durations correctly', () => {
      const fastRecipe = { ...mockRecipeDraft, generation_duration: 1000 };
      renderComponent({ recipeDraft: fastRecipe });

      expect(screen.getByTestId('generation-stats')).toHaveTextContent('1000');
    });

    it('renders correctly with all loading states disabled', () => {
      renderComponent();

      expect(screen.queryByText('Ładowanie preferencji użytkownika...')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zapisz przepis/i })).not.toBeDisabled();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
