/**
 * BasePage serves as the foundational Page Object Model (POM) class in JavaScript.
 * It encapsulates shared page interactions, generic element wait strategies,
 * and standard user actions across all page objects.
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} pageInstance
   */
  constructor(pageInstance) {
    this.page = pageInstance;
  }

  /**
   * Navigates the browser page to the specified URL location.
   * @param {string} targetUrl - The destination URL string or hash path.
   */
  async navigateTo(targetUrl) {
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Waits for an element matching the given selector to become visible on the page.
   * @param {string} elementSelector - CSS or XPath selector string for the target element.
   * @param {number} [timeoutMs=15000] - Maximum wait time in milliseconds.
   * @returns {Promise<import('@playwright/test').Locator>} Playwright Locator for the target element.
   */
  async waitForElement(elementSelector, timeoutMs = 15000) {
    const targetLocator = this.page.locator(elementSelector);
    await targetLocator.waitFor({ state: 'visible', timeout: timeoutMs });
    return targetLocator;
  }

  /**
   * Waits for the target selector or locator to become visible and performs a click action.
   * @param {string | import('@playwright/test').Locator} target - Selector string or Playwright Locator object.
   */
  async click(target) {
    const elementLocator = typeof target === 'string' ? this.page.locator(target) : target;
    await elementLocator.waitFor({ state: 'visible' });
    await elementLocator.click();
  }

  /**
   * Waits for the target selector or locator to become visible and fills it with text.
   * @param {string | import('@playwright/test').Locator} target - Selector string or Playwright Locator object.
   * @param {string} inputText - String value to fill into the input field.
   */
  async fill(target, inputText) {
    const elementLocator = typeof target === 'string' ? this.page.locator(target) : target;
    await elementLocator.waitFor({ state: 'visible' });
    await elementLocator.fill(inputText);
  }
}
