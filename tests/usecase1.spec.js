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
    // Instantiate Page Objects adhering strictly to Page Object Model architecture
    loginPg = new LoginPage(page);
    navPg = new NavigationPage(page);
    canvasPg = new FormCanvasPage(page);
    rulesPg = new FormRulesPage(page);

    // Step 1: Perform authentication via LoginPage POM class
    const authUsername = process.env.AA_USER || 'rachitsharma920@gmail.com';
    const authPassword = process.env.AA_PASS || 'R@chit920';
    
    await loginPg.navigate();
    await loginPg.login(authUsername, authPassword);
  });

  test('Create a Form with 2 Textboxes and configure Rules', async ({ page }) => {
    // Step 2: Navigate to Automation repository using NavigationPage POM
    console.log('Navigating to Automation tab...');
    await navPg.navigateToAutomation();

    // Create a new unique Attended Form via FormCanvasPage POM
    const generatedFormName = `TestForm_${Date.now()}`;
    console.log(`Creating form: ${generatedFormName}...`);
    await canvasPg.createNewForm(generatedFormName);

    // Step 3 & 4: Drag and drop two Textbox elements onto canvas and set properties via POM
    console.log('Dragging first Text Box and configuring properties...');
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

    console.log('Dragging second Text Box and configuring properties...');
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

    // Step 5: Save form layout and switch to Form Rules tab via POM methods
    console.log('Saving the form...');
    await canvasPg.saveForm();
    console.log('Navigating to Rules tab...');
    await canvasPg.navigateToRules();

    // Step 6: Verify Add Rule button visibility, click to create Rule1, and verify expanded state
    console.log('Verifying Add Rule button is visible...');
    await rulesPg.verifyAddRuleVisible();

    console.log('Adding Rule1...');
    await rulesPg.clickAddRule();

    console.log('Verifying Rule1 is listed in expanded mode...');
    await rulesPg.verifyRuleExpanded('Rule1');

    console.log('Verifying Edit button is present on Rule1 card...');
    await rulesPg.verifyEditButtonPresent(0);

    // Step 7: Configure first condition: Text1 "Is Not Empty"
    console.log('Configuring condition 1: Text1 Is Not Empty...');
    await rulesPg.configureCondition(0, 'Text1', 'Is not empty');

    // Step 8: Append second condition using logical AND operator: Text1 "Contains" 'abc'
    console.log('Adding condition 2...');
    await rulesPg.clickAddCondition();
    console.log('Configuring condition 2: Text1 Contains "abc"...');
    await rulesPg.configureCondition(1, 'Text1', 'Contains', 'abc');
    console.log('Setting logical operator to AND...');
    await rulesPg.toggleOperatorMode('AND');

    // Step 9: Configure action block to "Set value" on Text2 element to "Rule Triggered"
    console.log('Configuring action: Set Value on Text2 to "Rule Triggered"...');
    await rulesPg.configureAction(0, 'Set value', 'Text2', 'Rule Triggered');

    // Step 10 & 11: Add Rule2 below Rule1, and Rule3 below Rule2 via context menu POM method
    console.log('Adding Rule2 below Rule1...');
    await rulesPg.addRuleBelow(0);
    console.log('Adding Rule3 below Rule2...');
    await rulesPg.addRuleBelow(1);

    // Step 12: Save all configured rules and verify their persistence in the rules list
    console.log('Saving form rules...');
    await rulesPg.saveRules();
    console.log('Verifying all rules exist in the list...');
    await rulesPg.verifyRulesExist(['Rule1', 'Rule2', 'Rule3']);
    
    console.log('Use Case 1 UI Test Completed Successfully!');
  });
});
