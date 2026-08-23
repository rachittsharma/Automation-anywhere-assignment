# Automation Anywhere Community Edition Testing Suite

A robust, enterprise-grade test automation suite built with Playwright (JavaScript) for UI and API verification of Automation Anywhere Community Edition. This repository strictly follows the Page Object Model (POM) design pattern to achieve high maintainability, reusability, and modularity. Test execution is structured using Playwright test.step() annotations to deliver clean, collapsible, human-readable HTML test reports.

---

## Use Cases Covered

### 1. Use Case 1: Form with Rules Builder (UI Automation)
- **Flow**:
  1. Authenticates to the Control Room using the LoginPage Page Object.
  2. Navigates to the Automation repository using NavigationPage.
  3. Creates a new Attended Form (TestForm_<timestamp>) via FormCanvasPage.
  4. Drags and drops Textbox components onto the canvas and configures properties (label, min/max length, hint, tooltip, default value).
  5. Saves the form layout and transitions to the Form Rules builder tab.
  6. Creates a primary rule (Rule1) and verifies it expands into condition edit mode.
  7. Configures multi-condition logic (Text1 Is not empty AND Text1 Contains "abc").
  8. Assigns an action block (Set value on Text2 to "Rule Triggered").
  9. Uses the rule card context menu to add subsequent rules (Rule2 below Rule1, and Rule3 below Rule2).
  10. Saves form rules and verifies full persistence across the rules list.
- **Assertions Include**:
  - Add Rule button visibility and functional state.
  - Rules list expanded view and Edit button presence on rule cards.
  - Logical operator (AND/OR) selection correctness.
  - Action block assignment to target canvas elements.
  - Context menu Add rule below functional behavior.
  - Full persistence verification for all configured rules (Rule1, Rule2, Rule3).

### 2. Use Case 2: Learning Instance API Flow (API Automation)
- **Flow**:
  1. Authenticates via REST API (POST /v2/authentication) or UI token fallback.
  2. Queries cognitive domain endpoints to discover default Invoices domain metadata and language provider mappings.
  3. Resolves domain object schemas for Key-Value fields and Table Headers.
  4. Programmatically creates a Learning Instance via REST API (POST /cognitive/v3/learninginstances).
  5. Validates instance registration and presence in the instance registry endpoint (POST /cognitive/v3/learninginstances/list).
- **Assertions Include**:
  - HTTP Status Code response validation (200 OK / 201 Created).
  - API response performance threshold assertion (< 15,000ms).
  - Response JSON schema validations (id, name, status set to PRIVATE, domain.id, domain.name).
  - Registry list verification ensuring the created instance is present and active.

---

## Technology Stack

- **Core Framework**: Playwright (^1.45.0)
- **Language**: JavaScript (ES6 Modules)
- **Design Pattern**: Page Object Model (POM)
- **Reporting**: Playwright HTML Reporter with structured test.step() annotations
- **Environment Management**: dotenv (^16.4.5)
- **Test Runner**: @playwright/test

---

## Directory Structure

```text
├── src
│   └── pages
│       ├── BasePage.js         # Base Page Object with generic locator and wait wrappers
│       ├── LoginPage.js        # Control Room authentication Page Object
│       ├── NavigationPage.js   # Navigation bar and sidebar selection Page Object
│       ├── FormCanvasPage.js   # Attended Form creation & element canvas Page Object
│       └── FormRulesPage.js    # Form Rules Builder tab interaction Page Object
├── tests
│   ├── usecase1.spec.js        # UI Automation test suite (Form & Rules Builder)
│   └── usecase2.spec.js        # API Automation test suite (Learning Instance Flow)
├── .env                        # Credentials & environment variable configuration
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and test runner scripts
└── playwright.config.js        # Playwright framework configuration settings
```

---

## Setup & Configuration

### Prerequisites
Ensure Node.js (v18 or higher) is installed on your system.

### 1. Install Dependencies
Clone the repository and install required npm packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create or edit the `.env` file in the project root directory with your Automation Anywhere Control Room credentials:
```env
AA_USER=your_email@domain.com
AA_PASS=your_secure_password
```

---

## Execution Instructions

Tests are configured to execute sequentially under a single worker to prevent session collisions on the Community Edition environment.

### Run All Tests (UI + API)
```bash
npm run test
```

### Run Use Case 1 (UI Form Rules Builder) Only
```bash
npm run test:ui
```

### Run Use Case 2 (Learning Instance API Flow) Only
```bash
npm run test:api
```

---

## Reporting & Test Results

### Local HTML Report
After test completion, view the interactive Playwright report locally:
```bash
npx playwright show-report
```

### Live GitHub Pages Report
The static HTML report is deployed to GitHub Pages and can be accessed at:
[https://rachittsharma.github.io/Automation-anywhere-assignment/](https://rachittsharma.github.io/Automation-anywhere-assignment/)
