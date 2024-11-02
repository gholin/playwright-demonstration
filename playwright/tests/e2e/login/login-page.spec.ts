import { test, expect } from '@demo/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('XX-11203: User can navigate to app base page @smoke', async({ page }) => {
  await page.goto('/');

  expect(page).toHaveURL("http://localhost:3000");
});
