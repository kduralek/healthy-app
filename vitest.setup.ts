import '@testing-library/jest-dom/vitest';

// Rozszerzenie oczekiwanych typów dla testów
interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveAttribute(attr: string, value?: string): R;
  toBeDisabled(): R;
  toHaveTextContent(text: string | RegExp): R;
  toHaveClass(className: string): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
