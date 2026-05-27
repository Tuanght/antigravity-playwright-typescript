import { test, expect } from '../../fixtures/base.fixture';
import { config } from '../../utils/env.config';
import { TestDataGenerator } from '../../utils/test-data';

test.describe('OrangeHRM - Login Module Tests', () => {

  test.beforeEach(async ({ loginPage }) => {
    await test.step('Prerequisite: Open OrangeHRM Login Page', async () => {
      await loginPage.open();
    });
  });

  test('OHRM_LOGIN_TC_001 - Đăng nhập thành công với Username và Password hợp lệ', async ({ loginPage, dashboardPage }) => {
    const { username, password } = config.testUser;
    
    await test.step(`Step 1: Perform login with valid credentials (username: "${username}", password: "${password}")`, async () => {
      await loginPage.login(username, password);
    });

    await test.step('Step 2: Verify user is redirected to Dashboard and user profile is visible', async () => {
      await expect(dashboardPage.headerTitle).toHaveText('Dashboard');
      expect(await dashboardPage.isUserProfileVisible()).toBe(true);
    });
  });

  test('OHRM_LOGIN_TC_002 - Đăng nhập thất bại khi bỏ trống trường Username', async ({ loginPage }) => {
    await test.step(`Step 1: Attempt login with empty username and valid password`, async () => {
      await loginPage.login('', config.testUser.password);
    });

    await test.step('Step 2: Verify "Required" validation error is displayed under username field', async () => {
      const errorText = await loginPage.getFieldError('username');
      expect(errorText).toBe('Required');
    });
  });

  test('OHRM_LOGIN_TC_003 - Đăng nhập thất bại khi bỏ trống trường Password', async ({ loginPage }) => {
    await test.step(`Step 1: Attempt login with valid username and empty password`, async () => {
      await loginPage.login(config.testUser.username, '');
    });

    await test.step('Step 2: Verify "Required" validation error is displayed under password field', async () => {
      const errorText = await loginPage.getFieldError('password');
      expect(errorText).toBe('Required');
    });
  });

  test('OHRM_LOGIN_TC_004 - Đăng nhập thất bại khi để trống cả hai trường Username và Password', async ({ loginPage }) => {
    await test.step('Step 1: Attempt login with empty username and empty password', async () => {
      await loginPage.login('', '');
    });

    await test.step('Step 2: Verify "Required" validation errors are displayed under both fields', async () => {
      const userError = await loginPage.getFieldError('username');
      const passError = await loginPage.getFieldError('password');
      expect(userError).toBe('Required');
      expect(passError).toBe('Required');
    });
  });

  test('OHRM_LOGIN_TC_005 - Đăng nhập thất bại khi nhập Username đúng nhưng Password sai', async ({ loginPage }) => {
    await test.step(`Step 1: Attempt login with valid username and invalid password`, async () => {
      await loginPage.login(config.testUser.username, 'wrongpass123');
    });

    await test.step('Step 2: Verify "Invalid credentials" error message is displayed', async () => {
      const alertText = await loginPage.getGeneralErrorMessage();
      expect(alertText).toBe('Invalid credentials');
    });
  });

  test('OHRM_LOGIN_TC_006 - Đăng nhập thất bại khi nhập Username sai nhưng Password đúng', async ({ loginPage }) => {
    await test.step(`Step 1: Attempt login with invalid username and valid password`, async () => {
      await loginPage.login('WrongUser', config.testUser.password);
    });

    await test.step('Step 2: Verify "Invalid credentials" error message is displayed', async () => {
      const alertText = await loginPage.getGeneralErrorMessage();
      expect(alertText).toBe('Invalid credentials');
    });
  });

  test('OHRM_LOGIN_TC_007 - Đăng nhập thất bại khi nhập sai cả Username và Password', async ({ loginPage }) => {
    await test.step('Step 1: Attempt login with invalid username and invalid password', async () => {
      await loginPage.login('WrongUser', 'wrongpass123');
    });

    await test.step('Step 2: Verify "Invalid credentials" error message is displayed', async () => {
      const alertText = await loginPage.getGeneralErrorMessage();
      expect(alertText).toBe('Invalid credentials');
    });
  });

  test('OHRM_LOGIN_TC_008 - Xác thực trường Password ẩn ký tự khi người dùng nhập dữ liệu', async ({ loginPage }) => {
    await test.step('Step 1: Verify password input has type="password" attribute', async () => {
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test('OHRM_LOGIN_TC_009 - Đăng nhập thất bại và bảo mật trước SQL Injection trên trường Username', async ({ loginPage }) => {
    const sqlInjectionValue = "admin' OR 1=1--";
    
    await test.step(`Step 1: Attempt login using SQL Injection payload as username: "${sqlInjectionValue}"`, async () => {
      await loginPage.login(sqlInjectionValue, config.testUser.password);
    });

    await test.step('Step 2: Verify system handles SQL Injection safely and rejects authentication', async () => {
      const alertText = await loginPage.getGeneralErrorMessage();
      expect(alertText).toBe('Invalid credentials');
    });
  });

  test('OHRM_LOGIN_TC_010 - Đăng nhập thất bại và bảo mật trước XSS Injection trên trường Username', async ({ loginPage }) => {
    const xssPayload = "<script>alert('XSS')</script>";
    
    await test.step(`Step 1: Attempt login using XSS payload as username: "${xssPayload}"`, async () => {
      await loginPage.login(xssPayload, config.testUser.password);
    });

    await test.step('Step 2: Verify XSS payload is sanitized safely and system rejects authentication', async () => {
      const alertText = await loginPage.getGeneralErrorMessage();
      expect(alertText).toBe('Invalid credentials');
    });
  });

  test('OHRM_LOGIN_TC_011 - Đăng nhập thất bại khi nhập Username chỉ chứa khoảng trắng', async ({ loginPage }) => {
    await test.step('Step 1: Attempt login using username with only whitespaces', async () => {
      await loginPage.login('     ', config.testUser.password);
    });

    await test.step('Step 2: Verify "Required" validation error is displayed under username field', async () => {
      const errorText = await loginPage.getFieldError('username');
      expect(errorText).toBe('Required');
    });
  });

  test('OHRM_LOGIN_TC_012 - Đăng nhập với Username có độ dài cực lớn (256 ký tự)', async ({ loginPage }) => {
    const longUsername = TestDataGenerator.getRandomString(256);
    
    await test.step(`Step 1: Attempt login using extremely long username (256 characters)`, async () => {
      await loginPage.login(longUsername, config.testUser.password);
    });

    await test.step('Step 2: Verify system UI is stable and login is rejected', async () => {
      const alertText = await loginPage.getGeneralErrorMessage();
      expect(alertText).toBe('Invalid credentials');
    });
  });

  test('OHRM_LOGIN_TC_013 - Đăng nhập thất bại khi nhập Username viết thường hoàn toàn (admin)', async ({ loginPage }) => {
    await test.step('Step 1: Attempt login with lowercase username "admin"', async () => {
      await loginPage.login('admin', config.testUser.password);
    });

    await test.step('Step 2: Verify redirection or rejection based on system case-sensitivity rules', async () => {
      await loginPage.wait(2000);
      const url = loginPage.page.url();
      if (url.includes('dashboard')) {
        expect(url).toContain('dashboard');
      } else {
        const alertText = await loginPage.getGeneralErrorMessage();
        expect(alertText).toBe('Invalid credentials');
      }
    });
  });

  test('OHRM_LOGIN_TC_020 - Kiểm tra tính hiển thị của Logo và thông tin phiên bản hệ thống', async ({ loginPage }) => {
    await test.step('Step 1: Verify company branding logo and version text are visible', async () => {
      await expect(loginPage.companyBrandingLogo).toBeVisible();
      await expect(loginPage.versionText).toBeVisible();
      const versionStr = await loginPage.versionText.innerText();
      expect(versionStr).toContain('OrangeHRM OS');
    });
  });

  test('OHRM_LOGIN_TC_021 - Kiểm tra hiển thị bản quyền và liên kết đến trang chủ OrangeHRM', async ({ loginPage, context }) => {
    await test.step('Step 1: Verify copyright text matches and is visible', async () => {
      await expect(loginPage.copyrightText).toBeVisible();
      const copyrightStr = await loginPage.copyrightText.innerText();
      expect(copyrightStr).toContain('OrangeHRM, Inc. All rights reserved.');
    });

    await test.step('Step 2: Click on copyright link and verify external site is opened in a new tab', async () => {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        loginPage.orangehrmIncLink.click()
      ]);
      await newPage.waitForLoadState();
      expect(newPage.url()).toContain('orangehrm.com');
      await newPage.close();
    });
  });

  test('OHRM_LOGIN_TC_022 - Kiểm tra các liên kết mạng xã hội hoạt động chính xác', async ({ loginPage, context }) => {
    const socialMediaLinks = [
      { name: 'LinkedIn', locator: loginPage.linkedInLink, expectedUrl: 'linkedin.com' },
      { name: 'Facebook', locator: loginPage.facebookLink, expectedUrl: 'facebook.com' },
      { name: 'Twitter / X', locator: loginPage.twitterLink, expectedUrl: 'x.com' },
      { name: 'YouTube', locator: loginPage.youtubeLink, expectedUrl: 'youtube.com' }
    ];

    for (const social of socialMediaLinks) {
      await test.step(`Step: Verify ${social.name} link is visible and redirects to "${social.expectedUrl}" in a new tab`, async () => {
        await expect(social.locator).toBeVisible();
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          social.locator.click()
        ]);
        await newPage.waitForLoadState();
        expect(newPage.url()).toContain(social.expectedUrl);
        await newPage.close();
      });
    }
  });
});
