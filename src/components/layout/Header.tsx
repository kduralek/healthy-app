import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/auth/UserNav';

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a
          href="/"
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Healthy App
        </a>

        <div className="flex items-center gap-4">
          {userEmail ? (
            <UserNav userEmail={userEmail} />
          ) : (
            <>
              <a href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Zaloguj się
              </a>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <a href="/auth/register">Zarejestruj się</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
