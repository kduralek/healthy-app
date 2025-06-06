import { useState, useEffect } from 'react';
import type { UserPreferencesDTO } from '@/types';

interface UseUserPreferencesResult {
  preferences: UserPreferencesDTO | null;
  isLoading: boolean;
  error: string | null;
}

interface UserPreferencesErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferencesDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch('/api/users/me/preferences');
        // const response = {
        //   ok: true,
        //   json: async () => ({
        //     diets: [],
        //     allergens: [],
        //     error: null,
        //   }),
        // };

        if (!response.ok) {
          const errorData = (await response.json()) as UserPreferencesErrorResponse;
          throw new Error(errorData.error || 'Nie udało się pobrać preferencji użytkownika');
        }

        const data = (await response.json()) as UserPreferencesDTO;
        setPreferences(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
        setPreferences(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, []);

  return { preferences, isLoading, error };
}
