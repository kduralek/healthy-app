# Architektura UI dla Healthy Meal App

## 1. Przegląd struktury UI

Aplikacja będzie oparta na Astro z layoutem zawierającym nagłówek (header) i główną sekcję treści. Użytkownik porusza się między podstronami za pomocą responsywnej nawigacji w nagłówku. Komponenty interfejsu będą tworzone przy użyciu React i Shadcn/ui, z dbałością o dostępność (ARIA, klawiaturowa nawigacja) oraz ochronę tras chronionych (authentication guard).

## 2. Lista widoków

### 2.1 Rejestracja

- Ścieżka: `/register`
- Główny cel: Utworzenie nowego konta użytkownika.
- Kluczowe informacje:
  - Pola: email, hasło, potwierdzenie hasła.
  - Walidacja: poprawność formatu email, długość hasła.
- Kluczowe komponenty:
  - `AuthForm` z polami i walidacją.
  - Alerty błędów.
- UX, dostępność, bezpieczeństwo:
  - Automatyczne focusowanie pierwszego pola.
  - Znacznik ARIA dla błędów.
  - Zaszyfrowane pola hasła.

### 2.2 Logowanie

- Ścieżka: `/login`
- Główny cel: Uzyskanie dostępu do konta użytkownika.
- Kluczowe informacje:
  - Pola: email, hasło.
  - Link: „Nie pamiętasz hasła?”.
- Kluczowe komponenty:
  - `AuthForm`.
- UX, dostępność, bezpieczeństwo:
  - Ochrona przed brute-force (blokada po kilku nieudanych próbach).
  - ARIA dla powiadomień.

### 2.3 Zmiana hasła

- Ścieżka: `/account/password`
- Główny cel: Aktualizacja hasła.
- Kluczowe informacje:
  - Pola: stare hasło, nowe hasło, potwierdzenie nowego.
- Kluczowe komponenty:
  - `PasswordChangeForm`.
- UX, dostępność, bezpieczeństwo:
  - Podwójne potwierdzenie hasła.
  - Sygnał siły hasła.

### 2.4 Zarządzanie preferencjami

- Ścieżka: `/account/preferences`
- Główny cel: Ustawienia diety i alergii.
- Kluczowe informacje:
  - Multiselect dla diet.
  - Checkboxy dla alergenów.
- Kluczowe komponenty:
  - `PreferencesForm`.
  - Pobranie: GET `/api/users/me/preferences`.
  - Aktualizacja: PUT `/api/users/me/preferences`.
- UX, dostępność, bezpieczeństwo:
  - Jasne etykiety i opisy.
  - Walidacja pustego wyboru.

### 2.5 Generowanie przepisu

- Ścieżka: `/recipes/generate`
- Główny cel: Wprowadzenie promptu i wygenerowanie wersji roboczej przepisu.
- Kluczowe informacje:
  - Pole tekstowe dla promptu.
  - Przycisk „Generuj”.
  - Stan ładowania (spinner).
- Kluczowe komponenty:
  - `RecipePromptForm`.
  - `Spinner` podczas wywołania POST `/api/users/me/recipes/generate`.
- UX, dostępność, bezpieczeństwo:
  - Wskaźnik postępu.
  - Informacja o czasie generowania.
- Dodatkowo:
  - Podgląd wygenerowanego przepisu na tej samej stronie (`RecipePreview`).
  - Przycisk „Zapisz” wykonujący POST `/api/users/me/recipes`.
- Kluczowe komponenty (uzupełnienia):
  - `RecipePreview`, `SaveButton`.
- UX, dostępność, bezpieczeństwo:
  - Możliwość podglądu i akceptacji przed zapisem.
  - Potwierdzenie sukcesu zapisu.

### 2.6 Lista moich przepisów

- Ścieżka: `/recipes`
- Główny cel: Przegląd zapisanych przepisów.
- Kluczowe informacje:
  - Lista kart (`RecipeCard`): tytuł, data utworzenia.
  - Paginacja.
  - Akcje: podgląd, edycja, usunięcie.
- Kluczowe komponenty:
  - `RecipeList`, `Pagination`, `ConfirmDialog`.
- UX, dostępność, bezpieczeństwo:
  - Potwierdzenie przed usunięciem (dialog).

### 2.7 Szczegóły mojego przepisu

- Ścieżka: `/recipes/:id`
- Główny cel: Wyświetlenie pełnego przepisu.
- Kluczowe informacje:
  - Tytuł, treść, diety, alergeny.
  - Data utworzenia.
- Kluczowe komponenty:
  - `RecipeDetail`.
- UX, dostępność, bezpieczeństwo:
  - Ochrona przed dostępem nieautoryzowanym.

### 2.8 Edycja przepisu

- Ścieżka: `/recipes/:id/edit`
- Główny cel: Aktualizacja istniejącego przepisu.
- Kluczowe informacje:
  - Pola: tytuł, treść.
- Kluczowe komponenty:
  - `RecipeForm` z wstępną wartością.
  - PUT `/api/users/me/recipes/:id`.
- UX, dostępność, bezpieczeństwo:
  - Walidacja wymaganych pól.

### 2.9 Lista globalnych przepisów

- Ścieżka: `/browse`
- Główny cel: Przegląd publicznych przepisów użytkowników.
- Kluczowe informacje:
  - Lista kart z paginacją.
  - Filtry: diety, alergeny.
- Kluczowe komponenty:
  - `RecipeList`, `FilterPanel`.
  - GET `/api/recipes`.
- UX, dostępność, bezpieczeństwo:
  - Filtry ARIA.

### 2.10 Szczegóły globalnego przepisu

- Ścieżka: `/browse/:id`
- Główny cel: Wyświetlenie publicznego przepisu.
- Kluczowe informacje:
  - Podobnie jak w moim przepisie, bez opcji edycji.
- Kluczowe komponenty:
  - `RecipeDetail`.
  - GET `/api/recipes/:id`.
- UX, dostępność, bezpieczeństwo:
  - Tryb tylko do odczytu.

## 3. Mapa podróży użytkownika

1. Użytkownik otwiera aplikację → jeśli brak sesji, przekierowanie do `/login`.
2. Rejestracja lub logowanie (US-001).
3. Po zalogowaniu, przekierowanie do `/preferences`, aby ustawić diety i alergeny (US-002).
4. Przejście do `/recipes/generate` – wpisanie promptu, generowanie przepisu, podgląd i zapis (US-003, US-004).
5. Przegląd/edycja zapisanych przepisów.
6. Przejście do `/browse`, przeglądanie przepisów innych użytkowników z paginacją (US-005).

## 4. Układ i struktura nawigacji

- Nagłówek z logotypem i linkami:
  - „Przeglądaj” (`/browse`)
  - „Moje przepisy” (`/recipes`)
  - „Generuj przepis” (`/recipes/generate`)
  - „Preferencje” (`/preferences`)
  - „Konto” (rozwijane: profil, zmiana hasła, wylogowanie)
- Na urządzeniach mobilnych: hamburger menu otwierające panel nawigacyjny.

## 5. Kluczowe komponenty

- Layout:
  - `MainLayout` z headerem i obszarem treści.
- Formularze:
  - `AuthForm`, `PasswordChangeForm`, `PreferencesForm`, `RecipePromptForm`, `RecipeForm`.
- Listy i karty:
  - `RecipeList`, `RecipeCard`, `Pagination`.
- Szczegóły:
  - `RecipeDetail`, `FilterPanel`, `Spinner`, `ConfirmDialog`.
- Komponenty globalne:
  - `ProtectedRoute`, `ErrorBoundary`, `Alert`.
