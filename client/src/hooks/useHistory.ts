import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '../services/product.api';
import type { HistoryData } from '../types';

export function useHistory(asin: string | undefined) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!asin) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getHistory(asin);
      setData(result.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Failed to load history'
      );
    } finally {
      setLoading(false);
    }
  }, [asin]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}
