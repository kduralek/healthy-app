import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular client for non-server components
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Cookie options for server client
export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
};

// Helper function to parse cookie header
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
}

// Server client for auth with cookie handling
export const createSupabaseServerClient = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
    cookieOptions,
  });

  return supabase;
};
