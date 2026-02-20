import { Routes, Route } from 'react-router-dom';
import MainLayout from '../shared/layouts/MainLayout';
import { DashboardPage } from '../domains/dashboard';
import { PropertiesPage } from '../domains/properties';
import { TenantsPage } from '../domains/tenants';
import { LeasesPage } from '../domains/leases';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/leases" element={<LeasesPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
