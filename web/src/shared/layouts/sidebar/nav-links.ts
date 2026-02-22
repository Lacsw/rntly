import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  ArrowLeftRight,
  BarChart3,
  Settings,
} from 'lucide-react';
import type { TNavLink } from './types';

export const managementLinks: TNavLink[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Home },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
];

export const systemLinks: TNavLink[] = [
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];
