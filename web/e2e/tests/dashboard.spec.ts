import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Dashboard', () => {
  test('renders stat tiles, sidebar links, and Add Property CTA', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.statTile('Total Revenue')).toBeVisible();
    await expect(dashboard.statTile('Properties')).toBeVisible();
    await expect(dashboard.statTile('Total Tenants')).toBeVisible();
    await expect(dashboard.statTile('Occupancy Rate')).toBeVisible();

    await expect(dashboard.yourPropertiesSection()).toBeVisible();
    await expect(dashboard.recentLeasesSection()).toBeVisible();

    await expect(dashboard.sidebarLink('Dashboard')).toBeVisible();
    await expect(dashboard.sidebarLink('Properties')).toBeVisible();
    await expect(dashboard.sidebarLink('Tenants')).toBeVisible();
    await expect(dashboard.sidebarLink('Leases')).toBeVisible();
    await expect(dashboard.sidebarLink('Contracts')).toBeVisible();

    await dashboard.addPropertyLink().click();
    await expect(page).toHaveURL(/\/properties$/);
  });
});
