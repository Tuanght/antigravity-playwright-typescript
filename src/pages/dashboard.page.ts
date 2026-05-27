import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly headerTitle: Locator;
  readonly userProfileDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.headerTitle = this.page.locator('.oxd-topbar-header-title h6');
    this.userProfileDropdown = this.page.locator('.oxd-userdropdown-tab');
  }

  /**
   * Lấy tiêu đề ở header
   */
  async getHeaderTitle(): Promise<string> {
    return await this.getText(this.headerTitle);
  }

  /**
   * Kiểm tra xem dropdown profile của người dùng có hiển thị không
   */
  async isUserProfileVisible(): Promise<boolean> {
    return await this.isVisible(this.userProfileDropdown);
  }
}
