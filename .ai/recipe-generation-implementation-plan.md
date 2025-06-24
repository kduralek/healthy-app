# API Endpoint Implementation Plan: Generate Recipe Draft

## 1. Przegląd punktu końcowego

Celem endpointu jest wygenerowanie szkicu przepisu na podstawie promptu przekazanego przez użytkownika przy użyciu integracji AI. Wygenerowany szkic zawiera pola title, content, generated_at oraz generation_duration. Endpoint nie zapisuje wygenerowanego przepisu do bazy danych, lecz zwraca go do klienta.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: /api/users/me/recipes/generate
- Parametry:

  - Wymagane:
    - prompt (string) – zawiera prompt przepisu od użytkownika, minimum 10 znaków, maksimum 1000.
  - Opcjonalne: Brak

- Request Body:

  ```json
  {
    "prompt": "User's recipe prompt"
  }
  ```

## 3. Wykorzystywane typy

- DTO:

  - `RecipeDraftDTO`:
    - title: string
    - content: string
    - generated_at: Date/Timestamp
    - generation_duration: number

- Command Model:
  - `GenerateRecipeDraftCommand`:
    - prompt: string

## 4. Szczegóły odpowiedzi

- W przypadku powodzenia:
  - Kod statusu: 201 Created
  - Body: JSON obiekt zawierający dane zgodne z typem `RecipeDraftDTO`
- Możliwe kody błędów:
  - 400 Bad Request – gdy dane wejściowe są nieprawidłowe (np. brak lub błędny format promptu)
  - 401 Unauthorized – gdy użytkownik nie jest uwierzytelniony
  - 500 Internal Server Error – dla niespodziewanych błędów serwera (np. błąd integracji AI)

## 5. Przepływ danych

1. Klient wysyła żądanie POST z JSON zawierającym `prompt`.
2. Warstwa serwera waliduje dane wejściowe przy użyciu Zod.
3. Middleware uwierzytelniający potwierdza tożsamość użytkownika (np. przy użyciu Supabase).
4. Usługa (np. `recipeDraftService`) otrzymuje prompt i wywołuje integrację z zewnętrznym API AI.
5. Po otrzymaniu odpowiedzi z integracji AI, dane są mapowane na strukturę `RecipeDraftDTO`.
6. Endpoint zwraca wygenerowany szkic przepisu z kodem 201 Created.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Endpoint powinien być dostępny tylko dla zalogowanych użytkowników.
- Walidacja danych: Użycie Zod do walidacji danych wejściowych, aby zabezpieczyć przed niewłaściwym formatem danych.
- Ochrona przed atakami: Sanityzacja danych wejściowych oraz ograniczenie requestów do endpointu, aby zapobiec nadużyciom (np. rate limiting).

## 7. Obsługa błędów

- Walidacja: Jeśli `prompt` nie jest dostarczony lub ma nieprawidłowy format, zwróci 400 Bad Request z informacją o błędzie walidacji.
- Uwierzytelnianie: Jeśli brak ważnego tokenu uwierzytelniającego, zwróci 401 Unauthorized.
- Błędy integracji: Jeśli wystąpi błąd komunikacji z usługą AI, endpoint zwróci 500 Internal Server Error z logowaniem błędu.
- Inne nieoczekiwane błędy również powinny być wychwytywane i logowane.

## 8. Rozważania dotyczące wydajności

- Integracja z usługą AI może mieć opóźnienia - należy rozważyć asynchroniczny mechanizm lub timeout - 60 sekund jeeli brak odpowiedzi.
- Ewentualne buforowanie wyników, jeśli prompty są powtarzalne, aby zmniejszyć obciążenie usługi AI.
- Optymalizacja walidacji i mapowania danych w usłudze.

## 9. Etapy wdrożenia

1. Utworzyć Zod schema dla `GenerateRecipeDraftCommand` w celu walidacji danych.
2. Stworzyć lub zaktualizować plik endpointu pod ścieżką `src/pages/api/users/me/recipes/generate.ts` zgodnie z wytycznymi Astro.
3. Zaimplementować middleware uwierzytelniający użytkownika korzystając z kontekstu Supabase.
4. Wyodrębnić logikę generowania przepisu do nowej/usługi (np. `src/lib/services/recipeDraftService.ts`) i zaimplementować integrację z API AI oraz uzyć mocków dla środowiska developerskiego.
5. Mapowanie odpowiedzi otrzymanej z AI na typ `RecipeDraftDTO`.
6. Zaimplementować obsługę błędów, zwracając odpowiednie kody statusu dla błędnych danych, braku autoryzacji oraz błędów serwera.
7. Dodać logowanie akcji i błędów.
