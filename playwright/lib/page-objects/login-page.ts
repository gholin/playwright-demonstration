import { Page } from '@playwright/test';

export class LoginPage { 
  readonly url: string;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.url = `${process.env.BASE_URL}`;
  }

  async visit(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState();
  }

  async loginAsUser(username: string, password: string): Promise<void> {
    await this.page.getByTestId('usernameInput').fill(username);
    await this.page.getByTestId('passwordInput').fill(password);
    await this.page.getByRole("button", {name: 'Sign In'}).click();
  }
}