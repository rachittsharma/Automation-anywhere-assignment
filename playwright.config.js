import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 120000, // 2 minutes, since Control Room load times can be slow
  expect: {
    timeout: 15000,
  },
  fullyParallel: false, // Run sequentially to avoid login/session clashes on the same account
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid concurrency session issues
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://community.cloud.automationanywhere.digital',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 20000,
    navigationTimeout: 45000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
