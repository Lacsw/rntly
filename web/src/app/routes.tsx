import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../shared/layouts/MainLayout';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const PropertiesPage = lazy(() => import('../pages/PropertiesPage'));
const TenantsPage = lazy(() => import('../pages/TenantsPage'));
const LeasesPage = lazy(() => import('../pages/LeasesPage'));
const ContractsPage = lazy(() => import('../pages/ContractsPage'));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

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
