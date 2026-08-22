import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * FormRulesPage encapsulates elements and user interactions on the
 * Form Rules Builder tab inside the embedded iframe context in JavaScript following POM.
 */
export class FormRulesPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} pageInstance
   */
  constructor(pageInstance) {
    super(pageInstance);
    // Top Toolbar Selectors (Iframe Context)
    this.addRuleBtnSelector = 'button[aria-label="Add rule"], button:has-text("Add rule")';
    this.saveRulesBtnSelector = 'button[aria-label="save"], button:has-text("Save")';
    
    // Rule Card Selectors (Iframe Context)
    this.ruleCardsSelector = '.rio-details, div[class*="rio-details"]';
    this.editRuleBtnSelector = 'button[aria-label="edit"]';
    this.ruleMoreMenuBtnSelector = 'button[aria-label="More"]';
    
    // Condition Configuration Selectors (Iframe Context)
    this.selectElementInputSelector = 'div.rio-select-input:has(input[placeholder="Select element"])';
    this.selectConditionInputSelector = 'div.rio-select-input:has(input[placeholder="Select condition"])';
    this.conditionValInputSelector = 'input[placeholder="Enter value"], input[placeholder="Value"]';
    this.addConditionBtnSelector = 'button[aria-label="Add condition"], button:has-text("Add condition")';
    
    // Logical Operator Toggle Selector (Iframe Context)
    this.andOrToggleSelector = 'button:has-text("AND"), button:has-text("OR"), [role="button"]:has-text("AND"), [role="button"]:has-text("OR")';
    
    // Action Configuration Selectors (Iframe Context)
    this.selectActionTypeSelector = 'div.rio-select-input:has(input[placeholder="Select action"])';
    this.actionTargetInputSelector = 'div.rio-select-input:has(input[placeholder="Select element"])';
    this.actionValInputSelector = 'input[placeholder="Enter value"], input[placeholder="Value"]';
    
    // Context Menu Item Selector (Iframe Context)
    this.addRuleBelowOptionSelector = 'button:has-text("Add rule below"), button:has-text("Add Rule Below"), li:has-text("Add rule below"), span:has-text("Add rule below"), [role="menuitem"]:has-text("Add rule below"), li:has-text("Add Rule Below")';
  }

  /**
   * Helper getter resolving the Form Rules embedded iframe context.
   * @returns {import('@playwright/test').FrameLocator}
   */
  get frame() {
    return this.page.frameLocator('iframe[src*="modules/attended"]').first();
  }

  /**
   * Clicks an element located inside the Form Rules iframe context.
   * @param {string} targetSelector - Selector string within the iframe context.
   */
  async frameClick(targetSelector) {
    const targetLocator = this.frame.locator(targetSelector).first();
    await targetLocator.waitFor({ state: 'visible' });
    await targetLocator.click();
  }

  /**
   * Fills text into an input element located inside the Form Rules iframe context.
   * @param {string} targetSelector - Selector string within the iframe context.
   * @param {string} textValue - Text string to enter.
   */
  async frameFill(targetSelector, textValue) {
    const targetLocator = this.frame.locator(targetSelector).first();
    await targetLocator.waitFor({ state: 'visible' });
    await targetLocator.fill(textValue);
  }

  /**
   * Asserts that the "Add rule" button is visible on the Form Rules toolbar.
   */
  async verifyAddRuleVisible() {
    const addRuleBtnLocator = this.frame.locator(this.addRuleBtnSelector);
    await expect(addRuleBtnLocator).toBeVisible();
  }

  /**
   * Clicks the "Add rule" toolbar button to create a new top-level rule card.
   */
  async clickAddRule() {
    await this.frameClick(this.addRuleBtnSelector);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Asserts that a specific rule card is currently expanded in condition edit mode.
   * @param {string} ruleTitle - Name of the rule card (e.g., 'Rule1').
   */
  async verifyRuleExpanded(ruleTitle) {
    const targetRuleCard = this.frame.locator(`div:has-text("${ruleTitle}")`).locator('..').locator('..');
    const ifConditionBlock = targetRuleCard.locator('span:has-text("If")').first();
    await expect(ifConditionBlock).toBeVisible({ timeout: 10000 });
  }

  /**
   * Asserts that an Edit button is present on the specified rule card index.
   * @param {number} cardIndex - Zero-based index of the rule card.
   */
  async verifyEditButtonPresent(cardIndex) {
    const editBtnLocator = this.frame.locator(this.editRuleBtnSelector).nth(cardIndex);
    await expect(editBtnLocator).toBeVisible();
  }

  /**
   * Selects an option from an active Custom Select dropdown container inside the iframe.
   * @param {string} targetOptionText - Option text to match and click.
   */
  async selectDropdownOption(targetOptionText) {
    const matchingOption = this.frame
      .locator('.rio-select-input-dropdown .rio-select-input-dropdown-option-label-line__text-label-line, .rio-select-input-dropdown [role="option"], .rio-select-input-dropdown div, .rio-select-input-dropdown span')
      .filter({ hasText: targetOptionText })
      .first();
    await matchingOption.waitFor({ state: 'visible', timeout: 15000 });
    await matchingOption.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Configures a condition block within an expanded rule card.
   * @param {number} condIndex - Zero-based index of the condition block within the rule.
   * @param {string} fieldLabel - Canvas element name to evaluate (e.g., 'Text1').
   * @param {string} conditionOperator - Comparison operator (e.g., 'Is not empty', 'Contains').
   * @param {string} [expectedVal] - Optional target comparison value string.
   */
  async configureCondition(condIndex, fieldLabel, conditionOperator, expectedVal) {
    // Wait for the target condition card DOM container to render
    await expect(this.frame.locator('.rio-details')).toHaveCount(condIndex + 1, { timeout: 10000 });

    const targetConditionCard = this.frame.locator('.rio-details').nth(condIndex);
    await targetConditionCard.waitFor({ state: 'visible', timeout: 10000 });
    
    // Select the target field element dropdown (first dropdown in condition card)
    const fieldDropdown = targetConditionCard.locator('.rio-select-input').first();
    await fieldDropdown.waitFor({ state: 'visible' });
    await fieldDropdown.click();
    await this.selectDropdownOption(fieldLabel);

    // Select the condition comparison operator dropdown (second dropdown in condition card)
    const operatorDropdown = targetConditionCard.locator('.rio-select-input').nth(1);
    await operatorDropdown.waitFor({ state: 'visible' });
    await operatorDropdown.click();
    await this.selectDropdownOption(conditionOperator);

    // Populate comparison value field if supplied
    if (expectedVal) {
      const valueInputField = targetConditionCard.locator(this.conditionValInputSelector).first();
      await valueInputField.waitFor({ state: 'visible' });
      await valueInputField.fill(expectedVal);
    }
  }

  /**
   * Clicks the "Add condition" button to add another condition inside the current "If" block.
   */
  async clickAddCondition() {
    await this.frameClick(this.addConditionBtnSelector);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Toggles the logical operator mode between 'AND' and 'OR' for multi-condition rules.
   * @param {'AND' | 'OR'} targetMode - Desired logical operator mode ('AND' or 'OR').
   */
  async toggleOperatorMode(targetMode) {
    const operatorToggleBtn = this.frame
      .locator('button, [role="button"]')
      .filter({ hasText: /^(AND|OR)$/ })
      .first();
    await operatorToggleBtn.waitFor({ state: 'visible' });
    const currentModeText = await operatorToggleBtn.textContent();
    
    if (currentModeText && currentModeText.trim() !== targetMode) {
      await operatorToggleBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Configures an action block within the "Then" section of a rule card.
   * @param {number} actIndex - Zero-based index of the action within the "Then" block.
   * @param {string} actionTypeName - Action type name (e.g., 'Set value').
   * @param {string} targetFieldLabel - Target canvas element name to affect.
   * @param {string} [actionVal] - Value string to apply on action execution.
   */
  async configureAction(actIndex, actionTypeName, targetFieldLabel, actionVal) {
    // Calculate total conditions in "If" block to resolve strict DOM indices for "Then" inputs
    const totalConditions = await this.frame.locator('.rio-details').count();
    
    const targetElemIndex = 2 * totalConditions + 2 * actIndex;
    const actionTypeIndex = 2 * totalConditions + 2 * actIndex + 1;

    // 1. Select the target element to receive action
    const targetElemDropdown = this.frame.locator('.rio-select-input').nth(targetElemIndex);
    await targetElemDropdown.scrollIntoViewIfNeeded();
    await targetElemDropdown.waitFor({ state: 'visible' });
    await targetElemDropdown.click();
    await this.selectDropdownOption(targetFieldLabel);

    // 2. Select the action type
    const actionTypeDropdown = this.frame.locator('.rio-select-input').nth(actionTypeIndex);
    await actionTypeDropdown.scrollIntoViewIfNeeded();
    await actionTypeDropdown.waitFor({ state: 'visible' });
    await actionTypeDropdown.click();
    await this.selectDropdownOption(actionTypeName);

    // 3. Populate action value if provided
    if (actionVal) {
      const valInputField = this.frame.locator(this.actionValInputSelector).nth(actIndex);
      await valInputField.scrollIntoViewIfNeeded();
      await valInputField.waitFor({ state: 'visible' });
      await valInputField.fill(actionVal);
    }
  }

  /**
   * Adds a new rule below the specified rule card using the card's context menu options.
   * @param {number} targetRuleIndex - Zero-based index of the existing rule card.
   */
  async addRuleBelow(targetRuleIndex) {
    // Open context menu for the specified rule card
    const moreOptionsMenuBtn = this.frame.locator(this.ruleMoreMenuBtnSelector).nth(targetRuleIndex);
    await moreOptionsMenuBtn.waitFor({ state: 'visible' });
    await moreOptionsMenuBtn.click();
    await this.page.waitForTimeout(1000);

    // Select "Add rule below" context menu option
    const addBelowMenuItem = this.frame.locator(this.addRuleBelowOptionSelector);
    await addBelowMenuItem.waitFor({ state: 'visible' });
    await addBelowMenuItem.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Saves all configured form rules.
   */
  async saveRules() {
    await this.frameClick(this.saveRulesBtnSelector);
    await this.page.waitForTimeout(3000);
  }

  /**
   * Asserts that all expected rules exist in the rules list.
   * @param {string[]} expectedRuleNames - Array of rule names to verify (e.g., ['Rule1', 'Rule2', 'Rule3']).
   */
  async verifyRulesExist(expectedRuleNames) {
    for (const ruleName of expectedRuleNames) {
      const ruleHeadingLocator = this.frame.locator(`div:has-text("${ruleName}")`).first();
      await expect(ruleHeadingLocator).toBeVisible({ timeout: 15000 });
    }
  }
}
