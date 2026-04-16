import type { TLease } from '../api';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const isActiveLease = (lease: TLease, now: Date = new Date()): boolean => {
  if (lease.status !== 'active') return false;
  const nowMs = now.getTime();
  const start = new Date(lease.start_date).getTime();
  const end = new Date(lease.end_date).getTime();
  return start <= nowMs && nowMs <= end;
};

export const daysRemaining = (lease: TLease, now: Date = new Date()): number => {
  const end = new Date(lease.end_date).getTime();
  return Math.round((end - now.getTime()) / MS_PER_DAY);
};

export const isEndingSoon = (
  lease: TLease,
  withinDays = 30,
  now: Date = new Date(),
): boolean => {
  const remaining = daysRemaining(lease, now);
  return remaining >= 0 && remaining <= withinDays;
};

export type TLeaseDisplayStatus = 'active' | 'ending-soon' | 'ended' | 'upcoming';

export const leaseDisplayStatus = (lease: TLease, now: Date = new Date()): TLeaseDisplayStatus => {
  if (lease.status === 'ended') return 'ended';
  const nowMs = now.getTime();
  const start = new Date(lease.start_date).getTime();
  const end = new Date(lease.end_date).getTime();
  if (nowMs < start) return 'upcoming';
  if (nowMs > end) return 'ended';
  if (isEndingSoon(lease, 30, now)) return 'ending-soon';
  return 'active';
};
