import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/db/supabase.client';

// Disable prerendering for API routes
export const prerender = false;

// Login request schema
const loginSchema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Nieprawidłowe dane logowania',
            details: result.error.format(),
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, password } = result.data;

    // Initialize Supabase client with cookie handling
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific Supabase auth errors
      let errorMessage = 'Nie udało się zalogować. Spróbuj ponownie.';
      let statusCode = 400;

      switch (error.message) {
        case 'Invalid login credentials':
          errorMessage = 'Nieprawidłowy adres e-mail lub hasło';
          break;
        case 'Email not confirmed':
          errorMessage = 'Proszę potwierdzić adres e-mail przed zalogowaniem';
          break;
        case 'Too many requests':
          errorMessage = 'Zbyt wiele prób logowania. Spróbuj później.';
          statusCode = 429;
          break;
      }

      return new Response(JSON.stringify({ success: false, error: { message: errorMessage } }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get return URL from query string or use default
    const url = new URL(request.url);
    const returnUrl = url.searchParams.get('returnUrl') || '/app/recipes/generate';

    // Return success response with user data and redirect URL
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: data.user,
          redirectTo: returnUrl,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Login error:', e);

    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Wystąpił nieoczekiwany błąd podczas logowania' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
