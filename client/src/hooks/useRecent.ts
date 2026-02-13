import { useState, useEffect } from 'react';
import { getRecentOptimizations } from '../services/product.api';
import type { RecentItem } from '../types';

export function useRecent() {
  const [data, setData] = useState<RecentItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentOptimizations()
      .then((result) => setData(result.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const removeByAsin = (asin: string) => {
    setData((prev) => prev ? prev.filter((item) => item.asin !== asin) : prev);
  };

  return { data, loading, removeByAsin };
}
