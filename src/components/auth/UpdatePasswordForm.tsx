import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from '@/components/ui/auth/FormMessage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseClient } from '@/db/supabase.client';
import { Loader2 as SpinnerIcon } from 'lucide-react';

export function UpdatePasswordForm() {
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

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
      setError('Hasła nie są identyczne');
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's password
      const { error } = await supabaseClient.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      // Show success message
      setMessage('Twoje hasło zostało pomyślnie zmienione.');
      setIsComplete(true);

      // Clear form
      setPassword('');
      setPasswordConfirm('');
    } catch (err) {
      console.error('Password update error:', err);
      setError('Wystąpił problem z aktualizacją hasła. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-2xl font-bold text-center text-white">Ustaw nowe hasło</CardTitle>
        <CardDescription className="text-gray-300 text-center">Wprowadź swoje nowe hasło dla konta</CardDescription>
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
              disabled={isComplete}
              required
            />
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
              disabled={isComplete}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {!isComplete ? (
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              disabled={isLoading || isComplete}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  Aktualizacja hasła...
                </>
              ) : (
                'Ustaw nowe hasło'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = '/auth/login')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Przejdź do logowania
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
