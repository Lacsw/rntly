import { test, expect } from '@playwright/test';
import { TenantsPage } from '../pages/TenantsPage';
import { deleteTenant } from '../fixtures/seed';

test.describe('Tenants golden path', () => {
  const createdIds: string[] = [];

  test.afterEach(async () => {
    while (createdIds.length) {
      const id = createdIds.pop();
      if (id) await deleteTenant(id);
    }
  });

  test('email validation blocks submit until fixed', async ({ page }) => {
    const tenants = new TenantsPage(page);
    await tenants.goto();
    const dialog = await tenants.openAddDialog();

    await dialog.getByLabel('First Name').fill('Jane');
    await dialog.getByLabel('Last Name').fill('Doe');
    await dialog.getByLabel('Phone').fill('5551234567');
    await dialog.getByLabel('Email').fill('not-an-email');

    await expect(dialog.getByText('Enter a valid email address')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Add Tenant' })).toBeDisabled();

    await dialog.getByLabel('Email').fill('jane.doe@example.com');
    await expect(dialog.getByRole('button', { name: 'Add Tenant' })).toBeEnabled();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });

  test('creates a tenant and shows the card', async ({ page, request }) => {
    const tenants = new TenantsPage(page);
    await tenants.goto();
    const dialog = await tenants.openAddDialog();

    const suffix = `${Date.now()}`;
    const firstName = 'QA';
    const lastName = `Tenant${suffix}`;
    const email = `qa-${suffix}@example.com`;

    await dialog.getByLabel('First Name').fill(firstName);
    await dialog.getByLabel('Last Name').fill(lastName);
    await dialog.getByLabel('Email').fill(email);
    await dialog.getByLabel('Phone').fill('5551234567');
    await dialog.getByRole('button', { name: 'Add Tenant' }).click();
    await expect(dialog).toBeHidden();

    await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible();

    const list = await request.get('http://localhost:8080/tenants');
    const all = (await list.json()) as Array<{ id: string; email: string }>;
    const created = all.find((t) => t.email === email);
    expect(created).toBeDefined();
    if (created) createdIds.push(created.id);
  });
});
