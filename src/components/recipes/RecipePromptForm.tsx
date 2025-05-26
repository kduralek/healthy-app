import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { usePromptForm } from './hooks/usePromptForm';

interface RecipePromptFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function RecipePromptForm({ onSubmit, isLoading, error }: RecipePromptFormProps) {
  const { state, handleChange, handleSubmit } = usePromptForm(onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-test-id="recipe-prompt-form">
      <div className="space-y-2">
        <Textarea
          placeholder="Opisz przepis, który chcesz wygenerować..."
          value={state.prompt}
          onChange={handleChange}
          disabled={isLoading}
          className="min-h-[120px]"
          data-test-id="recipe-prompt-input"
        />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-4">
        {isLoading && <Spinner size="sm" text="Generuję przepis..." />}
        <Button type="submit" disabled={!state.isValid || isLoading} data-test-id="generate-recipe-button">
          Generuj przepis
        </Button>
      </div>
    </form>
  );
}
