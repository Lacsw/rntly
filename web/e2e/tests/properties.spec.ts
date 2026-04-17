import { test, expect } from '@playwright/test';
import { PropertiesPage } from '../pages/PropertiesPage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import { deleteProperty } from '../fixtures/seed';

const qaAddress = () => `QA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

test.describe('Properties golden path', () => {
  const createdIds: string[] = [];

  test.afterEach(async () => {
    while (createdIds.length) {
      const id = createdIds.pop();
      if (id) await deleteProperty(id);
    }
  });

  test('create → list → detail → tabs → delete', async ({ page, request }) => {
    const address = qaAddress();
    const properties = new PropertiesPage(page);
    await properties.goto();
    await properties.createProperty({ address, rent: 1600, bedrooms: 2 });

    await expect(properties.cardLinkByAddress(address)).toBeVisible();

    const list = await request.get('http://localhost:8080/properties');
    const all = (await list.json()) as Array<{ id: string; address: string }>;
    const created = all.find((p) => p.address === address);
    expect(created).toBeDefined();
    if (created) createdIds.push(created.id);
    const propertyId = created!.id;

    const detail = new PropertyDetailPage(page);
    await detail.goto(propertyId);
    await page.getByRole('tablist').waitFor();
    await expect(detail.title()).toHaveText(address);

    for (const label of ['Overview', 'Tenant', 'Contracts', 'Financials', 'Maintenance']) {
      await page.getByRole('tab', { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`\\?tab=${label.toLowerCase()}`));
      await expect(page.getByRole('tab', { name: label })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    }

    await page.goto('/properties');
    await expect(properties.cardLinkByAddress(address)).toBeVisible();
  });

  test('404 renders empty state for missing property', async ({ page }) => {
    await page.goto('/properties/does-not-exist');
    await expect(page.getByRole('heading', { name: 'Property not found' })).toBeVisible();
  });
});
