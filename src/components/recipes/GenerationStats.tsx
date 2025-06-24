import { Clock } from 'lucide-react';

interface GenerationStatsProps {
  generatedAt: string;
  generationDuration: number;
}

export function GenerationStats({ generatedAt, generationDuration }: GenerationStatsProps) {
  const formattedDate = new Date(generatedAt).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const formattedDuration = (generationDuration / 1000).toFixed(1);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="generation-stats">
      <Clock className="h-4 w-4" />
      <span>
        Wygenerowano {formattedDate} (czas generowania: {formattedDuration}s)
      </span>
    </div>
  );
}
