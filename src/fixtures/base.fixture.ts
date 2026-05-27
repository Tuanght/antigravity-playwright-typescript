import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';

// Khai báo các custom fixtures
type MyFixtures = {
  page: any; // Override default page
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
};

// Mở rộng test runner với các Page Objects đã khai báo và custom page screenshot
export const test = base.extend<MyFixtures>({
  page: async ({ page }, use, testInfo) => {
    // Cho phép chạy test case bình thường
    await use(page);

    // Sau khi test hoàn thành, nếu trạng thái là passed thì chụp ảnh và đính kèm vào report
    if (testInfo.status === 'passed') {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('Passed Test Final Screenshot', {
        body: screenshot,
        contentType: 'image/png'
      });
    }
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },
});

export { expect } from '@playwright/test';
