import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/db/supabase.client';

// Disable prerendering for API routes
export const prerender = false;

// Update password request schema
const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Hasło musi zawierać co najmniej jedną wielką literę',
    })
    .refine((password) => /[0-9]/.test(password), {
      message: 'Hasło musi zawierać co najmniej jedną cyfrę',
    })
    .refine((password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password), {
      message: 'Hasło musi zawierać co najmniej jeden znak specjalny',
    }),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = updatePasswordSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Nieprawidłowe dane hasła',
            details: result.error.format(),
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { password } = result.data;

    // Initialize Supabase client with cookie handling
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Najpierw sprawdźmy, czy mamy aktywną sesję
    const { data: sessionData } = await supabase.auth.getSession();

    // Jeśli nie mamy sesji to znaczy, że token JWT jest nieprawidłowy lub wygasł
    if (!sessionData.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Sesja wygasła lub jest nieprawidłowa. Poproś o nowy link resetujący.',
          },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Aktualizacja hasła
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update error:', error);

      // Specyficzne komunikaty dla różnych błędów
      let errorMessage = 'Wystąpił problem z aktualizacją hasła';
      let statusCode = 400;

      if (error.message === 'Invalid JWT') {
        errorMessage = 'Sesja wygasła lub jest nieprawidłowa. Poproś o nowy link resetujący.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Zbyt wiele prób. Spróbuj ponownie później.';
        statusCode = 429;
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: { message: errorMessage },
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Hasło zostało pomyślnie zaktualizowane',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Update password error:', e);

    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Wystąpił nieoczekiwany błąd podczas aktualizacji hasła' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
