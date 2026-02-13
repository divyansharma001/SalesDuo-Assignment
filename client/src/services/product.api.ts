import api from './api';
import type { ApiResponse, OptimizationResult, HistoryData, RecentItem } from '../types';

export const optimizeProduct = (asin: string, marketplace: string = 'amazon.in') =>
  api.post('/products/optimize', { asin, marketplace }) as Promise<ApiResponse<OptimizationResult>>;

export const getHistory = (asin: string, params: Record<string, string | number> = {}) =>
  api.get(`/optimizations/history/${asin}`, { params }) as Promise<ApiResponse<HistoryData>>;

export const getOptimizationById = (id: number) =>
  api.get(`/optimizations/${id}`);

export const getRecentOptimizations = () =>
  api.get('/optimizations/recent') as Promise<ApiResponse<RecentItem[]>>;
