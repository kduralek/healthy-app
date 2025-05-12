import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationStats } from './GenerationStats';

// Mock dla komponentu Clock z lucide-react
vi.mock('lucide-react', () => ({
  Clock: () => <span data-testid="clock-icon">🕒</span>,
}));

describe('GenerationStats', () => {
  const mockDate = '2023-06-15T14:30:00Z';
  const mockDuration = 5200; // 5.2 sekundy (w milisekundach)

  // Helper function for common render
  const renderComponent = ({ generatedAt = mockDate, generationDuration = mockDuration } = {}) => {
    return render(<GenerationStats generatedAt={generatedAt} generationDuration={generationDuration} />);
  };

  beforeEach(() => {
    // Mock toLocaleString instead of DateTimeFormat since that's what the component uses
    const originalToLocaleString = Date.prototype.toLocaleString;
    vi.spyOn(Date.prototype, 'toLocaleString').mockImplementation(function (this: Date, locale, options) {
      if (locale === 'pl-PL' && options?.dateStyle === 'medium' && options?.timeStyle === 'short') {
        return '15 cze 2023, 14:30';
      }
      return originalToLocaleString.call(this, locale, options);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with clock icon', () => {
    renderComponent();

    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('formats the generation date correctly', () => {
    renderComponent();

    const statsText = screen.getByText(/Wygenerowano/);
    expect(statsText).toHaveTextContent('15 cze 2023, 14:30');
  });

  it('formats the generation duration correctly', () => {
    renderComponent();

    const statsText = screen.getByText(/czas generowania/);
    expect(statsText).toHaveTextContent('czas generowania: 5.2s');
  });

  it('handles different generation durations', () => {
    renderComponent({ generationDuration: 1000 });

    const statsText = screen.getByText(/czas generowania/);
    expect(statsText).toHaveTextContent('czas generowania: 1.0s');
  });

  it('has text styled as muted-foreground', () => {
    renderComponent();

    const container = screen.getByText(/Wygenerowano/).closest('div');
    expect(container).toHaveClass('text-muted-foreground');
  });

  it('has small text size', () => {
    renderComponent();

    const container = screen.getByText(/Wygenerowano/).closest('div');
    expect(container).toHaveClass('text-sm');
  });

  it('displays items in a flex layout with gap', () => {
    renderComponent();

    const container = screen.getByText(/Wygenerowano/).closest('div');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('gap-2');
  });
});
