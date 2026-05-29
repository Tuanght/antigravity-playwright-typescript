import { Page, Locator, test } from '@playwright/test';
import { BasePage } from './base.page';

export class SaveSystemUserPage extends BasePage {
  readonly pageHeader:             Locator;
  readonly userRoleDropdown:       Locator;
  readonly employeeNameInput:      Locator;
  readonly statusDropdown:         Locator;
  readonly usernameInput:          Locator;
  readonly changePasswordCheckbox: Locator;
  readonly changePasswordLabel:    Locator;
  readonly passwordInput:          Locator;
  readonly confirmPasswordInput:   Locator;
  readonly saveButton:             Locator;
  readonly cancelButton:           Locator;
  readonly passwordStrengthText:   Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader             = page.locator('.orangehrm-card-container h6').first();
    this.userRoleDropdown       = page.locator('.oxd-input-group:has(label:has-text("User Role")) .oxd-select-text');
    this.employeeNameInput      = page.locator('.oxd-input-group:has(label:has-text("Employee Name")) input');
    this.statusDropdown         = page.locator('.oxd-input-group:has(label:has-text("Status")) .oxd-select-text');
    this.usernameInput          = page.locator('.oxd-input-group:has(label:has-text("Username")) input');
    this.changePasswordCheckbox = page.locator('.oxd-input-group:has(label:has-text("Change Password ?")) input[type="checkbox"]');
    this.changePasswordLabel    = page.locator('.oxd-input-group:has(label:has-text("Change Password ?")) .oxd-checkbox-input');
    this.passwordInput          = page.locator('.oxd-input-group:has(label:has-text("Password")):not(:has(label:has-text("Confirm Password"))) input[type="password"]');
    this.confirmPasswordInput   = page.locator('.oxd-input-group:has(label:has-text("Confirm Password")) input[type="password"]');
    this.saveButton             = page.locator('button[type="submit"]');
    this.cancelButton           = page.locator('button:has-text("Cancel")');
    this.passwordStrengthText   = page.locator('.orangehrm-password-chip');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────────────────────────────────

  /** Return the page heading title — "Add User" or "Edit User". */
  async getPageHeaderTitle(): Promise<string> {
    await this.waitForSpinnerDetached();
    return this.getText(this.pageHeader);
  }

  /** Return the current password-strength label text (e.g. "Very Weak"). */
  async getPasswordStrength(): Promise<string> {
    if (await this.passwordStrengthText.isVisible()) {
      return this.getText(this.passwordStrengthText);
    }
    return '';
  }

  /**
   * Return the validation error message for a labelled form field.
   * @param labelName  Visible label text (e.g. "Username")
   */
  async getFieldError(labelName: string): Promise<string> {
    const group = this.page.locator('.oxd-input-group', {
      has: this.page.locator(`label:has-text("${labelName}")`),
    }).first();
    const errorText = group.locator('.oxd-input-field-error-message');
    try {
      await errorText.waitFor({ state: 'visible', timeout: 3000 });
      return this.getText(errorText);
    } catch {
      return '';
    }
  }

  /** Return the current value of a text-input field identified by its label. */
  async getInputValue(labelName: string): Promise<string> {
    const group = this.page.locator('.oxd-input-group', {
      has: this.page.locator(`label:has-text("${labelName}")`),
    }).first();
    return group.locator('input').inputValue();
  }

