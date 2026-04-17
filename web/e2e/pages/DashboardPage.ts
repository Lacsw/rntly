import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async goto() {
    await this.page.goto('/');
    await this.heading('Dashboard').waitFor();
  }

  statTile(label: string) {
    return this.page.getByText(label, { exact: true });
  }

  yourPropertiesSection() {
    return this.page.getByRole('heading', { name: 'Your Properties' });
  }

  recentLeasesSection() {
    return this.page.getByRole('heading', { name: 'Recent Leases' });
  }

  recentLeasesRowWith(text: string | RegExp) {
    return this.page.getByRole('row').filter({ hasText: text });
  }

  addPropertyLink() {
    return this.link('Add Property');
  }

  sidebarLink(name: string) {
    return this.page.getByRole('navigation').getByRole('link', { name });
  }
}
