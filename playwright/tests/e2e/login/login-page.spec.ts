import { test, expect } from '@demo/test';
import { LoginPage, HomePage } from '@pages';

test.use({ storageState: { cookies: [], origins: [] } });

test('TD-5: User can navigate to app base page @smoke', async({ page }) => {
  await page.goto('/');

  expect(page).toHaveURL("http://localhost:3000");
});

// TDD - Not implemented
test.skip('TD-4: (POM) User with valid credentials can log in @smoke', async({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.visit();

  if (!process.env.PASSWORD) throw new Error ("password environment variable was not set.");
  
  await loginPage.loginAsUser('bob@example.com', process.env.PASSWORD);
  const homePage = new HomePage(page);
  expect(page, "Home page did not have expected url").toHaveURL(homePage.getUrl());
});
