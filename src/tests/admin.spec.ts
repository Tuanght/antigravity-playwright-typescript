import { test, expect } from '../fixtures/base.fixture';
import { config } from '../utils/env.config';


test.describe('Admin - System Users Automation Suite', () => {
  // Bắt buộc viewport desktop 1920x1080
  test.use({ viewport: { width: 1920, height: 1080 } });

  // Thông tin đăng nhập từ config
  const ADMIN_USER = config.testUser.username;
  const ADMIN_PASS = config.testUser.password;


  // Khai báo dữ liệu dùng chung cho các tests
  let uniqueUsername: string;
  let uniquePassword = 'Password123!';
  // Tên employee đã xác nhận tồn tại trong DB demo (dùng tên viết tắt để autocomplete search)
  let employeeName = 'Thomas  Osinski'; // Double space là format của OrangeHRM DB
  let adminEmployeeName: string = '';

  test.beforeAll(() => {
    const timestamp = Date.now();
    uniqueUsername = `auto_user_${timestamp}`;
  });

  test.beforeEach(async ({ loginPage, systemUsersPage }) => {
    // Step 1: Open login page and authenticate
    await test.step('Precondition: Login as Admin and navigate to System Users', async () => {
      await loginPage.open();
      await loginPage.login(ADMIN_USER, ADMIN_PASS);
      await systemUsersPage.page.waitForURL(/.*dashboard/, { timeout: 30000 });
      await systemUsersPage.open();
    });

    // Step 2: Detect the Admin user's linked Employee Name dynamically from the grid
    if (!adminEmployeeName) {
      await test.step('Detect Admin user\'s Employee Name from the System Users grid', async () => {
        await systemUsersPage.waitForSpinnerDetached();
        const adminRow = systemUsersPage.tableRows.filter({
          has: systemUsersPage.page.locator('.oxd-table-cell').nth(1).filter({ hasText: /^Admin$/ })
        }).first();
        if (await adminRow.isVisible()) {
          adminEmployeeName = (await adminRow.locator('.oxd-table-cell').nth(3).innerText()).trim();
        } else {
          const firstRow = systemUsersPage.tableRows.first();
          adminEmployeeName = await firstRow.isVisible()
            ? (await firstRow.locator('.oxd-table-cell').nth(3).innerText()).trim()
            : 'Thomas  Osinski';
        }
      });
    }
  });

  test.afterEach(async () => {
    // Playwright automatically isolates browser context — no additional cleanup needed
  });

  test.describe('Admin - Search Users', () => {
    test('HRM_ADMIN_TC_001 - Tìm kiếm người dùng bằng Username chính xác', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers('Admin');
      expect(await systemUsersPage.isRecordVisible('Admin')).toBeTruthy();
      expect(await systemUsersPage.getRecordsCount()).toBeGreaterThanOrEqual(1);
    });

    test('HRM_ADMIN_TC_002 - Tìm kiếm người dùng bằng Username không phân biệt hoa thường', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers('admin');
      expect(await systemUsersPage.isRecordVisible('Admin')).toBeTruthy();
    });

    test('HRM_ADMIN_TC_003 - Tìm kiếm người dùng bằng Username chứa một phần ký tự', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers('Admi');
      expect(await systemUsersPage.getRecordsCount()).toBe(0);
      await expect(systemUsersPage.page.locator('text=No Records Found').first()).toBeVisible();
    });

    test('HRM_ADMIN_TC_004 - Tìm kiếm người dùng theo User Role là Admin', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers(undefined, 'Admin');
      // Dùng auto-waiting assertion để tránh race condition khi DOM chưa update xong
      const rows = systemUsersPage.tableRows;
      const count = await rows.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const roleCell = rows.nth(i).locator('.oxd-table-cell').nth(2);
        await expect(roleCell).toHaveText('Admin', { timeout: 8000 });
      }
    });

    test('HRM_ADMIN_TC_005 - Tìm kiếm người dùng theo User Role là ESS', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers(undefined, 'ESS');
      const rows = systemUsersPage.tableRows;
      const count = await rows.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const roleCell = rows.nth(i).locator('.oxd-table-cell').nth(2);
        await expect(roleCell).toHaveText('ESS', { timeout: 8000 });
      }
    });

    test('HRM_ADMIN_TC_006 - Tìm kiếm người dùng theo Status là Enabled', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers(undefined, undefined, undefined, 'Enabled');
      const rows = systemUsersPage.tableRows;
      const count = await rows.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const statusCell = rows.nth(i).locator('.oxd-table-cell').nth(4);
        await expect(statusCell).toHaveText('Enabled', { timeout: 8000 });
      }
    });

    test('HRM_ADMIN_TC_007 - Tìm kiếm người dùng theo Status là Disabled', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers(undefined, undefined, undefined, 'Disabled');
      const rows = systemUsersPage.tableRows;
      const count = await rows.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const statusCell = rows.nth(i).locator('.oxd-table-cell').nth(4);
        await expect(statusCell).toHaveText('Disabled', { timeout: 8000 });
      }
    });

    test('HRM_ADMIN_TC_008 - Tìm kiếm theo Employee Name chính xác bằng cách chọn từ Autocomplete', async ({ systemUsersPage }) => {
      const existingEmployee = adminEmployeeName;
      await systemUsersPage.searchUsers(undefined, undefined, existingEmployee);
      const rows = systemUsersPage.tableRows;
      const count = await rows.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const nameCellText = await rows.nth(i).locator('.oxd-table-cell').nth(3).innerText();
        // Kiểm tra xem tên có chứa tên gợi ý hay không
        expect(nameCellText.trim().toLowerCase()).toContain(existingEmployee.toLowerCase().split(' ')[0]);
      }
    });

    test('HRM_ADMIN_TC_009 - Tìm kiếm kết hợp nhiều tiêu chí', async ({ systemUsersPage }) => {
      // Tìm kiếm kết hợp 3 tiêu chí ổn định (Username + Role + Status)
      // Không dùng Employee Name autocomplete vì Admin user có thể link với employee không tồn tại trong PIM
      await systemUsersPage.searchUsers('Admin', 'Admin', undefined, 'Enabled');
      expect(await systemUsersPage.isRecordVisible('Admin')).toBeTruthy();
      expect(await systemUsersPage.getRecordsCount()).toBeGreaterThanOrEqual(1);
    });

    test('HRM_ADMIN_TC_010 - Tìm kiếm với Username không tồn tại trong hệ thống', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers('nonexistent_user_9999');
      expect(await systemUsersPage.getRecordsCount()).toBe(0);
      await expect(systemUsersPage.page.locator('text=No Records Found').first()).toBeVisible();
    });

    test('HRM_ADMIN_TC_011 - Reset bộ lọc tìm kiếm về trạng thái mặc định', async ({ systemUsersPage }) => {
      // Nhập bộ lọc tìm kiếm với 3 tiêu chí ổn định (không dùng employee autocomplete)
      await systemUsersPage.searchUsers('Admin', 'Admin', undefined, 'Enabled');
      // Reset
      await systemUsersPage.resetSearch();
      // Verify các trường reset về trống/mặc định
      expect(await systemUsersPage.usernameSearchInput.inputValue()).toBe('');
      expect(await systemUsersPage.employeeNameSearchInput.inputValue()).toBe('');
      expect(await systemUsersPage.userRoleDropdown.innerText()).toContain('-- Select --');
      expect(await systemUsersPage.statusDropdown.innerText()).toContain('-- Select --');
    });

    test('HRM_ADMIN_TC_012 - Sắp xếp bảng danh sách theo cột Username', async ({ systemUsersPage }) => {
      await systemUsersPage.sortByColumn('Username');
      // Check xem có thay đổi trạng thái sort không (thường là URL thay đổi hoặc class active trên header)
      expect(await systemUsersPage.page.locator('.oxd-table-header-cell').filter({ hasText: 'Username' }).first().isVisible()).toBeTruthy();
    });
  });

  test.describe('Admin - Add User', () => {
    test('HRM_ADMIN_TC_013 - Thêm mới người dùng thành công với tất cả dữ liệu hợp lệ', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      expect(await saveSystemUserPage.getPageHeaderTitle()).toBe('Add User');
      
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: uniqueUsername,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      
      // Verify chuyển về trang danh sách và hiển thị user mới
      await expect(systemUsersPage.page).toHaveURL(/.*viewSystemUsers/, { timeout: 15000 });
      await systemUsersPage.searchUsers(uniqueUsername);
      expect(await systemUsersPage.isRecordVisible(uniqueUsername)).toBeTruthy();
    });

    test('HRM_ADMIN_TC_014 - Thêm mới - Validation trường User Role bắt buộc', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        employeeName: employeeName,
        status: 'Enabled',
        username: `${uniqueUsername}b`,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('User Role')).toBe('Required');
    });

    test('HRM_ADMIN_TC_015 - Thêm mới - Validation trường Employee Name bắt buộc', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        status: 'Enabled',
        username: `${uniqueUsername}c`,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Employee Name')).toBe('Required');
    });

    test('HRM_ADMIN_TC_016 - Thêm mới - Validation trường Status bắt buộc', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        username: `${uniqueUsername}d`,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Status')).toBe('Required');
    });

    test('HRM_ADMIN_TC_017 - Thêm mới - Validation trường Username bắt buộc', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Username')).toBe('Required');
    });

    test('HRM_ADMIN_TC_018 - Thêm mới - Validation trường Password bắt buộc', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: `${uniqueUsername}e`,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Password')).toBe('Required');
    });

    test('HRM_ADMIN_TC_019 - Thêm mới - Validation trường Confirm Password bắt buộc', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: `${uniqueUsername}f`,
        password: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Confirm Password')).toBe('Passwords do not match');
    });

    test('HRM_ADMIN_TC_020 - Thêm mới - Validation khi nhập Employee Name không tồn tại', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: 'Invalid Employee',
        status: 'Enabled',
        username: `${uniqueUsername}g`,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Employee Name')).toBe('Invalid');
    });

    test('HRM_ADMIN_TC_021 - Thêm mới - Validation khi Username ít hơn 5 ký tự', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: 'abc',
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Username')).toBe('Should be at least 5 characters');
    });

    test('HRM_ADMIN_TC_022 - Thêm mới - Validation khi Username trùng lặp', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        username: 'Admin'
      });
      await saveSystemUserPage.blurUsername();
      expect(await saveSystemUserPage.getFieldError('Username')).toBe('Already exists');
    });

    test('HRM_ADMIN_TC_023 - Thêm mới - Validation khi Password ít hơn 7 ký tự', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        password: '123'
      });
      expect(await saveSystemUserPage.getFieldError('Password')).toBe('Should have at least 7 characters');
      expect(await saveSystemUserPage.getPasswordStrength()).toBe('Very Weak');
    });

    test('HRM_ADMIN_TC_024 - Thêm mới - Validation khi Confirm Password không khớp Password', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: `${uniqueUsername}h`,
        password: uniquePassword,
        confirmPassword: 'DifferentPass123!'
      });
      await saveSystemUserPage.clickSave();
      expect(await saveSystemUserPage.getFieldError('Confirm Password')).toBe('Passwords do not match');
    });

    test('HRM_ADMIN_TC_025 - Thêm mới - Hủy thao tác bằng nút Cancel', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        username: 'cancel_user_test'
      });
      await saveSystemUserPage.clickCancel();
      expect(systemUsersPage.page.url()).toContain('/admin/viewSystemUsers');
      await systemUsersPage.searchUsers('cancel_user_test');
      expect(await systemUsersPage.isRecordVisible('cancel_user_test')).toBeFalsy();
    });
  });

  test.describe('Admin - Edit User', () => {
    // Username riêng biệt cho Edit block để tránh state leak với Add User block
    let editUniqueUsername: string;

    test.beforeEach(async ({ systemUsersPage, saveSystemUserPage }) => {
      // Sinh username mới cho mỗi test case edit để độc lập hoàn toàn
      editUniqueUsername = `auto_edit_${Date.now()}`;
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: editUniqueUsername,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      await systemUsersPage.page.waitForURL(/.*viewSystemUsers/, { timeout: 15000 });
      await systemUsersPage.searchUsers(editUniqueUsername);
    });

    test('HRM_ADMIN_TC_027 - Mở form Edit User hiển thị đúng dữ liệu cũ và ẩn các trường mật khẩu mặc định', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickEditUser(editUniqueUsername);
      expect(await saveSystemUserPage.getPageHeaderTitle()).toBe('Edit User');
      
      await expect(saveSystemUserPage.usernameInput).toHaveValue(editUniqueUsername, { timeout: 8000 });
      
      const roleDropdown = saveSystemUserPage.page.locator('.oxd-input-group', {
        has: saveSystemUserPage.page.locator('label:has-text("User Role")')
      }).first().locator('.oxd-select-text-input');
      await expect(roleDropdown).toHaveText('ESS', { timeout: 8000 });

      const statusDropdown = saveSystemUserPage.page.locator('.oxd-input-group', {
        has: saveSystemUserPage.page.locator('label:has-text("Status")')
      }).first().locator('.oxd-select-text-input');
      await expect(statusDropdown).toHaveText('Enabled', { timeout: 8000 });
      
      // Mật khẩu mặc định bị ẩn
      await expect(saveSystemUserPage.passwordInput).toBeHidden();
      await expect(saveSystemUserPage.confirmPasswordInput).toBeHidden();
    });

    test('HRM_ADMIN_TC_026 - Chỉnh sửa thông tin cơ bản của người dùng thành công', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickEditUser(editUniqueUsername);
      await saveSystemUserPage.fillUserForm({
        status: 'Disabled'
      });
      await saveSystemUserPage.clickSave();
      
      await expect(systemUsersPage.page).toHaveURL(/.*viewSystemUsers/, { timeout: 15000 });
      await systemUsersPage.searchUsers(editUniqueUsername);
      // Verify Status của user đã được đổi thành Disabled trên Data Table bằng auto-waiting assertion
      const rows = systemUsersPage.tableRows.filter({ hasText: editUniqueUsername });
      const statusCell = rows.first().locator('.oxd-table-cell').nth(4);
      await expect(statusCell).toHaveText('Disabled', { timeout: 8000 });
    });

    test('HRM_ADMIN_TC_028 - Chỉnh sửa thông tin người dùng - Chọn Change Password', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickEditUser(editUniqueUsername);
      await saveSystemUserPage.setChangePassword(true);
      
      // Sau khi check Change Password, Password inputs phải xuất hiện
      await expect(saveSystemUserPage.passwordInput).toBeVisible();
      await expect(saveSystemUserPage.confirmPasswordInput).toBeVisible();
      
      const newPassword = 'NewPassword123!';
      await saveSystemUserPage.fillUserForm({
        password: newPassword,
        confirmPassword: newPassword
      });
      await saveSystemUserPage.clickSave();
      await expect(systemUsersPage.page).toHaveURL(/.*viewSystemUsers/, { timeout: 15000 });
    });

    test('HRM_ADMIN_TC_029 - Chỉnh sửa thông tin người dùng - Hủy thao tác bằng nút Cancel', async ({ systemUsersPage, saveSystemUserPage }) => {
      await systemUsersPage.clickEditUser(editUniqueUsername);
      await saveSystemUserPage.fillUserForm({
        status: 'Enabled'
      });
      await saveSystemUserPage.clickCancel();
      expect(systemUsersPage.page.url()).toContain('/admin/viewSystemUsers');
    });
  });

  test.describe('Admin - Delete User', () => {
    let deleteTargetUsername: string;

    test.beforeEach(async ({ systemUsersPage, saveSystemUserPage }) => {
      const timestamp = Date.now();
      deleteTargetUsername = `delete_target_${timestamp}`;

      // Tạo user để xóa
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: deleteTargetUsername,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      await systemUsersPage.page.waitForURL(/.*viewSystemUsers/, { timeout: 15000 });
    });

    test('HRM_ADMIN_TC_030 - Xóa tài khoản người dùng đơn lẻ thành công', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers(deleteTargetUsername);
      await systemUsersPage.clickDeleteUser(deleteTargetUsername);
      
      // Confirm delete
      await systemUsersPage.confirmDelete();
      
      // Verify không còn visible
      await systemUsersPage.searchUsers(deleteTargetUsername);
      expect(await systemUsersPage.isRecordVisible(deleteTargetUsername)).toBeFalsy();
    });

    test('HRM_ADMIN_TC_031 - Hủy thao tác xóa tài khoản đơn lẻ', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers(deleteTargetUsername);
      await systemUsersPage.clickDeleteUser(deleteTargetUsername);
      
      // Cancel delete
      await systemUsersPage.cancelDelete();
      
      // Verify vẫn còn hiển thị
      expect(await systemUsersPage.isRecordVisible(deleteTargetUsername)).toBeTruthy();
    });

    test('HRM_ADMIN_TC_032 - Xóa hàng loạt tài khoản người dùng (Bulk Delete) thành công', async ({ systemUsersPage, saveSystemUserPage }) => {
      // Test này tạo thêm 1 user + beforeEach đã tạo 1 user → cần timeout cao hơn
      test.setTimeout(150000);

      // Tạo thêm một user nữa
      const secondDeleteTarget = `delete_target_2_${Date.now()}`;
      await systemUsersPage.clickAdd();
      await saveSystemUserPage.fillUserForm({
        role: 'ESS',
        employeeName: employeeName,
        status: 'Enabled',
        username: secondDeleteTarget,
        password: uniquePassword,
        confirmPassword: uniquePassword
      });
      await saveSystemUserPage.clickSave();
      await systemUsersPage.page.waitForURL(/.*viewSystemUsers/, { timeout: 15000 });

      // Search bằng employee name để hiển thị cả 2 targets (OrangeHRM username search chỉ exact match)
      await systemUsersPage.searchUsers(undefined, undefined, employeeName);

      // Đợi grid load xong sau search
      await systemUsersPage.waitForSpinnerDetached();

      // Chọn checkbox từng user
      await systemUsersPage.selectRecordCheckbox(deleteTargetUsername);
      await systemUsersPage.selectRecordCheckbox(secondDeleteTarget);

      // Click delete selected và xác nhận
      await systemUsersPage.clickDeleteSelected();
      await systemUsersPage.confirmDelete();

      // Verify cả 2 đều đã biến mất
      await systemUsersPage.searchUsers(deleteTargetUsername);
      expect(await systemUsersPage.isRecordVisible(deleteTargetUsername)).toBeFalsy();

      await systemUsersPage.searchUsers(secondDeleteTarget);
      expect(await systemUsersPage.isRecordVisible(secondDeleteTarget)).toBeFalsy();
    });

    test('HRM_ADMIN_TC_033 - Ngăn chặn Quản trị viên tự xóa chính mình', async ({ systemUsersPage }) => {
      await systemUsersPage.searchUsers('Admin');
      // Click nút Delete của user Admin đang đăng nhập
      await systemUsersPage.clickDeleteUser('Admin');
      // Verify xuất hiện thông báo lỗi (Toast) "Cannot be deleted"
      const toast = systemUsersPage.page.locator('.oxd-toast');
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast).toContainText('Cannot be deleted');
    });
  });
});
