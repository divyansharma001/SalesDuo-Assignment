import { useState } from 'react';
import { optimizeProduct } from '../services/product.api';
import type { OptimizationResult } from '../types';

export function useOptimize() {
  const [data, setData] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = async (asin: string, marketplace: string = 'amazon.in') => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await optimizeProduct(asin, marketplace);
      setData(result.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, loading, error, optimize, reset };
}
