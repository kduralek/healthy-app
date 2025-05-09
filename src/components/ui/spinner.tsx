import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md', text, className, ...props }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2" {...props}>
      <div
        className={cn('animate-spin rounded-full border-t-transparent border-primary', sizeClasses[size], className)}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
