import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from './FormMessage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

export function RegisterForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Basic client-side validation
    if (!email.trim()) {
      setError('Email jest wymagany');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Wprowadź poprawny adres email');
      return;
    }

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
      // Call the register API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        setError(data.error?.message || 'Nie udało się utworzyć konta. Spróbuj ponownie.');
        setIsLoading(false);
        return;
      }

      // Show success message
      setMessage(
        data.data?.message || 'Konto zostało utworzone. Link weryfikacyjny został wysłany na podany adres email.'
      );

      // Clear form
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Wystąpił problem z połączeniem. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-2xl font-bold text-center text-white">Utwórz konto</CardTitle>
        <CardDescription className="text-gray-300 text-center">
          Wprowadź swoje dane, aby utworzyć nowe konto
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <FormMessage type="error">{error}</FormMessage>}

          {message && <FormMessage type="success">{message}</FormMessage>}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="email">
              Adres e-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              autoComplete="email"
              required
              disabled={isLoading || !!message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="password">
              Hasło
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              autoComplete="new-password"
              required
              disabled={isLoading || !!message}
            />
            <p className="text-xs text-gray-400">
              Hasło musi mieć co najmniej 8 znaków i zawierać wielką literę, cyfrę i znak specjalny
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="passwordConfirm">
              Potwierdź hasło
            </label>
            <Input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              autoComplete="new-password"
              required
              disabled={isLoading || !!message}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {!message ? (
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  Tworzenie konta...
                </>
              ) : (
                'Utwórz konto'
              )}
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              onClick={() => (window.location.href = '/auth/login')}
            >
              Przejdź do logowania
            </Button>
          )}

          <div className="text-center text-sm text-gray-300">
            Masz już konto?{' '}
            <a href="/auth/login" className="text-blue-300 hover:text-blue-200 transition-colors">
              Zaloguj się
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
