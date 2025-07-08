# React Query Migration Plan for Auth System

## Overview

This document outlines a step-by-step migration plan from the current `useReducer`-based auth system to React Query (TanStack Query), starting with the registration functionality.

## Phase 1: Setup & Foundation (Register Function)

### 1.1 Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 1.2 Setup Query Client

**File:** `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 1.3 Setup Query Provider for Astro

Given that this project uses Astro, we cannot wrap a global layout with a client-side React context provider directly. Instead, we will use Astro's "islands" architecture. We'll create a dedicated, client-side `QueryProvider` component that wraps the React components on pages where React Query is needed.

#### 1.3.1 Create a Generic QueryProvider Component

This reusable component will provide the Query Client to any React components nested within it.

**File:** `src/components/QueryProvider.tsx`

```typescript
'use client';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 1.3.2 Use the Provider in Astro Pages

Now, we'll use this provider in the Astro pages that render client-side React components. The provider itself will be marked as a client component, creating an "island" that includes the form.

**File:** `src/pages/auth/register.astro` (Example)

```astro
---
import AuthLayout from '@/layouts/AuthLayout.astro';
import { QueryProvider } from '@/components/QueryProvider';
import { RegisterForm } from '@/components/auth/RegisterForm';
---

<AuthLayout title="Utwórz konto - Healthy App">
  <QueryProvider client:load>
    <RegisterForm />
  </QueryProvider>
</AuthLayout>
```

This approach correctly scopes the client-side context to the components that need it, fitting perfectly with Astro's architecture.

### 1.4 Create Auth Service Layer

**File:** `src/lib/services/auth.service.ts`

```typescript
interface AuthResponse {
  data?: {
    message: string;
  };
  error?: {
    message: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authService = {
  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = (await response.json()) as AuthResponse;

    if (!response.ok) {
      throw new AuthError(
        responseData.error?.message || 'Nie udało się utworzyć konta. Spróbuj ponownie.',
        response.status
      );
    }

    return {
      message: responseData.data?.message || 
        'Konto zostało utworzone. Link weryfikacyjny został wysłany na podany adres email.'
    };
  },

  // Placeholder for future auth methods
  async login(data: LoginData): Promise<LoginResponse> {
    // TODO: Implement in Phase 2
  },

  async logout(): Promise<void> {
    // TODO: Migrate existing logout logic in Phase 2
  },
};
```

### 1.5 Create Auth Query Keys

**File:** `src/lib/auth/authQueryKeys.ts`

```typescript
export const authQueryKeys = {
  all: ['auth'] as const,
  register: () => [...authQueryKeys.all, 'register'] as const,
  login: () => [...authQueryKeys.all, 'login'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
} as const;
```

### 1.6 Create Register Hook

**File:** `src/lib/auth/hooks/useRegister.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, AuthError } from '../authService';
import { authQueryKeys } from '../authQueryKeys';

interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
}

interface UseRegisterOptions {
  onSuccess?: (data: { message: string }) => void;
  onError?: (error: AuthError) => void;
}

export function useRegister(options?: UseRegisterOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Invalidate related queries if needed
      // queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      
      options?.onSuccess?.(data);
    },
    onError: (error: AuthError) => {
      console.error('Registration error:', error);
      options?.onError?.(error);
    },
    // Optional: Add meta for error tracking
    meta: {
      errorMessage: 'Registration failed',
    },
  });
}
```

### 1.7 Direct Hook Usage (No Wrapper)

Components will use React Query hooks directly without a wrapper `useAuth` hook. This provides:

- **Better TypeScript support** - Direct access to React Query's typed returns
- **Less abstraction** - Fewer layers between component and React Query
- **More flexibility** - Components can use specific React Query features
- **Clearer intent** - Hook names directly reflect their purpose

```typescript
// Example: Direct usage in RegisterForm component
import { useRegister } from '../../../lib/auth/hooks/useRegister';

export function RegisterForm() {
  const { 
    mutate: register, 
    isPending, 
    error, 
    data,
    isSuccess,
    reset 
  } = useRegister({
    onSuccess: (data) => {
      console.log('Registration successful:', data.message);
      // Handle success logic
    },
    onError: (error) => {
      console.error('Registration failed:', error.message);
      // Handle error logic
    },
  });

  // Use mutation directly
  const handleSubmit = (formData) => {
    register(formData);
  };

  // Access React Query states directly
  const isLoading = isPending;
  const errorMessage = error?.message;
  const successMessage = isSuccess ? data?.message : null;
}
```

