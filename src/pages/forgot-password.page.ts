import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  readonly usernameInput: Locator;
  readonly cancelButton: Locator;
  readonly resetPasswordButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator('input[name="username"]');
    this.cancelButton = this.page.locator('button:has-text("Cancel")');
    this.resetPasswordButton = this.page.locator('button:has-text("Reset Password")');
    this.pageTitle = this.page.locator('.orangehrm-forgot-password-title');
  }

  /**
   * Mở trang Reset Password trực tiếp
   */
  async open(): Promise<void> {
    await this.navigate('/web/index.php/auth/requestPasswordResetCode');
  }

  /**
   * Gửi yêu cầu đặt lại mật khẩu với Username cụ thể
   */
  async resetPassword(username: string): Promise<void> {
    if (username !== '') {
      await this.fill(this.usernameInput, username, 'Reset Username Input');
    } else {
      await this.usernameInput.clear();
    }
    await this.click(this.resetPasswordButton, 'Reset Password Button');
  }

  /**
   * Nhấp nút Cancel để quay lại Login
   */
  async clickCancel(): Promise<void> {
    await this.click(this.cancelButton, 'Cancel Button');
  }

  /**
   * Lấy thông báo lỗi dưới trường Username
   */
  async getFieldError(): Promise<string> {
    const errorText = this.page.locator('.oxd-input-group:has(input[name="username"]) .oxd-input-field-error-message');
    return await this.getText(errorText);
  }

  /**
   * Lấy tiêu đề hiển thị trên trang (Ví dụ: "Reset Password" hoặc "Reset Link sent successfully")
   */
  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }
}
