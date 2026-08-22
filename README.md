# Automation Anywhere Community Edition Testing Suite

A robust, enterprise-grade test automation suite built with **Playwright (JavaScript)** for UI and API verification of **Automation Anywhere Community Edition**. This repository strictly follows the **Page Object Model (POM)** design pattern to achieve high maintainability, reusability, and modularity.

---

## 📋 Use Cases Covered

### 1. Use Case 1: Form with Rules Builder (UI Automation)
- **Flow**:
  1. Authenticates to the Community Edition Control Room using the Page Object Model.
  2. Navigates to the **Automation** workspace and initiates creation of a new Attended Form.
  3. Drags and drops multiple Textbox canvas components onto the workspace.
  4. Configures element properties (label, min/max length limits, hint text, tooltip, default value).
  5. Saves form layout and transitions to the **Form Rules** builder tab.
  6. Creates a primary rule (`Rule1`) and verifies it expands into condition edit mode.
  7. Configures a primary condition (`Text1` `Is not empty`) and appends a second condition (`Text1` `Contains` `abc`).
  8. Toggles condition logical operator mode to **AND**.
  9. Assigns a Then-action block (`Set value` on `Text2` to `Rule Triggered`).
  10. Uses the rule card context menu to add subsequent rules (`Rule2` below `Rule1`, and `Rule3` below `Rule2`).
  11. Saves form rules and verifies persistence across the rules list.
- **Assertions Include**:
  - `Add Rule` button visibility and functional behavior.
  - Rules list expanded card view and Edit button presence per rule card.
  - Logical operator (**AND**/**OR**) selection correctness.
  - Action block (`Set value`) assignment to target canvas elements.
  - Context menu `Add rule below` functional behavior.
  - Full persistence verification for all rules (`Rule1`, `Rule2`, `Rule3`) after saving.

### 2. Use Case 2: Learning Instance API Flow (API Automation)
- **Flow**:
  1. Authenticates directly via REST API (`POST /v2/authentication`) or UI JWT capture fallback.
  2. Queries cognitive domains to discover default `Invoices` domain metadata and language provider mappings.
  3. Resolves domain object structures for Key-Value fields and Table Headers.
  4. Programmatically creates a Learning Instance via REST API (`POST /cognitive/v3/learninginstances`).
  5. Validates instance registration and presence in the instance registry.
- **Assertions Include**:
  - HTTP Status Code responses (`200 OK` / `201 Created`).
  - Response performance threshold validation (`< 15,000ms`).
  - Field-level JSON schema validations (`id`, `name`, `status` set to `PRIVATE`, `domain.id`, `domain.name`).
  - Functional list presence checking via `POST /cognitive/v3/learninginstances/list`.

---

## 🛠️ Technology Stack

- **Core Framework**: Playwright (`^1.45.0`)
- **Language**: JavaScript (ES6+)
- **Design Pattern**: Page Object Model (POM)
- **Environment Management**: `dotenv` (`^16.4.5`)
- **Test Runner & Assertion Engine**: `@playwright/test`

---

## 📁 Directory Structure

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

## ⚙️ Setup & Configuration

### Prerequisites
Ensure **Node.js** (v18 or higher) is installed on your system.

### 1. Install Dependencies
Clone the repository and install project packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create or edit the `.env` file in the project root directory with your Automation Anywhere credentials:
```env
AA_USER=your_email@domain.com
AA_PASS=your_secure_password
```

---

## 🚀 Execution Instructions

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

## 📊 Playwright HTML Report

After completing a test run, an interactive HTML report with execution details, screenshots, and logs is generated. To view the report:

```bash
npx playwright show-report
```
