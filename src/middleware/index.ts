import { defineMiddleware } from 'astro:middleware';

import { createSupabaseServerClient } from '../db/supabase.client';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  // Auth pages
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/update-password',
  '/auth/confirm',
  // Auth API endpoints
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/update-password',
  // Public pages
  '/',
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create Supabase client with cookie handling
  const supabase = createSupabaseServerClient({
    cookies,
    headers: request.headers,
  });

  // Store the Supabase client in locals
  locals.supabase = supabase;

  // Check if the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('user', user);

  if (user) {
    // Add user data to locals for use in components
    locals.user = {
      email: user.email ?? '',
      id: user.id,
    };
  } else if (!PUBLIC_PATHS.includes(url.pathname)) {
    // Redirect to login for protected routes
    return redirect('/auth/login?returnUrl=' + encodeURIComponent(url.pathname));
  }

  return next();
});
