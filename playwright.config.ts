import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: `.env` });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? 'dot' : [['list'], ['html']],
  use: {
    testIdAttribute: 'data-e2e',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
    // baseURL: 'http://127.0.0.1:3000',
    screenshot: 'only-on-failure',

  },

  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // storageState: path.join(__dirname, '.auth/default-user.json'), 
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
