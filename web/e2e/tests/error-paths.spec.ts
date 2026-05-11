import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { PropertiesPage } from '../pages/PropertiesPage';
import { createProperty, deleteProperty } from '../fixtures/seed';

test.describe('Error paths', () => {
  test.describe('Forced 500 on list fetch', () => {
    test('properties list shows error banner when API returns 500', async ({ page }) => {
      const base = new BasePage(page);
      await base.mockApiError('/properties', 500);
      await page.goto('/properties');
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible();
    });

    test('tenants list shows error banner when API returns 500', async ({ page }) => {
      const base = new BasePage(page);
      await base.mockApiError('/tenants', 500);
      await page.goto('/tenants');
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Tenants', exact: true })).toBeVisible();
    });
  });

  test.describe('Invalid create input', () => {
    test('property form shows inline errors on submit with empty required fields', async ({
      page,
    }) => {
      const properties = new PropertiesPage(page);
      await properties.goto();
      await properties.addPropertyButton().click();
      const dialog = page.getByRole('dialog', { name: 'Add New Property' });
      await dialog.waitFor();

      await dialog.getByRole('button', { name: 'Add Property' }).click();

      await expect(dialog.getByText('Address is required')).toBeVisible();
      await expect(dialog.getByText('Rent must be greater than 0')).toBeVisible();
      await expect(dialog).toBeVisible();
    });
  });

  test.describe('Optimistic delete revert', () => {
    let propertyId: string;
    let propertyAddress: string;

    test.beforeAll(async () => {
      const seeded = await createProperty({ address: `QA-del-${Date.now()}` });
      propertyId = seeded.id;
      propertyAddress = seeded.address;
    });

    test.afterAll(async () => {
      await deleteProperty(propertyId);
    });

    test('property reappears and error toast fires when delete API returns 500', async ({
      page,
    }) => {
      const properties = new PropertiesPage(page);
      await properties.goto();
      await expect(properties.cardLinkByAddress(propertyAddress)).toBeVisible();

      await page.route(`**/properties/${propertyId}`, (route) => {
        if (route.request().method() === 'DELETE') {
          return route.fulfill({ status: 500, body: JSON.stringify({ error: 'server error' }) });
        }
        return route.continue();
      });

      await properties.deletePropertyByAddress(propertyAddress);

      await expect(properties.cardLinkByAddress(propertyAddress)).toBeVisible();
      await expect(page.getByText('Failed to delete property')).toBeVisible();
    });
  });
});
