import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <nav className="w-52 bg-slate-900 p-5 flex flex-col gap-2">
          <h2 className="text-white text-xl font-bold mb-5">rntly</h2>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-slate-300 no-underline p-2 rounded ${isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/properties"
            className={({ isActive }) => 
              `text-slate-300 no-underline p-2 rounded ${isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`
            }
          >
            Properties
          </NavLink>
          <NavLink 
            to="/tenants"
            className={({ isActive }) => 
              `text-slate-300 no-underline p-2 rounded ${isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`
            }
          >
            Tenants
          </NavLink>
          <NavLink 
            to="/leases"
            className={({ isActive }) => 
              `text-slate-300 no-underline p-2 rounded ${isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`
            }
          >
            Leases
          </NavLink>
        </nav>
        <main className="flex-1 p-8 bg-slate-100">
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