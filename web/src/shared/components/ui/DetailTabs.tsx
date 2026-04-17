import type { KeyboardEvent, ReactNode } from 'react';
import { useRef } from 'react';
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

const tabButtonId = (id: string) => `tab-${id}`;
const tabPanelId = (id: string) => `tabpanel-${id}`;

export const DetailTabs = ({ tabs, activeId, onChange }: TDetailTabsProps) => {
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const focusTab = (id: string) => {
    tabRefs.current.get(id)?.focus();
    onChange(id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (tabs.length === 0) return;
    let nextIndex: number | null = null;
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    focusTab(tabs[nextIndex].id);
  };

  return (
    <div>
      <div role="tablist" className="flex gap-4 border-b border-stone-200 mb-6">
        {tabs.map((tab, index) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              id={tabButtonId(tab.id)}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={tabPanelId(tab.id)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
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
      {active && (
        <div
          role="tabpanel"
          id={tabPanelId(active.id)}
          aria-labelledby={tabButtonId(active.id)}
        >
          {active.content}
        </div>
      )}
    </div>
  );
};
