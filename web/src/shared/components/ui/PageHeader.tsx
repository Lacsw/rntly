import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type TPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
};

export const PageHeader = ({ title, subtitle, actions, backHref }: TPageHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-2">
        {backHref && (
          <Link
            to={backHref}
            aria-label="Back"
            className="text-stone-500 hover:text-stone-800 mt-1"
          >
            <ChevronLeft size={20} aria-hidden />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
          {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};
