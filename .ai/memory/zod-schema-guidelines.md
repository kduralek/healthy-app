# Zod Schema Guidelines & Best Practices

## Overview

Zod is a TypeScript-first schema validation library with static type inference. This memory bank contains guidelines for creating robust, maintainable, and type-safe schemas in our healthy-app project.

## Core Principles

### 1. **Polish Error Messages**
All error messages should be in Polish to match the UI language.

```typescript
const emailSchema = z
  .string()
  .min(1, 'E-mail jest wymagany')
  .email('Nieprawidłowy format adresu email')
  .max(254, 'E-mail nie może przekraczać 254 znaków');
```

### 2. **Explicit Error Context**
Always provide `required_error` for better UX when fields are missing.

```typescript
const passwordSchema = z.string({
  required_error: 'Hasło jest wymagane',
  invalid_type_error: 'Hasło musi być ciągiem znaków',
});
```

### 3. **Layered Validation**
Build complex validation using composition and refinements.

```typescript
const passwordSchema = z
  .string()
  .min(8, 'Hasło musi mieć co najmniej 8 znaków')
  .max(128, 'Hasło nie może przekraczać 128 znaków')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Hasło musi zawierać co najmniej jedną wielką literę'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Hasło musi zawierać co najmniej jedną cyfrę'
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    'Hasło musi zawierać co najmniej jeden znak specjalny'
  );
```

## Schema Organization

### File Structure
```
src/lib/schemas/
├── auth.schema.ts      # Authentication forms
├── recipe.schema.ts    # Recipe-related schemas
├── user.schema.ts      # User profile schemas
└── common.schema.ts    # Shared/reusable schemas
```

### Naming Conventions
- **Schemas**: `camelCase` ending with `Schema`
- **Types**: `PascalCase` ending with `Data`
- **Files**: `kebab-case.schema.ts`

```typescript
// Good
export const registerFormSchema = z.object({...});
export type RegisterFormData = z.infer<typeof registerFormSchema>;

// Bad
export const RegisterFormSchema = z.object({...});
export type registerFormData = z.infer<typeof RegisterFormSchema>;
```

## Common Patterns

### 1. **Email Validation**
```typescript
const emailSchema = z
  .string()
  .min(1, 'E-mail jest wymagany')
  .max(254, 'E-mail nie może przekraczać 254 znaków') // RFC 5321 limit
  .refine(
    (email) => email.length === 0 || z.string().email().safeParse(email).success,
    'Nieprawidłowy format adresu email'
  );
```

### 2. **Password Validation**
```typescript
const passwordSchema = z
  .string({
    required_error: 'Hasło jest wymagane',
  })
  .min(8, 'Hasło musi mieć co najmniej 8 znaków')
  .max(128, 'Hasło nie może przekraczać 128 znaków')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Hasło musi zawierać co najmniej jedną wielką literę'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Hasło musi zawierać co najmniej jedną cyfrę'
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    'Hasło musi zawierać co najmniej jeden znak specjalny'
  );
```

### 3. **Password Confirmation**
```typescript
const passwordConfirmationSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string({
      required_error: 'Potwierdzenie hasła jest wymagane',
    }),
  })
  .refine(
    (data) => data.password === data.passwordConfirm,
    {
      message: 'Hasła nie są identyczne',
      path: ['passwordConfirm'], // Attach error to specific field
    }
  );
```

### 4. **Optional with Default**
```typescript
const userPreferencesSchema = z.object({
  diets: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  notifications: z.boolean().default(true),
});
```

### 5. **Conditional Validation**
```typescript
const recipeSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  isPublic: z.boolean(),
  publishDate: z.date().optional(),
}).refine(
  (data) => !data.isPublic || data.publishDate,
  {
    message: 'Data publikacji jest wymagana dla publicznych przepisów',
    path: ['publishDate'],
  }
);
```

## Advanced Patterns

### 1. **Discriminated Unions**
```typescript
const paymentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('card'),
    cardNumber: z.string().min(16, 'Numer karty jest wymagany'),
    expiryDate: z.string().min(5, 'Data wygaśnięcia jest wymagana'),
  }),
  z.object({
    type: z.literal('paypal'),
    email: emailSchema,
  }),
]);
```

### 2. **Recursive Schemas**
```typescript
const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    subcategories: z.array(categorySchema).optional(),
  })
);
```

### 3. **Transform and Preprocess**
```typescript
const numericStringSchema = z
  .string()
  .refine((val) => !isNaN(Number(val)), 'Musi być liczbą')
  .transform((val) => Number(val));

const trimmedStringSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, 'Pole nie może być puste');
```

## Integration with Forms

