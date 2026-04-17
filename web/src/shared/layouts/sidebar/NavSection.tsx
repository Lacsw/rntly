import { useId } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import type { TNavSectionProps } from './types';

export const NavSection = ({ label, links }: TNavSectionProps) => {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-1">
      <span
        id={labelId}
        className="text-xs font-semibold text-stone-400 tracking-wider px-3 mb-1"
      >
        {label}
      </span>
      {links.map(({ to, label: linkLabel, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-orange-50 text-orange-800 border-l-2 border-orange-700'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
            )
          }
        >
          <Icon className="w-5 h-5" aria-hidden />
          {linkLabel}
        </NavLink>
      ))}
    </div>
  );
};
