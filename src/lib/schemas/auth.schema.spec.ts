import { describe, it, expect } from 'vitest';
import {
  registerFormSchema,
  loginFormSchema,
  forgotPasswordFormSchema,
  changePasswordFormSchema,
  updatePasswordFormSchema,
} from './auth.schema';

describe('Auth Schema Validation', () => {
  describe('registerFormSchema', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'Password123!',
      passwordConfirm: 'Password123!',
    };

    it('should accept valid registration data', () => {
      expect(() => registerFormSchema.parse(validRegisterData)).not.toThrow();
    });

    it('should reject when passwords do not match', () => {
      const invalidData = {
        ...validRegisterData,
        passwordConfirm: 'DifferentPassword123!',
      };

      expect(() => registerFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email in registration', () => {
      const invalidData = {
        ...validRegisterData,
        email: 'invalid-email',
      };

      expect(() => registerFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password in registration', () => {
      const invalidData = {
        ...validRegisterData,
        password: 'weak',
        passwordConfirm: 'weak',
      };

      expect(() => registerFormSchema.parse(invalidData)).toThrow();
    });
  });

  describe('loginFormSchema', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'any-password',
    };

    it('should accept valid login data', () => {
      expect(() => loginFormSchema.parse(validLoginData)).not.toThrow();
    });

    it('should reject empty email', () => {
      const invalidData = {
        ...validLoginData,
        email: '',
      };

      expect(() => loginFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        ...validLoginData,
        password: '',
      };

      expect(() => loginFormSchema.parse(invalidData)).toThrow();
    });

    it('should accept weak passwords for login (only validation is non-empty)', () => {
      const weakPasswordData = {
        ...validLoginData,
        password: 'weak',
      };

      expect(() => loginFormSchema.parse(weakPasswordData)).not.toThrow();
    });
  });

  describe('forgotPasswordFormSchema', () => {
    it('should accept valid email', () => {
      const validData = { email: 'test@example.com' };
      expect(() => forgotPasswordFormSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = { email: 'invalid-email' };
      expect(() => forgotPasswordFormSchema.parse(invalidData)).toThrow();
    });
  });

  describe('changePasswordFormSchema', () => {
    const validChangePasswordData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      newPasswordConfirm: 'NewPassword123!',
    };

    it('should accept valid password change data', () => {
      expect(() => changePasswordFormSchema.parse(validChangePasswordData)).not.toThrow();
    });

    it('should reject when new passwords do not match', () => {
      const invalidData = {
        ...validChangePasswordData,
        newPasswordConfirm: 'DifferentPassword123!',
      };

      expect(() => changePasswordFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject when new password is same as current', () => {
      const invalidData = {
        ...validChangePasswordData,
        newPassword: 'OldPassword123!',
        newPasswordConfirm: 'OldPassword123!',
      };

      expect(() => changePasswordFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak new password', () => {
      const invalidData = {
        ...validChangePasswordData,
        newPassword: 'weak',
        newPasswordConfirm: 'weak',
      };

      expect(() => changePasswordFormSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updatePasswordFormSchema', () => {
    const validUpdatePasswordData = {
      password: 'NewPassword123!',
      passwordConfirm: 'NewPassword123!',
    };

    it('should accept valid password update data', () => {
      expect(() => updatePasswordFormSchema.parse(validUpdatePasswordData)).not.toThrow();
    });

    it('should reject when passwords do not match', () => {
      const invalidData = {
        ...validUpdatePasswordData,
        passwordConfirm: 'DifferentPassword123!',
      };

      expect(() => updatePasswordFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        password: 'weak',
        passwordConfirm: 'weak',
      };

      expect(() => updatePasswordFormSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Error messages', () => {
    it('should provide Polish error messages', () => {
      try {
        registerFormSchema.parse({
          email: 'invalid-email',
          password: 'weak',
          passwordConfirm: 'different',
        });
      } catch (error: any) {
        const issues = error.issues;
        expect(issues.some((issue: any) => issue.message.includes('Nieprawidłowy format adresu email'))).toBe(true);
        expect(issues.some((issue: any) => issue.message.includes('Hasło musi mieć co najmniej 8 znaków'))).toBe(true);
      }
    });

    it('should attach password confirmation error to correct field', () => {
      try {
        registerFormSchema.parse({
          email: 'test@example.com',
          password: 'Password123!',
          passwordConfirm: 'DifferentPassword123!',
        });
      } catch (error: any) {
        const confirmError = error.issues.find((issue: any) => issue.path.includes('passwordConfirm'));
        expect(confirmError).toBeDefined();
        expect(confirmError.message).toBe('Hasła nie są identyczne');
      }
    });
  });
});
