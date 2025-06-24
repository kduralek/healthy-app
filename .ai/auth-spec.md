# Specyfikacja modułu autentykacji użytkownika

## 1. Architektura interfejsu użytkownika

### 1.1. Struktura stron i komponentów

#### Nowe strony Astro

- `/src/pages/auth/login.astro` - strona logowania
- `/src/pages/auth/register.astro` - strona rejestracji
- `/src/pages/auth/reset-password.astro` - strona żądania resetu hasła
- `/src/pages/auth/new-password.astro` - strona ustawiania nowego hasła
- `/src/pages/profile/index.astro` - strona profilu użytkownika (chroniona)
- `/src/pages/profile/change-password.astro` - strona zmiany hasła (chroniona)

#### Nowe komponenty React

- `/src/components/auth/LoginForm.tsx` - formularz logowania
- `/src/components/auth/RegisterForm.tsx` - formularz rejestracji
- `/src/components/auth/ResetPasswordForm.tsx` - formularz żądania resetowania hasła
- `/src/components/auth/NewPasswordForm.tsx` - formularz ustawiania nowego hasła
- `/src/components/auth/ChangePasswordForm.tsx` - formularz zmiany hasła
- `/src/components/auth/UserNav.tsx` - nawigacja zalogowanego użytkownika (avatar, menu rozwijane)

#### Komponenty współdzielone

- `/src/components/ui/auth/PasswordInput.tsx` - komponent pola hasła z przełącznikiem widoczności
- `/src/components/ui/auth/FormMessage.tsx` - komponent do wyświetlania komunikatów formularza
- `/src/components/layout/Header.tsx` - rozszerzenie nagłówka o conditional rendering elementów dla zalogowanych/niezalogowanych użytkowników

#### Layout

- `/src/layouts/AuthLayout.astro` - layout dla stron autentykacji (uproszczona nawigacja)
- `/src/layouts/ProtectedLayout.astro` - layout dla stron dostępnych tylko dla zalogowanych użytkowników

### 1.2. Scenariusze użytkownika i przepływ danych

#### Rejestracja

1. Użytkownik odwiedza stronę `/auth/register`
2. Wypełnia formularz z polami:
   - Adres e-mail (walidacja formatu)
   - Hasło (min. 8 znaków, wymagane znaki specjalne, cyfry)
   - Potwierdzenie hasła
3. Po poprawnej walidacji client-side, React komponent wywołuje endpoint Supabase Auth
4. W przypadku sukcesu:
   - Użytkownik otrzymuje e-mail z linkiem aktywacyjnym
   - Wyświetlana jest informacja o konieczności potwierdzenia e-maila
5. W przypadku błędu:
   - Wyświetlany jest stosowny komunikat (np. "Użytkownik o tym adresie e-mail już istnieje")

#### Logowanie

1. Użytkownik odwiedza stronę `/auth/login`
2. Wypełnia formularz z polami:
   - Adres e-mail
   - Hasło
3. Po kliknięciu przycisku logowania, React komponent wywołuje endpoint Supabase Auth
4. W przypadku sukcesu:
   - Użytkownik jest przekierowywany na stronę główną lub ostatnio odwiedzaną
   - Stan sesji jest zachowywany w local storage
5. W przypadku błędu:
   - Wyświetlany jest komunikat o nieprawidłowych danych logowania

#### Reset hasła

1. Użytkownik na stronie logowania klika "Zapomniałem hasła"
2. Na stronie `/auth/reset-password` wprowadza swój adres e-mail
3. Po potwierdzeniu, Supabase wysyła e-mail z jednorazowym linkiem
4. Użytkownik klika w link, który przekierowuje na stronę `/auth/new-password` z odpowiednim tokenem w URL
5. Na stronie formularza nowego hasła użytkownik wprowadza i potwierdza nowe hasło
6. Po poprawnej zmianie, użytkownik jest przekierowywany na stronę logowania

#### Zmiana hasła (dla zalogowanych użytkowników)

1. Zalogowany użytkownik przechodzi do profilu i wybiera opcję "Zmień hasło"
2. Na stronie `/profile/change-password` wprowadza:
   - Aktualne hasło
   - Nowe hasło
   - Potwierdzenie nowego hasła
3. Po potwierdzeniu, hasło jest zmieniane w Supabase Auth

#### Wylogowanie

