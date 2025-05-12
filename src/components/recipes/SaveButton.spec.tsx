import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveButton } from './SaveButton';

// Mock dla komponentów z lucide-react
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => (
    <span data-testid="check-icon" className={className}>
      ✓
    </span>
  ),
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="loader-icon" className={className}>
      ⟳
    </span>
  ),
}));

describe('SaveButton', () => {
  const mockOnClick = vi.fn().mockResolvedValue(undefined);

  // Helper function for common render
  const renderComponent = ({ onClick = mockOnClick, isSaving = false, disabled = false, saveSuccess = false } = {}) => {
    return render(<SaveButton onClick={onClick} isSaving={isSaving} disabled={disabled} saveSuccess={saveSuccess} />);
  };

  it('renders default state correctly', () => {
    renderComponent();

    expect(screen.getByRole('button')).toHaveTextContent('Zapisz przepis');
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
  });

  it('shows loading state when isSaving is true', () => {
    renderComponent({ isSaving: true });

    expect(screen.getByRole('button')).toHaveTextContent('Zapisuję...');
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
  });

  it('shows success state when saveSuccess is true', () => {
    renderComponent({ saveSuccess: true });

    expect(screen.getByRole('button')).toHaveTextContent('Zapisano');
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
  });

  it('is disabled when prop disabled is true', () => {
    renderComponent({ disabled: true });

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isSaving is true', () => {
    renderComponent({ isSaving: true });

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has secondary variant when saveSuccess is true', () => {
    renderComponent({ saveSuccess: true });

    // Sprawdzamy, że przycisk ma odpowiedni variant
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-secondary');
  });

  it('has default variant when saveSuccess is false', () => {
    renderComponent({ saveSuccess: false });

    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-primary');
  });

  it('calls onClick when clicked', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has minimum width specified for consistent UI', () => {
    renderComponent();

    const button = screen.getByRole('button');
    expect(button.className).toContain('min-w-[100px]');
  });
});
