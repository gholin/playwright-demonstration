import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

export default defineConfig({
  testDir: './tests',
  outputDir: './screenshots',
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
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',

  },
  // globalSetup: require.resolve('./global.setup.ts'),
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
  webServer: {
    command: 'npm run start',
    url: process.env.BASE_URL,
    cwd: '../app',
    timeout: 20_000,
    reuseExistingServer: !process.env.CI,
  },
});