1. Użytkownik klika przycisk "Wyloguj" w menu użytkownika
2. React komponent wywołuje metodę wylogowania z Supabase Auth
3. Sesja jest usuwana, a użytkownik przekierowywany na stronę główną

### 1.3. Walidacja i obsługa błędów

#### Walidacja client-side

- Adres e-mail: format zgodny z RFC5322 (regularne wyrażenie)
- Hasło:
  - Minimalna długość: 8 znaków
  - Wymagana minimum 1 duża litera
  - Wymagana minimum 1 cyfra
  - Wymagany minimum 1 znak specjalny
- Potwierdzenie hasła: zgodność z polem hasła

#### Komunikaty błędów

- Dla każdego pola formularza: dedykowany komunikat pod polem
- Ogólne błędy API: komunikat w górnej części formularza
- Typy komunikatów:
  - Walidacyjne (czerwone)
  - Informacyjne (niebieskie)
  - Sukcesu (zielone)

#### Obsługa scenariuszy błędów

- Nieprawidłowe dane logowania: "Nieprawidłowy adres e-mail lub hasło"
- Istniejący użytkownik przy rejestracji: "Użytkownik o tym adresie e-mail już istnieje"
- Nieistniejący użytkownik przy resecie hasła: "Jeśli podany adres e-mail istnieje w systemie, wiadomość z instrukcją resetowania hasła została wysłana"
- Wygaśnięcie sesji: automatyczne przekierowanie na stronę logowania z komunikatem

## 2. Logika backendowa

### 2.1. Endpointy API

Wykorzystamy API Endpoints Astro zintegrowane z Supabase:

#### Endpointy publiczne

- `POST /api/auth/register` - rejestracja użytkownika
  - Parametry: `email`, `password`
  - Odpowiedź: status operacji, ew. błędy
- `POST /api/auth/login` - logowanie użytkownika
  - Parametry: `email`, `password`
  - Odpowiedź: token JWT, dane użytkownika, ew. błędy
- `POST /api/auth/reset-password` - żądanie resetowania hasła
  - Parametry: `email`
  - Odpowiedź: status operacji
- `POST /api/auth/new-password` - ustawienie nowego hasła
  - Parametry: `token`, `password`
  - Odpowiedź: status operacji, ew. błędy

#### Endpointy chronione (wymagające autoryzacji)

- `POST /api/auth/change-password` - zmiana hasła
  - Parametry: `currentPassword`, `newPassword`
  - Odpowiedź: status operacji, ew. błędy
- `POST /api/auth/logout` - wylogowanie
  - Odpowiedź: status operacji

### 2.2. Middleware autentykacji

Middleware Astro zostanie rozszerzone o funkcjonalność weryfikacji sesji użytkownika:

```typescript
// /src/middleware/index.ts
export const onRequest = async (context, next) => {
  // Pobieranie i weryfikacja sesji z Supabase
  const { session, supabaseClient } = await getSupabaseSession(context.request);

  // Ustawienie informacji o sesji w locals dla użycia w komponentach
  context.locals.session = session;
  context.locals.supabase = supabaseClient;

  // Sprawdzenie, czy ścieżka wymaga autoryzacji
  const isProtectedRoute = context.url.pathname.startsWith('/profile') || context.url.pathname.startsWith('/app');

  if (isProtectedRoute && !session) {
    // Przekierowanie na stronę logowania z parametrem returnUrl
    return Response.redirect(
      new URL('/auth/login?returnUrl=' + encodeURIComponent(context.url.pathname), context.url.origin)
    );
  }

  // Sprawdzenie, czy ścieżka autentykacji nie powinna być dostępna dla zalogowanych
  const isAuthRoute = context.url.pathname.startsWith('/auth');

  if (isAuthRoute && session) {
    // Przekierowanie na stronę główną
    return Response.redirect(new URL('/', context.url.origin));
  }

  return next();
};
```

### 2.3. Obsługa wyjątków i walidacja

#### Walidacja backendowa

- Implementacja schematów walidacji za pomocą Zod lub podobnej biblioteki
- Sprawdzanie integralności danych przed przekazaniem do Supabase

#### Obsługa wyjątków

- Centralna obsługa błędów API z mapowaniem na przyjazne dla użytkownika komunikaty
- Logowanie błędów krytycznych
- Zwracanie jednolitej struktury odpowiedzi dla wszystkich endpointów:

  ```typescript
  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
    };
  }
  ```

