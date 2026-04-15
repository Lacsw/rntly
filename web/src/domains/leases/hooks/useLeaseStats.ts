import { useMemo } from 'react';
import type { TLease } from '../api';
import { isActiveLease, isEndingSoon, leaseDisplayStatus } from '../utils/lease';

type TLeaseStats = {
  activeLeases: number;
  endingSoon: number;
  totalMonthlyRent: number;
  ended: number;
};

export const useLeaseStats = (leases: TLease[], now: Date = new Date()): TLeaseStats => {
  return useMemo(() => {
    let activeLeases = 0;
    let endingSoon = 0;
    let totalMonthlyRent = 0;
    let ended = 0;

    for (const lease of leases) {
      if (isActiveLease(lease, now)) {
        activeLeases += 1;
        totalMonthlyRent += lease.rent_amount;
        if (isEndingSoon(lease, 30, now)) endingSoon += 1;
      }
      if (leaseDisplayStatus(lease, now) === 'ended') ended += 1;
    }

    return { activeLeases, endingSoon, totalMonthlyRent, ended };
  }, [leases, now]);
};
