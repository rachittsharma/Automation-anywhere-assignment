import { BasePage } from './BasePage.js';

/**
 * NavigationPage encapsulates navigation menu links and sidebar options
 * across the Control Room interface in JavaScript following POM.
 */
export class NavigationPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} pageInstance
   */
  constructor(pageInstance) {
    super(pageInstance);
    // Navigation Menu Locators / Selectors
    this.automationMenuSelector = "a[aria-label='Automation']";
    this.aiMenuToggleSelector = "button[aria-label='AI']";
    this.docAutomationLinkSelector = "a[href*='learning-instances'], a[href*='cognitive']";
  }

  /**
   * Navigates to the Automation workspace repository section.
   */
  async navigateToAutomation() {
    await this.click(this.automationMenuSelector);
    await this.page.waitForURL((navigatedUrl) => navigatedUrl.href.includes('bots/repository'), { timeout: 20000 });
  }

  /**
   * Navigates to Document Automation / Learning Instances page via the AI sidebar section.
   * Toggles the AI sub-menu if the Learning Instances option is not directly visible.
   */
  async navigateToAI() {
    // Check if the Document Automation link is already visible in the navigation tree
    const docAutoElement = this.page.locator(this.docAutomationLinkSelector);
    const isDocAutoDisplayed = await docAutoElement.isVisible();

    // Expand the AI menu accordion if the target sub-link is collapsed
    if (!isDocAutoDisplayed) {
      await this.click(this.aiMenuToggleSelector);
    }

    await this.click(this.docAutomationLinkSelector);
    await this.page.waitForURL((navigatedUrl) => navigatedUrl.href.includes('learning-instances'), { timeout: 20000 });
  }
}
