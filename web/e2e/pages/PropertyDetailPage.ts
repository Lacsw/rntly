import { BasePage } from './BasePage';

export class PropertyDetailPage extends BasePage {
  async goto(id: string, tab?: string) {
    const path = tab ? `/properties/${id}?tab=${tab}` : `/properties/${id}`;
    await this.page.goto(path);
  }

  title() {
    return this.page.getByRole('heading').first();
  }

  tab(name: string) {
    return this.page.getByRole('tab', { name });
  }

  editButton() {
    return this.button('Edit');
  }

  deleteButton() {
    return this.button('Delete property');
  }

  backLink() {
    return this.link('Back');
  }

  async openEditDialog() {
    await this.editButton().click();
    const dialog = this.page.getByRole('dialog', { name: 'Edit Property' });
    await dialog.waitFor();
    return dialog;
  }
}
