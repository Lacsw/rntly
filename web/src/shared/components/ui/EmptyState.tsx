import type { ReactNode } from 'react';

type TEmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, icon, action }: TEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-stone-400 mb-3">{icon}</div>}
      <h3 className="text-lg font-medium text-stone-700">{title}</h3>
      {description && <p className="text-sm text-stone-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
