import { Loader2 } from 'lucide-react';

type TLoadingProps = {
  label?: string;
};

export const Loading = ({ label = 'Loading...' }: TLoadingProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 text-stone-500 py-8"
    >
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
};
