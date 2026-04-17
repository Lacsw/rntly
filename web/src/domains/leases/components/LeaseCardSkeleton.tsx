import { Skeleton } from '@/shared/components';

export const LeaseCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-100 p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
    <Skeleton className="h-3 w-3/5 mt-3" />
    <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);