### 2.4. Przechowywanie i zarządzanie sesją

- Wykorzystanie mechanizmu session storage Supabase
- Przechowywanie tokenu JWT w bezpiecznym cookie
- Automatyczne odświeżanie sesji przy wygaśnięciu tokenu
- Ustawienie TTL (Time-To-Live) sesji zgodnie z wymaganiami bezpieczeństwa

## 3. System autentykacji

### 3.1. Integracja z Supabase Auth

#### Konfiguracja klienta Supabase

```typescript
// /src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper do pobierania sesji w middleware/komponentach
export const getSupabaseSession = async (request) => {
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
    },
    global: {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  });

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return { session, supabaseClient };
};
```

#### Typy danych dla autentykacji

```typescript
// /src/types.ts - uzupełnienie istniejącego pliku

// Interfejs dla danych użytkownika
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Interfejs dla danych sesji
export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Typy dla formularzy
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  passwordConfirm: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  passwordConfirm: string;
}
```

### 3.2. Serwisy autentykacji

#### Implementacja serwisu autentykacji

```typescript
// /src/lib/auth.ts
import { supabase } from '../db/supabase';
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  NewPasswordFormData,
  ChangePasswordFormData,
} from '../types';

export const authService = {
  // Rejestracja użytkownika
  async register({ email, password }: RegisterFormData) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  // Logowanie użytkownika
  async login({ email, password }: LoginFormData) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Wylogowanie użytkownika
  async logout() {
    return await supabase.auth.signOut();
  },

  // Żądanie resetu hasła
  async resetPassword({ email }: ResetPasswordFormData) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/new-password`,
    });
  },

  // Ustawienie nowego hasła
  async setNewPassword({ password }: NewPasswordFormData) {
    return await supabase.auth.updateUser({
      password,
    });
  },

  // Zmiana hasła zalogowanego użytkownika
  async changePassword({ currentPassword, newPassword }: ChangePasswordFormData) {
    // Najpierw weryfikacja aktualnego hasła (przez ponowne logowanie)
    const {
      data: { user },
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email: supabase.auth.getUser().then(({ data }) => data.user?.email || ''),
      password: currentPassword,
    });

    if (loginError) {
      return { error: loginError };
    }

    // Zmiana hasła
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  },

  // Pobieranie aktualnej sesji
  async getSession() {
    return await supabase.auth.getSession();
  },

  // Pobieranie danych zalogowanego użytkownika
  async getUser() {
    return await supabase.auth.getUser();
  },
};
```

### 3.3. Konfiguracja autentykacji w Astro

#### Rozszerzenie konfiguracji Astro

```typescript
// /astro.config.mjs
export default defineConfig({
  // ... istniejąca konfiguracja

  output: 'server', // Tryb SSR dla obsługi dynamicznych treści i autoryzacji

  // Konfiguracja dla obsługi autentykacji
  vite: {
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY),
    },
  },
});
```

### 3.4. Zabezpieczenia i dobre praktyki

- Implementacja CSRF protection dla formularzy
- Ograniczenie liczby prób logowania (rate limiting)
- Bezpieczne zarządzanie tokenami JWT
- Hashowanie haseł (obsługiwane przez Supabase)
- Automatyczne wylogowanie po okresie nieaktywności
- Przechowywanie wrażliwych danych w zmiennych środowiskowych
- Komunikaty błędów nie ujawniające szczegółów implementacji
- Implementacja dwuetapowej weryfikacji (2FA) w przyszłych wersjach

## 4. Podsumowanie

Zaprojektowana architektura modułu autentykacji wykorzystuje możliwości Astro i React w połączeniu z Supabase Auth, zapewniając:

1. Pełną funkcjonalność rejestracji, logowania i zarządzania kontem zgodnie z wymaganiami US-001
2. Wysoki poziom bezpieczeństwa dzięki integracji z Supabase Auth
3. Optymalny podział między statycznymi stronami Astro i interaktywnymi komponentami React
4. Elastyczność pozwalającą na łatwe rozszerzanie i utrzymanie systemu
5. Zgodność z istniejącym tech stackiem i strukturą projektu

Moduł został zaprojektowany jako fundament dla pozostałych funkcjonalności aplikacji, które będą wymagały weryfikacji tożsamości użytkownika, w tym zarządzania preferencjami żywieniowymi i przepisami.
