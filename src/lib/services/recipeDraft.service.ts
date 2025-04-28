import type { RecipeDraftDTO } from '@/types';

// TODO: Replace with actual AI integration in the future
// This is a mock implementation for development environment
export async function generateRecipeDraft(prompt: string): Promise<RecipeDraftDTO> {
  const startTime = performance.now();

  // Simulate AI processing time (1-3 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Mock recipe generation
  const title = `Recipe for ${prompt.split(' ').slice(0, 3).join(' ')}...`;
  const content = `
# ${title}

## Ingredients
- 2 cups of fresh ingredients
- 1 tablespoon of olive oil
- Salt and pepper to taste

## Instructions
1. Prepare all ingredients as directed.
2. Cook according to best practices.
3. Serve and enjoy!

This recipe was generated based on your prompt: "${prompt}"`;

  const endTime = performance.now();
  const generationDuration = Math.round(endTime - startTime);

  return {
    title,
    content,
    generated_at: new Date().toISOString(),
    generation_duration: generationDuration,
  };
}
