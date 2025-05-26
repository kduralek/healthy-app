/* eslint-disable no-console */
import { test as teardown } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const E2E_USERNAME_ID = process.env.E2E_USERNAME_ID || '';
const E2E_USERNAME = process.env.E2E_USERNAME || '';
const E2E_PASSWORD = process.env.E2E_PASSWORD || '';

teardown('cleanup recipes from database', async () => {
  console.log('🧹 Starting database cleanup...');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing Supabase environment variables for teardown. Please set SUPABASE_URL and SUPABASE_KEY.');
  }

  if (!E2E_USERNAME_ID || !E2E_USERNAME || !E2E_PASSWORD) {
    throw new Error(
      'Missing test user environment variables. Please set E2E_USERNAME_ID, E2E_USERNAME, and E2E_PASSWORD.'
    );
  }

  // Create Supabase client with public key (anon key)
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Authenticate as the test user to satisfy RLS policies
    console.log('🔐 Authenticating as test user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: E2E_USERNAME,
      password: E2E_PASSWORD,
    });

    if (authError || !authData.user) {
      console.error('❌ Failed to authenticate test user:', authError);
      throw new Error(`Authentication failed: ${authError?.message || 'Unknown error'}`);
    }

    console.log(`✅ Successfully authenticated as test user: ${authData.user.email}`);

    // Verify that the authenticated user ID matches the expected test user ID
    if (authData.user.id !== E2E_USERNAME_ID) {
      console.warn(
        `⚠️ Warning: Authenticated user ID (${authData.user.id}) does not match expected E2E_USERNAME_ID (${E2E_USERNAME_ID})`
      );
    }

    // First, get a count of existing recipes for the test user
    const { count: initialCount, error: countError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authData.user.id);

    if (countError) {
      console.warn('⚠️ Warning: Could not count existing recipes:', countError);
    } else {
      console.log(`📊 Found ${initialCount || 0} recipes for test user to clean up`);
    }

    // Delete only recipes belonging to the authenticated test user
    // RLS policy will automatically ensure we can only delete our own recipes
    const { error: recipesError, count } = await supabase.from('recipes').delete().eq('user_id', authData.user.id);

    if (recipesError) {
      console.error('❌ Error deleting recipes:', recipesError);
      throw recipesError;
    }

    console.log(`✅ Successfully deleted ${count || 0} recipes for test user from the database`);

    // Verify cleanup was successful
    const { count: remainingCount, error: verifyError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authData.user.id);

    if (verifyError) {
      console.warn('⚠️ Warning: Could not verify cleanup:', verifyError);
    } else if (remainingCount && remainingCount > 0) {
      console.warn(`⚠️ Warning: ${remainingCount} recipes still remain for test user in the database`);
    } else {
      console.log('✅ Verified: No recipes remain for test user in the database');
    }

    // Clean up test user preferences
    console.log('🧹 Cleaning up test user preferences...');

    // Clean up user diet preferences
    const { error: userDietsError } = await supabase.from('user_diets').delete().eq('user_id', authData.user.id);

    if (userDietsError) {
      console.warn('⚠️ Warning: Could not clean up user diet preferences:', userDietsError);
    }

    // Clean up user allergen preferences
    const { error: userAllergensError } = await supabase
      .from('user_allergens')
      .delete()
      .eq('user_id', authData.user.id);

    if (userAllergensError) {
      console.warn('⚠️ Warning: Could not clean up user allergen preferences:', userAllergensError);
    }

    console.log('✅ Test user preferences cleaned up');

    // Sign out the test user
    await supabase.auth.signOut();
    console.log('🔓 Test user signed out');

    console.log('🎉 Database cleanup completed successfully');
  } catch (error) {
    console.error('💥 Database cleanup failed:', error);
    // Attempt to sign out even if cleanup failed
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.warn('⚠️ Warning: Could not sign out after cleanup failure:', signOutError);
    }
    throw error;
  }
});
