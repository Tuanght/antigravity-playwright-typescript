import { Page, Locator, test } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Điều hướng trình duyệt đến một URL hoặc path
   * @param path Đường dẫn hoặc URL tuyệt đối
   */
  async navigate(path: string = ''): Promise<void> {
    await test.step(`Navigate to path: '${path}'`, async () => {
      await this.page.goto(path);
    });
  }

  /**
   * Click vào một phần tử UI
   * @param locator Locator của phần tử cần click
   * @param elementName Tên mô tả của phần tử (dùng cho log)
   */
  async click(locator: Locator, elementName: string): Promise<void> {
    const locatorStr = locator.toString();
    await test.step(`Click on '${elementName}' (locator: "${locatorStr}")`, async () => {
      await locator.waitFor({ state: 'visible' });
      await locator.click();
    });
  }

  /**
   * Điền text vào ô nhập liệu
   * @param locator Locator của ô nhập liệu
   * @param text Dữ liệu cần nhập
   * @param elementName Tên mô tả của phần tử (dùng cho log)
   */
  async fill(locator: Locator, text: string, elementName: string): Promise<void> {
    const locatorStr = locator.toString();
    const isPassword = elementName.toLowerCase().includes('password') || locatorStr.toLowerCase().includes('password');
    const displayValue = isPassword ? '******' : text;

    await test.step(`Fill '${elementName}' (locator: "${locatorStr}") with value: "${displayValue}"`, async () => {
      await locator.waitFor({ state: 'visible' });
      await locator.fill(text);
    });
  }

  /**
   * Lấy text content của một phần tử (Không bọc trong test.step để giảm bớt bước phụ trợ)
   */
  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    const text = await locator.innerText();
    return text.trim();
  }

  /**
   * Kiểm tra phần tử có hiển thị không (Không bọc trong test.step để giảm bớt bước phụ trợ)
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Đợi một khoảng thời gian cụ thể (Không bọc trong test.step để giảm bớt bước phụ trợ)
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Chụp ảnh màn hình
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png` });
  }
}
