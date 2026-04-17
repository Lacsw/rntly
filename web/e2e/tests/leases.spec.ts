import { test, expect } from '@playwright/test';
import { LeasesPage } from '../pages/LeasesPage';
import {
  createProperty,
  createTenant,
  deleteLease,
  deleteProperty,
  deleteTenant,
  type TSeededProperty,
  type TSeededTenant,
} from '../fixtures/seed';
import { apiClient } from '../fixtures/api';

test.describe('Leases golden path', () => {
  let property: TSeededProperty;
  let tenant: TSeededTenant;
  const createdLeaseIds: string[] = [];

  test.beforeAll(async () => {
    property = await createProperty({
      address: `QA-${Math.random().toString(36).slice(2, 7)}`,
      rent_amount: 1500,
    });
    tenant = await createTenant();
  });

  test.afterAll(async () => {
    while (createdLeaseIds.length) {
      const id = createdLeaseIds.pop();
      if (id) await deleteLease(id);
    }
    await deleteTenant(tenant.id);
    await deleteProperty(property.id);
  });

  test('date validation blocks submit when end is before start', async ({ page }) => {
    const leases = new LeasesPage(page);
    await leases.goto();
    const dialog = await leases.openCreateDialog();

    await dialog.getByLabel('Property').selectOption(property.id);
    await dialog.getByLabel('Tenant').selectOption(tenant.id);
    await dialog.getByLabel('Start Date').fill('2026-06-01');
    await dialog.getByLabel('End Date').fill('2026-05-01');
    await dialog.getByLabel('Monthly Rent').fill('1500');

    await expect(dialog.getByText('End date must be after start date')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create Lease' })).toBeDisabled();

    await dialog.getByLabel('End Date').fill('2027-06-01');
    await expect(dialog.getByRole('button', { name: 'Create Lease' })).toBeEnabled();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });

  test('create lease → appears on list, dashboard, and enriches tenant card', async ({
    page,
    request,
  }) => {
    const leases = new LeasesPage(page);
    await leases.goto();
    const dialog = await leases.openCreateDialog();

    await dialog.getByLabel('Property').selectOption(property.id);
    await dialog.getByLabel('Tenant').selectOption(tenant.id);
    await dialog.getByLabel('Start Date').fill('2026-01-01');
    await dialog.getByLabel('End Date').fill('2027-12-31');
    await dialog.getByLabel('Monthly Rent').fill('1500');
    await dialog.getByLabel('Deposit').fill('1500');
    await dialog.getByRole('button', { name: 'Create Lease' }).click();
    await expect(dialog).toBeHidden();

    const { data: allLeases } = await apiClient.get<Array<{ id: string; property_id: string; tenant_id: string }>>('/leases');
    const created = allLeases.find(
      (l) => l.property_id === property.id && l.tenant_id === tenant.id,
    );
    expect(created).toBeDefined();
    if (created) createdLeaseIds.push(created.id);

    await expect
      .poll(async () => (await page.content()).includes(property.address))
      .toBe(true);

    await page.goto('/tenants');
    await expect
      .poll(async () => (await page.content()).includes(property.address))
      .toBe(true);

    await page.goto('/');
    await expect
      .poll(async () => (await page.content()).includes(property.address))
      .toBe(true);

    const propertyCheck = await request.get(`http://localhost:8080/properties/${property.id}`);
    expect(propertyCheck.status()).toBe(200);
  });
});
