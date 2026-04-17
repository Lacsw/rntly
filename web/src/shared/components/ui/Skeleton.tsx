import { cn } from '../../lib/cn';

type TSkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className }: TSkeletonProps) => (
  <div
    aria-hidden
    className={cn('animate-pulse bg-stone-200 rounded', className)}
  />
);
