import { Routes, Route } from 'react-router-dom';
import MainLayout from '../shared/layouts/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PropertiesPage } from '../pages/PropertiesPage';
import { TenantsPage } from '../pages/TenantsPage';
import { LeasesPage } from '../pages/LeasesPage';
import { ContractsPage } from '../pages/ContractsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/leases" element={<LeasesPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
