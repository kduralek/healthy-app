# Plan implementacji widoku generowania przepisu

## 1. Przegląd

Widok generowania przepisu umożliwia użytkownikowi wprowadzenie promptu w języku polskim, na podstawie którego system generuje przepis kulinarny przy pomocy AI. Użytkownik może następnie przejrzeć wygenerowany przepis i zdecydować, czy chce go zapisać czy odrzucić. Przepis jest automatycznie dostosowywany do preferencji żywieniowych użytkownika.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/recipes/generate`

## 3. Struktura komponentów

```
RecipeGenerationView (strona główna)
├── RecipePromptForm
│   └── Spinner (podczas ładowania)
└── RecipePreview (po wygenerowaniu)
    ├── GenerationStats (informacje o czasie generowania)
    └── SaveButton (przycisk zapisujący przepis)
```

## 4. Szczegóły komponentów

### RecipeGenerationView

- **Opis komponentu**: Główny komponent widoku odpowiedzialny za zarządzanie stanem całego procesu generowania przepisu i koordynację interakcji między podkomponentami.
- **Główne elementy**: Container zawierający formularz wprowadzania promptu oraz, po wygenerowaniu, podgląd przepisu.
- **Obsługiwane interakcje**: Przełączanie między stanem formularza a stanem podglądu przepisu.
- **Obsługiwana walidacja**: N/D (deleguje do podkomponentów).
- **Typy**: `RecipeGenerationState`, `RecipeDraftDTO`, `CreateRecipeCommand`.
- **Propsy**: N/D (komponent główny).

### RecipePromptForm

- **Opis komponentu**: Formularz umożliwiający użytkownikowi wprowadzenie promptu dla AI w celu wygenerowania przepisu.
- **Główne elementy**: Pole tekstowe typu textarea, przycisk "Generuj", opcjonalnie komunikat o błędzie.
- **Obsługiwane interakcje**: Wprowadzanie tekstu, kliknięcie przycisku "Generuj".
- **Obsługiwana walidacja**: Sprawdzenie czy prompt nie jest pusty, minimalna długość promptu.
- **Typy**: `GenerateRecipeDraftCommand`, `RecipePromptFormState`.
- **Propsy**: `onSubmit: (prompt: string) => Promise<void>`, `isLoading: boolean`.

### Spinner

- **Opis komponentu**: Wskaźnik ładowania wyświetlany podczas generowania przepisu.
- **Główne elementy**: Animowany spinner z opcjonalnym tekstem "Generuję przepis...".
- **Obsługiwane interakcje**: N/D (komponent prezentacyjny).
- **Obsługiwana walidacja**: N/D.
- **Typy**: N/D.
- **Propsy**: `size?: "sm" | "md" | "lg"`, `text?: string`.

### RecipePreview

- **Opis komponentu**: Wyświetla wygenerowany przepis i umożliwia jego zapisanie lub odrzucenie.
- **Główne elementy**: Tytuł przepisu, treść przepisu, komponent GenerationStats, przyciski akcji.
- **Obsługiwane interakcje**: Kliknięcie przycisku "Zapisz", kliknięcie przycisku "Odrzuć".
- **Obsługiwana walidacja**: N/D (dane przepisu są już zwalidowane).
- **Typy**: `RecipeDraftDTO`.
- **Propsy**: `recipeDraft: RecipeDraftDTO`, `onSave: () => Promise<void>`, `onDiscard: () => void`, `isSaving: boolean`, `saveError: string | null`, `saveSuccess: boolean`.

### GenerationStats

- **Opis komponentu**: Wyświetla informacje o czasie generowania przepisu.
- **Główne elementy**: Tekst informujący o czasie generowania i dacie wygenerowania.
- **Obsługiwane interakcje**: N/D (komponent prezentacyjny).
- **Obsługiwana walidacja**: N/D.
- **Typy**: N/D.
- **Propsy**: `generatedAt: string`, `generationDuration: number`.

### SaveButton

- **Opis komponentu**: Przycisk umożliwiający zapisanie wygenerowanego przepisu.
- **Główne elementy**: Przycisk z odpowiednim stanem (normalny, ładowanie, sukces).
- **Obsługiwane interakcje**: Kliknięcie przycisku.
- **Obsługiwana walidacja**: N/D.
- **Typy**: N/D.
- **Propsy**: `onClick: () => Promise<void>`, `isSaving: boolean`, `disabled?: boolean`.

## 5. Typy

### RecipeGenerationState

```typescript
interface RecipeGenerationState {
  isLoading: boolean; // Stan ładowania podczas generowania przepisu
  error: string | null; // Komunikat błędu (jeśli wystąpił)
  recipeDraft: RecipeDraftDTO | null; // Wygenerowany przepis
  isSaving: boolean; // Stan ładowania podczas zapisywania
  saveError: string | null; // Błąd zapisywania (jeśli wystąpił)
  saveSuccess: boolean; // Flaga powodzenia zapisywania
}
```

### RecipePromptFormState

```typescript
interface RecipePromptFormState {
  prompt: string; // Treść promptu wprowadzona przez użytkownika
  isValid: boolean; // Czy prompt spełnia wymagania walidacji
  error: string | null; // Komunikat błędu walidacji (jeśli wystąpił)
}
```

### PromptFormProps

```typescript
interface PromptFormProps {
  onSubmit: (prompt: string) => Promise<void>; // Callback wywoływany po zatwierdzeniu formularza
  isLoading: boolean; // Czy trwa proces generowania przepisu
}
```

### RecipePreviewProps

```typescript
interface RecipePreviewProps {
  recipeDraft: RecipeDraftDTO; // Wygenerowany przepis do wyświetlenia
  onSave: () => Promise<void>; // Callback zapisywania przepisu
  onDiscard: () => void; // Callback odrzucania przepisu
  isSaving: boolean; // Czy trwa proces zapisywania
  saveError: string | null; // Błąd zapisywania (jeśli wystąpił)
  saveSuccess: boolean; // Flaga powodzenia zapisywania
}
```

### SaveButtonProps

```typescript
interface SaveButtonProps {
  onClick: () => Promise<void>; // Callback wywoływany po kliknięciu przycisku
  isSaving: boolean; // Czy trwa proces zapisywania
  disabled?: boolean; // Czy przycisk powinien być nieaktywny
}
```

### GenerationStatsProps

```typescript
interface GenerationStatsProps {
  generatedAt: string; // Data wygenerowania przepisu
  generationDuration: number; // Czas generowania przepisu (w ms)
}
```

## 6. Zarządzanie stanem

Główny stan widoku zarządzany będzie przez custom hook `useRecipeGeneration`:

```typescript
function useRecipeGeneration() {
  const [state, setState] = useState<RecipeGenerationState>({
    isLoading: false,
    error: null,
    recipeDraft: null,
    isSaving: false,
    saveError: null,
    saveSuccess: false,
  });

  // Generowanie przepisu na podstawie promptu
  const generateRecipe = async (prompt: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/users/me/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd podczas generowania przepisu');
      }

      const recipeDraft = await response.json();
      setState((prev) => ({ ...prev, isLoading: false, recipeDraft }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Wystąpił nieznany błąd',
      }));
    }
  };

  // Zapisywanie przepisu w bazie danych
  const saveRecipe = async () => {
    if (!state.recipeDraft) return;

    setState((prev) => ({ ...prev, isSaving: true, saveError: null }));
    try {
      // Tutaj należy dodać logikę pobierania preferencji użytkownika (diets, allergens)
      // i dodania ich do danych przepisu
      const createRecipeCommand: CreateRecipeCommand = {
        title: state.recipeDraft.title,
        content: state.recipeDraft.content,
        diets: [], // Preferencje do pobrania z API lub stanu aplikacji
        allergens: [], // Preferencje do pobrania z API lub stanu aplikacji
      };

      const response = await fetch('/api/users/me/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createRecipeCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd podczas zapisywania przepisu');
      }

      setState((prev) => ({ ...prev, isSaving: false, saveSuccess: true }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Wystąpił nieznany błąd',
      }));
    }
  };

  // Odrzucanie wygenerowanego przepisu
  const discardRecipe = () => {
    setState((prev) => ({
      ...prev,
      recipeDraft: null,
      saveSuccess: false,
      saveError: null,
    }));
  };

  return { state, generateRecipe, saveRecipe, discardRecipe };
}
```

Dodatkowo, formularz promptu będzie używał prostszego hooka `usePromptForm`:

```typescript
function usePromptForm(onSubmit: (prompt: string) => Promise<void>) {
  const [state, setState] = useState<RecipePromptFormState>({
    prompt: '',
    isValid: false,
    error: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const prompt = e.target.value;
    const isValid = prompt.trim().length >= 10; // Minimalna długość promptu
    const error = isValid ? null : 'Prompt powinien zawierać co najmniej 10 znaków';

    setState({ prompt, isValid, error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.isValid) {
      await onSubmit(state.prompt);
    }
  };

  return { state, handleChange, handleSubmit };
}
```

## 7. Integracja API

### Generowanie przepisu

**Zapytanie**:

- Metoda: POST
- URL: `/api/users/me/recipes/generate`
- Payload: `{ prompt: string }`
- Typ requestu: `GenerateRecipeDraftCommand`

**Odpowiedź**:

- Status: 201 Created
- Typ odpowiedzi: `RecipeDraftDTO`
- Pola: `title`, `content`, `generated_at`, `generation_duration`

### Zapisywanie przepisu

**Zapytanie**:

- Metoda: POST
- URL: `/api/users/me/recipes`
- Payload: `{ title: string, content: string, diets: string[], allergens: string[] }`
- Typ requestu: `CreateRecipeCommand`

**Odpowiedź**:

- Status: 201 Created
- Typ odpowiedzi: `RecipeDTO`

## 8. Interakcje użytkownika

### Wprowadzenie promptu

1. Użytkownik wpisuje prompt w polu tekstowym.
2. Walidacja sprawdza czy prompt ma wystarczającą długość.
3. Po kliknięciu przycisku "Generuj" wyświetlany jest spinner ładowania.
4. System wykonuje zapytanie do API w celu wygenerowania przepisu.
5. Po otrzymaniu odpowiedzi wyświetlany jest podgląd przepisu.

### Zapisanie przepisu

1. Użytkownik przegląda wygenerowany przepis.
2. Po kliknięciu przycisku "Zapisz" przycisk zmienia stan na ładowanie.
3. System wykonuje zapytanie do API w celu zapisania przepisu.
4. Po otrzymaniu odpowiedzi wyświetlana jest informacja o sukcesie.
5. Opcjonalnie, po zapisie można przekierować użytkownika do listy przepisów.

### Odrzucenie przepisu

1. Użytkownik przegląda wygenerowany przepis.
2. Po kliknięciu przycisku "Odrzuć" system czyści stan i wraca do formularza promptu.
3. Użytkownik może wprowadzić nowy prompt i wygenerować inny przepis.

## 9. Warunki i walidacja

### Formularz promptu

- Prompt nie może być pusty.
- Minimalna długość promptu: 10 znaków.
- Walidacja wykonywana jest podczas wprowadzania tekstu.
- Komunikat o błędzie wyświetlany jest pod polem tekstowym.
- Przycisk "Generuj" jest nieaktywny, gdy walidacja nie przechodzi.

### Zapisywanie przepisu

- Przepis musi zawierać tytuł i treść.
- Walidacja odbywa się na poziomie API.
- Preferencje dietetyczne i alergeny są dołączane automatycznie z profilu użytkownika.

## 10. Obsługa błędów

### Błędy generowania przepisu

- Wyświetlenie komunikatu błędu nad formularzem.
- Możliwość ponowienia próby generowania.
- Obsługa typowych błędów API: 400 (błędne dane), 401 (niezautoryzowany), 500 (błąd serwera).

### Błędy zapisywania przepisu

- Wyświetlenie komunikatu błędu pod podglądem przepisu.
- Możliwość ponowienia próby zapisania.
- Obsługa typowych błędów API: 400 (błędne dane), 401 (niezautoryzowany), 500 (błąd serwera).

### Timeout podczas generowania

- Informacja o przekroczeniu czasu operacji.
- Sugestia uproszczenia promptu.
- Przycisk ponownej próby.

## 11. Kroki implementacji

1. **Utworzenie struktury plików**

   - Utworzenie pliku `src/pages/recipes/generate.astro`
   - Utworzenie plików komponentów React

2. **Implementacja podstawowych komponentów**

   - Implementacja `Spinner`
   - Implementacja `SaveButton`
   - Implementacja `GenerationStats`

3. **Implementacja typów**

   - Zdefiniowanie wszystkich niezbędnych interfejsów i typów

4. **Implementacja custom hooków**

   - Implementacja `useRecipeGeneration`
   - Implementacja `usePromptForm`

5. **Implementacja głównych komponentów**

   - Implementacja `RecipePromptForm`
   - Implementacja `RecipePreview`
   - Implementacja `RecipeGenerationView`

6. **Integracja z API**

   - Implementacja funkcji wywołujących endpointy API
   - Implementacja obsługi odpowiedzi i błędów

7. **Integracja widoku z layoutem**

   - Osadzenie widoku w stronie Astro
   - Dodanie nagłówka i nawigacji

8. **Testowanie i debugowanie**

   - Weryfikacja przepływu generowania przepisu
   - Testowanie obsługi błędów
   - Testowanie responsywności

9. **Końcowe poprawki UI/UX**
   - Dopracowanie animacji i przejść
   - Dodanie komunikatów pomocniczych
   - Optymalizacja UX
