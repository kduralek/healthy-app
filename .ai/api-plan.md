# REST API Plan

## 1. Resources

1. **Recipes** (corresponds to the `recipes` table)

   - Fields: `id`, `user_id`, `title`, `content`, `generated_at`, `generation_duration`, `created_at`, `updated_at`
   - Relationships: Belongs to a user (via Supabase Auth) and is linked to diets and allergens through the `recipe_diets` and `recipe_allergens` join tables.

2. **Diets** (corresponds to the `diets` table)

   - Fields: `id`, `name`

3. **Allergens** (corresponds to the `allergens` table)

   - Fields: `id`, `name`

4. **User Preferences** (aggregated from `user_diets` and `user_allergens` tables)

   - Represents the dietary preferences and allergen restrictions for a user.

5. **Users** (managed via Supabase Auth)
   - Although not directly managed via these endpoints, the user's `id` is referenced in recipes and preferences. Authentication is handled externally.

## 2. Endpoints

### Global Recipes Endpoints

1. **List All Recipes**

   - **Method:** GET
   - **URL:** `/api/recipes`
   - **Description:** Retrieves a paginated list of all recipes available for public browsing.
   - **Query Parameters:**
     - `page` (optional): Page number for pagination.
     - `limit` (optional): Number of recipes per page.
     - `sort` (optional): Sort by fields such as `created_at` or `title`.
     - `filter` (optional): Filter recipes by criteria (e.g., diets, allergens).
   - **Response:** JSON array of recipe objects along with pagination metadata.
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request

2. **Get Global Recipe Details**
   - **Method:** GET
   - **URL:** `/api/recipes/{id}`
   - **Description:** Retrieves detailed public information for a specific recipe identified by its ID.
   - **Response:** JSON object containing the recipe details.
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found

### Recipes Endpoints

1. **List Recipes**

   - **Method:** GET
   - **URL:** `/api/users/me/recipes`
   - **Description:** Retrieves a paginated list of recipes with options for filtering and sorting.
   - **Query Parameters:**
     - `page` (optional): Page number for pagination.
     - `limit` (optional): Number of recipes per page.
     - `sort` (optional): Sort by fields such as `created_at` or `title`.
     - `filter` (optional): Filter recipes by related diets or allergens.
   - **Response:** JSON array of recipe objects along with pagination metadata.
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 401 Unauthorized

2. **Get Recipe Details**

   - **Method:** GET
   - **URL:** `/api/users/me/recipes/{id}`
   - **Description:** Retrieves detailed information for a specific recipe identified by its ID.
   - **Response:** JSON object containing the recipe details.
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized

3. **Generate Recipe Draft**

   - **Method:** POST
   - **URL:** `/api/users/me/recipes/generate`
   - **Description:** Generates a new recipe draft based on a user-provided prompt using AI integration. This draft is not saved to the database until confirmed by the user.
   - **Request Payload:**
     ```json
     {
       "prompt": "User's recipe prompt"
     }
     ```
   - **Response:** JSON object of the generated recipe draft including fields such as `title`, `content`, `generated_at`, and `generation_duration`.
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized

4. **Modify Recipe Using AI**

   - **Method:** POST
   - **URL:** `/api/users/me/recipes/{id}/modify`
   - **Description:** Applies AI-powered modifications to an existing recipe to adjust for dietary preferences (e.g., eliminating allergens).
   - **Request Payload:**
     ```json
     {
       "prompt": "Modification instructions for dietary adjustments"
     }
     ```
   - **Response:** JSON object of the modified recipe.
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 403 Forbidden (if the user is not the recipe owner)

5. **Update Recipe**

   - **Method:** PUT
   - **URL:** `/api/users/me/recipes/{id}`
   - **Description:** Updates an existing recipe's details.
   - **Request Payload:**
     ```json
     {
       "title": "Updated title",
       "content": "Updated content"
     }
     ```
   - **Response:** JSON object of the updated recipe.
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

