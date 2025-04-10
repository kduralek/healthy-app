-- Create base tables
create table diets (
    id uuid primary key default gen_random_uuid(),
    name text not null unique
);

create table allergens (
    id uuid primary key default gen_random_uuid(),
    name text not null unique
);

create table recipes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    title text not null,
    content text not null,
    generated_at timestamptz not null,
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create junction tables for many-to-many relationships
create table user_diets (
    user_id uuid not null references auth.users(id),
    diet_id uuid not null references diets(id),
    primary key (user_id, diet_id)
);

create table user_allergens (
    user_id uuid not null references auth.users(id),
    allergen_id uuid not null references allergens(id),
    primary key (user_id, allergen_id)
);

create table recipe_diets (
    recipe_id uuid not null references recipes(id) on delete cascade,
    diet_id uuid not null references diets(id),
    primary key (recipe_id, diet_id)
);

create table recipe_allergens (
    recipe_id uuid not null references recipes(id) on delete cascade,
    allergen_id uuid not null references allergens(id),
    primary key (recipe_id, allergen_id)
);

-- Create indexes
create index idx_recipes_user_id on recipes(user_id);

-- Enable Row Level Security
alter table recipes enable row level security;
alter table user_diets enable row level security;
alter table user_allergens enable row level security;
alter table recipe_diets enable row level security;
alter table recipe_allergens enable row level security;
alter table diets enable row level security;
alter table allergens enable row level security;

-- Create RLS Policies for recipes
create policy "Anyone can view recipes"
    on recipes for select
    using (true);

create policy "Users can create their own recipes"
    on recipes for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
    on recipes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
    on recipes for delete
    using (auth.uid() = user_id);

-- Create RLS Policies for user_diets
create policy "Users can view their own diet preferences"
    on user_diets for select
    using (auth.uid() = user_id);

create policy "Users can manage their own diet preferences"
    on user_diets for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own diet preferences"
    on user_diets for update
    using (auth.uid() = user_id);

create policy "Users can delete their own diet preferences"
    on user_diets for delete
    using (auth.uid() = user_id);

-- Create RLS Policies for user_allergens
create policy "Users can view their own allergen preferences"
    on user_allergens for select
    using (auth.uid() = user_id);

create policy "Users can manage their own allergen preferences"
    on user_allergens for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own allergen preferences"
    on user_allergens for update
    using (auth.uid() = user_id);

create policy "Users can delete their own allergen preferences"
    on user_allergens for delete
    using (auth.uid() = user_id);

-- Create RLS Policies for recipe relationships
create policy "Anyone can view recipe diets"
    on recipe_diets for select
    using (true);

create policy "Recipe owners can manage recipe diets"
    on recipe_diets for insert
    with check (auth.uid() = (select user_id from recipes where id = recipe_id));

create policy "Recipe owners can update recipe diets"
    on recipe_diets for update
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

create policy "Recipe owners can delete recipe diets"
    on recipe_diets for delete
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

-- Create RLS Policies for recipe allergens
create policy "Anyone can view recipe allergens"
    on recipe_allergens for select
    using (true);

create policy "Recipe owners can manage recipe allergens"
    on recipe_allergens for insert
    with check (auth.uid() = (select user_id from recipes where id = recipe_id));

create policy "Recipe owners can update recipe allergens"
    on recipe_allergens for update
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

create policy "Recipe owners can delete recipe allergens"
    on recipe_allergens for delete
    using (auth.uid() = (select user_id from recipes where id = recipe_id));

-- Create RLS Policies for diets and allergens (public read-only access)
create policy "Anyone can view diets"
    on diets for select
    using (true);

create policy "Anyone can view allergens"
    on allergens for select
    using (true); 