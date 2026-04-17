import { BasePage } from './BasePage';

export class PropertiesPage extends BasePage {
  async goto() {
    await this.page.goto('/properties');
    await this.heading('Properties').waitFor();
  }

  addPropertyButton() {
    return this.button('Add Property');
  }

  cardLinkByAddress(address: string) {
    return this.page.getByRole('link').filter({ hasText: address });
  }

  async createProperty(input: { address: string; rent: number; bedrooms?: number }) {
    await this.addPropertyButton().click();
    const dialog = this.page.getByRole('dialog', { name: 'Add New Property' });
    await dialog.waitFor();
    await dialog.getByLabel('Address').fill(input.address);
    if (input.bedrooms !== undefined) {
      await dialog.getByLabel('Bedrooms').fill(String(input.bedrooms));
    }
    await dialog.getByLabel('Rent').fill(String(input.rent));
    await dialog.getByRole('button', { name: 'Add Property' }).click();
    await dialog.waitFor({ state: 'detached' });
  }

  async deletePropertyByAddress(address: string) {
    const card = this.cardLinkByAddress(address);
    const actionsButton = card.locator('..').getByRole('button', { name: 'Property actions' });
    await actionsButton.click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    const confirm = this.page.getByRole('dialog', { name: 'Delete property' });
    await confirm.waitFor();
    await confirm.getByRole('button', { name: 'Delete' }).click();
    await confirm.waitFor({ state: 'detached' });
  }
}
