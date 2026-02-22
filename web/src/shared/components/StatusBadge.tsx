import { cn } from '../lib/cn';

type StatusBadgeProps = {
  status: string;
  variant?: 'green' | 'yellow';
};

const variantClasses = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export const StatusBadge = ({ status, variant = 'yellow' }: StatusBadgeProps) => {
  return (
    <span className={cn('px-2 py-1 rounded text-xs', variantClasses[variant])}>
      {status}
    </span>
  );
};
