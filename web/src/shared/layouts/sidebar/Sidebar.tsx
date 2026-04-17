import { Building2, LogOut } from 'lucide-react';
import { NavSection } from './NavSection';
import { managementLinks, systemLinks } from './nav-links';

const Sidebar = () => {
  return (
    <aside className="w-60 bg-stone-50 border-r border-stone-200 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-9 h-9 rounded-full bg-orange-700 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-stone-900">rntly</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-6">
        <NavSection label="MANAGEMENT" links={managementLinks} />
        <NavSection label="SYSTEM" links={systemLinks} />
      </nav>

      {/* User profile */}
      <div className="px-5 py-4 border-t border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-800">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-stone-900">Roman</span>
            <span className="text-xs text-stone-500">roman@rntly.app</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Log out"
          className="text-stone-400 hover:text-stone-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
