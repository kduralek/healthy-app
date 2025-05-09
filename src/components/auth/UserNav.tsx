import * as React from 'react';
import { Button } from '../ui/button';

export function UserNav() {
  const [isOpen, setIsOpen] = React.useState(false);

  // In a real implementation, this would come from the auth context
  const user = {
    email: 'user@example.com',
    name: 'John Doe',
    imageUrl: null,
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const handleLogout = () => {
    // In a real implementation, this would call the logout API
    console.log('Logout clicked');
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
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        <span className="hidden md:inline text-sm font-medium">{user.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div
          id="user-menu"
          className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-card p-1 shadow-md z-20"
          role="menu"
        >
          <div className="p-2 pt-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
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
                  Profile
                </a>
              </li>
              <li role="none">
                <a
                  href="/profile/change-password"
                  className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                  role="menuitem"
                >
                  <LockIcon className="h-4 w-4" />
                  Change Password
                </a>
              </li>
            </ul>
          </nav>

          <div className="h-px bg-border my-1" />

          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 w-full rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
            role="menuitem"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}

// Simple icons
const ChevronDownIcon = ({ className }: { className?: string }) => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
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
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