  /** Return the current selected text of a dropdown identified by its label. */
  async getDropdownValue(labelName: string): Promise<string> {
    const group = this.page.locator('.oxd-input-group', {
      has: this.page.locator(`label:has-text("${labelName}")`),
    }).first();
    return this.getText(group.locator('.oxd-select-text-input'));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Form interactions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fill any subset of the Add/Edit User form fields.
   * Only fields that are explicitly provided (not undefined) will be touched.
   */
  async fillUserForm(data: {
    role?:            string;
    employeeName?:    string;
    status?:          string;
    username?:        string;
    password?:        string;
    confirmPassword?: string;
  }): Promise<void> {
    const summary = Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}="${k.toLowerCase().includes('password') ? '●●●●●●' : v}"`)
      .join(', ');

    await test.step(`Fill user form — fields: [${summary}]`, async () => {
      await this.waitForSpinnerDetached();

      // User Role dropdown
      if (data.role !== undefined) {
        await this.click(this.userRoleDropdown, 'User Role Dropdown');
        const option = this.page.locator(`.oxd-select-dropdown .oxd-select-option:has-text("${data.role}")`);
        await this.click(option, `User Role Option: "${data.role}"`);
      }

      // Employee Name autocomplete
      if (data.employeeName !== undefined) {
        if (data.employeeName === '') {
          await test.step('Clear Employee Name field', async () => {
            await this.employeeNameInput.clear();
          });
        } else {
          const typeText = data.employeeName === 'Invalid Employee'
            ? data.employeeName
            : data.employeeName.split(' ')[0];

          await test.step(
            `Type "${typeText}" into Employee Name autocomplete [locator: ${this.employeeNameInput}]`,
            async () => {
              await this.employeeNameInput.clear();
              await this.employeeNameInput.pressSequentially(typeText, { delay: 100 });
            },
          );

          if (data.employeeName !== 'Invalid Employee') {
            const option = this.page
              .locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option')
              .filter({ hasText: data.employeeName.split(' ')[0] })
              .first();
            await option.waitFor({ state: 'visible', timeout: 20000 });
            await this.click(option, `Employee Autocomplete Option: "${data.employeeName}"`);
            await this.page.locator('.oxd-autocomplete-dropdown').waitFor({ state: 'hidden', timeout: 5000 });
          }
        }
      }

      // Status dropdown
      if (data.status !== undefined) {
        await this.click(this.statusDropdown, 'Status Dropdown');
        const option = this.page.locator(`.oxd-select-dropdown .oxd-select-option:has-text("${data.status}")`);
        await this.click(option, `Status Option: "${data.status}"`);
      }

      // Username input
      if (data.username !== undefined) {
        if (data.username === '') {
          await test.step('Clear Username field', async () => { await this.usernameInput.clear(); });
        } else {
          await this.fill(this.usernameInput, data.username, 'Username Input');
        }
      }

      // Password input
      if (data.password !== undefined) {
        if (data.password === '') {
          await test.step('Clear Password field', async () => { await this.passwordInput.clear(); });
        } else {
          await this.fill(this.passwordInput, data.password, 'Password Input');
        }
      }

      // Confirm Password input
      if (data.confirmPassword !== undefined) {
        if (data.confirmPassword === '') {
          await test.step('Clear Confirm Password field', async () => { await this.confirmPasswordInput.clear(); });
        } else {
          await this.fill(this.confirmPasswordInput, data.confirmPassword, 'Confirm Password Input');
        }
      }
    });
  }

  /**
   * Toggle the "Change Password?" checkbox to the desired state.
   * @param check  true = check, false = uncheck
   */
  async setChangePassword(check: boolean): Promise<void> {
    await test.step(`Set "Change Password?" checkbox to ${check ? 'checked' : 'unchecked'}`, async () => {
      const isChecked = await this.changePasswordCheckbox.isChecked();
      if (check !== isChecked) {
        await this.click(this.changePasswordLabel, 'Change Password Checkbox Label');
      }
    });
  }

  /**
   * Trigger AJAX duplicate-username validation by blurring the Username field.
   * Uses a smart wait for the error message instead of a hard sleep.
   */
  async blurUsername(): Promise<void> {
    await test.step('Blur Username field to trigger duplicate-username AJAX check', async () => {
      await this.usernameInput.evaluate((el) => (el as HTMLElement).blur());
      const errorMsg = this.page.locator(
        '.oxd-input-group:has(label:has-text("Username")) .oxd-input-field-error-message',
      );
      try {
        await errorMsg.waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        // No error = username is valid — continue
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Form submission
  // ─────────────────────────────────────────────────────────────────────────

  /** Click the Save (submit) button and wait for navigation. */
  async clickSave(): Promise<void> {
    await test.step('Click Save button and wait for redirect', async () => {
      await this.click(this.saveButton, 'Save Button [type=submit]');
      await this.page.waitForLoadState('networkidle');
    });
  }

  /** Click the Cancel button to discard changes. */
  async clickCancel(): Promise<void> {
    await test.step('Click Cancel button', async () => {
      await this.click(this.cancelButton, 'Cancel Button');
    });
  }
}
