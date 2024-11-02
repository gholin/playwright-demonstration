import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DEFAULT_USER_AUTH } from '@constants/general-constants';

/**
 * Support local .env files. Read environment variables from .env file, if it exists.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: `.env` });

export default defineConfig({
  testDir: './tests',
  outputDir: './screenshots',
  // Each file is a worker if fullyParallel is false
  fullyParallel: true,
  forbidOnly: !!process.env.IS_TESTERY,
  /* Retry on CI only */
  retries: process.env.IS_TESTERY ? 0 : 2,
  workers: process.env.IS_TESTERY ? 4 : 8,
  /* local report list and html, CI is minimal dot. */
  reporter: process.env.CI ? 'dot' : [['list'], ['html']],
  timeout: 600_000,
  use: {
    testIdAttribute: 'data-e2e',
    trace: 'retain-on-failure',
    actionTimeout: 40_000,
    navigationTimeout: 40_000,
    screenshot: 'only-on-failure'
  },
  expect: {
    timeout: 5000,
  },
  // global setups
  globalSetup: require.resolve('./global.setup.ts'),
  globalTeardown: require.resolve('./global.teardown.ts'),
  projects: [
    {
      name: 'Setup',
      testMatch: /setup\.ts/,
    },
    {
      name: 'Chrome Test',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1920, height: 1080 },
        storageState: path.join(__dirname, DEFAULT_USER_AUTH),
      },
      dependencies: ['Setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:9000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
