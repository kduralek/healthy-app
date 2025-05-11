import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/db/supabase.client';

// Disable prerendering for API routes
export const prerender = false;

// Reset password request schema
const resetPasswordSchema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Nieprawidłowy adres e-mail',
            details: result.error.format(),
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { email } = result.data;

    // Initialize Supabase client with cookie handling
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Get origin for redirect URL
    const origin = new URL(request.url).origin;

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/update-password`,
    });

    if (error) {
      // For security reasons, always return a generic message
      // Log the actual error for troubleshooting
      console.error('Password reset error:', error);

      // Return 200 even on error to prevent email enumeration
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jeśli konto istnieje, na podany adres email zostały wysłane instrukcje resetowania hasła',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Jeśli konto istnieje, na podany adres email zostały wysłane instrukcje resetowania hasła',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Reset password error:', e);

    // Return generic message even on server error for security
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Jeśli konto istnieje, na podany adres email zostały wysłane instrukcje resetowania hasła',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
