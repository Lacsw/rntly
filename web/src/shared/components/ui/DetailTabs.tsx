import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type TDetailTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TDetailTabsProps = {
  tabs: TDetailTab[];
  activeId: string;
  onChange: (id: string) => void;
};

export const DetailTabs = ({ tabs, activeId, onChange }: TDetailTabsProps) => {
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex gap-4 border-b border-stone-200 mb-6">
        {tabs.map((tab) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'pb-3 -mb-px border-b-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{active?.content}</div>
    </div>
  );
};
