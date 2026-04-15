import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type TStatCardDelta = {
  value: string;
  positive: boolean;
};

type TStatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  delta?: TStatCardDelta;
};

export const StatCard = ({ label, value, icon, delta }: TStatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
        {delta && (
          <p
            className={cn(
              'text-xs mt-1',
              delta.positive ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {delta.value}
          </p>
        )}
      </div>
      <div className="text-stone-400">{icon}</div>
    </div>
  );
};
