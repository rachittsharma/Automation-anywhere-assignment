import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage.js';
import { NavigationPage } from '../src/pages/NavigationPage.js';
import { FormCanvasPage } from '../src/pages/FormCanvasPage.js';
import { FormRulesPage } from '../src/pages/FormRulesPage.js';

test.describe('Use Case 1: Form with Rules Builder (UI Automation)', () => {
  // Page Object Model (POM) instance references
  let loginPg;
  let navPg;
  let canvasPg;
  let rulesPg;

  test.beforeEach(async ({ page }) => {
    loginPg = new LoginPage(page);
    navPg = new NavigationPage(page);
    canvasPg = new FormCanvasPage(page);
    rulesPg = new FormRulesPage(page);

    await test.step('Step 1: Authenticate to Control Room via LoginPage POM', async () => {
      const authUsername = process.env.AA_USER || 'rachitsharma920@gmail.com';
      const authPassword = process.env.AA_PASS || 'R@chit920';
      await loginPg.navigate();
      await loginPg.login(authUsername, authPassword);
    });
  });

  test('Create a Form with 2 Textboxes and configure Rules', async ({ page }) => {
    const generatedFormName = `TestForm_${Date.now()}`;

    // Step 2: Navigate to Automation repository using NavigationPage POM
    await test.step('Step 2: Navigate to Automation Repository', async () => {
      await navPg.navigateToAutomation();
    });

    // Step 3: Create a new unique Attended Form via FormCanvasPage POM
    await test.step(`Step 3: Create New Attended Form (${generatedFormName})`, async () => {
      await canvasPg.createNewForm(generatedFormName);
    });

    // Step 4: Drag first Text Box onto canvas and set properties via POM
    await test.step('Step 4: Drag & Configure First Textbox Control (Text1)', async () => {
      await canvasPg.dragAndDropTextbox();
      await canvasPg.selectCanvasElement(0);
      await canvasPg.setTextboxProperties({
        label: 'Text1',
        min: '1',
        max: '10',
        hint: 'Enter text 1',
        tooltip: 'Tooltip for Text1',
        defaultValue: 'abc'
      });
    });

    // Step 5: Drag second Text Box onto canvas and set properties via POM
    await test.step('Step 5: Drag & Configure Second Textbox Control (Text2)', async () => {
      await canvasPg.dragAndDropTextbox();
      await canvasPg.selectCanvasElement(1);
      await canvasPg.setTextboxProperties({
        label: 'Text2',
        min: '2',
        max: '20',
        hint: 'Enter text 2',
        tooltip: 'Tooltip for Text2',
        defaultValue: 'def'
      });
    });

    // Step 6: Save form layout and switch to Form Rules tab via POM methods
    await test.step('Step 6: Save Form Layout and Navigate to Form Rules Builder', async () => {
      await canvasPg.saveForm();
      await canvasPg.navigateToRules();
    });

    // Step 7: Configure Rule1 with multi-condition logic and action block
    await test.step('Step 7: Create Rule1 and Configure Multi-Condition Logic with Action', async () => {
      await rulesPg.verifyAddRuleVisible();
      await rulesPg.clickAddRule();
      await rulesPg.verifyRuleExpanded('Rule1');
      await rulesPg.verifyEditButtonPresent(0);
      
      // Condition 1: Text1 "Is not empty"
      await rulesPg.configureCondition(0, 'Text1', 'Is not empty');
      
      // Condition 2: Text1 "Contains" "abc" with AND operator
      await rulesPg.clickAddCondition();
      await rulesPg.configureCondition(1, 'Text1', 'Contains', 'abc');
      await rulesPg.toggleOperatorMode('AND');

      // Action: Set value on Text2 to "Rule Triggered"
      await rulesPg.configureAction(0, 'Set value', 'Text2', 'Rule Triggered');
    });

    // Step 8: Add Rule2 below Rule1, and Rule3 below Rule2 via context menu POM method
    await test.step('Step 8: Add Rule2 and Rule3 Below Rule1 using Context Menu', async () => {
      await rulesPg.addRuleBelow(0);
      await rulesPg.addRuleBelow(1);
    });

    // Step 9: Save all configured rules and verify their persistence in the rules list
    await test.step('Step 9: Save Form Rules and Verify Rule Persistence', async () => {
      await rulesPg.saveRules();
      await rulesPg.verifyRulesExist(['Rule1', 'Rule2', 'Rule3']);
    });
  });
});
