export interface OriginalListing {
  title: string;
  bulletPoints: string[];
  description: string;
  price?: string;
  imageUrl?: string;
}

export interface OptimizedListing {
  title: string;
  bulletPoints: string[];
  description: string;
  keywords: string[];
}

export interface OptimizationResult {
  id: number;
  asin: string;
  original: OriginalListing;
  optimized: OptimizedListing;
  modelUsed: string;
  createdAt: string;
}

export interface OptimizationRecord {
  id: number;
  asin: string;
  optimizedTitle: string;
  optimized_title?: string;
  optimizedBullets: string[] | string;
  optimized_bullets?: string[] | string;
  optimizedDescription: string;
  optimized_description?: string;
  keywords: string[] | string;
  modelUsed: string;
  model_used?: string;
  createdAt: string;
  created_at?: string;
}

export interface HistoryData {
  asin: string;
  optimizations: OptimizationRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface RecentItem {
  id: number;
  asin: string;
  optimizedTitle: string;
  modelUsed: string;
  createdAt: string;
  originalTitle: string;
  originalImageUrl: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
