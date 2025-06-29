import { z } from 'zod';

const passwordSchema = z
  .string()
  .refine((password) => password.length >= 8, 'Hasło musi mieć co najmniej 8 znaków')
  .refine(
    (password) => /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password),
    'Hasło musi zawierać co najmniej jedną wielką literę, jedną cyfrę i jeden znak specjalny'
  );

const emailSchema = z
  .string()
  .min(1, 'E-mail jest wymagany')
  .max(254, 'E-mail nie może przekraczać 254 znaków')
  .refine(
    (email) => email.length === 0 || z.string().email().safeParse(email).success,
    'Nieprawidłowy format adresu email'
  );

export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Hasła nie są identyczne',
    path: ['passwordConfirm'],
  });

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z
    .string({
      required_error: 'Hasło jest wymagane',
    })
    .min(1, 'Hasło jest wymagane'),
});

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: 'Aktualne hasło jest wymagane',
      })
      .min(1, 'Aktualne hasło jest wymagane'),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string({
      required_error: 'Potwierdzenie nowego hasła jest wymagane',
    }),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: 'Nowe hasła nie są identyczne',
    path: ['newPasswordConfirm'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Nowe hasło musi różnić się od aktualnego',
    path: ['newPassword'],
  });

export const updatePasswordFormSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string({
      required_error: 'Potwierdzenie hasła jest wymagane',
      invalid_type_error: 'Potwierdzenie hasła musi być ciągiem znaków',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Hasła nie są identyczne',
    path: ['passwordConfirm'],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordFormSchema>;
