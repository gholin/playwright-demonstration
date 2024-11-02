import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage { 
  readonly url: string;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.url = `${process.env.BASE_URL}`;
  }

  async visit() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState();
  }

}