### TanStack Form Integration
```typescript
// Schema definition
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Hasło jest wymagane'),
});

// Type inference
export type LoginFormData = z.infer<typeof loginFormSchema>;

// Form usage
const form = useForm({
  defaultValues: {
    email: '',
    password: '',
  } as LoginFormData,
  validators: {
    onChange: loginFormSchema,
  },
});
```

### React Hook Form Integration
```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginFormSchema),
  defaultValues: {
    email: '',
    password: '',
  },
});
```

## Testing Schemas

### Unit Tests Structure
```typescript
describe('authSchema', () => {
  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      const validEmails = ['test@example.com', 'user+tag@domain.co.uk'];
      validEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = ['', 'not-email', '@domain.com'];
      invalidEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });
});
```

### Test Data Factories
```typescript
export const createValidRegisterData = (overrides?: Partial<RegisterFormData>): RegisterFormData => ({
  email: 'test@example.com',
  password: 'ValidPass123!',
  passwordConfirm: 'ValidPass123!',
  ...overrides,
});
```

## Performance Guidelines

### 1. **Reuse Base Schemas**
```typescript
// Good - reuse base schemas
const emailSchema = z.string().email();
const loginSchema = z.object({ email: emailSchema });
const registerSchema = z.object({ email: emailSchema });

// Bad - duplicate validation logic
const loginSchema = z.object({ email: z.string().email() });
const registerSchema = z.object({ email: z.string().email() });
```

### 2. **Lazy Evaluation for Complex Schemas**
```typescript
const complexSchema = z.lazy(() => 
  z.object({
    // Complex nested structure
  })
);
```

### 3. **Early Returns in Refinements**
```typescript
const optimizedSchema = z
  .string()
  .refine((val) => {
    if (!val) return false; // Early return for empty values
    return /complex-regex/.test(val);
  });
```

## Security Considerations

### 1. **Input Sanitization**
```typescript
const sanitizedStringSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => !/[<>]/.test(val), 'Niedozwolone znaki');
```

### 2. **Length Limits**
```typescript
const secureTextSchema = z
  .string()
  .max(10000, 'Tekst jest zbyt długi') // Prevent DoS
  .min(1, 'Tekst jest wymagany');
```

### 3. **File Upload Validation**
```typescript
const fileSchema = z.object({
  name: z.string().refine(
    (name) => /\.(jpg|jpeg|png|gif)$/i.test(name),
    'Dozwolone tylko pliki graficzne'
  ),
  size: z.number().max(5_000_000, 'Plik nie może przekraczać 5MB'),
  type: z.enum(['image/jpeg', 'image/png', 'image/gif']),
});
```

## Common Mistakes to Avoid

### 1. **Don't Use `.nullable()` Unless Necessary**
```typescript
// Bad - allows null unexpectedly
const badSchema = z.string().nullable();

// Good - explicit optional handling
const goodSchema = z.string().optional();
```

### 2. **Avoid Overly Complex Refinements**
```typescript
// Bad - hard to debug
const badSchema = z.string().refine((val) => 
  val.length > 5 && /[A-Z]/.test(val) && /[0-9]/.test(val)
);

// Good - separate concerns
const goodSchema = z.string()
  .min(6, 'Minimum 6 znaków')
  .refine((val) => /[A-Z]/.test(val), 'Wymaga wielkiej litery')
  .refine((val) => /[0-9]/.test(val), 'Wymaga cyfry');
```

### 3. **Don't Forget Error Path for Cross-Field Validation**
```typescript
// Bad - error not attached to specific field
.refine((data) => data.password === data.confirm, 'Hasła nie pasują');

// Good - error attached to confirm field
.refine((data) => data.password === data.confirm, {
  message: 'Hasła nie pasują',
  path: ['confirm'],
});
```

## Project-Specific Standards

### 1. **Error Message Language**
All user-facing error messages must be in Polish.

### 2. **Field Naming**
- Use camelCase for field names
- Match form field names exactly with schema keys
- Use descriptive names: `passwordConfirm` not `confirmPassword`

### 3. **Schema Location**
- Auth schemas: `src/lib/schemas/auth.schema.ts`
- Feature schemas: `src/lib/schemas/{feature}.schema.ts`
- Shared utilities: `src/lib/schemas/common.schema.ts`

### 4. **Type Exports**
Always export inferred types alongside schemas:
```typescript
export const mySchema = z.object({...});
export type MyData = z.infer<typeof mySchema>;
```

## Examples from Current Project

Refer to `src/lib/schemas/auth.schema.ts` for production examples of:
- Email validation with Polish error messages
- Strong password requirements
- Cross-field password confirmation
- Multiple form schema variations (login, register, forgot password)

---

**Last Updated**: 2025-01-24  
**Version**: 1.0  
**Maintainer**: AI Assistant 