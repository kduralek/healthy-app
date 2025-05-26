-- Migration: Comprehensive RLS Policies for All Tables
-- Purpose: Add granular Row Level Security policies for all CRUD operations
-- Affected tables: recipes, diets, allergens, user_diets, user_allergens, recipe_diets, recipe_allergens
-- Special considerations: Separate policies for anon and authenticated roles

-- Drop existing policies to recreate them with better granularity
drop policy if exists "Anyone can view recipes" on recipes;
drop policy if exists "Users can create their own recipes" on recipes;
drop policy if exists "Users can update their own recipes" on recipes;
drop policy if exists "Users can delete their own recipes" on recipes;

drop policy if exists "Users can view their own diet preferences" on user_diets;
drop policy if exists "Users can manage their own diet preferences" on user_diets;
drop policy if exists "Users can update their own diet preferences" on user_diets;
drop policy if exists "Users can delete their own diet preferences" on user_diets;

drop policy if exists "Users can view their own allergen preferences" on user_allergens;
drop policy if exists "Users can manage their own allergen preferences" on user_allergens;
drop policy if exists "Users can update their own allergen preferences" on user_allergens;
drop policy if exists "Users can delete their own allergen preferences" on user_allergens;

drop policy if exists "Anyone can view recipe diets" on recipe_diets;
drop policy if exists "Recipe owners can manage recipe diets" on recipe_diets;
drop policy if exists "Recipe owners can update recipe diets" on recipe_diets;
drop policy if exists "Recipe owners can delete recipe diets" on recipe_diets;

drop policy if exists "Anyone can view recipe allergens" on recipe_allergens;
drop policy if exists "Recipe owners can manage recipe allergens" on recipe_allergens;
drop policy if exists "Recipe owners can update recipe allergens" on recipe_allergens;
drop policy if exists "Recipe owners can delete recipe allergens" on recipe_allergens;

drop policy if exists "Anyone can view diets" on diets;
drop policy if exists "Anyone can view allergens" on allergens;

-- ============================================================================
-- RECIPES TABLE POLICIES
-- ============================================================================

-- SELECT policies for recipes
create policy "anon_can_select_recipes"
    on recipes for select
    to anon
    using (true);

create policy "authenticated_can_select_recipes"
    on recipes for select
    to authenticated
    using (true);

-- INSERT policies for recipes
-- Anonymous users cannot create recipes
create policy "anon_cannot_insert_recipes"
    on recipes for insert
    to anon
    with check (false);

-- Authenticated users can create their own recipes
create policy "authenticated_can_insert_own_recipes"
    on recipes for insert
    to authenticated
    with check (auth.uid() = user_id);

-- UPDATE policies for recipes
-- Anonymous users cannot update recipes
create policy "anon_cannot_update_recipes"
    on recipes for update
    to anon
    using (false);

-- Authenticated users can update their own recipes
create policy "authenticated_can_update_own_recipes"
    on recipes for update
    to authenticated
    using (auth.uid() = user_id);

-- DELETE policies for recipes
-- Anonymous users cannot delete recipes
create policy "anon_cannot_delete_recipes"
    on recipes for delete
    to anon
    using (false);

-- Authenticated users can delete their own recipes
create policy "authenticated_can_delete_own_recipes"
    on recipes for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- DIETS TABLE POLICIES
-- ============================================================================

-- SELECT policies for diets (public read access)
create policy "anon_can_select_diets"
    on diets for select
    to anon
    using (true);

create policy "authenticated_can_select_diets"
    on diets for select
    to authenticated
    using (true);

-- INSERT policies for diets (admin only - restrict for now)
create policy "anon_cannot_insert_diets"
    on diets for insert
    to anon
    with check (false);

create policy "authenticated_cannot_insert_diets"
    on diets for insert
    to authenticated
    with check (false);

-- UPDATE policies for diets (admin only - restrict for now)
create policy "anon_cannot_update_diets"
    on diets for update
    to anon
    using (false);

create policy "authenticated_cannot_update_diets"
    on diets for update
    to authenticated
    using (false);

-- DELETE policies for diets (admin only - restrict for now)
create policy "anon_cannot_delete_diets"
    on diets for delete
    to anon
    using (false);

create policy "authenticated_cannot_delete_diets"
    on diets for delete
    to authenticated
    using (false);

-- ============================================================================
-- ALLERGENS TABLE POLICIES
-- ============================================================================

-- SELECT policies for allergens (public read access)
create policy "anon_can_select_allergens"
    on allergens for select
    to anon
    using (true);

create policy "authenticated_can_select_allergens"
    on allergens for select
    to authenticated
    using (true);

-- INSERT policies for allergens (admin only - restrict for now)
create policy "anon_cannot_insert_allergens"
    on allergens for insert
    to anon
    with check (false);

create policy "authenticated_cannot_insert_allergens"
    on allergens for insert
    to authenticated
    with check (false);

-- UPDATE policies for allergens (admin only - restrict for now)
create policy "anon_cannot_update_allergens"
    on allergens for update
    to anon
    using (false);

create policy "authenticated_cannot_update_allergens"
    on allergens for update
    to authenticated
    using (false);

-- DELETE policies for allergens (admin only - restrict for now)
create policy "anon_cannot_delete_allergens"
    on allergens for delete
    to anon
    using (false);

create policy "authenticated_cannot_delete_allergens"
    on allergens for delete
    to authenticated
    using (false);

