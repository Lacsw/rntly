import { NavLink } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  FileText,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const managementLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Home },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
];

const systemLinks = [
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">rntly</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-6">
        <NavSection label="MANAGEMENT" links={managementLinks} />
        <NavSection label="SYSTEM" links={systemLinks} />
      </nav>

      {/* User profile */}
      <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-medium text-amber-700">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Roman</span>
            <span className="text-xs text-gray-500">roman@rntly.app</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

const NavSection = ({
  label,
  links,
}: {
  label: string;
  links: typeof managementLinks;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-gray-400 tracking-wider px-3 mb-1">
      {label}
    </span>
    {links.map(({ to, label: linkLabel, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-amber-50 text-amber-700 border-l-2 border-amber-500'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`
        }
      >
        <Icon className="w-5 h-5" />
        {linkLabel}
      </NavLink>
    ))}
  </div>
);

export default Sidebar;
