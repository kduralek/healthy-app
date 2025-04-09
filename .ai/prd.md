# Dokument wymagań produktu (PRD) - healthy-meal-app

## 1. Przegląd produktu
Celem aplikacji jest umożliwienie użytkownikom dostosowywania przepisów kulinarnych znalezionych w internecie do ich indywidualnych potrzeb żywieniowych. Aplikacja wykorzystuje darmowe modele AI do generowania oraz modyfikacji przepisów na podstawie preferencji użytkownika. Kluczowe funkcjonalności MVP obejmują rejestrację użytkownika, zarządzanie profilem (w tym ustawienia preferencji żywieniowych), generowanie przepisów na podstawie wpisanego promptu i możliwość modyfikacji tych przepisów przez AI, a także zapisywanie i przeglądanie przepisów.

## 2. Problem użytkownika
Użytkownicy często napotykają trudności przy adaptowaniu dostępnych online przepisów do własnych ograniczeń dietetycznych i alergii. Brak możliwości łatwego eliminowania niepożądanych składników i dostosowywania przepisów do indywidualnych preferencji żywieniowych powoduje, że gotowanie staje się bardziej skomplikowane i czasochłonne.

## 3. Wymagania funkcjonalne
- Rejestracja i logowanie użytkownika oraz możliwość zarządzania kontem (w tym zmiana hasła).
- Konfiguracja i aktualizacja preferencji żywieniowych (wybór diety oraz alergii).
- Możliwość generowania przepisu na podstawie wpisanego promptu w języku polskim.
- Integracja z darmowymi modelami AI do modyfikowania wygenerowanych przepisów, głównie poprzez eliminację niekompatybilnych składników.
- Zapisywanie przepisu w bazie danych.
- Przegląd i zarządzanie zapisanymi przepisami (odczyt, usuwanie, przegląd historii).
- Strona wyświetlająca wszystkie przepisy użytkowników z paginacją.

## 4. Granice produktu
- MVP nie obejmuje importu przepisów z adresu URL.
- Nie przewiduje się rozbudowanej obsługi multimediów (np. zdjęć przepisów).
- Funkcjonalność udostępniania przepisów dla innych użytkowników oraz funkcje społecznościowe nie są częścią MVP.
- Szczegóły dotyczące procesu modyfikacji przepisu przez AI (np. zastępowanie składników alternatywnymi zamiennikami) oraz wymagania dotyczące walidacji i formatowania przepisów pozostają do dalszego określenia.

## 5. Historyjki użytkowników
- US-001: Rejestracja i logowanie oraz zarządzanie kontem
  - Opis: Jako nowy użytkownik chcę zarejestrować się, zalogować i mieć możliwość zmiany hasła, aby korzystać z aplikacji w sposób bezpieczny.
  - Kryteria akceptacji:
    - Dostępność formularza rejestracyjnego przyjmującego email i hasło.
    - Możliwość logowania przy użyciu poprawnych danych uwierzytelniających.
    - Funkcjonalność zmiany hasła dostępna dla zalogowanych użytkowników.
    - Walidacja danych (poprawny format email, minimalna długość hasła).

- US-002: Konfiguracja preferencji żywieniowych
  - Opis: Jako użytkownik chcę ustawić i aktualizować swoje preferencje żywieniowe, aby aplikacja mogła generować przepisy zgodne z moimi potrzebami dietetycznymi.
  - Kryteria akceptacji:
    - Możliwość wyboru preferowanej diety oraz wskazania alergii.
    - Funkcjonalność zapisu i późniejszego odczytu ustawień podczas logowania.
    - Intuicyjny interfejs umożliwiający łatwą wymianę ustawień.

- US-003: Generowanie i modyfikacja przepisu przez AI
  - Opis: Jako użytkownik chcę wprowadzić prompt w języku polskim, aby system wygenerował przepis, który następnie może być modyfikowany przez AI w celu eliminacji niepożądanych składników.
  - Kryteria akceptacji:
    - Użytkownik ma dostęp do formularza wprowadzania promptu.
    - System generuje przepis na podstawie wpisanego promptu.
    - AI modyfikuje przepis zgodnie z ustawionymi preferencjami dietetycznymi.
    - Użytkownik może zaakceptować lub odrzucić wygenerowany przepis.

- US-004: Zarządzanie zapisanymi przepisami
  - Opis: Jako użytkownik chcę zapisywać, przeglądać oraz usuwać przepisy, aby mieć kontrolę nad moim zbiorem przepisów kulinarnych.
  - Kryteria akceptacji:
    - Przepis jest zapisywany w bazie danych po akceptacji przez użytkownika.
    - Użytkownik ma możliwość przeglądania listy swoich zapisanych przepisów.
    - Opcja usuwania przepisów funkcjonuje poprawnie i wymaga potwierdzenia operacji.

- US-005: Przegląd przepisów użytkowników z paginacją
  - Opis: Jako użytkownik chcę przeglądać przepisy innych użytkowników w formie listy z paginacją, aby znaleźć nowe inspiracje kulinarne.
  - Kryteria akceptacji:
    - Strona wyświetla przepisy z zastosowaniem paginacji.
    - Interfejs umożliwia łatwe przechodzenie między stronami z przepisami.
    - Użytkownik może przeglądać przepisy bez możliwości ich edycji.

## 6. Metryki sukcesu
- Co najmniej 90% użytkowników posiada wypełnioną sekcję preferencji żywieniowych w swoim profilu.
- Co najmniej 75% użytkowników generuje jeden lub więcej przepisów w tygodniu.
- Liczba zaakceptowanych i zapisanych przepisów jest monitorowana za pomocą logów aplikacji, co umożliwia ocenę skuteczności integracji AI oraz przydatności funkcjonalności aplikacji. 