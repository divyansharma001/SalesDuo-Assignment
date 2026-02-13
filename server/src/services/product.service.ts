import { scrapeAmazonProduct } from './amazonScraper.service';
import { optimizeWithGemini } from './gemini.service';
import { ProductModel } from '../models/product.model';
import { OptimizationModel } from '../models/optimization.model';
import { PRODUCT_CACHE_TTL } from '../utils/constants';

export async function optimizeByAsin(asin: string, marketplace: string = 'amazon.in') {
  // Step 1: Check for a recently scraped product (within cache TTL)
  const cached = await ProductModel.findLatestValidByAsin(asin, PRODUCT_CACHE_TTL);

  let productId: number;
  let title: string;
  let bulletPoints: string[];
  let description: string;
  let price: string | undefined;
  let imageUrl: string | undefined;

  if (cached) {
    productId = cached.id;
    title = cached.title;
    bulletPoints = cached.bulletPoints;
    description = cached.description ?? '';
    price = cached.price ?? undefined;
    imageUrl = cached.imageUrl ?? undefined;
  } else {
    // Step 2: Scrape fresh data from Amazon
    const scraped = await scrapeAmazonProduct(asin, marketplace);

    // Step 3: Persist the scraped product
    productId = await ProductModel.create({
      asin,
      title: scraped.title,
      bullet_points: scraped.bullet_points,
      description: scraped.description,
      price: scraped.price || undefined,
      image_url: scraped.image_url || undefined,
    });

    title = scraped.title;
    bulletPoints = scraped.bullet_points;
    description = scraped.description;
    price = scraped.price || undefined;
    imageUrl = scraped.image_url || undefined;
  }

  // Step 4: Call Gemini for optimization
  const optimized = await optimizeWithGemini({
    asin,
    title,
    bulletPoints,
    description,
  });

  // Step 5: Persist the optimization
  const optimizationId = await OptimizationModel.create({
    productId,
    asin,
    optimizedTitle: optimized.optimizedTitle,
    optimizedBullets: optimized.optimizedBullets,
    optimizedDescription: optimized.optimizedDescription,
    keywords: optimized.keywords,
    modelUsed: optimized.modelUsed,
    promptTokens: optimized.promptTokens,
    completionTokens: optimized.completionTokens,
  });

  // Step 6: Return combined result for side-by-side display
  return {
    id: optimizationId,
    asin,
    original: {
      title,
      bulletPoints,
      description,
      price,
      imageUrl,
    },
    optimized: {
      title: optimized.optimizedTitle,
      bulletPoints: optimized.optimizedBullets,
      description: optimized.optimizedDescription,
      keywords: optimized.keywords,
    },
    modelUsed: optimized.modelUsed,
    createdAt: new Date().toISOString(),
  };
}
