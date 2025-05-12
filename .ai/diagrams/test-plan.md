# Test Plan

## Wprowadzenie

Krótki opis: Aplikacja „healthy-app" oparta na Astro 5, React 19, Supabase i Openrouter.ai. Celem planu jest zapewnienie pełnej jakości poprzez wielopoziomowe testy frontendowe, backendowe i e2e.

## Zakres testów

• Objęte:
– Frontend: komponenty React/Astro, formularze, widoki generacji przepisów
– Backend: endpointy API auth, user preferences, recipe generation
– Middleware uwierzytelniania
– Integracja z Openrouter.ai
– Procesy CRUD w Supabase

• Wyłączone:
– Testy infrastruktury hostingowej (DigitalOcean)
– Testy bezpieczeństwa sieciowego poza auth

## Strategia testowania

• Poziomy: unit, integracja, end-to-end, dostępność, wizualna regresja, wydajność, kontrakt
• Środowiska: lokalne (Mirage JS), testowe, staging
• Automatyzacja: GitHub Actions, Dockerized test runners

## Typy testów

a) Testy jednostkowe (Vitest + React Testing Library)
– Komponenty: formularze auth, RecipePreview, skeletony
– Hooki: useAuth, useRecipe
– Usługi: openrouter.service, recipeDraft.service
– Walidacje Zod

b) Testy integracyjne (Testing Library/Hooks + MSW)
– Endpointy /api/auth/*, /api/users/me/*
– Logika middleware, odpowiedzi HTTP, statusy

c) Testy end-to-end (Playwright)
– Scenariusze: rejestracja, logowanie, ochrona tras, generacja i zapis przepisu

d) Testy dostępności (axe-core + Storybook z addon-a11y)
– Formularze, przyciski, nawigacja klawiaturą
– Izolowane testowanie komponentów w kontekście dostępności

e) Testy wizualnej regresji (TestimonHQ/Checkly)
– Kluczowe widoki: auth, generacja przepisu, profil
– Integracja z Playwright dla spójności testów

f) Testy wydajnościowe (Lighthouse CI + web-vitals)
– Czas ładowania SSR, Time to Interactive
– Monitorowanie Core Web Vitals w czasie rzeczywistym

g) Testy kontraktowe (MSW)
– Umowy z Openrouter.ai i Supabase

## Przypadki testowe

### Auth

- Rejestracja z poprawnymi danymi
- Rejestracja z użyciem istniejącego emaila
- Błędne hasło (zbyt krótkie)
- Logowanie nieistniejącego użytkownika
- Forgot password – wysyłka i reset
- Update password – zmiana hasła po resecie hasła

### API użytkownika

- Pobranie i zapis preferencji (status 200/400)
- Generacja przepisu – success/error/timeout

### UI generacji

- Render formularza
- Wyświetlanie skeletonu podczas ładowania
- Prezentacja podglądu przepisu
- Obsługa błędów sieciowych
  
### Middleware

- Dostęp do /app/* bez logowania → przekierowanie
- Dostęp do publicznych tras bez logowania

### Usługi

- openrouter.service – mock success, mock error
- recipeDraft.service – właściwe mapowanie i zapis

### End-to-end

- pełne ścieżki użytkownika
- testowanie architektury islands w kontekście hydratacji komponentów 

## Harmonogram testów

• Tydzień 1: Setup narzędzi, testy jednostkowe komponentów + usług
• Tydzień 2: Testy integracyjne API, walidacje Zod
• Tydzień 3: E2E (Playwright) i testy dostępności
• Tydzień 4: Wizualna regresja, wydajność, raportowanie

## Zasoby

• Zespół: 1 QA, 2 deweloperów, 1 DevOps
• Narzędzia: Vitest, React Testing Library, MSW, Playwright, axe-core, TestimonHQ/Checkly, Lighthouse CI, Storybook, Mirage JS, web-vitals, Cypress Component Testing

## Ryzyka i plany awaryjne

• Niestabilne API zewnętrzne → mock, retry
• Zmiany schematów → automatyczne testy kontraktowe
• Flaki asynchroniczne → stabilizacja testów, timeouty, retry
• Problemy z emulatorem DB → fallback na Mirage JS lub testowy Supabase

## Kryteria akceptacji

• ≥90% pokrycia kodu testami jednostkowymi
• 100% kluczowych scenariuszy E2E zielone
• Brak krytycznych błędów accessibility
• Brak wizualnych regresji w CI

## Raportowanie i śledzenie błędów

• GitHub Issues + automatyczne linkowanie do testów
• Dashboard w GitHub Actions
• Cotygodniowe raporty stanu testów
• Integracja wyników wizualnych i wydajnościowych do pull requestów

## Podsumowanie

Kompleksowy plan zapewnia wielopoziomową jakość aplikacji „healthy-app" poprzez zrównoważone testy frontendowe, backendowe, e2e, dostępności i wydajności, zautomatyzowane w CI/CD. Wykorzystanie nowoczesnych technologii jak Vitest, Playwright, MSW i TestimonHQ zapewnia wydajne i niezawodne procesy testowe dostosowane do architektury Astro 5 i React 19.
