import type { APIRoute } from 'astro';
import { supabaseClient } from '@/db/supabase.client';
import type { UserPreferencesDTO } from '@/types';

interface UserDiet {
  diet_id: string;
}

interface UserAllergen {
  allergen_id: string;
}

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Get user from session
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized - please log in',
        }),
        { status: 401 }
      );
    }

    // Get user preferences from the database
    const { data: userDiets, error: dietsError } = await supabaseClient
      .from('user_diets')
      .select('diet_id')
      .eq('user_id', session.user.id);

    if (dietsError) {
      console.error('Error fetching user diets:', dietsError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch user diets',
        }),
        { status: 500 }
      );
    }

    const { data: userAllergens, error: allergensError } = await supabaseClient
      .from('user_allergens')
      .select('allergen_id')
      .eq('user_id', session.user.id);

    if (allergensError) {
      console.error('Error fetching user allergens:', allergensError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch user allergens',
        }),
        { status: 500 }
      );
    }

    const preferences: UserPreferencesDTO = {
      diets: (userDiets as UserDiet[]).map((d) => d.diet_id),
      allergens: (userAllergens as UserAllergen[]).map((a) => a.allergen_id),
    };

    return new Response(JSON.stringify(preferences), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in preferences endpoint:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      { status: 500 }
    );
  }
};
