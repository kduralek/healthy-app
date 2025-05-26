# GitHub Actions Configuration

Ten katalog zawiera konfigurację CI/CD pipeline dla aplikacji Healthy App.

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

Główny workflow uruchamiany przy:

- Push na gałąź `master`
- Utworzeniu Pull Request do `master`
- Zmianach w Pull Request
- Manualnym uruchomieniu

**Jobs:**

- **lint-and-format**: Sprawdza jakość kodu (ESLint) i formatowanie (Prettier)
- **type-check**: Weryfikuje typy TypeScript za pomocą Astro check
- **unit-tests**: Uruchamia testy jednostkowe z coverage
- **build**: Buduje aplikację (wymaga przejścia poprzednich jobs)
- **e2e-tests**: Uruchamia testy E2E z Playwright (wymaga build)

### 2. Deploy to Production (`.github/workflows/deploy.yml`)

Workflow deployment uruchamiany przy:

- Push na gałąź `master`
- Manualnym uruchomieniu

**Jobs:**

- **deploy**: Buduje i wdraża aplikację na DigitalOcean

## Composite Actions

### Setup Node.js and Dependencies (`.github/actions/setup-node-deps`)

Wspólna akcja używana we wszystkich jobs do:

- Konfiguracji Node.js w wersji 22.14.0
- Instalacji zależności npm z cache

## Konfiguracja

### Zmienne środowiskowe

- `NODE_VERSION`: Wersja Node.js (22.14.0)

### Secrets (do skonfigurowania w GitHub)

Dla deployment:

- `SUPABASE_URL`: URL do instancji Supabase
- `SUPABASE_ANON_KEY`: Klucz publiczny Supabase
- `DIGITALOCEAN_ACCESS_TOKEN`: Token dostępu do DigitalOcean
- `DOCKER_REGISTRY_URL`: URL do rejestru Docker

### Artifacts

- **build-files**: Pliki zbudowanej aplikacji (7 dni)
- **playwright-report**: Raporty z testów E2E (30 dni)

## Tech Stack

- Astro 5
- TypeScript 5
- React 19
- Tailwind 4
- Shadcn/ui
- Vitest (testy jednostkowe)
- Playwright (testy E2E)

## Uruchamianie lokalnie

```bash
# Instalacja zależności
npm ci

# Linting
npm run lint

# Formatowanie
npm run format

# Type checking
npm run astro check

# Testy jednostkowe
npm run test
npm run test:coverage

# Build
npm run build

# Testy E2E
npm run test:e2e
```
