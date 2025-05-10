import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface EmailVerificationStatusProps {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export function EmailVerificationStatus({
  status: initialStatus,
  message: initialMessage,
}: EmailVerificationStatusProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(initialStatus);
  const [message, setMessage] = useState<string>(initialMessage);

  useEffect(() => {
    // If the initial status is loading, simulate a brief loading state
    if (initialStatus === 'loading') {
      const timer = setTimeout(() => {
        setStatus(initialStatus);
        setMessage(initialMessage);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [initialStatus, initialMessage]);

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-2xl font-bold text-center text-white">
          {status === 'loading' && 'Weryfikacja adresu email'}
          {status === 'success' && 'Weryfikacja udana'}
          {status === 'error' && 'Błąd weryfikacji'}
        </CardTitle>
        <CardDescription className="text-gray-300 text-center">
          {status === 'loading' && 'Trwa weryfikacja twojego adresu email...'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-2">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
            <p className="text-gray-300">Prosimy o cierpliwość, weryfikujemy twój adres email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-400" />
            <p className="text-white text-center">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-400" />
            <p className="text-white text-center">{message}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-center pt-6">
        {status !== 'loading' && (
          <Button
            className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            onClick={() => (window.location.href = '/auth/login')}
          >
            {status === 'success' ? 'Przejdź do logowania' : 'Powrót do logowania'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
