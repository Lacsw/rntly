import { BasePage } from './BasePage';

export class TenantsPage extends BasePage {
  async goto() {
    await this.page.goto('/tenants');
    await this.heading('Tenants').waitFor();
  }

  addTenantButton() {
    return this.button('Add Tenant');
  }

  tenantCard(firstName: string, lastName: string) {
    return this.page.getByRole('article').filter({ hasText: `${firstName} ${lastName}` });
  }

  async openAddDialog() {
    await this.addTenantButton().click();
    const dialog = this.page.getByRole('dialog', { name: 'Add New Tenant' });
    await dialog.waitFor();
    return dialog;
  }
}
