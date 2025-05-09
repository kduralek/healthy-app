import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/db/supabase.client';

// Disable prerendering for API routes
export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Initialize Supabase client with cookie handling
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Wystąpił problem podczas wylogowywania' },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: { message: 'Wylogowano pomyślnie' },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Logout error:', e);

    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Wystąpił nieoczekiwany błąd podczas wylogowywania' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
