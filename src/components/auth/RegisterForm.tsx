import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from './FormMessage';
import { FieldInfo } from './components/FieldInfo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { registerFormSchema } from '@/lib/schemas/auth.schema';

interface RegisterResponse {
  data: {
    message: string;
  };
  error?: {
    message: string;
  };
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
    validators: {
      onChange: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setSubmitError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        });

        const data = (await response.json()) as RegisterResponse;

        if (!response.ok) {
          setSubmitError(data.error?.message || 'Nie udało się utworzyć konta. Spróbuj ponownie.');
          return;
        }

        setSuccessMessage(
          data.data?.message || 'Konto zostało utworzone. Link weryfikacyjny został wysłany na podany adres email.'
        );

        // Reset form after successful submission
        form.reset();
      } catch (err) {
        console.error('Registration error:', err);
        setSubmitError('Wystąpił problem z połączeniem. Spróbuj ponownie.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-2xl font-bold text-center text-white">Utwórz konto</CardTitle>
        <CardDescription className="text-gray-300 text-center">
          Wprowadź swoje dane, aby utworzyć nowe konto
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="space-y-4 mb-8">
          {submitError && <FormMessage type="error">{submitError}</FormMessage>}
          {successMessage && <FormMessage type="success">{successMessage}</FormMessage>}

          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200" htmlFor="email">
                  Adres e-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  autoComplete="email"
                  disabled={isLoading || !!successMessage}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200" htmlFor="password">
                  Hasło
                </label>
                <Input
                  id="password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  autoComplete="new-password"
                  disabled={isLoading || !!successMessage}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="passwordConfirm">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200" htmlFor="passwordConfirm">
                  Potwierdź hasło
                </label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  autoComplete="new-password"
                  disabled={isLoading || !!successMessage}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {!successMessage ? (
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              disabled={!form.state.isValid || isLoading || form.state.isSubmitting}
            >
              {isLoading || form.state.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
