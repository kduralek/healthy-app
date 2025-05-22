import * as React from 'react';
import { cn } from '@/lib/utils';

export type MessageType = 'error' | 'success' | 'info';

interface FormMessageProps {
  type?: MessageType;
  children: React.ReactNode;
  className?: string;
}

export function FormMessage({ type = 'info', children, className }: FormMessageProps) {
  if (!children) {
    return null;
  }

  const messageClasses = {
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  const icons = {
    error: <ErrorIcon className="h-4 w-4 shrink-0" />,
    success: <SuccessIcon className="h-4 w-4 shrink-0" />,
    info: <InfoIcon className="h-4 w-4 shrink-0" />,
  };

  return (
    <div className={cn('flex items-center gap-2 rounded-md border px-3 py-2 text-sm', messageClasses[type], className)}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

// Simple icons
const ErrorIcon = ({ className }: { className?: string }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SuccessIcon = ({ className }: { className?: string }) => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
