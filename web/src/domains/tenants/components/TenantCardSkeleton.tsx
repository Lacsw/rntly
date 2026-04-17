import { Skeleton } from '@/shared/components';

export const TenantCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-100 p-5">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-3/5" />
    </div>
    <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);
