import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from './FormMessage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface LoginFormProps {
  returnUrl?: string;
}

interface LoginResponse {
  data?: {
    redirectTo?: string;
  };
  error?: {
    message?: string;
  };
}

export function LoginForm({ returnUrl = '/app/recipes/generate' }: LoginFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client-side validation
    if (!email.trim()) {
      setError('Email jest wymagany');
      return;
    }

    if (!password.trim()) {
      setError('Hasło jest wymagane');
      return;
    }

    setIsLoading(true);

    try {
      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        // Handle error response
        setError(data.error?.message || 'Nie udało się zalogować. Spróbuj ponownie.');
        setIsLoading(false);
        return;
      }

      // Successful login - redirect to the return URL or default
      window.location.href = data.data?.redirectTo || returnUrl;
    } catch (err) {
      console.error('Login error:', err);
      setError('Wystąpił problem z połączeniem. Spróbuj ponownie.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-2xl font-bold text-center text-white">Zaloguj się</CardTitle>
        <CardDescription className="text-gray-300 text-center">
          Wpisz swój adres e-mail i hasło, aby się zalogować
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} data-testid="login-form">
        <CardContent className="space-y-4">
          {error && <FormMessage type="error">{error}</FormMessage>}

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
              autoComplete="off"
              required
              data-testid="login-email-input"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-200" htmlFor="password">
                Hasło
              </label>
              <a href="/auth/forgot-password" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                Zapomniałeś hasła?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              autoComplete="off"
              required
              data-testid="login-password-input"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            disabled={isLoading}
            data-testid="login-submit-button"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Logowanie...
              </>
            ) : (
              'Zaloguj się'
            )}
          </Button>

          <div className="text-center text-sm text-gray-300">
            Nie masz jeszcze konta?{' '}
            <a href="/auth/register" className="text-blue-300 hover:text-blue-200 transition-colors">
              Zarejestruj się
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
    aria-label="Ładowanie"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
