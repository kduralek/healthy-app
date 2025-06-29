import type { RecipeDraftDTO } from '@/types';
import { OpenRouterService } from './openrouter.service';
import { MockOpenRouterService } from './openrouter.service.mock';

// Use mock service in test environment or when explicitly requested
// Also use mock if no API key is provided to avoid authentication errors
const shouldUseMock =
  import.meta.env.USE_MOCK_OPENROUTER === 'true' ||
  import.meta.env.NODE_ENV === 'test' ||
  process.env.USE_MOCK_OPENROUTER === 'true' || // Add this for CI
  process.env.CI === 'true' || // Add this for any CI environment
  !import.meta.env.OPENROUTER_API_KEY ||
  import.meta.env.OPENROUTER_API_KEY === '';

// Debug logging for service selection
console.log('RecipeDraft Service Configuration:', {
  USE_MOCK_OPENROUTER: import.meta.env.USE_MOCK_OPENROUTER,
  NODE_ENV_importMeta: import.meta.env.NODE_ENV,
  NODE_ENV_process: process.env.NODE_ENV,
  hasApiKey: !!import.meta.env.OPENROUTER_API_KEY,
  shouldUseMock,
});

const openRouter = shouldUseMock
  ? new MockOpenRouterService()
  : new OpenRouterService(import.meta.env.OPENROUTER_API_KEY, {
      defaultModel: 'gpt-4o-mini',
      defaultParams: {
        max_tokens: 1000,
        temperature: 0.7,
      },
    });

const RECIPE_SYSTEM_PROMPT = `You are a professional chef and nutritionist. Generate a detailed, well-structured recipe based on the user's prompt.
The recipe should include:
1. A clear, concise title
2. A list of ingredients with measurements
3. Step-by-step cooking instructions
4. Any relevant nutritional notes or tips

Format the recipe in Markdown, in Polish.`;

export async function generateRecipeDraft(prompt: string): Promise<RecipeDraftDTO> {
  const startTime = performance.now();

  try {
    const completion = await openRouter.createChatCompletion({
      messages: [
        { role: 'system', content: RECIPE_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No recipe content generated');
    }

    // Extract title from the first line of markdown (assumes first line is a # heading)
    const title = content.split('\n')[0].replace(/^#\s*/, '').trim();

    const endTime = performance.now();
    const generationDuration = Math.round(endTime - startTime);

    return {
      title,
      content,
      generated_at: new Date().toISOString(),
      generation_duration: generationDuration,
    };
  } catch (error) {
    console.error('Recipe generation failed:', error);
    throw new Error('Failed to generate recipe. Please try again later.');
  }
}
