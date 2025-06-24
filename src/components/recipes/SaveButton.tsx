import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => Promise<void>;
  isSaving: boolean;
  disabled?: boolean;
  saveSuccess?: boolean;
}

export function SaveButton({ onClick, isSaving, disabled, saveSuccess }: SaveButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isSaving}
      variant={saveSuccess ? 'secondary' : 'default'}
      className="min-w-[100px]"
      data-testid="save-recipe-button"
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Zapisuję...
        </>
      ) : saveSuccess ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Zapisano
        </>
      ) : (
        'Zapisz przepis'
      )}
    </Button>
  );
}
