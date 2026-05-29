# 🧪 OrangeHRM E2E Automation Framework

<div align="center">

![Playwright](https://img.shields.io/badge/Playwright-1.43+-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Allure](https://img.shields.io/badge/Allure-Report-orange?style=flat-square&logo=qase&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088ff?style=flat-square&logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)

**Production-grade E2E Web Automation Framework for OrangeHRM**  
Built with Playwright · TypeScript · Page Object Model · Allure Reports · GitHub Actions CI/CD

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Running Tests](#-running-tests)
- [Allure Reports](#-allure-reports)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Known Limitations](#-known-limitations)

---

## 🎯 Overview

A full E2E automation framework targeting the **OrangeHRM HRMS** application, specifically the **Admin → System Users** module. Designed for stability, maintainability, and rich reporting in both local and CI/CD environments.

**Coverage:** 33 test cases across 4 functional groups:
| Group | TCs | Description |
|-------|-----|-------------|
| 🔍 Search Users | TC_001–012 | Filter by username, role, employee name, status; reset; sort |
| ➕ Add User | TC_013–025 | Happy path, all field validations, duplicate detection, cancel |
| ✏️ Edit User | TC_026–029 | Edit basic info, change password, cancel |
| 🗑️ Delete User | TC_030–033 | Single delete, cancel, bulk delete, self-delete prevention |

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Test Runner | [Playwright Test](https://playwright.dev) | ^1.43.0 |
| Language | TypeScript | ^5.3.3 |
| Pattern | Page Object Model (POM) | — |
| Reporting | Allure + Playwright HTML | allure-playwright ^2.13.0 |
| CI/CD | GitHub Actions | — |
| Env Config | dotenv | ^16.4.5 |

---

## 📁 Project Structure

```
.
├── src/
│   ├── fixtures/
│   │   └── base.fixture.ts          # Custom fixtures: Page Objects + Allure labels + screenshot
│   ├── pages/
│   │   ├── base.page.ts             # BasePage: click(), fill(), navigate() with Allure steps
│   │   ├── login.page.ts            # Login page actions
│   │   ├── dashboard.page.ts        # Dashboard navigation
│   │   ├── forgot-password.page.ts  # Forgot password flow
│   │   ├── system-users.page.ts     # System Users list + search + CRUD
│   │   └── save-system-user.page.ts # Add / Edit User form
│   ├── tests/
│   │   ├── admin.spec.ts            # 33 Admin module test cases
│   │   └── auth/
│   │       ├── login.spec.ts        # Login test cases
│   │       └── forgot-password.spec.ts
│   └── utils/
│       ├── env.config.ts            # Environment config loader
│       └── test-data.ts             # Shared test data utilities
├── .github/
│   └── workflows/
│       └── playwright.yml           # CI/CD: test → Allure → GitHub Pages deploy
├── .env.example                     # Environment variable template
├── playwright.config.ts             # Playwright configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Scripts & dependencies
```

---

## ✅ Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18.0 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 8.0 | Bundled with Node.js |
| Java | ≥ 11 (for Allure CLI) | [adoptium.net](https://adoptium.net) |

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/orangehrm-playwright-framework.git
cd orangehrm-playwright-framework

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npm run setup:browsers

# 4. Configure environment
cp .env.example .env
# Edit .env with your credentials (or use the defaults for the public demo)

# 5. Run all tests
npm test
```

---

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests (all browsers, uses playwright.config.ts)
npm test

# Run in headed mode (visible browser)
npm run test:headed

# Run with Playwright UI mode (interactive)
npm run test:ui

# Run with debug mode (step-by-step)
npm run test:debug

# Run only Admin module tests (Chromium)
npm run test:admin

# Run only Chromium browser
npm run test:chromium
```

### Filtering Tests

```bash
# Run specific test by TC ID
npx playwright test --grep "TC_013" --project=chromium

# Run a specific describe group
npx playwright test --grep "Admin - Search Users" --project=chromium

# Run with retries (CI mode)
npx playwright test --retries=2
```

### Single File

```bash
npx playwright test src/tests/admin.spec.ts --project=chromium --workers=1
```

---

## 📊 Allure Reports

The framework generates rich Allure reports with:
- ✅ **Nested steps** — parent steps (actions) + child steps (locator + value details)
- 📸 **Screenshots** — auto-attached on failure + final screenshot on pass
- 🎥 **Videos** — full execution recording for every test
- 🏷️ **Labels** — Epic / Feature / Story / Owner / Tags
- 📈 **Trend history** — preserved across CI runs

### Local Report Workflow

```bash
# Full one-shot: clean → run → generate → open
npm run test:admin:allure

# Or step by step:
npm run allure:clean           # Remove old results/report
npm run test:admin             # Run tests (writes to allure-results/)
npm run allure:generate        # Generate HTML report → allure-report/
npm run allure:open            # Open in browser

# Live serve (no generate needed):
npm run allure:serve
```

### GitHub Pages Report

After each CI run, the Allure report is automatically deployed to:
```
https://<your-org>.github.io/<repo-name>/
```

---

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Target application URL
BASE_URL=https://opensource-demo.orangehrmlive.com

# Test credentials
TEST_USERNAME=Admin
TEST_PASSWORD=admin123
```

> **⚠️ Never commit `.env` to version control.** Use GitHub Secrets for CI/CD.

### GitHub Secrets (for CI/CD)

| Secret | Description | Default (demo) |
|--------|-------------|----------------|
| `BASE_URL` | Application base URL | `https://opensource-demo.orangehrmlive.com` |
| `TEST_USERNAME` | Admin username | `Admin` |
| `TEST_PASSWORD` | Admin password | `admin123` |

### Key Config Options (`playwright.config.ts`)

| Option | Value | Notes |
|--------|-------|-------|
| `timeout` | 60000ms | Per-test timeout |
| `actionTimeout` | 25000ms | Per-action timeout |
| `navigationTimeout` | 45000ms | Navigation timeout |
| `retries` | 2 (CI), 0 (local) | Auto-retry on failure |
| `workers` | 1 | Sequential — prevents data conflicts |
| `video` | `on` | Always record |
| `screenshot` | `only-on-failure` | Plus manual attach on pass |

---

## 🏗️ Architecture

### Page Object Model

```
Test (admin.spec.ts)
  └── Fixture (base.fixture.ts)   — injects page objects + Allure metadata
       └── Page Object (system-users.page.ts)   — parent test.step() steps
            └── BasePage (base.page.ts)          — child steps with locator+value
```

### Allure Step Hierarchy

```
beforeEach
  ▶ Precondition: Login as Admin and navigate to System Users
    ▶ Open Login page
      • Navigate to: "/web/index.php/auth/login"
    ▶ Login with username "Admin"
      • Fill "Username Input" with value: "Admin" [locator: ...]
      • Fill "Password Input" with value: ●●●●●● [locator: ...]
      • Click "Login Button [type=submit]" [locator: ...]
    ▶ Open System Users page

test body
  ▶ Search users — filter: Username="Admin"
    • Fill "Username Search Input" with value: "Admin"
    • Click "Search Button [type=submit]"

afterEach
  ▶ Attach final screenshot (test passed)   ← 📸 only on PASS
```

### Smart Waits Strategy

| Scenario | Approach |
|----------|----------|
| Page navigation | `page.goto()` + `waitForLoadState('domcontentloaded')` |
| Spinner / loading | `waitForSpinnerDetached()` — appears then hidden |
| Element ready | `locator.waitFor({ state: 'visible' })` |
| Autocomplete | `pressSequentially` + option visible wait |
| Network settle | `waitForLoadState('networkidle')` post-action |
| Assertions | `expect(locator).toHaveText()` — auto-retry built in |

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on push/PR to `main`:

```
┌─────────────┐    ┌──────────────────────┐    ┌────────────────────────┐
│   install   │───▶│  test (matrix)        │───▶│  allure-report         │
│             │    │  chromium             │    │                        │
│ npm ci      │    │  firefox       ────── │    │ Download all results   │
│ cache       │    │  webkit               │    │ Restore gh-pages hist  │
│ browsers    │    │                       │    │ Generate HTML report   │
└─────────────┘    └──────────────────────┘    │ Deploy → GitHub Pages  │
                                                └────────────────────────┘
```

**Artifacts uploaded per run:**
- `allure-results-{browser}` — raw JSON results (7 days)
- `playwright-html-report-{browser}` — HTML report (7 days)
- `test-results-{browser}` — videos + screenshots (3 days)
- `allure-report-consolidated` — combined HTML (14 days)

---

## ⚠️ Known Limitations

| Issue | Description | Workaround |
|-------|-------------|------------|
| **Shared demo** | `opensource-demo.orangehrmlive.com` is a public demo shared by many users. Language or data changes by others can affect tests. | Re-run tests; demo usually resets periodically |
| **Sequential only** | `workers: 1` required — tests create/delete shared users | Do not increase workers without test isolation |
| **Autocomplete timing** | `pressSequentially` with 100ms delay — can be slow on low-spec CI | Increase `delay` or `actionTimeout` if needed |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Run tests locally and ensure all pass: `npm run test:admin`
3. Generate Allure report and verify: `npm run allure:generate && npm run allure:open`
4. Commit with conventional format: `git commit -m "feat(admin): add TC_034 for X"`
5. Push and open Pull Request

---

## 📄 License

ISC © Antigravity QA Team
