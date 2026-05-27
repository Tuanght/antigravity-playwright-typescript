import { test, expect } from '../../fixtures/base.fixture';

test.describe('OrangeHRM - Forgot Password Module Tests', () => {

  test.beforeEach(async ({ loginPage, forgotPasswordPage }) => {
    test.setTimeout(60000);
    await test.step('Prerequisite: Open Login Page and navigate to Reset Password page', async () => {
      await loginPage.open();
      await loginPage.clickForgotPassword();
      await expect(forgotPasswordPage.pageTitle).toHaveText('Reset Password');
    });
  });

  test('OHRM_LOGIN_TC_014 - Điều hướng thành công sang trang Reset Password qua link "Forgot your password?"', async ({ forgotPasswordPage }) => {
    await test.step('Step 1: Verify current URL is on the Password Reset page', async () => {
      expect(forgotPasswordPage.page.url()).toContain('/auth/requestPasswordResetCode');
    });
  });

  test('OHRM_LOGIN_TC_015 - Hủy bỏ yêu cầu đặt lại mật khẩu và quay lại trang Login', async ({ forgotPasswordPage, loginPage }) => {
    await test.step('Step 1: Click "Cancel" button on Reset Password page', async () => {
      await forgotPasswordPage.clickCancel();
    });

    await test.step('Step 2: Verify user is redirected back to the Login page', async () => {
      expect(loginPage.page.url()).toContain('/auth/login');
      await expect(loginPage.loginButton).toBeVisible();
    });
  });

  test('OHRM_LOGIN_TC_016 - Gửi yêu cầu đặt lại mật khẩu thất bại khi bỏ trống trường Username', async ({ forgotPasswordPage }) => {
    await test.step('Step 1: Submit reset password request with empty username', async () => {
      await forgotPasswordPage.resetPassword('');
    });

    await test.step('Step 2: Verify "Required" validation error is displayed under username field', async () => {
      const errorText = await forgotPasswordPage.getFieldError();
      expect(errorText).toBe('Required');
    });
  });

  test('OHRM_LOGIN_TC_017 - Gửi yêu cầu đặt lại mật khẩu thành công với Username hợp lệ (Admin)', async ({ forgotPasswordPage }) => {
    const validUsername = 'Admin';
    
    await test.step(`Step 1: Submit reset password request with valid username: "${validUsername}"`, async () => {
      await forgotPasswordPage.resetPassword(validUsername);
    });
    
    await test.step('Step 2: Verify system redirects to the success page and displays success message', async () => {
      await expect(forgotPasswordPage.page).toHaveURL(/.*\/auth\/sendPasswordReset/, { timeout: 20000 });
      const titleText = await forgotPasswordPage.getPageTitle();
      expect(titleText).toBe('Reset Password link sent successfully');
    });
  });

  test('OHRM_LOGIN_TC_018 - Gửi yêu cầu đặt lại mật khẩu với Username không tồn tại trong hệ thống', async ({ forgotPasswordPage }) => {
    const nonExistingUser = 'NonExistingUser';
    
    await test.step(`Step 1: Submit reset password request with non-existing username: "${nonExistingUser}"`, async () => {
      await forgotPasswordPage.resetPassword(nonExistingUser);
    });
    
    await test.step('Step 2: Verify system handles request safely, redirects and displays the generic success message', async () => {
      await expect(forgotPasswordPage.page).toHaveURL(/.*\/auth\/sendPasswordReset/, { timeout: 20000 });
      const titleText = await forgotPasswordPage.getPageTitle();
      expect(titleText).toBe('Reset Password link sent successfully');
    });
  });

  test('OHRM_LOGIN_TC_019 - Kiểm tra bảo mật SQL Injection trên trường Username ở trang Reset Password', async ({ forgotPasswordPage }) => {
    const sqlInjectionValue = "admin' OR 1=1--";
    
    await test.step(`Step 1: Submit reset password request with SQL Injection payload: "${sqlInjectionValue}"`, async () => {
      await forgotPasswordPage.resetPassword(sqlInjectionValue);
    });
    
    await test.step('Step 2: Verify system handles SQL Injection safely, redirects and displays generic success message', async () => {
      await expect(forgotPasswordPage.page).toHaveURL(/.*\/auth\/sendPasswordReset/, { timeout: 20000 });
      const titleText = await forgotPasswordPage.getPageTitle();
      expect(titleText).toBe('Reset Password link sent successfully');
    });
  });
});
