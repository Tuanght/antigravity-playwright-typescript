import { Page, Locator, test } from '@playwright/test';
import { BasePage } from './base.page';

export class SystemUsersPage extends BasePage {
  readonly usernameSearchInput:    Locator;
  readonly userRoleDropdown:       Locator;
  readonly employeeNameSearchInput: Locator;
  readonly statusDropdown:         Locator;
  readonly searchButton:           Locator;
  readonly resetButton:            Locator;
  readonly addButton:              Locator;
  readonly recordsFoundText:       Locator;
  readonly tableRows:              Locator;
  readonly selectAllCheckbox:      Locator;
  readonly deleteSelectedButton:   Locator;

  // Delete-dialog locators
  readonly dialogContainer:            Locator;
  readonly dialogDeleteConfirmButton:  Locator;
  readonly dialogCancelButton:         Locator;
  readonly dialogCloseButton:          Locator;

  constructor(page: Page) {
    super(page);
    this.usernameSearchInput      = page.locator('.oxd-input-group:has(label:has-text("Username")) input');
    this.userRoleDropdown         = page.locator('.oxd-input-group:has(label:has-text("User Role")) .oxd-select-text');
    this.employeeNameSearchInput  = page.locator('.oxd-input-group:has(label:has-text("Employee Name")) input');
    this.statusDropdown           = page.locator('.oxd-input-group:has(label:has-text("Status")) .oxd-select-text');
    this.searchButton             = page.locator('button[type="submit"]');
    this.resetButton              = page.locator('button:has-text("Reset")');
    this.addButton                = page.locator('button:has-text("Add")');
    this.recordsFoundText         = page.locator('.orangehrm-horizontal-padding .oxd-text, .orangehrm-horizontal-padding span');
    this.tableRows                = page.locator('.oxd-table-body .oxd-table-card');
    this.selectAllCheckbox        = page.locator('.oxd-table-header .oxd-checkbox-input');
    this.deleteSelectedButton     = page.locator('button:has-text("Delete Selected")');

    this.dialogContainer           = page.locator('.oxd-dialog-container');
    this.dialogDeleteConfirmButton = page.locator('.orangehrm-modal-footer button:has-text("Yes, Delete")');
    this.dialogCancelButton        = page.locator('.orangehrm-modal-footer button:has-text("No, Cancel")');
    this.dialogCloseButton         = page.locator('.oxd-dialog-close-button');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────

  /** Navigate directly to the System Users list page. */
  async open(): Promise<void> {
    await test.step('Open System Users page', async () => {
      await this.navigate('/web/index.php/admin/viewSystemUsers');
      await this.waitForSpinnerDetached();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Search users by any combination of criteria.
   * Only fields that are explicitly provided (not undefined) will be applied.
   */
  async searchUsers(username?: string, role?: string, employeeName?: string, status?: string): Promise<void> {
    const filters: string[] = [];
    if (username)     filters.push(`Username="${username}"`);
    if (role)         filters.push(`Role="${role}"`);
    if (employeeName) filters.push(`Employee="${employeeName}"`);
    if (status)       filters.push(`Status="${status}"`);
    const label = filters.length ? filters.join(', ') : 'default (no filter)';

    await test.step(`Search users — filter: ${label}`, async () => {
      await this.waitForSpinnerDetached();

      if (username !== undefined) {
        await this.fill(this.usernameSearchInput, username, 'Username Search Input');
      }

      if (role !== undefined) {
        await this.click(this.userRoleDropdown, 'User Role Dropdown');
        const option = this.page.locator(`.oxd-select-dropdown .oxd-select-option:has-text("${role}")`);
        await this.click(option, `User Role Option: "${role}"`);
      }

      if (employeeName !== undefined) {
        const typeText = employeeName.split(' ')[0];
        await test.step(`Type "${typeText}" into Employee Name autocomplete [locator: ${this.employeeNameSearchInput}]`, async () => {
          await this.employeeNameSearchInput.clear();
          await this.employeeNameSearchInput.pressSequentially(typeText, { delay: 100 });
        });
        const option = this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option')
          .filter({ hasText: typeText }).first();
        await option.waitFor({ state: 'visible', timeout: 20000 });
        await this.click(option, `Employee Autocomplete Option: "${employeeName}"`);
        await this.page.locator('.oxd-autocomplete-dropdown').waitFor({ state: 'hidden', timeout: 5000 });
      }

      if (status !== undefined) {
        await this.click(this.statusDropdown, 'Status Dropdown');
        const option = this.page.locator(`.oxd-select-dropdown .oxd-select-option:has-text("${status}")`);
        await this.click(option, `Status Option: "${status}"`);
      }

      await this.click(this.searchButton, 'Search Button [type=submit]');

      // Wait for results to load
      const spinner = this.page.locator('.oxd-loading-spinner');
      try { await spinner.waitFor({ state: 'visible', timeout: 800 }); } catch {}
      try { await spinner.waitFor({ state: 'hidden',  timeout: 10000 }); } catch {}
      await this.page.waitForLoadState('networkidle');
    });
  }

  /** Reset all search filters. */
  async resetSearch(): Promise<void> {
    await test.step('Reset search filters', async () => {
      await this.click(this.resetButton, 'Reset Button');
      const spinner = this.page.locator('.oxd-loading-spinner');
      try { await spinner.waitFor({ state: 'visible', timeout: 800 }); } catch {}
      try { await spinner.waitFor({ state: 'hidden',  timeout: 10000 }); } catch {}
      await this.page.waitForLoadState('networkidle');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Table helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Parse the "(N) Records Found" text and return N as a number. */
  async getRecordsCount(): Promise<number> {
    const text = await this.getRecordsText();
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getRecordsText(): Promise<string> {
    if (await this.recordsFoundText.first().isVisible()) {
      return this.getText(this.recordsFoundText.first());
    }
    return '';
  }

  /** Return true if a row containing the given username is visible. */
  async isRecordVisible(username: string): Promise<boolean> {
    const row = this.page.locator('.oxd-table-card').filter({ hasText: username });
    return this.isVisible(row.first());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Row actions
  // ─────────────────────────────────────────────────────────────────────────

  /** Click the ✏️ Edit button on the row matching the given username. */
  async clickEditUser(username: string): Promise<void> {
    await test.step(`Click Edit for user "${username}"`, async () => {
      const row = this.page.locator('.oxd-table-card').filter({ hasText: username }).first();
      const editButton = row.locator('button:has(i.bi-pencil-fill), button:nth-child(2)');
      await this.click(editButton, `Edit Button [row: "${username}"]`);
      await this.waitForSpinnerDetached();
    });
  }

  /** Click the 🗑️ Delete button on the row matching the given username. */
  async clickDeleteUser(username: string): Promise<void> {
    await test.step(`Click Delete for user "${username}"`, async () => {
      const row = this.page.locator('.oxd-table-card').filter({ hasText: username }).first();
      const deleteButton = row.locator('button:has(i.bi-trash), button:nth-child(1)');
      await this.click(deleteButton, `Delete Button [row: "${username}"]`);
    });
  }

  /** Return true if the Delete button is visible for the given username row. */
  async isDeleteButtonVisibleForUser(username: string): Promise<boolean> {
    const row = this.page.locator('.oxd-table-card').filter({ hasText: username }).first();
    const deleteButton = row.locator('button:has(i.bi-trash), button:nth-child(1)');
    return this.isVisible(deleteButton);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD button helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Click the ➕ Add button to open the Add User form. */
  async clickAdd(): Promise<void> {
    await test.step('Click Add button to open Add User form', async () => {
      await this.click(this.addButton, 'Add Button');
      await this.waitForSpinnerDetached();
    });
  }

  /** Select the row checkbox for the given username. */
  async selectRecordCheckbox(username: string): Promise<void> {
    await test.step(`Select checkbox for user "${username}"`, async () => {
      const row = this.page.locator('.oxd-table-card').filter({ hasText: username }).first();
      const checkbox = row.locator('.oxd-table-card-cell-checkbox .oxd-checkbox-input, .oxd-checkbox-input');
      await this.click(checkbox, `Row Checkbox [username: "${username}"]`);
    });
  }

  /** Click the Select All checkbox in the table header. */
  async selectAll(): Promise<void> {
    await test.step('Select All rows', async () => {
      await this.click(this.selectAllCheckbox, 'Select All Checkbox [header]');
    });
  }

  /** Click the "Delete Selected" bulk-delete button. */
  async clickDeleteSelected(): Promise<void> {
    await test.step('Click Delete Selected (bulk delete)', async () => {
      await this.click(this.deleteSelectedButton, 'Delete Selected Button');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Delete confirmation dialog
  // ─────────────────────────────────────────────────────────────────────────

  /** Confirm deletion in the dialog ("Yes, Delete"). */
  async confirmDelete(): Promise<void> {
    await test.step('Confirm deletion in dialog', async () => {
      await this.click(this.dialogDeleteConfirmButton, 'Dialog Confirm Button [Yes, Delete]');
      await this.page.waitForLoadState('networkidle');
    });
  }

  /** Cancel deletion in the dialog ("No, Cancel"). */
  async cancelDelete(): Promise<void> {
    await test.step('Cancel deletion in dialog', async () => {
      await this.click(this.dialogCancelButton, 'Dialog Cancel Button [No, Cancel]');
    });
  }

  /** Close the delete dialog via the ✕ button. */
  async closeDeleteDialog(): Promise<void> {
    await test.step('Close deletion dialog', async () => {
      await this.click(this.dialogCloseButton, 'Dialog Close Button [×]');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Sorting
  // ─────────────────────────────────────────────────────────────────────────

  /** Click a table header cell to sort by that column. */
  async sortByColumn(columnName: string): Promise<void> {
    await test.step(`Sort table by column "${columnName}"`, async () => {
      const headerCell = this.page.locator('.oxd-table-header-cell').filter({ hasText: columnName }).first();
      await this.click(headerCell, `Column Header "${columnName}"`);
      await this.page.waitForLoadState('networkidle');
    });
  }
}