### 1.8 Update RegisterForm Component

**File:** `src/components/auth/RegisterForm.tsx`

```typescript
import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from './FormMessage';
import { FieldInfo } from './components/FieldInfo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { registerFormSchema } from '@/lib/schemas/auth.schema';
import { useRegister } from '../../lib/auth/hooks/useRegister';

export function RegisterForm() {
  // Use React Query hook directly
  const { 
    mutate: register, 
    isPending, 
    error, 
    data,
    isSuccess,
    reset
  } = useRegister({
    onSuccess: (data) => {
      console.log('Registration successful:', data.message);
      // Reset form on successful registration
      form.reset();
    },
    onError: (error) => {
      console.error('Registration failed:', error.message);
    },
  });

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
      register(value);
    },
  });

  // Reset React Query state when form is reset
  React.useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        reset();
      }, 5000); // Clear success message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  const navigateToLogin = () => {
    window.location.href = '/auth/login';
  };

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
          {error && <FormMessage type="error">{error.message}</FormMessage>}
          {isSuccess && data && <FormMessage type="success">{data.message}</FormMessage>}

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
                  disabled={isPending || isSuccess}
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
                  disabled={isPending || isSuccess}
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
                  disabled={isPending || isSuccess}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {!isSuccess ? (
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              disabled={!form.state.isValid || isPending || form.state.isSubmitting}
            >
              {isPending || form.state.isSubmitting ? (
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
              onClick={navigateToLogin}
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
```

## Phase 2: Login & Session Management

### 2.1 Create Login Service & Hook

```typescript
// Add to authService.ts
async login(data: LoginData): Promise<LoginResponse> {
  // Implementation
}

// Create useLogin.ts
export function useLogin() {
  // Similar to useRegister
}
```

### 2.2 Add Session Queries

```typescript
// Create useSession.ts
export function useSession() {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: authService.getSession,
    staleTime: 5 * 60 * 1000,
  });
}
```

### 2.3 Create Auth Context (Optional)

If you need shared auth state across many components, create an `AuthProvider` that manages global auth state using React Query. However, prefer direct hook usage in individual components when possible.

## Phase 3: Password Management

### 3.1 Reset Password Flow

- Create `useResetPassword`
- Add email verification flow
- Handle password reset tokens

### 3.2 Update Password Flow

- Create `useUpdatePassword`
- Add current password validation
- Handle password strength requirements

## Phase 4: Advanced Features

### 4.1 Optimistic Updates

- Implement optimistic login/logout
- Add offline support
- Background sync for session validation

### 4.2 Error Boundaries

- Create auth-specific error boundaries
- Add retry mechanisms
- Implement error recovery strategies

### 4.3 DevTools Integration

- Setup React Query DevTools
- Add custom debug information
- Implement performance monitoring

## Phase 5: Cleanup & Optimization

### 5.1 Remove Legacy Code

- Delete old `useReducer` auth logic from the previous implementation
- Remove manual state management code
- Clean up unused types and interfaces
- Remove any wrapper hooks that were replaced by direct React Query usage

### 5.2 Performance Optimization

- Implement query prefetching
- Add query dehydration for SSR
- Optimize bundle size

### 5.3 Testing Strategy

- Unit tests for auth service
- Integration tests for mutations
- E2E tests for auth flows

## Migration Timeline

- **Week 1**: Phase 1 (Register function migration)
- **Week 2**: Phase 2 (Login & session management)
- **Week 3**: Phase 3 (Password management)
- **Week 4**: Phase 4 (Advanced features)
- **Week 5**: Phase 5 (Cleanup & optimization)

## Benefits After Migration

1. **Reduced Boilerplate**: Eliminate manual loading/error state management
2. **Better UX**: Automatic retries, optimistic updates, background sync
3. **Developer Experience**: React Query DevTools, better debugging
4. **Performance**: Intelligent caching, background updates
5. **Maintainability**: Service layer separation, better testing
6. **Scalability**: Easy to add new auth features

## Rollback Strategy

- Keep legacy `useAuth` hook during migration
- Feature flags for React Query vs legacy
- Gradual component migration
- Easy rollback if issues arise

## Success Metrics

- Reduced loading times
- Improved error handling
- Less auth-related bugs
- Better user experience
- Cleaner codebase
- Easier feature development

## Next Steps

1. Start with Phase 1 implementation
2. Test thoroughly with registration flow
3. Gather feedback from team
4. Proceed with subsequent phases
5. Monitor performance and user experience