-- ============================================================================
-- USER_DIETS TABLE POLICIES
-- ============================================================================

-- SELECT policies for user_diets
create policy "anon_cannot_select_user_diets"
    on user_diets for select
    to anon
    using (false);

create policy "authenticated_can_select_own_user_diets"
    on user_diets for select
    to authenticated
    using (auth.uid() = user_id);

-- INSERT policies for user_diets
create policy "anon_cannot_insert_user_diets"
    on user_diets for insert
    to anon
    with check (false);

create policy "authenticated_can_insert_own_user_diets"
    on user_diets for insert
    to authenticated
    with check (auth.uid() = user_id);

-- UPDATE policies for user_diets
create policy "anon_cannot_update_user_diets"
    on user_diets for update
    to anon
    using (false);

create policy "authenticated_can_update_own_user_diets"
    on user_diets for update
    to authenticated
    using (auth.uid() = user_id);

-- DELETE policies for user_diets
create policy "anon_cannot_delete_user_diets"
    on user_diets for delete
    to anon
    using (false);

create policy "authenticated_can_delete_own_user_diets"
    on user_diets for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- USER_ALLERGENS TABLE POLICIES
-- ============================================================================

-- SELECT policies for user_allergens
create policy "anon_cannot_select_user_allergens"
    on user_allergens for select
    to anon
    using (false);

create policy "authenticated_can_select_own_user_allergens"
    on user_allergens for select
    to authenticated
    using (auth.uid() = user_id);

-- INSERT policies for user_allergens
create policy "anon_cannot_insert_user_allergens"
    on user_allergens for insert
    to anon
    with check (false);

create policy "authenticated_can_insert_own_user_allergens"
    on user_allergens for insert
    to authenticated
    with check (auth.uid() = user_id);

-- UPDATE policies for user_allergens
create policy "anon_cannot_update_user_allergens"
    on user_allergens for update
    to anon
    using (false);

create policy "authenticated_can_update_own_user_allergens"
    on user_allergens for update
    to authenticated
    using (auth.uid() = user_id);

-- DELETE policies for user_allergens
create policy "anon_cannot_delete_user_allergens"
    on user_allergens for delete
    to anon
    using (false);

create policy "authenticated_can_delete_own_user_allergens"
    on user_allergens for delete
    to authenticated
    using (auth.uid() = user_id);

-- ============================================================================
-- RECIPE_DIETS TABLE POLICIES (if exists)
-- ============================================================================

-- SELECT policies for recipe_diets (public read access)
create policy "anon_can_select_recipe_diets"
    on recipe_diets for select
    to anon
    using (true);

create policy "authenticated_can_select_recipe_diets"
    on recipe_diets for select
    to authenticated
    using (true);

-- INSERT policies for recipe_diets
create policy "anon_cannot_insert_recipe_diets"
    on recipe_diets for insert
    to anon
    with check (false);

create policy "authenticated_can_insert_own_recipe_diets"
    on recipe_diets for insert
    to authenticated
    with check (auth.uid() = (select user_id from recipes where id = recipe_id));

-- UPDATE policies for recipe_diets
create policy "anon_cannot_update_recipe_diets"
    on recipe_diets for update
    to anon
    using (false);

create policy "authenticated_can_update_own_recipe_diets"
    on recipe_diets for update
    to authenticated
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

-- DELETE policies for recipe_diets
create policy "anon_cannot_delete_recipe_diets"
    on recipe_diets for delete
    to anon
    using (false);

create policy "authenticated_can_delete_own_recipe_diets"
    on recipe_diets for delete
    to authenticated
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

-- ============================================================================
-- RECIPE_ALLERGENS TABLE POLICIES (if exists)
-- ============================================================================

-- SELECT policies for recipe_allergens (public read access)
create policy "anon_can_select_recipe_allergens"
    on recipe_allergens for select
    to anon
    using (true);

create policy "authenticated_can_select_recipe_allergens"
    on recipe_allergens for select
    to authenticated
    using (true);

-- INSERT policies for recipe_allergens
create policy "anon_cannot_insert_recipe_allergens"
    on recipe_allergens for insert
    to anon
    with check (false);

create policy "authenticated_can_insert_own_recipe_allergens"
    on recipe_allergens for insert
    to authenticated
    with check (auth.uid() = (select user_id from recipes where id = recipe_id));

-- UPDATE policies for recipe_allergens
create policy "anon_cannot_update_recipe_allergens"
    on recipe_allergens for update
    to anon
    using (false);

create policy "authenticated_can_update_own_recipe_allergens"
    on recipe_allergens for update
    to authenticated
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

-- DELETE policies for recipe_allergens
create policy "anon_cannot_delete_recipe_allergens"
    on recipe_allergens for delete
    to anon
    using (false);

create policy "authenticated_can_delete_own_recipe_allergens"
    on recipe_allergens for delete
    to authenticated
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- This migration creates comprehensive RLS policies for all tables in the database
-- Each table has separate policies for anon and authenticated users
-- Each operation (SELECT, INSERT, UPDATE, DELETE) has its own policy
-- 
-- Security model:
-- - Recipes: Public read, authenticated users can manage their own
-- - Diets/Allergens: Public read, admin-only write (currently restricted)
-- - User preferences: Private to each user
-- - Recipe relationships: Public read, recipe owners can manage 