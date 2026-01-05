import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <h2>rntly</h2>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/properties">Properties</NavLink>
          <NavLink to="/tenants">Tenants</NavLink>
          <NavLink to="/leases">Leases</NavLink>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/leases" element={<Leases />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;