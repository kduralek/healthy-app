export interface Message {
  role: 'system' | 'user';
  content: string;
}

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: {
      type: string;
      properties?: Record<string, unknown>;
      required?: string[];
      additionalProperties?: boolean;
    };
  };
}

export interface ChatCompletionOptions {
  messages: Message[];
  model?: string;
  params?: Record<string, unknown>;
  responseFormat?: ResponseFormat;
}

export interface ChatCompletionResult {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
}

export class NetworkError extends Error implements OpenRouterError {
  public status?: number;
  public retryable: boolean;

  constructor(message: string, status?: number, retryable = true) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
    this.retryable = retryable;
  }
}

export class AuthenticationError extends Error implements OpenRouterError {
  public retryable: boolean;

  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.retryable = false;
  }
}

export class ValidationError extends Error implements OpenRouterError {
  public retryable: boolean;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.retryable = false;
  }
}

export class RateLimitError extends Error implements OpenRouterError {
  public retryable: boolean;

  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
    this.retryable = true;
  }
}
