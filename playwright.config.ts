import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    // Built-in HTML report
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    // Allure report — full detail, attach everything
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      // Attach screenshots & videos automatically via Playwright testInfo
      environmentInfo: {
        Framework:   'Playwright',
        Language:    'TypeScript',
        BaseURL:     process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
        Environment: process.env.CI ? 'CI/GitHub Actions' : 'Local',
        NodeVersion: process.version,
      },
    }],
    // Concise console output
    ['list'],
  ],

  use: {
    baseURL:           process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    // Capture trace on first retry for debugging
    trace:             'on-first-retry',
    // Screenshot on failure (Allure also picks this up)
    screenshot:        'only-on-failure',
    // Always record video — attached to Allure report
    video:             'on',
    viewport:          { width: 1280, height: 720 },
    actionTimeout:     25000,
    navigationTimeout: 45000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
