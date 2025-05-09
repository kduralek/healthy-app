import type { APIRoute } from 'astro';
import { z } from 'zod';
import type { CreateRecipeCommand } from '@/types';

// Validation schema for the request body
const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  diets: z.array(z.string().uuid(), {
    required_error: 'Diets array is required',
    invalid_type_error: 'Diets must be an array of UUIDs',
  }),
  allergens: z.array(z.string().uuid(), {
    required_error: 'Allergens array is required',
    invalid_type_error: 'Allergens must be an array of UUIDs',
  }),
}) satisfies z.ZodType<CreateRecipeCommand>;

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // 1. User Authentication Check
  const { supabase } = locals;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Please log in to continue.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // const session = {
  //   user: {
  //     id: '5606c140-a6ac-4704-bd6f-b92b2d70537c',
  //   },
  // };

  try {
    // 2. Request Body Validation
    const body = await request.json();
    const result = createRecipeSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: result.error.format(),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { title, content, diets, allergens } = result.data;

    // 3. Insert Recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: session.user.id,
        title,
        content,
        generated_at: new Date().toISOString(),
        generation_duration: 0, // Since this is a manual save, we set it to 0
      })
      .select('id')
      .single();

    if (recipeError) {
      console.error('Error creating recipe:', recipeError);
      return new Response(JSON.stringify({ error: 'Failed to create recipe' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Insert Recipe Diets
    if (diets.length > 0) {
      const { error: dietsError } = await supabase.from('recipe_diets').insert(
        diets.map((dietId) => ({
          recipe_id: recipe.id,
          diet_id: dietId,
        }))
      );

      if (dietsError) {
        console.error('Error linking diets:', dietsError);
        // Delete the recipe if we couldn't link diets
        await supabase.from('recipes').delete().eq('id', recipe.id);
        return new Response(JSON.stringify({ error: 'Failed to link diets to recipe' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 5. Insert Recipe Allergens
    if (allergens.length > 0) {
      const { error: allergensError } = await supabase.from('recipe_allergens').insert(
        allergens.map((allergenId) => ({
          recipe_id: recipe.id,
          allergen_id: allergenId,
        }))
      );

      if (allergensError) {
        console.error('Error linking allergens:', allergensError);
        // Delete the recipe if we couldn't link allergens
        await supabase.from('recipes').delete().eq('id', recipe.id);
        return new Response(JSON.stringify({ error: 'Failed to link allergens to recipe' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 6. Return Success Response
    return new Response(JSON.stringify({ id: recipe.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
