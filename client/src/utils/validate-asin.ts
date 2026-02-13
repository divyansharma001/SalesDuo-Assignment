export function validateAsin(asin: string): string | null {
  if (!asin || asin.trim().length === 0) {
    return 'ASIN is required';
  }
  const cleaned = asin.trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(cleaned)) {
    return 'ASIN must be exactly 10 alphanumeric characters';
  }
  return null;
}
