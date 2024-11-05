import { Locator, Page } from '@playwright/test';

export class HomePage { 
  readonly url: string;
  readonly page: Page;
  readonly homeBtn : Locator

  constructor(page: Page) {
    this.page = page;
    this.url = `${process.env.BASE_URL}`;
    this.homeBtn = page.getByRole('button', {'name': "Home"});
  }

  getUrl(): string {
    return this.url;
  }

  async visit(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState();
    await this.homeBtn.waitFor();
  }
}
