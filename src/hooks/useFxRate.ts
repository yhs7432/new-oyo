import { useCallback, useState } from 'react';
import { ADMIN_FX_KEY } from '@/config/admin';

const DEFAULT_RATE = 39.7;

function read(): number {
  if (typeof window === 'undefined') return DEFAULT_RATE;
  const stored = Number(window.localStorage.getItem(ADMIN_FX_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_RATE;
}

/** Manual THB → KRW rate, remembered per browser. */
export function useFxRate() {
  const [rate, setRateState] = useState<number>(read);

  const setRate = useCallback((next: number) => {
    if (!Number.isFinite(next) || next <= 0) return;
    setRateState(next);
    window.localStorage.setItem(ADMIN_FX_KEY, String(next));
  }, []);

  return { rate, setRate };
}