export const ASIN_REGEX = /^[A-Z0-9]{10}$/;

export const AMAZON_DOMAINS: Record<string, string> = {
  'amazon.com': 'https://www.amazon.com',
  'amazon.in': 'https://www.amazon.in',
  'amazon.co.uk': 'https://www.amazon.co.uk',
  'amazon.de': 'https://www.amazon.de',
  'amazon.ca': 'https://www.amazon.ca',
};

export const DEFAULT_MARKETPLACE = 'amazon.in';

export const SCRAPER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};


export const PRODUCT_CACHE_TTL = 24 * 60 * 60 * 1000;