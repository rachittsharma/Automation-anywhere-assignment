import { BasePage } from './BasePage.js';

/**
 * LoginPage encapsulates elements and user actions for the
 * Automation Anywhere Control Room login page in JavaScript following POM.
 */
export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} pageInstance
   */
  constructor(pageInstance) {
    super(pageInstance);
    // Page Element Locators / Selectors
    this.usernameInputSelector = 'input[name="username"]';
    this.passwordInputSelector = 'input[name="password"]';
    this.loginSubmitButtonSelector = 'button[name="submitLogin"], button:has-text("Log in")';
  }

  /**
   * Navigates directly to the Control Room login hash route and waits for input visibility.
   */
  async navigate() {
    await this.page.goto('/#/login', { waitUntil: 'networkidle' });
    await this.waitForElement(this.usernameInputSelector, 30000);
  }

  /**
   * Performs user login by filling credentials and submitting the login form.
   * Waits for post-login navigation to complete.
   * @param {string} userEmail - Account username / email address.
   * @param {string} userPassword - Account password credential.
   */
  async login(userEmail, userPassword) {
    // Fill credentials into login form fields
    await this.fill(this.usernameInputSelector, userEmail);
    await this.fill(this.passwordInputSelector, userPassword);

    // Submit authentication form
    await this.click(this.loginSubmitButtonSelector);

    // Wait until login completes and navigates to post-authentication route
    await this.page.waitForURL(
      (currentUrl) =>
        currentUrl.href.includes('home') ||
        currentUrl.href.includes('dashboard') ||
        currentUrl.href.includes('repository') ||
        currentUrl.href.includes('learning-instances') ||
        (currentUrl.href.includes('index') && !currentUrl.href.includes('login')),
      { timeout: 45000 }
    );
  }
}
