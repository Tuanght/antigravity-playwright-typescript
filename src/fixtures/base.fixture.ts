import { test as base, TestInfo } from '@playwright/test';
import { LoginPage }          from '../pages/login.page';
import { DashboardPage }      from '../pages/dashboard.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { SystemUsersPage }    from '../pages/system-users.page';
import { SaveSystemUserPage } from '../pages/save-system-user.page';

// Custom fixture types
type MyFixtures = {
  loginPage:          LoginPage;
  dashboardPage:      DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
  systemUsersPage:    SystemUsersPage;
  saveSystemUserPage: SaveSystemUserPage;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: apply Allure suite/label metadata via testInfo.annotations
// This approach avoids calling allure.xxx() outside test body context
// and is 100% compatible with allure-playwright reporter.
// ─────────────────────────────────────────────────────────────────────────────
function applyAllureAnnotations(testInfo: TestInfo): void {
  // titlePath: ['file', 'outer describe', 'inner describe', 'test title']
  const epic    = testInfo.titlePath[1] ?? 'OrangeHRM';
  const feature = testInfo.titlePath[2] ?? epic;

  // These annotations are picked up by allure-playwright reporter
  testInfo.annotations.push({ type: 'epic',    description: epic });
  testInfo.annotations.push({ type: 'feature', description: feature });
  testInfo.annotations.push({ type: 'story',   description: testInfo.title });
  testInfo.annotations.push({ type: 'owner',   description: 'Antigravity QA Team' });
  testInfo.annotations.push({ type: 'tag',     description: 'e2e' });
  testInfo.annotations.push({ type: 'tag',     description: 'playwright' });
  testInfo.annotations.push({ type: 'tag',     description: 'orangehrm' });
  testInfo.annotations.push({ type: 'severity', description: 'normal' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Extended test runner
// ─────────────────────────────────────────────────────────────────────────────
export const test = base.extend<MyFixtures>({

  /**
   * Override the default `page` fixture to:
   *  1. Apply Allure annotations before the test body runs
   *  2. Attach a full-page screenshot on PASS (final step)
   *  Video and failure screenshots are attached automatically by allure-playwright.
   */
  page: async ({ page }, use, testInfo) => {
    // Apply Allure metadata synchronously — safe to call from fixture
    applyAllureAnnotations(testInfo);

    // Run the actual test
    await use(page);

    // ── Post-test hooks ───────────────────────────────────────────────────
    if (testInfo.status === 'passed') {
      await base.step('Attach final screenshot (test passed)', async () => {
        const screenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach('Final Screenshot — Test Passed', {
          body:        screenshot,
          contentType: 'image/png',
        });
      });
    }
  },

  // ── Page Object factories ──────────────────────────────────────────────
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },

  systemUsersPage: async ({ page }, use) => {
    await use(new SystemUsersPage(page));
  },

  saveSystemUserPage: async ({ page }, use) => {
    await use(new SaveSystemUserPage(page));
  },
});

export { expect } from '@playwright/test';
