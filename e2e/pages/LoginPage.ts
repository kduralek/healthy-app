import { BasePage } from './BasePage';

/**
 * Page Object Model for the Login page
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly emailInputSelector = '[data-test-id="login-email-input"]';
  private readonly passwordInputSelector = '[data-test-id="login-password-input"]';
  private readonly submitButtonSelector = '[data-test-id="login-submit-button"]';
  private readonly formSelector = '[data-test-id="login-form"]';

  /**
   * Navigate to the login page
   */
  async goto() {
    await super.goto('/auth/login');
  }

  /**
   * Fill in the login form
   */
  async fillLoginForm(email: string, password: string) {
    // Wait for form to be fully loaded and interactive
    await this.page.waitForSelector(this.formSelector, { state: 'visible' });

    // Clear and fill email field
    await this.page.click(this.emailInputSelector);
    await this.page.fill(this.emailInputSelector, email);

    // Wait a bit to ensure email is properly set
    await this.page.waitForTimeout(100);

    // Verify email was filled correctly
    const emailValue = await this.page.inputValue(this.emailInputSelector);
    if (emailValue !== email) {
      throw new Error(`Email field not filled correctly. Expected: ${email}, Got: ${emailValue}`);
    }

    // Clear and fill password field
    await this.page.click(this.passwordInputSelector);
    await this.page.fill(this.passwordInputSelector, password);

    // Wait a bit to ensure password is properly set
    await this.page.waitForTimeout(100);

    // Verify both fields are still filled
    const finalEmailValue = await this.page.inputValue(this.emailInputSelector);
    const passwordValue = await this.page.inputValue(this.passwordInputSelector);

    if (finalEmailValue !== email) {
      throw new Error(`Email field was cleared after filling password. Expected: ${email}, Got: ${finalEmailValue}`);
    }

    if (passwordValue !== password) {
      throw new Error(`Password field not filled correctly. Expected: ${password}, Got: ${passwordValue}`);
    }
  }

  /**
   * Submit the login form
   */
  async submitLoginForm() {
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
