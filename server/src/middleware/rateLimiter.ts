import {
  createMemoryStore,
  createSlidingWindow,
  limitra,
} from 'limitra';

const store = createMemoryStore();

export const apiLimiter = limitra({
  limiter: createSlidingWindow(store, { points: 60, duration: 60 }),
  message: { success: false, error: { message: 'Too many requests. Please try again later.' } },
  statusCode: 429,
});

export const optimizeLimiter = limitra({
  limiter: createSlidingWindow(store, { points: 10, duration: 60 }),
  message: { success: false, error: { message: 'Optimization rate limit reached. Please wait before trying again.' } },
  statusCode: 429,
});
