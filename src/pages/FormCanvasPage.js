import { BasePage } from './BasePage.js';

/**
 * FormCanvasPage encapsulates elements and user interactions on the
 * Form Canvas Builder page and its underlying iframe context in JavaScript following POM.
 */
export class FormCanvasPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} pageInstance
   */
  constructor(pageInstance) {
    super(pageInstance);
    // Main Page Selectors
    this.createButtonSelector = 'button:has-text("Create"), button[aria-label="Create"], button:has-text("+ Create")';
    this.attendedFormOptionSelector = 'button[name="create-attended-form"]';
    this.formNameFieldSelector = 'input[name="name"]';
    this.createAndEditBtnSelector = 'button[name="submit"], button[aria-label="Create & edit"]';
    
    // Iframe Canvas & Drag-and-Drop Selectors
    this.textboxPaletteSelector = 'span:has-text("Text Box")';
    this.canvasDropZoneSelector = '.formcanvas-col-container, .formcanvas__leftpane, .formcanvas-content';
    this.canvasElementsSelector = '.formcanvas-col-container label';

    // Iframe Element Properties Panel Selectors
    this.elementLabelInputSelector = 'input[aria-label="Element label"]';
    this.minLimitInputSelector = 'input[aria-label="Min"]';
    this.maxLimitInputSelector = 'input[aria-label="Max"]';
    this.hintTextInputSelector = 'input[aria-label="Hint below field"]';
    this.tooltipTextareaSelector = 'textarea.textinput-cell-input-control, textarea[aria-label="Tooltip"]';
    this.defaultValueInputSelector = 'input[aria-label="Default value"]';
    
    // Iframe Form Toolbar Selectors
    this.saveFormBtnSelector = 'button[aria-label="save"], button:has-text("Save")';
    this.closeFormBtnSelector = 'button[aria-label="close"], button:has-text("Close")';
    this.formRulesTabSelector = 'button:has-text("Form rules"), [role="tab"]:has-text("rules")';
  }

  /**
   * Helper getter resolving the Form Builder embedded iframe context.
   * @returns {import('@playwright/test').FrameLocator}
   */
  get frame() {
    return this.page.frameLocator('iframe[src*="modules/attended"]').first();
  }

  /**
   * Clicks an element located inside the Form Builder iframe.
   * @param {string} targetSelector - Selector string within the iframe context.
   */
  async frameClick(targetSelector) {
    const targetLocator = this.frame.locator(targetSelector).first();
    await targetLocator.waitFor({ state: 'visible' });
    await targetLocator.click();
  }

  /**
   * Fills text into an input element located inside the Form Builder iframe.
   * @param {string} targetSelector - Selector string within the iframe context.
   * @param {string} textValue - String value to enter.
   */
  async frameFill(targetSelector, textValue) {
    const targetLocator = this.frame.locator(targetSelector).first();
    await targetLocator.waitFor({ state: 'visible' });
    await targetLocator.fill(textValue);
  }

  /**
   * Initiates creation of a new Attended Form and navigates to the Form Canvas editor.
   * @param {string} nameOfForm - Descriptive name for the newly created form.
   */
  async createNewForm(nameOfForm) {
    // Click the top-level Create button and choose Attended Form
    await this.click(this.createButtonSelector);
    await this.page.waitForTimeout(1000);
    await this.click(this.attendedFormOptionSelector);
    await this.page.waitForTimeout(2000);
    
    // Provide unique form name in modal dialog
    const nameInputField = this.page.locator(this.formNameFieldSelector).first();
    await nameInputField.waitFor({ state: 'visible' });
    await nameInputField.fill(nameOfForm);
    
    // Submit creation and await canvas transition
    await this.click(this.createAndEditBtnSelector);
    await this.page.waitForURL(
      (redirectUrl) => redirectUrl.href.includes('form/edit') || redirectUrl.href.includes('form/create'),
      { timeout: 30000 }
    );
    await this.page.waitForTimeout(3000); // Allow iframe and canvas elements to render
  }

  /**
   * Drags a Text Box component from the iframe palette onto the active canvas drop zone.
   */
  async dragAndDropTextbox() {
    const paletteItemElement = this.frame.locator(this.textboxPaletteSelector).first();
    const targetDropZoneElement = this.frame.locator(this.canvasDropZoneSelector).first();
    
    // Perform drag-and-drop operation using Playwright's integrated drag locator API
    await paletteItemElement.dragTo(targetDropZoneElement);
    await this.page.waitForTimeout(1500);
  }

  /**
   * Selects a canvas element by index to display its properties in the configuration side panel.
   * @param {number} elementIndex - Zero-based index of the target element on the canvas.
   */
  async selectCanvasElement(elementIndex) {
    const targetElement = this.frame.locator(this.canvasElementsSelector).nth(elementIndex);
    await targetElement.waitFor({ state: 'visible' });
    await targetElement.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Configures properties for the currently selected Textbox element via the side properties panel.
   * @param {Object} textboxConfig - Property values to apply (label, min, max, hint, tooltip, defaultValue).
   */
  async setTextboxProperties(textboxConfig) {
    if (textboxConfig.label) {
      await this.frameFill(this.elementLabelInputSelector, textboxConfig.label);
    }
    if (textboxConfig.defaultValue) {
      await this.frameFill(this.defaultValueInputSelector, textboxConfig.defaultValue);
    }
    if (textboxConfig.min) {
      await this.frameFill(this.minLimitInputSelector, textboxConfig.min);
    }
    if (textboxConfig.max) {
      await this.frameFill(this.maxLimitInputSelector, textboxConfig.max);
    }
    if (textboxConfig.hint) {
      await this.frameFill(this.hintTextInputSelector, textboxConfig.hint);
    }
    if (textboxConfig.tooltip) {
      const tooltipField = this.frame.locator(this.tooltipTextareaSelector).first();
      await tooltipField.fill(textboxConfig.tooltip);
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Saves the current form layout in the canvas editor.
   */
  async saveForm() {
    await this.frameClick(this.saveFormBtnSelector);
    await this.page.waitForTimeout(3000); // Wait for save request completion
  }

  /**
   * Switches view from the Canvas editor to the Form Rules builder tab.
   */
  async navigateToRules() {
    await this.frameClick(this.formRulesTabSelector);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Closes the form editor and returns to the form management list.
   */
  async closeForm() {
    await this.frameClick(this.closeFormBtnSelector);
    await this.page.waitForTimeout(2000);
  }
}
