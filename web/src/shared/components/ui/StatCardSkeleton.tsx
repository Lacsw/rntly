import { Skeleton } from './Skeleton';

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-center justify-between">
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-20" />
    </div>
    <Skeleton className="h-5 w-5 rounded-full" />
  </div>
);
