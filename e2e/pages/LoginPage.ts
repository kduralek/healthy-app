import { BasePage } from './BasePage';

/**
 * Page Object Model for the Login page
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly emailInputSelector = '[data-testid="login-email-input"]';
  private readonly passwordInputSelector = '[data-testid="login-password-input"]';
  private readonly submitButtonSelector = '[data-testid="login-submit-button"]';
  private readonly formSelector = '[data-testid="login-form"]';

  /**
   * Navigate to the login page
   */
  async goto() {
    await super.goto('/auth/login');
    // Wait for the page to be fully loaded and React to be hydrated
    await this.waitForPageReady();
  }

  /**
   * Wait for the page to be fully loaded and React component to be hydrated
   */
  private async waitForPageReady() {
    // 1. Wait for network to be idle (all resources loaded)
    await this.page.waitForLoadState('networkidle');

    // 2. Wait for the form to be present and attached to DOM
    await this.page.waitForSelector(this.formSelector, { state: 'attached' });

    // 3. Wait for React hydration to complete by checking if inputs are interactive
    await this.page.waitForFunction(
      () => {
        const emailInput = document.querySelector('[data-testid="login-email-input"]') as HTMLInputElement;
        const passwordInput = document.querySelector('[data-testid="login-password-input"]') as HTMLInputElement;

        // Check if elements exist and are not disabled (React has taken control)
        return (
          emailInput &&
          passwordInput &&
          !emailInput.disabled &&
          !passwordInput.disabled &&
          // Ensure the elements are truly interactive
          emailInput.type === 'email' &&
          passwordInput.type === 'password'
        );
      },
      { timeout: 10000 }
    );

    // 4. Additional wait for component stability
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill in the login form with improved stability
   */
  async fillLoginForm(email: string, password: string) {
    // Ensure the form is ready for interaction
    await this.waitForFormInteractivity();

    // Fill email field with retries
    await this.fillInputWithRetry(this.emailInputSelector, email, 'email');

    // Fill password field with retries
    await this.fillInputWithRetry(this.passwordInputSelector, password, 'password');

    // Final verification that both fields are still filled
    await this.verifyFieldsAreFilled(email, password);
  }

  /**
   * Wait for form to be fully interactive
   */
  private async waitForFormInteractivity() {
    // Wait for form to be visible and interactive
    await this.page.waitForSelector(this.formSelector, { state: 'visible' });

    // Wait for input fields to be enabled and ready
    await this.page.waitForSelector(this.emailInputSelector, { state: 'visible' });
    await this.page.waitForSelector(this.passwordInputSelector, { state: 'visible' });

    // Ensure inputs are not disabled
    await this.page.waitForFunction(() => {
      const emailInput = document.querySelector('[data-testid="login-email-input"]') as HTMLInputElement;
      const passwordInput = document.querySelector('[data-testid="login-password-input"]') as HTMLInputElement;
      return emailInput && passwordInput && !emailInput.disabled && !passwordInput.disabled;
    });
  }

  /**
   * Fill an input field with retry logic to handle React re-renders
   */
  private async fillInputWithRetry(selector: string, value: string, fieldName: string, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Clear and fill the field
        await this.page.click(selector);
        await this.page.fill(selector, ''); // Clear first
        await this.page.fill(selector, value);

        // Wait for the value to be set
        await this.page.waitForFunction(
          ({ selector, expectedValue }) => {
            const input = document.querySelector(selector) as HTMLInputElement;
            return input && input.value === expectedValue;
          },
          { selector, expectedValue: value },
          { timeout: 2000 }
        );

        // Verify the value is still there after a brief moment
        await this.page.waitForTimeout(200);
        const currentValue = await this.page.inputValue(selector);

        if (currentValue === value) {
          return; // Success
        } else {
          throw new Error(`Value was reset. Expected: ${value}, Got: ${currentValue}`);
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(
            `Failed to fill ${fieldName} field after ${maxRetries} attempts. Last error: ${error.message}`
          );
        }

        console.warn(`Attempt ${attempt} failed for ${fieldName} field, retrying...`);
        await this.page.waitForTimeout(1000); // Wait before retry
      }
    }
  }

  /**
   * Verify that both email and password fields are filled correctly
   */
  private async verifyFieldsAreFilled(expectedEmail: string, expectedPassword: string) {
    const emailValue = await this.page.inputValue(this.emailInputSelector);
    const passwordValue = await this.page.inputValue(this.passwordInputSelector);

    if (emailValue !== expectedEmail) {
      throw new Error(`Email field verification failed. Expected: ${expectedEmail}, Got: ${emailValue}`);
    }

    if (passwordValue !== expectedPassword) {
      throw new Error(`Password field verification failed. Expected: ${expectedPassword}, Got: ${passwordValue}`);
    }
  }

  /**
   * Submit the login form
   */
  async submitLoginForm() {
    // Ensure button is clickable
    await this.page.waitForSelector(this.submitButtonSelector, { state: 'visible' });
    await this.page.click(this.submitButtonSelector);
  }

  /**
   * Login with the provided credentials
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
    await this.waitForNavigation();
  }

  /**
   * Check if the login form is displayed
   */
  async isLoginFormVisible() {
    return await this.page.isVisible(this.formSelector);
  }

  /**
   * Get error message if present
   */
  async getErrorMessage() {
    const errorElement = this.page.locator('.text-destructive');
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }
}
