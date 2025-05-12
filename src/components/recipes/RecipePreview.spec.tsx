import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipePreview } from './RecipePreview';
import type { RecipeDraftDTO } from '@/types';

// Mocking child components for controlled testing
vi.mock('./GenerationStats', () => ({
  GenerationStats: ({ generatedAt, generationDuration }: { generatedAt: string; generationDuration: number }) => (
    <div data-testid="generation-stats">
      {generatedAt}-{generationDuration}
    </div>
  ),
}));

vi.mock('./SaveButton', () => ({
  SaveButton: (props: {
    onClick: () => Promise<void>;
    isSaving: boolean;
    disabled?: boolean;
    saveSuccess?: boolean;
  }) => (
    <button
      data-testid="save-button-mock"
      onClick={props.onClick}
      disabled={props.disabled || props.isSaving}
      data-saving={props.isSaving ? 'true' : 'false'}
      data-success={props.saveSuccess ? 'true' : 'false'}
    >
      {props.isSaving ? 'Zapisuję...' : props.saveSuccess ? 'Zapisano' : 'Zapisz przepis'}
    </button>
  ),
}));

vi.mock('@/components/ui/spinner', () => ({
  Spinner: ({ size }: { size?: string }) => (
    <div data-testid="spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="alert" role="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-footer" className={className}>
      {children}
    </div>
  ),
}));

describe('RecipePreview', () => {
  // Mock data
  const mockRecipeDraft: RecipeDraftDTO = {
    title: 'Test Recipe',
    content: 'This is a test recipe content.',
    generated_at: '2023-06-15T14:30:00Z',
    generation_duration: 5000,
  };

  const mockSave = vi.fn().mockResolvedValue(undefined);
  const mockDiscard = vi.fn();

  // Helper function for common render
  const renderComponent = ({
    recipeDraft = mockRecipeDraft,
    onSave = mockSave,
    onDiscard = mockDiscard,
    isSaving = false,
    saveError = null as string | null,
    saveSuccess = false,
    isLoadingPreferences = false,
  } = {}) => {
    return render(
      <RecipePreview
        recipeDraft={recipeDraft}
        onSave={onSave}
        onDiscard={onDiscard}
        isSaving={isSaving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        isLoadingPreferences={isLoadingPreferences}
      />
    );
  };

  it('renders the recipe title and content correctly', () => {
    renderComponent();

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('This is a test recipe content.')).toBeInTheDocument();
  });

  it('passes correct props to GenerationStats component', () => {
    renderComponent();

    const statsElement = screen.getByTestId('generation-stats');
    expect(statsElement).toHaveTextContent('2023-06-15T14:30:00Z-5000');
  });

  it('shows loading preferences spinner when isLoadingPreferences is true', () => {
    renderComponent({ isLoadingPreferences: true });

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByText('Ładowanie preferencji użytkownika...')).toBeInTheDocument();
  });

  it('does not show loading preferences message when isLoadingPreferences is false', () => {
    renderComponent({ isLoadingPreferences: false });

    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.queryByText('Ładowanie preferencji użytkownika...')).not.toBeInTheDocument();
  });

  it('displays error alert when saveError is provided', () => {
    const errorMessage = 'Failed to save recipe';
    renderComponent({ saveError: errorMessage });

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert-description')).toHaveTextContent(errorMessage);
  });

  it('does not display error alert when saveError is null', () => {
    renderComponent({ saveError: null });

    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('calls onDiscard when discard button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Odrzuć'));
    expect(mockDiscard).toHaveBeenCalledTimes(1);
  });

  it('disables discard button when isSaving is true', () => {
    renderComponent({ isSaving: true });

    expect(screen.getByText('Odrzuć')).toBeDisabled();
  });

  it('passes correct props to SaveButton component', () => {
    renderComponent({
      isSaving: true,
      saveSuccess: true,
      isLoadingPreferences: false,
    });

    const saveButton = screen.getByTestId('save-button-mock');
    expect(saveButton).toHaveAttribute('data-saving', 'true');
    expect(saveButton).toHaveAttribute('data-success', 'true');
    expect(saveButton).toBeDisabled();
  });

  it('disables SaveButton when isLoadingPreferences is true', () => {
    renderComponent({ isLoadingPreferences: true });

    expect(screen.getByTestId('save-button-mock')).toBeDisabled();
  });

  it('disables SaveButton when saveSuccess is true', () => {
    renderComponent({ saveSuccess: true });

    expect(screen.getByTestId('save-button-mock')).toBeDisabled();
  });

  it('calls onSave when save button is clicked', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('save-button-mock'));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  // Edge case tests
  it('handles empty recipe content correctly', () => {
    const emptyContentRecipe = {
      ...mockRecipeDraft,
      content: '',
    };

    renderComponent({ recipeDraft: emptyContentRecipe });

    // The component should still render without errors
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    // Find the content div directly using the class name and data-testid approach
    const contentDiv = screen.getByTestId('card-content').querySelector('.whitespace-pre-wrap');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveTextContent('');
  });

  it('handles very long recipe titles correctly', () => {
    const longTitleRecipe = {
      ...mockRecipeDraft,
      title: 'A'.repeat(100), // Very long title
    };

    renderComponent({ recipeDraft: longTitleRecipe });

    // The component should handle long titles without breaking layout
    expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
  });

  it('handles all possible error states correctly', () => {
    // Testing with null error (no error)
    renderComponent({ saveError: null });
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();

    // Testing with empty string error (falsy value, alert nie powinien być pokazany)
    renderComponent({ saveError: '' as string });
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();

    // Testing with standard error message
    renderComponent({ saveError: 'Error saving recipe' as string });
    expect(screen.getByTestId('alert-description')).toHaveTextContent('Error saving recipe');
  });

  // Business logic tests
  it('should disable the save button when preferences are loading, following business rule', () => {
    renderComponent({ isLoadingPreferences: true });

    expect(screen.getByTestId('save-button-mock')).toBeDisabled();
    // Business rule: prevent saving when user preferences are still loading
  });

  it('should show success state in save button after successful save, following business rule', () => {
    renderComponent({ saveSuccess: true });

    expect(screen.getByTestId('save-button-mock')).toHaveAttribute('data-success', 'true');
    // Business rule: indicate successful save operation to the user
  });
});
