import type { Page } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  heading(name: string | RegExp) {
    return this.page.getByRole('heading', { name });
  }

  dialog(name: string | RegExp) {
    return this.page.getByRole('dialog', { name });
  }

  button(name: string | RegExp) {
    return this.page.getByRole('button', { name });
  }

  link(name: string | RegExp) {
    return this.page.getByRole('link', { name });
  }
}
