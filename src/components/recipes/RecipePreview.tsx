import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SaveButton } from './SaveButton';
import { GenerationStats } from './GenerationStats';
import { Spinner } from '@/components/ui/spinner';
import type { RecipeDraftDTO } from '@/types';

interface RecipePreviewProps {
  recipeDraft: RecipeDraftDTO;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  isLoadingPreferences?: boolean;
}

export function RecipePreview({
  recipeDraft,
  onSave,
  onDiscard,
  isSaving,
  saveError,
  saveSuccess,
  isLoadingPreferences = false,
}: RecipePreviewProps) {
  return (
    <Card className="w-full" data-testid="recipe-preview-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{recipeDraft.title}</span>
          <GenerationStats
            generatedAt={recipeDraft.generated_at}
            generationDuration={recipeDraft.generation_duration}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="whitespace-pre-wrap" data-testid="recipe-preview-content">
          {recipeDraft.content}
        </div>

        {isLoadingPreferences && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" />
            <span>Ładowanie preferencji użytkownika...</span>
          </div>
        )}

        {saveError && (
          <Alert variant="destructive">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={onDiscard} disabled={isSaving} data-testid="discard-recipe-button">
          Odrzuć
        </Button>
        <SaveButton
          onClick={onSave}
          isSaving={isSaving}
          disabled={saveSuccess || isLoadingPreferences}
          saveSuccess={saveSuccess}
        />
      </CardFooter>
    </Card>
  );
}
