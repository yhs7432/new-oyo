import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '@/types/product';
import { fetchCatalogue } from '@/services/catalogue';

interface Options {
  enabled?: boolean;
  /** 시트를 다시 읽는 주기(ms). 0 이면 자동 새로고침을 끕니다. */
  intervalMs?: number;
}

const DEFAULT_INTERVAL = 90 * 1000;

export function useCatalogue({ enabled = true, intervalMs = DEFAULT_INTERVAL }: Options = {}) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /** silent=true 이면 화면을 비우지 않고 조용히 최신 시트로 바꿔 끼웁니다. */
  const load = useCallback(
    async (force = false, silent = false) => {
      if (!enabled) return;
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setError(null);
      }
      try {
        const list = await fetchCatalogue(force);
        if (!alive.current) return;
        setItems(list);
        setLastSyncedAt(Date.now());
        setError(null);
      } catch (err) {
        if (!alive.current) return;
        // 조용한 갱신이 실패하면 이미 보이는 목록은 그대로 두고 오류만 남깁니다.
        setError(err instanceof Error ? err.message : 'Unable to load products');
      } finally {
        if (alive.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (enabled) {
      void load();
    } else {
      setLoading(false);
    }
  }, [enabled, load]);

  // 시트를 고치면 화면을 새로 열지 않아도 정해진 주기마다 자동으로 다시 읽습니다.
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return undefined;

    const sync = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void load(true, true);
    };

    const timer = window.setInterval(sync, intervalMs);

    const onFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void load(true, true);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocus();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs, load]);

  const reload = useCallback(() => {
    void load(true);
  }, [load]);

  return { items, loading, refreshing, lastSyncedAt, error, reload };
}