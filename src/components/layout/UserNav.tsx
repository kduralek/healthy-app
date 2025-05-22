import * as React from 'react';
import { User as UserIcon, Lock as LockIcon, LogOut as LogOutIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '@/components/auth/hooks/useAuth';

interface UserNavProps {
  userEmail: string;
}

export function UserNav({ userEmail }: UserNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { logout } = useAuth();

  // Generate initials from email
  const getInitials = (email?: string) => {
    if (!email) {
      return 'U';
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Close dropdown when clicking outside or pressing escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => setIsOpen(false);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    // Add event listeners
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Clean up
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-2"
        onClick={(e) => {
          e.stopPropagation(); // Prevent immediate closing
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="user-menu"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
          {getInitials(userEmail)}
        </div>
      </Button>

      {isOpen && (
        <div
          id="user-menu"
          className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-card p-1 shadow-md z-20"
          role="menu"
        >
          <div className="p-2 pt-1">
            <p className="text-sm font-medium">{userEmail}</p>
          </div>

          <div className="h-px bg-border my-1" />

          <nav>
            <ul className="space-y-1">
              <li role="none">
                <a
                  href="/profile"
                  className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                  role="menuitem"
                >
                  <UserIcon className="h-4 w-4" />
                  Profil
                </a>
              </li>
              <li role="none">
                <a
                  href="/profile/change-password"
                  className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                  role="menuitem"
                >
                  <LockIcon className="h-4 w-4" />
                  Zmień hasło
                </a>
              </li>
            </ul>
          </nav>

          <div className="h-px bg-border my-1" />

          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 w-full rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            onClick={logout}
            role="menuitem"
          >
            <LogOutIcon className="h-4 w-4" />
            Wyloguj
          </Button>
        </div>
      )}
    </div>
  );
}
