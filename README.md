# Healthy Meal App

## Project Description

The Healthy Meal App is an innovative solution designed to help users customize online recipes to suit their unique dietary needs. Leveraging LLM models, the application enables users to generate and modify recipes based on personalized prompts. Key functionalities include user registration and login, dietary preference configuration, AI-powered recipe generation and modification, and comprehensive recipe management (saving, viewing, and deleting recipes with pagination).

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication, and backend-as-a-service capabilities)
- **AI Integration:** LLM via Openrouter.ai for recipe modifications
- **CI/CD & Hosting:** GitHub Actions for CI/CD, DigitalOcean with Docker for hosting

## Getting Started Locally

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd healthy-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Ensure you are using Node version specified in `.nvmrc` (22.14.0):**

   ```bash
   nvm use
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

## Available Scripts

- **dev:** Runs the Astro development server (`astro dev`).
- **build:** Builds the production-ready application (`astro build`).
- **preview:** Previews the production build locally (`astro preview`).
- **astro:** Access Astro CLI commands.
- **lint:** Runs ESLint to analyze code quality.
- **lint:fix:** Runs ESLint with the --fix option to automatically fix issues.
- **format:** Formats the codebase using Prettier.
- **test:e2e:** Runs end-to-end tests with Playwright (includes automatic database cleanup).

## Testing

The project includes end-to-end tests using Playwright with automatic database cleanup:

- **E2E Tests:** Located in the `e2e/` directory
- **Automatic Cleanup:** After all tests complete, the database is automatically cleaned up
- **Configuration:** Tests require a `.env.test` file with Supabase credentials

For detailed testing setup instructions, see [e2e/README.md](e2e/README.md).

## Project Scope

The application's MVP is focused on enabling users to:

- Register and manage their account securely.
- Configure and update dietary preferences (selection of diets and allergens).
- Generate recipes through natural language prompts in Polish, with AI-driven modifications to eliminate unwanted ingredients.
- Save and manage recipes with functionalities including viewing, deletion, and history management.
- Browse recipes with paginated lists for easy navigation.

## Project Status

This project is currently under active development.

## License

This project is licensed under the MIT License.
