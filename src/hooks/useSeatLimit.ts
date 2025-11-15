import { useEffect, useState } from 'react';
import { useSubscription } from './useSubscription';

type TierKey = 'employer_starter' | 'employer_growth' | 'employer_scale' | 'recruiter_pro';

const SEAT_LIMITS: Record<TierKey, number> = {
  'employer_starter': 1,
  'employer_growth': 5,
  'employer_scale': 10,
  'recruiter_pro': 3,
};

export const useSeatLimit = () => {
  const { tier, loading } = useSubscription();
  const [currentSeats, setCurrentSeats] = useState(1);
  const [maxSeats, setMaxSeats] = useState(1);

  useEffect(() => {
    if (!loading && tier) {
      const limit = SEAT_LIMITS[tier as TierKey] || 1;
      setMaxSeats(limit);
      // TODO: Fetch actual team member count from database
      setCurrentSeats(1);
    }
  }, [tier, loading]);

  const canAddSeat = currentSeats < maxSeats;
  const isAtLimit = currentSeats >= maxSeats;

  return {
    currentSeats,
    maxSeats,
    canAddSeat,
    isAtLimit,
    loading,
    tier,
  };
};