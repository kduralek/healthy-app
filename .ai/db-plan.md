1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

- **diets**
  - **id**: UUID, PRIMARY KEY
  - **name**: TEXT, NOT NULL, UNIQUE

- **allergens**
  - **id**: UUID, PRIMARY KEY
  - **name**: TEXT, NOT NULL, UNIQUE

- **recipes**
  - **id**: UUID, PRIMARY KEY
  - **user_id**: UUID, NOT NULL, REFERENCES auth.users(id)
  - **title**: TEXT, NOT NULL
  - **content**: TEXT, NOT NULL
  - **generated_at**: TIMESTAMPTZ, NOT NULL
  - **generation_duration**: INTEGER, NOT NULL  -- czas generacji w milisekundach
  - **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()
  - **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()

- **user_diets**
  - **user_id**: UUID, NOT NULL, REFERENCES auth.users(id)
  - **diet_id**: UUID, NOT NULL, REFERENCES diets(id)
  - PRIMARY KEY (user_id, diet_id)

- **user_allergens**
  - **user_id**: UUID, NOT NULL, REFERENCES auth.users(id)
  - **allergen_id**: UUID, NOT NULL, REFERENCES allergens(id)
  - PRIMARY KEY (user_id, allergen_id)

- **recipe_diets**
  - **recipe_id**: UUID, NOT NULL, REFERENCES recipes(id)
  - **diet_id**: UUID, NOT NULL, REFERENCES diets(id)
  - PRIMARY KEY (recipe_id, diet_id)

- **recipe_allergens**
  - **recipe_id**: UUID, NOT NULL, REFERENCES recipes(id)
  - **allergen_id**: UUID, NOT NULL, REFERENCES allergens(id)
  - PRIMARY KEY (recipe_id, allergen_id)


2. Relacje między tabelami

- **auth.users** ↔ **recipes**: Relacja jeden-do-wielu, gdzie każdy użytkownik (auth.users) może mieć wiele przepisów (recipes).
- **auth.users** ↔ **diets**: Relacja wiele-do-wielu za pomocą tabeli łączącej `user_diets`.
- **auth.users** ↔ **allergens**: Relacja wiele-do-wielu za pomocą tabeli łączącej `user_allergens`.
- **recipes** ↔ **diets**: Relacja wiele-do-wielu za pomocą tabeli łączącej `recipe_diets`.
- **recipes** ↔ **allergens**: Relacja wiele-do-wielu za pomocą tabeli łączącej `recipe_allergens`.


3. Indeksy

- Indeks na kolumnie **recipes.user_id**.
- Klucze obce w tabelach łączących (`user_diets`, `user_allergens`, `recipe_diets`, `recipe_allergens`) wynikają z zastosowania kompozytowych kluczy PRIMARY KEY, które automatycznie indeksują kolumny.


4. Zasady PostgreSQL (RLS)

- Włączyć Row Level Security w tabeli **recipes**:
  - Aktywacja RLS:
    ```sql
    ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
    ```
  - Polityka bezpieczeństwa (ograniczenie modyfikacji tylko do autora):
    ```sql
    CREATE POLICY recipe_select_policy ON recipes
      FOR SELECT
      USING (true);

    CREATE POLICY recipe_modify_policy ON recipes
      FOR UPDATE, DELETE
      USING (user_id = auth.uid());
    ```

- Włączyć Row Level Security w tabelach łączących:
  ```sql
  ALTER TABLE user_diets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_allergens ENABLE ROW LEVEL SECURITY;

  CREATE POLICY user_diets_policy ON user_diets
    USING (user_id = auth.uid());

  CREATE POLICY user_allergens_policy ON user_allergens
    USING (user_id = auth.uid());
  ```


5. Dodatkowe uwagi

- Wykorzystujemy wbudowaną tabelę `auth.users` z Supabase Auth zamiast własnej implementacji użytkowników.
- Wszystkie klucze główne w tabelach oraz w tabelach łączących są typu UUID, co zwiększa bezpieczeństwo i ułatwia przyszłą skalowalność.
- Schemat został zaprojektowany zgodnie z zasadami normalizacji (do 3NF) i optymalizowany pod kątem wydajności dzięki dedykowanym indeksom na kolumnach wykorzystywanych w relacjach.
- Polityki RLS wykorzystują wbudowaną funkcję `auth.uid()` z Supabase do weryfikacji tożsamości użytkownika.