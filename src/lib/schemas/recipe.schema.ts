import { z } from 'zod';
import type { GenerateRecipeDraftCommand } from '@/types';

export const generateRecipeDraftSchema = z.object({
  prompt: z
    .string({
      required_error: 'Recipe prompt is required',
      invalid_type_error: 'Recipe prompt must be a string',
    })
    .min(10, 'Recipe prompt must be at least 10 characters long')
    .max(1000, 'Recipe prompt cannot exceed 1000 characters'),
}) satisfies z.ZodType<GenerateRecipeDraftCommand>;