6. **Delete Recipe**

   - **Method:** DELETE
   - **URL:** `/api/users/me/recipes/{id}`
   - **Description:** Deletes a recipe. Row-Level Security (RLS) ensures that only the owner can delete their recipe.
   - **Response:** JSON message confirming deletion (or HTTP 204 No Content).
   - **Success Codes:** 200 OK / 204 No Content
   - **Error Codes:** 401 Unauthorized, 403 Forbidden, 404 Not Found

7. **Create Recipe**
   - **Method:** POST
   - **URL:** `/api/users/me/recipes`
   - **Description:** Creates a new recipe with provided content. Can be used for manual recipe creation or saving AI-generated content.
   - **Request Payload:**
     ```json
     {
       "title": "Recipe title",
       "content": "Recipe content",
       "diets": ["diet_id1", "diet_id2"],
       "allergens": ["allergen_id1", "allergen_id2"]
     }
     ```
   - **Response:** JSON object containing the created recipe details.
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized

### Diets Endpoints

1. **List Diets**
   - **Method:** GET
   - **URL:** `/api/diets`
   - **Description:** Retrieves a list of all available diets.
   - **Response:** JSON array of diet objects.
   - **Success Codes:** 200 OK

### Allergens Endpoints

1. **List Allergens**
   - **Method:** GET
   - **URL:** `/api/allergens`
   - **Description:** Retrieves a list of all available allergens.
   - **Response:** JSON array of allergen objects.
   - **Success Codes:** 200 OK

### User Preferences Endpoints

1. **Get User Preferences**

   - **Method:** GET
   - **URL:** `/api/users/me/preferences`
   - **Description:** Retrieves the authenticated user's dietary preferences (diets and allergens).
   - **Response:**
     ```json
     {
       "diets": ["diet_id1", "diet_id2"],
       "allergens": ["allergen_id1", "allergen_id2"]
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized

2. **Update User Preferences**
   - **Method:** PUT
   - **URL:** `/api/users/me/preferences`
   - **Description:** Updates the authenticated user's dietary preferences.
   - **Request Payload:**
     ```json
     {
       "diets": ["diet_id1", "diet_id2"],
       "allergens": ["allergen_id1", "allergen_id2"]
     }
     ```
   - **Response:** JSON object confirming the update.
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 401 Unauthorized

## 3. Authentication and Authorization

- **Mechanism:** The API will use Bearer Token authentication compatible with Supabase Auth.
- **Implementation:** Clients must include an `Authorization` header with a valid JWT for all protected endpoints.
- **Row-Level Security:** RLS policies on the `recipes`, `user_diets`, and `user_allergens` tables ensure that users can only modify or delete their own data (e.g., recipe modifications are allowed only if `user_id` matches the authenticated user).
- **Rate Limiting:** Middleware should enforce rate limiting and other security measures to prevent abuse.

## 4. Validation and Business Logic

- **Input Validation:**

  - For **Recipes**: Ensure that required fields (such as `prompt` for creation, `title`, and `content` for updates) are provided and are non-empty.
  - For **User Preferences**: Validate that the provided diet and allergen IDs exist and are unique, reflecting the constraints in the database schema.
  - Unique constraints on diet and allergen names must be maintained.

- **Business Logic:**

  - **AI Integration:** For recipe generation and modification, the API will call external AI services. The response must include details like `generated_at` and `generation_duration` to measure performance.
  - **Pagination, Sorting, and Filtering:** Endpoints returning lists (especially `/api/recipes`) will support query parameters for pagination, sorting (e.g., by `created_at`), and filtering (by diets or allergens).
  - **Error Handling:** Consistent error response structure should be used:
    ```json
    {
      "error": "Detailed error message",
      "code": "specific_error_code"
    }
    ```
  - **Security Checks:** Implement early validation checks and guard clauses to handle unauthorized access and invalid data. Detailed logging should be in place for monitoring.

- **Validation of DB Schema Constraints:**
  - Recipe operations must adhere to unique constraints and foreign key validations (e.g., valid `user_id` associations via Supabase Auth).
  - The API must respect the RLS policies ensuring that only the recipe owner can modify or delete their recipe.
