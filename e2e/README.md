# E2E Tests Setup

This directory contains end-to-end tests for the healthy-app project using Playwright.

## Database Teardown

The tests are configured with automatic database cleanup after all tests complete. This is implemented using Playwright's teardown feature.

### Configuration

The teardown is configured in `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'cleanup db',
    testMatch: /global\.teardown\.ts/,
  },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    teardown: 'cleanup db',
  },
]
```

### Environment Variables Required

Create a `.env.test` file in the project root with the following variables:

```bash
# Supabase Configuration for E2E Tests
# These should point to your local Supabase instance or a dedicated test database

# Supabase URL (usually http://127.0.0.1:54321 for local development)
SUPABASE_URL=http://127.0.0.1:54321

# Supabase Anonymous Key (from your local Supabase instance)
SUPABASE_KEY=your_supabase_anon_key_here

# Supabase Service Role Key (required for teardown - has admin privileges)
# This is needed to delete all recipes regardless of RLS policies
# You can find this in your Supabase dashboard under Settings > API
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# E2E Test User Credentials
# These should be credentials for a test user in your Supabase auth
E2E_USERNAME=test@example.com
E2E_PASSWORD=testpassword123

# Optional: E2E Test User ID (for more targeted cleanup)
# If provided, will also clean up user preferences for this specific user
# You can get this from your Supabase auth users table
E2E_USER_ID=

# OpenRouter API Key (if needed for recipe generation tests)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Mock OpenRouter for tests (set to true to use mock service)
USE_MOCK_OPENROUTER=true
```

### What Gets Cleaned Up

The teardown process (`global.teardown.ts`) performs the following cleanup:

1. **Recipes**: Deletes all recipes from the `recipes` table
2. **Related Data**: Due to CASCADE DELETE constraints, this also removes:
   - Recipe-diet associations (`recipe_diets` table)
   - Recipe-allergen associations (`recipe_allergens` table)
3. **User Preferences** (optional): If `E2E_USER_ID` is provided, also cleans up:
   - User diet preferences (`user_diets` table)
   - User allergen preferences (`user_allergens` table)

### Security Notes

- The teardown uses the **Service Role Key** which has admin privileges and bypasses Row Level Security (RLS)
- This is necessary to clean up all test data regardless of user ownership
- Make sure to use a dedicated test database, not your production database
- The Service Role Key should be kept secure and only used in test environments

### Running Tests

```bash
# Run all e2e tests with automatic cleanup
npm run test:e2e

# Run tests without dependencies/teardown (skip cleanup)
npx playwright test --no-deps
```

### Troubleshooting

If the teardown fails:

1. Check that all required environment variables are set in `.env.test`
2. Verify that the Service Role Key has the correct permissions
3. Ensure your Supabase instance is running (for local development)
4. Check the console output for specific error messages

The teardown will log its progress:

- 🧹 Starting database cleanup...
- ✅ Successfully deleted X recipes from the database
- ✅ Test user preferences cleaned up
- 🎉 Database cleanup completed successfully
