import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from './FormMessage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 as SpinnerIcon } from 'lucide-react';

interface UpdatePasswordFormProps {
  isCodeValid: boolean;
  errorMessage: string;
}

export function UpdatePasswordForm({ isCodeValid, errorMessage }: UpdatePasswordFormProps) {
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(errorMessage || null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Ustawiamy błąd, gdy kod nie jest poprawny, przy pierwszym renderowaniu
  React.useEffect(() => {
    if (!isCodeValid && !error) {
      setError('Kod resetowania hasła jest nieprawidłowy lub wygasł. Poproś o nowy link resetujący.');
    }
  }, [isCodeValid, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Jeśli kod nie jest poprawny, blokujemy zmianę hasła
    if (!isCodeValid) {
      setError('Kod resetowania hasła jest nieprawidłowy lub wygasł. Poproś o nowy link resetujący.');
      return;
    }

    // Basic client-side validation
    if (!password.trim()) {
      setError('Hasło jest wymagane');
      return;
    }

    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    // Check for password requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      setError('Hasło musi zawierać co najmniej jedną wielką literę, jedną cyfrę i jeden znak specjalny');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Hasła nie pasują do siebie');
      return;
    }

    setIsLoading(true);

    try {
      // Używamy naszego API endpoint zamiast bezpośredniego wywołania Supabase
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Wystąpił problem z aktualizacją hasła');
      }

      setMessage(data.message || 'Twoje hasło zostało pomyślnie zresetowane. Możesz teraz zalogować się nowym hasłem.');
      setPassword('');
      setPasswordConfirm('');
    } catch (err) {
      console.error('Password update error:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił problem z aktualizacją hasła. Spróbuj ponownie później.');
    } finally {
      setIsLoading(false);
    }
  };

  // Jeśli kod nie jest poprawny, wyświetlamy tylko komunikat o błędzie
  if (!isCodeValid) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-2xl font-bold text-center text-white">Ustaw nowe hasło</CardTitle>
        </CardHeader>
        <CardContent>
          <FormMessage type="error">{error || errorMessage}</FormMessage>
          <div className="mt-6 text-center">
            <a href="/auth/forgot-password" className="text-blue-300 hover:text-blue-200 transition-colors">
              Poproś o nowy link resetujący
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-2xl font-bold text-center text-white">Ustaw nowe hasło</CardTitle>
        <CardDescription className="text-gray-300 text-center">Utwórz nowe hasło dla swojego konta</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <FormMessage type="error">{error}</FormMessage>}

          {message && <FormMessage type="success">{message}</FormMessage>}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="password">
              Nowe hasło
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-gray-400">
              Hasło musi mieć co najmniej 8 znaków i zawierać wielką literę, cyfrę i znak specjalny
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="passwordConfirm">
              Potwierdź nowe hasło
            </label>
            <Input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              autoComplete="new-password"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            disabled={isLoading || !!message}
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Ustawianie nowego hasła...
              </>
            ) : (
              'Ustaw nowe hasło'
            )}
          </Button>

          {message && (
            <div className="text-center text-sm text-gray-300">
              <a href="/auth/login" className="text-blue-300 hover:text-blue-200 transition-colors">
                Przejdź do logowania
              </a>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
