import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessageAlert: Locator;
  
  // Footer & Branding elements
  readonly companyBrandingLogo: Locator;
  readonly versionText: Locator;
  readonly copyrightText: Locator;
  readonly orangehrmIncLink: Locator;
  readonly linkedInLink: Locator;
  readonly facebookLink: Locator;
  readonly twitterLink: Locator;
  readonly youtubeLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator('input[name="username"]');
    this.passwordInput = this.page.locator('input[name="password"]');
    this.loginButton = this.page.locator('button[type="submit"]');
    this.forgotPasswordLink = this.page.locator('.orangehrm-login-forgot-header');
    this.errorMessageAlert = this.page.locator('.oxd-alert-content-text');
    
    // Footer & Branding selectors
    this.companyBrandingLogo = this.page.locator('img[alt="company-branding"]');
    this.versionText = this.page.locator('p:has-text("OrangeHRM OS")');
    this.copyrightText = this.page.locator('.orangehrm-copyright-wrapper');
    this.orangehrmIncLink = this.page.locator('.orangehrm-copyright-wrapper a');
    this.linkedInLink = this.page.locator('.orangehrm-login-footer-sm a[href*="linkedin"]');
    this.facebookLink = this.page.locator('.orangehrm-login-footer-sm a[href*="facebook"]');
    this.twitterLink = this.page.locator('.orangehrm-login-footer-sm a[href*="twitter"]');
    this.youtubeLink = this.page.locator('.orangehrm-login-footer-sm a[href*="youtube"]');
  }

  /**
   * Truy cập trang đăng nhập
   */
  async open(): Promise<void> {
    await this.navigate('/web/index.php/auth/login');
  }

  /**
   * Đăng nhập với thông tin Username và Password
   */
  async login(username: string, password: string): Promise<void> {
    if (username !== '') {
      await this.fill(this.usernameInput, username, 'Username Input');
    } else {
      await this.usernameInput.clear();
    }

    if (password !== '') {
      await this.fill(this.passwordInput, password, 'Password Input');
    } else {
      await this.passwordInput.clear();
    }

    await this.click(this.loginButton, 'Login Button');
  }

  /**
   * Click vào link quên mật khẩu
   */
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink, 'Forgot Password Link');
  }

  /**
   * Lấy thông báo lỗi tổng quát (Ví dụ: Invalid credentials)
   */
  async getGeneralErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessageAlert);
  }

  /**
   * Lấy thông báo lỗi cho một trường nhập liệu cụ thể (Ví dụ: Required)
   * @param fieldName 'username' hoặc 'password'
   */
  async getFieldError(fieldName: 'username' | 'password'): Promise<string> {
    const fieldContainer = this.page.locator('.oxd-form-row', {
      has: this.page.locator(`input[name="${fieldName}"]`)
    });
    const errorText = fieldContainer.locator('.oxd-input-field-error-message');
    return await this.getText(errorText);
  }
}
