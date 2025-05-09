import type { APIRoute } from 'astro';
import { generateRecipeDraftSchema } from '@/lib/schemas/recipe.schema';
import { generateRecipeDraft } from '@/lib/services/recipeDraft.service';
import type { RecipeDraftDTO } from '@/types';
import { createSupabaseServerClient } from '@/db/supabase.client';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Create a Supabase client with cookie handling
  const supabase = createSupabaseServerClient({
    cookies,
    headers: request.headers,
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized - please log in',
      }),
      { status: 401 }
    );
  }

  try {
    // 2. Request Body Validation
    const body = await request.json();
    const result = generateRecipeDraftSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: result.error.format(),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Generate Recipe Draft
    const { prompt } = result.data;
    const recipeDraft: RecipeDraftDTO = await generateRecipeDraft(prompt);

    // 4. Return Response
    return new Response(JSON.stringify(recipeDraft), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Recipe generation error:', error);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while generating the recipe',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
