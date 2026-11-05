import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import { fetchCatalogue } from '@/services/catalogue';

interface Options {
  enabled?: boolean;
}

export function useCatalogue({ enabled = true }: Options = {}) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        const list = await fetchCatalogue(force);
        setItems(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load products');
      } finally {
        setLoading(false);
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

  const reload = useCallback(() => {
    void load(true);
  }, [load]);

  return { items, loading, error, reload };
}