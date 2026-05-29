import { Page, Locator, test } from '@playwright/test';

export class BasePage {
  // Expose page publicly so fixtures/tests can reference it
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Navigate the browser to a path or absolute URL.
   * Creates an Allure child step (allure-playwright converts test.step → Allure step).
   */
  async navigate(path: string = ''): Promise<void> {
    await test.step(`Navigate to: "${path}"`, async () => {
      await this.page.goto(path);
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Interactions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Click a UI element after waiting for it to be visible.
   * @param locator  Playwright Locator
   * @param label    Human-readable element name shown in Allure step
   */
  async click(locator: Locator, label: string): Promise<void> {
    const locatorStr = locator.toString();
    await test.step(`Click "${label}" [locator: ${locatorStr}]`, async () => {
      await locator.waitFor({ state: 'visible' });
      await locator.click();
    });
  }

  /**
   * Fill a text input — masks password fields automatically.
   * @param locator    Playwright Locator
   * @param text       Value to type
   * @param label      Human-readable field name shown in Allure step
   */
  async fill(locator: Locator, text: string, label: string): Promise<void> {
    const locatorStr = locator.toString();
    const isPassword = label.toLowerCase().includes('password') || locatorStr.toLowerCase().includes('password');
    const displayValue = isPassword ? '●●●●●●' : `"${text}"`;

    await test.step(`Fill "${label}" with value: ${displayValue} [locator: ${locatorStr}]`, async () => {
      await locator.waitFor({ state: 'visible' });
      await locator.fill(text);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Queries  (no test.step wrapping — utility helpers, reduce noise)
  // ─────────────────────────────────────────────────────────────────────────

  /** Return trimmed innerText of a visible element. */
  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.innerText()).trim();
  }

  /** Return true if the element is visible within 5 s, false otherwise. */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return locator.isVisible();
    } catch {
      return false;
    }
  }

  /** Wait for a fixed number of milliseconds (use sparingly — prefer smart waits). */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /** Capture a full-page screenshot and return the Buffer. */
  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png` });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Waits
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Wait for the OrangeHRM loading spinner to appear and then disappear.
   * Safe to call even when the spinner never appears (catches TimeoutError).
   */
  async waitForSpinnerDetached(): Promise<void> {
    const spinner = this.page.locator('.oxd-loading-spinner');
    try { await spinner.waitFor({ state: 'visible', timeout: 800 }); } catch {}
    try { await spinner.waitFor({ state: 'hidden',  timeout: 10000 }); } catch {}
  }
}
