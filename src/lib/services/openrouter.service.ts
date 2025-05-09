import type { ChatCompletionOptions, ChatCompletionResult } from '@/openrouter.types';
import { AuthenticationError, RateLimitError, NetworkError, ValidationError } from '@/openrouter.types';

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultParams: Record<string, unknown>;

  constructor(
    apiKey: string,
    options?: {
      baseUrl?: string;
      defaultModel?: string;
      defaultParams?: Record<string, unknown>;
    }
  ) {
    if (!apiKey) {
      throw new AuthenticationError('OPENROUTER_API_KEY is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? 'https://openrouter.ai/api/v1';
    this.defaultModel = options?.defaultModel ?? 'gpt-4o-mini';
    this.defaultParams = options?.defaultParams ?? {
      max_tokens: 100,
      temperature: 0.8,
    };
  }

  private buildRequestPayload(options: ChatCompletionOptions): Record<string, unknown> {
    return {
      model: options.model ?? this.defaultModel,
      messages: options.messages,
      ...this.defaultParams,
      ...(options.params ?? {}),
      ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
    };
  }

  private async sendRequest(payload: Record<string, unknown>): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-Title': 'Healthy App',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new AuthenticationError('Invalid API key');
      }

      if (response.status === 429) {
        throw new RateLimitError('Rate limit exceeded');
      }

      if (response.status >= 500) {
        throw new NetworkError('OpenRouter API error', response.status, true);
      }

      throw new NetworkError(errorData.error?.message ?? 'Unknown error', response.status, false);
    }

    return response;
  }

  private validateResponse(data: unknown): ChatCompletionResult {
    // TODO: Implement response validation using AJV
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid response format');
    }

    return data as ChatCompletionResult;
  }

  private handleError(error: Error): never {
    if (
      error instanceof AuthenticationError ||
      error instanceof RateLimitError ||
      error instanceof NetworkError ||
      error instanceof ValidationError
    ) {
      throw error;
    }

    throw new NetworkError(error.message);
  }

  public async createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    try {
      const payload = this.buildRequestPayload(options);
      const response = await this.sendRequest(payload);
      const data = await response.json();
      return this.validateResponse(data);
    } catch (error) {
      return this.handleError(error as Error);
    }
  }
}
