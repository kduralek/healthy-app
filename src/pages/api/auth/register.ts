import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/db/supabase.client';

// Disable prerendering for API routes
export const prerender = false;

// Registration request schema
const registerSchema = z
  .object({
    email: z.string().email('Podaj poprawny adres e-mail'),
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej jedną wielką literę')
      .regex(/[0-9]/, 'Hasło musi zawierać co najmniej jedną cyfrę')
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Hasło musi zawierać co najmniej jeden znak specjalny'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Hasła nie są identyczne',
    path: ['passwordConfirm'],
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Nieprawidłowe dane rejestracji',
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

    // Attempt to register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/confirm`,
      },
    });

    if (error) {
      // Handle specific Supabase auth errors
      let errorMessage = 'Nie udało się utworzyć konta. Spróbuj ponownie.';
      let statusCode = 400;

      switch (error.message) {
        case 'User already registered':
          errorMessage = 'Użytkownik o podanym adresie e-mail już istnieje';
          break;
        case 'Signup disabled':
          errorMessage = 'Rejestracja jest obecnie wyłączona';
          break;
        case 'Too many requests':
          errorMessage = 'Zbyt wiele prób. Spróbuj później.';
          statusCode = 429;
          break;
      }

      return new Response(JSON.stringify({ success: false, error: { message: errorMessage } }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return success response with user data and verification message
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: data.user,
          message:
            'Link weryfikacyjny został wysłany na Twój adres e-mail. Sprawdź swoją skrzynkę i potwierdź rejestrację.',
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Registration error:', e);

    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Wystąpił nieoczekiwany błąd podczas rejestracji' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
