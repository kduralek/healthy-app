# OpenRouter Service Implementation Plan

## 1. Opis usługi

OpenRouterService to warstwa pośrednicząca między aplikacją a API OpenRouter, umożliwiająca:

1. Budowanie i wysyłanie żądań chat completion do LLM.
2. Konfigurowanie komunikatów systemowych i użytkownika.
3. Definiowanie formatu odpowiedzi (response_format) z użyciem schematu JSON.
4. Wybór modelu i parametrów generacji.
5. Obsługę odpowiedzi oraz błędów.

Całość powinna być implementowana w TypeScript w katalogu `src/lib`.

## 2. Opis konstruktora

```ts
class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private defaultParams: Record<string, any>;

  constructor(apiKey: string, options?: {
    baseUrl?: string;
    defaultModel?: string;
    defaultParams?: Record<string, any>;
  }) {
    // 1. Sprawdzenie apiKey (guard clause)
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is required');

    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? 'https://openrouter.ai/v1';
    this.defaultModel = options?.defaultModel ?? 'gpt-4o-mini';
    this.defaultParams = options?.defaultParams ?? { max_tokens: 100, temperature: 0.8 };
  }
}
```

## 3. Publiczne metody i pola

- **Pola:**
  - `defaultModel: string`
  - `defaultParams: Record<string, any>`

- **Metody:**
  - `async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult>`
    - Parametry:
      - `messages: Message[]` (zawiera role `system` i `user`)
      - `model?: string` (nazwa modelu)
      - `params?: Record<string, any>` (parametry modelu)
      - `responseFormat?: ResponseFormat` (opcjonalny schemat JSON)
    - Zwraca zwalidowany wynik generacji.

## 4. Prywatne metody i pola

- `private buildRequestPayload(options: ChatCompletionOptions): OpenRouterRequest` – tworzy obiekt żądania.
- `private async sendRequest(payload: OpenRouterRequest): Promise<any>` – wysyła HTTP POST przy użyciu `fetch` lub `axios`.
- `private validateResponse(data: any, format?: ResponseFormat): ChatCompletionResult` – wykonuje walidację odpowiedzi przy pomocy AJV.
- `private handleError(error: any): never` – rzuca ustandaryzowany wyjątek.

## 5. Obsługa błędów

1. Błąd sieciowy (timeout, brak połączenia)
2. Błąd HTTP 4xx (np. 401 – brak/nieprawidłowy klucz API)
3. Błąd HTTP 429 (rate limit)
4. Błąd HTTP 5xx (serwer po stronie OpenRouter)
5. Błąd walidacji schematu JSON (odpowiedź niezgodna z `responseFormat`)
6. Nieoczekiwany błąd wewnętrzny

Dla każdego scenariusza:

- Użyj niestandardowych klas błędów (np. `NetworkError`, `AuthenticationError`, `ValidationError`).
- Stosuj retry z backoffem dla błędów tymczasowych (timeout, 5xx, 429).
- Wyrzucaj natychmiastowy wyjątek dla błędów krytycznych (4xx, walidacja).

## 6. Kwestie bezpieczeństwa

- **Przechowywanie klucza API:** zmienne środowiskowe (`.env`) i dostęp tylko po stronie serwera.
- **TLS:** zawsze HTTPS.
- **Rate limits:** zaimplementuj mechanizm backoff/retry.
- **Redakcja logów:** nie zapisuj pełnych treści użytkownika ani klucza.
- **Ochrona przed wstrzyknięciami:** sanityzacja inputu przed wysłaniem.

## 7. Plan wdrożenia krok po kroku

1. Zainstaluj zależności:

   ```bash
   npm install axios ajv
   ```

2. Dodaj w root pliku `.env`:

   ```env
   OPENROUTER_API_KEY=your_api_key_here
   ```

3. Stwórz plik `src/types.ts` z definicjami:

   ```ts
   export interface Message { role: 'system' | 'user'; content: string; }
   export interface ResponseFormat { type: 'json_schema'; json_schema: { name: string; strict: boolean; schema: Record<string, any> }; }
   export interface ChatCompletionOptions { messages: Message[]; model?: string; params?: Record<string, any>; responseFormat?: ResponseFormat; }
   export interface ChatCompletionResult { // dopasuj do schematu
     [key: string]: any;
   }
   ```

4. Utwórz `src/lib/openrouterService.ts` i zaimplementuj klasę według sekcji 2–4 z użyciem `axios` i `ajv`.
5. Dodaj testy jednostkowe w `src/lib/openrouterService.spec.ts` (symulacja odpowiedzi, walidacja błędów).
6. W integracji (w API Astro lub React) zaimportuj i użyj serwisu:

   ```ts
   import { OpenRouterService } from '~/lib/openrouterService';
   const service = new OpenRouterService(process.env.OPENROUTER_API_KEY!);
   const result = await service.chatCompletion({ /* ... */ });
   ```

7. Skonfiguruj monitorowanie i logowanie (np. Sentry, Logflare).
8. Przetestuj end-to-end w staging.
9. Wdróż na produkcję (GitHub Actions → DigitalOcean).  

---

### Przykłady kluczowych elementów

1. **Komunikat systemowy**

   ```ts
   const systemMsg: Message = { role: 'system', content: 'You are a helpful assistant.' };
   ```

2. **Komunikat użytkownika**

   ```ts
   const userMsg: Message = { role: 'user', content: 'Jaka będzie pogoda w Warszawie?' };
   ```

3. **Response Format**

   ```ts
   const responseFormat: ResponseFormat = {
     type: 'json_schema',
     json_schema: {
       name: 'WeatherResponse',
       strict: true,
       schema: {
         temperature: { type: 'number' },
         condition: { type: 'string' }
       }
     }
   };
   ```

4. **Nazwa modelu i parametry**

   ```ts
   const modelName = 'gpt-4o-mini';
   const modelParams = { max_tokens: 150, temperature: 0.7 };
   ```

5. **Wywołanie metody**

   ```ts
   const result = await service.chatCompletion({
     messages: [systemMsg, userMsg],
     model: modelName,
     params: modelParams,
     responseFormat
   });
   console.log(result);
   ```
