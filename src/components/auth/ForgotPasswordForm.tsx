import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from './FormMessage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 as SpinnerIcon } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
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

    setIsLoading(true);

    try {
      // Call reset password API endpoint instead of direct Supabase client
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Wystąpił problem z resetowaniem hasła');
      }

      setMessage(data.message);
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Wystąpił problem z resetowaniem hasła. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-2xl font-bold text-center text-white">Zresetuj hasło</CardTitle>
        <CardDescription className="text-gray-300 text-center">
          Wpisz swój adres e-mail, a my wyślemy Ci link do zresetowania hasła
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
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Wysyłanie instrukcji...
              </>
            ) : (
              'Wyślij instrukcje'
            )}
          </Button>

          <div className="text-center text-sm text-gray-300">
            <a href="/auth/login" className="text-blue-300 hover:text-blue-200 transition-colors">
              Powrót do logowania
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
