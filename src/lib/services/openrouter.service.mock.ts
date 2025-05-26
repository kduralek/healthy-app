import type { ChatCompletionOptions, ChatCompletionResult } from '@/openrouter.types';

export class MockOpenRouterService {
  async createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const prompt = options.messages.find((m) => m.role === 'user')?.content || '';

    // Generate deterministic mock responses based on prompt
    const mockRecipes = {
      'ciasto czekoladowe': {
        title: 'Ciasto czekoladowe bez glutenu',
        content: `# Ciasto czekoladowe bez glutenu\n\n## Składniki:\n- 200g mąki bezglutenowej\n- 100g kakao\n- 200g cukru\n\n## Przygotowanie:\n1. Wymieszaj suche składniki\n2. Dodaj mokre składniki\n3. Piecz 30 minut w 180°C`,
      },
      'zupa pomidorowa': {
        title: 'Zupa pomidorowa',
        content: `# Zupa pomidorowa\n\n## Składniki:\n- 1kg pomidorów\n- 1 cebula\n- Bulion warzywny\n\n## Przygotowanie:\n1. Podsmaż cebulę\n2. Dodaj pomidory\n3. Gotuj 20 minut`,
      },
    };

    // Find matching recipe or use default
    const matchedRecipe =
      Object.entries(mockRecipes).find(([key]) => prompt.toLowerCase().includes(key))?.[1] ||
      mockRecipes['ciasto czekoladowe'];

    return {
      id: 'mock-completion-id',
      created: Math.floor(Date.now() / 1000),
      model: options.model || 'gpt-4o-mini',
      usage: {
        prompt_tokens: 10,
        completion_tokens: 50,
        total_tokens: 60,
      },
      choices: [
        {
          message: {
            content: matchedRecipe.content,
            role: 'assistant',
          },
          finish_reason: 'stop',
          index: 0,
        },
      ],
    };
  }
}
