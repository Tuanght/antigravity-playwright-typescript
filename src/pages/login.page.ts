import { Page, Locator, test } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly usernameInput:       Locator;
  readonly passwordInput:       Locator;
  readonly loginButton:         Locator;
  readonly forgotPasswordLink:  Locator;
  readonly errorMessageAlert:   Locator;

  // Footer & Branding elements
  readonly companyBrandingLogo: Locator;
  readonly versionText:         Locator;
  readonly copyrightText:       Locator;
  readonly orangehrmIncLink:    Locator;
  readonly linkedInLink:        Locator;
  readonly facebookLink:        Locator;
  readonly twitterLink:         Locator;
  readonly youtubeLink:         Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput      = page.locator('input[name="username"]');
    this.passwordInput      = page.locator('input[name="password"]');
    this.loginButton        = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('.orangehrm-login-forgot-header');
    this.errorMessageAlert  = page.locator('.oxd-alert-content-text');

    this.companyBrandingLogo = page.locator('img[alt="company-branding"]');
    this.versionText         = page.locator('p:has-text("OrangeHRM OS")');
    this.copyrightText       = page.locator('.orangehrm-copyright-wrapper');
    this.orangehrmIncLink    = page.locator('.orangehrm-copyright-wrapper a');
    this.linkedInLink        = page.locator('.orangehrm-login-footer-sm a[href*="linkedin"]');
    this.facebookLink        = page.locator('.orangehrm-login-footer-sm a[href*="facebook"]');
    this.twitterLink         = page.locator('.orangehrm-login-footer-sm a[href*="twitter"]');
    this.youtubeLink         = page.locator('.orangehrm-login-footer-sm a[href*="youtube"]');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────

  /** Navigate to the OrangeHRM login page. */
  async open(): Promise<void> {
    await test.step('Open Login page', async () => {
      await this.navigate('/web/index.php/auth/login');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Enter credentials and click the Login button.
   * Empty string for either field clears that input without typing.
   */
  async login(username: string, password: string): Promise<void> {
    await test.step(`Login with username "${username}"`, async () => {
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

      await this.click(this.loginButton, 'Login Button [type=submit]');
    });
  }

  /** Click the "Forgot your password?" link. */
  async clickForgotPassword(): Promise<void> {
    await test.step('Click "Forgot your password?" link', async () => {
      await this.click(this.forgotPasswordLink, 'Forgot Password Link');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────────────────────────────────

  /** Return the general login error message (e.g. "Invalid credentials"). */
  async getGeneralErrorMessage(): Promise<string> {
    return this.getText(this.errorMessageAlert);
  }

  /**
   * Return the inline field-validation error for username or password.
   * @param fieldName  'username' | 'password'
   */
  async getFieldError(fieldName: 'username' | 'password'): Promise<string> {
    const fieldContainer = this.page.locator('.oxd-form-row', {
      has: this.page.locator(`input[name="${fieldName}"]`),
    });
    const errorText = fieldContainer.locator('.oxd-input-field-error-message');
    return this.getText(errorText);
  }
}
