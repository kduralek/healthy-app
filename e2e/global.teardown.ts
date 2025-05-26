import { test as teardown } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

teardown('cleanup recipes from database', async () => {
  console.log('🧹 Starting database cleanup...');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing Supabase environment variables for teardown. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  // Create Supabase client with service role key for admin operations
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // First, get a count of existing recipes for logging
    const { count: initialCount, error: countError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('⚠️ Warning: Could not count existing recipes:', countError);
    } else {
      console.log(`📊 Found ${initialCount || 0} recipes to clean up`);
    }

    // Delete all recipes from the recipes table
    // This will also cascade delete related records in recipe_diets and recipe_allergens
    // due to the ON DELETE CASCADE constraints in the database schema
    const { error: recipesError, count } = await supabase.from('recipes').delete().gte('created_at', '1970-01-01'); // Delete all recipes (using a condition that matches all)

    if (recipesError) {
      console.error('❌ Error deleting recipes:', recipesError);
      throw recipesError;
    }

    console.log(`✅ Successfully deleted ${count || 0} recipes from the database`);

    // Verify cleanup was successful
    const { count: remainingCount, error: verifyError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });

    if (verifyError) {
      console.warn('⚠️ Warning: Could not verify cleanup:', verifyError);
    } else if (remainingCount && remainingCount > 0) {
      console.warn(`⚠️ Warning: ${remainingCount} recipes still remain in the database`);
    } else {
      console.log('✅ Verified: No recipes remain in the database');
    }

    // Optional: Clean up any orphaned user preferences if needed
    // This is more conservative - only clean up if you're sure about the test user
    const testUserId = process.env.E2E_USER_ID;
    if (testUserId) {
      console.log('🧹 Cleaning up test user preferences...');

      // Clean up user diet preferences
      const { error: userDietsError } = await supabase.from('user_diets').delete().eq('user_id', testUserId);

      if (userDietsError) {
        console.warn('⚠️ Warning: Could not clean up user diet preferences:', userDietsError);
      }

      // Clean up user allergen preferences
      const { error: userAllergensError } = await supabase.from('user_allergens').delete().eq('user_id', testUserId);

      if (userAllergensError) {
        console.warn('⚠️ Warning: Could not clean up user allergen preferences:', userAllergensError);
      }

      console.log('✅ Test user preferences cleaned up');
    }

    console.log('🎉 Database cleanup completed successfully');
  } catch (error) {
    console.error('💥 Database cleanup failed:', error);
    throw error;
  }
});
