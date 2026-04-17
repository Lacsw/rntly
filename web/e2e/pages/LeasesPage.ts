import { BasePage } from './BasePage';

export class LeasesPage extends BasePage {
  async goto() {
    await this.page.goto('/leases');
    await this.heading('Leases').waitFor();
  }

  createLeaseButton() {
    return this.button('Create Lease');
  }

  leaseCardWith(text: string | RegExp) {
    return this.page.getByRole('article').filter({ hasText: text });
  }

  async openCreateDialog() {
    await this.createLeaseButton().click();
    const dialog = this.page.getByRole('dialog', { name: 'Create New Lease' });
    await dialog.waitFor();
    return dialog;
  }
}
