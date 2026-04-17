import { Skeleton } from '@/shared/components';

export const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100">
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);
